import time
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from app.database import get_pool

router = APIRouter(prefix="/api/radio", tags=["radio"])


async def _ensure_radio_tables(pool):
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS radio_djs (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    role ENUM('dj', 'dj_manager') DEFAULT 'dj',
                    appointed_by INT DEFAULT 0,
                    status ENUM('active', 'inactive') DEFAULT 'active',
                    created_at INT NOT NULL,
                    UNIQUE KEY uc_user (user_id)
                )
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS radio_status (
                    id INT PRIMARY KEY DEFAULT 1,
                    current_dj_id INT DEFAULT 0,
                    show_name VARCHAR(255) DEFAULT '',
                    started_at INT DEFAULT 0,
                    is_live TINYINT DEFAULT 0
                )
            """)
            # Ensure there's a row in radio_status
            await cur.execute("SELECT COUNT(*) FROM radio_status")
            row = await cur.fetchone()
            if row[0] == 0:
                await cur.execute(
                    "INSERT INTO radio_status (id, current_dj_id, show_name, started_at, is_live) VALUES (1, 0, '', 0, 0)"
                )
        await conn.commit()


@router.get("/current")
async def get_current_dj():
    """Get current live DJ info - used by client widget"""
    pool = await get_pool()
    await _ensure_radio_tables(pool)

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT current_dj_id, show_name, started_at, is_live FROM radio_status WHERE id = 1")
            status = await cur.fetchone()
            if not status or not status[3]:  # not live
                return {"is_live": False, "dj": None, "show_name": ""}

            dj_id = status[0]
            if dj_id <= 0:
                return {"is_live": False, "dj": None, "show_name": ""}

            await cur.execute(
                "SELECT id, username, look FROM users WHERE id = %s", (dj_id,)
            )
            user = await cur.fetchone()
            if not user:
                return {"is_live": False, "dj": None, "show_name": ""}

            return {
                "is_live": True,
                "dj": {
                    "id": user[0],
                    "username": user[1],
                    "look": user[2],
                },
                "show_name": status[1],
                "started_at": status[2],
            }


@router.get("/djs")
async def get_all_djs():
    """Get all DJs and DJ Managers"""
    pool = await get_pool()
    await _ensure_radio_tables(pool)

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT rd.id, rd.user_id, rd.role, rd.status, rd.created_at, u.username, u.look, u.online "
                "FROM radio_djs rd JOIN users u ON rd.user_id = u.id "
                "ORDER BY rd.role DESC, u.username ASC"
            )
            rows = await cur.fetchall()

            managers = []
            djs = []
            for row in rows:
                entry = {
                    "id": row[0],
                    "user_id": row[1],
                    "role": row[2],
                    "status": row[3],
                    "created_at": row[4],
                    "username": row[5],
                    "look": row[6],
                    "online": row[7],
                }
                if row[2] == "dj_manager":
                    managers.append(entry)
                else:
                    djs.append(entry)

            # Get current status
            await cur.execute("SELECT current_dj_id, show_name, started_at, is_live FROM radio_status WHERE id = 1")
            status = await cur.fetchone()

            return {
                "managers": managers,
                "djs": djs,
                "current_status": {
                    "current_dj_id": status[0] if status else 0,
                    "show_name": status[1] if status else "",
                    "started_at": status[2] if status else 0,
                    "is_live": bool(status[3]) if status else False,
                }
            }


class SetDJRequest(BaseModel):
    dj_user_id: int
    show_name: str = ""


class AddDJRequest(BaseModel):
    user_id: int
    role: str = "dj"  # "dj" or "dj_manager"


class RemoveDJRequest(BaseModel):
    user_id: int


async def _get_user_rank(pool, user_id: int) -> int:
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT `rank` FROM users WHERE id = %s", (user_id,))
            row = await cur.fetchone()
            return row[0] if row else 0


async def _is_dj_manager(pool, user_id: int) -> bool:
    """Check if user is a DJ Manager or staff rank 8+"""
    rank = await _get_user_rank(pool, user_id)
    if rank >= 8:  # Governor+ can manage DJs
        return True
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT role FROM radio_djs WHERE user_id = %s AND status = 'active'",
                (user_id,)
            )
            row = await cur.fetchone()
            return row is not None and row[0] == "dj_manager"


@router.post("/go-live")
async def go_live(req: SetDJRequest, request: Request):
    """Set a DJ as currently live on air"""
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(401, "Login required")

    from app.auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")

    pool = await get_pool()
    await _ensure_radio_tables(pool)

    user_id = payload["user_id"]
    if not await _is_dj_manager(pool, user_id):
        raise HTTPException(403, "Only DJ Managers or senior staff can set the live DJ")

    # Verify the DJ exists in the roster
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id FROM radio_djs WHERE user_id = %s AND status = 'active'",
                (req.dj_user_id,)
            )
            if not await cur.fetchone():
                raise HTTPException(400, "User is not an active DJ")

            now = int(time.time())
            await cur.execute(
                "UPDATE radio_status SET current_dj_id = %s, show_name = %s, started_at = %s, is_live = 1 WHERE id = 1",
                (req.dj_user_id, req.show_name, now)
            )
        await conn.commit()

    return {"ok": True, "message": "DJ is now live!"}


@router.post("/go-offline")
async def go_offline(request: Request):
    """Take radio offline"""
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(401, "Login required")

    from app.auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")

    pool = await get_pool()
    await _ensure_radio_tables(pool)

    user_id = payload["user_id"]
    if not await _is_dj_manager(pool, user_id):
        raise HTTPException(403, "Only DJ Managers or senior staff can control the radio")

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "UPDATE radio_status SET current_dj_id = 0, show_name = '', started_at = 0, is_live = 0 WHERE id = 1"
            )
        await conn.commit()

    return {"ok": True, "message": "Radio is now offline"}


@router.post("/add-dj")
async def add_dj(req: AddDJRequest, request: Request):
    """Add a user as DJ or DJ Manager"""
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(401, "Login required")

    from app.auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")

    pool = await get_pool()
    await _ensure_radio_tables(pool)

    user_id = payload["user_id"]
    if not await _is_dj_manager(pool, user_id):
        raise HTTPException(403, "Only DJ Managers or senior staff can add DJs")

    role = req.role if req.role in ("dj", "dj_manager") else "dj"
    now = int(time.time())

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Check if user exists
            await cur.execute("SELECT id FROM users WHERE id = %s", (req.user_id,))
            if not await cur.fetchone():
                raise HTTPException(400, "User not found")

            try:
                await cur.execute(
                    "INSERT INTO radio_djs (user_id, role, appointed_by, status, created_at) VALUES (%s, %s, %s, 'active', %s)",
                    (req.user_id, role, user_id, now)
                )
            except Exception:
                # Already exists - update role
                await cur.execute(
                    "UPDATE radio_djs SET role = %s, status = 'active', appointed_by = %s WHERE user_id = %s",
                    (role, user_id, req.user_id)
                )
        await conn.commit()

    return {"ok": True, "message": f"User added as {role.replace('_', ' ').title()}"}


@router.post("/remove-dj")
async def remove_dj(req: RemoveDJRequest, request: Request):
    """Remove a DJ from the roster"""
    token = request.cookies.get("token")
    if not token:
        raise HTTPException(401, "Login required")

    from app.auth import decode_token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid token")

    pool = await get_pool()
    await _ensure_radio_tables(pool)

    user_id = payload["user_id"]
    if not await _is_dj_manager(pool, user_id):
        raise HTTPException(403, "Only DJ Managers or senior staff can remove DJs")

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # If removing a live DJ, take radio offline
            await cur.execute("SELECT current_dj_id FROM radio_status WHERE id = 1")
            status = await cur.fetchone()
            if status and status[0] == req.user_id:
                await cur.execute(
                    "UPDATE radio_status SET current_dj_id = 0, show_name = '', started_at = 0, is_live = 0 WHERE id = 1"
                )

            await cur.execute(
                "UPDATE radio_djs SET status = 'inactive' WHERE user_id = %s",
                (req.user_id,)
            )
        await conn.commit()

    return {"ok": True, "message": "DJ removed from roster"}
