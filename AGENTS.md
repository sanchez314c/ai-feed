# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIFEED is an AI intelligence dashboard built as an Electron desktop application. It aggregates and analyzes AI-related content from multiple sources (arXiv papers, news articles, YouTube videos, company blogs) using AI-powered analysis and categorization. The application is built with TypeScript, React, and Electron, providing a cross-platform desktop experience with local SQLite storage.

## Development Commands

### Core Development Workflow
```bash
# Start development server (main + renderer process with hot reload)
npm run dev

# Build for production
npm run build

# Run built application
npm start

# Package for distribution
npm run dist                    # All platforms
npm run dist:mac               # macOS only (Intel + ARM)
npm run dist:win               # Windows only (x64, ia32)
npm run dist:linux             # Linux only (x64)
npm run dist:current           # Current platform only
```

### Code Quality & Testing
```bash
# Run tests
npm test
npm run test:watch             # Watch mode
npm run test:coverage          # With coverage

# Lint and format
npm run lint                   # Auto-fix linting issues
npm run type-check             # TypeScript type checking

# Validation scripts
npm run validate-all           # Comprehensive validation
npm run validate-quick         # Quick validation
npm run validate-production    # Production-ready validation
```

### Build & Maintenance
```bash
# Clean build artifacts
npm run clean                   # Remove dist and cache
npm run clean:full             # Remove node_modules too

# Performance and security
npm run bloat-check            # Analyze bundle size
npm run security-check         # Security validation
npm run quality-check          # Code quality analysis
npm run performance-check      # Performance analysis
```

## Architecture Overview

### Electron Process Structure
- **Main Process** (`src/main/`) - Window management, system integration, IPC handling
- **Renderer Process** (`src/renderer/`) - React frontend UI with Material-UI
- **Services Layer** (`src/services/`) - Data management, API integrations, background tasks
- **Shared Types** (`src/types/`) - TypeScript definitions across processes

### Key Services Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Main Process  │◄──►│   Data Service   │◄──►│  Data Manager   │
│                 │    │                  │    │                 │
│ • Window Mgmt   │    │ • IPC Handlers   │    │ • SQLite DB     │
│ • System APIs   │    │ • Scheduler      │    │ • Data Refresh  │
│ • Security      │    │ • Auto-refresh   │    │ • Search/Filter │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Renderer Process│    │ Data Collectors  │    │ External APIs   │
│                 │    │                  │    │                 │
│ • React UI      │    │ • arXiv          │    │ • Claude API    │
│ • State Mgmt    │    │ • News API       │    │ • YouTube API   │
│ • User Actions  │    │ • RSS Feeds      │    │ • News API      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow Architecture
1. **Collection Layer** - Multi-source data aggregation with rate limiting
2. **Processing Layer** - Claude AI analysis for categorization and summarization
3. **Storage Layer** - SQLite with full-text search and indexing
4. **Presentation Layer** - React UI with real-time filtering and search

## Important Implementation Details

### Environment Configuration
Required environment variables in `.env`:
```env
ANTHROPIC_API_KEY=your_claude_api_key          # Required for AI analysis
NEWS_API_KEY=your_news_api_key                  # Optional - news aggregation
YOUTUBE_API_KEY=your_youtube_api_key            # Optional - video content
```

### Path Aliases (configured in vite.config.ts)
```typescript
'@'         -> src/
'@/components' -> src/components/
'@/services'   -> src/services/
'@/types'      -> src/types/
'@/utils'      -> src/utils/
'@/hooks'      -> src/hooks/
'@/store'      -> src/store/
```

### Development Server Details
- **Vite Dev Server**: `http://localhost:5173` (renderer process)
- **Main Process**: Runs Electron with `NODE_ENV=development`
- **Hot Reload**: Both renderer and main process support hot reloading

### Build Configuration
- **Output Directory**: `dist/` (platform-specific builds)
- **Renderer Build**: `build/renderer/` (Vite build output)
- **Main Process**: `build/main/` (TypeScript compilation)
- **Electron Builder**: Multi-platform with code signing support

### Database & Data Management
- **SQLite Database**: Local storage in app data directory
- **Auto-refresh**: Configurable scheduler (default: every 2 hours)
- **Data Sources**: arXiv, News API, YouTube, RSS feeds
- **AI Processing**: Claude API for content analysis and categorization

### Key IPC Channels
```typescript
// Data operations
'data:getItems'          // Get filtered items
'data:searchItems'       // Full-text search
'data:refreshData'       // Trigger data refresh
'data:updateBookmark'    // Update bookmark status
'data:updateReadStatus'  // Update read status

// Scheduler operations
'scheduler:getStatus'    // Get scheduler status
'scheduler:start'        // Start auto-refresh
'scheduler:stop'         // Stop auto-refresh

// System operations
'store:get'              // Get persisted value
'store:set'              // Set persisted value
'app:getVersion'         // Get app version
'window:minimize'        // Window control
```

## Testing Strategy

### Test Configuration (Jest + React Testing Library)
- **Test Environment**: jsdom for React components
- **Coverage**: Excludes `.d.ts` files and entry points
- **Path Mapping**: Uses same aliases as development
- **Setup File**: `src/setupTests.ts` for custom test configuration

### Running Specific Tests
```bash
# Run single test file
npm test -- path/to/test.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="specific test"

# Run tests in watch mode for specific file
npm run test:watch -- path/to/test.test.ts
```

## Code Standards

### ESLint Configuration
- **Parser**: @typescript-eslint/parser
- **Extends**: eslint:recommended, plugin:react/recommended, prettier
- **Key Rules**: Prettier integration, React hooks rules, no-unused-vars
- **Environment**: browser, es6, node

### Build Process Scripts
- `scripts/build-universal.sh` - Comprehensive cross-platform build
- `scripts/repository-cleanup.sh` - Repository maintenance
- `scripts/temp-cleanup.sh` - Temporary file cleanup

### Security Considerations
- **Context Isolation**: Enabled in renderer process
- **Node Integration**: Disabled in renderer for security
- **Preload Script**: Secure bridge between main and renderer
- **Content Security**: webSecurity enabled, sandboxed preload

## Common Development Patterns

### Component Structure
React components use Material-UI with TypeScript:
```typescript
interface ComponentProps {
  // Props definition
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Component logic
  return <MuiComponent>{/* JSX */}</MuiComponent>;
};
```

### Service Pattern
Services follow a class-based pattern with IPC handlers:
```typescript
export class ExampleService {
  private setupIPC(): void {
    ipcMain.handle('service:method', async (_, params) => {
      return await this.method(params);
    });
  }

  private async method(params: any): Promise<any> {
    // Implementation
  }
}
```

### State Management
Uses Zustand for simple state management:
```typescript
interface AppState {
  // State definition
  actions: {
    // Action methods
  };
}

const useAppStore = create<AppState>((set, get) => ({
  // State and actions
}));
```

## Troubleshooting Common Issues

### Development Server Issues
- **Port 5173 in use**: Vite uses strict port configuration
- **Main process not starting**: Check NODE_ENV=development
- **Hot reload not working**: Ensure both processes are running

### Build Issues
- **SQLite compilation**: Native module requires rebuild for each platform
- **Code signing**: Configure certificates in build configuration
- **Bundle size**: Use `npm run bloat-check` to analyze

### Runtime Issues
- **Database not found**: Check app data directory permissions
- **API rate limits**: Implement proper rate limiting
- **Memory usage**: Monitor with performance profiling tools

## Platform-Specific Notes

### macOS
- **Code Signing**: Disabled in development (hardenedRuntime: false)
- **Icon Format**: Requires .icns format in build-resources/icons/
- **Notarization**: Configure for production builds

### Windows
- **Installers**: NSIS and MSI support
- **Icon Format**: Requires .ico format
- **Administrator Rights**: Not required by default

### Linux
- **Package Formats**: AppImage, deb, rpm, snap
- **Dependencies**: GTK3 and system libraries defined in build config
- **Desktop Integration**: Category set to "Utility"