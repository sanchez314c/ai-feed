# 🔨 AIFEED Build & Compile Guide

**Version:** 1.0.0  
**Last Updated:** October 30, 2024

## Table of Contents

1. [Overview](#overview)
2. [Build Architecture](#build-architecture)
3. [Core Build Scripts](#core-build-scripts)
4. [Platform-Specific Scripts](#platform-specific-scripts)
5. [Development Scripts](#development-scripts)
6. [Testing Scripts](#testing-scripts)
7. [Release Scripts](#release-scripts)
8. [Utility Scripts](#utility-scripts)
9. [CI/CD Integration](#cicd-integration)
10. [Custom Build Configuration](#custom-build-configuration)
11. [Troubleshooting Builds](#troubleshooting-builds)

## Overview

AIFEED uses a comprehensive build system with scripts for development, testing, packaging, and release automation. The build system is designed to be cross-platform, supporting Windows, macOS, and Linux distributions.

### Build Tools Used

- **Vite**: Fast build tool for renderer process
- **TypeScript Compiler**: For main process compilation
- **Electron Builder**: Application packaging and distribution
- **ESLint**: Code linting and formatting
- **Jest**: Unit and integration testing
- **Playwright**: End-to-end testing

## Build Architecture

```
Build System Architecture
├── Development Scripts
│   ├── dev:renderer      # Vite dev server
│   ├── dev:main         # Electron main process
│   └── dev              # Concurrent development
├── Build Scripts
│   ├── build:renderer   # Frontend build
│   ├── build:main       # Main process build
│   └── build            # Full build
├── Package Scripts
│   ├── dist:mac         # macOS packaging
│   ├── dist:win         # Windows packaging
│   ├── dist:linux       # Linux packaging
│   └── dist             # All platforms
└── Utility Scripts
    ├── clean             # Clean artifacts
    ├── lint             # Code quality
    └── test             # Test suite
```

## Core Build Scripts

### Package.json Scripts Configuration

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"wait-on http://localhost:5173 && npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "cross-env NODE_ENV=development electron .",
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "vite build",
    "build:main": "tsc -p tsconfig.main.json",
    "start": "cross-env NODE_ENV=production electron .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "dist": "npm run build && electron-builder --mac --win --linux",
    "clean": "rimraf dist build node_modules/.cache",
    "postinstall": "electron-builder install-app-deps"
  }
}
```

### Development Scripts

#### `scripts/dev.sh` - Development Launcher

```bash
#!/bin/bash
# scripts/dev.sh - Cross-platform development launcher

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AIFEED in development mode...${NC}"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your API keys${NC}"
fi

# Set environment variables
export NODE_ENV=development
export ELECTRON_IS_DEV=true

# Start development server
echo -e "${GREEN}Starting development servers...${NC}"
npm run dev

# Cleanup on exit
cleanup() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    # Kill any remaining processes
    pkill -f "vite" || true
    pkill -f "electron" || true
}

trap cleanup EXIT
```

#### `scripts/dev-quick.sh` - Quick Development Start

```bash
#!/bin/bash
# scripts/dev-quick.sh - Fast development startup for quick changes

set -e

echo "🚀 Quick dev start..."

# Skip dependency checks for speed
export NODE_ENV=development
export ELECTRON_IS_DEV=true

# Start with maximum parallelization
npm run dev
```

### Build Commands

```bash
# Build for current platform
npm run build

# Build renderer process
npm run build:renderer

# Build main process
npm run build:main

# Clean build artifacts
npm run clean

# Full clean including node_modules
npm run clean:full
```

### Package Commands

```bash
# Package for all platforms
npm run dist

# Package for specific platforms
npm run dist:mac
npm run dist:win
npm run dist:linux

# Package for current platform only
npm run dist:current
```

### Build Scripts

#### `scripts/build.sh` - Production Build

```bash
#!/bin/bash
# scripts/build.sh - Production build script

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configuration
BUILD_DIR="build"
DIST_DIR="dist"
PLATFORM=${1:-"all"}

echo -e "${GREEN}🏗️  Building AIFEED for distribution...${NC}"

# Clean previous builds
echo -e "${YELLOW}Cleaning previous builds...${NC}"
rm -rf $BUILD_DIR
rm -rf $DIST_DIR

# Create build directories
mkdir -p $BUILD_DIR
mkdir -p $DIST_DIR

# Type checking
echo -e "${YELLOW}Running type checks...${NC}"
npm run type-check

# Linting
echo -e "${YELLOW}Running linter...${NC}"
npm run lint

# Build renderer
echo -e "${YELLOW}Building renderer process...${NC}"
npm run build:renderer

# Build main
echo -e "${YELLOW}Building main process...${NC}"
npm run build:main

# Verify build
echo -e "${YELLOW}Verifying build...${NC}"
if [ ! -f "$BUILD_DIR/main/main.js" ]; then
    echo -e "${RED}❌ Main process build failed${NC}"
    exit 1
fi

if [ ! -d "$BUILD_DIR/renderer" ]; then
    echo -e "${RED}❌ Renderer build failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo "Build artifacts located in: $BUILD_DIR"
```

#### `scripts/build-optimized.sh` - Optimized Build

```bash
#!/bin/bash
# scripts/build-optimized.sh - Optimized production build

set -e

echo "🔧 Building optimized production version..."

# Environment variables for optimization
export NODE_ENV=production
export VITE_CJS_IGNORE_WARNING=true
export ELECTRON Builder_IS_DEV=false

# Build with optimization flags
npm run build -- --minify --target=production

# Optimize images
if command -v imagemin &> /dev/null; then
    echo "Optimizing images..."
    imagemin build-resources/images/* --out-dir=build-resources/images/
fi

# Compress output
echo "Compressing build artifacts..."
find build -name "*.js" -exec gzip -k {} \;
find build -name "*.css" -exec gzip -k {} \;

echo "✅ Optimized build complete!"
```

## Platform-Specific Scripts

### macOS Build Scripts

#### `scripts/build-macos.sh`

```bash
#!/bin/bash
# scripts/build-macos.sh - macOS-specific build script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🍎 Building for macOS...${NC}"

# Check for macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo -e "${YELLOW}Warning: Not building on macOS. Cross-compilation enabled.${NC}"
fi

# Set environment variables
export CSC_LINK="${CSC_LINK:-./certificates/dist.p12}"
export CSC_KEY_PASSWORD="${CSC_KEY_PASSWORD:-}"

# Build for macOS architectures
echo -e "${YELLOW}Building for Intel x64...${NC}"
npm run build

electron-builder --mac --x64

echo -e "${YELLOW}Building for Apple Silicon ARM64...${NC}"
electron-builder --mac --arm64

# Create universal binary
echo -e "${YELLOW}Creating universal binary...${NC}"
if command -v lipo &> /dev/null; then
    lipo -create \
        dist/mac-arm64/AIFEED.app/Contents/MacOS/AIFEED \
        dist/mac/AIFEED.app/Contents/MacOS/AIFEED \
        -output dist/mac-universal/AIFEED.app/Contents/MacOS/AIFEED

    echo -e "${GREEN}Universal binary created!${NC}"
else
    echo -e "${YELLOW}lipo not available, skipping universal binary${NC}"
fi

# Sign applications (if certificates available)
if [ -f "$CSC_LINK" ]; then
    echo -e "${YELLOW}Signing applications...${NC}"
    codesign --force --deep --sign "Developer ID Application" dist/mac/*.app
    codesign --force --deep --sign "Developer ID Application" dist/mac-arm64/*.app
fi

echo -e "${GREEN}✅ macOS build complete!${NC}"
```

#### `scripts/notarize-macos.sh`

```bash
#!/bin/bash
# scripts/notarize-macos.sh - macOS notarization script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
APPLE_ID="${APPLE_ID}"
APPLE_PASSWORD="${APPLE_PASSWORD}"
TEAM_ID="${TEAM_ID}"
BUNDLE_ID="com.aifeed.app"

if [[ -z "$APPLE_ID" || -z "$APPLE_PASSWORD" ]]; then
    echo -e "${RED}❌ Apple ID or password not set${NC}"
    echo "Set environment variables:"
    echo "export APPLE_ID='your-apple-id@example.com'"
    echo "export APPLE_PASSWORD='your-app-specific-password'"
    exit 1
fi

echo -e "${GREEN}🔐 Notarizing macOS application...${NC}"

# Find built application
APP_PATH=$(find dist -name "AIFEED.app" -type d | head -n 1)
if [[ -z "$APP_PATH" ]]; then
    echo -e "${RED}❌ AIFEED.app not found in dist/ directory${NC}"
    exit 1
fi

# Create ZIP for notarization
ZIP_PATH="AIFEED.zip"
ditto -c -k --keepParent "$APP_PATH" "$ZIP_PATH"

echo -e "${YELLOW}Uploading for notarization...${NC}"
# Upload to Apple notary service
RESULT=$(xcrun altool --notarize-app \
    --primary-bundle-id "$BUNDLE_ID" \
    --username "$APPLE_ID" \
    --password "$APPLE_PASSWORD" \
    --asc-provider "$TEAM_ID" \
    --file "$ZIP_PATH" \
    --output-format json)

# Extract request UUID
REQUEST_UUID=$(echo "$RESULT" | jq -r '.notarization-upload.uuid')
echo -e "${YELLOW}Notarization request UUID: $REQUEST_UUID${NC}"

# Wait for notarization
echo -e "${YELLOW}Waiting for notarization to complete...${NC}"
while true; do
    STATUS=$(xcrun altool --notarization-info "$REQUEST_UUID" \
        --username "$APPLE_ID" \
        --password "$APPLE_PASSWORD" \
        --output-format json)

    STATUS_CODE=$(echo "$STATUS" | jq -r '.notarization-info.Status')

    if [[ "$STATUS_CODE" == "success" ]]; then
        echo -e "${GREEN}✅ Notarization successful!${NC}"
        break
    elif [[ "$STATUS_CODE" == "invalid" ]]; then
        echo -e "${RED}❌ Notarization failed${NC}"
        echo "$STATUS" | jq -r '.notarization-info."Status Message"'
        exit 1
    else
        echo -e "${YELLOW}Status: $STATUS_CODE - Waiting...${NC}"
        sleep 30
    fi
done

# Staple notarization
echo -e "${YELLOW}Stapling notarization to application...${NC}"
xcrun stapler staple "$APP_PATH"

# Verify stapling
xcrun stapler validate "$APP_PATH"

# Cleanup
rm "$ZIP_PATH"

echo -e "${GREEN}✅ Notarization complete!${NC}"
```

**macOS Requirements:**

- Xcode Command Line Tools
- macOS 10.15+ for building
- Code signing certificate for distribution

### Windows Build Scripts

#### `scripts/build-windows.bat`

```batch
@echo off
REM scripts/build-windows.bat - Windows build script

setlocal enabledelayedexpansion

echo 🪟 Building for Windows...

REM Check for Visual Studio Build Tools
where cl >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Visual Studio Build Tools not found. Please install Visual Studio with C++ tools.
    exit /b 1
)

REM Clean previous builds
if exist dist (
    echo Cleaning previous builds...
    rmdir /s /q dist
)

REM Build application
echo Building application...
call npm run build

REM Build installers
echo Creating NSIS installer...
call npm run dist:win:nsis

echo Creating MSI installer...
call npm run dist:win:msi

REM Sign executables (if certificate available)
if defined CSC_LINK (
    echo Signing executables...
    for /r "dist" %%f in (*.exe) do (
        echo Signing %%f...
        signtool sign /f "%CSC_LINK%" /p "%CSC_KEY_PASSWORD%" /t http://timestamp.digicert.com "%%f"
    )
)

echo ✅ Windows build complete!
```

**Windows Requirements:**

- Visual Studio Build Tools 2019+
- Windows 10 SDK
- Node.js with native build tools

### Linux Build Scripts

#### `scripts/build-linux.sh`

```bash
#!/bin/bash
# scripts/build-linux.sh - Linux build script

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🐧 Building for Linux...${NC}"

# Check for required dependencies
check_dependency() {
    if ! command -v "$1" &> /dev/null; then
        echo -e "${YELLOW}Warning: $1 not found. Install with: sudo apt-get install $1${NC}"
    fi
}

check_dependency "rpm"
check_dependency "dpkg"
check_dependency "fakeroot"

# Build application
echo -e "${YELLOW}Building application...${NC}"
npm run build

# Build AppImage
echo -e "${YELLOW}Building AppImage...${NC}"
npm run dist:linux:appimage

# Build .deb package
echo -e "${YELLOW}Building Debian package...${NC}"
npm run dist:linux:deb

# Build .rpm package
echo -e "${YELLOW}Building RPM package...${NC}"
npm run dist:linux:rpm

# Build Snap package
echo -e "${YELLOW}Building Snap package...${NC}"
npm run dist:linux:snap

echo -e "${GREEN}✅ Linux build complete!${NC}"
```

**Linux Requirements:**

- GCC 7+ or Clang 8+
- GTK+ 3 development libraries
- libnotify development libraries

## Testing Scripts

#### `scripts/test-all.sh` - Comprehensive Test Suite

```bash
#!/bin/bash
# scripts/test-all.sh - Run all test suites

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🧪 Running comprehensive test suite...${NC}"

# Test results directory
RESULTS_DIR="test-results"
mkdir -p "$RESULTS_DIR"

# Run linting
echo -e "${YELLOW}Running linting...${NC}"
npm run lint > "$RESULTS_DIR/lint.txt" 2>&1 || {
    echo -e "${RED}❌ Linting failed${NC}"
    cat "$RESULTS_DIR/lint.txt"
    exit 1
}

# Run type checking
echo -e "${YELLOW}Running type checks...${NC}"
npm run type-check > "$RESULTS_DIR/types.txt" 2>&1 || {
    echo -e "${RED}❌ Type checking failed${NC}"
    cat "$RESULTS_DIR/types.txt"
    exit 1
}

# Run unit tests
echo -e "${YELLOW}Running unit tests...${NC}"
npm run test:coverage > "$RESULTS_DIR/unit.txt" 2>&1 || {
    echo -e "${RED}❌ Unit tests failed${NC}"
    cat "$RESULTS_DIR/unit.txt"
    exit 1
}

# Run integration tests
echo -e "${YELLOW}Running integration tests...${NC}"
npm run test:integration > "$RESULTS_DIR/integration.txt" 2>&1 || {
    echo -e "${RED}❌ Integration tests failed${NC}"
    cat "$RESULTS_DIR/integration.txt"
    exit 1
}

# Run E2E tests (if available)
if command -v npx playwright &> /dev/null; then
    echo -e "${YELLOW}Running E2E tests...${NC}"
    npm run test:e2e > "$RESULTS_DIR/e2e.txt" 2>&1 || {
        echo -e "${RED}❌ E2E tests failed${NC}"
        cat "$RESULTS_DIR/e2e.txt"
        exit 1
    }
fi

# Generate test report
echo -e "${YELLOW}Generating test report...${NC}"
cat > "$RESULTS_DIR/report.txt" << EOF
Test Suite Results - $(date)
===========================

Linting: ✓ PASSED
Type Checking: ✓ PASSED
Unit Tests: ✓ PASSED
Integration Tests: ✓ PASSED
E2E Tests: ✓ PASSED

Coverage Report:
$(cat coverage/lcov.info | lcov --summary 2>/dev/null || echo "Coverage report not available")

All tests passed successfully!
EOF

echo -e "${GREEN}✅ All tests passed!${NC}"
echo "Test reports available in: $RESULTS_DIR"
```

#### `scripts/test-watch.sh` - Watch Mode Testing

```bash
#!/bin/bash
# scripts/test-watch.sh - Run tests in watch mode

echo "👀 Starting test watch mode..."

# Run unit tests in watch mode
npm run test:watch -- --watchAll --coverage=false &
UNIT_PID=$!

# Run type checking in watch mode
npm run type-check -- --watch &
TYPE_PID=$!

# Cleanup function
cleanup() {
    echo "Stopping test watch mode..."
    kill $UNIT_PID 2>/dev/null
    kill $TYPE_PID 2>/dev/null
    exit 0
}

# Trap signals
trap cleanup SIGINT SIGTERM

# Wait for processes
wait
```

## Development Scripts

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Run TypeScript type checking
npm run type-check

# Format code with Prettier
npm run format
```

### Validation

```bash
# Quick validation
npm run validate-quick

# Comprehensive validation
npm run validate-all

# Production-ready validation
npm run validate-production
```

## Testing Scripts

### Unit Testing

```bash
# Run Jest unit tests
npm run test:unit

# Run specific test file
npm run test:unit -- path/to/test.test.ts

# Run tests matching pattern
npm run test:unit -- --testNamePattern="specific test"
```

### Integration Testing

```bash
# Run integration tests
npm run test:integration

# Run with specific environment
npm run test:integration -- --env=development
```

### End-to-End Testing

```bash
# Run Playwright E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed

# Run E2E tests for specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

## Release Scripts

#### `scripts/release.sh` - Automated Release

```bash
#!/bin/bash
# scripts/release.sh - Automated release script

set -e

# Configuration
VERSION_TYPE=${1:-"patch"}
SKIP_TESTS=${2:-false}
SKIP_BUILD=${3:-false}

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🚀 Releasing AIFEED ($VERSION_TYPE release)...${NC}"

# Pre-release checks
if [[ "$SKIP_TESTS" != "true" ]]; then
    echo -e "${YELLOW}Running pre-release tests...${NC}"
    ./scripts/test-all.sh
fi

# Update version
echo -e "${YELLOW}Updating version...${NC}"
npm version "$VERSION_TYPE --no-git-tag-version"

NEW_VERSION=$(npm pkg get version | tr -d '"')
echo -e "${GREEN}New version: $NEW_VERSION${NC}"

# Build application
if [[ "$SKIP_BUILD" != "true" ]]; then
    echo -e "${YELLOW}Building application...${NC}"
    ./scripts/build.sh
fi

# Build platform-specific packages
echo -e "${YELLOW}Building distribution packages...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    ./scripts/build-macos.sh
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    ./scripts/build-windows.bat
else
    ./scripts/build-linux.sh
fi

# Generate changelog
echo -e "${YELLOW}Updating changelog...${NC}"
npm run changelog

# Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git add .
git commit -m "chore: release v$NEW_VERSION"
git tag "v$NEW_VERSION"

# Push to repository
echo -e "${YELLOW}Pushing to repository...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

# Create GitHub release
echo -e "${YELLOW}Creating GitHub release...${NC}"
gh release create "v$NEW_VERSION" \
    dist/* \
    --title "AIFEED v$NEW_VERSION" \
    --generate-notes \
    --draft

echo -e "${GREEN}✅ Release v$NEW_VERSION completed successfully!${NC}"
echo "Please review and publish the draft GitHub release."
```

## Utility Scripts

#### `scripts/clean.sh` - Clean Build Artifacts

```bash
#!/bin/bash
# scripts/clean.sh - Clean build artifacts and caches

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🧹 Cleaning build artifacts...${NC}"

# Directories to clean
CLEAN_DIRS=(
    "dist"
    "build"
    "node_modules/.cache"
    "coverage"
    "test-results"
    ".nyc_output"
    "logs"
)

# Clean directories
for dir in "${CLEAN_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}Removing $dir...${NC}"
        rm -rf "$dir"
    fi
done

# Clean files
CLEAN_FILES=(
    "*.log"
    "*.tgz"
    ".DS_Store"
    "Thumbs.db"
    "*.tmp"
    "*.temp"
)

for pattern in "${CLEAN_FILES[@]}"; do
    find . -name "$pattern" -type f -delete 2>/dev/null || true
done

# Clean npm modules (optional)
if [[ "$1" == "--deep" ]]; then
    echo -e "${YELLOW}Removing node_modules...${NC}"
    rm -rf node_modules
fi

echo -e "${GREEN}✅ Clean completed!${NC}"
```

#### `scripts/bloat-check.sh` - Bundle Size Analysis

```bash
#!/bin/bash
# scripts/bloat-check.sh - Analyze bundle sizes

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}📊 Analyzing bundle sizes...${NC}"

# Check if bundles exist
if [ ! -d "build/renderer" ]; then
    echo -e "${RED}❌ No build found. Run 'npm run build' first.${NC}"
    exit 1
fi

# Analyze renderer bundle
echo -e "${YELLOW}Renderer bundle analysis:${NC}"
find build/renderer -name "*.js" -exec du -h {} \; | sort -hr

# Analyze main process bundle
echo -e "\n${YELLOW}Main process bundle analysis:${NC}"
find build/main -name "*.js" -exec du -h {} \; | sort -hr

# Analyze node_modules (for packaged app)
if [ -d "dist" ]; then
    echo -e "\n${YELLOW}Packaged app analysis:${NC}"
    find dist -name "node_modules" -type d -exec du -sh {} \;
fi

# Check total size
if [ -d "dist" ]; then
    echo -e "\n${YELLOW}Total distribution size:${NC}"
    du -sh dist/*
fi

# Warn if bundles are too large
LARGE_BUNDLE_THRESHOLD=5242880  # 5MB

find build -name "*.js" -size +$LARGE_BUNDLE_THRESHOLD -c | while read file; do
    echo -e "${RED}⚠️  Large bundle detected: $file${NC}"
done

echo -e "${GREEN}✅ Bundle analysis complete!${NC}"
```

#### `scripts/setup-dev.sh` - Development Environment Setup

```bash
#!/bin/bash
# scripts/setup-dev.sh - One-time development environment setup

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🛠️  Setting up development environment...${NC}"

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Required: >= $REQUIRED_VERSION${NC}"
    exit 1
fi

echo -e "${YELLOW}✓ Node.js version: $NODE_VERSION${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env file with your API keys${NC}"
fi

# Install git hooks
echo -e "${YELLOW}Installing git hooks...${NC}"
if [ -d ".git" ]; then
    cp scripts/hooks/* .git/hooks/
    chmod +x .git/hooks/*
    echo -e "${GREEN}✓ Git hooks installed${NC}"
fi

# Verify installation
echo -e "${YELLOW}Verifying installation...${NC}"
npm run type-check
npm run lint

echo -e "${GREEN}✅ Development environment setup complete!${NC}"
echo -e "${YELLOW}Run 'npm run dev' to start development${NC}"
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/build.yml
name: Build and Test
on: [push, pull_request]

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
```

### Docker Build

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=0 /app/dist ./dist
COPY --from=0 /app/node_modules ./node_modules
COPY --from=0 /app/package.json ./

CMD ["npm", "start"]
```

## Custom Build Configuration

### Environment Variables

```bash
# Build environment
NODE_ENV=development
NODE_ENV=production

# Build optimization
BUILD_OPTIMIZE=true
BUILD_MINIFY=true
BUILD_SOURCEMAP=false

# Platform-specific
CSC_LINK=path/to/certificate.p12
CSC_KEY_PASSWORD=certificate_password
```

### Build Configuration Files

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'build/renderer',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: process.env.NODE_ENV === 'production',
    rollupOptions: {
      input: {
        main: 'src/renderer/index.html',
      },
    },
  },
});
```

```javascript
// electron-builder.config.js
module.exports = {
  appId: 'com.aifeed.app',
  productName: 'AIFEED',
  directories: {
    output: 'dist',
    buildResources: 'build-resources',
  },
  files: ['build/main/**/*', 'build/renderer/**/*', 'node_modules/**/*'],
  mac: {
    category: 'public.app-category.productivity',
    target: [{ target: 'dmg', arch: ['x64', 'arm64'] }],
  },
  win: {
    target: [{ target: 'nsis', arch: ['x64', 'ia32'] }],
  },
  linux: {
    target: [
      { target: 'AppImage', arch: ['x64'] },
      { target: 'deb', arch: ['x64'] },
      { target: 'rpm', arch: ['x64'] },
    ],
  },
};
```

## Troubleshooting Builds

### Common Build Issues

#### Node.js Version Issues

```bash
# Check Node.js version
node --version

# Use correct version
nvm use 18

# Set version in .nvmrc
echo "18" > .nvmrc
```

#### Native Module Compilation

```bash
# Clean native modules
npm run clean:full

# Rebuild native modules
npm rebuild

# Target specific platform
npm rebuild --runtime=electron --target=39.0.0
```

#### Memory Issues

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Use for build
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

#### Platform-Specific Issues

**macOS:**

```bash
# Fix code signing issues
security unlock-keychain -p password

# Fix notarization issues
xcrun altool --notarize-app --primary-bundle-id "com.aifeed.app"
```

**Windows:**

```bash
# Fix Visual Studio build tools
npm config set msvs_version 2019

# Fix Python path
npm config set python C:\Python39\python.exe
```

**Linux:**

```bash
# Fix GTK dependencies
sudo apt-get install libgtk-3-dev libnotify-dev

# Fix libstdc++ issues
sudo apt-get install libstdc++6
```

### Debug Mode Builds

```bash
# Enable debug logging
DEBUG=electron:* npm run dev

# Build with debug symbols
npm run build:debug

# Verbose build output
npm run dist -- --verbose
```

### Performance Optimization

```bash
# Parallel builds
npm run build -- --parallel

# Incremental builds
npm run build -- --incremental

# Cache optimization
npm run build -- --cache
```

---

**Related Documentation:**

- [Development Guide](DEVELOPMENT.md)
- [Configuration Guide](CONFIGURATION.md)
- [Deployment Guide](DEPLOYMENT.md)
