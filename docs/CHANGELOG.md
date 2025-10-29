# Changelog

All notable changes to the AIFEED platform will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-08-23

### Added
- Initial release of AIFEED Electron application
- Multi-source data aggregation (arXiv, News API, YouTube, RSS feeds)
- AI-powered content analysis with Claude integration
- Advanced filtering and search capabilities
- SQLite database for local storage
- Cross-platform support (macOS, Windows, Linux)
- Comprehensive build system for all platforms
- Multiple installer formats (.dmg, .exe, .msi, .deb, .rpm, .AppImage, .snap)

### Technical
- Migrated from Python/Streamlit to Electron/React/TypeScript
- Implemented modular architecture with TypeScript
- Added Material-UI component library
- Integrated Vite for fast development builds
- Set up electron-builder for distribution

### Infrastructure
- Created comprehensive build scripts for all platforms
- Added development and production run scripts
- Configured macOS entitlements for code signing
- Set up resource management for icons and assets

## [0.1.0] - 2024-08-01 (Legacy)

### Initial Development
- Python/Streamlit web application
- Basic data collection from multiple sources
- SQLite database implementation
- Claude API integration for content processing