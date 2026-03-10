import time
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from app.database import get_pool

router = APIRouter(prefix="/api/staff", tags=["staff"])

# Government-style rank hierarchy (ranks 6-10 are staff)
RANK_META = {
    10: {"name": "President", "description": "Supreme leader of the hotel. Sets the vision, makes executive decisions, and represents the community.", "icon": "crown", "color": "from-yellow-600 to-amber-500"},
    9: {"name": "Vice President", "description": "Second in command. Assists the President and steps in when they're away. Oversees daily operations.", "icon": "shield", "color": "from-red-700 to-red-500"},
    8: {"name": "Governor", "description": "Regional leaders who manage specific areas of the hotel. Enforce policies and manage events.", "icon": "landmark", "color": "from-purple-700 to-purple-500"},
    7: {"name": "Senator", "description": "Elected officials who propose and vote on hotel policies. Voice of the community.", "icon": "scale", "color": "from-blue-700 to-blue-500"},
    6: {"name": "Representative", "description": "Community-elected members who represent player interests and moderate discussions.", "icon": "users", "color": "from-emerald-700 to-emerald-500"},
}


class NominateRequest(BaseModel):
    nominee_id: int
    position_rank: int
    statement: str = ""


class VoteRequest(BaseModel):
    election_id: int
    candidate_id: int


async def _ensure_election_tables(pool):
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS staff_elections (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    position_rank INT NOT NULL,
                    status ENUM('nominations','voting','closed') DEFAULT 'nominations',
                    created_at INT NOT NULL,
                    voting_starts INT DEFAULT 0,
                    voting_ends INT DEFAULT 0,
                    winner_id INT DEFAULT 0
                )
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS staff_candidates (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    election_id INT NOT NULL,
                    user_id INT NOT NULL,
                    nominator_id INT NOT NULL,
                    statement TEXT,
                    votes INT DEFAULT 0,
                    created_at INT NOT NULL,
                    UNIQUE KEY uc_election_user (election_id, user_id)
                )
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS staff_votes (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    election_id INT NOT NULL,
                    voter_id INT NOT NULL,
                    candidate_id INT NOT NULL,
                    created_at INT NOT NULL,
                    UNIQUE KEY uc_election_voter (election_id, voter_id)
                )
            """)
        await conn.commit()


@router.get("")
async def get_staff():
    pool = await get_pool()
    await _ensure_election_tables(pool)

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Get rank names from permissions table
            rank_names: dict[int, str] = {}
            try:
                await cur.execute("SELECT id, rank_name FROM permissions WHERE id > 1 ORDER BY id DESC")
                rows = await cur.fetchall()
                for row in rows:
                    rank_names[row[0]] = row[1]
            except Exception:
                pass

            # Get all staff members (ranks 6-10)
            await cur.execute(
                "SELECT id, username, look, motto, `rank`, online FROM users WHERE `rank` >= 6 AND `rank` <= 10 ORDER BY `rank` DESC, username ASC"
            )
            staff_rows = await cur.fetchall()

            # Get total user count for stats
            await cur.execute("SELECT COUNT(*) FROM users")
            total_users = (await cur.fetchone())[0]
            await cur.execute("SELECT COUNT(*) FROM users WHERE online = '1'")
            online_users = (await cur.fetchone())[0]
            await cur.execute("SELECT COUNT(*) FROM users WHERE `rank` >= 6")
            total_staff = (await cur.fetchone())[0]

    # Group by rank
    groups_map: dict[int, dict] = {}
    for row in staff_rows:
        user_rank = row[4]
        meta = RANK_META.get(user_rank, {"name": f"Rank {user_rank}", "description": "", "icon": "user", "color": "from-zinc-700 to-zinc-500"})
        rname = rank_names.get(user_rank, meta["name"])
        if user_rank not in groups_map:
            groups_map[user_rank] = {
                "rank": user_rank,
                "rank_name": rname,
                "description": meta["description"],
                "icon": meta["icon"],
                "color": meta["color"],
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

    # Ensure all ranks 6-10 are shown even if empty
    for r in range(10, 5, -1):
        if r not in groups_map:
            meta = RANK_META.get(r, {"name": f"Rank {r}", "description": "", "icon": "user", "color": "from-zinc-700 to-zinc-500"})
            rname = rank_names.get(r, meta["name"])
            groups_map[r] = {
                "rank": r,
                "rank_name": rname,
                "description": meta["description"],
                "icon": meta["icon"],
                "color": meta["color"],
                "members": [],
            }

    groups = sorted(groups_map.values(), key=lambda g: g["rank"], reverse=True)
    return {
        "groups": groups,
        "stats": {"total_users": total_users, "online_users": online_users, "total_staff": total_staff},
    }


@router.get("/elections")
async def get_elections():
    pool = await get_pool()
    await _ensure_election_tables(pool)

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id, position_rank, status, created_at, voting_starts, voting_ends, winner_id FROM staff_elections ORDER BY created_at DESC LIMIT 20"
            )
            elections = []
            for row in await cur.fetchall():
                eid = row[0]
                # Get candidates for this election
                await cur.execute(
                    "SELECT sc.id, sc.user_id, u.username, u.look, sc.statement, sc.votes, sc.created_at "
                    "FROM staff_candidates sc JOIN users u ON sc.user_id = u.id WHERE sc.election_id = %s ORDER BY sc.votes DESC",
                    (eid,)
                )
                candidates = []
                for c in await cur.fetchall():
                    candidates.append({
                        "id": c[0], "user_id": c[1], "username": c[2], "look": c[3],
                        "statement": c[4], "votes": c[5], "created_at": c[6],
                    })

                meta = RANK_META.get(row[1], {"name": f"Rank {row[1]}", "color": "from-zinc-700 to-zinc-500"})
                elections.append({
                    "id": eid, "position_rank": row[1], "position_name": meta["name"],
                    "color": meta["color"], "status": row[2],
                    "created_at": row[3], "voting_starts": row[4], "voting_ends": row[5],
                    "winner_id": row[6], "candidates": candidates,
                })
            return {"elections": elections}


@router.post("/elections/{election_id}/vote")
async def vote_in_election(election_id: int, req: VoteRequest, request: Request):
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(401, "Login required")

    from app.auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")
    voter_id = payload["user_id"]

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Verify election is in voting phase
            await cur.execute("SELECT status FROM staff_elections WHERE id = %s", (election_id,))
            row = await cur.fetchone()
            if not row or row[0] != "voting":
                raise HTTPException(400, "Election is not in voting phase")

            # Verify candidate exists
            await cur.execute("SELECT id FROM staff_candidates WHERE id = %s AND election_id = %s", (req.candidate_id, election_id))
            if not await cur.fetchone():
                raise HTTPException(400, "Candidate not found")

            # Check if already voted
            await cur.execute("SELECT id FROM staff_votes WHERE election_id = %s AND voter_id = %s", (election_id, voter_id))
            if await cur.fetchone():
                raise HTTPException(400, "You have already voted in this election")

            # Cast vote
            now = int(time.time())
            await cur.execute(
                "INSERT INTO staff_votes (election_id, voter_id, candidate_id, created_at) VALUES (%s, %s, %s, %s)",
                (election_id, voter_id, req.candidate_id, now)
            )
            await cur.execute(
                "UPDATE staff_candidates SET votes = votes + 1 WHERE id = %s",
                (req.candidate_id,)
            )
        await conn.commit()
    return {"ok": True, "message": "Vote cast successfully!"}
