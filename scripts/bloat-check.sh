#!/bin/bash

# Bloat Analysis Script for AIFEED
# Analyzes project dependencies and provides optimization recommendations

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

# Main bloat analysis
print_header "🔍 AIFEED BLOAT ANALYSIS"

# Check if in Node.js project
if [ ! -f "package.json" ]; then
    print_error "No package.json found. This is not a Node.js project."
    exit 1
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
else
    print_warning "⚠️  node_modules directory not found"
fi

# 2. Dependencies analysis
print_status "📋 Analyzing dependencies..."

if command -v npm >/dev/null 2>&1; then
    PROD_DEPS=$(npm ls --production --depth=0 2>/dev/null | grep -c "├─\\|└─" || echo "0")
    DEV_DEPS=$(npm ls --development --depth=0 2>/dev/null | grep -c "├─\\|└─" || echo "0")

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
        UNUSED=$(npx depcheck --json 2>/dev/null | grep -o '"dependencies":\\[[^]]*\\]' | grep -o '"[^\"]*"' | wc -l || echo "0")
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
    if grep -q '"node_modules/\\*\\*/\\*"' package.json; then
        print_error "❌ CRITICAL: Including 'node_modules/**/*' in build files!"
    fi
    if grep -q '"dist/\\*\\*/\\*"' package.json; then
        print_warning "⚠️  Including 'dist/**/*' may include unwanted files"
    fi
    if ! grep -q '"\\!\\*\\*\\/\\*.map"' package.json; then
        print_warning "⚠️  Not excluding source maps (*.map files)"
    fi
fi

# 4. AIFEED-specific checks
print_status "🤖 AIFEED-specific analysis..."

# Check for AI SDK dependencies
if grep -q "@anthropic-ai/sdk" package.json; then
    print_success "✓ Anthropic SDK found"
else
    print_warning "⚠️  Anthropic SDK not found in dependencies"
fi

# Check for database dependencies
if grep -q "sqlite3" package.json; then
    print_success "✓ SQLite database dependency found"
else
    print_warning "⚠️  SQLite not found in dependencies"
fi

# Check for Electron dependencies
if grep -q "electron" package.json; then
    print_success "✓ Electron dependency found"
else
    print_error "❌ Electron not found in dependencies"
fi

# 5. Build output analysis
print_status "📊 Build output analysis..."

if [ -d "dist" ]; then
    DIST_SIZE=$(du -sb dist 2>/dev/null | cut -f1)
    DIST_SIZE=${DIST_SIZE:-0}
    DIST_SIZE_HR=$(human_readable $DIST_SIZE)
    print_info "Build output size: $DIST_SIZE_HR"

    # Count distribution packages
    PACKAGE_COUNT=$(find dist -name "*.dmg" -o -name "*.pkg" -o -name "*.exe" -o -name "*.msi" -o -name "*.zip" -o -name "*.AppImage" -o -name "*.deb" -o -name "*.rpm" -o -name "*.snap" -o -name "*.tar.*" 2>/dev/null | wc -l)
    print_info "Distribution packages: $PACKAGE_COUNT"
else
    print_info "No build output found (run 'npm run dist' to create build artifacts)"
fi

# 6. Recommendations
print_header "💡 OPTIMIZATION RECOMMENDATIONS"

print_info "General recommendations:"
print_info "  • Run 'npm dedupe' to remove duplicate packages"
print_info "  • Run 'npx depcheck' to find unused dependencies"
print_info "  • Review build configuration in package.json"
print_info "  • Consider compression settings for smaller packages"

print_info "AIFEED-specific recommendations:"
print_info "  • Regularly clean AI content cache to manage disk space"
print_info "  • Monitor SQLite database size and implement cleanup routines"
print_info "  • Review AI API usage patterns for optimization opportunities"
print_info "  • Consider implementing data retention policies"

print_header "✅ BLOAT ANALYSIS COMPLETE"
print_success "Analysis completed. Review recommendations above for optimization opportunities."