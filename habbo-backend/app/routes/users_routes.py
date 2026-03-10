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
                  account_created, last_online
           FROM users WHERE username = %s""",
        (username,)
    )
    row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "User not found")

    await cur.execute(
        "SELECT badge_code, slot_id FROM users_badges WHERE user_id = %s", (row["id"],)
    )
    badges = [{"badge_code": b["badge_code"], "slot": b["slot_id"]} for b in await cur.fetchall()]

    return {
        "id": row["id"],
        "username": row["username"],
        "motto": row["motto"],
        "look": row["look"],
        "credits": row["credits"],
        "online": row["online"],
        "gender": row["gender"],
        "account_created": row["account_created"],
        "last_online": row["last_online"],
        "badges": badges,
    }
