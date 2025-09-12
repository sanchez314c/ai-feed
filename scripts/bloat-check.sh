#!/bin/bash

# AIFEED Build Bloat Analysis Script
# Analyzes Electron build outputs for size optimization opportunities
# Can be run independently or integrated into build workflows

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
DIST_DIR="${PROJECT_DIR}/dist"

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
    echo "AIFEED Build Bloat Analysis Tool"
    echo ""
    echo "Usage: ./scripts/bloat-check.sh [options]"
    echo ""
    echo "Options:"
    echo "  --dir PATH         Specify build directory (default: ./dist)"
    echo "  --detailed         Show detailed file analysis"
    echo "  --recommendations  Show optimization recommendations"
    echo "  --json            Output results in JSON format"
    echo "  --help            Display this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/bloat-check.sh                     # Quick analysis"
    echo "  ./scripts/bloat-check.sh --detailed          # Detailed analysis"
    echo "  ./scripts/bloat-check.sh --dir ./build       # Custom directory"
    echo "  ./scripts/bloat-check.sh --json              # JSON output"
}

# Parse command line arguments
BUILD_DIR="$DIST_DIR"
DETAILED=false
RECOMMENDATIONS=false
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dir)
            BUILD_DIR="$2"
            shift 2
            ;;
        --detailed)
            DETAILED=true
            shift
            ;;
        --recommendations)
            RECOMMENDATIONS=true
            shift
            ;;
        --json)
            JSON_OUTPUT=true
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

# Main bloat analysis function
analyze_build_bloat() {
    print_status "📊 Analyzing build bloat in: $BUILD_DIR"
    
    if [ ! -d "$BUILD_DIR" ]; then
        print_error "Build directory not found: $BUILD_DIR"
        print_info "Run the build process first or specify correct directory with --dir"
        exit 1
    fi
    
    # Basic size analysis
    local total_size=$(du -sh "$BUILD_DIR" 2>/dev/null | cut -f1)
    local total_bytes=$(du -s "$BUILD_DIR" 2>/dev/null | cut -f1)
    local file_count=$(find "$BUILD_DIR" -type f | wc -l | tr -d ' ')
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo "{"
        echo "  \"analysis_time\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
        echo "  \"build_directory\": \"$BUILD_DIR\","
        echo "  \"total_size\": \"$total_size\","
        echo "  \"total_bytes\": $total_bytes,"
        echo "  \"file_count\": $file_count,"
    else
        echo ""
        echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
        print_info "📈 Build Size Analysis Results"
        echo "   Build Directory: $BUILD_DIR"
        echo "   Total Size: $total_size"
        echo "   Total Files: $file_count files"
        echo ""
    fi
    
    # Analyze by file types
    analyze_file_types
    
    # Platform-specific analysis
    analyze_platforms
    
    # Check for common bloat patterns
    check_bloat_patterns
    
    # Show largest files
    if [ "$DETAILED" = true ]; then
        show_largest_files
    fi
    
    # Show optimization recommendations
    if [ "$RECOMMENDATIONS" = true ]; then
        show_recommendations
    fi
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo "}"
    else
        echo ""
        echo -e "${PURPLE}════════════════════════════════════════════════════════${NC}"
        print_success "Bloat analysis completed"
    fi
}

analyze_file_types() {
    if [ "$JSON_OUTPUT" = true ]; then
        echo "  \"file_types\": {"
    else
        print_info "📁 File Type Breakdown:"
    fi
    
    # Analyze common file types
    local types=("js" "html" "css" "png" "jpg" "jpeg" "gif" "svg" "woff" "woff2" "ttf" "json" "xml")
    local first=true
    
    for ext in "${types[@]}"; do
        local count=$(find "$BUILD_DIR" -name "*.${ext}" -type f | wc -l | tr -d ' ')
        local size=$(find "$BUILD_DIR" -name "*.${ext}" -type f -exec ls -l {} + 2>/dev/null | \
            awk '{sum += $5} END {if(sum) print sum/1024/1024; else print 0}')
        
        if [ "$count" -gt 0 ]; then
            if [ "$JSON_OUTPUT" = true ]; then
                [ "$first" = false ] && echo ","
                printf "    \"%s\": {\"count\": %d, \"size_mb\": %.2f}" "$ext" "$count" "$size"
                first=false
            else
                printf "   %-8s: %3d files, %.2f MB\n" "$ext" "$count" "$size"
            fi
        fi
    done
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo ""
        echo "  },"
    else
        echo ""
    fi
}

analyze_platforms() {
    if [ "$JSON_OUTPUT" = true ]; then
        echo "  \"platforms\": {"
    else
        print_info "🖥️ Platform Distribution:"
    fi
    
    local platforms=("mac" "win" "linux" "darwin" "win32")
    local first=true
    
    for platform in "${platforms[@]}"; do
        local platform_files=$(find "$BUILD_DIR" -name "*${platform}*" -type f 2>/dev/null | wc -l | tr -d ' ')
        local platform_dirs=$(find "$BUILD_DIR" -name "*${platform}*" -type d 2>/dev/null | wc -l | tr -d ' ')
        
        if [ $platform_files -gt 0 ] || [ $platform_dirs -gt 0 ]; then
            local platform_size=$(find "$BUILD_DIR" -name "*${platform}*" -exec ls -l {} + 2>/dev/null | \
                awk '{sum += $5} END {if(sum) print sum/1024/1024; else print 0}')
            
            if [ "$JSON_OUTPUT" = true ]; then
                [ "$first" = false ] && echo ","
                printf "    \"%s\": {\"files\": %d, \"directories\": %d, \"size_mb\": %.2f}" \
                    "$platform" "$platform_files" "$platform_dirs" "$platform_size"
                first=false
            else
                printf "   %-8s: %3d files, %2d dirs, %.2f MB\n" \
                    "$platform" "$platform_files" "$platform_dirs" "$platform_size"
            fi
        fi
    done
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo ""
        echo "  },"
    else
        echo ""
    fi
}

check_bloat_patterns() {
    if [ "$JSON_OUTPUT" = true ]; then
        echo "  \"bloat_patterns\": {"
    else
        print_info "🔍 Bloat Pattern Detection:"
    fi
    
    # Check for source maps
    local js_maps=$(find "$BUILD_DIR" -name "*.js.map" -type f | wc -l | tr -d ' ')
    local css_maps=$(find "$BUILD_DIR" -name "*.css.map" -type f | wc -l | tr -d ' ')
    
    # Check for test files
    local test_files=$(find "$BUILD_DIR" -name "*test*" -o -name "*spec*" -type f | wc -l | tr -d ' ')
    
    # Check for documentation files
    local docs=$(find "$BUILD_DIR" -name "*.md" -o -name "*.txt" -o -name "README*" -type f | wc -l | tr -d ' ')
    
    # Check for temporary files
    local temp_files=$(find "$BUILD_DIR" -name "*.tmp" -o -name "*.temp" -o -name ".DS_Store" -type f | wc -l | tr -d ' ')
    
    # Check for duplicate files (by size)
    local duplicates=$(find "$BUILD_DIR" -type f -exec ls -l {} + | \
        awk '{print $5}' | sort -n | uniq -d | wc -l | tr -d ' ')
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo "    \"source_maps\": {\"js\": $js_maps, \"css\": $css_maps},"
        echo "    \"test_files\": $test_files,"
        echo "    \"documentation\": $docs,"
        echo "    \"temp_files\": $temp_files,"
        echo "    \"potential_duplicates\": $duplicates"
        echo "  },"
    else
        [ $js_maps -gt 0 ] && print_warning "Found $js_maps JavaScript source map files"
        [ $css_maps -gt 0 ] && print_warning "Found $css_maps CSS source map files"
        [ $test_files -gt 0 ] && print_warning "Found $test_files test files in build"
        [ $docs -gt 10 ] && print_warning "Found $docs documentation files (consider reducing)"
        [ $temp_files -gt 0 ] && print_warning "Found $temp_files temporary files"
        [ $duplicates -gt 0 ] && print_info "Found $duplicates potential duplicate file sizes"
        echo ""
    fi
}

show_largest_files() {
    if [ "$JSON_OUTPUT" = true ]; then
        echo "  \"largest_files\": ["
    else
        print_info "📋 Largest Files (Top 15):"
    fi
    
    local count=0
    find "$BUILD_DIR" -type f -exec ls -lh {} + 2>/dev/null | \
        sort -k5 -hr | head -15 | while read -r line; do
        local size=$(echo "$line" | awk '{print $5}')
        local file=$(echo "$line" | awk '{print $9}')
        local relative_file=${file#$BUILD_DIR/}
        
        if [ "$JSON_OUTPUT" = true ]; then
            [ $count -gt 0 ] && echo ","
            printf "    {\"file\": \"%s\", \"size\": \"%s\"}" "$relative_file" "$size"
        else
            printf "   %-60s %8s\n" "$relative_file" "$size"
        fi
        ((count++))
    done
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo ""
        echo "  ],"
    else
        echo ""
    fi
}

show_recommendations() {
    if [ "$JSON_OUTPUT" = true ]; then
        echo "  \"recommendations\": ["
    else
        print_info "💡 Optimization Recommendations:"
    fi
    
    local recommendations=()
    
    # Check for source maps
    if [ $(find "$BUILD_DIR" -name "*.map" -type f | wc -l | tr -d ' ') -gt 0 ]; then
        recommendations+=("Remove source maps for production builds")
    fi
    
    # Check for test files
    if [ $(find "$BUILD_DIR" -name "*test*" -o -name "*spec*" -type f | wc -l | tr -d ' ') -gt 0 ]; then
        recommendations+=("Exclude test files from production builds")
    fi
    
    # Check for documentation
    if [ $(find "$BUILD_DIR" -name "*.md" -type f | wc -l | tr -d ' ') -gt 10 ]; then
        recommendations+=("Reduce documentation files in build output")
    fi
    
    # Check build size
    local size_kb=$(du -s "$BUILD_DIR" 2>/dev/null | cut -f1)
    if [ "$size_kb" -gt 1048576 ]; then  # > 1GB
        recommendations+=("Consider code splitting - build size exceeds 1GB")
    fi
    
    # Check for unoptimized images
    local large_images=$(find "$BUILD_DIR" -name "*.png" -o -name "*.jpg" -type f -size +1M | wc -l | tr -d ' ')
    if [ "$large_images" -gt 0 ]; then
        recommendations+=("Optimize $large_images large image files (>1MB)")
    fi
    
    # Output recommendations
    if [ ${#recommendations[@]} -eq 0 ]; then
        if [ "$JSON_OUTPUT" = true ]; then
            echo "    \"No major optimization opportunities found\""
        else
            print_success "✨ No major optimization opportunities found!"
        fi
    else
        local first=true
        for rec in "${recommendations[@]}"; do
            if [ "$JSON_OUTPUT" = true ]; then
                [ "$first" = false ] && echo ","
                printf "    \"%s\"" "$rec"
                first=false
            else
                echo "   • $rec"
            fi
        done
    fi
    
    if [ "$JSON_OUTPUT" = true ]; then
        echo ""
        echo "  ]"
    else
        echo ""
    fi
}

# Main execution
echo "🔍 AIFEED Build Bloat Analyzer"
echo "==============================="
analyze_build_bloat