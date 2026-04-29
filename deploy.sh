#!/bin/bash

# Paseo App - Netlify Deployment Script
echo "🚀 Deploying Paseo App to Netlify..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎯 Next steps:"
    echo "1. Go to https://netlify.com/drop"
    echo "2. Drag the 'dist' folder to deploy"
    echo "   OR"
    echo "1. Go to https://netlify.com"
    echo "2. Connect to GitHub repository"
    echo "3. Deploy automatically"
    echo ""
    echo "📋 Don't forget to set environment variables in Netlify dashboard!"
    echo "   Set VITE_* and backend secrets in Netlify Site Settings → Environment (see README / env.example)"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
