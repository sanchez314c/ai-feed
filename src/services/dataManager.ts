import { DataCollector } from './dataCollector';
import { ClaudeProcessor } from './claudeProcessor';
import { DatabaseService } from './database';
import { logger } from '../utils/logger';
import { getTimestamp } from '../utils/helpers';
import { DataCollectionResult, DatabaseContentItem, DatabaseStats } from '../types';

export class DataManager {
  private collector: DataCollector;
  private processor: ClaudeProcessor;
  private database: DatabaseService;
  private config: any;

  constructor(config?: any) {
    this.config = config || this.getDefaultConfig();
    this.collector = new DataCollector(this.config);
    this.processor = new ClaudeProcessor();
    this.database = new DatabaseService();

    logger.info('🚀 DataManager initialized');
  }

  private getDefaultConfig() {
    return {
      sources: {
        arxiv: {
          enabled: true,
          categories: ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG', 'cs.NE'],
          max_results: 50,
        },
        news: {
          enabled: true,
          keywords: ['AI', 'machine learning', 'deep learning'],
          max_results: 30,
        },
        youtube: {
          enabled: true,
          channels: ['UCBFYP1bFUiGkLr6WMz7Kq7g'],
          max_results: 20,
        },
        company_blogs: { enabled: true, feeds: [], max_results: 25 },
      },
    };
  }

  async refreshData(): Promise<{
    success: boolean;
    message: string;
    stats?: any;
  }> {
    try {
      logger.info('🔄 Starting comprehensive data refresh...');
      const startTime = Date.now();

      // Step 1: Collect raw data from all sources
      logger.info('📥 Collecting data from all sources...');
      const rawData = await this.collector.collectAllData();

      const totalCollected =
        rawData.arxiv_papers.length +
        rawData.news_articles.length +
        rawData.youtube_videos.length +
        rawData.blog_posts.length;

      if (totalCollected === 0) {
        return {
          success: false,
          message: 'No new data collected from any sources',
        };
      }

      logger.info(`📊 Collected ${totalCollected} items total`);

      // Step 2: Process all items with Claude AI
      const allItems = [
        ...rawData.arxiv_papers,
        ...rawData.news_articles,
        ...rawData.youtube_videos,
        ...rawData.blog_posts,
      ];

      logger.info('🤖 Processing items with AI analysis...');
      const processedItems = await this.processor.batchProcess(allItems);

      // Step 3: Convert to database format and save
      logger.info('💾 Saving processed items to database...');
      const dbItems = processedItems.map(item => this.convertToDbItem(item));
      const savedCount = await this.database.insertOrUpdateItems(dbItems);

      // Step 4: Update source metadata
      await this.updateSourceMetadata(rawData);

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);

      const result = {
        success: true,
        message: `Successfully refreshed ${savedCount} items in ${duration}s`,
        stats: {
          collected: totalCollected,
          processed: processedItems.length,
          saved: savedCount,
          duration: duration,
          sources: {
            arxiv: rawData.arxiv_papers.length,
            news: rawData.news_articles.length,
            youtube: rawData.youtube_videos.length,
            blogs: rawData.blog_posts.length,
          },
        },
      };

      logger.info('✅ Data refresh completed successfully!', result.stats);
      return result;
    } catch (error) {
      logger.error('❌ Data refresh failed:', error);
      return {
        success: false,
        message: `Data refresh failed: ${(error as Error).message}`,
      };
    }
  }

  private convertToDbItem(item: any): Partial<DatabaseContentItem> {
    const dbItem: Partial<DatabaseContentItem> = {
      id: item.id,
      title: item.title,
      url: item.url,
      source: item.source,
      content_type: item.type,
      description: item.description || item.abstract || '',
      summary: item.summary || '',
      authors: item.authors || item.author || '',
      published: item.published,
      thumbnail: item.thumbnail || undefined,
      categories: item.categories || [],
      keywords: item.keywords || [],
      importance_score: item.importance_score || 5,
      channel: (item as any).channel || undefined,
      bookmarked: false,
      is_read: false,
      processed_at: getTimestamp(),
    };

    return dbItem;
  }

  private async updateSourceMetadata(data: DataCollectionResult): Promise<void> {
    try {
      const timestamp = getTimestamp();

      // Update arXiv metadata
      if (data.arxiv_papers.length > 0) {
        const lastArxivId = data.arxiv_papers[0].id;
        await this.database.updateSourceMetadata('arxiv', timestamp, lastArxivId);
      }

      // Update news metadata
      if (data.news_articles.length > 0) {
        const lastNewsId = data.news_articles[0].id;
        await this.database.updateSourceMetadata('news', timestamp, lastNewsId);
      }

      // Update YouTube metadata
      if (data.youtube_videos.length > 0) {
        const lastVideoId = data.youtube_videos[0].id;
        await this.database.updateSourceMetadata('youtube', timestamp, lastVideoId);
      }

      // Update blog metadata
      if (data.blog_posts.length > 0) {
        const lastBlogId = data.blog_posts[0].id;
        await this.database.updateSourceMetadata('blogs', timestamp, lastBlogId);
      }
    } catch (error) {
      logger.warn('Failed to update source metadata:', error);
    }
  }

  async getItems(
    options: {
      limit?: number;
      offset?: number;
      type?: string;
      source?: string;
      bookmarked?: boolean;
      search?: string;
    } = {}
  ): Promise<DatabaseContentItem[]> {
    try {
      return await this.database.getItems(options);
    } catch (error) {
      logger.error('Failed to get items:', error);
      return [];
    }
  }

  async getStats(): Promise<DatabaseStats> {
    try {
      return await this.database.getStats();
    } catch (error) {
      logger.error('Failed to get stats:', error);
      return {
        totalItems: 0,
        byType: {},
        bySource: {},
        bookmarkedCount: 0,
        readCount: 0,
        lastUpdated: 'Never',
      };
    }
  }

  async updateBookmark(itemId: string, bookmarked: boolean): Promise<boolean> {
    try {
      return await this.database.updateBookmark(itemId, bookmarked);
    } catch (error) {
      logger.error('Failed to update bookmark:', error);
      return false;
    }
  }

  async updateReadStatus(itemId: string, isRead: boolean): Promise<boolean> {
    try {
      return await this.database.updateReadStatus(itemId, isRead);
    } catch (error) {
      logger.error('Failed to update read status:', error);
      return false;
    }
  }

  async searchItems(query: string, limit = 50): Promise<DatabaseContentItem[]> {
    try {
      return await this.database.searchItems(query, limit);
    } catch (error) {
      logger.error('Failed to search items:', error);
      return [];
    }
  }

  async getItemById(id: string): Promise<DatabaseContentItem | null> {
    try {
      return await this.database.getItemById(id);
    } catch (error) {
      logger.error('Failed to get item by ID:', error);
      return null;
    }
  }

  // Configuration management
  updateConfig(newConfig: any): void {
    this.config = { ...this.config, ...newConfig };
    this.collector = new DataCollector(this.config);
    logger.info('Configuration updated');
  }

  getConfig(): any {
    return this.config;
  }

  // Cleanup
  close(): void {
    this.database.close();
    logger.info('DataManager closed');
  }
}
