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


async def _fetch_board_extended(cur, query):
    """Fetch board with extra fields (achievement_score, respects_received, ltd_count, online_time)."""
    await cur.execute(query)
    rows = await cur.fetchall()
    users = []
    for row in rows:
        user = {
            "id": row[0],
            "username": row[1],
            "look": row[2],
            "motto": row[3],
            "credits": row[4],
            "pixels": row[5],
            "diamonds": row[6] if row[6] else 0,
            "online": row[7],
            "account_created": row[8],
        }
        # Extra fields depending on query
        if len(row) > 9:
            user["extra_value"] = row[9]
        users.append(user)
    return users


@router.get("/all")
async def get_all_leaderboards():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            base_query = """SELECT u.id, u.username, u.look, u.motto, u.credits, u.pixels,
                             COALESCE(uc.amount, 0) as diamonds, u.online, u.account_created
                             FROM users u LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5
                             WHERE u.`rank` < 6"""

            # 1. Credits
            richest = await _fetch_board(cur, base_query + " ORDER BY u.credits DESC LIMIT 5")

            # 2. Duckets (pixels)
            most_pixels = await _fetch_board(cur, base_query + " ORDER BY u.pixels DESC LIMIT 5")

            # 3. Diamonds
            most_diamonds = await _fetch_board(cur, base_query + " ORDER BY diamonds DESC LIMIT 5")

            # 4. LTD (Limited Edition items owned)
            ltd_list = await _fetch_board_extended(cur,
                "SELECT u.id, u.username, u.look, u.motto, u.credits, u.pixels, "
                "COALESCE(uc.amount, 0) as diamonds, u.online, u.account_created, "
                "COUNT(cil.catalog_item_id) as ltd_count "
                "FROM users u "
                "LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5 "
                "LEFT JOIN catalog_items_limited cil ON cil.user_id = u.id "
                "WHERE u.`rank` < 6 "
                "GROUP BY u.id "
                "ORDER BY ltd_count DESC LIMIT 5"
            )

            # 5. Logins (last_login as proxy for most active)
            logins_list = await _fetch_board(cur, base_query + " ORDER BY u.last_login DESC LIMIT 5")

            # 6. Achievement Score
            achievement_list = await _fetch_board_extended(cur,
                "SELECT u.id, u.username, u.look, u.motto, u.credits, u.pixels, "
                "COALESCE(uc.amount, 0) as diamonds, u.online, u.account_created, "
                "COALESCE(us.achievement_score, 0) as ach_score "
                "FROM users u "
                "LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5 "
                "LEFT JOIN users_settings us ON us.user_id = u.id "
                "WHERE u.`rank` < 6 "
                "ORDER BY ach_score DESC LIMIT 5"
            )

            # 7. Respects Received
            respects_list = await _fetch_board_extended(cur,
                "SELECT u.id, u.username, u.look, u.motto, u.credits, u.pixels, "
                "COALESCE(uc.amount, 0) as diamonds, u.online, u.account_created, "
                "COALESCE(us.respects_received, 0) as resp "
                "FROM users u "
                "LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5 "
                "LEFT JOIN users_settings us ON us.user_id = u.id "
                "WHERE u.`rank` < 6 "
                "ORDER BY resp DESC LIMIT 5"
            )

            # 8. Online Time (last_online - account_created)
            online_time_list = await _fetch_board_extended(cur,
                "SELECT u.id, u.username, u.look, u.motto, u.credits, u.pixels, "
                "COALESCE(uc.amount, 0) as diamonds, u.online, u.account_created, "
                "(u.last_online - u.account_created) as online_secs "
                "FROM users u "
                "LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5 "
                "WHERE u.`rank` < 6 "
                "ORDER BY online_secs DESC LIMIT 5"
            )

            return {
                "richest": richest,
                "most_pixels": most_pixels,
                "most_diamonds": most_diamonds,
                "most_ltd": ltd_list,
                "most_logins": logins_list,
                "most_achievement": achievement_list,
                "most_respects": respects_list,
                "online_time": online_time_list,
            }
