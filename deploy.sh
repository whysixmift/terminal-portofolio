#!/bin/bash

# --- JFY-SH Auto Deployment Script for Hack Club Nest ---
# This script automates the installation and deployment using PM2.

echo "🚀 Starting deployment for jfy-sh..."

# 1. Setup Environment Variables
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
    cat <<EOT >> .env
NODE_ENV=production
# In Hack Club Nest, you usually proxy your subdomain to the local port (e.g., 3000)
# via Caddy, Nginx, or the Nest dashboard forwarding.
APP_URL="https://your-app.hackclub.app"
EOT
    echo "✅ Created .env with placeholder values. PLEASE UPDATE IT!"
else
    echo "✅ .env already exists."
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

# 5. Deploy with PM2
echo "🔄 Starting application with PM2..."
# Kill existing process if any
pm2 delete jfy-sh || true

# Start the bundled server
pm2 start dist/server.cjs --name jfy-sh --env production

# 6. Save PM2 State
pm2 save

echo "--------------------------------------------------"
echo "✨ Deployment Complete!"
echo "🌐 App is running locally on port 3000"
echo "📊 Use 'pm2 status' to monitor."
echo "📜 Use 'pm2 logs jfy-sh' to view output."
echo ""
echo "🔗 HOW TO FORWARD YOUR DOMAIN ON HACK CLUB NEST:"
echo "1. If you are using Caddy, add this to your Caddyfile:"
echo "   your-subdomain.hackclub.app {"
echo "       reverse_proxy 127.0.0.1:3000"
echo "   }"
echo "2. Then run 'caddy reload'"
echo "--------------------------------------------------"
