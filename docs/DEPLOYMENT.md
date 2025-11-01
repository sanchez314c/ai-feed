# 🚀 AIFEED Deployment Guide

**Version:** 1.0.0  
**Last Updated:** October 30, 2024

## Table of Contents

1. [Overview](#overview)
2. [Deployment Prerequisites](#deployment-prerequisites)
3. [Environment Configuration](#environment-configuration)
4. [Production Build](#production-build)
5. [Platform-Specific Deployment](#platform-specific-deployment)
6. [Code Signing](#code-signing)
7. [Distribution Channels](#distribution-channels)
8. [Automated Deployment](#automated-deployment)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)
10. [Troubleshooting Deployment](#troubleshooting-deployment)

## Overview

This guide covers the complete deployment process for AIFEED across different platforms and distribution channels. AIFEED is an Electron desktop application that can be distributed as standalone executables, installers, or through app stores.

### Deployment Targets

- **Standalone Executables**: Direct distribution
- **Package Managers**: npm, Homebrew, Chocolatey
- **App Stores**: Microsoft Store, Mac App Store, Snap Store
- **Enterprise**: Internal distribution, MSI packages

## Deployment Prerequisites

### System Requirements

**Build Environment:**

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git for version control
- Platform-specific build tools

**Target Platforms:**

- **Windows**: Windows 10 (1903) or later
- **macOS**: macOS 10.15 (Catalina) or later
- **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent

### Build Tools Installation

```bash
# Install global build dependencies
npm install -g electron-builder
npm install -g typescript
npm install -g @electron/rebuild

# Platform-specific tools
# macOS
xcode-select --install

# Windows
npm install -g windows-build-tools

# Linux
sudo apt-get install build-essential libnss3-dev
```

## Environment Configuration

### Production Environment Variables

Create a `.env.production` file:

```env
# Application Configuration
NODE_ENV=production
LOG_LEVEL=info

# API Configuration
ANTHROPIC_API_KEY=your_production_claude_api_key
NEWS_API_KEY=your_production_news_api_key
YOUTUBE_API_KEY=your_production_youtube_api_key

# Build Configuration
BUILD_OPTIMIZE=true
BUILD_MINIFY=true
BUILD_SOURCEMAP=false

# Code Signing (macOS)
CSC_LINK=path/to/certificate.p12
CSC_KEY_PASSWORD=certificate_password

# Code Signing (Windows)
CSC_LINK=path/to/certificate.p12
CSC_KEY_PASSWORD=certificate_password
```

### Configuration Files

```javascript
// build.config.js
module.exports = {
  production: {
    appId: 'com.aifeed.app',
    productName: 'AIFEED',
    copyright: 'Copyright © 2024 AIFEED',

    directories: {
      output: 'dist',
      buildResources: 'build-resources',
    },

    files: ['build/main/**/*', 'build/renderer/**/*', 'node_modules/**/*', 'package.json'],

    extraResources: [
      {
        from: 'resources/',
        to: 'resources/',
        filter: ['**/*'],
      },
    ],

    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64', 'ia32'],
        },
        {
          target: 'portable',
          arch: ['x64'],
        },
      ],
      icon: 'build-resources/icons/icon.ico',
    },

    mac: {
      target: [
        {
          target: 'dmg',
          arch: ['x64', 'arm64'],
        },
        {
          target: 'zip',
          arch: ['x64', 'arm64'],
        },
      ],
      icon: 'build-resources/icons/icon.icns',
      category: 'public.app-category.productivity',
      hardenedRuntime: true,
      entitlements: 'config/entitlements.mac.plist',
      entitlementsInherit: 'config/entitlements.mac.plist',
    },

    linux: {
      target: [
        {
          target: 'AppImage',
          arch: ['x64'],
        },
        {
          target: 'deb',
          arch: ['x64'],
        },
        {
          target: 'rpm',
          arch: ['x64'],
        },
        {
          target: 'snap',
          arch: ['x64'],
        },
      ],
      icon: 'build-resources/icons/icon.png',
      category: 'Utility',
    },

    publish: [
      {
        provider: 'github',
        owner: 'sanchez314c',
        repo: 'ai-feed',
      },
    ],
  },
};
```

## Production Build

### Build Process

```bash
# Clean previous builds
npm run clean

# Install production dependencies
npm ci --only=production

# Build application
npm run build

# Package for all platforms
npm run dist

# Package for specific platform
npm run dist:mac
npm run dist:win
npm run dist:linux
```

### Build Verification

```bash
# Verify build integrity
npm run verify:build

# Test packaged application
npm run test:packaged

# Check bundle size
npm run bloat-check
```

## Platform-Specific Deployment

### macOS Deployment

#### DMG Creation

```bash
# Create DMG installer
npm run dist:mac:dmg

# Create signed DMG
npm run dist:mac:dmg:signed

# Create notarized DMG
npm run dist:mac:dmg:notarized
```

#### App Store Distribution

```bash
# Build for Mac App Store
npm run dist:mac:mas

# Build signed for Mac App Store
npm run dist:mac:mas:signed

# Build notarized for Mac App Store
npm run dist:mac:mas:notarized
```

#### Code Signing Setup

```bash
# Install certificate
security import certificate.p12 -k ~/Library/Keychains/login.keychain

# Setup notarization
xcrun altool --notarize-app --primary-bundle-id "com.aifeed.app" \
  --username "developer@apple.com" \
  --password "@keychain:AC_PASSWORD" \
  --file "AIFEED.dmg"
```

### Windows Deployment

#### NSIS Installer

```bash
# Create NSIS installer
npm run dist:win:nsis

# Create signed NSIS installer
npm run dist:win:nsis:signed

# Create portable version
npm run dist:win:portable
```

#### Microsoft Store

```bash
# Build for Microsoft Store
npm run dist:win:store

# Create AppX package
npm run dist:win:appx
```

#### Code Signing Setup

```bash
# Install certificate
certutil -importpfx certificate.p12 -p password -s "My Certificate Store"

# Sign application
signtool sign /f certificate.p12 /p password /t http://timestamp.digicert.com /fd sha256 AIFEED.exe
```

### Linux Deployment

#### AppImage Creation

```bash
# Create AppImage
npm run dist:linux:appimage

# Create optimized AppImage
npm run dist:linux:appimage:optimized
```

#### Package Manager Distribution

```bash
# Create .deb package
npm run dist:linux:deb

# Create .rpm package
npm run dist:linux:rpm

# Create Snap package
npm run dist:linux:snap
```

#### Repository Setup

```bash
# Setup APT repository (Debian/Ubuntu)
./scripts/setup-apt-repo.sh

# Setup YUM repository (CentOS/RHEL)
./scripts/setup-yum-repo.sh

# Setup Snap Store
./scripts/setup-snap-store.sh
```

## Code Signing

### Certificate Management

#### macOS Certificates

```bash
# Generate development certificate
openssl req -newkey rsa:2048 -keyout dev-key.key -out dev-cert.csr

# Generate production certificate
openssl req -newkey rsa:2048 -keyout prod-key.key -out prod-cert.csr

# Convert to P12 format
openssl pkcs12 -export -in cert.pem -inkey key.key -out certificate.p12
```

#### Windows Certificates

```bash
# Generate self-signed certificate
makecert -r -pe -n "AIFEED" -ss My -sr CurrentUser -a sha256 -cy sha256 -len 2048

# Convert to PFX format
pvk2pfx -pvk mykey.pvk -spc mycert.spc -pfx mycert.pfx
```

### Automated Signing

```javascript
// scripts/sign.js
const { execSync } = require('child_process');
const path = require('path');

function sign(filePath, platform) {
  switch (platform) {
    case 'mac':
      execSync(
        `codesign --force --deep --sign "Developer ID Application: Your Name" "${filePath}"`
      );
      break;
    case 'win':
      execSync(
        `signtool sign /f certificate.p12 /p password /t http://timestamp.digicert.com "${filePath}"`
      );
      break;
  }
}

// Sign all built artifacts
const distPath = path.join(__dirname, '../dist');
const files = fs.readdirSync(distPath);

files.forEach(file => {
  const filePath = path.join(distPath, file);
  const platform = getPlatformFromFileName(file);
  sign(filePath, platform);
});
```

## Distribution Channels

### GitHub Releases

#### Automated Release

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build and package
        run: npm run dist
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          draft: false
          prerelease: false
          files: |
            dist/*.exe
            dist/*.dmg
            dist/*.AppImage
            dist/*.deb
            dist/*.rpm
```

### Package Managers

#### npm Registry

```bash
# Publish to npm
npm publish

# Publish with tag
npm publish --tag beta

# Publish from specific directory
cd dist && npm publish
```

#### Homebrew (macOS)

```ruby
# Formula/aifeed.rb
class Aifeed < Formula
  desc "AI Intelligence Dashboard"
  homepage "https://github.com/sanchez314c/ai-feed"
  url "https://github.com/sanchez314c/ai-feed/releases/download/v1.0.0/aifeed-1.0.0-mac.zip"
  sha256 "sha256_hash_here"
  license "MIT"

  def install
    bin.install "aifeed"
  end
end
```

#### Chocolatey (Windows)

```xml
<!-- aifeed.nuspec -->
<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://schemas.microsoft.com/packaging/2015/06/nuspec.xsd">
  <metadata>
    <id>aifeed</id>
    <version>1.0.0</version>
    <packageSourceUrl>https://github.com/sanchez314c/ai-feed</packageSourceUrl>
    <owners>AIFEED Team</owners>
    <title>AIFEED</title>
    <authors>AIFEED Team</authors>
    <projectUrl>https://github.com/sanchez314c/ai-feed</projectUrl>
    <iconUrl>https://raw.githubusercontent.com/sanchez314c/ai-feed/main/build-resources/icons/icon.png</iconUrl>
    <copyright>2024 AIFEED</copyright>
    <licenseUrl>https://github.com/sanchez314c/ai-feed/blob/main/LICENSE</licenseUrl>
    <requireLicenseAcceptance>false</requireLicenseAcceptance>
    <projectSourceUrl>https://github.com/sanchez314c/ai-feed</projectSourceUrl>
    <docsUrl>https://github.com/sanchez314c/ai-feed/blob/main/docs</docsUrl>
    <bugTrackerUrl>https://github.com/sanchez314c/ai-feed/issues</bugTrackerUrl>
    <tags>ai dashboard electron desktop</tags>
    <summary>AI Intelligence Dashboard for aggregating and analyzing AI content</summary>
    <description>
AIFEED is an AI Intelligence Dashboard that aggregates and analyzes AI-related content from multiple sources including research papers, news articles, YouTube videos, and company blogs.
    </description>
  </metadata>
  <files>
    <file src="aifeed.exe" target="tools" />
  </files>
</package>
```

## Automated Deployment

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: test
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run dist:current
        env:
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}

  deploy:
    needs: [test, build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to GitHub Releases
        uses: softprops/action-gh-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          files: |
            dist/**/*.exe
            dist/**/*.dmg
            dist/**/*.AppImage
            dist/**/*.deb
            dist/**/*.rpm
          draft: false
          prerelease: false
```

### Docker Deployment

```dockerfile
# Dockerfile.deploy
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    gtk+3.0 \
    libxss1 \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo-gobject2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["npm", "start"]
```

## Monitoring and Maintenance

### Application Monitoring

```javascript
// src/main/monitoring.js
const { app, crashReporter } = require('electron');

// Crash reporting
crashReporter.start({
  productName: 'AIFEED',
  companyName: 'AIFEED Team',
  submitURL: 'https://crash.aifeed.app/api/crash',
  uploadToServer: true,
  compress: true,
});

// Performance monitoring
const performanceMonitor = {
  startUpTime: Date.now(),
  memoryUsage: [],
  cpuUsage: [],
};

setInterval(() => {
  const memUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  performanceMonitor.memoryUsage.push({
    timestamp: Date.now(),
    ...memUsage,
  });

  performanceMonitor.cpuUsage.push({
    timestamp: Date.now(),
    ...cpuUsage,
  });
}, 60000); // Every minute
```

### Update Management

```javascript
// src/main/updater.js
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', info => {
  // Notify user of available update
});

autoUpdater.on('update-downloaded', info => {
  // Prompt user to restart
});

autoUpdater.on('error', err => {
  // Handle update errors
});
```

### Analytics Collection

```javascript
// src/main/analytics.js
const analytics = {
  track: (event, properties) => {
    // Send to analytics service
    fetch('https://analytics.aifeed.app/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event,
        properties,
        timestamp: Date.now(),
        version: app.getVersion(),
        platform: process.platform,
      }),
    });
  },
};

// Track application usage
analytics.track('app_launched');
analytics.track('feature_used', { feature: 'search' });
```

## Troubleshooting Deployment

### Common Issues

#### Build Failures

```bash
# Clear build cache
npm run clean:full

# Rebuild native modules
npm rebuild

# Check Node.js version
node --version
npm --version
```

#### Code Signing Issues

```bash
# Verify certificate
security find-identity -v -p codesigning

# Check certificate validity
security verify-cert -c certificate.pem

# Debug signing
codesign --verbose --deep --sign "Developer ID Application: Your Name" app.app
```

#### Platform-Specific Issues

**macOS:**

```bash
# Fix notarization issues
xcrun altool --notarization-info "RequestUUID"

# Check notarization status
xcrun altool --notarization-history
```

**Windows:**

```bash
# Check certificate store
certmgr.msc

# Verify signature
signtool verify /v /pa application.exe
```

**Linux:**

```bash
# Check dependencies
ldd AIFEED.AppImage

# Debug AppImage
./AIFEED.AppImage --appimage-extract-and-run
```

### Debug Mode

```bash
# Enable debug logging
DEBUG=electron:* npm start

# Enable verbose build
npm run dist -- --verbose

# Debug specific issues
npm run debug:build
npm run debug:sign
npm run debug:package
```

---

**Related Documentation:**

- [Build Guide](BUILD_COMPILE.md)
- [Configuration Guide](CONFIGURATION.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
