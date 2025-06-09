#!/bin/bash

# Xosmox Backend Deployment Script

echo "🚀 Starting Xosmox Backend Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before continuing."
    echo "Press any key to continue after editing .env..."
    read -n 1 -s
fi

# Source environment variables
source .env

# Create database if it doesn't exist
echo "🗄️ Setting up database..."
createdb $DB_NAME 2>/dev/null || echo "Database $DB_NAME already exists"

# Test database connection
echo "🔍 Testing database connection..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
    echo "❌ Database connection failed. Please check your database configuration."
    exit 1
fi

# Start Redis if available
if command -v redis-server &> /dev/null; then
    echo "🔴 Starting Redis server..."
    redis-server --daemonize yes 2>/dev/null || echo "Redis already running or failed to start"
else
    echo "⚠️ Redis not found. The application will work without Redis but with limited caching."
fi

# Run in development mode
echo "🏃 Starting Xosmox Backend in development mode..."
echo "📡 Server will be available at http://localhost:$PORT"
echo "🔌 WebSocket endpoint: ws://localhost:$PORT/ws"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev