#!/bin/bash

# Test Build Script for AIFEED
# Tests the build system without actually building

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get the script directory and move to project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Function to print colored output
print_status() {
    echo -e "${BLUE}[TEST]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${CYAN}[ℹ]${NC} $1"
}

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to test a condition
test_condition() {
    local description=$1
    local condition=$2
    
    if eval "$condition"; then
        print_success "$description"
        ((TESTS_PASSED++))
    else
        print_error "$description"
        ((TESTS_FAILED++))
    fi
}

echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}          AIFEED Build System Test Suite                ${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
echo ""

# Test 1: Check Node.js installation
print_status "Testing Node.js installation..."
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
    ((TESTS_PASSED++))
    
    # Check version requirement
    NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_MAJOR" -ge 18 ]; then
        print_success "Node.js version meets requirement (>=18)"
        ((TESTS_PASSED++))
    else
        print_error "Node.js version too old (requires >=18)"
        ((TESTS_FAILED++))
    fi
else
    print_error "Node.js not installed"
    ((TESTS_FAILED++))
fi

# Test 2: Check npm installation
print_status "Testing npm installation..."
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
    ((TESTS_PASSED++))
else
    print_error "npm not installed"
    ((TESTS_FAILED++))
fi

# Test 3: Check project structure
print_status "Testing project structure..."
test_condition "package.json exists" "[ -f package.json ]"
test_condition "src directory exists" "[ -d src ]"
test_condition "scripts directory exists" "[ -d scripts ]"
test_condition "resources directory exists" "[ -d resources ]"

# Test 4: Check icon files
print_status "Testing icon files..."
test_condition "macOS icon exists" "[ -f resources/icon.icns ]"
test_condition "Windows icon exists" "[ -f resources/icon.ico ]"
test_condition "PNG icon exists" "[ -f resources/icon.png ]"

# Test 5: Check build scripts
print_status "Testing build scripts..."
test_condition "Main build script exists" "[ -f scripts/compile-build-dist.sh ]"
test_condition "Main build script is executable" "[ -x scripts/compile-build-dist.sh ]"
test_condition "macOS run script exists" "[ -f scripts/run-macos.sh ]"
test_condition "macOS source script exists" "[ -f scripts/run-macos-source.sh ]"
test_condition "Windows run script exists" "[ -f scripts/run-windows.bat ]"
test_condition "Windows source script exists" "[ -f scripts/run-windows-source.bat ]"
test_condition "Linux run script exists" "[ -f scripts/run-linux.sh ]"
test_condition "Linux source script exists" "[ -f scripts/run-linux-source.sh ]"

# Test 6: Check configuration files
print_status "Testing configuration files..."
test_condition "TypeScript config exists" "[ -f tsconfig.json ]"
test_condition "Vite config exists" "[ -f vite.config.ts ]"
test_condition ".gitignore exists" "[ -f .gitignore ]"
test_condition ".env.example exists" "[ -f .env.example ]"

# Test 7: Check documentation
print_status "Testing documentation..."
test_condition "README.md exists" "[ -f README.md ]"
test_condition "CHANGELOG.md exists" "[ -f CHANGELOG.md ]"
test_condition "CONTRIBUTING.md exists" "[ -f CONTRIBUTING.md ]"
test_condition "tech-stack.md exists" "[ -f tech-stack.md ]"

# Test 8: Check package.json scripts
print_status "Testing package.json scripts..."
if [ -f package.json ]; then
    test_condition "start script exists" "grep -q '\"start\":' package.json"
    test_condition "build script exists" "grep -q '\"build\":' package.json"
    test_condition "dist script exists" "grep -q '\"dist\":' package.json"
    test_condition "dist:mac script exists" "grep -q '\"dist:mac\":' package.json"
    test_condition "dist:win script exists" "grep -q '\"dist:win\":' package.json"
    test_condition "dist:linux script exists" "grep -q '\"dist:linux\":' package.json"
fi

# Test 9: Check entitlements file
print_status "Testing macOS entitlements..."
test_condition "Entitlements file exists" "[ -f resources/entitlements.mac.plist ]"

# Test 10: Check optional tools
print_status "Testing optional tools..."
if command_exists wine; then
    print_info "Wine detected - Better Windows builds available"
else
    print_warning "Wine not installed - Windows builds may be limited"
fi

if command_exists docker; then
    print_info "Docker detected - Better Linux compatibility available"
else
    print_warning "Docker not installed - Linux builds may be less compatible"
fi

# Summary
echo ""
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
echo -e "${PURPLE}                    Test Summary                        ${NC}"
echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
echo -e "Total Tests: ${CYAN}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"

echo ""
if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! The build system is ready.${NC}"
    echo ""
    print_info "You can now run:"
    print_info "  ./scripts/compile-build-dist.sh --quick    # Quick build for current platform"
    print_info "  ./scripts/compile-build-dist.sh            # Full build for all platforms"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please fix the issues above.${NC}"
    echo ""
    print_warning "Common fixes:"
    print_warning "  - Install Node.js 18+: https://nodejs.org/"
    print_warning "  - Run: npm install"
    print_warning "  - Check missing files and create them"
    exit 1
fi