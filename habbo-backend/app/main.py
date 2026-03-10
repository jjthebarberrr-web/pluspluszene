import os
import asyncio
from pathlib import Path

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, Response
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import websockets
import httpx

from app.database import init_db
from app.routes.auth_routes import router as auth_router
from app.routes.community_routes import router as community_router
from app.routes.news_routes import router as news_router
from app.routes.users_routes import router as users_router

STATIC_DIR = Path(__file__).parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth_router)
app.include_router(community_router)
app.include_router(news_router)
app.include_router(users_router)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


# Asset proxy to bypass CORS from external asset CDNs
ASSET_CDN_URL = os.getenv("ASSET_CDN_URL", "https://assets.nitrodev.co")
# Multiple CDN sources for c_images (tried in order)
C_IMAGES_CDNS = [
    "https://images.bobba.io",
    "https://images.habbo.com",
]
LOCAL_C_IMAGES_DIR = STATIC_DIR / "c_images"
_http_client = None

def get_http_client():
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(timeout=10.0, follow_redirects=True)
    return _http_client

@app.get("/habbo-assets/{asset_path:path}")
async def proxy_assets(asset_path: str):
    # Serve local c_images files first (downloaded asset pack)
    if asset_path.startswith("c_images/"):
        local_file = LOCAL_C_IMAGES_DIR / asset_path[len("c_images/"):]
        if local_file.is_file():
            return FileResponse(
                str(local_file),
                headers={"Cache-Control": "public, max-age=86400"},
            )
        # Try multiple CDNs as fallback
        client = get_http_client()
        for cdn_base in C_IMAGES_CDNS:
            try:
                resp = await client.get(f"{cdn_base}/{asset_path}")
                if resp.status_code == 200:
                    content_type = resp.headers.get("content-type", "application/octet-stream")
                    return Response(
                        content=resp.content,
                        status_code=200,
                        media_type=content_type,
                        headers={"Cache-Control": "public, max-age=86400"},
                    )
            except Exception:
                continue
        return Response(content=b"Asset not found", status_code=404)
    # Non-c_images assets go to nitrodev CDN
    client = get_http_client()
    upstream_url = f"{ASSET_CDN_URL}/{asset_path}"
    try:
        resp = await client.get(upstream_url)
        content_type = resp.headers.get("content-type", "application/octet-stream")
        return Response(
            content=resp.content,
            status_code=resp.status_code,
            media_type=content_type,
            headers={"Cache-Control": "public, max-age=86400"},
        )
    except Exception:
        return Response(content=b"Asset not found", status_code=502)


# WebSocket proxy to Arcturus game server
ARCTURUS_WS_URL = os.getenv("ARCTURUS_WS_URL", "ws://127.0.0.1:2096")

@app.websocket("/ws")
async def websocket_proxy(ws: WebSocket):
    await ws.accept()
    try:
        async with websockets.connect(ARCTURUS_WS_URL) as arcturus_ws:
            async def forward_to_arcturus():
                try:
                    while True:
                        msg = await ws.receive()
                        if msg.get("type") == "websocket.receive":
                            if "bytes" in msg and msg["bytes"]:
                                await arcturus_ws.send(msg["bytes"])
                            elif "text" in msg and msg["text"]:
                                await arcturus_ws.send(msg["text"])
                        elif msg.get("type") == "websocket.disconnect":
                            break
                except WebSocketDisconnect:
                    pass
                except Exception:
                    pass

            async def forward_to_client():
                try:
                    async for message in arcturus_ws:
                        if isinstance(message, bytes):
                            await ws.send_bytes(message)
                        else:
                            await ws.send_text(message)
                except Exception:
                    pass

            task1 = asyncio.create_task(forward_to_arcturus())
            task2 = asyncio.create_task(forward_to_client())
            done, pending = await asyncio.wait(
                [task1, task2], return_when=asyncio.FIRST_COMPLETED
            )
            for task in pending:
                task.cancel()
    except Exception:
        pass
    finally:
        try:
            await ws.close()
        except Exception:
            pass


# Serve Nitro client static files from /nitro/ path
NITRO_DIR = STATIC_DIR / "nitro"
if NITRO_DIR.is_dir():
    app.mount("/nitro/assets", StaticFiles(directory=str(NITRO_DIR / "assets")), name="nitro-assets")
    app.mount("/nitro/src", StaticFiles(directory=str(NITRO_DIR / "src")), name="nitro-src")

# Serve frontend static files - must be after API routes
if STATIC_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(STATIC_DIR / "assets")), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # Serve Nitro client files
        if full_path.startswith("nitro/") or full_path == "nitro":
            nitro_path = full_path[len("nitro/"):] if full_path.startswith("nitro/") else ""
            nitro_file = NITRO_DIR / nitro_path
            if nitro_path and nitro_file.is_file():
                return FileResponse(str(nitro_file))
            # Serve nitro index.html for nitro SPA
            return FileResponse(str(NITRO_DIR / "index.html"))
        # Serve actual files if they exist
        file_path = STATIC_DIR / full_path
        if full_path and file_path.is_file():
            return FileResponse(str(file_path))
        # Otherwise serve index.html for SPA routing
        return FileResponse(str(STATIC_DIR / "index.html"))
