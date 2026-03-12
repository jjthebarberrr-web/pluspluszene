from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/online")
async def get_online_users(db=Depends(get_db)):
    conn, cur = db
    await cur.execute(
        "SELECT id, username, look, motto FROM users WHERE online = '1' LIMIT 50"
    )
    rows = await cur.fetchall()
    users = []
    for row in rows:
        users.append({
            "id": row["id"],
            "username": row["username"],
            "look": row["look"],
            "motto": row["motto"],
        })
    return {"users": users, "count": len(users)}


@router.get("/top")
async def get_top_users(db=Depends(get_db)):
    conn, cur = db
    # Top by credits
    await cur.execute(
        "SELECT id, username, look, motto, credits FROM users ORDER BY credits DESC LIMIT 10"
    )
    rows = await cur.fetchall()
    top_credits = []
    for row in rows:
        top_credits.append({
            "id": row["id"],
            "username": row["username"],
            "look": row["look"],
            "motto": row["motto"],
            "credits": row["credits"],
        })

    return {"top_credits": top_credits}


@router.get("/{username}")
async def get_user_profile(username: str, db=Depends(get_db)):
    conn, cur = db
    await cur.execute(
        """SELECT id, username, motto, look, credits, online, gender,
                  `rank`, account_created, last_online
           FROM users WHERE username = %s""",
        (username,)
    )
    row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "User not found")

    user_id = row["id"]

    # Get badges
    await cur.execute(
        "SELECT badge_code, slot_id FROM users_badges WHERE user_id = %s", (user_id,)
    )
    badges = [{"badge_code": b["badge_code"], "slot": b["slot_id"]} for b in await cur.fetchall()]

    # Get rooms
    await cur.execute(
        "SELECT id, name, description, users, users_max, score FROM rooms WHERE owner_id = %s ORDER BY score DESC LIMIT 20",
        (user_id,)
    )
    rooms = []
    for r in await cur.fetchall():
        rooms.append({
            "id": r["id"],
            "name": r["name"],
            "description": r["description"],
            "users": r["users"],
            "users_max": r["users_max"],
            "score": r["score"],
        })

    # Get friends count
    await cur.execute(
        "SELECT COUNT(*) as cnt FROM messenger_friendships WHERE user_one_id = %s OR user_two_id = %s",
        (user_id, user_id)
    )
    friends_row = await cur.fetchone()
    friends_count = friends_row["cnt"] if friends_row else 0

    # Get groups
    await cur.execute(
        """SELECT g.id, g.name, g.badge FROM guilds g
           JOIN guilds_members gm ON g.id = gm.guild_id
           WHERE gm.user_id = %s LIMIT 10""",
        (user_id,)
    )
    groups = []
    for g in await cur.fetchall():
        groups.append({
            "id": g["id"],
            "name": g["name"],
            "badge": g["badge"],
        })

    return {
        "id": row["id"],
        "username": row["username"],
        "motto": row["motto"],
        "look": row["look"],
        "credits": row["credits"],
        "online": row["online"],
        "gender": row["gender"],
        "rank": row["rank"],
        "account_created": row["account_created"],
        "last_online": row["last_online"],
        "badges": badges,
        "rooms": rooms,
        "friends_count": friends_count,
        "groups": groups,
    }
