#!/bin/bash
set -e
echo "Building static portal..."
rm -rf dist
mkdir -p dist

# Copy index.html utama
cp index.html dist/

# Copy semua file dari public/
cp -r public/. dist/

echo "✅ Build complete. Files in dist/:"
ls dist/
