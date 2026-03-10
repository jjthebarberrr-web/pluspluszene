from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import time

from app.database import get_db
from app.auth import decode_token

router = APIRouter(prefix="/api/community", tags=["community"])


class CreatePostRequest(BaseModel):
    title: str
    content: str
    category: str = "general"


@router.get("/posts")
async def get_posts(category: str = "all", page: int = 1, db=Depends(get_db)):
    conn, cur = db
    limit = 20
    offset = (page - 1) * limit

    if category == "all":
        await cur.execute(
            "SELECT id, user_id, username, title, content, category, likes, created_at FROM community_posts ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (limit, offset)
        )
    else:
        await cur.execute(
            "SELECT id, user_id, username, title, content, category, likes, created_at FROM community_posts WHERE category = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (category, limit, offset)
        )

    rows = await cur.fetchall()
    posts = []
    for row in rows:
        posts.append({
            "id": row["id"],
            "user_id": row["user_id"],
            "username": row["username"],
            "title": row["title"],
            "content": row["content"],
            "category": row["category"],
            "likes": row["likes"],
            "created_at": row["created_at"],
        })

    # Get total count
    if category == "all":
        await cur.execute("SELECT COUNT(*) as cnt FROM community_posts")
    else:
        await cur.execute("SELECT COUNT(*) as cnt FROM community_posts WHERE category = %s", (category,))
    count_row = await cur.fetchone()
    total = count_row["cnt"]

    return {"posts": posts, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}


@router.post("/posts")
async def create_post(req: CreatePostRequest, request: Request, db=Depends(get_db)):
    conn, cur = db
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    if len(req.title) < 3:
        raise HTTPException(400, "Title must be at least 3 characters")
    if len(req.content) < 10:
        raise HTTPException(400, "Content must be at least 10 characters")

    now = int(time.time())
    await cur.execute(
        "INSERT INTO community_posts (user_id, username, title, content, category, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
        (payload["user_id"], payload["username"], req.title, req.content, req.category, now)
    )

    return {"message": "Post created", "post_id": cur.lastrowid}


@router.post("/posts/{post_id}/like")
async def like_post(post_id: int, request: Request, db=Depends(get_db)):
    conn, cur = db
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    await cur.execute("SELECT id FROM community_posts WHERE id = %s", (post_id,))
    if not await cur.fetchone():
        raise HTTPException(404, "Post not found")

    await cur.execute("UPDATE community_posts SET likes = likes + 1 WHERE id = %s", (post_id,))

    return {"message": "Post liked"}


@router.get("/stats")
async def get_stats(db=Depends(get_db)):
    conn, cur = db
    await cur.execute("SELECT COUNT(*) as cnt FROM users")
    total_users = (await cur.fetchone())["cnt"]

    await cur.execute("SELECT COUNT(*) as cnt FROM users WHERE online = '1'")
    online_users = (await cur.fetchone())["cnt"]

    await cur.execute("SELECT COUNT(*) as cnt FROM community_posts")
    total_posts = (await cur.fetchone())["cnt"]

    # Get recent users
    await cur.execute(
        "SELECT id, username, look, motto FROM users ORDER BY account_created DESC LIMIT 5"
    )
    recent_users = []
    for row in await cur.fetchall():
        recent_users.append({
            "id": row["id"],
            "username": row["username"],
            "look": row["look"],
            "motto": row["motto"],
        })

    return {
        "total_users": total_users,
        "online_users": online_users,
        "total_posts": total_posts,
        "recent_users": recent_users,
    }
