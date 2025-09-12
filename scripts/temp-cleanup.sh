#!/bin/bash

# AIFEED Comprehensive Temp Cleanup Script
# Cleans temporary files and directories created during Electron builds
# Can be run independently for maintenance or integrated into build workflows

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

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

# Function to display help
show_help() {
    echo "AIFEED Comprehensive Temp Cleanup Tool"
    echo ""
    echo "Usage: ./scripts/temp-cleanup.sh [options]"
    echo ""
    echo "Options:"
    echo "  --system           Clean system-wide temp files (requires sudo)"
    echo "  --project-only     Clean only project-specific temp files"
    echo "  --aggressive       More aggressive cleanup (includes caches)"
    echo "  --dry-run          Show what would be cleaned without doing it"
    echo "  --quiet            Minimal output"
    echo "  --help             Display this help message"
    echo ""
    echo "Cleanup Targets:"
    echo "  🗂️ Project temp directories (temp-build-*)"
    echo "  🔧 Electron temp files and caches"
    echo "  📦 npm cache temp files"
    echo "  🏗️ Node.js build temp files"
    echo "  🗑️ macOS system files (.DS_Store)"
    echo "  💾 System temp electron directories"
    echo ""
    echo "Examples:"
    echo "  ./scripts/temp-cleanup.sh                    # Standard cleanup"
    echo "  ./scripts/temp-cleanup.sh --aggressive       # Deep cleanup"
    echo "  ./scripts/temp-cleanup.sh --dry-run          # Preview cleanup"
    echo "  ./scripts/temp-cleanup.sh --system           # System-wide cleanup"
}

# Parse command line arguments
SYSTEM_CLEAN=false
PROJECT_ONLY=false
AGGRESSIVE=false
DRY_RUN=false
QUIET=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --system)
            SYSTEM_CLEAN=true
            shift
            ;;
        --project-only)
            PROJECT_ONLY=true
            shift
            ;;
        --aggressive)
            AGGRESSIVE=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --quiet)
            QUIET=true
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

# Function to safely remove files/directories
safe_remove() {
    local path="$1"
    local description="$2"
    
    if [ ! -e "$path" ]; then
        return 0
    fi
    
    local size=""
    if [ -d "$path" ]; then
        size=$(du -sh "$path" 2>/dev/null | cut -f1 || echo "unknown")
    elif [ -f "$path" ]; then
        size=$(ls -lh "$path" 2>/dev/null | awk '{print $5}' || echo "unknown")
    fi
    
    if [ "$DRY_RUN" = true ]; then
        [ "$QUIET" = false ] && echo "   Would remove: $path ($size) - $description"
        return 0
    fi
    
    if [ -w "$path" ] || [ -w "$(dirname "$path")" ]; then
        [ "$QUIET" = false ] && echo "   Removing: $path ($size) - $description"
        rm -rf "$path" 2>/dev/null
        if [ $? -eq 0 ]; then
            return 0
        else
            [ "$QUIET" = false ] && print_warning "Failed to remove: $path"
            return 1
        fi
    else
        [ "$QUIET" = false ] && print_warning "No write permission: $path"
        return 1
    fi
}

# Function to clean project-specific temp files
clean_project_temp() {
    print_status "🗂️ Cleaning project temporary files..."
    
    cd "$PROJECT_DIR" || exit 1
    
    local cleaned_count=0
    local total_size=0
    
    # Clean custom temp build directories
    for temp_dir in temp-build-*; do
        if [ -d "$temp_dir" ]; then
            safe_remove "$temp_dir" "Custom build temp directory"
            ((cleaned_count++))
        fi
    done
    
    # Clean node_modules temp files
    if [ -d "node_modules" ]; then
        find node_modules -name "*.tmp" -delete 2>/dev/null || true
        find node_modules -name ".DS_Store" -delete 2>/dev/null || true
        find node_modules -type d -name "tmp" -exec rm -rf {} + 2>/dev/null || true
        [ "$QUIET" = false ] && echo "   Cleaned node_modules temp files"
    fi
    
    # Clean build artifacts
    for dir in dist build out; do
        if [ -d "$dir/.cache" ]; then
            safe_remove "$dir/.cache" "Build cache directory"
            ((cleaned_count++))
        fi
    done
    
    # Clean project-level temp files
    find . -maxdepth 2 -name "*.tmp" -type f -delete 2>/dev/null || true
    find . -maxdepth 2 -name ".DS_Store" -type f -delete 2>/dev/null || true
    
    [ "$QUIET" = false ] && print_success "Project temp cleanup: $cleaned_count items processed"
}

# Function to clean npm cache temp files
clean_npm_cache() {
    print_status "📦 Cleaning npm cache temp files..."
    
    local cleaned_count=0
    
    # Clean npm cache temp directory
    if [ -d "$HOME/.npm/_cacache/tmp" ]; then
        local cache_size=$(du -sh "$HOME/.npm/_cacache/tmp" 2>/dev/null | cut -f1 || echo "unknown")
        safe_remove "$HOME/.npm/_cacache/tmp"/* "npm cache temp files"
        ((cleaned_count++))
    fi
    
    # Clean npm logs
    if [ -d "$HOME/.npm/_logs" ]; then
        find "$HOME/.npm/_logs" -name "*.log" -mtime +7 -delete 2>/dev/null || true
        [ "$QUIET" = false ] && echo "   Cleaned old npm log files"
    fi
    
    # Clean npm temp in project
    if [ -f "package-lock.json" ] && [ -d ".npm" ]; then
        safe_remove ".npm" "Local npm temp directory"
        ((cleaned_count++))
    fi
    
    [ "$QUIET" = false ] && print_success "npm cache cleanup: $cleaned_count items processed"
}

# Function to clean Electron temp files
clean_electron_cache() {
    print_status "🔧 Cleaning Electron temp files and caches..."
    
    local cleaned_count=0
    
    # Clean Electron cache directory
    if [ -d "$HOME/.electron" ]; then
        find "$HOME/.electron" -name "*.tmp" -delete 2>/dev/null || true
        find "$HOME/.electron" -name "*.log" -mtime +3 -delete 2>/dev/null || true
        [ "$QUIET" = false ] && echo "   Cleaned Electron cache temp files"
    fi
    
    # Clean Electron prebuilt cache
    for cache_dir in "$HOME/.cache/electron" "$HOME/Library/Caches/electron"; do
        if [ -d "$cache_dir" ]; then
            find "$cache_dir" -name "*.tmp" -delete 2>/dev/null || true
            [ "$QUIET" = false ] && echo "   Cleaned $(basename "$cache_dir") temp files"
            ((cleaned_count++))
        fi
    done
    
    # Clean electron-builder cache
    if [ -d "$HOME/.cache/electron-builder" ]; then
        find "$HOME/.cache/electron-builder" -name "*.tmp" -delete 2>/dev/null || true
        [ "$QUIET" = false ] && echo "   Cleaned electron-builder cache temp files"
        ((cleaned_count++))
    fi
    
    [ "$QUIET" = false ] && print_success "Electron cache cleanup: $cleaned_count items processed"
}

# Function to clean system-wide temp files (requires elevated privileges)
clean_system_temp() {
    print_status "💾 Cleaning system-wide temp files..."
    
    if [ "$PROJECT_ONLY" = true ]; then
        [ "$QUIET" = false ] && print_info "Skipping system cleanup (--project-only specified)"
        return
    fi
    
    local cleaned_count=0
    
    # Clean system temp electron directories
    [ "$QUIET" = false ] && echo "   Scanning /tmp for electron directories..."
    find /tmp -name "*electron*" -type d -mtime +1 2>/dev/null | head -20 | while read -r dir; do
        safe_remove "$dir" "System temp electron directory"
        ((cleaned_count++))
    done
    
    # Clean system temp build files
    find /tmp -name "*build*" -name "*aifeed*" -type d -mtime +1 2>/dev/null | head -10 | while read -r dir; do
        safe_remove "$dir" "System temp build directory"
        ((cleaned_count++))
    done
    
    # Clean /var/tmp if accessible
    if [ -w "/var/tmp" ]; then
        find /var/tmp -name "*electron*" -type d -mtime +1 2>/dev/null | head -10 | while read -r dir; do
            safe_remove "$dir" "Var temp electron directory"
            ((cleaned_count++))
        done
    fi
    
    [ "$QUIET" = false ] && print_success "System temp cleanup completed"
}

# Function for aggressive cleanup (caches, logs, etc.)
clean_aggressive() {
    if [ "$AGGRESSIVE" = false ]; then
        return
    fi
    
    print_status "🚀 Aggressive cleanup mode..."
    
    # Clear more caches
    for cache_dir in \
        "$HOME/.cache/typescript" \
        "$HOME/.cache/vite" \
        "$HOME/Library/Caches/org.npmjs.npm" \
        "$HOME/Library/Caches/Electron" \
        "$HOME/Library/Caches/electron-builder"; do
        
        if [ -d "$cache_dir" ]; then
            local cache_size=$(du -sh "$cache_dir" 2>/dev/null | cut -f1 || echo "unknown")
            if [ "$DRY_RUN" = true ]; then
                [ "$QUIET" = false ] && echo "   Would clear: $cache_dir ($cache_size)"
            else
                [ "$QUIET" = false ] && echo "   Clearing: $cache_dir ($cache_size)"
                find "$cache_dir" -type f -mtime +7 -delete 2>/dev/null || true
            fi
        fi
    done
    
    # Clean old log files
    for log_dir in \
        "$HOME/.npm/_logs" \
        "$PROJECT_DIR/logs" \
        "$PROJECT_DIR/electron-logs"; do
        
        if [ -d "$log_dir" ]; then
            find "$log_dir" -name "*.log" -mtime +7 -delete 2>/dev/null || true
            [ "$QUIET" = false ] && echo "   Cleaned old logs in $log_dir"
        fi
    done
    
    print_success "Aggressive cleanup completed"
}

# Function to show cleanup summary
show_summary() {
    if [ "$QUIET" = true ]; then
        return
    fi
    
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
    
    if [ "$DRY_RUN" = true ]; then
        print_info "🔍 Dry run completed - no files were actually removed"
        print_info "Run without --dry-run to perform actual cleanup"
    else
        print_success "🧹 Comprehensive temp cleanup completed!"
    fi
    
    # Show current temp usage
    local tmp_size=$(du -sh /tmp 2>/dev/null | cut -f1 || echo "unknown")
    print_info "Current /tmp usage: $tmp_size"
    
    if [ -d "$PROJECT_DIR" ]; then
        local project_size=$(du -sh "$PROJECT_DIR" 2>/dev/null | cut -f1 || echo "unknown")
        print_info "Project directory size: $project_size"
    fi
    
    echo ""
    print_info "💡 Tips for maintaining clean builds:"
    echo "   • Run this script weekly for maintenance"
    echo "   • Use --aggressive monthly for deep cleaning"
    echo "   • Monitor build sizes with ./scripts/bloat-check.sh"
    echo "   • Set up automated cleanup in CI/CD pipelines"
    
    echo ""
    echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
}

# Main cleanup execution
main() {
    echo "🧹 AIFEED Comprehensive Temp Cleanup"
    echo "===================================="
    
    if [ "$DRY_RUN" = true ]; then
        print_info "🔍 DRY RUN MODE - No files will be removed"
        echo ""
    fi
    
    # Record start time and initial sizes
    local start_time=$(date +%s)
    local initial_tmp_size=$(du -s /tmp 2>/dev/null | cut -f1 || echo "0")
    
    # Perform cleanup operations
    clean_project_temp
    clean_npm_cache  
    clean_electron_cache
    clean_system_temp
    clean_aggressive
    
    # Calculate cleanup results
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local final_tmp_size=$(du -s /tmp 2>/dev/null | cut -f1 || echo "0")
    local freed_kb=$((initial_tmp_size - final_tmp_size))
    
    if [ $freed_kb -gt 0 ] && [ "$QUIET" = false ]; then
        local freed_mb=$((freed_kb / 1024))
        print_success "Freed approximately ${freed_mb}MB of space in ${duration}s"
    fi
    
    show_summary
}

# Run main function
main "$@"