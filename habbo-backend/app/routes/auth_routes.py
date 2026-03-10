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
        (req.username, req.username, hashed, req.email, req.gender, default_look, now, now, now, "I am new here!", "127.0.0.1", "127.0.0.1", 1, 50000, 50000, 50000)
    )
    user_id = cur.lastrowid

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
        """SELECT id, username, mail, motto, look, credits, pixels, points,
                  `rank`, online, gender, account_created, last_login, last_online, home_room
           FROM users WHERE id = %s""",
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
        "diamonds": row["points"],
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
