#!/usr/bin/env bash
set -euo pipefail

# Package OpenClaw for Linux using electron-builder
# Outputs to dist/packages/

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "📦 Building OpenClaw for Linux..."

# Ensure dependencies are installed
echo "📦 Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build TypeScript
echo "🔨 Building TypeScript..."
pnpm build

# Build UI
echo "🖥  Building Control UI..."
pnpm ui:build

# Run electron-builder for Linux
echo "📦 Running electron-builder for Linux..."
npx electron-builder --linux --x64 --arm64

echo "✅ Linux packages created in dist/packages/"
ls -lh dist/packages/ || true
