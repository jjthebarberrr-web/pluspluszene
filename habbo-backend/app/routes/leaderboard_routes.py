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
            "diamonds": row[6] if row[6] else 0,
            "online": row[7],
            "account_created": row[8],
        })
    return users


@router.get("")
async def get_leaderboard(sort: str = "credits"):
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            base_query = """SELECT u.id, u.username, u.look, u.motto, u.credits, u.pixels,
                             COALESCE(uc.amount, 0) as diamonds, u.online, u.account_created
                             FROM users u LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5
                             WHERE u.`rank` < 6"""
            if sort == "credits":
                users = await _fetch_board(cur, base_query + " ORDER BY u.credits DESC LIMIT 25")
            elif sort == "pixels":
                users = await _fetch_board(cur, base_query + " ORDER BY u.pixels DESC LIMIT 25")
            elif sort == "diamonds":
                users = await _fetch_board(cur, base_query + " ORDER BY diamonds DESC LIMIT 25")
            elif sort == "oldest":
                users = await _fetch_board(cur, base_query + " ORDER BY u.account_created ASC LIMIT 25")
            else:
                users = await _fetch_board(cur, base_query + " ORDER BY u.credits DESC LIMIT 25")
            return {"users": users}


@router.get("/all")
async def get_all_leaderboards():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            base_query = """SELECT u.id, u.username, u.look, u.motto, u.credits, u.pixels,
                             COALESCE(uc.amount, 0) as diamonds, u.online, u.account_created
                             FROM users u LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5
                             WHERE u.`rank` < 6"""
            richest = await _fetch_board(cur, base_query + " ORDER BY u.credits DESC LIMIT 10")
            most_pixels = await _fetch_board(cur, base_query + " ORDER BY u.pixels DESC LIMIT 10")
            most_diamonds = await _fetch_board(cur, base_query + " ORDER BY diamonds DESC LIMIT 10")
            oldest = await _fetch_board(cur, base_query + " ORDER BY u.account_created ASC LIMIT 10")

            # Longest Playing - users with the most total online time (last_online - account_created as proxy)
            longest_playing = await _fetch_board(cur, base_query + " ORDER BY (u.last_online - u.account_created) DESC LIMIT 10")

            # Most Events Won
            most_events_won_list = []
            try:
                await cur.execute(
                    "SELECT u.id, u.username, u.look, u.motto, u.credits, u.pixels, "
                    "COALESCE(uc.amount, 0) as diamonds, u.online, u.account_created, "
                    "COUNT(e.id) as wins "
                    "FROM users u "
                    "LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5 "
                    "INNER JOIN habplus_events e ON e.winner_user_id = u.id AND e.status = 'completed' "
                    "WHERE u.`rank` < 6 "
                    "GROUP BY u.id "
                    "ORDER BY wins DESC "
                    "LIMIT 10"
                )
                for row in await cur.fetchall():
                    most_events_won_list.append({
                        "id": row[0], "username": row[1], "look": row[2], "motto": row[3],
                        "credits": row[4], "pixels": row[5], "diamonds": row[6] if row[6] else 0,
                        "online": row[7], "account_created": row[8], "events_won": row[9],
                    })
            except Exception:
                pass

            return {
                "richest": richest,
                "most_pixels": most_pixels,
                "most_diamonds": most_diamonds,
                "oldest": oldest,
                "longest_playing": longest_playing,
                "most_events_won": most_events_won_list,
            }
