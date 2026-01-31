# Automated Release Guide

## Overview

The GitHub Actions workflow automatically builds and publishes cross-platform packages for Windows, macOS, and Linux when you create a new version tag.

## Creating a Release

### Method 1: Automatic (Recommended)

Create and push a version tag:

```bash
# Create a new version tag
git tag v2026.2.1

# Push the tag to GitHub
git push origin v2026.2.1
```

The workflow will automatically:
1. Build packages for Windows, macOS, and Linux
2. Generate SHA256 checksums for all packages
3. Create a GitHub release with detailed notes
4. Upload all packages and checksums

### Method 2: Manual Trigger

You can also trigger the workflow manually from GitHub:

1. Go to **Actions** → **Build Cross-Platform Packages**
2. Click **Run workflow**
3. Optionally specify a version (e.g., `v2026.2.1`)
4. Click **Run workflow**

## What Gets Built

### Windows
- `OpenClaw-Setup-{version}.exe` - NSIS installer (x64)
- `OpenClaw-{version}-portable.exe` - Portable version (x64)

### macOS
- `OpenClaw-{version}.dmg` - DMG installer (universal: x64 + arm64)
- `OpenClaw-{version}-mac.zip` - ZIP archive (universal: x64 + arm64)

### Linux
- `openclaw_{version}_amd64.deb` - Debian package (x64)
- `OpenClaw-{version}.AppImage` - AppImage (x64)

### Checksums
- `SHA256SUMS.txt` - Combined checksums for all packages

## Release Notes

Each release automatically includes:

- 📦 **Download links** for all platforms
- 🔐 **Verification instructions** with SHA256 checksums
- 📋 **Installation guides** for Windows, macOS, and Linux
- 🚀 **What's New** section (auto-generated from commits)
- 📝 **Important notes** about unsigned builds
- 🐛 **Bug reporting** link

## Workflow Details

### Build Process

1. **Checkout**: Clone repository with submodules
2. **Setup**: Install Node.js 22.x and pnpm
3. **Dependencies**: Install all dependencies
4. **Build**: Compile TypeScript (skipping A2UI for CI)
5. **UI Build**: Build the Control UI
6. **Package**: Create platform-specific packages
7. **Checksums**: Generate SHA256 checksums
8. **Upload**: Upload artifacts to GitHub

### Parallel Builds

The workflow runs three parallel jobs:
- **build-windows** (runs on `windows-latest`)
- **build-macos** (runs on `macos-latest`)
- **build-linux** (runs on `ubuntu-latest`)

### Release Creation

After all builds complete, the `create-release` job:
1. Downloads all artifacts
2. Organizes files into `release-assets/`
3. Combines checksums into `SHA256SUMS.txt`
4. Generates comprehensive release notes
5. Creates GitHub release with all assets

## Versioning

Follow semantic versioning with a `v` prefix:

- **Major release**: `v3.0.0` (breaking changes)
- **Minor release**: `v2.1.0` (new features)
- **Patch release**: `v2.0.1` (bug fixes)
- **Date-based**: `v2026.2.1` (current format)

## Troubleshooting

### Build Fails

1. **Check logs**: Go to Actions → Failed workflow → Click on failed job
2. **Common issues**:
   - Missing dependencies: Ensure `package.json` is up to date
   - TypeScript errors: Run `pnpm build:no-a2ui` locally first
   - UI build errors: Run `pnpm ui:build` locally first

### Release Not Created

- Ensure the tag starts with `v` (e.g., `v2026.2.1`)
- Check that all three build jobs completed successfully
- Verify repository permissions allow creating releases

### Missing Packages

- Check artifact upload logs
- Ensure `dist/packages/` contains the expected files
- Verify glob patterns in workflow match actual filenames

## Local Testing

Before creating a release, test the build locally:

```bash
# Windows
pnpm package:win

# macOS
pnpm package:mac

# Linux
pnpm package:linux
```

Verify packages are created in `dist/packages/`.

## Code Signing (Future)

Currently, packages are **unsigned**. To add code signing:

### Windows
1. Obtain a code signing certificate
2. Add to GitHub Secrets: `CSC_LINK`, `CSC_KEY_PASSWORD`
3. Update workflow to use secrets

### macOS
1. Enroll in Apple Developer Program
2. Add to GitHub Secrets: `APPLE_ID`, `APPLE_ID_PASSWORD`, `APPLE_TEAM_ID`
3. Update `build/notarize.js` with actual notarization code
4. Update workflow to use secrets

## Monitoring

### GitHub Actions Dashboard

View all workflow runs:
- Go to **Actions** tab
- Click on **Build Cross-Platform Packages**
- See history of all builds

### Notifications

Configure notifications:
- Go to **Settings** → **Notifications**
- Enable **Actions** notifications
- Get notified on build failures

## Best Practices

1. **Test locally** before creating a tag
2. **Update CHANGELOG.md** before releasing
3. **Use semantic versioning** for clarity
4. **Review release notes** after creation
5. **Test downloads** on each platform
6. **Announce releases** to users

## Example Workflow

```bash
# 1. Make changes and commit
git add .
git commit -m "feat: Add new feature"

# 2. Update version in package.json
# Edit package.json: "version": "2026.2.1"

# 3. Update CHANGELOG.md
# Add release notes

# 4. Commit version bump
git add package.json CHANGELOG.md
git commit -m "chore: Bump version to 2026.2.1"

# 5. Create and push tag
git tag v2026.2.1
git push origin main
git push origin v2026.2.1

# 6. Wait for GitHub Actions to complete
# 7. Check the release at: https://github.com/YOUR_ORG/openclaw/releases
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [electron-builder Documentation](https://www.electron.build/)
- [Semantic Versioning](https://semver.org/)
