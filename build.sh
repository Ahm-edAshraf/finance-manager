#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting deployment process..."

# Install dependencies and build client
echo "📦 Installing client dependencies..."
cd client
npm install --production=false
echo "🏗️ Building client..."
npm run build
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install --production
echo "✅ Server dependencies installed"

echo "🎉 Deployment build completed successfully!"
