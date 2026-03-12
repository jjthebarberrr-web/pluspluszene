from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import time
import datetime

from app.database import get_db
from app.auth import decode_token

router = APIRouter(prefix="/api/battlepass", tags=["battlepass"])


def get_user_id(request: Request):
    """Extract user_id from JWT token."""
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")
    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")
    return payload["user_id"]


@router.get("/season")
async def get_active_season(db=Depends(get_db)):
    """Get the currently active battle pass season."""
    conn, cur = db
    await cur.execute(
        "SELECT * FROM battle_pass_seasons WHERE is_active = 1 ORDER BY id DESC LIMIT 1"
    )
    season = await cur.fetchone()
    if not season:
        return {"season": None}

    now = int(time.time())
    days_remaining = max(0, (season["end_date"] - now) // 86400)

    return {
        "season": {
            "id": season["id"],
            "name": season["name"],
            "start_date": season["start_date"],
            "end_date": season["end_date"],
            "max_tier": season["max_tier"],
            "days_remaining": days_remaining,
        }
    }


@router.get("/tiers")
async def get_tiers(db=Depends(get_db)):
    """Get all tiers and their rewards for the active season."""
    conn, cur = db
    await cur.execute(
        "SELECT id FROM battle_pass_seasons WHERE is_active = 1 ORDER BY id DESC LIMIT 1"
    )
    season = await cur.fetchone()
    if not season:
        return {"tiers": []}

    await cur.execute(
        """SELECT tier, reward_type, reward_amount, reward_badge, reward_furni_id,
                  description, xp_required
           FROM battle_pass_tiers WHERE season_id = %s ORDER BY tier ASC""",
        (season["id"],)
    )
    tiers = []
    cumulative_xp = 0
    for row in await cur.fetchall():
        cumulative_xp += row["xp_required"]
        tiers.append({
            "tier": row["tier"],
            "reward_type": row["reward_type"],
            "reward_amount": row["reward_amount"],
            "reward_badge": row["reward_badge"],
            "reward_furni_id": row["reward_furni_id"],
            "description": row["description"],
            "xp_required": row["xp_required"],
            "cumulative_xp": cumulative_xp,
        })
    return {"tiers": tiers}


@router.get("/progress")
async def get_progress(request: Request, db=Depends(get_db)):
    """Get the authenticated user's battle pass progress."""
    user_id = get_user_id(request)
    conn, cur = db

    await cur.execute(
        "SELECT id FROM battle_pass_seasons WHERE is_active = 1 ORDER BY id DESC LIMIT 1"
    )
    season = await cur.fetchone()
    if not season:
        return {"progress": None}

    season_id = season["id"]

    # Get or create user progress
    await cur.execute(
        "SELECT * FROM battle_pass_user_progress WHERE user_id = %s AND season_id = %s",
        (user_id, season_id)
    )
    progress = await cur.fetchone()

    if not progress:
        now = int(time.time())
        today = datetime.date.today().isoformat()
        await cur.execute(
            """INSERT INTO battle_pass_user_progress
               (user_id, season_id, total_xp, current_tier, last_daily_reset, last_weekly_reset, login_streak, last_login_date)
               VALUES (%s, %s, 0, 0, %s, %s, 1, %s)""",
            (user_id, season_id, now, now, today)
        )
        progress = {
            "total_xp": 0,
            "current_tier": 0,
            "login_streak": 1,
            "last_login_date": today,
        }
    else:
        progress = {
            "total_xp": progress["total_xp"],
            "current_tier": progress["current_tier"],
            "login_streak": progress["login_streak"],
            "last_login_date": str(progress["last_login_date"]) if progress["last_login_date"] else None,
        }

    # Get claimed tiers
    await cur.execute(
        "SELECT tier FROM battle_pass_tier_claims WHERE user_id = %s AND season_id = %s",
        (user_id, season_id)
    )
    claimed_tiers = [row["tier"] for row in await cur.fetchall()]

    return {
        "progress": progress,
        "claimed_tiers": claimed_tiers,
    }


@router.get("/tasks")
async def get_tasks(request: Request, db=Depends(get_db)):
    """Get daily and weekly tasks with user's progress on each."""
    user_id = get_user_id(request)
    conn, cur = db

    await cur.execute(
        "SELECT id FROM battle_pass_seasons WHERE is_active = 1 ORDER BY id DESC LIMIT 1"
    )
    season = await cur.fetchone()
    if not season:
        return {"daily": [], "weekly": []}

    season_id = season["id"]
    today = datetime.date.today().isoformat()

    # Get all active tasks
    await cur.execute(
        "SELECT * FROM battle_pass_tasks WHERE season_id = %s AND is_active = 1",
        (season_id,)
    )
    tasks = await cur.fetchall()

    daily_tasks = []
    weekly_tasks = []

    for task in tasks:
        # Get user progress on this task for today (daily) or this week (weekly)
        reset_date = today
        if task["task_type"] == "weekly":
            # Use Monday of current week
            d = datetime.date.today()
            monday = d - datetime.timedelta(days=d.weekday())
            reset_date = monday.isoformat()

        await cur.execute(
            """SELECT progress, completed, claimed FROM battle_pass_user_tasks
               WHERE user_id = %s AND task_id = %s AND reset_date = %s""",
            (user_id, task["id"], reset_date)
        )
        user_task = await cur.fetchone()

        task_data = {
            "id": task["id"],
            "task_key": task["task_key"],
            "description": task["description"],
            "target": task["target"],
            "xp_reward": task["xp_reward"],
            "task_type": task["task_type"],
            "progress": user_task["progress"] if user_task else 0,
            "completed": bool(user_task["completed"]) if user_task else False,
            "claimed": bool(user_task["claimed"]) if user_task else False,
        }

        if task["task_type"] == "daily":
            daily_tasks.append(task_data)
        else:
            weekly_tasks.append(task_data)

    return {"daily": daily_tasks, "weekly": weekly_tasks}


@router.post("/tasks/{task_id}/progress")
async def update_task_progress(task_id: int, request: Request, db=Depends(get_db)):
    """Update progress on a specific task (increment by amount)."""
    user_id = get_user_id(request)
    conn, cur = db
    body = await request.json()
    amount = body.get("amount", 1)

    await cur.execute(
        "SELECT id FROM battle_pass_seasons WHERE is_active = 1 ORDER BY id DESC LIMIT 1"
    )
    season = await cur.fetchone()
    if not season:
        raise HTTPException(404, "No active season")

    season_id = season["id"]

    # Get the task
    await cur.execute("SELECT * FROM battle_pass_tasks WHERE id = %s AND season_id = %s", (task_id, season_id))
    task = await cur.fetchone()
    if not task:
        raise HTTPException(404, "Task not found")

    today = datetime.date.today().isoformat()
    reset_date = today
    if task["task_type"] == "weekly":
        d = datetime.date.today()
        monday = d - datetime.timedelta(days=d.weekday())
        reset_date = monday.isoformat()

    # Upsert user task progress
    await cur.execute(
        """INSERT INTO battle_pass_user_tasks (user_id, season_id, task_id, progress, completed, claimed, reset_date)
           VALUES (%s, %s, %s, %s, 0, 0, %s)
           ON DUPLICATE KEY UPDATE progress = LEAST(progress + %s, %s)""",
        (user_id, season_id, task_id, min(amount, task["target"]), reset_date, amount, task["target"])
    )

    # Check if task is now completed
    await cur.execute(
        "SELECT progress, completed FROM battle_pass_user_tasks WHERE user_id = %s AND task_id = %s AND reset_date = %s",
        (user_id, task_id, reset_date)
    )
    user_task = await cur.fetchone()

    if user_task and user_task["progress"] >= task["target"] and not user_task["completed"]:
        await cur.execute(
            "UPDATE battle_pass_user_tasks SET completed = 1 WHERE user_id = %s AND task_id = %s AND reset_date = %s",
            (user_id, task_id, reset_date)
        )

    return {
        "progress": user_task["progress"] if user_task else 0,
        "completed": user_task["progress"] >= task["target"] if user_task else False,
        "target": task["target"],
    }


@router.post("/tasks/{task_id}/claim")
async def claim_task_reward(task_id: int, request: Request, db=Depends(get_db)):
    """Claim XP reward for a completed task."""
    user_id = get_user_id(request)
    conn, cur = db

    await cur.execute(
        "SELECT id FROM battle_pass_seasons WHERE is_active = 1 ORDER BY id DESC LIMIT 1"
    )
    season = await cur.fetchone()
    if not season:
        raise HTTPException(404, "No active season")

    season_id = season["id"]

    # Get the task
    await cur.execute("SELECT * FROM battle_pass_tasks WHERE id = %s AND season_id = %s", (task_id, season_id))
    task = await cur.fetchone()
    if not task:
        raise HTTPException(404, "Task not found")

    today = datetime.date.today().isoformat()
    reset_date = today
    if task["task_type"] == "weekly":
        d = datetime.date.today()
        monday = d - datetime.timedelta(days=d.weekday())
        reset_date = monday.isoformat()

    # Check task is completed and not claimed
    await cur.execute(
        "SELECT * FROM battle_pass_user_tasks WHERE user_id = %s AND task_id = %s AND reset_date = %s",
        (user_id, task_id, reset_date)
    )
    user_task = await cur.fetchone()

    if not user_task or not user_task["completed"]:
        raise HTTPException(400, "Task not yet completed")
    if user_task["claimed"]:
        raise HTTPException(400, "Reward already claimed")

    # Mark as claimed
    await cur.execute(
        "UPDATE battle_pass_user_tasks SET claimed = 1 WHERE user_id = %s AND task_id = %s AND reset_date = %s",
        (user_id, task_id, reset_date)
    )

    # Award XP
    xp_reward = task["xp_reward"]
    await cur.execute(
        """INSERT INTO battle_pass_user_progress (user_id, season_id, total_xp, current_tier, last_daily_reset, last_weekly_reset, login_streak, last_login_date)
           VALUES (%s, %s, %s, 0, %s, %s, 0, NULL)
           ON DUPLICATE KEY UPDATE total_xp = total_xp + %s""",
        (user_id, season_id, xp_reward, int(time.time()), int(time.time()), xp_reward)
    )

    # Recalculate tier
    await _recalculate_tier(cur, user_id, season_id)

    # Get updated progress
    await cur.execute(
        "SELECT total_xp, current_tier FROM battle_pass_user_progress WHERE user_id = %s AND season_id = %s",
        (user_id, season_id)
    )
    progress = await cur.fetchone()

    return {
        "xp_earned": xp_reward,
        "total_xp": progress["total_xp"],
        "current_tier": progress["current_tier"],
    }


@router.post("/tiers/{tier}/claim")
async def claim_tier_reward(tier: int, request: Request, db=Depends(get_db)):
    """Claim the reward for reaching a specific tier."""
    user_id = get_user_id(request)
    conn, cur = db

    await cur.execute(
        "SELECT id, max_tier FROM battle_pass_seasons WHERE is_active = 1 ORDER BY id DESC LIMIT 1"
    )
    season = await cur.fetchone()
    if not season:
        raise HTTPException(404, "No active season")

    season_id = season["id"]

    if tier < 1 or tier > season["max_tier"]:
        raise HTTPException(400, "Invalid tier")

    # Check user has reached this tier
    await cur.execute(
        "SELECT current_tier FROM battle_pass_user_progress WHERE user_id = %s AND season_id = %s",
        (user_id, season_id)
    )
    progress = await cur.fetchone()
    if not progress or progress["current_tier"] < tier:
        raise HTTPException(400, "You haven't reached this tier yet")

    # Check not already claimed
    await cur.execute(
        "SELECT id FROM battle_pass_tier_claims WHERE user_id = %s AND season_id = %s AND tier = %s",
        (user_id, season_id, tier)
    )
    if await cur.fetchone():
        raise HTTPException(400, "Tier reward already claimed")

    # Get tier reward info
    await cur.execute(
        "SELECT * FROM battle_pass_tiers WHERE season_id = %s AND tier = %s",
        (season_id, tier)
    )
    tier_info = await cur.fetchone()
    if not tier_info:
        raise HTTPException(404, "Tier not found")

    # Award the reward
    reward_type = tier_info["reward_type"]
    reward_amount = tier_info["reward_amount"]

    if reward_type == "credits":
        await cur.execute(
            "UPDATE users SET credits = credits + %s WHERE id = %s",
            (reward_amount, user_id)
        )
    elif reward_type == "duckets":
        await cur.execute(
            "UPDATE users SET pixels = pixels + %s WHERE id = %s",
            (reward_amount, user_id)
        )
        # Also update users_currency type 0
        await cur.execute(
            """INSERT INTO users_currency (user_id, type, amount) VALUES (%s, 0, %s)
               ON DUPLICATE KEY UPDATE amount = amount + %s""",
            (user_id, reward_amount, reward_amount)
        )
    elif reward_type == "diamonds":
        await cur.execute(
            "UPDATE users SET points = points + %s WHERE id = %s",
            (reward_amount, user_id)
        )
        await cur.execute(
            """INSERT INTO users_currency (user_id, type, amount) VALUES (%s, 5, %s)
               ON DUPLICATE KEY UPDATE amount = amount + %s""",
            (user_id, reward_amount, reward_amount)
        )
    elif reward_type == "badge" and tier_info["reward_badge"]:
        await cur.execute(
            """INSERT IGNORE INTO users_badges (user_id, badge_code, slot_id)
               VALUES (%s, %s, 0)""",
            (user_id, tier_info["reward_badge"])
        )

    # Record the claim
    now = int(time.time())
    await cur.execute(
        "INSERT INTO battle_pass_tier_claims (user_id, season_id, tier, claimed_at) VALUES (%s, %s, %s, %s)",
        (user_id, season_id, tier, now)
    )

    return {
        "tier": tier,
        "reward_type": reward_type,
        "reward_amount": reward_amount,
        "description": tier_info["description"],
    }


@router.post("/login")
async def record_daily_login(request: Request, db=Depends(get_db)):
    """Record a daily login for the battle pass. Call this when user logs into the client."""
    user_id = get_user_id(request)
    conn, cur = db

    await cur.execute(
        "SELECT id FROM battle_pass_seasons WHERE is_active = 1 ORDER BY id DESC LIMIT 1"
    )
    season = await cur.fetchone()
    if not season:
        return {"message": "No active season", "xp_earned": 0}

    season_id = season["id"]
    today = datetime.date.today()
    today_str = today.isoformat()
    now = int(time.time())

    # Get or create user progress
    await cur.execute(
        "SELECT * FROM battle_pass_user_progress WHERE user_id = %s AND season_id = %s",
        (user_id, season_id)
    )
    progress = await cur.fetchone()

    if not progress:
        await cur.execute(
            """INSERT INTO battle_pass_user_progress
               (user_id, season_id, total_xp, current_tier, last_daily_reset, last_weekly_reset, login_streak, last_login_date)
               VALUES (%s, %s, 0, 0, %s, %s, 1, %s)""",
            (user_id, season_id, now, now, today_str)
        )
        login_streak = 1
        already_logged_today = False
    else:
        last_login = progress["last_login_date"]
        already_logged_today = (str(last_login) == today_str) if last_login else False

        if already_logged_today:
            return {
                "message": "Already logged in today",
                "login_streak": progress["login_streak"],
                "xp_earned": 0,
            }

        # Calculate login streak
        yesterday = (today - datetime.timedelta(days=1)).isoformat()
        if str(last_login) == yesterday:
            login_streak = progress["login_streak"] + 1
        else:
            login_streak = 1

        await cur.execute(
            "UPDATE battle_pass_user_progress SET login_streak = %s, last_login_date = %s WHERE user_id = %s AND season_id = %s",
            (login_streak, today_str, user_id, season_id)
        )

    # Auto-complete the daily_login task
    await cur.execute(
        "SELECT id FROM battle_pass_tasks WHERE season_id = %s AND task_key = 'daily_login' AND is_active = 1",
        (season_id,)
    )
    login_task = await cur.fetchone()
    xp_earned = 0

    if login_task:
        await cur.execute(
            """INSERT INTO battle_pass_user_tasks (user_id, season_id, task_id, progress, completed, claimed, reset_date)
               VALUES (%s, %s, %s, 1, 1, 0, %s)
               ON DUPLICATE KEY UPDATE progress = 1, completed = 1""",
            (user_id, season_id, login_task["id"], today_str)
        )

    # Auto-update login_streak weekly task
    await cur.execute(
        "SELECT id, target FROM battle_pass_tasks WHERE season_id = %s AND task_key = 'login_streak' AND is_active = 1",
        (season_id,)
    )
    streak_task = await cur.fetchone()
    if streak_task:
        d = datetime.date.today()
        monday = d - datetime.timedelta(days=d.weekday())
        reset_date = monday.isoformat()
        completed = 1 if login_streak >= streak_task["target"] else 0
        await cur.execute(
            """INSERT INTO battle_pass_user_tasks (user_id, season_id, task_id, progress, completed, claimed, reset_date)
               VALUES (%s, %s, %s, %s, %s, 0, %s)
               ON DUPLICATE KEY UPDATE progress = %s, completed = %s""",
            (user_id, season_id, streak_task["id"], login_streak, completed, reset_date, login_streak, completed)
        )

    return {
        "message": "Daily login recorded!",
        "login_streak": login_streak,
        "xp_earned": xp_earned,
    }


async def _recalculate_tier(cur, user_id: int, season_id: int):
    """Recalculate user's current tier based on total XP."""
    await cur.execute(
        "SELECT total_xp FROM battle_pass_user_progress WHERE user_id = %s AND season_id = %s",
        (user_id, season_id)
    )
    progress = await cur.fetchone()
    if not progress:
        return

    total_xp = progress["total_xp"]

    # Get tiers ordered by tier number
    await cur.execute(
        "SELECT tier, xp_required FROM battle_pass_tiers WHERE season_id = %s ORDER BY tier ASC",
        (season_id,)
    )
    tiers = await cur.fetchall()

    cumulative_xp = 0
    new_tier = 0
    for t in tiers:
        cumulative_xp += t["xp_required"]
        if total_xp >= cumulative_xp:
            new_tier = t["tier"]
        else:
            break

    await cur.execute(
        "UPDATE battle_pass_user_progress SET current_tier = %s WHERE user_id = %s AND season_id = %s",
        (new_tier, user_id, season_id)
    )
