"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataManager = void 0;
const dataCollector_1 = require("./dataCollector");
const claudeProcessor_1 = require("./claudeProcessor");
const database_1 = require("./database");
const logger_1 = require("../utils/logger");
const helpers_1 = require("../utils/helpers");
class DataManager {
    constructor(config) {
        this.config = config || this.getDefaultConfig();
        this.collector = new dataCollector_1.DataCollector(this.config);
        this.processor = new claudeProcessor_1.ClaudeProcessor();
        this.database = new database_1.DatabaseService();
        logger_1.logger.info('🚀 DataManager initialized');
    }
    getDefaultConfig() {
        return {
            sources: {
                arxiv: { enabled: true, categories: ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG', 'cs.NE'], max_results: 50 },
                news: { enabled: true, keywords: ['AI', 'machine learning', 'deep learning'], max_results: 30 },
                youtube: { enabled: true, channels: ['UCBFYP1bFUiGkLr6WMz7Kq7g'], max_results: 20 },
                company_blogs: { enabled: true, feeds: [], max_results: 25 }
            }
        };
    }
    async refreshData() {
        try {
            logger_1.logger.info('🔄 Starting comprehensive data refresh...');
            const startTime = Date.now();
            // Step 1: Collect raw data from all sources
            logger_1.logger.info('📥 Collecting data from all sources...');
            const rawData = await this.collector.collectAllData();
            const totalCollected = rawData.arxiv_papers.length +
                rawData.news_articles.length +
                rawData.youtube_videos.length +
                rawData.blog_posts.length;
            if (totalCollected === 0) {
                return {
                    success: false,
                    message: 'No new data collected from any sources'
                };
            }
            logger_1.logger.info(`📊 Collected ${totalCollected} items total`);
            // Step 2: Process all items with Claude AI
            const allItems = [
                ...rawData.arxiv_papers,
                ...rawData.news_articles,
                ...rawData.youtube_videos,
                ...rawData.blog_posts
            ];
            logger_1.logger.info('🤖 Processing items with AI analysis...');
            const processedItems = await this.processor.batchProcess(allItems);
            // Step 3: Convert to database format and save
            logger_1.logger.info('💾 Saving processed items to database...');
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
                        blogs: rawData.blog_posts.length
                    }
                }
            };
            logger_1.logger.info('✅ Data refresh completed successfully!', result.stats);
            return result;
        }
        catch (error) {
            logger_1.logger.error('❌ Data refresh failed:', error);
            return {
                success: false,
                message: `Data refresh failed: ${error.message}`
            };
        }
    }
    convertToDbItem(item) {
        const dbItem = {
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
            channel: item.channel || undefined,
            bookmarked: false,
            is_read: false,
            processed_at: (0, helpers_1.getTimestamp)()
        };
        return dbItem;
    }
    async updateSourceMetadata(data) {
        try {
            const timestamp = (0, helpers_1.getTimestamp)();
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
        }
        catch (error) {
            logger_1.logger.warn('Failed to update source metadata:', error);
        }
    }
    async getItems(options = {}) {
        try {
            return await this.database.getItems(options);
        }
        catch (error) {
            logger_1.logger.error('Failed to get items:', error);
            return [];
        }
    }
    async getStats() {
        try {
            return await this.database.getStats();
        }
        catch (error) {
            logger_1.logger.error('Failed to get stats:', error);
            return {
                totalItems: 0,
                byType: {},
                bySource: {},
                bookmarkedCount: 0,
                readCount: 0,
                lastUpdated: 'Never'
            };
        }
    }
    async updateBookmark(itemId, bookmarked) {
        try {
            return await this.database.updateBookmark(itemId, bookmarked);
        }
        catch (error) {
            logger_1.logger.error('Failed to update bookmark:', error);
            return false;
        }
    }
    async updateReadStatus(itemId, isRead) {
        try {
            return await this.database.updateReadStatus(itemId, isRead);
        }
        catch (error) {
            logger_1.logger.error('Failed to update read status:', error);
            return false;
        }
    }
    async searchItems(query, limit = 50) {
        try {
            return await this.database.searchItems(query, limit);
        }
        catch (error) {
            logger_1.logger.error('Failed to search items:', error);
            return [];
        }
    }
    async getItemById(id) {
        try {
            return await this.database.getItemById(id);
        }
        catch (error) {
            logger_1.logger.error('Failed to get item by ID:', error);
            return null;
        }
    }
    // Configuration management
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.collector = new dataCollector_1.DataCollector(this.config);
        logger_1.logger.info('Configuration updated');
    }
    getConfig() {
        return this.config;
    }
    // Cleanup
    close() {
        this.database.close();
        logger_1.logger.info('DataManager closed');
    }
}
exports.DataManager = DataManager;
