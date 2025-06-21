#!/bin/bash

# Xosmox Stop Script
echo "🛑 Stopping Xosmox Development Environment..."

# Read PIDs if available
if [ -f ".xosmox-pids" ]; then
    PIDS=$(cat .xosmox-pids)
    echo "📝 Found saved PIDs: $PIDS"
    for pid in $PIDS; do
        if kill -0 $pid 2>/dev/null; then
            echo "🔪 Killing process $pid"
            kill $pid
        fi
    done
    rm .xosmox-pids
fi

# Kill any remaining processes
echo "🧹 Cleaning up any remaining processes..."
pkill -f "node.*server.js" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

# Wait a moment
sleep 2

# Check if ports are free
if lsof -i :3000 > /dev/null 2>&1; then
    echo "⚠️  Port 3000 still in use"
else
    echo "✅ Port 3000 is free"
fi

if lsof -i :5173 > /dev/null 2>&1; then
    echo "⚠️  Port 5173 still in use"
else
    echo "✅ Port 5173 is free"
fi

echo "🎉 Xosmox stopped successfully!"