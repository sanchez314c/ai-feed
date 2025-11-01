# 🔌 AIFEED API Reference

**Version:** 1.0.0  
**Last Updated:** October 30, 2024

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Core API Endpoints](#core-api-endpoints)
4. [Content Management](#content-management)
5. [Search and Filtering](#search-and-filtering)
6. [User Preferences](#user-preferences)
7. [Data Sources](#data-sources)
8. [Analytics](#analytics)
9. [WebSocket API](#websocket-api)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [SDKs and Libraries](#sdks-and-libraries)

## Overview

AIFEED provides a comprehensive REST API for accessing and managing AI intelligence data. The API allows you to:

- Retrieve aggregated AI content from multiple sources
- Search and filter content by various criteria
- Manage user preferences and settings
- Access analytics and insights
- Receive real-time updates via WebSocket

### Base URL

```
Development: http://localhost:3000/api/v1
Production: https://api.aifeed.app/v1
```

### API Versioning

API version is specified in URL path. Current version: `v1`

### Content Types

All API responses use JSON content type:

```
Content-Type: application/json
```

## Authentication

### API Key Authentication

Include your API key in request header:

```http
Authorization: Bearer YOUR_API_KEY
X-API-Key: YOUR_API_KEY
```

### Generating API Keys

1. Navigate to Settings → API Access
2. Click "Generate New Key"
3. Set key permissions and expiration
4. Copy and securely store the key

### Key Permissions

- **read**: Access content and search
- **write**: Modify preferences and bookmarks
- **admin**: Full access including analytics
- **data-source**: Manage data source configurations

## Core API Endpoints

### Health Check

```http
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2024-10-30T10:00:00Z",
  "services": {
    "database": "ok",
    "ai_processor": "ok",
    "data_collector": "ok"
  }
}
```

### Application Info

```http
GET /info
```

**Response:**

```json
{
  "application": "AIFEED",
  "version": "1.0.0",
  "build": "20241030-001",
  "platform": "darwin",
  "electron_version": "39.0.0",
  "features": ["ai_analysis", "multi_source", "real_time_updates"]
}
```

## Content Management

### Get Content Items

```http
GET /content
```

**Query Parameters:**

- `page` (integer, default: 1): Page number
- `limit` (integer, default: 50): Items per page (max 100)
- `sort` (string, default: "published_at"): Sort field
- `order` (string, default: "desc"): Sort order ("asc" or "desc")
- `source` (string[]): Filter by sources
- `category` (string[]): Filter by categories
- `date_from` (string): Filter from date (ISO 8601)
- `date_to` (string): Filter to date (ISO 8601)
- `min_importance` (integer): Minimum importance score

**Response:**

```json
{
  "data": [
    {
      "id": "uuid-string",
      "title": "Breakthrough in Large Language Model Efficiency",
      "url": "https://arxiv.org/abs/2024.12345",
      "source": "arxiv",
      "content_type": "paper",
      "summary": "Researchers developed a new technique...",
      "description": "Full abstract text...",
      "authors": ["John Doe", "Jane Smith"],
      "published_at": "2024-10-29T14:30:00Z",
      "thumbnail": "https://example.com/thumb.jpg",
      "categories": ["Research", "Machine Learning"],
      "keywords": ["llm", "efficiency", "optimization"],
      "importance_score": 8,
      "channel": "arxiv.cs.AI",
      "bookmarked": false,
      "is_read": false,
      "created_at": "2024-10-30T10:00:00Z",
      "updated_at": "2024-10-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1234,
    "pages": 25
  },
  "filters": {
    "sources": ["arxiv", "youtube", "news"],
    "categories": ["Research", "Industry News"],
    "date_range": {
      "from": "2024-10-01",
      "to": "2024-10-30"
    }
  }
}
```

### Get Single Item

```http
GET /content/{id}
```

**Response:**

```json
{
  "id": "uuid-string",
  "title": "Article Title",
  "url": "https://example.com/article",
  "source": "arxiv",
  "content_type": "paper",
  "summary": "AI-generated summary",
  "description": "Full content or abstract",
  "authors": ["Author Name"],
  "published_at": "2024-10-29T14:30:00Z",
  "thumbnail": "https://example.com/thumb.jpg",
  "categories": ["Research", "Machine Learning"],
  "keywords": ["ai", "ml", "research"],
  "importance_score": 8,
  "channel": "arxiv.cs.AI",
  "bookmarked": false,
  "is_read": false,
  "metadata": {
    "paper_id": "2024.12345",
    "doi": "10.1234/example.2024.12345",
    "pages": 12,
    "references": 42
  },
  "related_items": [
    {
      "id": "related-uuid",
      "title": "Related Article",
      "similarity_score": 0.85
    }
  ],
  "created_at": "2024-10-30T10:00:00Z",
  "updated_at": "2024-10-30T10:00:00Z"
}
```

### Update Item Status

```http
PATCH /content/{id}
```

**Request Body:**

```json
{
  "is_read": true,
  "bookmarked": true,
  "custom_tags": ["important", "follow-up"],
  "notes": "User notes about this item"
}
```

**Response:**

```json
{
  "id": "uuid-string",
  "updated_fields": ["is_read", "bookmarked"],
  "updated_at": "2024-10-30T10:30:00Z"
}
```

### Bulk Update Items

```http
PATCH /content/bulk
```

**Request Body:**

```json
{
  "item_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "updates": {
    "is_read": true,
    "bookmarked": false
  }
}
```

### Delete Items

```http
DELETE /content/{id}
```

**Response:**

```json
{
  "deleted": true,
  "deleted_at": "2024-10-30T10:30:00Z"
}
```

## Search and Filtering

### Search Content

```http
GET /search
```

**Query Parameters:**

- `q` (string, required): Search query
- `fields` (string[]): Search fields ["title", "summary", "content"]
- `filters` (object): Additional filters
- `highlight` (boolean, default: true): Highlight matches
- `suggest` (boolean, default: false): Include suggestions

**Response:**

```json
{
  "query": "large language models",
  "results": [
    {
      "id": "uuid-string",
      "title": "Advances in <mark>Large Language Models</mark>",
      "summary": "Recent developments in <mark>LLM</mark> technology...",
      "score": 0.95,
      "highlights": [
        "Advances in <mark>Large Language Models</mark>",
        "Recent developments in <mark>LLM</mark> technology"
      ]
    }
  ],
  "total": 42,
  "took": 15,
  "suggestions": ["large language model", "llm", "transformer"]
}
```

### Advanced Search

```http
POST /search/advanced
```

**Request Body:**

```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "machine learning" } },
        { "range": { "published_at": { "gte": "2024-10-01" } } }
      ],
      "must_not": [{ "term": { "source": "social_media" } }],
      "filter": [
        { "term": { "categories": "Research" } },
        { "range": { "importance_score": { "gte": 7 } } }
      ]
    }
  },
  "sort": [{ "importance_score": { "order": "desc" } }, { "published_at": { "order": "desc" } }],
  "highlight": {
    "fields": {
      "title": {},
      "summary": {}
    }
  }
}
```

### Search Suggestions

```http
GET /search/suggest?q={partial_query}
```

**Response:**

```json
{
  "query": "machine le",
  "suggestions": ["machine learning", "machine learning algorithms", "machine learning models"],
  "completions": ["machine learning", "machine learning basics", "machine learning course"]
}
```

## User Preferences

### Get Preferences

```http
GET /preferences
```

**Response:**

```json
{
  "user_id": "user-uuid",
  "appearance": {
    "theme": "dark",
    "font_size": "medium",
    "card_density": "comfortable"
  },
  "notifications": {
    "desktop": true,
    "email": false,
    "frequency": "daily"
  },
  "content_filters": {
    "min_importance": 5,
    "max_age_days": 30,
    "blocked_keywords": ["spam"],
    "preferred_sources": ["arxiv", "nature"]
  },
  "updates": {
    "auto_refresh": true,
    "interval": 3600000,
    "background_updates": true
  }
}
```

### Update Preferences

```http
PUT /preferences
```

**Request Body:**

```json
{
  "appearance": {
    "theme": "light"
  },
  "notifications": {
    "email": true
  }
}
```

### Export Preferences

```http
GET /preferences/export
```

**Response:** File download with preferences JSON

### Import Preferences

```http
POST /preferences/import
```

**Request:** Multipart form with file

## Data Sources

### Get Data Sources

```http
GET /data-sources
```

**Response:**

```json
{
  "sources": [
    {
      "id": "arxiv",
      "name": "arXiv",
      "type": "api",
      "enabled": true,
      "config": {
        "categories": ["cs.AI", "cs.LG"],
        "max_results": 100
      },
      "status": {
        "last_update": "2024-10-30T09:00:00Z",
        "total_items": 1234,
        "error_count": 0
      }
    }
  ]
}
```

### Add Custom RSS Feed

```http
POST /data-sources/rss
```

**Request Body:**

```json
{
  "name": "Custom AI Blog",
  "url": "https://example.com/ai-blog/rss.xml",
  "category": "Company Blogs",
  "update_interval": 3600000,
  "enabled": true
}
```

### Update Data Source

```http
PUT /data-sources/{id}
```

### Test Data Source

```http
POST /data-sources/{id}/test
```

**Response:**

```json
{
  "status": "success",
  "response_time": 245,
  "sample_items": 3,
  "last_error": null
}
```

## Analytics

### Get Statistics

```http
GET /analytics/stats
```

**Query Parameters:**

- `period` (string, default: "7d"): Time period ("1d", "7d", "30d", "90d")
- `metrics` (string[]): Specific metrics to include

**Response:**

```json
{
  "period": "7d",
  "metrics": {
    "total_items": 342,
    "items_by_source": {
      "arxiv": 156,
      "news": 89,
      "youtube": 45,
      "rss": 52
    },
    "items_by_category": {
      "Research": 156,
      "Industry News": 89,
      "Applications": 45,
      "Tools": 32
    },
    "reading_stats": {
      "items_read": 128,
      "completion_rate": 0.37,
      "avg_reading_time": 180
    },
    "importance_distribution": {
      "1-3": 45,
      "4-6": 123,
      "7-8": 142,
      "9-10": 32
    }
  },
  "trends": {
    "daily_volume": [
      { "date": "2024-10-24", "count": 42 },
      { "date": "2024-10-25", "count": 48 }
    ]
  }
}
```

### Get Content Trends

```http
GET /analytics/trends
```

**Response:**

```json
{
  "trending_topics": [
    {
      "topic": "GPT-4",
      "growth": 0.25,
      "mentions": 42,
      "sentiment": "positive"
    }
  ],
  "emerging_keywords": [
    {
      "keyword": "quantum ai",
      "frequency": 12,
      "growth": 0.8
    }
  ]
}
```

## WebSocket API

### Connection

Connect to WebSocket endpoint:

```
ws://localhost:3000/ws
```

### Authentication

Send authentication message:

```json
{
  "type": "auth",
  "token": "YOUR_API_TOKEN"
}
```

### Subscribe to Updates

```json
{
  "type": "subscribe",
  "channels": ["content_updates", "system_status"]
}
```

### Real-time Messages

**New Content:**

```json
{
  "type": "content_update",
  "action": "new",
  "data": {
    "id": "uuid-string",
    "title": "New Article",
    "summary": "Article summary..."
  }
}
```

**System Status:**

```json
{
  "type": "system_status",
  "status": "updating",
  "source": "arxiv",
  "progress": 0.45
}
```

## Error Handling

### Error Response Format

All errors return consistent format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "limit",
      "reason": "must be between 1 and 100"
    },
    "request_id": "req-uuid-string",
    "timestamp": "2024-10-30T10:00:00Z"
  }
}
```

### Common Error Codes

| Code                  | HTTP Status | Description                             |
| --------------------- | ----------- | --------------------------------------- |
| `INVALID_REQUEST`     | 400         | Malformed request or invalid parameters |
| `UNAUTHORIZED`        | 401         | Invalid or missing API key              |
| `FORBIDDEN`           | 403         | Insufficient permissions                |
| `NOT_FOUND`           | 404         | Resource not found                      |
| `RATE_LIMITED`        | 429         | Too many requests                       |
| `INTERNAL_ERROR`      | 500         | Server error                            |
| `SERVICE_UNAVAILABLE` | 503         | Service temporarily unavailable         |

### Handling Errors

```javascript
try {
  const response = await fetch('/api/v1/content', {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    console.error(`Error ${error.error.code}: ${error.error.message}`);

    // Handle specific errors
    switch (error.error.code) {
      case 'RATE_LIMITED':
        // Implement exponential backoff
        break;
      case 'UNAUTHORIZED':
        // Refresh API key
        break;
    }
  }

  const data = await response.json();
} catch (error) {
  console.error('Network error:', error);
}
```

## Rate Limiting

### Rate Limits by Plan

| Plan       | Requests/Minute | Requests/Hour | Features             |
| ---------- | --------------- | ------------- | -------------------- |
| Free       | 60              | 1000          | Basic content access |
| Pro        | 300             | 10000         | Full API access      |
| Enterprise | 1000            | Unlimited     | Priority support     |

### Rate Limit Headers

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 299
X-RateLimit-Reset: 1635597600
```

### Handling Rate Limits

```javascript
const checkRateLimit = response => {
  const limit = response.headers.get('X-RateLimit-Limit');
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');

  if (remaining === '0') {
    const waitTime = reset * 1000 - Date.now();
    setTimeout(() => {
      // Retry request after wait time
    }, waitTime);
  }
};
```

## SDKs and Libraries

### JavaScript/TypeScript SDK

```bash
npm install @aifeed/api-client
```

```typescript
import { AIFEEDClient } from '@aifeed/api-client';

const client = new AIFEEDClient({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://api.aifeed.app/v1',
});

// Get content
const content = await client.getContent({
  limit: 20,
  category: ['Research', 'Machine Learning'],
});

// Search
const results = await client.search('large language models');

// Real-time updates
const ws = client.connectWebSocket();
ws.on('content_update', item => {
  console.log('New item:', item);
});
```

### Python SDK

```bash
pip install aifeed-python
```

```python
from aifeed import AIFEEDClient

client = AIFEEDClient(api_key='YOUR_API_KEY')

# Get content
content = client.get_content(limit=20, category=['Research'])

# Search
results = client.search('machine learning')

# Stream updates
for update in client.stream_updates():
    print(f"New: {update.title}")
```

### cURL Examples

```bash
# Get content
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.aifeed.app/v1/content?limit=10"

# Search
curl -H "Authorization: Bearer YOUR_API_KEY" \
     "https://api.aifeed.app/v1/search?q=ai%20research"

# Update preferences
curl -X PUT \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"appearance":{"theme":"dark"}}' \
     "https://api.aifeed.app/v1/preferences"
```

---

**Related Documentation:**

- [Configuration Guide](CONFIGURATION.md)
- [User Guide](USER_GUIDE.md)
- [Development Guide](DEVELOPMENT.md)
