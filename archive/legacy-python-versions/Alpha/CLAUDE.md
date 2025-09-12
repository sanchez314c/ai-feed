# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIFEED is an AI intelligence dashboard that aggregates and analyzes AI-related content from multiple sources (arXiv papers, news articles, YouTube videos, company blogs). It uses a Streamlit web interface, SQLite database for storage, Claude API for content analysis, and includes automated scheduling for data collection.

## Core Architecture

The application follows a modular design with clear separation of concerns:

### Main Components

- **app.py** - Streamlit web application UI with paginated content display
- **data_collector.py** - Multi-source data aggregation (arXiv, News API, YouTube API, RSS feeds)  
- **data_manager.py** - Database operations and data persistence layer using SQLite
- **claude_processor.py** - AI-powered content analysis and categorization using Claude API
- **scheduler.py** - Background task scheduler for automated data refresh
- **utils.py** - Shared utilities, database initialization, configuration loading

### Data Flow Architecture

```
Sources (arXiv, News, YouTube, Blogs) 
    → DataCollector 
    → ClaudeProcessor (analysis) 
    → DataManager (SQLite storage) 
    → Streamlit UI
```

### Database Schema

SQLite database with two main tables:
- **items** - Main content storage with fields: id, title, url, source, content_type, description, summary, authors, published, thumbnail, categories, keywords, importance_score, channel, bookmarked, is_read
- **source_metadata** - Tracks last fetch timestamps for incremental data collection

## Development Commands

### Environment Setup
```bash
# Quick start (recommended)
./start.sh

# Setup environment and dependencies
./start.sh setup

# Install/update dependencies only
pip install -r requirements.txt
```

### Running the Application
```bash
# Start dashboard
./start.sh run
# Or directly: python app.py or streamlit run app.py

# Start background scheduler
./start.sh scheduler
# Or directly: python scheduler.py

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
# Run test suite
./start.sh test
# Or: python -m pytest tests/

# Run specific test file
python -m pytest tests/test_data_collector.py -v
```

### Utilities
```bash
# Clean cache and temporary files
./start.sh clean

# Check system requirements
./start.sh check

# Database backup
./start.sh backup
```

## Configuration

### Environment Variables (.env)
Required API keys and configuration:
```env
ANTHROPIC_API_KEY=your_claude_api_key_here
NEWS_API_KEY=your_news_api_key (optional, can be "disabled")
YOUTUBE_API_KEY=your_youtube_api_key (optional)
```

### Application Configuration (config.yaml)
- Source configuration for arXiv categories, news keywords, YouTube channels, RSS feeds
- UI settings for pagination, thumbnails, refresh intervals
- Scheduler configuration for automatic refresh intervals

## Key Technical Patterns

### Error Handling
- Comprehensive exception handling with logging throughout all modules
- Graceful degradation when APIs are unavailable (Claude, News API, YouTube API)
- Retry logic with exponential backoff for HTTP requests

### Data Processing Pipeline
1. **Collection**: Multi-source data gathering with rate limiting and incremental fetching
2. **Processing**: Claude API analysis for summarization, categorization, and importance scoring
3. **Storage**: SQLite with JSON field storage for flexible data structures
4. **Display**: Paginated Streamlit interface with filtering and bookmark functionality

### API Integration Patterns
- **Claude API**: Structured JSON responses for content analysis with fallback to simple text truncation
- **News API**: Full article text extraction for better analysis quality
- **YouTube API**: Batch video details fetching for efficiency
- **RSS Feeds**: Incremental parsing with last-seen item tracking

### Database Operations
- UPSERT patterns for handling duplicate content
- JSON field storage for flexible arrays (categories, keywords)
- Row factory configuration for dictionary-style access
- Connection management with proper cleanup

## Development Notes

### Content Analysis
The ClaudeProcessor uses structured prompts to generate:
- Content categorization (Research, Applications, Business, Ethics, Policy, Tools, Tutorials, Hardware, Theory, Community)
- Importance scoring (1-10 scale)
- Keyword extraction
- Concise summaries

### UI Features
- Bookmark and read status tracking
- Advanced filtering (date range, source type, topics, importance threshold)
- Search across all content types
- Responsive design with content cards
- Real-time data refresh capability

### Background Processing
- Automated data collection via APScheduler
- Signal handling for graceful shutdown
- Job execution monitoring and error reporting
- Configurable refresh intervals

### Testing Strategy
- Unit tests for core modules (data_collector, data_manager, utils)
- Mock-based testing for external API dependencies
- Database operation testing with temporary databases
- Configuration testing for various scenarios