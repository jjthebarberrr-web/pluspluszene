from fastapi import APIRouter
from app.database import get_pool

router = APIRouter(prefix="/api/staff", tags=["staff"])

# Default rank names if permissions table doesn't have rank_name column
DEFAULT_RANK_NAMES = {
    2: "VIP",
    3: "X",
    4: "Support",
    5: "Moderator",
    6: "Super Moderator",
    7: "Administrator",
}


@router.get("")
async def get_staff():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Try to get rank names from permissions table
            rank_names = dict(DEFAULT_RANK_NAMES)
            try:
                await cur.execute("SELECT id, rank_name FROM permissions WHERE id > 1 ORDER BY id DESC")
                rows = await cur.fetchall()
                if rows:
                    for row in rows:
                        rank_names[row[0]] = row[1]
            except Exception:
                pass

            # Get all staff members (rank > 1)
            await cur.execute(
                "SELECT id, username, look, motto, `rank`, online FROM users WHERE `rank` > 1 ORDER BY `rank` DESC, username ASC"
            )
            staff_rows = await cur.fetchall()

    # Group by rank
    groups_map: dict[int, dict] = {}
    for row in staff_rows:
        user_rank = row[4]
        if user_rank not in groups_map:
            groups_map[user_rank] = {
                "rank": user_rank,
                "rank_name": rank_names.get(user_rank, f"Rank {user_rank}"),
                "members": [],
            }
        groups_map[user_rank]["members"].append({
            "id": row[0],
            "username": row[1],
            "look": row[2],
            "motto": row[3],
            "rank": user_rank,
            "rank_name": rank_names.get(user_rank, f"Rank {user_rank}"),
            "online": row[5],
        })

    # Sort groups by rank descending (highest rank first)
    groups = sorted(groups_map.values(), key=lambda g: g["rank"], reverse=True)
    return {"groups": groups}
