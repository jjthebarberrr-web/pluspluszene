import time
from fastapi import APIRouter, Request, HTTPException
from app.database import get_pool

router = APIRouter(prefix="/api/notifications", tags=["notifications"])


async def _ensure_notifications_table(pool):
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    type VARCHAR(50) NOT NULL DEFAULT 'system',
                    message TEXT NOT NULL,
                    link VARCHAR(500) DEFAULT NULL,
                    is_read TINYINT(1) DEFAULT 0,
                    created_at INT NOT NULL,
                    INDEX idx_user (user_id),
                    INDEX idx_user_read (user_id, is_read)
                )
            """)
        await conn.commit()


def _get_user_id(request: Request):
    token = request.cookies.get("token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        return None
    from app.auth import decode_token
    payload = decode_token(token)
    if not payload:
        return None
    return payload["user_id"]


@router.get("")
async def get_notifications(request: Request):
    user_id = _get_user_id(request)
    if not user_id:
        return {"notifications": [], "unread_count": 0}

    pool = await get_pool()
    await _ensure_notifications_table(pool)

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id, user_id, type, message, link, is_read, created_at FROM notifications WHERE user_id=%s ORDER BY created_at DESC LIMIT 50",
                (user_id,)
            )
            rows = await cur.fetchall()
            notifications = []
            for r in rows:
                notifications.append({
                    "id": r[0], "user_id": r[1], "type": r[2],
                    "message": r[3], "link": r[4], "read": bool(r[5]),
                    "created_at": r[6],
                })
            await cur.execute(
                "SELECT COUNT(*) FROM notifications WHERE user_id=%s AND is_read=0",
                (user_id,)
            )
            unread_count = (await cur.fetchone())[0]

    return {"notifications": notifications, "unread_count": unread_count}


@router.get("/read-all")
async def mark_all_read(request: Request):
    user_id = _get_user_id(request)
    if not user_id:
        raise HTTPException(401, "Login required")

    pool = await get_pool()
    await _ensure_notifications_table(pool)

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE notifications SET is_read=1 WHERE user_id=%s AND is_read=0",
                (user_id,)
            )
        await conn.commit()
    return {"ok": True}
