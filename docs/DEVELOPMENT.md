# Development Guide

This guide provides comprehensive information for developers working on the AIFEED project.

## Development Environment Setup

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control

### Initial Setup

```bash
# Clone the repository
git clone https://github.com/sanchez314c/ai-feed.git
cd ai-feed

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your API keys to .env file
# ANTHROPIC_API_KEY=your_claude_api_key
# NEWS_API_KEY=your_news_api_key (optional)
# YOUTUBE_API_KEY=your_youtube_api_key (optional)
```

## Development Workflow

### Running in Development Mode

```bash
# Start development servers (Vite + Electron)
npm run dev

# Or start components individually:
npm run dev:renderer  # Start Vite dev server
npm run dev:main      # Start Electron main process
```

### Building

```bash
# Build for current platform
npm run build

# Build distribution packages
npm run dist:current    # Current platform only
npm run dist:mac        # macOS only
npm run dist:win        # Windows only
npm run dist:linux      # Linux only
npm run dist            # All platforms
npm run dist:maximum    # All platforms + all architectures
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Type checking
npm run type-check

# Format code with Prettier
npm run format
```

## Architecture Overview

### Project Structure

```
ai-feed/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Main entry point
│   │   └── preload.ts  # Preload script
│   ├── renderer/       # React frontend
│   │   ├── App.tsx     # Main React component
│   │   └── components/ # UI components
│   ├── services/       # API and data services
│   │   ├── api.ts      # API clients
│   │   ├── database.ts # Database operations
│   │   └── collector.ts # Data collection
│   ├── types/          # TypeScript definitions
│   ├── hooks/          # React hooks
│   ├── store/          # State management
│   ├── styles/         # CSS/styling
│   └── utils/          # Utility functions
├── build-resources/    # Build assets
├── scripts/           # Build and utility scripts
└── docs/              # Documentation
```

### Technology Stack

- **Electron**: Cross-platform desktop application framework
- **React 18**: User interface library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and dev server
- **Material-UI**: React component library
- **SQLite**: Local database storage
- **Zustand**: State management

### Data Flow

1. **Data Collection**: Background services collect data from various sources
2. **AI Processing**: Claude API analyzes and categorizes content
3. **Storage**: SQLite database stores processed content
4. **UI Updates**: React components display data with real-time updates

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Required
ANTHROPIC_API_KEY=your_claude_api_key

# Optional (for enhanced features)
NEWS_API_KEY=your_news_api_key
YOUTUBE_API_KEY=your_youtube_api_key

# Development
NODE_ENV=development
```

### Build Configuration

Build settings are configured in `package.json` under the `build` key:

- **Output Directory**: `dist/`
- **App ID**: `com.aifeed.app`
- **Product Name**: `AIFEED`
- **Supported Platforms**: Windows, macOS, Linux

## API Integration

### Claude API

The application uses Claude for content analysis:

```typescript
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
```

### Data Sources

- **arXiv API**: Academic research papers
- **News API**: News articles
- **YouTube API**: Video content
- **RSS Feeds**: Company blogs and updates

## Database Schema

The application uses SQLite with the following main tables:

```sql
-- Content items
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT UNIQUE,
  source TEXT,
  content_type TEXT,
  description TEXT,
  summary TEXT,
  authors TEXT,
  published DATETIME,
  thumbnail TEXT,
  categories TEXT,  -- JSON array
  keywords TEXT,     -- JSON array
  importance_score INTEGER,
  channel TEXT,
  bookmarked BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Source metadata
CREATE TABLE source_metadata (
  source TEXT PRIMARY KEY,
  last_fetch DATETIME,
  last_id TEXT
);
```

## Debugging

### Main Process Debugging

```bash
# Enable Node.js debugging
DEBUG_MAIN_PROCESS=1 npm run dev:main

# Or use VS Code launch configuration
```

### Renderer Process Debugging

- Use Chrome DevTools (F12) in the application window
- React Developer Tools extension
- Redux DevTools (if using Redux)

### Common Issues

1. **API Rate Limits**: Check API key quotas and usage
2. **Database Locks**: Ensure proper connection management
3. **Memory Usage**: Monitor with Electron's memory tools
4. **Build Failures**: Clear cache: `npm run clean:full`

## Performance Optimization

### Build Optimization

- Source maps are disabled in production builds
- Tree shaking removes unused code
- Code splitting reduces bundle size
- Compression reduces download size

### Runtime Optimization

- Database indexing for faster queries
- Lazy loading for large datasets
- Background processing for data collection
- Caching for API responses

## Deployment

### Automated Builds

The project includes comprehensive build scripts:

```bash
# Full build with optimization
./scripts/build-compile-dist.sh

# Bloat analysis
./scripts/bloat-check.sh

# Temp cleanup
./scripts/temp-cleanup.sh
```

### Distribution

Built applications are created in the `dist/` directory:

- **macOS**: `.dmg` and `.zip` files
- **Windows**: `.exe` (NSIS) and `.msi` installers
- **Linux**: `.AppImage`, `.deb`, and `.rpm` packages

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Run linting and type checking: `npm run lint && npm run type-check`
5. Commit changes with descriptive messages
6. Push to your fork and create a pull request

## Getting Help

- **Documentation**: Check the `docs/` folder
- **Issues**: Report bugs on GitHub Issues
- **Contact**: Jasonn Michaels <sanchez314c@jasonpaulmichaels.co>

## License

This project is licensed under the MIT License. See [LICENSE](../LICENSE) for details.