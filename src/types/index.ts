// Core data types for AIFEED application
export interface ContentItem {
  id: string;
  title: string;
  url: string;
  source: DataSource;
  type: ContentType;
  authors?: string[];
  publishedAt: Date;
  collectedAt: Date;
  updatedAt: Date;
  
  // Content analysis
  summary?: string;
  abstract?: string;
  categories: string[];
  keywords: string[];
  importance: number; // 1-10 scale
  sentiment?: 'positive' | 'negative' | 'neutral';
  
  // User interactions
  bookmarked: boolean;
  read: boolean;
  annotations: Annotation[];
  
  // Metadata
  metadata: Record<string, any>;
  thumbnail?: string;
  readingTime?: number; // in minutes
}

export interface DataSource {
  id: string;
  name: string;
  type: SourceType;
  enabled: boolean;
  config?: Record<string, any>;
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error';
}

export interface Annotation {
  id: string;
  userId: string;
  itemId: string;
  type: 'highlight' | 'note' | 'bookmark';
  content: string;
  selection?: TextSelection;
  createdAt: Date;
  updatedAt: Date;
}

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  teams: string[];
  role: UserRole;
  createdAt: Date;
  lastActive: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
  sources: Record<string, boolean>;
  categories: string[];
}

export interface NotificationSettings {
  email: boolean;
  desktop: boolean;
  mobile: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  keywords: string[];
}

export interface DashboardSettings {
  layout: 'grid' | 'list' | 'timeline';
  density: 'comfortable' | 'compact';
  itemsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  userId: string;
  items: string[]; // ContentItem IDs
  tags: string[];
  isPublic: boolean;
  collaborators: string[]; // User IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchQuery {
  query: string;
  filters: SearchFilters;
  sort: SortOptions;
  pagination: PaginationOptions;
}

export interface SearchFilters {
  sources?: string[];
  types?: ContentType[];
  categories?: string[];
  dateRange?: DateRange;
  importance?: [number, number]; // min, max
  authors?: string[];
  keywords?: string[];
  read?: boolean;
  bookmarked?: boolean;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface SortOptions {
  field: 'publishedAt' | 'collectedAt' | 'importance' | 'title' | 'relevance';
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface SearchResults {
  items: ContentItem[];
  total: number;
  page: number;
  totalPages: number;
  facets: SearchFacets;
  suggestions: string[];
  took: number; // search time in ms
}

export interface SearchFacets {
  sources: FacetCount[];
  types: FacetCount[];
  categories: FacetCount[];
  authors: FacetCount[];
}

export interface FacetCount {
  value: string;
  count: number;
}

// Type definitions
export type ContentType = 'paper' | 'news' | 'video' | 'blog' | 'podcast' | 'repository' | 'tweet';

export type SourceType = 'arxiv' | 'news' | 'youtube' | 'rss' | 'github' | 'twitter' | 'pubmed' | 'semantic-scholar';

export type UserRole = 'user' | 'admin' | 'moderator';

// UI State types
export interface AppState {
  user: User | null;
  theme: 'light' | 'dark' | 'auto';
  sidebarOpen: boolean;
  loading: boolean;
  error: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actions?: NotificationAction[];
  duration?: number;
  persistent?: boolean;
  createdAt: Date;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'text' | 'contained' | 'outlined';
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// WebSocket types
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
}

export interface SubscriptionParams {
  sources?: string[];
  categories?: string[];
  keywords?: string[];
  importance?: [number, number];
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  userId?: string;
  timestamp: Date;
}

export interface TrendData {
  topic: string;
  count: number;
  change: number; // percentage change
  timeframe: 'hour' | 'day' | 'week' | 'month';
}

export interface ReadingStats {
  totalRead: number;
  readingTime: number; // in minutes
  favoriteCategories: string[];
  readingStreak: number; // in days
  weeklyGoal: number;
  weeklyProgress: number;
}

// Data Collection Types
export interface ArxivPaper {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  url: string;
  published: string;
  categories: string[];
  source: string;
  type: 'paper';
  thumbnail?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  published: string;
  author?: string;
  thumbnail?: string;
  type: 'news';
  full_text_content?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  channel: string;
  published: string;
  source: string;
  type: 'video';
  duration?: string;
  view_count?: number;
  like_count?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  url: string;
  published: string;
  source: string;
  type: 'blog';
  thumbnail?: string;
  full_text_content?: string;
}

export interface DataCollectionResult {
  timestamp: string;
  arxiv_papers: ArxivPaper[];
  news_articles: NewsArticle[];
  youtube_videos: YouTubeVideo[];
  blog_posts: BlogPost[];
}

export interface DatabaseContentItem {
  id: string;
  title: string;
  url: string;
  source: string;
  content_type: 'paper' | 'news' | 'blog' | 'video';
  description?: string;
  summary?: string;
  authors?: string;
  published: string;
  thumbnail?: string;
  categories: string[];
  keywords: string[];
  importance_score: number;
  channel?: string;
  bookmarked: boolean;
  is_read: boolean;
  processed_at: string;
}

export interface DatabaseStats {
  totalItems: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  bookmarkedCount: number;
  readCount: number;
  lastUpdated: string;
}