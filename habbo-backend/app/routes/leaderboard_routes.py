from fastapi import APIRouter
from app.database import get_pool

router = APIRouter(prefix="/api/leaderboards", tags=["leaderboards"])


@router.get("")
async def get_leaderboard(sort: str = "credits"):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if sort == "credits":
                await cur.execute(
                    "SELECT id, username, look, motto, credits, pixels, online, account_created FROM users ORDER BY credits DESC LIMIT 25"
                )
            elif sort == "pixels":
                await cur.execute(
                    "SELECT id, username, look, motto, credits, pixels, online, account_created FROM users ORDER BY pixels DESC LIMIT 25"
                )
            elif sort == "online":
                await cur.execute(
                    "SELECT id, username, look, motto, credits, pixels, online, account_created FROM users WHERE online = '1' ORDER BY username ASC LIMIT 25"
                )
            elif sort == "oldest":
                await cur.execute(
                    "SELECT id, username, look, motto, credits, pixels, online, account_created FROM users ORDER BY account_created ASC LIMIT 25"
                )
            else:
                await cur.execute(
                    "SELECT id, username, look, motto, credits, pixels, online, account_created FROM users ORDER BY credits DESC LIMIT 25"
                )

            rows = await cur.fetchall()
            users = []
            for row in rows:
                users.append({
                    "id": row[0],
                    "username": row[1],
                    "look": row[2],
                    "motto": row[3],
                    "credits": row[4],
                    "pixels": row[5],
                    "online": row[6],
                    "account_created": row[7],
                })
            return {"users": users}
