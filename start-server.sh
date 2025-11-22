#!/bin/bash

set -e  # Exit on error

echo "🚀 Starting AC2 Servers"
echo "========================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if MongoDB is running
check_mongodb() {
    if command -v mongosh &> /dev/null; then
        if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
            print_success "MongoDB is running"
            return 0
        fi
    fi
    
    # Try alternative check
    if pgrep -x mongod > /dev/null; then
        print_success "MongoDB process detected"
        return 0
    fi
    
    print_warning "MongoDB may not be running"
    print_warning "Make sure MongoDB is started: mongod"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Cleanup function to kill background processes
cleanup() {
    echo ""
    print_info "Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        print_success "Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        print_success "Frontend stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check MongoDB
echo "🍃 Checking MongoDB..."
check_mongodb
echo ""

# Determine package manager
if command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
else
    PACKAGE_MANAGER="npm"
fi

# Start Backend
echo "🐍 Starting backend server..."

# Check if uv is available
if ! command -v uv &> /dev/null; then
    print_error "uv is not installed. Run ./setup.sh first."
    exit 1
fi

# Start backend with uv
# Run from backend directory where pyproject.toml is located
cd ac2_backend
print_info "Starting FastAPI backend on http://localhost:8000"
# uv sync should have installed the package, so ac2_backend should be importable
# Run from parent directory context
cd ..
uv --directory ac2_backend run uvicorn ac2_backend.backend:app --reload --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Check if backend started successfully
if ps -p $BACKEND_PID > /dev/null; then
    print_success "Backend started (PID: $BACKEND_PID)"
else
    print_error "Backend failed to start. Check backend.log for details."
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

# Start frontend
print_info "Starting Next.js frontend on http://localhost:3000"
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
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi
echo ""

echo "============================"
print_success "All servers are running! 🎉"
echo ""
echo "📡 Backend API:  http://localhost:8000"
echo "📡 API Docs:     http://localhost:8000/docs"
echo "🌐 Frontend:     http://localhost:3000"
echo ""
print_info "Logs:"
echo "  - Backend:  ./backend.log"
echo "  - Frontend: ./frontend.log"
echo ""
print_info "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait

