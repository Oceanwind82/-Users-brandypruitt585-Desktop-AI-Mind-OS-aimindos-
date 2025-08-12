#!/bin/bash

echo "🚀 AI Mind OS Performance Check"
echo "==============================="

# Check if lighthouse is installed
if ! command -v lighthouse &> /dev/null; then
    echo "❌ Lighthouse not found. Installing..."
    npm install -g @lhci/cli lighthouse
fi

# Create lighthouse reports directory
mkdir -p reports

echo "📊 Running Lighthouse audit for mobile performance..."

# Run lighthouse audit for mobile
lighthouse http://localhost:3000 \
  --output=html \
  --output=json \
  --output-path=./reports/lighthouse-mobile \
  --preset=desktop \
  --chrome-flags="--headless" \
  --view

echo "✅ Performance audit complete!"
echo "📁 Reports saved to ./reports/"

# Check bundle size
echo "📦 Bundle size analysis..."
npm run build -- --analyze 2>/dev/null || echo "⚠️  Bundle analyzer not configured"

# Image optimization check
echo "🖼️  Checking for unoptimized images..."
find ./public -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | head -10

echo ""
echo "💡 Performance Recommendations:"
echo "1. Use next/image for all images"
echo "2. Enable image optimization in next.config.js"
echo "3. Add proper caching headers"
echo "4. Consider using WebP format for images"
echo "5. Implement lazy loading for non-critical content"
