# 📦 AIFEED Installation Guide

**Version:** 1.0.0  
**Last Updated:** October 30, 2024

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Installation Methods](#installation-methods)
4. [Platform-Specific Installation](#platform-specific-installation)
5. [Configuration](#configuration)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)

## Overview

AIFEED is an AI Intelligence Dashboard that aggregates and analyzes AI-related content from multiple sources. This guide covers installation across different platforms and methods.

### Installation Options

- **Binary Installation**: Download pre-built executables
- **Package Manager**: Install via npm, Homebrew, or Chocolatey
- **Source Installation**: Build from source code
- **Docker Installation**: Run in containerized environment

## System Requirements

### Minimum Requirements

**All Platforms:**

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 500MB free space for application
- **Network**: Internet connection for data collection
- **Display**: 1024x768 resolution minimum

**Windows:**

- **OS**: Windows 10 (1903) or later
- **Architecture**: x64 or ia32
- **Dependencies**: Microsoft Visual C++ Redistributable 2015+

**macOS:**

- **OS**: macOS 10.15 (Catalina) or later
- **Architecture**: Intel x64 or Apple Silicon (ARM64)
- **Dependencies**: None (self-contained)

**Linux:**

- **OS**: Ubuntu 18.04+, CentOS 7+, or equivalent
- **Architecture**: x64
- **Dependencies**: GTK+ 3, libnotify, libnss3

### Recommended Requirements

**For Optimal Performance:**

- **RAM**: 8GB or more
- **Storage**: 2GB free space (for database growth)
- **CPU**: Multi-core processor
- **Network**: Broadband connection

## Installation Methods

### Method 1: Binary Installation (Recommended)

#### Download and Install

**Windows:**

1. Download `AIFEED-Setup-1.0.0.exe` from [Releases](https://github.com/sanchez314c/ai-feed/releases)
2. Run the installer
3. Follow the installation wizard
4. Launch from Start Menu or Desktop shortcut

**macOS:**

1. Download `AIFEED-1.0.0.dmg` from [Releases](https://github.com/sanchez314c/ai-feed/releases)
2. Double-click the DMG file
3. Drag AIFEED to Applications folder
4. Launch from Launchpad or Applications folder

**Linux:**

1. Download `AIFEED-1.0.0.AppImage` from [Releases](https://github.com/sanchez314c/ai-feed/releases)
2. Make the file executable:
   ```bash
   chmod +x AIFEED-1.0.0.AppImage
   ```
3. Run the AppImage:
   ```bash
   ./AIFEED-1.0.0.AppImage
   ```

### Method 2: Package Manager Installation

#### npm (Cross-Platform)

```bash
# Install globally
npm install -g aifeed

# Run application
aifeed

# Install specific version
npm install -g aifeed@1.0.0
```

#### Homebrew (macOS)

```bash
# Install via Homebrew
brew install --cask aifeed

# Run application
open -a AIFEED

# Update to latest version
brew upgrade --cask aifeed
```

#### Chocolatey (Windows)

```bash
# Install via Chocolatey
choco install aifeed

# Run application
aifeed

# Update to latest version
choco upgrade aifeed
```

#### Snap (Linux)

```bash
# Install via Snap Store
sudo snap install aifeed

# Run application
snap run aifeed

# Update to latest version
sudo snap refresh aifeed
```

### Method 3: Source Installation

#### Prerequisites

```bash
# Install Node.js (version 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version
npm --version
```

#### Build from Source

```bash
# Clone repository
git clone https://github.com/sanchez314c/ai-feed.git
cd ai-feed

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure API keys (optional but recommended)
nano .env
```

Add your API keys to `.env`:

```env
ANTHROPIC_API_KEY=your_claude_api_key
NEWS_API_KEY=your_news_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

```bash
# Build application
npm run build

# Package for current platform
npm run dist:current

# Run in development mode
npm run dev
```

### Method 4: Docker Installation

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Build application
COPY . .
RUN npm run build

# Install runtime dependencies
RUN apk add --no-cache \
    gtk+3.0 \
    libxss1 \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo-gobject2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6

# Create user
RUN addgroup -g 1000 -S appuser && \
    adduser -S appuser -u 1000 -G appuser

USER appuser

EXPOSE 3000

CMD ["npm", "start"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  aifeed:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - NEWS_API_KEY=${NEWS_API_KEY}
      - YOUTUBE_API_KEY=${YOUTUBE_API_KEY}
    volumes:
      - ./data:/app/data
      - ./config:/app/config
    restart: unless-stopped
```

#### Running with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f

# Stop application
docker-compose down
```

## Platform-Specific Installation

### Windows Installation

#### Manual Installation

1. **Download Installer**
   - Visit [GitHub Releases](https://github.com/sanchez314c/ai-feed/releases)
   - Download `AIFEED-Setup-1.0.0.exe`

2. **Run Installer**
   - Right-click installer and "Run as administrator"
   - Follow installation wizard
   - Choose installation directory (default: `C:\Program Files\AIFEED`)

3. **Post-Installation**
   - Desktop shortcut created automatically
   - Start Menu entry added
   - Firewall exception may be required

#### Silent Installation

```bash
# Silent install for enterprise deployment
AIFEED-Setup-1.0.0.exe /S /D=C:\AIFEED

# Install with specific options
AIFEED-Setup-1.0.0.exe /S /D=C:\AIFEED /desktopshortcut /startmenu
```

#### Portable Version

```bash
# Download portable version
wget https://github.com/sanchez314c/ai-feed/releases/download/v1.0.0/AIFEED-1.0.0-win-portable.zip

# Extract and run
unzip AIFEED-1.0.0-win-portable.zip
cd AIFEED-win-portable
AIFEED.exe
```

### macOS Installation

#### App Store Installation

1. **Open App Store**
2. **Search for "AIFEED"**
3. **Click "Get" to install**
4. **Launch from Launchpad**

#### Manual Installation

1. **Download DMG**
   - Visit [GitHub Releases](https://github.com/sanchez314c/ai-feed/releases)
   - Download `AIFEED-1.0.0.dmg`

2. **Install Application**
   - Double-click DMG file
   - Drag AIFEED icon to Applications folder
   - Eject DMG after installation

3. **First Launch**
   - Right-click app and "Open" (macOS security)
   - Grant necessary permissions
   - Add to Security preferences if needed

#### Homebrew Installation

```bash
# Install via Cask
brew install --cask aifeed

# Install from source
brew install --build-from-source aifeed

# Pin specific version
brew pin aifeed
```

### Linux Installation

#### Ubuntu/Debian

```bash
# Add repository
wget -qO - https://deb.aifeed.app/aifeed.gpg.key | sudo apt-key add -
echo "deb https://deb.aifeed.app stable main" | sudo tee /etc/apt/sources.list.d/aifeed.list

# Update package list
sudo apt-get update

# Install application
sudo apt-get install aifeed

# Run application
aifeed
```

#### CentOS/RHEL/Fedora

```bash
# Add repository
sudo rpm --import https://rpm.aifeed.app/aifeed.gpg.key
sudo dnf config-manager --add-repo https://rpm.aifeed.app/aifeed.repo

# Install application
sudo dnf install aifeed

# Run application
aifeed
```

#### AppImage (Universal)

```bash
# Download AppImage
wget https://github.com/sanchez314c/ai-feed/releases/download/v1.0.0/AIFEED-1.0.0.AppImage

# Make executable
chmod +x AIFEED-1.0.0.AppImage

# Run application
./AIFEED-1.0.0.AppImage

# Install to system (optional)
sudo ./AIFEED-1.0.0.AppImage --install
```

## Configuration

### Environment Variables

Create or edit `.env` file in application directory:

```env
# Required for AI analysis
ANTHROPIC_API_KEY=your_claude_api_key

# Optional - enhances news coverage
NEWS_API_KEY=your_news_api_key

# Optional - video content aggregation
YOUTUBE_API_KEY=your_youtube_api_key

# Application settings
NODE_ENV=production
LOG_LEVEL=info

# Database settings
DATABASE_PATH=./data/aifeed.db

# Update settings
AUTO_UPDATE=true
UPDATE_INTERVAL=3600000
```

### Configuration File

```json
{
  "app": {
    "name": "AIFEED",
    "version": "1.0.0",
    "theme": "dark",
    "language": "en"
  },
  "dataSources": {
    "arxiv": {
      "enabled": true,
      "categories": ["cs.AI", "cs.CL", "cs.CV", "cs.LG", "cs.NE"],
      "maxResults": 100
    },
    "news": {
      "enabled": true,
      "sources": ["techcrunch", "venturebeat", "ai-news"],
      "maxResults": 50
    },
    "youtube": {
      "enabled": true,
      "channels": ["TwoMinutePapers", "StatQuest", "3Blue1Brown"],
      "maxResults": 25
    }
  },
  "ui": {
    "defaultView": "dashboard",
    "itemsPerPage": 50,
    "autoRefresh": true,
    "refreshInterval": 300000
  }
}
```

## Verification

### Installation Verification

```bash
# Check if application is installed
which aifeed

# Check version
aifeed --version

# Check installation path
whereis aifeed
```

### Functional Verification

1. **Launch Application**
   - Application should start without errors
   - Main window should appear
   - Loading indicators should show

2. **Check Data Collection**
   - Content should start loading
   - Progress indicators should update
   - Items should appear in dashboard

3. **Verify API Integration**
   - Check if API keys are working
   - Test search functionality
   - Verify content updates

### Health Check

```bash
# Run built-in health check
aifeed --health

# Check with curl
curl http://localhost:3000/health

# Expected response
{
  "status": "ok",
  "version": "1.0.0",
  "services": {
    "database": "ok",
    "ai_processor": "ok",
    "data_collector": "ok"
  }
}
```

## Troubleshooting

### Common Installation Issues

#### Permission Issues

**macOS:**

```bash
# Fix app cannot be opened
sudo xattr -rd com.apple.quarantine /Applications/AIFEED.app

# Fix untrusted developer
spctl --assess --type execute /Applications/AIFEED.app
```

**Linux:**

```bash
# Fix permission denied
chmod +x AIFEED.AppImage

# Fix library issues
sudo apt-get install libgtk-3-0 libxss1 libasound2
```

#### Dependency Issues

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules

# Reinstall dependencies
npm install
```

#### Build Issues

```bash
# Check Node.js version
node --version

# Install correct version
nvm install 18
nvm use 18

# Rebuild native modules
npm rebuild
```

### Getting Help

- **Documentation**: [AIFEED Documentation](https://docs.aifeed.app)
- **Issues**: [GitHub Issues](https://github.com/sanchez314c/ai-feed/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sanchez314c/ai-feed/discussions)
- **Email**: support@aifeed.app

### Uninstallation

**Windows:**

```bash
# Via Control Panel
1. Open "Apps & features"
2. Find "AIFEED"
3. Click "Uninstall"
4. Follow uninstall wizard

# Via command line
AIFEED-Setup-1.0.0.exe /S /D=C:\AIFEED
```

**macOS:**

```bash
# Drag to Trash
1. Open Applications folder
2. Drag AIFEED to Trash
3. Empty Trash

# Via command line
sudo rm -rf /Applications/AIFEED.app
```

**Linux:**

```bash
# Via package manager
sudo apt-get remove aifeed
sudo dnf remove aifeed

# Manual removal
sudo rm -rf /opt/aifeed
sudo rm /usr/local/bin/aifeed
```

---

**Related Documentation:**

- [User Guide](USER_GUIDE.md)
- [Configuration Guide](CONFIGURATION.md)
- [Troubleshooting Guide](TROUBLESHOOTING.md)
