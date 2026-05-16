#!/bin/bash

# --- JFY-SH Auto Deployment Script for Hack Club Nest ---
# This script automates the installation and deployment using PM2.

echo "🚀 Starting deployment for jfy-sh..."

# 1. Setup Environment Variables
echo "📝 Setting up environment variables..."
if [ ! -f .env ]; then
    cat <<EOT >> .env
NODE_ENV=production
GEMINI_API_KEY="YOUR_KEY_HERE"
APP_URL="http://your-domain.sh"
PORT=3000
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
echo "🌐 App is running on port 3000"
echo "📊 Use 'pm2 status' to monitor."
echo "📜 Use 'pm2 logs jfy-sh' to view output."
echo "--------------------------------------------------"
