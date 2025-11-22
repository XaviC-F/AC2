#!/bin/bash

set -e  # Exit on error

# Save original directory
ORIGINAL_DIR="$(pwd)"

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to script directory (project root)
cd "$SCRIPT_DIR"

echo "🔐 Starting AC2 Encrypted Server + Frontend"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓${NC} $1"; }
print_warning() { echo -e "${YELLOW}⚠${NC} $1"; }
print_error() { echo -e "${RED}✗${NC} $1"; }
print_info() { echo -e "${BLUE}ℹ${NC} $1"; }

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
    fi
}

# Function to kill processes by PID
kill_pid() {
    local pid=$1
    local name=$2
    if [ ! -z "$pid" ] && ps -p $pid > /dev/null 2>&1; then
        kill -TERM $pid 2>/dev/null || true
        sleep 1
        # Force kill if still running
        if ps -p $pid > /dev/null 2>&1; then
            kill -KILL $pid 2>/dev/null || true
        fi
        print_success "$name stopped (PID: $pid)"
    fi
}

# Cleanup function
cleanup() {
    echo ""
    print_info "Shutting down servers..."
    
    # Kill by PID first (more precise)
    if [ ! -z "$BACKEND_PID" ]; then
        kill_pid $BACKEND_PID "Encrypted Backend"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill_pid $FRONTEND_PID "Frontend"
    fi
    
    # Also kill by port (catches any orphaned processes)
    kill_port 8001 "Encrypted Backend"
    kill_port 3000 "Frontend"
    
    # Kill any remaining processes
    pkill -f "uvicorn.*backend_encrypted:app" 2>/dev/null || true
    pkill -f "next dev" 2>/dev/null || true
    
    # Restore original directory before exiting
    cd "$ORIGINAL_DIR"
    
    exit 0
}

# Set up signal handlers
trap cleanup EXIT INT TERM

# Check for and kill existing processes
echo "🧹 Checking for existing processes..."
EXISTING_BACKEND=$(lsof -ti:8001 2>/dev/null || true)
EXISTING_FRONTEND=$(lsof -ti:3000 2>/dev/null || true)

if [ ! -z "$EXISTING_BACKEND" ] || [ ! -z "$EXISTING_FRONTEND" ]; then
    print_warning "Found existing processes on ports 8001 or 3000"
    if [ ! -z "$EXISTING_BACKEND" ]; then
        print_info "Killing existing encrypted backend process(es) on port 8001..."
        kill_port 8001 "Existing backend"
    fi
    if [ ! -z "$EXISTING_FRONTEND" ]; then
        print_info "Killing existing frontend process(es) on port 3000..."
        kill_port 3000 "Existing frontend"
    fi
    sleep 2
fi
echo ""

# Check MongoDB
echo "🍃 Checking MongoDB..."
if command -v mongosh &> /dev/null && mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    print_success "MongoDB is running"
elif pgrep -x mongod > /dev/null; then
    print_success "MongoDB process detected"
else
    print_error "MongoDB is not running!"
    print_info "The encrypted backend requires MongoDB to store objectives."
    echo ""
    print_info "To start MongoDB, use one of these commands:"
    echo ""
    echo "  # Option 1: Homebrew (macOS)"
    echo "  brew services start mongodb-community"
    echo ""
    echo "  # Option 2: System service (Linux)"
    echo "  sudo systemctl start mongod"
    echo ""
    echo "  # Option 3: Run manually"
    echo "  mongod --config /usr/local/etc/mongod.conf"
    echo ""
    read -p "Continue anyway without MongoDB? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo ""

# Determine package manager for frontend
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
else
    PACKAGE_MANAGER="npm"
fi

# Start Encrypted Backend
echo "🔐 Starting encrypted backend server..."

# Check if virtual environment exists
if [ ! -f "bin/activate" ]; then
    print_error "Virtual environment not found. Run ./setup.sh first."
    exit 1
fi

# Activate virtual environment
source bin/activate

# Check if ac2_backend package is installed
if ! python -c "import ac2_backend" 2>/dev/null; then
    print_warning "ac2_backend package not installed in development mode"
    print_info "Installing package..."
    cd ac2_backend
    pip install -e . > /dev/null 2>&1
    cd ..
    print_success "Package installed"
fi

# Start encrypted backend
print_info "Starting FastAPI encrypted backend on http://localhost:8001"
cd ac2_backend
PYTHONPATH=.. uvicorn backend_encrypted:app --reload --host 0.0.0.0 --port 8001 > ../backend_encrypted.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Encrypted backend started (PID: $BACKEND_PID)"
else
    print_error "Encrypted backend failed to start. Check backend_encrypted.log for details."
    cat backend_encrypted.log 2>/dev/null || true
    exit 1
fi
echo ""

# Start Frontend
echo "⚛️  Starting frontend server..."
cd ac2_frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
        pnpm install
    else
        npm install
    fi
fi

# Start frontend with encrypted backend URL
print_info "Starting Next.js frontend on http://localhost:3000"
export NEXT_PUBLIC_API_URL="http://localhost:8001/"
if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
    pnpm dev > ../frontend.log 2>&1 &
else
    npm run dev > ../frontend.log 2>&1 &
fi
FRONTEND_PID=$!
cd ..

# Wait a moment for frontend to start
sleep 3

# Check if frontend started successfully
if ps -p $FRONTEND_PID > /dev/null; then
    print_success "Frontend started (PID: $FRONTEND_PID)"
else
    print_error "Frontend failed to start. Check frontend.log for details."
    cat frontend.log 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
echo ""

echo "================================================"
print_success "All servers are running! 🎉🔐"
echo ""
echo "📡 Encrypted Backend:  http://localhost:8001"
echo "📡 API Docs:           http://localhost:8001/docs"
echo "🌐 Frontend:           http://localhost:3000"
echo ""
print_info "Frontend is automatically configured to use encrypted backend"
echo ""
print_info "Logs:"
echo "  - Backend:  ./backend_encrypted.log"
echo "  - Frontend: ./frontend.log"
echo ""
print_info "Press Ctrl+C to stop all servers"
echo "================================================"
echo ""

# Wait for user interrupt
wait
