import time
from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel

from app.database import get_db, get_pool

router = APIRouter(prefix="/api/news", tags=["news"])


class CommentRequest(BaseModel):
    content: str


class ReactionRequest(BaseModel):
    emoji: str


async def _ensure_news_tables():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS news_comments (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    article_id INT NOT NULL,
                    user_id INT NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    look VARCHAR(500) DEFAULT '',
                    content TEXT NOT NULL,
                    created_at INT DEFAULT 0,
                    INDEX idx_article (article_id)
                )
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS news_reactions (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    article_id INT NOT NULL,
                    user_id INT NOT NULL,
                    emoji VARCHAR(10) NOT NULL,
                    created_at INT DEFAULT 0,
                    UNIQUE KEY uc_article_user_emoji (article_id, user_id, emoji),
                    INDEX idx_article (article_id)
                )
            """)
        await conn.commit()


@router.get("/")
async def get_news(page: int = 1, category: str = "all", db=Depends(get_db)):
    await _ensure_news_tables()
    conn, cur = db
    limit = 10
    offset = (page - 1) * limit

    if category == "all":
        await cur.execute(
            "SELECT n.id, n.title, n.content, n.image_url, n.author, n.category, n.created_at, COALESCE(u.look, '') as author_look FROM news n LEFT JOIN users u ON u.username = n.author ORDER BY n.created_at DESC LIMIT %s OFFSET %s",
            (limit, offset)
        )
    else:
        await cur.execute(
            "SELECT n.id, n.title, n.content, n.image_url, n.author, n.category, n.created_at, COALESCE(u.look, '') as author_look FROM news n LEFT JOIN users u ON u.username = n.author WHERE n.category = %s ORDER BY n.created_at DESC LIMIT %s OFFSET %s",
            (category, limit, offset)
        )

    rows = await cur.fetchall()
    articles = []
    for row in rows:
        articles.append({
            "id": row["id"],
            "title": row["title"],
            "content": row["content"],
            "image_url": row["image_url"],
            "author": row["author"],
            "category": row["category"],
            "created_at": row["created_at"],
            "author_look": row["author_look"],
        })

    # Get reaction counts and comment counts for each article
    pool = await get_pool()
    async with pool.acquire() as conn2:
        async with conn2.cursor() as cur2:
            for article in articles:
                aid = article["id"]
                await cur2.execute(
                    "SELECT emoji, COUNT(*) as cnt FROM news_reactions WHERE article_id=%s GROUP BY emoji",
                    (aid,)
                )
                reaction_rows = await cur2.fetchall()
                article["reactions"] = {r[0]: r[1] for r in reaction_rows}
                await cur2.execute(
                    "SELECT COUNT(*) FROM news_comments WHERE article_id=%s",
                    (aid,)
                )
                article["comment_count"] = (await cur2.fetchone())[0]

    return {"articles": articles}


@router.get("/latest")
async def get_latest_news(db=Depends(get_db)):
    conn, cur = db
    await cur.execute(
        "SELECT n.id, n.title, n.content, n.image_url, n.author, n.category, n.created_at, COALESCE(u.look, '') as author_look FROM news n LEFT JOIN users u ON u.username = n.author ORDER BY n.created_at DESC LIMIT 5"
    )
    rows = await cur.fetchall()
    articles = []
    for row in rows:
        articles.append({
            "id": row["id"],
            "title": row["title"],
            "content": row["content"],
            "image_url": row["image_url"],
            "author": row["author"],
            "category": row["category"],
            "created_at": row["created_at"],
            "author_look": row["author_look"],
        })

    return {"articles": articles}


@router.get("/{article_id}/comments")
async def get_comments(article_id: int):
    await _ensure_news_tables()
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id, article_id, user_id, username, look, content, created_at FROM news_comments WHERE article_id=%s ORDER BY created_at DESC LIMIT 50",
                (article_id,)
            )
            rows = await cur.fetchall()
            comments = []
            for r in rows:
                comments.append({
                    "id": r[0], "article_id": r[1], "user_id": r[2],
                    "username": r[3], "look": r[4], "content": r[5], "created_at": r[6],
                })
    return {"comments": comments}


@router.post("/{article_id}/comments")
async def post_comment(article_id: int, req: CommentRequest, request: Request):
    await _ensure_news_tables()
    token = request.cookies.get("token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(401, "Login required")
    from app.auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    user_id = payload["user_id"]

    if not req.content.strip():
        raise HTTPException(400, "Comment cannot be empty")

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT username, look FROM users WHERE id=%s", (user_id,))
            user_row = await cur.fetchone()
            if not user_row:
                raise HTTPException(404, "User not found")
            username = user_row[0]
            look = user_row[1] or ""
            now = int(time.time())
            await cur.execute(
                "INSERT INTO news_comments (article_id, user_id, username, look, content, created_at) VALUES (%s,%s,%s,%s,%s,%s)",
                (article_id, user_id, username, look, req.content.strip()[:500], now)
            )
        await conn.commit()
    return {"ok": True, "comment": {"id": 0, "article_id": article_id, "user_id": user_id, "username": username, "look": look, "content": req.content.strip()[:500], "created_at": now}}


@router.get("/{article_id}/reactions")
async def get_reactions(article_id: int, request: Request):
    await _ensure_news_tables()
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT emoji, COUNT(*) as cnt FROM news_reactions WHERE article_id=%s GROUP BY emoji",
                (article_id,)
            )
            rows = await cur.fetchall()
            reactions = {r[0]: r[1] for r in rows}

            user_reactions: list[str] = []
            token = request.cookies.get("token")
            if not token:
                auth_header = request.headers.get("Authorization", "")
                if auth_header.startswith("Bearer "):
                    token = auth_header[7:]
            if token:
                from app.auth import decode_token
                payload = decode_token(token)
                if payload:
                    await cur.execute(
                        "SELECT emoji FROM news_reactions WHERE article_id=%s AND user_id=%s",
                        (article_id, payload["user_id"])
                    )
                    user_reactions = [r[0] for r in await cur.fetchall()]

    return {"reactions": reactions, "user_reactions": user_reactions}


@router.post("/{article_id}/reactions")
async def toggle_reaction(article_id: int, req: ReactionRequest, request: Request):
    await _ensure_news_tables()
    token = request.cookies.get("token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(401, "Login required")
    from app.auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    user_id = payload["user_id"]

    allowed_emojis = ["\U0001f604", "\u2764\ufe0f", "\U0001f525", "\U0001f44d", "\U0001f62e", "\U0001f451"]
    if req.emoji not in allowed_emojis:
        raise HTTPException(400, "Invalid emoji")

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id FROM news_reactions WHERE article_id=%s AND user_id=%s AND emoji=%s",
                (article_id, user_id, req.emoji)
            )
            existing = await cur.fetchone()
            if existing:
                await cur.execute("DELETE FROM news_reactions WHERE id=%s", (existing[0],))
                action = "removed"
            else:
                now = int(time.time())
                await cur.execute(
                    "INSERT INTO news_reactions (article_id, user_id, emoji, created_at) VALUES (%s,%s,%s,%s)",
                    (article_id, user_id, req.emoji, now)
                )
                action = "added"
        await conn.commit()
    return {"ok": True, "action": action}
