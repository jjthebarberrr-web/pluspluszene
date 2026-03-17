import os
import asyncio
import base64
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
from app.routes.staff_routes import router as staff_router
from app.routes.leaderboard_routes import router as leaderboard_router
from app.routes.home_routes import router as home_router
from app.routes.photos_routes import router as photos_router
from app.routes.vip_routes import router as vip_router
from app.routes.housekeeping_routes import router as housekeeping_router
from app.routes.radio_routes import router as radio_router
from app.routes.room_routes import router as room_router
from app.routes.notification_routes import router as notification_router
from app.routes.rare_items_routes import router as rare_items_router
from app.routes.battlepass_routes import router as battlepass_router

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
app.include_router(staff_router)
app.include_router(leaderboard_router)
app.include_router(home_router)
app.include_router(photos_router)
app.include_router(vip_router)
app.include_router(housekeeping_router)
app.include_router(radio_router)
app.include_router(room_router)
app.include_router(notification_router)
app.include_router(rare_items_router)
app.include_router(battlepass_router)


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
# Additional CDN sources for non-c_images assets (dcr/hof_furni, etc.)
GENERAL_CDNS = [
    "https://assets.nitrodev.co",
    "https://images.bobba.io",
    "https://images.habbo.com",
]
LOCAL_C_IMAGES_DIR = STATIC_DIR / "c_images"
LOCAL_ASSETS_DIR = STATIC_DIR / "habbo_assets_cache"
_http_client = None

# 1x1 transparent PNG placeholder for missing images (avoids broken icons in UI)
_TRANSPARENT_1PX_PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
)

def get_http_client():
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(timeout=15.0, follow_redirects=True)
    return _http_client

@app.get("/habbo-assets/{asset_path:path}")
async def proxy_assets(asset_path: str):
    # Serve local c_images files first (downloaded asset pack)
    if asset_path.startswith("c_images/"):
        sub_path = asset_path[len("c_images/"):]
        local_file = LOCAL_C_IMAGES_DIR / sub_path
        if local_file.is_file():
            return FileResponse(
                str(local_file),
                headers={"Cache-Control": "public, max-age=86400"},
            )
        # Try alternate extensions (.gif <-> .png) for local files
        alt_file = None
        if sub_path.endswith(".gif"):
            alt_file = LOCAL_C_IMAGES_DIR / sub_path.replace(".gif", ".png")
        elif sub_path.endswith(".png"):
            alt_file = LOCAL_C_IMAGES_DIR / sub_path.replace(".png", ".gif")
        if alt_file and alt_file.is_file():
            return FileResponse(
                str(alt_file),
                headers={"Cache-Control": "public, max-age=86400"},
            )
        # Try multiple CDNs as fallback and cache locally
        client = get_http_client()
        for cdn_base in C_IMAGES_CDNS:
            try:
                resp = await client.get(f"{cdn_base}/{asset_path}")
                if resp.status_code == 200:
                    content_type = resp.headers.get("content-type", "application/octet-stream")
                    # Cache downloaded file locally for future requests
                    try:
                        local_file.parent.mkdir(parents=True, exist_ok=True)
                        local_file.write_bytes(resp.content)
                    except Exception:
                        pass
                    return Response(
                        content=resp.content,
                        status_code=200,
                        media_type=content_type,
                        headers={"Cache-Control": "public, max-age=86400"},
                    )
            except Exception:
                continue
        # Return transparent placeholder for missing catalog images
        if sub_path.endswith((".png", ".gif")):
            return Response(
                content=_TRANSPARENT_1PX_PNG,
                status_code=200,
                media_type="image/png",
                headers={"Cache-Control": "public, max-age=3600"},
            )
        return Response(content=b"Asset not found", status_code=404)
    # Non-c_images assets: check local cache first, then try multiple CDNs
    cached_file = LOCAL_ASSETS_DIR / asset_path
    if cached_file.is_file():
        # Determine correct media type - .nitro files must be application/octet-stream
        _media = "application/octet-stream"
        if asset_path.endswith(".json"):
            _media = "application/json"
        elif asset_path.endswith(".png"):
            _media = "image/png"
        elif asset_path.endswith(".gif"):
            _media = "image/gif"
        elif asset_path.endswith(".jpg") or asset_path.endswith(".jpeg"):
            _media = "image/jpeg"
        elif asset_path.endswith(".mp3"):
            _media = "audio/mpeg"
        return FileResponse(
            str(cached_file),
            media_type=_media,
            headers={"Cache-Control": "public, max-age=86400"},
        )
    client = get_http_client()
    for cdn_base in GENERAL_CDNS:
        try:
            resp = await client.get(f"{cdn_base}/{asset_path}")
            if resp.status_code == 200:
                content_type = resp.headers.get("content-type", "application/octet-stream")
                # Don't cache HTML error pages
                if b"<!DOCTYPE" not in resp.content[:50] and b"<html>" not in resp.content[:50]:
                    try:
                        cached_file.parent.mkdir(parents=True, exist_ok=True)
                        cached_file.write_bytes(resp.content)
                    except Exception:
                        pass
                return Response(
                    content=resp.content,
                    status_code=200,
                    media_type=content_type,
                    headers={"Cache-Control": "public, max-age=86400"},
                )
        except Exception:
            continue
    # Return transparent placeholder for missing image assets
    if asset_path.endswith((".png", ".gif", ".jpg", ".jpeg")):
        return Response(
            content=_TRANSPARENT_1PX_PNG,
            status_code=200,
            media_type="image/png",
            headers={"Cache-Control": "public, max-age=3600"},
        )
    # Serve valid minimal .nitro for missing files (client hangs on 404)
    if asset_path.endswith(".nitro"):
        import struct, gzip, json as _json
        lib_name = asset_path.rsplit("/", 1)[-1].replace(".nitro", "")
        manifest = {"type": "generic", "name": lib_name, "assets": {}, "visualization": {}}
        compressed = gzip.compress(_json.dumps(manifest).encode())
        name_bytes = f"{lib_name}.json".encode()
        nitro = struct.pack(">H", 1) + struct.pack(">H", len(name_bytes)) + name_bytes + struct.pack(">I", len(compressed)) + compressed
        # Cache it so next request is fast
        try:
            cached_file.parent.mkdir(parents=True, exist_ok=True)
            cached_file.write_bytes(nitro)
        except Exception:
            pass
        return Response(
            content=nitro,
            status_code=200,
            media_type="application/octet-stream",
            headers={"Cache-Control": "public, max-age=86400"},
        )
    return Response(content=b"Asset not found", status_code=404)


# WebSocket proxy to Arcturus game server
ARCTURUS_WS_URL = os.getenv("ARCTURUS_WS_URL", "ws://127.0.0.1:2096")

@app.websocket("/ws")
async def websocket_proxy(ws: WebSocket):
    import logging as _logging
    import struct as _struct
    _wsl = _logging.getLogger("uvicorn.error")
    await ws.accept()
    try:
        async with websockets.connect(ARCTURUS_WS_URL) as arcturus_ws:
            _wsl.info("WS: Connected to Arcturus")

            async def forward_to_arcturus():
                try:
                    _c2a = 0
                    while True:
                        msg = await ws.receive()
                        if msg.get("type") == "websocket.receive":
                            if "bytes" in msg and msg["bytes"]:
                                _c2a += 1
                                _d = msg["bytes"]
                                if _c2a <= 20 and len(_d) >= 6:
                                    _plen = _struct.unpack(">I", _d[:4])[0]
                                    _pid = _struct.unpack(">H", _d[4:6])[0]
                                    _wsl.info("WS C->A #%d: header=%d len=%d", _c2a, _pid, _plen)
                                await arcturus_ws.send(_d)
                            elif "text" in msg and msg["text"]:
                                _c2a += 1
                                await arcturus_ws.send(msg["text"])
                        elif msg.get("type") == "websocket.disconnect":
                            _wsl.info("WS: Client disconnected after %d msgs", _c2a)
                            break
                except WebSocketDisconnect:
                    pass
                except Exception as e:
                    _wsl.error("WS C->A error: %s", e)

            async def forward_to_client():
                try:
                    _a2c = 0
                    async for message in arcturus_ws:
                        _a2c += 1
                        if isinstance(message, bytes):
                            if _a2c <= 50 and len(message) >= 6:
                                _plen = _struct.unpack(">I", message[:4])[0]
                                _pid = _struct.unpack(">H", message[4:6])[0]
                                _wsl.info("WS A->C #%d: header=%d len=%d raw=%d", _a2c, _pid, _plen, len(message))
                            elif _a2c == 51:
                                _wsl.info("WS A->C: suppressing further logs (>50 msgs)")
                            await ws.send_bytes(message)
                        else:
                            await ws.send_text(message)
                except Exception as e:
                    _wsl.error("WS A->C error: %s", e)

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
