#!/bin/bash

echo " Quick Start - Dash1cc Applications"
echo "======================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}  Node.js is not installed. Please install it first.${NC}"
    exit 1
fi

echo -e "${BLUE} Installing dependencies...${NC}"

# School 1cc
echo -e "${GREEN} Setting up School 1cc...${NC}"
cd school-1cc
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
SCHOOL_PID=$!

# CRM Pro.cc
echo -e "${GREEN} Setting up CRM Pro.cc...${NC}"
cd ../crm-pro
if [ ! -d "node_modules" ]; then
    npm install
fi
npm run dev &
CRM_PID=$!

echo ""
echo -e "${GREEN} Applications started successfully!${NC}"
echo ""
echo -e "${BLUE} School 1cc:${NC}    http://localhost:5173"
echo -e "${BLUE} CRM Pro.cc:${NC}    http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop both applications"

# Trap Ctrl+C to kill both processes
trap "kill $SCHOOL_PID $CRM_PID; exit" INT

# Wait for both processes
wait
