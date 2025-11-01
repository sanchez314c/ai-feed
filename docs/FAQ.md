# ❓ AIFEED Frequently Asked Questions (FAQ)

**Version:** 1.0.0
**Last Updated:** October 30, 2024

## Table of Contents

1. [General Questions](#general-questions)
2. [Installation and Setup](#installation-and-setup)
3. [API Keys and Configuration](#api-keys-and-configuration)
4. [Content and Data Sources](#content-and-data-sources)
5. [Features and Usage](#features-and-usage)
6. [Performance and Troubleshooting](#performance-and-troubleshooting)
7. [Privacy and Security](#privacy-and-security)
8. [Development and Contributions](#development-and-contributions)
9. [Platform-Specific Questions](#platform-specific-questions)

## General Questions

### What is AIFEED?

AIFEED is an AI Intelligence Dashboard that aggregates and analyzes AI-related content from multiple sources including arXiv research papers, news articles, YouTube videos, and company blogs. It uses AI to categorize, summarize, and prioritize content to help you stay informed about AI developments.

### Is AIFEED free?

Yes! AIFEED is open-source and free to use. However, some features require API keys from third-party services:

- **Anthropic Claude API**: Required for AI-powered content analysis
- **News API**: Optional, for enhanced news coverage
- **YouTube API**: Optional, for video content aggregation

### What platforms does AIFEED support?

AIFEED supports:
- **Windows 10/11** (x64, x86)
- **macOS 10.15+** (Intel and Apple Silicon)
- **Linux** (Ubuntu, Fedora, Debian, Arch, and more)

### How does AIFEED differ from RSS readers?

While RSS readers simply aggregate content, AIFEED:
- Uses AI to analyze and categorize content
- Generates intelligent summaries
- Scores content by importance
- Aggregates from multiple source types (not just RSS)
- Provides AI-powered search and filtering

## Installation and Setup

### How do I install AIFEED?

1. **Download** the appropriate installer for your platform from [GitHub Releases](https://github.com/sanchez314c/ai-feed/releases)
2. **Run the installer** and follow the setup wizard
3. **Launch AIFEED** from your applications folder
4. **Configure API keys** in Settings for full functionality

### Do I need to install Node.js or other dependencies?

No! The distributed versions of AIFEED include all necessary dependencies. You only need to install Node.js if you're building from source.

### Can I run AIFEED from source?

Yes! See the [Development Guide](DEVELOPMENT.md) for instructions on building from source.

### How much disk space does AIFEED need?

- **Application**: ~200MB initially
- **Database**: Grows with usage (~1-5MB per 1000 items)
- **Cache**: Configurable, default 500MB
- **Total recommended**: 1GB free space

## API Keys and Configuration

### Which API keys are required?

- **Anthropic Claude API**: Required for AI analysis features
- **News API**: Optional, enhances news coverage
- **YouTube API**: Optional, enables video content aggregation

Without API keys, AIFEED will still work but with limited functionality.

### How do I get an Anthropic API key?

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key
5. Copy and paste into AIFEED settings

### How much do the APIs cost?

- **Anthropic Claude**: Free tier available, paid usage varies by model
- **News API**: Free tier (1,000 requests/day), Developer plan ($499/month)
- **YouTube API**: Free tier (10,000 units/day), then pay-per-use

Typical usage for a personal user often stays within free tiers.

### Can I use AIFEED without API keys?

Yes, but with limitations:
- No AI-powered summaries
- Limited categorization
- Basic content aggregation only
- No importance scoring

## Content and Data Sources

### What content sources does AIFEED support?

- **arXiv**: AI research papers (cs.AI, cs.CL, cs.CV, cs.LG, cs.NE)
- **News**: AI-related news from major tech publications
- **YouTube**: Educational videos from AI-focused channels
- **RSS Feeds**: Company blogs (OpenAI, Anthropic, Google AI, Meta AI)
- **Custom**: Add your own RSS feeds and sources

### How often is content updated?

Update intervals are configurable:
- **arXiv**: Daily (default)
- **News**: Every 2 hours (default)
- **YouTube**: Daily (default)
- **RSS**: Every hour (default)

### Can I add my own content sources?

Yes! You can add:
- Custom RSS feeds
- Additional arXiv categories
- Specific YouTube channels
- Custom news sources (with API)

### How does AIFEED avoid duplicate content?

AIFEED uses multiple methods:
- URL deduplication
- Title similarity matching
- Content hash comparison
- Source cross-referencing

### Can I import existing bookmarks?

Currently, AIFEED doesn't import bookmarks from other services. However, you can:
- Export bookmarks from other services
- Use the API to bulk-add items
- Request this feature on GitHub

## Features and Usage

### How does the AI analysis work?

AIFEED uses Claude AI to:
- **Categorize** content into predefined topics
- **Generate** concise summaries
- **Extract** key points and keywords
- **Score** content importance (1-10 scale)
- **Identify** related content

### Can I customize the categorization?

Yes! You can:
- Create custom categories
- Set categorization rules
- Train the system with your preferences
- Override automatic categorizations

### How do keyboard shortcuts work?

Press `Ctrl/Cmd + /` to see all keyboard shortcuts. Common ones:
- `Ctrl/Cmd + K`: Quick search
- `R`: Mark as read/unread
- `B`: Bookmark
- `O`: Open in browser
- `1-5`: Navigate sections

### Can I export data?

Yes! You can export:
- Individual articles as PDF
- Bookmarks as JSON/CSV
- Search results
- Full database backup

### Does AIFEED work offline?

Yes, with limitations:
- View existing content offline
- Search cached content
- No new content updates
- Limited AI features

## Performance and Troubleshooting

### Why is AIFEED using so much CPU/memory?

Common causes:
- Initial content loading
- Background updates
- Large database size
- Multiple concurrent operations

Solutions:
- Wait for initial sync to complete
- Adjust update intervals
- Clear old content
- Reduce concurrent operations

### Content isn't updating. What should I do?

1. Check internet connection
2. Verify API keys in settings
3. Try manual refresh (Ctrl/Cmd + R)
4. Check API usage limits
5. Review [Troubleshooting Guide](TROUBLESHOOTING.md)

### AIFEED crashes on startup. How do I fix it?

Try these steps:
1. Restart your computer
2. Start in safe mode (command line flag)
3. Reset configuration
4. Reinstall application
5. Check for platform-specific issues

### How do I clear the cache?

Settings → Advanced → Clear Cache, or:
- Delete cache folder manually
- Restart application

## Privacy and Security

### Where is my data stored?

All data is stored locally on your device:
- **macOS**: `~/Library/Application Support/AIFEED/`
- **Windows**: `%APPDATA%/AIFEED/`
- **Linux**: `~/.config/AIFEED/`

### Does AIFEED collect personal data?

No! AIFEED:
- Stores all data locally
- Doesn't track user behavior
- Doesn't send data to third parties
- Only uses APIs for content aggregation

### Are my API keys secure?

Yes:
- Keys are stored locally and encrypted
- Never transmitted except to respective APIs
- Can be revoked at any time
- Not included in crash reports or diagnostics

### Can I use AIFEED in a corporate environment?

Yes, but consider:
- API usage policies
- Network firewall settings
- Corporate proxy configuration
- Data sovereignty requirements

## Development and Contributions

### How can I contribute to AIFEED?

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code contribution guidelines
- Bug reporting process
- Feature request procedures
- Development setup instructions

### What technology stack does AIFEED use?

- **Frontend**: React + TypeScript + Material-UI
- **Backend**: Node.js + Electron
- **Database**: SQLite
- **AI Integration**: Anthropic Claude API
- **Build System**: Vite + Electron Builder

### Can I request new features?

Yes! Please:
- Check if already requested on GitHub
- Create a feature request issue
- Describe use case and requirements
- Consider contributing implementation

### How do I report bugs?

Use the [GitHub issue tracker](https://github.com/sanchez314c/ai-feed/issues) and include:
- Operating system and version
- AIFEED version
- Steps to reproduce
- Error messages and logs
- Expected vs actual behavior

## Platform-Specific Questions

### macOS

#### Does AIFEED support Apple Silicon?

Yes! AIFEED provides Universal Binaries that work on both Intel and Apple Silicon Macs.

#### Why does macOS say the app is "damaged"?

This is a Gatekeeper issue. Right-click the app and select "Open", then click "Open" in the dialog.

#### Can I use AIFEED with Touch Bar?

Not currently, but this is a planned feature.

### Windows

#### Which Windows versions are supported?

Windows 10 (version 1903+) and Windows 11.

#### Does AIFEED work on Windows ARM?

Not currently. Only x64 and x86 versions are available.

#### Can I install AIFEED for all users?

Yes, run the installer as administrator and choose "Install for all users."

### Linux

#### Which Linux distributions are supported?

Most modern distributions are supported:
- Ubuntu 18.04+
- Fedora 30+
- Debian 10+
- Arch Linux
- Other distributions with required dependencies

#### How do I install AIFEED on Linux?

1. Download the AppImage, .deb, or .rpm package
2. Make it executable (for AppImage): `chmod +x AIFEED.AppImage`
3. Run the package or AppImage

#### Does AIFEED support Wayland?

Partial support is available. For full compatibility, run with XWayland:
```bash
GDK_BACKEND=x11 ./AIFEED.AppImage
```

### General

#### Can I run AIFEED on a server?

Yes, but it's designed as a desktop application. For server use, consider:
- Running with virtual display (Xvfb)
- Using the API directly
- Contributing a headless mode

#### Does AIFEED support multiple users?

Each user gets their own database and settings. Share the installation, but data is user-specific.

#### Can I sync data between devices?

Not currently implemented. Planned features include:
- Cloud sync via self-hosted server
- Import/export functionality
- Database migration tools

---

## Still Have Questions?

If your question isn't answered here:

1. **Check the documentation**:
   - [User Guide](USER_GUIDE.md)
   - [Configuration Guide](CONFIGURATION.md)
   - [Troubleshooting Guide](TROUBLESHOOTING.md)

2. **Search GitHub issues**:
   - [Existing Issues](https://github.com/sanchez314c/ai-feed/issues)
   - [Discussions](https://github.com/sanchez314c/ai-feed/discussions)

3. **Ask the community**:
   - Create a new GitHub issue
   - Join community discussions
   - Check Stack Overflow

4. **Contact support**:
   - Use in-app support (Help → Report Issue)
   - Email: support@aifeed.app
   - Include diagnostic information for faster assistance