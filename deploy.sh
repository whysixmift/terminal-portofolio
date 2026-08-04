#!/bin/bash

# --- JFY-SH Auto Deployment Script for Hack Club Nest ---
# This script automates the installation and deployment using PM2.

set -e  # Exit on any error

echo "🚀 Starting deployment for jfy-sh..."

# 1. Setup Environment Variables
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
    cat <<EOT >> .env
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
EOT
    echo "✅ Created .env with default values."
else
    echo "✅ .env already exists."
    # Ensure NODE_ENV is set to production
    if ! grep -q "NODE_ENV=production" .env; then
        echo "NODE_ENV=production" >> .env
        echo "  → Added NODE_ENV=production to .env"
    fi
fi

# 2. Check for Requirements
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 not found. Installing globally..."
    npm install -g pm2
fi

# 3. Install Dependencies
echo "📦 Installing npm dependencies..."
npm install

# 4. Build the Application
echo "🛠 Building the application (Vite + Server)..."
npm run build

# Verify build output
if [ ! -f dist/server.cjs ] || [ ! -f dist/index.html ]; then
    echo "❌ Build failed! Missing dist/server.cjs or dist/index.html"
    exit 1
fi

echo "✅ Build successful!"
ls -la dist/

# 5. Deploy with PM2
echo "🔄 Starting application with PM2..."
# Kill existing process if any
pm2 delete jfy-sh 2>/dev/null || true

# Source the .env file if it exists so pm2 inherits variables
if [ -f .env ]; then
  set -a
  source .env
  set +a
fi

# Start the bundled server
NODE_ENV=production pm2 start dist/server.cjs --name jfy-sh

# 6. Save PM2 State
pm2 save

# 7. Verify the server is running
echo ""
echo "⏳ Waiting 3 seconds for server to start..."
sleep 3

if curl -s http://localhost:${PORT:-3000}/api/status | grep -q "ok"; then
    echo "✅ Server health check passed!"
else
    echo "⚠️  Server might not be running properly."
    echo "📜 Check logs with: pm2 logs jfy-sh"
fi

echo ""
echo "--------------------------------------------------"
echo "✨ Deployment Complete!"
echo "🌐 App is running locally on port ${PORT:-3000}"
echo "📊 Use 'pm2 status' to monitor."
echo "📜 Use 'pm2 logs jfy-sh' to view output."
echo ""
echo "🔗 HACK CLUB NEST PORT FORWARDING:"
echo "   Go to the Nest dashboard and forward your"
echo "   subdomain to port ${PORT:-3000}"
echo ""
echo "   If using Caddy instead, add to your Caddyfile:"
echo "   your-subdomain.hackclub.app {"
echo "       reverse_proxy 127.0.0.1:${PORT:-3000}"
echo "   }"
echo "   Then run: caddy reload"
echo "--------------------------------------------------"
