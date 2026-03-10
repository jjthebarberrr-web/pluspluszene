# HabboRetro - Full Habbo Hotel Clone

A complete Habbo retro hotel with CMS, Nitro HTML5 client, and Arcturus Morningstar backend.

## Features
- **CMS**: Login, Register, Profile (Me), Community, News pages
- **Nitro HTML5 Client**: Play directly in the browser - no Flash needed
- **Arcturus Morningstar 3.5.1**: Full game server with rooms, furniture, catalogue
- **Asset Proxy**: Local c_images + multi-CDN fallback for all game assets

## Prerequisites
- **Java 17+** (for Arcturus Morningstar)
- **Python 3.10+** with **Poetry** (for CMS backend)
- **MySQL 8.0+** (shared database for Arcturus and CMS)
- **Node.js 18+** (only needed if rebuilding frontend)

## Quick Start

### Linux/Mac
```bash
chmod +x start.sh stop.sh
./start.sh
```

### Windows
```
start.bat
```

### Manual Setup
1. **Import MySQL database**: `mysql -u root -p < arcturus-server/arcturus_base.sql`
2. **Create MySQL user**: 
   ```sql
   CREATE USER 'arcturus'@'localhost' IDENTIFIED BY 'arcturus123';
   GRANT ALL ON arcturus.* TO 'arcturus'@'localhost';
   ```
3. **Fix MySQL sql_mode**: `SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));`
4. **Start Arcturus**: `cd arcturus-server && java -jar Arcturus.jar`
5. **Install backend deps**: `cd habbo-backend && poetry install`
6. **Start backend**: `cd habbo-backend && poetry run fastapi dev app/main.py --port 8000`

## Access
- **Website**: http://localhost:8000
- **Hotel Client**: http://localhost:8000/client
- **Test Account**: `TestPlayer` / `password123` (50,000 credits/pixels/diamonds)

## Architecture
```
habbo-retro/
  habbo-backend/     - FastAPI CMS + asset proxy + WebSocket proxy
  habbo-frontend/    - React + Vite + Tailwind (built into backend/static/)
  nitro-client/      - Nitro HTML5 client (built into backend/static/nitro/)
  arcturus-server/   - Arcturus Morningstar game server (Java)
```

## Ports
| Service | Port |
|---------|------|
| CMS Backend | 8000 |
| Arcturus Game | 3000 |
| Arcturus WebSocket | 2096 |
| Arcturus RCON | 3001 |
| MySQL | 3306 |
