#!/bin/bash

# Comprehensive Build, Compile & Distribution Script
# Builds ALL platform variants with maximum optimization and bloat analysis
# Based on existing dist inventory, builds: macOS (Intel/ARM/Universal), Windows (x64/x86/ARM64), Linux (x64/ARM64/ARMv7)

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✔${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠${NC} $1"
}

print_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ✗${NC} $1"
}

print_info() {
    echo -e "${CYAN}[$(date +'%H:%M:%S')] ℹ${NC} $1"
}

print_header() {
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE} $1${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo ""
}

# Function to convert bytes to human readable
human_readable() {
    local bytes=$1
    if [ -z "$bytes" ] || [ "$bytes" = "0" ]; then
        echo "0B"
    elif [ $bytes -gt 1073741824 ]; then
        echo "$(($bytes / 1073741824)).$((($bytes % 1073741824) * 100 / 1073741824))GB"
    elif [ $bytes -gt 1048576 ]; then
        echo "$(($bytes / 1048576)).$((($bytes % 1048576) * 100 / 1048576))MB"
    elif [ $bytes -gt 1024 ]; then
        echo "$(($bytes / 1024))KB"
    else
        echo "${bytes}B"
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to cleanup system temp directories
cleanup_system_temp() {
    print_status "🧹 Cleaning system temp directories..."

    # macOS temp cleanup
    if [ "$(uname)" = "Darwin" ]; then
        TEMP_DIR=$(find /private/var/folders -name "Temporary*" -type d 2>/dev/null | head -1)
        if [ -n "$TEMP_DIR" ]; then
            PARENT_DIR=$(dirname "$TEMP_DIR")
            BEFORE_SIZE=$(du -sh "$PARENT_DIR" 2>/dev/null | cut -f1)

            # Clean up build artifacts (older than 1 day)
            find "$PARENT_DIR" -name "t-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "CFNetworkDownload_*.tmp" -mtime +1 -delete 2>/dev/null || true
            find "$PARENT_DIR" -name "electron-download-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find "$PARENT_DIR" -name "package-dir-staging-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true

            AFTER_SIZE=$(du -sh "$PARENT_DIR" 2>/dev/null | cut -f1)
            print_success "System temp cleanup: $BEFORE_SIZE → $AFTER_SIZE"
        fi
    fi

    # Linux temp cleanup
    if [ "$(uname)" = "Linux" ]; then
        if [ -d "/tmp" ]; then
            BEFORE_SIZE=$(du -sh /tmp 2>/dev/null | cut -f1)
            find /tmp -name "electron-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            find /tmp -name "npm-*" -type d -mtime +1 -exec rm -rf {} + 2>/dev/null || true
            AFTER_SIZE=$(du -sh /tmp 2>/dev/null | cut -f1)
            print_success "System temp cleanup: $BEFORE_SIZE → $AFTER_SIZE"
        fi
    fi
}

# Function to setup custom temp directory
setup_build_temp() {
    BUILD_TEMP_DIR="$SCRIPT_DIR/../build-temp"
    mkdir -p "$BUILD_TEMP_DIR"
    export TMPDIR="$BUILD_TEMP_DIR"
    export TMP="$BUILD_TEMP_DIR"
    export TEMP="$BUILD_TEMP_DIR"
    export ELECTRON_CACHE="$BUILD_TEMP_DIR/electron-cache"
    print_info "Using custom temp directory: $BUILD_TEMP_DIR"
}

# Function to perform comprehensive bloat check
comprehensive_bloat_check() {
    print_header "🔍 COMPREHENSIVE BLOAT ANALYSIS"

    # Check if in Node.js project
    if [ ! -f "package.json" ]; then
        print_error "No package.json found."
        return 1
    fi

    PROJECT_NAME=$(grep '"name"' package.json | cut -d'"' -f4)
    print_status "Analyzing project: $PROJECT_NAME"

    # 1. Node modules analysis
    print_status "📦 Analyzing node_modules..."

    if [ -d "node_modules" ]; then
        NODE_SIZE=$(du -sb node_modules 2>/dev/null | cut -f1)
        NODE_SIZE=${NODE_SIZE:-0}
        NODE_SIZE_HR=$(human_readable $NODE_SIZE)
        print_info "Total node_modules size: $NODE_SIZE_HR"

        # Size categories
        if [ $NODE_SIZE -gt 1073741824 ]; then
            print_warning "⚠️  LARGE: Node modules > 1GB - optimization recommended"
        elif [ $NODE_SIZE -gt 536870912 ]; then
            print_warning "⚠️  MEDIUM: Node modules > 500MB - consider cleanup"
        else
            print_success "✓ Node modules size acceptable"
        fi

        print_info "Top 10 largest dependencies:"
        du -sh node_modules/* 2>/dev/null | sort -hr | head -10 | while read size dir; do
            basename_dir=$(basename "$dir")
            if [ ${#size} -gt 4 ] || [[ $size == *"M"* ]] || [[ $size == *"G"* ]]; then
                print_warning "  $size - $basename_dir"
            else
                print_info "  $size - $basename_dir"
            fi
        done
    fi

    # 2. Dependencies analysis
    print_status "📋 Analyzing dependencies..."

    if command -v npm >/dev/null 2>&1; then
        PROD_DEPS=$(npm ls --production --depth=0 2>/dev/null | grep -c "├─\|└─" || echo "0")
        DEV_DEPS=$(npm ls --development --depth=0 2>/dev/null | grep -c "├─\|└─" || echo "0")

        print_info "Production dependencies: $PROD_DEPS"
        print_info "Development dependencies: $DEV_DEPS"

        # Check for duplicates
        DUPES=$(npm dedupe --dry-run 2>/dev/null | grep -c "removed" || echo "0")
        DUPES=${DUPES:-0}
        if [ "$DUPES" -gt 0 ]; then
            print_warning "⚠️  Found $DUPES duplicate packages - run 'npm dedupe'"
        else
            print_success "✓ No duplicate packages found"
        fi

        # Check for unused dependencies
        if command -v npx >/dev/null 2>&1; then
            UNUSED=$(npx depcheck --json 2>/dev/null | grep -o '"dependencies":\[[^]]*\]' | grep -o '"[^"]*"' | wc -l || echo "0")
            UNUSED=${UNUSED:-0}
            if [ "$UNUSED" -gt 0 ]; then
                print_warning "⚠️  Found ~$UNUSED potentially unused dependencies"
            else
                print_success "✓ No obviously unused dependencies"
            fi
        fi
    fi

    # 3. Build configuration analysis
    print_status "⚙️  Analyzing build configuration..."

    if grep -q '"build":' package.json; then
        if grep -q '"node_modules/\*\*/\*"' package.json; then
            print_error "❌ CRITICAL: Including 'node_modules/**/*' in build files!"
        fi
        if grep -q '"dist/\*\*/\*"' package.json; then
            print_warning "⚠️  Including 'dist/**/*' may include unwanted files"
        fi
        if ! grep -q '"\!\*\*\/\*.map"' package.json; then
            print_warning "⚠️  Not excluding source maps (*.map files)"
        fi
    fi
}

# Function to cleanup build temp after build
cleanup_build_temp() {
    if [ -n "$BUILD_TEMP_DIR" ] && [ -d "$BUILD_TEMP_DIR" ]; then
        print_status "🧹 Cleaning build temp directory..."
        TEMP_SIZE=$(du -sh "$BUILD_TEMP_DIR" 2>/dev/null | cut -f1 || echo "0")
        rm -rf "$BUILD_TEMP_DIR" 2>/dev/null || true
        print_success "Cleaned build temp: $TEMP_SIZE"
    fi
}

# Function to display build results summary
display_build_results() {
    print_header "📋 COMPREHENSIVE BUILD RESULTS"

    if [ -d "dist" ]; then
        TOTAL_SIZE=$(du -sb dist 2>/dev/null | cut -f1)
        TOTAL_SIZE_HR=$(human_readable $TOTAL_SIZE)
        print_info "Total build output size: $TOTAL_SIZE_HR"

        echo ""
        print_success "🍎 macOS Builds:"
        for file in dist/*.dmg dist/*.pkg dist/*-mac.zip; do
            if [ -f "$file" ]; then
                SIZE=$(ls -lah "$file" | awk '{print $5}')
                NAME=$(basename "$file")
                print_success "  ✓ $NAME: $SIZE"
            fi
        done

        echo ""
        print_success "🪟 Windows Builds:"
        for file in dist/*.exe dist/*.msi dist/*-win.zip; do
            if [ -f "$file" ]; then
                SIZE=$(ls -lah "$file" | awk '{print $5}')
                NAME=$(basename "$file")
                print_success "  ✓ $NAME: $SIZE"
            fi
        done

        echo ""
        print_success "🐧 Linux Builds:"
        for file in dist/*.AppImage dist/*.deb dist/*.rpm dist/*.snap dist/*-linux.tar.*; do
            if [ -f "$file" ]; then
                SIZE=$(ls -lah "$file" | awk '{print $5}')
                NAME=$(basename "$file")
                print_success "  ✓ $NAME: $SIZE"
            fi
        done

        echo ""
        print_info "📁 Unpacked Applications:"
        for dir in dist/mac dist/mac-arm64 dist/mac-universal dist/win-unpacked dist/win-ia32-unpacked dist/win-arm64-unpacked dist/linux-unpacked dist/linux-arm64-unpacked dist/linux-armv7l-unpacked; do
            if [ -d "$dir" ]; then
                SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
                NAME=$(basename "$dir")
                print_info "  • $NAME: $SIZE"
            fi
        done

        # Package count summary
        MAC_COUNT=$(find dist -name "*.dmg" -o -name "*.pkg" -o -name "*-mac.zip" | wc -l)
        WIN_COUNT=$(find dist -name "*.exe" -o -name "*.msi" -o -name "*-win.zip" | wc -l)
        LINUX_COUNT=$(find dist -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.snap" -o -name "*-linux.tar.*" | wc -l)

        echo ""
        print_info "📊 Package Summary:"
        print_info "  • macOS packages: $MAC_COUNT"
        print_info "  • Windows packages: $WIN_COUNT"
        print_info "  • Linux packages: $LINUX_COUNT"
        print_info "  • Total packages: $((MAC_COUNT + WIN_COUNT + LINUX_COUNT))"
    else
        print_error "No dist directory found. Build failed."
    fi
}

# Main script execution
print_header "🚀 COMPREHENSIVE BUILD, COMPILE & DISTRIBUTION"

# Parse command line arguments
SKIP_BLOAT=false
SKIP_TEMP_CLEAN=false
HELP=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-bloat)
            SKIP_BLOAT=true
            shift
            ;;
        --skip-temp-clean)
            SKIP_TEMP_CLEAN=true
            shift
            ;;
        --help)
            HELP=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            HELP=true
            ;;
    esac
done

if [ "$HELP" = true ]; then
    echo "Comprehensive Build, Compile & Distribution Script"
    echo ""
    echo "Usage: ./build-compile-dist.sh [options]"
    echo ""
    echo "Options:"
    echo "  --skip-bloat       Skip bloat analysis"
    echo "  --skip-temp-clean  Skip system temp cleanup"
    echo "  --help             Display this help message"
    echo ""
    echo "This script builds ALL platform variants:"
    echo "  • macOS: Intel (x64), ARM64, Universal"
    echo "  • Windows: x64, x86 (ia32), ARM64"
    echo "  • Linux: x64, ARM64, ARMv7l"
    echo "  • Package types: DMG, PKG, EXE, MSI, ZIP, AppImage, DEB, RPM, SNAP, TAR"
    exit 0
fi

# Trap to ensure cleanup on exit
trap cleanup_build_temp EXIT

# Step 1: Check requirements
print_status "Checking requirements..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "All requirements met"

# Step 2: System temp cleanup
if [ "$SKIP_TEMP_CLEAN" = false ]; then
    cleanup_system_temp
fi

# Step 3: Setup custom build temp
setup_build_temp

# Step 4: Comprehensive bloat check
if [ "$SKIP_BLOAT" = false ]; then
    comprehensive_bloat_check
fi

# Step 5: Clean everything
print_status "🧹 Purging all existing builds..."
rm -rf dist/
rm -rf build/
rm -rf node_modules/.cache/
rm -rf out/
rm -rf release/
print_success "All build artifacts purged"

# Step 6: Install/update dependencies
print_status "📦 Installing/updating dependencies..."
npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies"
    exit 1
fi

# Install electron-builder if not present
if ! npm list electron-builder >/dev/null 2>&1; then
    print_status "Installing electron-builder..."
    npm install --save-dev electron-builder
fi

print_success "Dependencies ready"

# Step 7: TypeScript compilation check
print_status "🔨 Compiling TypeScript..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    print_warning "TypeScript compilation warnings detected"
fi

# Step 8: Build React app
print_status "⚛️ Building React application..."
npm run build
if [ $? -ne 0 ]; then
    print_error "React build failed"
    exit 1
fi
print_success "React build completed"

# Step 9: Comprehensive build for ALL platforms
print_header "🏗️ BUILDING ALL PLATFORM VARIANTS"
print_status "Targets: macOS (Intel + ARM + Universal), Windows (x64 + x86 + ARM64), Linux (x64 + ARM64 + ARMv7l)"
print_status "Package types: DMG, PKG, EXE, MSI, ZIP, AppImage, DEB, RPM, SNAP, TAR"

# Set maximum parallelism for builds
export ELECTRON_BUILDER_PARALLELISM=18

# Build for all platforms
print_status "Building for ALL platforms (this will take a while)..."
npm run dist:maximum
BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "All platform builds completed successfully"

# Step 10: Additional package generation
print_status "📦 Generating additional package types..."

# Generate specific packages if needed
if [ ! -f "dist/*.msi" ] && [ -f "dist/*.exe" ]; then
    print_status "Generating MSI installer..."
    npm run dist:win:msi 2>/dev/null || print_warning "MSI generation requires additional setup"
fi

# Step 11: Standardize folder names
print_status "📁 Standardizing output folder names..."

# Rename Windows folders to standard naming
if [ -d "dist/win-unpacked" ]; then
    mv "dist/win-unpacked" "dist/win-x64-unpacked" 2>/dev/null || true
fi

if [ -d "dist/win-ia32-unpacked" ]; then
    mv "dist/win-ia32-unpacked" "dist/win-x32-unpacked" 2>/dev/null || true
fi

print_success "Folder naming standardized"

# Step 12: Final comprehensive build results
display_build_results

# Step 13: Final cleanup and recommendations
print_header "🧹 FINAL CLEANUP & OPTIMIZATION"

# Clean build directory
print_status "Cleaning build directory..."
if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1 || echo "0")
    rm -rf build/
    print_success "Cleaned build directory: $BUILD_SIZE"
fi

# Final recommendations
print_info "💡 Optimization Tips:"
print_info "  • Run 'npm dedupe' to remove duplicate packages"
print_info "  • Run 'npx depcheck' to find unused dependencies"
print_info "  • Review build configuration in package.json"
print_info "  • Consider compression settings for smaller packages"

print_header "🎉 COMPREHENSIVE BUILD COMPLETE!"
print_success "All binaries and packages are in: ./dist/"
print_status "Build includes all platform variants and package types"

echo ""
print_info "To run specific builds:"
print_info "  macOS:   ./scripts/run-macos.sh"
print_info "  Windows: scripts\\run-windows.bat"
print_info "  Linux:   ./scripts/run-linux.sh"

# Final summary
TOTAL_FILES=$(find dist -type f \( -name "*.dmg" -o -name "*.pkg" -o -name "*.exe" -o -name "*.msi" -o -name "*.zip" -o -name "*.AppImage" -o -name "*.deb" -name "*.rpm" -o -name "*.snap" -o -name "*.tar.*" \) | wc -l)
print_success "Generated $TOTAL_FILES distribution packages across all platforms"

# Final cleanup - ensure build temp directory is cleaned up
cleanup_build_temp

# Clean build directory as specified in requirements
print_status "🧹 Cleaning build directory..."
if [ -d "build" ]; then
    BUILD_SIZE=$(du -sh build 2>/dev/null | cut -f1 || echo "0")
    rm -rf build/
    print_success "Cleaned build directory: $BUILD_SIZE"
fi