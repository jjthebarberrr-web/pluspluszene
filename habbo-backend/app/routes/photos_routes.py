from fastapi import APIRouter
from app.database import get_pool

router = APIRouter(prefix="/api/photos", tags=["photos"])


@router.get("")
async def get_photos():
    """Get all published camera photos with user info."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                SELECT c.id, c.user_id, u.username, c.room_id, c.timestamp, c.url
                FROM camera_web c
                JOIN users u ON u.id = c.user_id
                ORDER BY c.timestamp DESC
                LIMIT 100
            """)
            rows = await cur.fetchall()
            photos = []
            for row in rows:
                photos.append({
                    "id": row[0],
                    "user_id": row[1],
                    "username": row[2],
                    "room_id": row[3],
                    "timestamp": row[4],
                    "url": row[5],
                })
            return photos
