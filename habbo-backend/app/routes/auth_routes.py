from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import time

from app.database import get_db
from app.auth import hash_password, verify_password, create_token, decode_token, generate_sso_ticket

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    username: str
    password: str
    email: str
    gender: str = "M"


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    token: str
    username: str
    user_id: int


@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db=Depends(get_db)):
    conn, cur = db
    # Validate
    if len(req.username) < 3 or len(req.username) > 20:
        raise HTTPException(400, "Username must be 3-20 characters")
    if len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if not req.email or "@" not in req.email:
        raise HTTPException(400, "Invalid email address")

    # Check existing user
    await cur.execute("SELECT id FROM users WHERE username = %s", (req.username,))
    if await cur.fetchone():
        raise HTTPException(400, "Username already taken")

    await cur.execute("SELECT id FROM users WHERE mail = %s", (req.email,))
    if await cur.fetchone():
        raise HTTPException(400, "Email already registered")

    now = int(time.time())
    hashed = hash_password(req.password)

    default_look = "hr-115-42.hd-195-19.ch-3030-82.lg-275-1408.fa-1201.ca-1804-64"
    if req.gender == "F":
        default_look = "hr-515-33.hd-600-1.ch-665-71.lg-696-82.sh-735-68"

    await cur.execute(
        """INSERT INTO users (username, real_name, password, mail, gender, look, account_created, last_login, last_online, motto, ip_register, ip_current, `rank`, credits, pixels, points)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
        (req.username, req.username, hashed, req.email, req.gender, default_look, now, now, now, "I am new here!", "127.0.0.1", "127.0.0.1", 1, 500, 200, 10)
    )
    user_id = cur.lastrowid

    # Give starting duckets (type 0) and diamonds (type 5) in users_currency
    await cur.execute(
        "INSERT INTO users_currency (user_id, type, amount) VALUES (%s, 0, 200), (%s, 5, 10)",
        (user_id, user_id)
    )

    # Give default badge
    await cur.execute(
        "INSERT INTO users_badges (user_id, badge_code, slot_id) VALUES (%s, %s, %s)",
        (user_id, "ACH_RegistrationDuration1", 1)
    )

    token = create_token(user_id, req.username)
    return TokenResponse(token=token, username=req.username, user_id=user_id)


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, db=Depends(get_db)):
    conn, cur = db
    await cur.execute("SELECT id, username, password FROM users WHERE username = %s", (req.username,))
    row = await cur.fetchone()
    if not row:
        raise HTTPException(401, "Invalid username or password")

    user_id, username, hashed_pw = row["id"], row["username"], row["password"]

    if not verify_password(req.password, hashed_pw):
        raise HTTPException(401, "Invalid username or password")

    # Update last login
    now = int(time.time())
    await cur.execute("UPDATE users SET last_login = %s, last_online = %s WHERE id = %s", (now, now, user_id))

    token = create_token(user_id, username)
    return TokenResponse(token=token, username=username, user_id=user_id)


@router.get("/me")
async def get_me(request: Request, db=Depends(get_db)):
    conn, cur = db
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    await cur.execute(
        """SELECT u.id, u.username, u.mail, u.motto, u.look, u.credits, u.pixels,
                  COALESCE(uc.amount, 0) as diamonds,
                  u.`rank`, u.online, u.gender, u.account_created, u.last_login, u.last_online, u.home_room
           FROM users u LEFT JOIN users_currency uc ON u.id = uc.user_id AND uc.type = 5
           WHERE u.id = %s""",
        (payload["user_id"],)
    )
    row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "User not found")

    # Get badges
    await cur.execute(
        "SELECT badge_code, slot_id FROM users_badges WHERE user_id = %s", (payload["user_id"],)
    )
    badges = [{"badge_code": b["badge_code"], "slot": b["slot_id"]} for b in await cur.fetchall()]

    return {
        "id": row["id"],
        "username": row["username"],
        "mail": row["mail"],
        "motto": row["motto"],
        "look": row["look"],
        "credits": row["credits"],
        "pixels": row["pixels"],
        "diamonds": row["diamonds"],
        "rank": row["rank"],
        "online": row["online"],
        "gender": row["gender"],
        "account_created": row["account_created"],
        "last_login": row["last_login"],
        "last_online": row["last_online"],
        "home_room": row["home_room"],
        "badges": badges,
    }


@router.put("/me/motto")
async def update_motto(request: Request, db=Depends(get_db)):
    conn, cur = db
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    body = await request.json()
    motto = body.get("motto", "")
    if len(motto) > 50:
        raise HTTPException(400, "Motto must be 50 characters or less")

    await cur.execute("UPDATE users SET motto = %s WHERE id = %s", (motto, payload["user_id"]))
    return {"message": "Motto updated", "motto": motto}


@router.put("/me/password")
async def change_password(request: Request, db=Depends(get_db)):
    conn, cur = db
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    body = await request.json()
    current_password = body.get("current_password", "")
    new_password = body.get("new_password", "")

    if len(new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")

    await cur.execute("SELECT password FROM users WHERE id = %s", (payload["user_id"],))
    row = await cur.fetchone()
    if not row:
        raise HTTPException(404, "User not found")

    if not verify_password(current_password, row["password"]):
        raise HTTPException(400, "Current password is incorrect")

    hashed = hash_password(new_password)
    await cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed, payload["user_id"]))
    return {"message": "Password changed successfully"}


@router.put("/me/email")
async def change_email(request: Request, db=Depends(get_db)):
    conn, cur = db
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    body = await request.json()
    new_email = body.get("email", "")

    if not new_email or "@" not in new_email:
        raise HTTPException(400, "Invalid email address")

    # Check if email already taken
    await cur.execute("SELECT id FROM users WHERE mail = %s AND id != %s", (new_email, payload["user_id"]))
    if await cur.fetchone():
        raise HTTPException(400, "Email already in use by another account")

    await cur.execute("UPDATE users SET mail = %s WHERE id = %s", (new_email, payload["user_id"]))
    return {"message": "Email updated successfully", "email": new_email}


@router.post("/forgot-password")
async def forgot_password(request: Request, db=Depends(get_db)):
    conn, cur = db
    body = await request.json()
    username = body.get("username", "")
    email = body.get("email", "")
    new_password = body.get("new_password", "")

    if not username or not email:
        raise HTTPException(400, "Username and email are required")
    if len(new_password) < 6:
        raise HTTPException(400, "New password must be at least 6 characters")

    await cur.execute(
        "SELECT id FROM users WHERE username = %s AND mail = %s",
        (username, email)
    )
    row = await cur.fetchone()
    if not row:
        raise HTTPException(400, "No account found with that username and email combination")

    hashed = hash_password(new_password)
    await cur.execute("UPDATE users SET password = %s WHERE id = %s", (hashed, row["id"]))
    return {"message": "Password has been reset successfully. You can now log in with your new password."}


@router.get("/sso")
async def get_sso_ticket(request: Request, db=Depends(get_db)):
    conn, cur = db
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(401, "Not authenticated")

    token = auth_header.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(401, "Invalid or expired token")

    sso_ticket = generate_sso_ticket()
    await cur.execute("UPDATE users SET auth_ticket = %s WHERE id = %s", (sso_ticket, payload["user_id"]))

    return {"sso_ticket": sso_ticket}
