#!/bin/bash

# Save original directory
ORIGINAL_DIR="$(pwd)"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to script directory (project root)
cd "$SCRIPT_DIR"

# Function to restore original directory
restore_dir() {
    cd "$ORIGINAL_DIR"
}

# Trap to restore directory on exit (including errors)
trap restore_dir EXIT INT TERM

echo "🛑 Stopping AC2 Servers"
echo "======================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to kill processes on ports
kill_port() {
    local port=$1
    local name=$2
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "$pids" | xargs kill -TERM 2>/dev/null || true
        sleep 1
        # Force kill if still running
        local remaining=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$remaining" ]; then
            echo "$remaining" | xargs kill -KILL 2>/dev/null || true
        fi
        print_success "$name stopped (port $port)"
        return 0
    else
        print_warning "No $name process found on port $port"
        return 1
    fi
}

# Kill backend
echo "🐍 Stopping backend..."
kill_port 8000 "Backend"

# Kill frontend
echo "⚛️  Stopping frontend..."
kill_port 3000 "Frontend"

# Kill any remaining processes by pattern
echo "🧹 Cleaning up any remaining processes..."
pkill -f "uvicorn.*backend:app" 2>/dev/null && print_success "Killed uvicorn processes" || true
pkill -f "next dev" 2>/dev/null && print_success "Killed next dev processes" || true

# Check MongoDB
echo ""
echo "🍃 Checking MongoDB..."
MONGODB_RUNNING=false

# Check if mongosh can connect
if command -v mongosh &> /dev/null; then
    if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        MONGODB_RUNNING=true
    fi
fi

# Alternative check: look for mongod process
if [ "$MONGODB_RUNNING" = false ]; then
    if pgrep -x mongod > /dev/null; then
        MONGODB_RUNNING=true
    fi
fi

# Check if MongoDB is listening on default port
if [ "$MONGODB_RUNNING" = false ]; then
    if lsof -ti:27017 > /dev/null 2>&1; then
        MONGODB_RUNNING=true
    fi
fi

if [ "$MONGODB_RUNNING" = true ]; then
    echo ""
    print_warning "MongoDB is still running!"
    echo ""
    print_info "To stop MongoDB, copy and paste one of these commands:"
    echo ""
    echo "  # Option 1: Homebrew (macOS)"
    echo "  brew services stop mongodb-community"
    echo ""
    echo "  # Option 2: System service (Linux)"
    echo "  sudo systemctl stop mongod"
    echo ""
    echo "  # Option 3: Kill process directly"
    echo "  pkill mongod"
    echo ""
    echo "  # Option 4: Kill by port"
    echo "  lsof -ti:27017 | xargs kill"
    echo ""
else
    print_success "MongoDB is not running"
fi

echo ""
echo "============================"
print_success "Cleanup complete!"
echo ""

