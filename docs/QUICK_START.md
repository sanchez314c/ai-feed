# 🚀 AIFEED Quick Start Guide

**Version:** 1.0.0  
**Last Updated:** October 30, 2024

## Overview

Get AIFEED running in minutes with this quick start guide. AIFEED is an AI Intelligence Dashboard that aggregates and analyzes AI content from multiple sources.

### What You'll Get

- **Multi-Source AI Content**: Research papers, news, videos, and blogs
- **AI-Powered Analysis**: Automated categorization and summarization
- **Smart Dashboard**: Filter, search, and organize content
- **Real-time Updates**: Background content refresh
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Method 1: Binary Installation (Fastest)

### Step 1: Download

**Windows:**

1. Download [AIFEED-Setup-1.0.0.exe](https://github.com/sanchez314c/ai-feed/releases/download/v1.0.0/AIFEED-Setup-1.0.0.exe)
2. Run the installer
3. Follow the installation wizard

**macOS:**

1. Download [AIFEED-1.0.0.dmg](https://github.com/sanchez314c/ai-feed/releases/download/v1.0.0/AIFEED-1.0.0.dmg)
2. Double-click the DMG file
3. Drag AIFEED to Applications folder

**Linux:**

1. Download [AIFEED-1.0.0.AppImage](https://github.com/sanchez314c/ai-feed/releases/download/v1.0.0/AIFEED-1.0.0.AppImage)
2. Make executable: `chmod +x AIFEED-1.0.0.AppImage`
3. Run: `./AIFEED-1.0.0.AppImage`

### Step 2: Launch

- **Windows**: Start Menu → AIFEED
- **macOS**: Launchpad → AIFEED
- **Linux**: Applications → AIFEED or run from terminal

### Step 3: Initial Setup

1. **First Launch**: Application opens with welcome screen
2. **API Keys** (Optional but recommended):
   - Click Settings → API Configuration
   - Add your API keys:
     - **Anthropic API**: For AI analysis (required)
     - **News API**: For news aggregation (optional)
     - **YouTube API**: For video content (optional)
3. **Content Loading**: Wait 2-3 minutes for initial data collection

## Method 2: Package Manager Installation

### npm (Cross-Platform)

```bash
# Install globally
npm install -g aifeed

# Run application
aifeed
```

### Homebrew (macOS)

```bash
# Install via Homebrew
brew install --cask aifeed

# Run application
open -a AIFEED
```

### Chocolatey (Windows)

```bash
# Install via Chocolatey
choco install aifeed

# Run application
aifeed
```

## Method 3: Development Setup

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher
- **Git** for version control

### Installation Steps

```bash
# 1. Clone repository
git clone https://github.com/sanchez314c/ai-feed.git
cd ai-feed

# 2. Install dependencies
npm install

# 3. Copy environment template
cp .env.example .env

# 4. Configure API keys (optional)
nano .env
```

Add to `.env`:

```env
ANTHROPIC_API_KEY=your_claude_api_key
NEWS_API_KEY=your_news_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

```bash
# 5. Start development
npm run dev
```

## First Run Configuration

### Essential Settings

1. **API Configuration**
   - **Anthropic API**: Required for content analysis
   - Get key at [Anthropic Console](https://console.anthropic.com)
   - Add to Settings → API Configuration

2. **Data Sources**
   - **arXiv**: AI research papers (enabled by default)
   - **News**: AI news articles (optional API key)
   - **YouTube**: AI video content (optional API key)
   - **RSS Feeds**: Company blogs (OpenAI, Anthropic, etc.)

3. **Update Settings**
   - **Auto-refresh**: Every 2 hours (default)
   - **Background updates**: Enabled by default
   - **Content limits**: 50 items per source (default)

### Basic Usage

1. **Dashboard View**: Main content feed with latest items
2. **Search**: Find specific content using search bar
3. **Filters**: Filter by source, category, date, importance
4. **Bookmarks**: Save important items for later
5. **Read Status**: Mark items as read/unread

## Getting API Keys

### Anthropic Claude API (Required)

1. Visit [Anthropic Console](https://console.anthropic.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create new API key
5. Copy key and add to AIFEED settings

### News API (Optional)

1. Visit [NewsAPI.org](https://newsapi.org)
2. Sign up for free plan
3. Get API key from dashboard
4. Add to AIFEED settings

### YouTube API (Optional)

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable YouTube Data API v3
4. Create API credentials
5. Add to AIFEED settings

## Basic Features

### Content Aggregation

**Sources Available:**

- **arXiv**: Latest AI research papers
- **News**: AI industry news and updates
- **YouTube**: Educational and research videos
- **RSS**: Company blogs and announcements

**Content Types:**

- **Research Papers**: Academic papers and preprints
- **News Articles**: Industry news and announcements
- **Videos**: Educational content and talks
- **Blog Posts**: Company updates and insights

### AI Analysis

**Automatic Processing:**

- **Categorization**: Content sorted by AI topics
- **Summarization**: Key points extracted automatically
- **Importance Scoring**: Content ranked by relevance
- **Keyword Extraction**: Key terms identified

### User Interface

**Main Components:**

- **Dashboard**: Primary content view
- **Search Bar**: Quick content search
- **Filter Panel**: Advanced filtering options
- **Settings**: Configuration and preferences
- **Bookmarks**: Saved important items

**Navigation:**

- **Keyboard Shortcuts**: Ctrl+F (search), Ctrl+R (refresh)
- **Context Menus**: Right-click for options
- **Drag & Drop**: Add custom RSS feeds

## Common First Tasks

### Set Up Your Preferences

1. **Theme Selection**: Dark/Light mode
2. **Content Filters**: Minimum importance, preferred sources
3. **Update Frequency**: How often to refresh content
4. **Notification Settings**: Desktop alerts for new content

### Customize Content Sources

1. **arXiv Categories**: Choose AI subfields
2. **News Sources**: Add preferred news outlets
3. **YouTube Channels**: Add educational channels
4. **RSS Feeds**: Add company blogs and research groups

### Search and Discover

1. **Simple Search**: Type in search bar
2. **Advanced Search**: Use filters for precise results
3. **Save Searches**: Bookmark frequent searches
4. **Trending Topics**: Discover popular AI topics

## Troubleshooting Quick Fixes

### Application Won't Start

1. **Restart**: Close and reopen application
2. **Check Permissions**: Ensure app has necessary permissions
3. **Update**: Install latest version
4. **Reinstall**: As last resort, reinstall application

### No Content Loading

1. **Check API Keys**: Verify keys are correctly entered
2. **Check Internet**: Ensure network connectivity
3. **Check Source Status**: Verify external services are available
4. **Refresh Manually**: Click refresh button in settings

### Performance Issues

1. **Reduce Content Limits**: Lower items per source
2. **Increase Update Interval**: Reduce refresh frequency
3. **Clear Database**: Reset local data in settings
4. **Close Other Apps**: Free up system resources

## Next Steps

### Explore Advanced Features

- **Custom RSS Feeds**: Add your favorite AI blogs
- **Advanced Filters**: Create complex filter combinations
- **Export Data**: Save content for external analysis
- **API Access**: Use AIFEED data in your own applications

### Integration Options

- **Browser Extensions**: Quick access from browser
- **Mobile Apps**: Access content on mobile devices
- **API Integration**: Build on AIFEED platform
- **Webhooks**: Real-time content notifications

### Community Resources

- **Documentation**: [Full Documentation](https://docs.aifeed.app)
- **GitHub**: [Source Code & Issues](https://github.com/sanchez314c/ai-feed)
- **Discussions**: [Community Forum](https://github.com/sanchez314c/ai-feed/discussions)
- **Updates**: [Release Notes](https://github.com/sanchez314c/ai-feed/releases)

## Need Help?

- **FAQ**: [Frequently Asked Questions](FAQ.md)
- **Troubleshooting**: [Detailed Troubleshooting](TROUBLESHOOTING.md)
- **Support**: Email support@aifeed.app
- **Issues**: [Report Issues](https://github.com/sanchez314c/ai-feed/issues)

---

**Welcome to AIFEED!** 🎉

You're now ready to explore the latest in AI research, news, and insights. Start with the dashboard, customize your preferences, and discover content that matters to you.

**Pro Tip**: Add your Anthropic API key first to unlock AI-powered content analysis and categorization features.
