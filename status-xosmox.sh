#!/bin/bash

# Xosmox Status Check Script
echo "📊 Xosmox Status Check"
echo "======================"

# Check backend
echo -n "🔧 Backend (port 3000): "
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Running"
    echo "   Health: $(curl -s http://localhost:3000/health)"
else
    echo "❌ Not responding"
fi

# Check frontend
echo -n "🎨 Frontend (port 5173): "
if curl -s -I http://localhost:5173 | grep "200 OK" > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Check database
echo -n "🗄️  Database (PostgreSQL): "
if psql -d xosmox -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connected"
else
    echo "❌ Connection failed"
fi

# Check Redis
echo -n "📦 Cache (Redis): "
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Running"
else
    echo "❌ Not responding"
fi

# Check processes
echo ""
echo "🔍 Running Processes:"
ps aux | grep -E "(node.*server|vite)" | grep -v grep | while read line; do
    echo "   $line"
done

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://localhost:5173"
echo "   Backend API: http://localhost:3000"
echo "   Health Check: http://localhost:3000/health"