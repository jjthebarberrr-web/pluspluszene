from fastapi import APIRouter
from app.database import get_pool

router = APIRouter(prefix="/api/leaderboards", tags=["leaderboards"])


async def _fetch_board(cur, query, params=None):
    if params:
        await cur.execute(query, params)
    else:
        await cur.execute(query)
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
            "diamonds": row[6],
            "online": row[7],
            "account_created": row[8],
        })
    return users


@router.get("")
async def get_leaderboard(sort: str = "credits"):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if sort == "credits":
                users = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY credits DESC LIMIT 25")
            elif sort == "pixels":
                users = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY pixels DESC LIMIT 25")
            elif sort == "diamonds":
                users = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY points DESC LIMIT 25")
            elif sort == "oldest":
                users = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY account_created ASC LIMIT 25")
            else:
                users = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY credits DESC LIMIT 25")
            return {"users": users}


@router.get("/all")
async def get_all_leaderboards():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            richest = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY credits DESC LIMIT 10")
            most_pixels = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY pixels DESC LIMIT 10")
            most_diamonds = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY points DESC LIMIT 10")
            oldest = await _fetch_board(cur, "SELECT id, username, look, motto, credits, pixels, points, online, account_created FROM users ORDER BY account_created ASC LIMIT 10")
            return {
                "richest": richest,
                "most_pixels": most_pixels,
                "most_diamonds": most_diamonds,
                "oldest": oldest,
            }
