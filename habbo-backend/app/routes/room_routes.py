from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.get("/{room_id}")
async def get_room(room_id: int, db=Depends(get_db)):
    conn, cur = db
    await cur.execute(
        """SELECT id, owner_id, owner_name, name, description, model, state,
                  users, users_max, guild_id, category, score, tags, is_public, is_staff_picked
           FROM rooms WHERE id = %s""",
        (room_id,)
    )
    row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "Room not found")

    # Get owner look
    await cur.execute("SELECT look FROM users WHERE id = %s", (row["owner_id"],))
    owner_row = await cur.fetchone()

    # Get items count
    await cur.execute("SELECT COUNT(*) as cnt FROM items WHERE room_id = %s", (room_id,))
    items_row = await cur.fetchone()

    return {
        "id": row["id"],
        "owner_id": row["owner_id"],
        "owner_name": row["owner_name"],
        "name": row["name"],
        "description": row["description"],
        "model": row["model"],
        "state": row["state"],
        "users": row["users"],
        "users_max": row["users_max"],
        "score": row["score"],
        "tags": row["tags"],
        "is_public": row["is_public"],
        "is_staff_picked": row["is_staff_picked"],
        "owner_look": owner_row["look"] if owner_row else "",
        "items_count": items_row["cnt"] if items_row else 0,
    }
