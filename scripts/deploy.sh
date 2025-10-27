#!/bin/bash

# Paseo App Deployment Script
# This script builds and deploys the Paseo app to Netlify

set -e  # Exit on error

echo "🚀 Starting Paseo App Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create a .env file based on env.example"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Run linter
echo -e "${YELLOW}🔍 Running linter...${NC}"
npm run lint || echo -e "${YELLOW}⚠️  Linter warnings found, continuing...${NC}"

# Run build
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: Build failed, dist directory not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}📦 Netlify CLI not found, installing...${NC}"
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo -e "${YELLOW}🚀 Deploying to Netlify...${NC}"
netlify deploy --prod --dir=dist

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}🎉 Your app is now live!${NC}"

