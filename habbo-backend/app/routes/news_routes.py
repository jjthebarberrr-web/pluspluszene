from fastapi import APIRouter, Depends

from app.database import get_db

router = APIRouter(prefix="/api/news", tags=["news"])


@router.get("/")
async def get_news(page: int = 1, category: str = "all", db=Depends(get_db)):
    conn, cur = db
    limit = 10
    offset = (page - 1) * limit

    if category == "all":
        await cur.execute(
            "SELECT id, title, content, image_url, author, category, created_at FROM news ORDER BY created_at DESC LIMIT %s OFFSET %s",
            (limit, offset)
        )
    else:
        await cur.execute(
            "SELECT id, title, content, image_url, author, category, created_at FROM news WHERE category = %s ORDER BY created_at DESC LIMIT %s OFFSET %s",
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
        })

    return {"articles": articles}


@router.get("/latest")
async def get_latest_news(db=Depends(get_db)):
    conn, cur = db
    await cur.execute(
        "SELECT id, title, content, image_url, author, category, created_at FROM news ORDER BY created_at DESC LIMIT 5"
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
        })

    return {"articles": articles}
