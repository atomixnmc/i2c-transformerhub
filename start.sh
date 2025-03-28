#!/bin/bash

# Start script for TransformerHub
# This script starts both the backend and frontend servers

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting TransformerHub...${NC}"

# Start backend server
echo -e "${GREEN}Starting backend server...${NC}"
cd backend
npm start &
BACKEND_PID=$!
echo -e "${GREEN}Backend server started with PID: $BACKEND_PID${NC}"

# Wait a moment for backend to initialize
sleep 3

# Start frontend server
echo -e "${GREEN}Starting frontend server...${NC}"
cd ../frontend
npm start &
FRONTEND_PID=$!
echo -e "${GREEN}Frontend server started with PID: $FRONTEND_PID${NC}"

echo -e "${BLUE}TransformerHub is running!${NC}"
echo -e "${BLUE}Backend: http://localhost:3001${NC}"
echo -e "${BLUE}Frontend: http://localhost:3000${NC}"

# Handle script termination
trap "echo -e '${GREEN}Shutting down TransformerHub...${NC}'; kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

# Keep script running
wait
