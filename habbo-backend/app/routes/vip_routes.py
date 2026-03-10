from fastapi import APIRouter
from app.database import get_pool

router = APIRouter(prefix="/api/vip-list", tags=["vip"])

VIP_RANK_META = {
    5: {"name": "VIP Diamond", "icon": "diamond", "color": "from-cyan-500 to-blue-500", "badge_color": "bg-cyan-900/50 text-cyan-300 border-cyan-700/50"},
    4: {"name": "VIP Gold", "icon": "crown", "color": "from-yellow-600 to-amber-500", "badge_color": "bg-yellow-900/50 text-yellow-300 border-yellow-700/50"},
    3: {"name": "VIP Silver", "icon": "gem", "color": "from-zinc-500 to-zinc-400", "badge_color": "bg-zinc-700/50 text-zinc-300 border-zinc-500/50"},
    2: {"name": "VIP Bronze", "icon": "star", "color": "from-orange-700 to-orange-500", "badge_color": "bg-orange-900/50 text-orange-300 border-orange-700/50"},
}


@router.get("")
async def get_vip_list():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Get rank names from permissions table
            rank_names: dict[int, str] = {}
            try:
                await cur.execute("SELECT id, rank_name FROM permissions WHERE id >= 2 AND id <= 5 ORDER BY id DESC")
                rows = await cur.fetchall()
                for row in rows:
                    rank_names[row[0]] = row[1]
            except Exception:
                pass

            # Get all VIP members (ranks 2-5)
            await cur.execute(
                "SELECT id, username, look, motto, `rank`, online FROM users WHERE `rank` >= 2 AND `rank` <= 5 ORDER BY `rank` DESC, username ASC"
            )
            vip_rows = await cur.fetchall()

    # Group by rank
    groups_map: dict[int, dict] = {}
    for row in vip_rows:
        user_rank = row[4]
        meta = VIP_RANK_META.get(user_rank, {"name": f"VIP Rank {user_rank}", "icon": "star", "color": "from-zinc-700 to-zinc-500", "badge_color": "bg-zinc-800 text-zinc-400 border-zinc-700"})
        rname = rank_names.get(user_rank, meta["name"])
        if user_rank not in groups_map:
            groups_map[user_rank] = {
                "rank": user_rank,
                "rank_name": rname,
                "description": f"Exclusive {rname} members with special perks and catalog access",
                "icon": meta["icon"],
                "color": meta["color"],
                "badge_color": meta["badge_color"],
                "members": [],
            }
        groups_map[user_rank]["members"].append({
            "id": row[0],
            "username": row[1],
            "look": row[2],
            "motto": row[3],
            "rank": user_rank,
            "rank_name": rname,
            "online": row[5],
        })

    # Ensure all VIP ranks 2-5 are shown even if empty
    for r in range(5, 1, -1):
        if r not in groups_map:
            meta = VIP_RANK_META.get(r, {"name": f"VIP Rank {r}", "icon": "star", "color": "from-zinc-700 to-zinc-500", "badge_color": "bg-zinc-800 text-zinc-400 border-zinc-700"})
            rname = rank_names.get(r, meta["name"])
            groups_map[r] = {
                "rank": r,
                "rank_name": rname,
                "description": f"Exclusive {rname} members with special perks and catalog access",
                "icon": meta["icon"],
                "color": meta["color"],
                "badge_color": meta["badge_color"],
                "members": [],
            }

    groups = sorted(groups_map.values(), key=lambda g: g["rank"], reverse=True)
    total_vip = sum(len(g["members"]) for g in groups)
    return {"groups": groups, "total_vip": total_vip}
