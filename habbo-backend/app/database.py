import aiomysql
import os

MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "arcturus")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "arcturus123")
MYSQL_DB = os.getenv("MYSQL_DB", "arcturus")

_pool = None


async def get_pool():
    global _pool
    if _pool is None:
        _pool = await aiomysql.create_pool(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            db=MYSQL_DB,
            autocommit=True,
            minsize=2,
            maxsize=10,
        )
    return _pool


async def get_db():
    pool = await get_pool()
    conn = await pool.acquire()
    cur = await conn.cursor(aiomysql.DictCursor)
    try:
        yield conn, cur
    finally:
        await cur.close()
        pool.release(conn)


async def init_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            # Create CMS-specific tables that Arcturus doesn't have
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS news (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    image_url VARCHAR(500) DEFAULT '',
                    author VARCHAR(100) DEFAULT 'Admin',
                    category VARCHAR(50) DEFAULT 'general',
                    created_at INT DEFAULT 0
                )
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS community_posts (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT NOT NULL,
                    username VARCHAR(100) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    category VARCHAR(50) DEFAULT 'general',
                    likes INT DEFAULT 0,
                    created_at INT DEFAULT 0
                )
            """)
            await cur.execute("""
                CREATE TABLE IF NOT EXISTS site_settings (
                    `key` VARCHAR(100) PRIMARY KEY,
                    value TEXT NOT NULL
                )
            """)

            # Insert default news if empty
            await cur.execute("SELECT COUNT(*) as cnt FROM news")
            row = await cur.fetchone()
            if row[0] == 0:
                import time
                now = int(time.time())
                news_data = [
                    ("Welcome to HabPlus!", "We are excited to launch our brand new Habbo retro hotel! Join us for amazing events, rare furni, and a fantastic community. Register now and start your adventure!", "", "Admin", "announcement", now),
                    ("Double Credits Weekend!", "This weekend all users will receive double credits! Log in and enjoy the bonus. Don't miss out on this amazing opportunity to furnish your rooms!", "", "Admin", "event", now - 86400),
                    ("New Rare Furni Released", "Check out the latest collection of rare furniture items now available in the catalog. Limited edition items won't last long!", "", "Admin", "update", now - 172800),
                    ("Staff Applications Open", "We are looking for dedicated staff members to join our team. If you think you have what it takes, apply now through the community page!", "", "Admin", "announcement", now - 259200),
                ]
                for n in news_data:
                    await cur.execute(
                        "INSERT INTO news (title, content, image_url, author, category, created_at) VALUES (%s, %s, %s, %s, %s, %s)",
                        n
                    )

            # Insert default settings if empty
            await cur.execute("SELECT COUNT(*) as cnt FROM site_settings")
            row = await cur.fetchone()
            if row[0] == 0:
                settings = [
                    ("hotel_name", "HabPlus"),
                    ("hotel_description", "The best Habbo retro experience"),
                    ("max_users_online", "0"),
                    ("users_online", "0"),
                ]
                for s in settings:
                    await cur.execute(
                        "INSERT INTO site_settings (`key`, value) VALUES (%s, %s)",
                        s
                    )
        await conn.commit()
