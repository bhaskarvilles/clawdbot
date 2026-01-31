#!/usr/bin/env bash
set -euo pipefail

# Package OpenClaw for macOS using electron-builder
# This creates an Electron-based macOS app (separate from the native Swift app)
# Outputs to dist/packages/

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "📦 Building OpenClaw Electron app for macOS..."

# Ensure dependencies are installed
echo "📦 Installing dependencies..."
pnpm install --no-frozen-lockfile

# Build TypeScript
echo "🔨 Building TypeScript..."
pnpm build

# Build UI
echo "🖥  Building Control UI..."
pnpm ui:build

# Create build directory for macOS-specific files
mkdir -p build

# Create entitlements file
cat > build/entitlements.mac.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.network.server</key>
    <true/>
</dict>
</plist>
EOF

# Create notarization script placeholder
cat > build/notarize.js << 'EOF'
// Placeholder for notarization
// To enable notarization, set APPLE_ID, APPLE_ID_PASSWORD, and APPLE_TEAM_ID environment variables
exports.default = async function(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }
  
  if (!process.env.APPLE_ID || !process.env.APPLE_ID_PASSWORD) {
    console.log('Skipping notarization (APPLE_ID not set)');
    return;
  }
  
  // Notarization would go here
  console.log('Notarization not yet implemented');
};
EOF

# Run electron-builder for macOS
echo "📦 Running electron-builder for macOS..."
npx electron-builder --mac --x64 --arm64

echo "✅ macOS packages created in dist/packages/"
ls -lh dist/packages/ || true
