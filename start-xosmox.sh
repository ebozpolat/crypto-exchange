#!/bin/bash

# Xosmox Quick Start Script
echo "🚀 Starting Xosmox Development Environment..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "xosmox-backend" ] || [ ! -d "frontend" ]; then
    echo "❌ Please run this script from the crypto-exchange root directory"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Check required services
echo "🔍 Checking prerequisites..."

# Check PostgreSQL
if ! brew services list | grep postgresql | grep started > /dev/null; then
    echo "⚠️  PostgreSQL is not running. Starting it..."
    brew services start postgresql@14 || brew services start postgresql
fi

# Check Redis
if ! brew services list | grep redis | grep started > /dev/null; then
    echo "⚠️  Redis is not running. Starting it..."
    brew services start redis
fi

# Setup database if needed
echo "🗄️  Setting up database..."
createdb xosmox 2>/dev/null || echo "Database already exists"
psql -d xosmox -f xosmox-backend/setup-db.sql > /dev/null 2>&1

# Check if backend is already running
if check_port 3000; then
    echo "⚠️  Port 3000 is already in use. Stopping existing process..."
    pkill -f "node.*server.js" || true
    sleep 2
fi

# Check if frontend is already running
if check_port 5173; then
    echo "⚠️  Port 5173 is already in use. Stopping existing process..."
    pkill -f "vite" || true
    sleep 2
fi

echo "🚀 Starting backend server..."
cd xosmox-backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo "🎨 Starting frontend server..."
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait a moment for servers to start
echo "⏳ Waiting for servers to start..."
sleep 5

# Check if servers are running
if check_port 3000; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "❌ Backend failed to start. Check backend.log for details."
fi

if check_port 5173; then
    echo "✅ Frontend is running on http://localhost:5173"
else
    echo "❌ Frontend failed to start. Check frontend.log for details."
fi

echo ""
echo "🎉 Xosmox is starting up!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:3000"
echo "📊 Backend Health: http://localhost:3000/health"
echo ""
echo "📝 Logs:"
echo "   Backend: tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 To stop servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo "   or use: pkill -f 'node.*server.js' && pkill -f 'vite'"

# Save PIDs for easy cleanup
echo "$BACKEND_PID $FRONTEND_PID" > .xosmox-pids

echo ""
echo "🚀 Opening browser in 3 seconds..."
sleep 3
open http://localhost:5173