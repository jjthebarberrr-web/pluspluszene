import time
import os
from pathlib import Path
from fastapi import APIRouter, Depends, Request, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.database import get_db, get_pool
from app.auth import decode_token

router = APIRouter(prefix="/api/housekeeping", tags=["housekeeping"])

# Rank permission levels:
# 6 (DJ): Dashboard only
# 7 (DJ Manager): Dashboard only
# 8 (Event): Dashboard only
# 9 (Event Manager): Dashboard only
# 10 (Representative): + Moderation (mute, view reports)
# 11 (Senator): + User mgmt (search/edit/ban), Room mgmt
# 12 (Governor): + News mgmt (create/edit/delete), Catalog mgmt
# 13 (Vice President): + Ban mgmt, Room deletion
# 14 (President): Full staff access - settings, rank mgmt (no dev commands)
# 15 (Elite): Full access - dev commands, system updates

MIN_STAFF_RANK = 6


async def get_staff_user(request: Request):
    """Extract and validate staff user from JWT token. Returns user dict with id, username, rank."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id, username, `rank`, look FROM users WHERE id = %s",
                (payload["user_id"],)
            )
            row = await cur.fetchone()
            if not row:
                raise HTTPException(404, "User not found")
            user = {"id": row[0], "username": row[1], "rank": row[2], "look": row[3]}
            if user["rank"] < MIN_STAFF_RANK:
                raise HTTPException(403, "Access denied - Staff only")
            return user


def require_rank(min_rank: int):
    """Check if user has minimum rank required."""
    def check(user: dict):
        if user["rank"] < min_rank:
            raise HTTPException(403, f"Access denied - Requires rank {min_rank}+")
    return check


# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_dashboard(request: Request):
    """Dashboard stats - accessible by all staff (rank 6+)"""
    user = await get_staff_user(request)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Total users
            await cur.execute("SELECT COUNT(*) FROM users")
            total_users = (await cur.fetchone())[0]

            # Online users
            await cur.execute("SELECT COUNT(*) FROM users WHERE online = '1'")
            online_users = (await cur.fetchone())[0]

            # Users registered today
            today_start = int(time.time()) - (int(time.time()) % 86400)
            await cur.execute("SELECT COUNT(*) FROM users WHERE account_created >= %s", (today_start,))
            new_users_today = (await cur.fetchone())[0]

            # Total rooms
            await cur.execute("SELECT COUNT(*) FROM rooms")
            total_rooms = (await cur.fetchone())[0]

            # Total bans
            await cur.execute("SELECT COUNT(*) FROM bans")
            total_bans = (await cur.fetchone())[0]

            # Total news articles
            await cur.execute("SELECT COUNT(*) FROM news")
            total_news = (await cur.fetchone())[0]

            # Staff count
            await cur.execute("SELECT COUNT(*) FROM users WHERE `rank` >= 6")
            total_staff = (await cur.fetchone())[0]

            # Recent registrations (last 10)
            await cur.execute(
                "SELECT id, username, look, account_created, `rank` FROM users ORDER BY account_created DESC LIMIT 10"
            )
            recent_users = []
            for r in await cur.fetchall():
                recent_users.append({
                    "id": r[0], "username": r[1], "look": r[2],
                    "account_created": r[3], "rank": r[4],
                })

            # Recent bans (last 10)
            recent_bans = []
            try:
                await cur.execute(
                    "SELECT b.id, b.user_id, b.ip, b.machine_id, b.user_staff_id, b.timestamp, b.ban_expire, b.ban_reason, b.type, u.username as banned_user, s.username as staff_user "
                    "FROM bans b LEFT JOIN users u ON b.user_id = u.id LEFT JOIN users s ON b.user_staff_id = s.id "
                    "ORDER BY b.timestamp DESC LIMIT 10"
                )
                for r in await cur.fetchall():
                    recent_bans.append({
                        "id": r[0], "user_id": r[1], "ip": r[2], "machine_id": r[3],
                        "staff_id": r[4], "timestamp": r[5], "ban_expire": r[6],
                        "reason": r[7], "type": r[8],
                        "banned_user": r[9] or "Unknown",
                        "staff_user": r[10] or "System",
                    })
            except Exception:
                pass

    return {
        "user": {"id": user["id"], "username": user["username"], "rank": user["rank"], "look": user["look"]},
        "stats": {
            "total_users": total_users,
            "online_users": online_users,
            "new_users_today": new_users_today,
            "total_rooms": total_rooms,
            "total_bans": total_bans,
            "total_news": total_news,
            "total_staff": total_staff,
        },
        "recent_users": recent_users,
        "recent_bans": recent_bans,
    }


# ==================== USER MANAGEMENT (Rank 8+) ====================

class UserSearchRequest(BaseModel):
    query: str
    search_type: str = "username"  # username, email, id


class UserEditRequest(BaseModel):
    motto: Optional[str] = None
    credits: Optional[int] = None
    pixels: Optional[int] = None
    rank: Optional[int] = None
    look: Optional[str] = None


class BanRequest(BaseModel):
    user_id: int
    reason: str
    duration: int = 0  # 0 = permanent, otherwise seconds
    type: str = "account"  # account, ip, machine


@router.get("/users")
async def search_users(request: Request, q: str = "", page: int = 1, search_type: str = "username"):
    """Search users - rank 11+"""
    user = await get_staff_user(request)
    require_rank(11)(user)

    pool = await get_pool()
    limit = 20
    offset = (page - 1) * limit

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if search_type == "id" and q.isdigit():
                await cur.execute(
                    "SELECT id, username, mail, look, motto, `rank`, online, account_created, last_login, ip_current FROM users WHERE id = %s",
                    (int(q),)
                )
            elif search_type == "email":
                await cur.execute(
                    "SELECT id, username, mail, look, motto, `rank`, online, account_created, last_login, ip_current FROM users WHERE mail LIKE %s ORDER BY id DESC LIMIT %s OFFSET %s",
                    (f"%{q}%", limit, offset)
                )
            else:
                await cur.execute(
                    "SELECT id, username, mail, look, motto, `rank`, online, account_created, last_login, ip_current FROM users WHERE username LIKE %s ORDER BY id DESC LIMIT %s OFFSET %s",
                    (f"%{q}%", limit, offset)
                )

            users = []
            for r in await cur.fetchall():
                users.append({
                    "id": r[0], "username": r[1], "email": r[2], "look": r[3],
                    "motto": r[4], "rank": r[5], "online": r[6],
                    "account_created": r[7], "last_login": r[8],
                    "ip": r[9] if user["rank"] >= 13 else "hidden",
                })

            # Get total count
            if search_type == "id" and q.isdigit():
                total = len(users)
            elif search_type == "email":
                await cur.execute("SELECT COUNT(*) FROM users WHERE mail LIKE %s", (f"%{q}%",))
                total = (await cur.fetchone())[0]
            else:
                await cur.execute("SELECT COUNT(*) FROM users WHERE username LIKE %s", (f"%{q}%",))
                total = (await cur.fetchone())[0]

    return {"users": users, "total": total, "page": page, "pages": (total + limit - 1) // limit}


@router.get("/users/{user_id}")
async def get_user_detail(user_id: int, request: Request):
    """Get detailed user info - rank 11+"""
    user = await get_staff_user(request)
    require_rank(11)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id, username, real_name, mail, look, motto, `rank`, online, gender, "
                "account_created, last_login, last_online, credits, pixels, ip_register, ip_current, machine_id, home_room "
                "FROM users WHERE id = %s",
                (user_id,)
            )
            r = await cur.fetchone()
            if not r:
                raise HTTPException(404, "User not found")

            user_data = {
                "id": r[0], "username": r[1], "real_name": r[2], "email": r[3],
                "look": r[4], "motto": r[5], "rank": r[6], "online": r[7],
                "gender": r[8], "account_created": r[9], "last_login": r[10],
                "last_online": r[11], "credits": r[12], "pixels": r[13],
                "ip_register": r[14] if user["rank"] >= 13 else "hidden",
                "ip_current": r[15] if user["rank"] >= 13 else "hidden",
                "machine_id": r[16] if user["rank"] >= 13 else "hidden",
                "home_room": r[17],
            }

            # Get currencies
            await cur.execute(
                "SELECT type, amount FROM users_currency WHERE user_id = %s", (user_id,)
            )
            currencies = {}
            for cr in await cur.fetchall():
                currencies[cr[0]] = cr[1]
            user_data["duckets"] = currencies.get(0, 0)
            user_data["diamonds"] = currencies.get(5, 0)

            # Get badges
            await cur.execute(
                "SELECT badge_code, slot_id FROM users_badges WHERE user_id = %s", (user_id,)
            )
            user_data["badges"] = [{"code": b[0], "slot": b[1]} for b in await cur.fetchall()]

            # Get ban history
            bans = []
            try:
                await cur.execute(
                    "SELECT id, ban_reason, timestamp, ban_expire, type, user_staff_id FROM bans WHERE user_id = %s ORDER BY timestamp DESC",
                    (user_id,)
                )
                for b in await cur.fetchall():
                    bans.append({
                        "id": b[0], "reason": b[1], "timestamp": b[2],
                        "expires": b[3], "type": b[4], "staff_id": b[5],
                    })
            except Exception:
                pass
            user_data["bans"] = bans

    return user_data


@router.put("/users/{user_id}")
async def edit_user(user_id: int, req: UserEditRequest, request: Request):
    """Edit user - rank 11+"""
    user = await get_staff_user(request)
    require_rank(11)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Check target user exists and has lower rank
            await cur.execute("SELECT `rank` FROM users WHERE id = %s", (user_id,))
            target = await cur.fetchone()
            if not target:
                raise HTTPException(404, "User not found")
            if target[0] >= user["rank"] and user_id != user["id"]:
                raise HTTPException(403, "Cannot edit user with equal or higher rank")

            updates = []
            params = []
            if req.motto is not None:
                updates.append("motto = %s")
                params.append(req.motto)
            if req.credits is not None:
                updates.append("credits = %s")
                params.append(req.credits)
            if req.pixels is not None:
                updates.append("pixels = %s")
                params.append(req.pixels)
            if req.rank is not None:
                # Only President+ can change ranks
                require_rank(14)(user)
                if req.rank >= user["rank"]:
                    raise HTTPException(403, "Cannot set rank equal to or higher than your own")
                updates.append("`rank` = %s")
                params.append(req.rank)
            if req.look is not None:
                updates.append("look = %s")
                params.append(req.look)

            if not updates:
                raise HTTPException(400, "No fields to update")

            params.append(user_id)
            await cur.execute(
                f"UPDATE users SET {', '.join(updates)} WHERE id = %s",
                tuple(params)
            )
        await conn.commit()

    return {"ok": True, "message": "User updated successfully"}


# ==================== BAN MANAGEMENT (Rank 11+) ====================

@router.post("/bans")
async def ban_user(req: BanRequest, request: Request):
    """Ban a user - rank 11+"""
    user = await get_staff_user(request)
    require_rank(11)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Check target user exists and has lower rank
            await cur.execute("SELECT `rank`, ip_current, machine_id FROM users WHERE id = %s", (req.user_id,))
            target = await cur.fetchone()
            if not target:
                raise HTTPException(404, "User not found")
            if target[0] >= user["rank"]:
                raise HTTPException(403, "Cannot ban user with equal or higher rank")

            now = int(time.time())
            expire = 0 if req.duration == 0 else now + req.duration

            ip = target[1] or ""
            machine_id = target[2] or ""

            # Insert ban
            await cur.execute(
                "INSERT INTO bans (user_id, ip, machine_id, user_staff_id, timestamp, ban_expire, ban_reason, type, cfh_topic) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (req.user_id, ip if req.type in ("ip", "machine") else "",
                 machine_id if req.type == "machine" else "",
                 user["id"], now, expire, req.reason, req.type, 0)
            )
        await conn.commit()

    return {"ok": True, "message": f"User banned successfully ({req.type})"}


@router.get("/bans")
async def get_bans(request: Request, page: int = 1, q: str = ""):
    """List bans - rank 11+"""
    user = await get_staff_user(request)
    require_rank(11)(user)

    pool = await get_pool()
    limit = 20
    offset = (page - 1) * limit

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if q:
                await cur.execute(
                    "SELECT b.id, b.user_id, b.ip, b.user_staff_id, b.timestamp, b.ban_expire, b.ban_reason, b.type, "
                    "u.username as banned_user, s.username as staff_user "
                    "FROM bans b LEFT JOIN users u ON b.user_id = u.id LEFT JOIN users s ON b.user_staff_id = s.id "
                    "WHERE u.username LIKE %s OR b.ban_reason LIKE %s "
                    "ORDER BY b.timestamp DESC LIMIT %s OFFSET %s",
                    (f"%{q}%", f"%{q}%", limit, offset)
                )
            else:
                await cur.execute(
                    "SELECT b.id, b.user_id, b.ip, b.user_staff_id, b.timestamp, b.ban_expire, b.ban_reason, b.type, "
                    "u.username as banned_user, s.username as staff_user "
                    "FROM bans b LEFT JOIN users u ON b.user_id = u.id LEFT JOIN users s ON b.user_staff_id = s.id "
                    "ORDER BY b.timestamp DESC LIMIT %s OFFSET %s",
                    (limit, offset)
                )

            bans = []
            for r in await cur.fetchall():
                bans.append({
                    "id": r[0], "user_id": r[1], "ip": r[2] if user["rank"] >= 13 else "hidden",
                    "staff_id": r[3], "timestamp": r[4], "ban_expire": r[5],
                    "reason": r[6], "type": r[7],
                    "banned_user": r[8] or "Unknown",
                    "staff_user": r[9] or "System",
                })

            # Total count
            if q:
                await cur.execute(
                    "SELECT COUNT(*) FROM bans b LEFT JOIN users u ON b.user_id = u.id WHERE u.username LIKE %s OR b.ban_reason LIKE %s",
                    (f"%{q}%", f"%{q}%")
                )
            else:
                await cur.execute("SELECT COUNT(*) FROM bans")
            total = (await cur.fetchone())[0]

    return {"bans": bans, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}


@router.delete("/bans/{ban_id}")
async def unban_user(ban_id: int, request: Request):
    """Remove a ban - rank 11+"""
    user = await get_staff_user(request)
    require_rank(11)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM bans WHERE id = %s", (ban_id,))
        await conn.commit()

    return {"ok": True, "message": "Ban removed"}


# ==================== NEWS MANAGEMENT (Rank 12+) ====================

class NewsCreateRequest(BaseModel):
    title: str
    content: str
    image_url: str = ""
    category: str = "general"


class NewsEditRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None


@router.get("/news")
async def get_news_admin(request: Request, page: int = 1):
    """List all news articles - rank 12+"""
    user = await get_staff_user(request)
    require_rank(12)(user)

    pool = await get_pool()
    limit = 20
    offset = (page - 1) * limit

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id, title, content, image_url, author, category, created_at FROM news ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (limit, offset)
            )
            articles = []
            for r in await cur.fetchall():
                articles.append({
                    "id": r[0], "title": r[1], "content": r[2][:200],
                    "image_url": r[3], "author": r[4], "category": r[5],
                    "created_at": r[6],
                })

            await cur.execute("SELECT COUNT(*) FROM news")
            total = (await cur.fetchone())[0]

    return {"articles": articles, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}


@router.post("/news")
async def create_news(req: NewsCreateRequest, request: Request):
    """Create news article - rank 12+"""
    user = await get_staff_user(request)
    require_rank(12)(user)

    if not req.title.strip() or not req.content.strip():
        raise HTTPException(400, "Title and content are required")

    now = int(time.time())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO news (title, content, image_url, author, category, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
                (req.title.strip(), req.content.strip(), req.image_url, user["username"], req.category, now)
            )
        await conn.commit()

    return {"ok": True, "message": "Article published"}


@router.put("/news/{article_id}")
async def edit_news(article_id: int, req: NewsEditRequest, request: Request):
    """Edit news article - rank 12+"""
    user = await get_staff_user(request)
    require_rank(12)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT id FROM news WHERE id = %s", (article_id,))
            if not await cur.fetchone():
                raise HTTPException(404, "Article not found")

            updates = []
            params = []
            if req.title is not None:
                updates.append("title = %s")
                params.append(req.title.strip())
            if req.content is not None:
                updates.append("content = %s")
                params.append(req.content.strip())
            if req.image_url is not None:
                updates.append("image_url = %s")
                params.append(req.image_url)
            if req.category is not None:
                updates.append("category = %s")
                params.append(req.category)

            if not updates:
                raise HTTPException(400, "No fields to update")

            params.append(article_id)
            await cur.execute(
                f"UPDATE news SET {', '.join(updates)} WHERE id = %s",
                tuple(params)
            )
        await conn.commit()

    return {"ok": True, "message": "Article updated"}


@router.delete("/news/{article_id}")
async def delete_news(article_id: int, request: Request):
    """Delete news article - rank 12+"""
    user = await get_staff_user(request)
    require_rank(12)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM news WHERE id = %s", (article_id,))
            # Also clean up comments and reactions
            await cur.execute("DELETE FROM news_comments WHERE article_id = %s", (article_id,))
            await cur.execute("DELETE FROM news_reactions WHERE article_id = %s", (article_id,))
        await conn.commit()

    return {"ok": True, "message": "Article deleted"}


# ==================== ROOM MANAGEMENT (Rank 11+) ====================

@router.get("/rooms")
async def get_rooms(request: Request, page: int = 1, q: str = ""):
    """List/search rooms - rank 11+"""
    user = await get_staff_user(request)
    require_rank(11)(user)

    pool = await get_pool()
    limit = 20
    offset = (page - 1) * limit

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            if q:
                await cur.execute(
                    "SELECT r.id, r.name, r.owner_id, r.owner_name, r.description, r.users, r.users_max, r.state "
                    "FROM rooms r WHERE r.name LIKE %s OR r.owner_name LIKE %s "
                    "ORDER BY r.users DESC, r.id DESC LIMIT %s OFFSET %s",
                    (f"%{q}%", f"%{q}%", limit, offset)
                )
            else:
                await cur.execute(
                    "SELECT r.id, r.name, r.owner_id, r.owner_name, r.description, r.users, r.users_max, r.state "
                    "FROM rooms r ORDER BY r.users DESC, r.id DESC LIMIT %s OFFSET %s",
                    (limit, offset)
                )

            rooms = []
            for r in await cur.fetchall():
                rooms.append({
                    "id": r[0], "name": r[1], "owner_id": r[2], "owner_name": r[3],
                    "description": r[4], "users": r[5], "users_max": r[6],
                    "state": r[7],
                })

            if q:
                await cur.execute(
                    "SELECT COUNT(*) FROM rooms WHERE name LIKE %s OR owner_name LIKE %s",
                    (f"%{q}%", f"%{q}%")
                )
            else:
                await cur.execute("SELECT COUNT(*) FROM rooms")
            total = (await cur.fetchone())[0]

    return {"rooms": rooms, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}


@router.delete("/rooms/{room_id}")
async def delete_room(room_id: int, request: Request):
    """Delete a room - rank 13+"""
    user = await get_staff_user(request)
    require_rank(13)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM rooms WHERE id = %s", (room_id,))
        await conn.commit()

    return {"ok": True, "message": "Room deleted"}


# ==================== MODERATION LOG (Rank 10+) ====================

@router.get("/modlogs")
async def get_mod_logs(request: Request, page: int = 1):
    """Get moderation logs - rank 10+"""
    user = await get_staff_user(request)
    require_rank(10)(user)

    pool = await get_pool()
    limit = 30
    offset = (page - 1) * limit

    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            logs = []
            total = 0
            try:
                await cur.execute(
                    "SELECT l.id, l.type, l.timestamp, l.user_id, l.target_id, l.extra_data, "
                    "u.username as user_name, t.username as target_name "
                    "FROM commandlogs l "
                    "LEFT JOIN users u ON l.user_id = u.id "
                    "LEFT JOIN users t ON l.target_id = t.id "
                    "ORDER BY l.timestamp DESC LIMIT %s OFFSET %s",
                    (limit, offset)
                )
                for r in await cur.fetchall():
                    logs.append({
                        "id": r[0], "type": r[1], "timestamp": r[2],
                        "user_id": r[3], "target_id": r[4], "extra_data": r[5],
                        "user_name": r[6] or "System", "target_name": r[7] or "N/A",
                    })
                await cur.execute("SELECT COUNT(*) FROM commandlogs")
                total = (await cur.fetchone())[0]
            except Exception:
                # commandlogs table may not exist
                pass

    return {"logs": logs, "total": total, "page": page, "pages": max(1, (total + limit - 1) // limit)}


# ==================== SITE SETTINGS (Rank 14+ / President+) ====================

class SettingUpdateRequest(BaseModel):
    key: str
    value: str


@router.get("/settings")
async def get_settings(request: Request):
    """Get site settings - rank 14+ (President+)"""
    user = await get_staff_user(request)
    require_rank(14)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("SELECT `key`, value FROM site_settings")
            settings = {}
            for r in await cur.fetchall():
                settings[r[0]] = r[1]

            # Also get emulator settings
            emu_settings = {}
            try:
                await cur.execute("SELECT `key`, value FROM emulator_settings LIMIT 50")
                for r in await cur.fetchall():
                    emu_settings[r[0]] = r[1]
            except Exception:
                pass

    return {"site_settings": settings, "emulator_settings": emu_settings}


@router.put("/settings")
async def update_setting(req: SettingUpdateRequest, request: Request):
    """Update a site setting - rank 14+ (President+)"""
    user = await get_staff_user(request)
    require_rank(14)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO site_settings (`key`, value) VALUES (%s, %s) ON DUPLICATE KEY UPDATE value = %s",
                (req.key, req.value, req.value)
            )
        await conn.commit()

    return {"ok": True, "message": "Setting updated"}


# ==================== CATALOG MANAGEMENT (Rank 12+) ====================

@router.get("/catalog")
async def get_catalog_pages(request: Request, parent_id: int = -1):
    """Get catalog pages - rank 12+"""
    user = await get_staff_user(request)
    require_rank(12)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT id, parent_id, caption, visible, enabled, min_rank, icon_image, order_num "
                "FROM catalog_pages WHERE parent_id = %s ORDER BY order_num ASC, id ASC",
                (parent_id,)
            )
            pages = []
            for r in await cur.fetchall():
                pages.append({
                    "id": r[0], "parent_id": r[1], "caption": r[2],
                    "visible": r[3], "enabled": r[4], "min_rank": r[5],
                    "icon_image": r[6], "order_num": r[7],
                })

    return {"pages": pages}


@router.put("/catalog/pages/{page_id}")
async def edit_catalog_page(page_id: int, request: Request):
    """Edit catalog page - rank 12+"""
    user = await get_staff_user(request)
    require_rank(12)(user)

    body = await request.json()
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            updates = []
            params = []
            for field in ["caption", "visible", "enabled", "min_rank", "order_num"]:
                if field in body:
                    updates.append(f"`{field}` = %s")
                    params.append(body[field])
            if updates:
                params.append(page_id)
                await cur.execute(
                    f"UPDATE catalog_pages SET {', '.join(updates)} WHERE id = %s",
                    tuple(params)
                )
            await conn.commit()

    return {"ok": True, "message": "Catalog page updated"}


# ==================== EVENTS MANAGEMENT (Rank 8+) ====================

class EventCreateRequest(BaseModel):
    name: str
    description: str = ""
    type: str = "competition"
    reward_credits: int = 0
    reward_pixels: int = 0


class EventCompleteRequest(BaseModel):
    winner_user_id: int


@router.get("/events")
async def get_events(request: Request):
    """List all events - rank 8+"""
    user = await get_staff_user(request)
    require_rank(8)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "SELECT e.id, e.name, e.description, e.type, e.status, e.reward_credits, e.reward_pixels, "
                "e.winner_user_id, e.created_by, e.created_at, e.completed_at, "
                "w.username as winner_username, c.username as creator_username "
                "FROM habplus_events e "
                "LEFT JOIN users w ON e.winner_user_id = w.id "
                "LEFT JOIN users c ON e.created_by = c.id "
                "ORDER BY e.created_at DESC"
            )
            events = []
            for r in await cur.fetchall():
                events.append({
                    "id": r[0], "name": r[1], "description": r[2], "type": r[3],
                    "status": r[4], "reward_credits": r[5], "reward_pixels": r[6],
                    "winner_user_id": r[7], "created_by": r[8], "created_at": r[9],
                    "completed_at": r[10], "winner_username": r[11], "creator_username": r[12],
                })

    return {"events": events}


@router.post("/events")
async def create_event(req: EventCreateRequest, request: Request):
    """Create an event - rank 8+"""
    user = await get_staff_user(request)
    require_rank(8)(user)

    now = int(time.time())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute(
                "INSERT INTO habplus_events (name, description, type, status, reward_credits, reward_pixels, created_by, created_at) "
                "VALUES (%s, %s, %s, 'active', %s, %s, %s, %s)",
                (req.name, req.description, req.type, req.reward_credits, req.reward_pixels, user["id"], now)
            )
        await conn.commit()

    return {"ok": True, "message": "Event created!"}


@router.post("/events/{event_id}/complete")
async def complete_event(event_id: int, req: EventCompleteRequest, request: Request):
    """Complete an event and reward the winner - rank 8+"""
    user = await get_staff_user(request)
    require_rank(8)(user)

    now = int(time.time())
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Check event exists and is active
            await cur.execute("SELECT status, reward_credits, reward_pixels FROM habplus_events WHERE id = %s", (event_id,))
            evt = await cur.fetchone()
            if not evt:
                raise HTTPException(404, "Event not found")
            if evt[0] != "active":
                raise HTTPException(400, "Event is not active")

            # Check winner exists
            await cur.execute("SELECT id, username FROM users WHERE id = %s", (req.winner_user_id,))
            winner = await cur.fetchone()
            if not winner:
                raise HTTPException(404, "Winner user not found")

            # Mark event as completed
            await cur.execute(
                "UPDATE habplus_events SET status = 'completed', winner_user_id = %s, completed_at = %s WHERE id = %s",
                (req.winner_user_id, now, event_id)
            )

            # Reward the winner
            if evt[1] > 0:  # credits
                await cur.execute("UPDATE users SET credits = credits + %s WHERE id = %s", (evt[1], req.winner_user_id))
            if evt[2] > 0:  # pixels
                await cur.execute("UPDATE users SET pixels = pixels + %s WHERE id = %s", (evt[2], req.winner_user_id))

        await conn.commit()

    return {"ok": True, "message": f"Event completed! {winner[1]} has been rewarded."}


@router.delete("/events/{event_id}")
async def delete_event(event_id: int, request: Request):
    """Delete an event - rank 9+"""
    user = await get_staff_user(request)
    require_rank(9)(user)

    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            await cur.execute("DELETE FROM habplus_events WHERE id = %s", (event_id,))
        await conn.commit()

    return {"ok": True, "message": "Event deleted"}


# ==================== C_IMAGES LISTING (for news image picker) ====================

STATIC_DIR = Path(__file__).parent.parent.parent / "static"
C_IMAGES_CATALOGUE_DIR = STATIC_DIR / "c_images" / "catalogue"


@router.get("/c-images")
async def list_c_images(request: Request, folder: str = "catalogue", q: str = "", page: int = 1, per_page: int = 80):
    """List available c_images for the news image picker - rank 6+"""
    user = await get_staff_user(request)

    base_dir = STATIC_DIR / "c_images"
    target_dir = base_dir / folder

    if not target_dir.is_dir():
        return {"images": [], "total": 0, "page": 1, "pages": 1, "folders": []}

    # List subfolders
    folders = sorted([f.name for f in base_dir.iterdir() if f.is_dir()])

    # List image files
    all_images = sorted([
        f.name for f in target_dir.iterdir()
        if f.is_file() and f.suffix.lower() in (".png", ".gif", ".jpg", ".jpeg")
    ])

    # Filter by search query
    if q:
        q_lower = q.lower()
        all_images = [img for img in all_images if q_lower in img.lower()]

    total = len(all_images)
    pages = max(1, (total + per_page - 1) // per_page)
    page = max(1, min(page, pages))
    start = (page - 1) * per_page
    page_images = all_images[start:start + per_page]

    # Return URL paths relative to site root
    image_urls = [f"/c_images/{folder}/{img}" for img in page_images]

    return {
        "images": image_urls,
        "filenames": page_images,
        "total": total,
        "page": page,
        "pages": pages,
        "folders": folders,
    }
