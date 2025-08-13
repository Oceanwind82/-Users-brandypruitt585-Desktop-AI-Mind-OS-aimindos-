#!/bin/bash
# Clean development server start script
# Suppresses Node.js warnings for a cleaner development experience

echo "🚀 Starting AI Mind OS Development Server..."
echo "📍 http://localhost:3000"
echo ""

# Start Next.js dev server with warning suppression
NODE_NO_WARNINGS=1 npx next dev
