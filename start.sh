#!/bin/bash
# HabboRetro - Start Script for Linux/Mac
# This script starts all required services: MySQL, Arcturus, and the CMS backend

echo "========================================="
echo "  HabboRetro - Starting All Services"
echo "========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 1. Check MySQL
echo -e "${YELLOW}[1/4] Checking MySQL...${NC}"
if command -v mysql &> /dev/null; then
    if ! mysqladmin ping -h localhost --silent 2>/dev/null; then
        echo "Starting MySQL..."
        sudo systemctl start mysql 2>/dev/null || sudo service mysql start 2>/dev/null
        sleep 2
    fi
    # Fix sql_mode for Arcturus compatibility
    sudo mysql -e "SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''));" 2>/dev/null
    echo -e "${GREEN}MySQL is running${NC}"
else
    echo -e "${RED}MySQL not found! Please install MySQL 8.0+ and import the Arcturus database.${NC}"
    echo "  See README.md for database setup instructions."
    exit 1
fi

# 2. Start Arcturus Morningstar
echo -e "${YELLOW}[2/4] Starting Arcturus Morningstar...${NC}"
if [ -f "$SCRIPT_DIR/arcturus-server/Arcturus.jar" ]; then
    # Kill any existing Arcturus process
    pkill -f "Arcturus.jar" 2>/dev/null
    sleep 1
    # Start with nohup to prevent process from being stopped
    cd "$SCRIPT_DIR/arcturus-server"
    nohup java -jar Arcturus.jar < /dev/null > /tmp/arcturus.log 2>&1 &
    ARCTURUS_PID=$!
    echo "Arcturus PID: $ARCTURUS_PID"
    sleep 5
    if kill -0 $ARCTURUS_PID 2>/dev/null; then
        echo -e "${GREEN}Arcturus Morningstar started (Game: 3000, WS: 2096, RCON: 3001)${NC}"
    else
        echo -e "${RED}Arcturus failed to start! Check /tmp/arcturus.log${NC}"
        exit 1
    fi
else
    echo -e "${RED}Arcturus.jar not found at $SCRIPT_DIR/arcturus-server/${NC}"
    exit 1
fi

# 3. Install backend dependencies
echo -e "${YELLOW}[3/4] Installing backend dependencies...${NC}"
cd "$SCRIPT_DIR/habbo-backend"
if command -v poetry &> /dev/null; then
    poetry install --no-interaction 2>/dev/null
    echo -e "${GREEN}Dependencies installed${NC}"
else
    echo -e "${RED}Poetry not found! Install: curl -sSL https://install.python-poetry.org | python3 -${NC}"
    exit 1
fi

# 4. Start CMS Backend
echo -e "${YELLOW}[4/4] Starting CMS Backend...${NC}"
cd "$SCRIPT_DIR/habbo-backend"
nohup poetry run fastapi dev app/main.py --port 8000 --host 0.0.0.0 < /dev/null > /tmp/habbo-backend.log 2>&1 &
BACKEND_PID=$!
sleep 3
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}CMS Backend started on http://localhost:8000${NC}"
else
    echo -e "${RED}Backend failed to start! Check /tmp/habbo-backend.log${NC}"
    exit 1
fi

echo ""
echo "========================================="
echo -e "${GREEN}  HabboRetro is now running!${NC}"
echo "========================================="
echo ""
echo "  CMS & Hotel:  http://localhost:8000"
echo "  Nitro Client:  http://localhost:8000/client"
echo "  Arcturus WS:   ws://localhost:2096"
echo "  Arcturus Game: localhost:3000"
echo ""
echo "  To stop: ./stop.sh"
echo "========================================="
