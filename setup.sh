#!/bin/bash

set -e  # Exit on error

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

echo "🚀 AC2 Project Setup Script"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check if running on macOS or Linux
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
else
    print_error "Unsupported operating system: $OSTYPE"
    exit 1
fi

print_success "Detected OS: $OS"
echo ""

# Install uv (Python package manager)
echo "📦 Installing uv..."
if command -v uv &> /dev/null; then
    print_success "uv is already installed"
    uv --version
else
    print_warning "uv not found. Installing..."
    if [ "$OS" == "macos" ]; then
        curl -LsSf https://astral.sh/uv/install.sh | sh
        export PATH="$HOME/.cargo/bin:$PATH"
    else
        curl -LsSf https://astral.sh/uv/install.sh | sh
        export PATH="$HOME/.cargo/bin:$PATH"
    fi
    print_success "uv installed successfully"
    print_warning "You may need to restart your terminal or run: export PATH=\"\$HOME/.cargo/bin:\$PATH\""
fi
echo ""

# Install/check Node.js and npm
echo "📦 Checking Node.js and npm..."
if command -v node &> /dev/null; then
    print_success "Node.js is installed: $(node --version)"
else
    print_error "Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

if command -v npm &> /dev/null; then
    print_success "npm is installed: $(npm --version)"
else
    print_error "npm is not installed. Please install npm."
    exit 1
fi

# Check for pnpm (optional, but preferred if available)
if command -v pnpm &> /dev/null; then
    print_success "pnpm is installed: $(pnpm --version)"
    PACKAGE_MANAGER="pnpm"
else
    print_warning "pnpm not found. Using npm instead."
    print_warning "Consider installing pnpm: npm install -g pnpm"
    PACKAGE_MANAGER="npm"
fi
echo ""

# Setup Backend
echo "🐍 Setting up backend..."
cd ac2_backend

# Check Python version
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
    print_success "Python found: $(python3 --version)"
    
    # Check if Python version is >= 3.11
    if ! python3 -c "import sys; exit(0 if sys.version_info >= (3, 11) else 1)"; then
        print_error "Python 3.11 or higher is required. Found: $PYTHON_VERSION"
        exit 1
    fi
else
    print_error "Python 3 is not installed. Please install Python 3.11 or higher."
    exit 1
fi

# Install backend dependencies with uv
print_success "Installing backend dependencies with uv..."
uv sync
print_success "Backend dependencies installed"
cd ..
echo ""

# Setup Frontend
echo "⚛️  Setting up frontend..."
cd ac2_frontend

# Install frontend dependencies
print_success "Installing frontend dependencies with $PACKAGE_MANAGER..."
if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
    pnpm install
else
    npm install
fi
print_success "Frontend dependencies installed"

# Build frontend
echo ""
print_success "Building frontend..."
if [ "$PACKAGE_MANAGER" == "pnpm" ]; then
    pnpm run build
else
    npm run build
fi
print_success "Frontend build complete"
cd ..
echo ""

# Check MongoDB
echo "🍃 Checking MongoDB..."
if command -v mongod &> /dev/null || pgrep -x mongod > /dev/null; then
    print_success "MongoDB appears to be available"
    print_warning "Make sure MongoDB is running on localhost:27017"
else
    print_warning "MongoDB not found in PATH or not running"
    print_warning "Please ensure MongoDB is installed and running on localhost:27017"
    print_warning "Install: https://www.mongodb.com/try/download/community"
fi
echo ""

echo "============================"
print_success "Setup complete! 🎉"
echo ""
echo "Next steps:"
echo "  1. Make sure MongoDB is running: mongod"
echo "  2. Run ./start-server.sh to start both backend and frontend"
echo ""

