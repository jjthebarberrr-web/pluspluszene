#!/bin/bash
# HabboRetro - Stop Script
echo "Stopping HabboRetro services..."
pkill -f "Arcturus.jar" 2>/dev/null && echo "Arcturus stopped" || echo "Arcturus was not running"
pkill -f "fastapi dev app/main.py" 2>/dev/null && echo "Backend stopped" || echo "Backend was not running"
echo "All services stopped."
