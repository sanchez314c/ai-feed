# AIFEED 🤖

> AI Intelligence Dashboard - Comprehensive AI content aggregation platform

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-39.0.0-47848F?logo=electron)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Platform](https://img.shields.io/badge/Platform-macOS%20|%20Windows%20|%20Linux-lightgrey)](https://github.com/sanchez314c/ai-feed/releases)

## 📸 Main Interface

![AIFEED Dashboard](https://maas-log-prod.cn-wlcb.ufileos.com/anthropic/814a456e-a24c-443c-9cd1-60a1e36b13b0/d34d4aaffc6723a7e452781829dfa6ef.jpg?UCloudPublicKey=TOKEN_e15ba47a-d098-4fbd-9afc-a0dcf0e4e621&Expires=1762055420&Signature=i1m5/akksuYq884LrKaM1PBGosk=)

> The Ultimate AI Intelligence Dashboard - Comprehensive AI content aggregation platform

AIFEED is a powerful desktop application that brings together the latest AI research, news, and insights from across the web in one intelligent dashboard. Built with Electron, React, and TypeScript, it provides a beautiful interface for monitoring AI trends, research papers, and industry news.

## ✨ Features

- 🤖 **Multi-Source Aggregation** - Collect AI content from arXiv, News API, YouTube, RSS feeds
- 🧠 **AI-Powered Analysis** - Claude API processes content for categorization and summarization
- 🔍 **Smart Filtering** - Filter by date, source, category, importance score
- 💾 **Local Database** - SQLite storage with full-text search capabilities
- 🔄 **Background Updates** - Automated scheduler for content refresh
- 🔖 **Bookmarking System** - Save important articles for later reference
- 📖 **Read Tracking** - Mark items as read/unread with progress tracking
- 🎨 **Modern UI** - Beautiful dark theme interface with responsive design
- ⚡ **Native Performance** - Built with Electron for optimal cross-platform performance
- 🖥️ **Cross-Platform** - Works on macOS, Windows, and Linux

## 📸 Screenshots

<details>
<summary>View Screenshots</summary>

![Dashboard Overview](assets/screenshot-dashboard.png)
*Main dashboard showing aggregated AI content*

![Content Analysis](assets/screenshot-analysis.png)
*AI-powered content analysis and categorization*

![Filtering Interface](assets/screenshot-filters.png)
*Advanced filtering and search capabilities*

</details>

## 🚀 Quick Start - One-Command Build & Run

### Option 1: One-Command Solution (Recommended)

```bash
# Clone and build
git clone https://github.com/sanchez314c/ai-feed.git
cd ai-feed

# Build and run with a single command!
./scripts/build-release-run.sh
```

### Option 2: Development Mode

```bash
# Run in development mode with hot reload
npm run dev
```

### Build Options

```bash
# Build only (don't launch)
npm run dist:current

# Build for all platforms
npm run dist:maximum

# Development with hot reload
npm run electron:dev

# Clean build artifacts
npm run clean
```

## 📋 Prerequisites

For running from source:
- **Node.js** 18+ and npm
- **Python** 3.8+ (for AI model integration)
- **Git** (for version control)

The application will guide you through installing any missing dependencies.

## 🛠️ Installation

### Detailed Installation

```bash
# Clone the repository
git clone https://github.com/sanchez314c/ai-feed.git
cd ai-feed

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys to .env file

# Start the application
npm run dev
```

### Building from Source

```bash
# One-command build for current platform
npm run dist:current

# Build for all platforms
npm run dist:maximum

# Development build
npm run electron:dev
```

### Build Output Locations

After building, find your executables in:
- **macOS**: `dist/AIFEED-*.dmg` and `dist/mac*/AIFEED.app`
- **Windows**: `dist/AIFEED Setup *.exe`
- **Linux**: `dist/AIFEED-*.AppImage` and `dist/*.deb`

## 📖 Usage

### 1. Starting the Application

- **Pre-built Binary**: Just double-click the application
- **From Source**: Run `npm run dev` for development or use built executables

### 2. Setting Up API Keys

Configure your API keys in the `.env` file:
```env
ANTHROPIC_API_KEY=your_claude_api_key
NEWS_API_KEY=your_news_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

### 3. Managing Content Sources

The app integrates with multiple sources:
- **arXiv**: AI research papers (cs.AI, cs.CL, cs.CV, cs.LG, cs.NE)
- **News API**: AI-related news articles from various sources
- **YouTube**: Content from AI channels and educational content
- **RSS Feeds**: OpenAI, Anthropic, Google AI, Meta AI blogs

### 4. Content Management

- **Browse Content**: View aggregated content in the main dashboard
- **Read & Bookmark**: Mark articles as read and save important ones
- **Search & Filter**: Use advanced filtering to find relevant content
- **Background Updates**: Automatic content refresh at configured intervals

## 🔧 Configuration

### Directory Structure

```
~/.ai-feed/
├── database/          # SQLite database
├── cache/            # Content cache
├── config.json       # App configuration
└── logs/             # Application logs
```

### Environment Variables

```bash
# Set custom content cache directory
export AIFEED_CACHE_DIR=/path/to/cache

# Set custom database directory
export AIFEED_DB_DIR=/path/to/database

# Set custom update interval (minutes)
export AIFEED_UPDATE_INTERVAL=30

# Disable background updates
export AIFEED_NO_BACKGROUND=1
```

## 🐛 Troubleshooting

### Common Issues

<details>
<summary>API Keys not working</summary>

Ensure your API keys are correctly set in the `.env` file:
1. Check that the file exists and is named `.env`
2. Verify API keys are valid and have sufficient quota
3. Restart the application after updating keys
</details>

<details>
<summary>Content not updating</summary>

1. Check internet connection
2. Verify API keys are working
3. Check update interval settings
4. Review logs in `~/.ai-feed/logs/`
</details>

<details>
<summary>Database issues</summary>

1. Close the application and restart
2. Check disk space availability
3. Verify database directory permissions
4. Reset database by deleting `~/.ai-feed/database/` folder
</details>

<details>
<summary>Performance issues</summary>

- Reduce update frequency in settings
- Clear cache periodically
- Limit content sources if needed
- Check system resources (RAM/CPU usage)
</details>

## 📁 Project Structure

```
ai-feed/
├── package.json              # Node.js configuration and dependencies
├── package-lock.json         # Dependency lock file
├── tsconfig.json             # TypeScript configuration
├── .eslintrc.json            # ESLint configuration
├── src/                      # Source code
│   ├── main/                # Electron main process
│   │   ├── main.ts          # Main application entry point
│   │   └── preload.ts       # Preload script
│   ├── renderer/            # React frontend
│   │   ├── App.tsx          # Main React component
│   │   ├── components/      # UI components
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript definitions
│   │   └── styles/          # CSS stylesheets
│   └── shared/              # Shared utilities and types
├── build_resources/          # Build resources and assets
│   ├── icons/               # Platform-specific icons
│   └── screenshots/         # Application screenshots
├── scripts/                 # Build and utility scripts
│   ├── build-release-run.sh # Unified build script
│   └── build-compile-dist.sh # Comprehensive build script
├── docs/                    # Documentation
├── archive/                 # Archived/backup files
└── dist/                    # Build outputs (generated)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or create issues for bug reports and feature requests.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/sanchez314c/ai-feed.git
cd ai-feed

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your API keys to .env

# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [arXiv](https://arxiv.org/) - For providing access to cutting-edge AI research papers
- [News API](https://newsapi.org/) - For aggregating AI-related news from various sources
- [YouTube API](https://developers.google.com/youtube/v3) - For access to AI educational content
- [Anthropic Claude](https://anthropic.com/) - For AI-powered content analysis and summarization
- [Electron](https://www.electronjs.org/) - For making cross-platform development possible
- The open-source AI community for making all of this possible

## 🔗 Links

- [Report Issues](https://github.com/sanchez314c/ai-feed/issues)
- [Request Features](https://github.com/sanchez314c/ai-feed/issues/new?labels=enhancement)
- [Discussions](https://github.com/sanchez314c/ai-feed/discussions)

---

**AIFEED v1.0** - AI Intelligence Dashboard
Built with AI!