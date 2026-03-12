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


@router.get("/posts/{post_id}")
async def get_post(post_id: int, db=Depends(get_db)):
    conn, cur = db
    await cur.execute(
        "SELECT id, user_id, username, title, content, category, likes, created_at FROM community_posts WHERE id = %s",
        (post_id,)
    )
    row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "Post not found")

    # Get user look
    await cur.execute("SELECT look FROM users WHERE id = %s", (row["user_id"],))
    user_row = await cur.fetchone()

    # Get comments
    await cur.execute(
        "SELECT id, user_id, username, content, created_at FROM community_comments WHERE post_id = %s ORDER BY created_at ASC",
        (post_id,)
    )
    comments = []
    for c in await cur.fetchall():
        # Get commenter look
        await cur.execute("SELECT look FROM users WHERE id = %s", (c["user_id"],))
        c_user = await cur.fetchone()
        comments.append({
            "id": c["id"],
            "user_id": c["user_id"],
            "username": c["username"],
            "content": c["content"],
            "created_at": c["created_at"],
            "look": c_user["look"] if c_user else "",
        })

    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "username": row["username"],
        "title": row["title"],
        "content": row["content"],
        "category": row["category"],
        "likes": row["likes"],
        "created_at": row["created_at"],
        "look": user_row["look"] if user_row else "",
        "comments": comments,
    }


@router.post("/posts/{post_id}/comment")
async def add_comment(post_id: int, request: Request, db=Depends(get_db)):
    conn, cur = db
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    body = await request.json()
    content = body.get("content", "").strip()
    if len(content) < 2:
        raise HTTPException(400, "Comment must be at least 2 characters")
    if len(content) > 500:
        raise HTTPException(400, "Comment must be 500 characters or less")

    await cur.execute("SELECT id FROM community_posts WHERE id = %s", (post_id,))
    if not await cur.fetchone():
        raise HTTPException(404, "Post not found")

    now = int(time.time())
    await cur.execute(
        "INSERT INTO community_comments (post_id, user_id, username, content, created_at) VALUES (%s, %s, %s, %s, %s)",
        (post_id, payload["user_id"], payload["username"], content, now)
    )

    return {"message": "Comment added", "comment_id": cur.lastrowid}


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
