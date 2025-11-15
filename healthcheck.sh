#!/bin/bash

# HackerNews Clone Health Check Script
# Usage: ./healthcheck.sh [PORT_NUMBER]
# Example: ./healthcheck.sh 1  (checks frontend on 3001, backend on 8001)

set -e

# Get port number from argument (default to 0)
PORT_NUM=${1:-0}
FRONTEND_PORT=$((3000 + PORT_NUM))
BACKEND_PORT=$((8000 + PORT_NUM))

FRONTEND_URL="http://localhost:${FRONTEND_PORT}"
BACKEND_URL="http://localhost:${BACKEND_PORT}"

echo "🔍 Running health checks..."
echo "   Frontend: ${FRONTEND_URL}"
echo "   Backend:  ${BACKEND_URL}"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

FAILED=0

# Function to check if a service is responding
check_service() {
    local name=$1
    local url=$2
    local max_attempts=5
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f -o /dev/null --connect-timeout 2 "$url"; then
            return 0
        fi
        attempt=$((attempt + 1))
        if [ $attempt -le $max_attempts ]; then
            sleep 1
        fi
    done
    return 1
}

# Check 1: Backend health endpoint
echo -n "✓ Checking backend health... "
BACKEND_RESPONSE=$(curl -s "${BACKEND_URL}/api" 2>/dev/null || echo "")
if [ "$BACKEND_RESPONSE" = "Healthy" ]; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "  Backend is not responding with 'Healthy' at ${BACKEND_URL}/api"
    echo "  Got: '$BACKEND_RESPONSE'"
    FAILED=1
    # exit now
    exit 1
fi

# Check 2: Frontend server responds
echo -n "✓ Checking frontend server... "
if check_service "Frontend" "${FRONTEND_URL}"; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAILED${NC}"
    echo "  Frontend is not responding at ${FRONTEND_URL}"
    FAILED=1
fi

# Check 3: Frontend HTML contains expected content
if [ $FAILED -eq 0 ]; then
    echo -n "✓ Checking frontend HTML content... "
    HTML=$(curl -s "${FRONTEND_URL}")
    
    if echo "$HTML" | grep -q "HackerNews Clone" && echo "$HTML" | grep -q "root"; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        echo "  Frontend HTML is missing expected content"
        FAILED=1
    fi
fi

# Check 4: Frontend can load JavaScript module
if [ $FAILED -eq 0 ]; then
    echo -n "✓ Checking frontend JavaScript module... "
    if echo "$HTML" | grep -q "src/main.jsx"; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${RED}FAILED${NC}"
        echo "  Frontend JavaScript module not found in HTML"
        FAILED=1
    fi
fi

# Check 5: Frontend API URL configuration
if [ $FAILED -eq 0 ]; then
    echo -n "✓ Checking frontend-backend connectivity... "
    # Try to make the same request the frontend would make
    CORS_TEST=$(curl -s -H "Origin: ${FRONTEND_URL}" \
                     -H "Access-Control-Request-Method: GET" \
                     -H "Access-Control-Request-Headers: Content-Type" \
                     -I "${BACKEND_URL}/api/posts" 2>/dev/null | grep -i "access-control-allow-origin" || true)
    
    if [ -n "$CORS_TEST" ] || curl -s "${BACKEND_URL}/api/posts" > /dev/null 2>&1; then
        echo -e "${GREEN}OK${NC}"
    else
        echo -e "${YELLOW}WARNING${NC}"
        echo "  CORS headers not detected (may cause issues in browser)"
    fi
fi

# Summary
echo ""
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All health checks passed!${NC}"
    echo ""
    echo "Application is running at:"
    echo "  Frontend: ${FRONTEND_URL}"
    echo "  Backend:  ${BACKEND_URL}/api"
    exit 0
else
    echo -e "${RED}❌ Health check failed!${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Make sure the app is running: npm start ${PORT_NUM}"
    echo "  2. Check if ports ${FRONTEND_PORT} and ${BACKEND_PORT} are available"
    echo "  3. Check the console for any error messages"
    exit 1
fi

