from fastapi import APIRouter
from app.database import get_pool

router = APIRouter(prefix="/api/home", tags=["home"])


@router.get("")
async def get_home_data():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Popular rooms (by users count, then by id desc)
            await cur.execute(
                "SELECT id, name, owner_name, users, users_max FROM rooms ORDER BY users DESC, id DESC LIMIT 5"
            )
            rooms_rows = await cur.fetchall()
            rooms = []
            for r in rooms_rows:
                rooms.append({
                    "id": r[0],
                    "name": r[1],
                    "owner": r[2],
                    "users": r[3],
                    "max_users": r[4],
                })

            # Online users
            await cur.execute(
                "SELECT id, username, look, motto FROM users WHERE online = '1' LIMIT 20"
            )
            online_rows = await cur.fetchall()
            online_users = []
            for u in online_rows:
                online_users.append({
                    "id": u[0],
                    "username": u[1],
                    "look": u[2],
                    "motto": u[3],
                })

            # Online count
            await cur.execute("SELECT COUNT(*) FROM users WHERE online = '1'")
            count_row = await cur.fetchone()
            online_count = count_row[0] if count_row else 0

            # User of the week (highest credits, not system account)
            await cur.execute(
                "SELECT id, username, look, motto FROM users WHERE username != 'Systemaccount' ORDER BY credits DESC LIMIT 1"
            )
            fotw_row = await cur.fetchone()
            user_of_week = None
            if fotw_row:
                user_of_week = {
                    "id": fotw_row[0],
                    "username": fotw_row[1],
                    "look": fotw_row[2],
                    "motto": fotw_row[3],
                }

            # Current user's currencies (returned separately via /api/auth/me)
            # Latest news
            await cur.execute(
                "SELECT id, title, category, created_at FROM news ORDER BY created_at DESC LIMIT 7"
            )
            news_rows = await cur.fetchall()
            news = []
            for n in news_rows:
                news.append({
                    "id": n[0],
                    "title": n[1],
                    "category": n[2],
                    "created_at": n[3],
                })

            return {
                "popular_rooms": rooms,
                "online_users": online_users,
                "online_count": online_count,
                "user_of_week": user_of_week,
                "latest_news": news,
            }
