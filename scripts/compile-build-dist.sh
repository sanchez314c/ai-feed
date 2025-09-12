#!/bin/bash

# Complete Multi-Platform Build Script for AIFEED
# Builds for macOS, Windows, and Linux with all installer types
# Includes automatic temp cleanup and bloat monitoring

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
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Global variables for temp management and build optimization
CUSTOM_TEMP_DIR=""
BUILD_START_TIME=$(date +%s)
ORIGINAL_TEMP_SIZE=0
PARALLEL_JOBS=18

# Temp directory management functions
setup_custom_temp() {
    print_status "🗂️ Setting up custom temp directory..."
    
    # Create custom temp directory
    CUSTOM_TEMP_DIR="$PROJECT_DIR/temp-build-$$"
    mkdir -p "$CUSTOM_TEMP_DIR"
    
    # Set environment variables to use custom temp
    export TMPDIR="$CUSTOM_TEMP_DIR"
    export TMP="$CUSTOM_TEMP_DIR"  
    export TEMP="$CUSTOM_TEMP_DIR"
    
    # Record original temp size
    if [ -d "/tmp" ]; then
        ORIGINAL_TEMP_SIZE=$(du -sk /tmp 2>/dev/null | cut -f1 || echo "0")
    fi
    
    print_success "Custom temp directory: $CUSTOM_TEMP_DIR"
}

cleanup_temp_dirs() {
    print_status "🧹 Comprehensive temp cleanup..."
    
    # Clean custom temp directory
    if [ -n "$CUSTOM_TEMP_DIR" ] && [ -d "$CUSTOM_TEMP_DIR" ]; then
        print_status "Removing custom temp: $CUSTOM_TEMP_DIR"
        rm -rf "$CUSTOM_TEMP_DIR"
    fi
    
    # Clean system temp electron-related files
    print_status "Cleaning system temp electron files..."
    find /tmp -name "*electron*" -type d -mtime +1 2>/dev/null | head -20 | while read -r dir; do
        if [ -w "$dir" ]; then
            echo "  Removing: $dir"
            rm -rf "$dir"
        fi
    done
    
    # Clean npm cache temp files
    if [ -d "$HOME/.npm/_cacache/tmp" ]; then
        print_status "Cleaning npm cache temp files..."
        rm -rf "$HOME/.npm/_cacache/tmp"/*
    fi
    
    # Clean electron temp files
    if [ -d "$HOME/.electron" ]; then
        print_status "Cleaning electron temp cache..."
        find "$HOME/.electron" -name "*.tmp" -delete 2>/dev/null || true
    fi
    
    # Clean node_modules temp files
    print_status "Cleaning node_modules temp files..."
    find node_modules -name "*.tmp" -delete 2>/dev/null || true
    find node_modules -name ".DS_Store" -delete 2>/dev/null || true
    
    print_success "Temp cleanup completed"
}

check_build_bloat() {
    print_status "📊 Analyzing build bloat..."
    
    if [ ! -d "dist" ]; then
        print_warning "No dist directory found for bloat analysis"
        return
    fi
    
    local total_size=$(du -sh dist 2>/dev/null | cut -f1)
    local file_count=$(find dist -type f | wc -l | tr -d ' ')
    
    print_info "📈 Build Size Analysis:"
    echo "   Total size: $total_size"
    echo "   File count: $file_count files"
    
    # Analyze largest files
    print_info "🔍 Largest build files (top 10):"
    find dist -type f -exec ls -lh {} + 2>/dev/null | \
        sort -k5 -hr | head -10 | \
        awk '{print "   " $9 " (" $5 ")"}'
    
    # Check for common bloat patterns
    local js_maps=$(find dist -name "*.js.map" | wc -l | tr -d ' ')
    local test_files=$(find dist -name "*test*" -o -name "*spec*" | wc -l | tr -d ' ')
    local docs=$(find dist -name "*.md" -o -name "*.txt" | wc -l | tr -d ' ')
    
    if [ $js_maps -gt 0 ]; then
        print_warning "Found $js_maps source map files (consider excluding for production)"
    fi
    
    if [ $test_files -gt 0 ]; then
        print_warning "Found $test_files test files in build (should be excluded)"
    fi
    
    if [ $docs -gt 5 ]; then
        print_warning "Found $docs documentation files (consider reducing)"
    fi
    
    # Platform-specific size reporting
    for platform in mac win linux; do
        local platform_files=$(find dist -name "*${platform}*" 2>/dev/null | wc -l | tr -d ' ')
        if [ $platform_files -gt 0 ]; then
            local platform_size=$(find dist -name "*${platform}*" -exec ls -l {} + 2>/dev/null | \
                awk '{sum += $5} END {print sum/1024/1024 " MB"}')
            echo "   $platform: $platform_files files, ~$platform_size"
        fi
    done
}

optimize_build_environment() {
    print_status "⚡ Optimizing build environment..."
    
    # Set parallel building
    export ELECTRON_BUILDER_PARALLELISM=$PARALLEL_JOBS
    print_info "Set parallel building to $PARALLEL_JOBS cores"
    
    # Optimize memory usage
    export NODE_OPTIONS="--max-old-space-size=8192"
    print_info "Increased Node.js memory limit to 8GB"
    
    # Set build cache
    export ELECTRON_CACHE="$PROJECT_DIR/node_modules/.cache/electron"
    mkdir -p "$ELECTRON_CACHE"
    
    # Optimize npm settings
    npm config set progress false
    npm config set loglevel warn
    
    print_success "Build environment optimized"
}

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to display help
show_help() {
    echo "Complete Multi-Platform Build Script for AIFEED"
    echo "Enhanced with automatic temp cleanup, bloat monitoring, and 18-core parallel building"
    echo ""
    echo "Usage: ./scripts/compile-build-dist.sh [options]"
    echo ""
    echo "Options:"
    echo "  --no-clean         Skip cleaning build artifacts"
    echo "  --platform PLAT    Build for specific platform (mac, win, linux, all)"
    echo "  --arch ARCH        Build for specific architecture (x64, ia32, arm64, all)"
    echo "  --quick            Quick build (single platform only)"
    echo "  --help             Display this help message"
    echo ""
    echo "Features:"
    echo "  🚀 18-core parallel building for maximum speed"
    echo "  🧹 Automatic temp directory cleanup"
    echo "  📊 Build bloat analysis and optimization suggestions"
    echo "  🗂️ Custom temp directory isolation"
    echo "  ⚡ Memory optimization (8GB Node.js limit)"
    echo "  🔄 Comprehensive cache management"
    echo ""
    echo "Examples:"
    echo "  ./scripts/compile-build-dist.sh                    # Full build for all platforms"
    echo "  ./scripts/compile-build-dist.sh --platform win     # Windows only"
    echo "  ./scripts/compile-build-dist.sh --quick            # Quick build for current platform"
    echo "  ./scripts/compile-build-dist.sh --no-clean         # Build without cleaning first"
    echo ""
    echo "Output:"
    echo "  📦 macOS: .dmg and .zip installers (Intel + ARM64)"
    echo "  🪟 Windows: .exe, .msi, and .zip packages (x64 + x86)"
    echo "  🐧 Linux: .AppImage, .deb, .rpm, .snap packages (x64)"
}

# Parse command line arguments
NO_CLEAN=false
PLATFORM="all"
ARCH="all"
QUICK=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-clean)
            NO_CLEAN=true
            shift
            ;;
        --platform)
            PLATFORM="$2"
            shift 2
            ;;
        --arch)
            ARCH="$2"
            shift 2
            ;;
        --quick)
            QUICK=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Check for required tools
print_status "Checking requirements..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

# Check for optional tools for better builds
if command_exists wine; then
    print_info "Wine detected - Windows builds will include better signatures"
fi

if command_exists docker; then
    print_info "Docker detected - Linux builds will be more compatible"
fi

# Cleanup trap to ensure temp directories are cleaned on exit
cleanup_on_exit() {
    print_status "🧹 Exit cleanup triggered..."
    cleanup_temp_dirs
    
    # Calculate build time
    if [ -n "$BUILD_START_TIME" ]; then
        local build_end_time=$(date +%s)
        local build_duration=$((build_end_time - BUILD_START_TIME))
        local minutes=$((build_duration / 60))
        local seconds=$((build_duration % 60))
        print_info "Total build time: ${minutes}m ${seconds}s"
    fi
}

# Set trap for cleanup on script exit
trap cleanup_on_exit EXIT INT TERM

print_success "All requirements met"

# Initialize build environment
setup_custom_temp
optimize_build_environment

# Step 1: Clean everything if not skipped
if [ "$NO_CLEAN" = false ]; then
    print_status "🧹 Purging all existing builds..."
    rm -rf dist/
    rm -rf build/
    rm -rf node_modules/.cache/
    rm -rf out/
    print_success "All build artifacts purged"
fi

# Step 2: Install/update dependencies
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

# Step 3: Update package.json with comprehensive build configuration
print_status "🔧 Updating build configuration..."

# Create temporary build config
cat > package.build.json << 'EOF'
{
  "build": {
    "appId": "com.aifeed.app",
    "productName": "AIFEED",
    "copyright": "Copyright © 2024 AIFEED Team",
    "directories": {
      "output": "dist",
      "buildResources": "resources"
    },
    "files": [
      "build/**/*",
      "node_modules/**/*",
      "package.json",
      "!node_modules/.cache",
      "!node_modules/.bin",
      "!**/*.{md,txt,log}",
      "!**/*.map"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "resources/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "resources/entitlements.mac.plist",
      "entitlementsInherit": "resources/entitlements.mac.plist",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "dmg": {
      "contents": [
        {
          "x": 410,
          "y": 150,
          "type": "link",
          "path": "/Applications"
        },
        {
          "x": 130,
          "y": 150,
          "type": "file"
        }
      ]
    },
    "win": {
      "icon": "resources/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "msi",
          "arch": ["x64", "ia32"]
        },
        {
          "target": "zip",
          "arch": ["x64", "ia32"]
        }
      ]
    },
    "nsis": {
      "oneClick": false,
      "installerIcon": "resources/icon.ico",
      "uninstallerIcon": "resources/icon.ico",
      "installerHeaderIcon": "resources/icon.ico",
      "allowToChangeInstallationDirectory": true,
      "perMachine": false,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "shortcutName": "AIFEED"
    },
    "msi": {
      "oneClick": false,
      "perMachine": false,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true,
      "upgradeCode": "A1B2C3D4-E5F6-G7H8-I9J0-K1L2M3N4O5P6"
    },
    "linux": {
      "icon": "resources",
      "category": "Utility",
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        },
        {
          "target": "deb",
          "arch": ["x64"]
        },
        {
          "target": "rpm",
          "arch": ["x64"]
        },
        {
          "target": "snap",
          "arch": ["x64"]
        }
      ],
      "desktop": {
        "StartupNotify": "true",
        "Encoding": "UTF-8",
        "Icon": "aifeed",
        "Type": "Application",
        "Categories": "Utility;"
      }
    },
    "deb": {
      "depends": [
        "libgtk-3-0",
        "libnotify4",
        "libnss3",
        "libxss1",
        "libxtst6",
        "xdg-utils",
        "libatspi2.0-0",
        "libuuid1",
        "libsecret-1-0"
      ]
    },
    "rpm": {
      "depends": [
        "gtk3",
        "libnotify",
        "nss",
        "libXScrnSaver",
        "libXtst",
        "xdg-utils",
        "at-spi2-core",
        "libuuid",
        "libsecret"
      ]
    },
    "snap": {
      "grade": "stable",
      "summary": "AI Intelligence Dashboard"
    },
    "appImage": {
      "systemIntegration": "ask"
    }
  }
}
EOF

# Merge with existing package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const buildConfig = JSON.parse(fs.readFileSync('package.build.json', 'utf8'));
pkg.build = buildConfig.build;

// Add missing scripts
if (!pkg.scripts['dist:current']) {
  pkg.scripts['dist:current'] = 'npm run build && electron-builder';
}
if (!pkg.scripts['dist:win:msi']) {
  pkg.scripts['dist:win:msi'] = 'npm run build && electron-builder --win --config.win.target=msi';
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
fs.unlinkSync('package.build.json');
"

print_success "Build configuration updated"

# Step 4: Build TypeScript and React
print_status "🛠️ Building TypeScript and React..."
npm run build
if [ $? -ne 0 ]; then
    print_error "Failed to build source code"
    exit 1
fi
print_success "Source code built successfully"

# Step 5: Determine build targets
print_status "🎯 Determining build targets..."
BUILD_CMD="npm run dist"

if [ "$QUICK" = true ]; then
    print_info "Quick build mode - building for current platform only"
    BUILD_CMD="npm run dist:current"
elif [ "$PLATFORM" != "all" ]; then
    case $PLATFORM in
        mac)
            BUILD_CMD="npm run dist:mac"
            print_info "Building for macOS only"
            ;;
        win)
            BUILD_CMD="npm run dist:win"
            print_info "Building for Windows only"
            ;;
        linux)
            BUILD_CMD="npm run dist:linux"
            print_info "Building for Linux only"
            ;;
        *)
            print_error "Invalid platform: $PLATFORM"
            exit 1
            ;;
    esac
else
    print_info "Building for all platforms"
fi

# Step 6: Build all platform binaries and packages
print_status "🏗️ Building platform binaries and packages..."
print_status "Targets: macOS (Intel + ARM), Windows (x64 + x86), Linux (x64)"
print_status "Installers: .dmg, .exe, .msi, .deb, .rpm, .AppImage, .snap"

# Run the build
$BUILD_CMD
BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "All platform builds completed successfully"

# Step 7: Generate additional installer types if needed
if [ "$PLATFORM" = "all" ] || [ "$PLATFORM" = "win" ]; then
    if [ -f "dist/*.exe" ] && [ ! -f "dist/*.msi" ]; then
        print_status "Generating MSI installer..."
        npm run dist:win:msi 2>/dev/null || print_warning "MSI generation requires additional setup"
    fi
fi

# Step 8: Display build results
print_status "📋 Build Results Summary:"
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"

if [ -d "dist" ]; then
    # Count files by type
    MAC_COUNT=$(find dist -name "*.dmg" -o -name "*.zip" 2>/dev/null | grep -E "(mac|darwin)" | wc -l | tr -d ' ')
    WIN_COUNT=$(find dist -name "*.exe" -o -name "*.msi" -o -name "*-win.zip" 2>/dev/null | wc -l | tr -d ' ')
    LINUX_COUNT=$(find dist -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.snap" 2>/dev/null | wc -l | tr -d ' ')
    
    print_info "📊 Build Statistics:"
    echo "   macOS packages: $MAC_COUNT"
    echo "   Windows packages: $WIN_COUNT"
    echo "   Linux packages: $LINUX_COUNT"
    echo ""
    
    # macOS builds
    if [ $MAC_COUNT -gt 0 ]; then
        print_success "🍎 macOS Builds:"
        [ -d "dist/mac" ] && echo "   ✓ Intel: dist/mac/*.app"
        [ -d "dist/mac-arm64" ] && echo "   ✓ ARM64: dist/mac-arm64/*.app"
        find dist -name "*.dmg" -type f 2>/dev/null | while read -r dmg; do
            size=$(ls -lh "$dmg" | awk '{print $5}')
            echo "   ✓ DMG: $(basename "$dmg") ($size)"
        done
        echo ""
    fi
    
    # Windows builds
    if [ $WIN_COUNT -gt 0 ]; then
        print_success "🪟 Windows Builds:"
        [ -d "dist/win-unpacked" ] && echo "   ✓ x64 Unpacked: dist/win-unpacked/"
        [ -d "dist/win-ia32-unpacked" ] && echo "   ✓ x86 Unpacked: dist/win-ia32-unpacked/"
        find dist -name "*.exe" -type f 2>/dev/null | while read -r exe; do
            size=$(ls -lh "$exe" | awk '{print $5}')
            echo "   ✓ EXE: $(basename "$exe") ($size)"
        done
        find dist -name "*.msi" -type f 2>/dev/null | while read -r msi; do
            size=$(ls -lh "$msi" | awk '{print $5}')
            echo "   ✓ MSI: $(basename "$msi") ($size)"
        done
        find dist -name "*-win.zip" -type f 2>/dev/null | while read -r zip; do
            if [[ "$(basename "$zip")" == *"-win.zip" ]]; then
                size=$(ls -lh "$zip" | awk '{print $5}')
                echo "   ✓ Portable: $(basename "$zip") ($size)"
            fi
        done
        echo ""
    fi
    
    # Linux builds
    if [ $LINUX_COUNT -gt 0 ]; then
        print_success "🐧 Linux Builds:"
        [ -d "dist/linux-unpacked" ] && echo "   ✓ Unpacked: dist/linux-unpacked/"
        find dist -name "*.AppImage" -type f 2>/dev/null | while read -r app; do
            size=$(ls -lh "$app" | awk '{print $5}')
            echo "   ✓ AppImage: $(basename "$app") ($size)"
        done
        find dist -name "*.deb" -type f 2>/dev/null | while read -r deb; do
            size=$(ls -lh "$deb" | awk '{print $5}')
            echo "   ✓ DEB: $(basename "$deb") ($size)"
        done
        find dist -name "*.rpm" -type f 2>/dev/null | while read -r rpm; do
            size=$(ls -lh "$rpm" | awk '{print $5}')
            echo "   ✓ RPM: $(basename "$rpm") ($size)"
        done
        find dist -name "*.snap" -type f 2>/dev/null | while read -r snap; do
            size=$(ls -lh "$snap" | awk '{print $5}')
            echo "   ✓ Snap: $(basename "$snap") ($size)"
        done
        echo ""
    fi
    
    # Auto-update files
    print_info "🔄 Auto-update files:"
    for yml in dist/*.yml; do
        if [ -f "$yml" ]; then
            echo "   ✓ $(basename "$yml")"
        fi
    done
else
    print_warning "No dist directory found. Build may have failed."
fi

# Step 9: Analyze build bloat and optimization opportunities
echo ""
check_build_bloat

echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
print_success "🎉 Complete build process finished!"
print_status "📁 All binaries and packages are in: ./dist/"
print_status ""
print_info "To run the application:"
print_info "  macOS:   ./scripts/run-macos-source.sh (dev) or ./scripts/run-macos.sh (binary)"
print_info "  Windows: scripts\\run-windows-source.bat (dev) or scripts\\run-windows.bat (binary)"
print_info "  Linux:   ./scripts/run-linux-source.sh (dev) or ./scripts/run-linux.sh (binary)"