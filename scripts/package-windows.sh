#!/usr/bin/env bash
set -euo pipefail

# Package OpenClaw for Windows using electron-builder
# Outputs to dist/packages/

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "📦 Building OpenClaw for Windows..."

# Ensure dependencies are installed
echo "📦 Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build TypeScript
echo "🔨 Building TypeScript..."
pnpm build

# Build UI
echo "🖥  Building Control UI..."
pnpm ui:build

# Create build directory for Windows-specific files
mkdir -p build

# Create installer script (NSIS)
cat > build/installer.nsh << 'EOF'
!macro customInstall
  ; Add custom installation steps here if needed
!macroend

!macro customUnInstall
  ; Add custom uninstallation steps here if needed
!macroend
EOF

# Run electron-builder for Windows
echo "📦 Running electron-builder for Windows..."
npx electron-builder --win --x64 --ia32

echo "✅ Windows packages created in dist/packages/"
ls -lh dist/packages/ || true
