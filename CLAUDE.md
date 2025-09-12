# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the project structure for rebuilding AIFEED as an Electron desktop application. AIFEED is an AI intelligence dashboard that aggregates and analyzes AI-related content from multiple sources (arXiv papers, news articles, YouTube videos, company blogs). The project aims to convert the existing Python/Streamlit web application into a cross-platform desktop application with binaries for macOS, Windows, and Linux.

## Repository Structure

### Current State
- **legacy/** - Contains the original Python/Streamlit application
- **theFEED_Electron-PRD.md** - Comprehensive Product Requirements Document (15,000+ words) for the Electron rebuild with:
  - Executive summary and success metrics
  - Phase A (Core) and Phase B (Advanced) feature specifications
  - Complete technical architecture with 50+ code examples
  - 10+ implementation sections with starter code
  - Migration strategy and testing approach
  - Deployment and cutover procedures

### Target Architecture (To Be Implemented)
The Electron application will follow a modern desktop architecture:
- **Main Process** - Electron main process handling window management, native APIs, and system integration
- **Renderer Process** - Frontend UI built with modern web technologies (React/Vue/Angular)
- **Backend Services** - Node.js services for data collection, AI processing, and database operations
- **Database Layer** - SQLite for local data storage with optional cloud sync
- **Native Integration** - System notifications, file system access, and native menus

## Legacy Application Architecture

The current Python application provides the foundation with these key components:

### Core Modules
- **app.py** - Streamlit web interface with content display and filtering
- **data_collector.py** - Multi-source aggregation (arXiv, News API, YouTube API, RSS feeds)
- **data_manager.py** - SQLite database operations and data persistence
- **claude_processor.py** - Claude API integration for content analysis and categorization
- **scheduler.py** - Automated background tasks for data refresh
- **utils.py** - Shared utilities and configuration management

### Data Sources Integration
- **arXiv API** - Academic AI research papers from categories: cs.AI, cs.CL, cs.CV, cs.LG, cs.NE
- **News API** - AI-related news with intelligent keyword matching
- **YouTube API** - Content from AI-focused channels (Two Minute Papers, StatQuest, etc.)
- **RSS Feeds** - Company blogs from OpenAI, Anthropic, Google AI, Meta AI
- **Claude API** - Content analysis, summarization, and categorization

### Database Schema
SQLite database with two main tables:
- **items** - Content storage: id, title, url, source, content_type, description, summary, authors, published, thumbnail, categories, keywords, importance_score, channel, bookmarked, is_read
- **source_metadata** - Last fetch timestamps for incremental updates

## Development Commands (Legacy Python App)

### Environment Setup
```bash
# Quick start with automated setup
./start.sh

# Setup environment and dependencies
./start.sh setup

# Install dependencies only
pip install -r requirements.txt
```

### Running the Application
```bash
# Start web dashboard
./start.sh run
# Or: python app.py

# Start background scheduler
./start.sh scheduler
# Or: python scheduler.py

# Development mode with auto-reload
./start.sh dev
```

### Data Management
```bash
# Manual data refresh
./start.sh refresh
# Or: python data_manager.py --refresh

# Database initialization
python data_manager.py --init

# View database statistics
./start.sh stats
```

### Testing
```bash
# Run full test suite
./start.sh test
# Or: python -m pytest tests/

# Run specific test file
python -m pytest tests/test_data_collector.py -v
```

## Electron Development Setup (To Be Implemented)

Based on the PRD specifications, the Electron version will use this architecture:

### Project Structure (From PRD)
```
aifeed-platform/
├── apps/
│   ├── desktop/          # Electron desktop app
│   ├── web/             # Web application
│   ├── mobile/          # React Native apps
│   └── cli/             # Command-line tool
├── services/
│   ├── api-gateway/     # API Gateway service
│   ├── auth-service/    # Authentication service
│   ├── collector-service/ # Data collection service
│   ├── analyzer-service/  # Content analysis service
│   ├── search-service/    # Search service
│   └── notification-service/ # Notifications
├── packages/
│   ├── shared/          # Shared types and utils
│   ├── ui-components/   # Shared UI components
│   └── data-models/     # Data model definitions
└── infrastructure/     # Docker, K8s, Terraform
```

### Development Commands (To Be Implemented)
```bash
# Install Node.js dependencies
npm install

# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Package for distribution (macOS, Windows, Linux)
npm run dist

# Run tests
npm test

# Lint code
npm run lint

# Start microservices locally
npm run services:dev

# Run integration tests
npm run test:e2e
```

## Configuration Management

### Environment Variables
The application requires these API keys:
```env
ANTHROPIC_API_KEY=your_claude_api_key_here
NEWS_API_KEY=your_news_api_key (optional)
YOUTUBE_API_KEY=your_youtube_api_key (optional)
```

### Application Configuration
**config.yaml** controls:
- Data source settings (arXiv categories, news keywords, YouTube channels)
- UI preferences (pagination, thumbnails, titles)
- Scheduler intervals for automated data collection
- Content filtering and processing parameters

## Key Implementation Patterns

### Data Processing Pipeline
1. **Multi-source Collection** - Parallel data gathering with rate limiting
2. **AI Analysis** - Claude API processing for content enhancement
3. **Database Storage** - SQLite with JSON fields for flexible data structures
4. **UI Presentation** - Filtered, paginated, and searchable content display

### Error Handling Strategy
- Graceful degradation when external APIs are unavailable
- Comprehensive logging throughout all modules
- Retry logic with exponential backoff for HTTP requests
- Fallback content processing when AI analysis fails

### Content Analysis Features
- Automated categorization into 10 topic areas (Research, Applications, Business, Ethics, etc.)
- Importance scoring (1-10 scale) for content prioritization
- Keyword extraction and tagging
- Concise AI-generated summaries

### UI/UX Patterns
- Real-time content filtering and search
- Bookmark and read status tracking
- Responsive card-based layout
- Advanced filtering by date, source, topic, and importance

## PRD Implementation Strategy

The comprehensive PRD (theFEED_Electron-PRD.md) defines a complete rebuild strategy:

### Phase A - Core Features (Weeks 1-6)
- Enhanced multi-source data aggregation (arXiv, News, YouTube, GitHub, Twitter)
- Intelligent analysis engine with fallback strategies
- Advanced search with Elasticsearch and semantic search
- Real-time dashboard with WebSocket updates
- Modern React + TypeScript UI with Material Design
- Background processing with job queues
- Comprehensive testing and error handling

### Phase B - Advanced Features (Weeks 7-12) 
- Team collaboration and sharing
- AI-powered insights and trend prediction
- Advanced visualizations and analytics
- Mobile apps and offline capabilities
- Enterprise features (SSO, compliance)
- Content creation and curation tools

### Technical Improvements Over Legacy
- **Architecture**: Microservices vs monolithic Python app
- **Performance**: Parallel processing, Redis caching, optimized queries
- **UI/UX**: Real-time updates, responsive design, keyboard shortcuts
- **Scalability**: Horizontal scaling, WebSocket communication
- **Features**: Collaboration, advanced analytics, mobile support

### Migration Considerations
- **Data Migration**: SQLite to PostgreSQL with Redis caching
- **API Continuity**: Maintain existing data source integrations
- **User Experience**: Zero-downtime migration with rollback capabilities
- **Testing Strategy**: Comprehensive unit, integration, and E2E testing

## Development Notes

### Content Quality Standards
- All content undergoes AI analysis for relevance and quality
- Duplicate detection and filtering across sources
- Source credibility and reliability tracking
- Content freshness prioritization

### Performance Considerations
- Efficient database queries with proper indexing
- Incremental data collection to minimize API usage
- Image caching and thumbnail generation
- Background processing to maintain UI responsiveness

### Security and Privacy
- Secure API key management
- No user data collection or tracking
- Local-first data storage approach
- Rate limiting to respect API terms of service