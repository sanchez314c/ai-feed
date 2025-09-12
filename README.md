# AIFeed - AI Intelligence Dashboard

> A comprehensive AI content aggregation platform built with Electron, TypeScript, and React

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## Quick Start

**To run the application:**

1. **Start development server:**
   ```bash
   npm run dev:renderer
   ```
   Wait for "ready" message, note the port (usually 3000 or 3001)

2. **In a new terminal, start Electron:**
   ```bash
   npm run dev:main
   ```

**The application should now open with the blue AIFEED interface!**

## What's Working

- ✅ Electron application framework
- ✅ Multi-source data aggregation (arXiv, News, YouTube, RSS)
- ✅ Claude API integration for content analysis
- ✅ SQLite database for local storage
- ✅ React frontend with modern UI
- ✅ Cross-platform builds (macOS, Windows, Linux)

## Features

### Core Functionality
- **Multi-Source Aggregation**: Collects AI content from arXiv, News API, YouTube, RSS feeds
- **AI Analysis**: Claude API processes content for categorization and summarization
- **Smart Filtering**: Filter by date, source, category, importance score
- **Local Database**: SQLite storage with full-text search
- **Background Updates**: Automated scheduler for content refresh
- **Bookmarking**: Save important articles for later
- **Read Tracking**: Mark items as read/unread

### Data Sources
- **arXiv**: AI research papers (cs.AI, cs.CL, cs.CV, cs.LG, cs.NE)
- **News API**: AI-related news articles
- **YouTube**: Content from AI channels (Two Minute Papers, StatQuest, etc.)
- **RSS Feeds**: OpenAI, Anthropic, Google AI, Meta AI blogs

## Installation

```bash
# Clone repository
git clone https://github.com/spacewelder314/theFEED.git
cd theFEED

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env file

# Run in development
npm run dev

# Build for production
npm run dist
```

## Project Structure

```
theFEED/
├── src/               # Source code
│   ├── main/         # Electron main process
│   ├── renderer/     # React frontend
│   ├── services/     # API services
│   └── types/        # TypeScript types
├── dist/             # Built applications
│   ├── mac-intel/    # macOS Intel builds
│   ├── mac-arm64/    # macOS ARM builds
│   ├── win-x64-unpacked/  # Windows builds
│   └── linux-unpacked/    # Linux builds
├── resources/        # Application resources
│   ├── icons/        # App icons
│   └── screenshots/  # Screenshots
├── scripts/          # Build and utility scripts
├── archive/          # Legacy versions and old builds
└── docs/             # Documentation
```

## Development

```bash
# Development mode with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check

# Build for current platform
npm run dist:current

# Build for all platforms
npm run dist
```

## Environment Variables

Create a `.env` file with:
```env
ANTHROPIC_API_KEY=your_claude_api_key
NEWS_API_KEY=your_news_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

## License

MIT License - See LICENSE file for details