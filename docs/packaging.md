# Cross-Platform Packaging Guide

## Overview

OpenClaw can be packaged as desktop applications for Windows, macOS, and Linux using Electron and electron-builder.

## Prerequisites

- Node.js 22.x or later
- pnpm (or npm)
- Platform-specific requirements:
  - **Windows**: Windows 10/11 or Wine on Linux/macOS
  - **macOS**: macOS 10.15+ with Xcode Command Line Tools
  - **Linux**: Ubuntu 20.04+ or equivalent

## Building Packages Locally

### All Platforms

```bash
# Install dependencies
pnpm install

# Build all packages (requires all platform build tools)
pnpm package:all
```

### Windows

```bash
# Build Windows installer and portable version
pnpm package:win

# Output: dist/packages/OpenClaw-Setup-*.exe
#         dist/packages/OpenClaw-*-portable.exe
```

### macOS

```bash
# Build macOS DMG and app bundle (Electron version)
pnpm package:mac

# Output: dist/packages/OpenClaw-*.dmg
#         dist/packages/OpenClaw-*-mac.zip
```

**Note**: This creates an Electron-based macOS app. The native Swift macOS app can still be built using:

```bash
pnpm mac:package
```

### Linux

```bash
# Build Debian package and AppImage
pnpm package:linux

# Output: dist/packages/openclaw_*.deb
#         dist/packages/OpenClaw-*.AppImage
```

## Installation

### Windows

1. Download `OpenClaw-Setup-*.exe`
2. Run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

**Portable Version**: Download `OpenClaw-*-portable.exe` and run directly (no installation required)

### macOS

1. Download `OpenClaw-*.dmg`
2. Open the DMG file
3. Drag OpenClaw to Applications folder
4. Launch from Applications

**First Launch**: You may need to right-click → Open due to Gatekeeper (unsigned builds)

### Linux (Debian/Ubuntu)

```bash
# Install .deb package
sudo dpkg -i openclaw_*.deb

# If dependencies are missing:
sudo apt-get install -f

# Launch
openclaw
```

**AppImage**: Make executable and run:

```bash
chmod +x OpenClaw-*.AppImage
./OpenClaw-*.AppImage
```

## Code Signing (Production)

### Windows

Set environment variables before building:

```bash
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your_password
pnpm package:win
```

### macOS

Set environment variables for signing and notarization:

```bash
export APPLE_ID=your@email.com
export APPLE_ID_PASSWORD=app-specific-password
export APPLE_TEAM_ID=TEAM_ID
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
pnpm package:mac
```

## CI/CD

The GitHub Actions workflow (`.github/workflows/build-packages.yml`) automatically builds packages for all platforms when you push a version tag:

```bash
git tag v2026.2.1
git push origin v2026.2.1
```

Packages will be uploaded as release artifacts.

## Troubleshooting

### Windows: "App can't be opened" or SmartScreen warning

This is expected for unsigned builds. Click "More info" → "Run anyway"

### macOS: "App is damaged and can't be opened"

Remove quarantine attribute:

```bash
xattr -cr /Applications/OpenClaw.app
```

### Linux: Missing dependencies

Install required libraries:

```bash
sudo apt-get install libgtk-3-0 libnotify4 libnss3 libxss1 libxtst6 xdg-utils libatspi2.0-0 libdrm2 libgbm1 libxcb-dri3-0
```

### Build fails with "Cannot find module 'electron'"

Run `pnpm install` to install dependencies

## Architecture

The Electron app consists of:

- **Main Process** (`electron-main.js`): Manages the gateway server and application window
- **Preload Script** (`electron-preload.js`): Secure IPC bridge
- **Renderer Process**: The existing Control UI (served from gateway)

The app automatically starts the OpenClaw gateway server on port 18789 and displays the Control UI.

## Comparison: Electron vs Native Apps

| Feature | Electron (Cross-platform) | Native Swift (macOS) |
|---------|---------------------------|----------------------|
| Platforms | Windows, macOS, Linux | macOS only |
| Size | ~150MB | ~20MB |
| Performance | Good | Excellent |
| Native Integration | Limited | Full |
| Maintenance | Single codebase | Separate codebase |

**Recommendation**: Use native Swift app on macOS for best performance. Use Electron version for consistency across platforms or if you need the same experience everywhere.
