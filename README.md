# 🤖 AIFEED - AI Intelligence Dashboard

> 🚀 **A comprehensive AI content aggregation platform** that brings together the latest AI research, news, and insights from across the web in one intelligent dashboard.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Electron](https://img.shields.io/badge/Electron-39.0.0-9FEAF9.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6.svg)
![React](https://img.shields.io/badge/React-19.2.0-61DAFB.svg)

**Repository:** [https://github.com/sanchez314c/ai-feed](https://github.com/sanchez314c/ai-feed)

## Quick Start

**To run the application:**

1. **Start development server:**
   ```bash
   npm run dev
   ```
   This will automatically start both the renderer and main process in development mode.

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
git clone https://github.com/sanchez314c/ai-feed.git
cd ai-feed

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
ai-feed/
├── src/               # Source code
│   ├── main/         # Electron main process
│   ├── renderer/     # React frontend
│   ├── services/     # API services
│   └── types/        # TypeScript types
├── dist/             # Built applications
│   ├── mac/          # macOS builds (Intel + ARM)
│   ├── win/          # Windows builds
│   └── linux/        # Linux builds
├── build-resources/  # Application resources
│   ├── icons/        # App icons
│   └── screenshots/  # Screenshots
├── scripts/          # Build and utility scripts
├── docs/             # Documentation
└── archive/          # Legacy versions and old builds
```

## Development

```bash
# Development mode with hot reload
npm run dev

# Run tests
npm test

# Test coverage
npm run test:coverage

# Lint code
npm run lint

# Type checking
npm run type-check

# Clean build artifacts
npm run clean

# Build for current platform
npm run dist:current

# Build for all platforms (maximum variants)
npm run dist:maximum

# Bloat analysis
npm run bloat-check
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