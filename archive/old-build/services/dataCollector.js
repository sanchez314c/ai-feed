"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataCollector = void 0;
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = require("xml2js");
const cheerio = __importStar(require("cheerio"));
const logger_1 = require("../utils/logger");
const helpers_1 = require("../utils/helpers");
class DataCollector {
    constructor(config) {
        this.config = config || this.getDefaultConfig();
        this.newsApiKey = process.env.NEWS_API_KEY;
        this.youtubeApiKey = process.env.YOUTUBE_API_KEY;
        // Create HTTP client with retry configuration
        this.httpClient = axios_1.default.create({
            timeout: 30000,
            headers: {
                'User-Agent': 'AIFEED-Desktop/1.0.0 (AI Research Aggregator)'
            }
        });
        // Add retry interceptor
        this.httpClient.interceptors.response.use((response) => response, async (error) => {
            const config = error.config;
            if (!config || !config.retry)
                config.retry = 0;
            if (config.retry < 3 && (error.response?.status >= 500 || error.code === 'ECONNRESET')) {
                config.retry++;
                const delay = 1000 * Math.pow(2, config.retry); // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, delay));
                logger_1.logger.info(`Retrying request (attempt ${config.retry + 1})`);
                return this.httpClient.request(config);
            }
            return Promise.reject(error);
        });
    }
    getDefaultConfig() {
        return {
            sources: {
                arxiv: {
                    enabled: true,
                    categories: ['cs.AI', 'cs.CL', 'cs.CV', 'cs.LG', 'cs.NE'],
                    max_results: 50
                },
                news: {
                    enabled: true,
                    keywords: [
                        'artificial intelligence',
                        'machine learning',
                        'deep learning',
                        'neural networks',
                        'AI breakthrough',
                        'ChatGPT',
                        'GPT',
                        'LLM',
                        'large language model',
                        'transformer',
                        'computer vision',
                        'natural language processing'
                    ],
                    max_results: 30
                },
                youtube: {
                    enabled: true,
                    channels: [
                        'UCBFYP1bFUiGkLr6WMz7Kq7g', // Two Minute Papers
                        'UCtYLUTtgS3k1Fg4y5tAhLbw', // StatQuest with Josh Starmer
                        'UCbfYPNUaVP1-8IcFjrP4yEw', // The AI Guy
                        'UCkxxQ7pxaIQm0IB2kwsXKmA', // AI Explained
                    ],
                    keywords: [
                        'artificial intelligence',
                        'machine learning',
                        'deep learning',
                        'AI',
                        'neural network',
                        'transformer',
                        'GPT',
                        'computer vision',
                        'NLP'
                    ],
                    max_results: 20
                },
                company_blogs: {
                    enabled: true,
                    feeds: [
                        { name: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
                        { name: 'Anthropic Blog', url: 'https://www.anthropic.com/news/rss.xml' },
                        { name: 'Google AI Blog', url: 'https://ai.googleblog.com/feeds/posts/default' },
                        { name: 'Meta AI Blog', url: 'https://ai.meta.com/blog/rss/' },
                        { name: 'DeepMind Blog', url: 'https://deepmind.google/discover/blog/rss.xml' }
                    ],
                    max_results: 25
                }
            }
        };
    }
    async collectAllData() {
        logger_1.logger.info('🔄 Starting comprehensive data collection...');
        const data = {
            timestamp: (0, helpers_1.getTimestamp)(),
            arxiv_papers: [],
            news_articles: [],
            youtube_videos: [],
            blog_posts: []
        };
        const promises = [];
        // Collect from all enabled sources in parallel
        if (this.config.sources?.arxiv?.enabled) {
            promises.push(this.collectArxivPapers().then(papers => {
                data.arxiv_papers = papers;
                logger_1.logger.info(`✅ Collected ${papers.length} arXiv papers`);
            }).catch(err => {
                logger_1.logger.error('❌ Failed to collect arXiv papers:', err);
            }));
        }
        if (this.config.sources?.news?.enabled && this.newsApiKey && this.newsApiKey !== 'disabled') {
            promises.push(this.collectNewsArticles().then(articles => {
                data.news_articles = articles;
                logger_1.logger.info(`✅ Collected ${articles.length} news articles`);
            }).catch(err => {
                logger_1.logger.error('❌ Failed to collect news articles:', err);
            }));
        }
        if (this.config.sources?.youtube?.enabled && this.youtubeApiKey) {
            promises.push(this.collectYouTubeVideos().then(videos => {
                data.youtube_videos = videos;
                logger_1.logger.info(`✅ Collected ${videos.length} YouTube videos`);
            }).catch(err => {
                logger_1.logger.error('❌ Failed to collect YouTube videos:', err);
            }));
        }
        if (this.config.sources?.company_blogs?.enabled) {
            promises.push(this.collectCompanyBlogs().then(posts => {
                data.blog_posts = posts;
                logger_1.logger.info(`✅ Collected ${posts.length} blog posts`);
            }).catch(err => {
                logger_1.logger.error('❌ Failed to collect blog posts:', err);
            }));
        }
        try {
            await Promise.all(promises);
            const total = data.arxiv_papers.length + data.news_articles.length +
                data.youtube_videos.length + data.blog_posts.length;
            logger_1.logger.info(`🎉 Data collection completed! Total: ${total} items`);
        }
        catch (error) {
            logger_1.logger.error('❌ Error in data collection:', error);
        }
        return data;
    }
    async fetchFullArticleText(url) {
        try {
            const response = await this.httpClient.get(url);
            const $ = cheerio.load(response.data);
            // Remove unwanted elements
            $('script, style, nav, footer, header, aside').remove();
            // Try to find main content
            const articleSelectors = [
                'article',
                '.post-content',
                '.entry-content',
                '.article-body',
                '.content',
                'main'
            ];
            let content = '';
            for (const selector of articleSelectors) {
                const element = $(selector).first();
                if (element.length > 0) {
                    content = element.text();
                    break;
                }
            }
            if (!content) {
                content = $('body').text();
            }
            const cleanedText = content.replace(/\s+/g, ' ').trim();
            return (0, helpers_1.truncateText)(cleanedText, 5000);
        }
        catch (error) {
            logger_1.logger.warn(`Could not fetch full article from ${url}:`, error);
            return null;
        }
    }
    async collectArxivPapers() {
        try {
            logger_1.logger.info('📄 Collecting arXiv papers...');
            const categories = this.config.sources.arxiv.categories;
            const maxResults = this.config.sources.arxiv.max_results || 50;
            // Create query string for categories
            const query = categories.map((cat) => `cat:${cat}`).join(' OR ');
            // arXiv API URL with proper parameters
            const params = {
                search_query: query,
                start: 0,
                max_results: maxResults,
                sortBy: 'submittedDate',
                sortOrder: 'descending'
            };
            const response = await this.httpClient.get('http://export.arxiv.org/api/query', {
                params,
                timeout: 45000
            });
            const result = await (0, xml2js_1.parseStringPromise)(response.data);
            const papers = [];
            const entries = result.feed?.entry || [];
            for (const entry of entries) {
                try {
                    // Extract authors
                    const authorList = entry.author || [];
                    const authors = Array.isArray(authorList)
                        ? authorList.map((a) => a.name?.[0] || '').filter(Boolean).join(', ')
                        : (authorList.name?.[0] || '');
                    // Extract categories
                    const categoryList = entry.category || [];
                    const categories = Array.isArray(categoryList)
                        ? categoryList.map((cat) => cat.$.term).filter(Boolean)
                        : [categoryList?.$.term].filter(Boolean);
                    // Extract arXiv ID
                    const entryId = entry.id?.[0] || '';
                    const arxivId = entryId.split('/').pop()?.split('v')[0] || '';
                    if (!arxivId || !entry.title?.[0]) {
                        continue;
                    }
                    const paper = {
                        id: `arxiv-${arxivId}`,
                        title: entry.title[0].replace(/\s+/g, ' ').trim(),
                        authors,
                        abstract: entry.summary?.[0]?.replace(/\s+/g, ' ').trim() || '',
                        url: entry.link?.find((l) => l.$.title === 'pdf')?.$.href || entryId,
                        published: new Date(entry.published?.[0] || Date.now()).toISOString(),
                        categories,
                        source: 'arXiv',
                        type: 'paper',
                        thumbnail: undefined
                    };
                    papers.push(paper);
                }
                catch (entryError) {
                    logger_1.logger.warn('Error processing arXiv entry:', entryError);
                }
            }
            return papers;
        }
        catch (error) {
            logger_1.logger.error('Error collecting arXiv papers:', error);
            return [];
        }
    }
    async collectNewsArticles() {
        try {
            if (!this.newsApiKey || this.newsApiKey === 'disabled') {
                logger_1.logger.info('News API disabled - skipping news collection');
                return [];
            }
            logger_1.logger.info('📰 Collecting news articles...');
            const keywords = this.config.sources.news.keywords;
            const maxResults = this.config.sources.news.max_results || 30;
            // Create query string
            const query = keywords.map((kw) => `"${kw}"`).join(' OR ');
            // Get date for timeframe (last 2 days)
            const fromDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const response = await this.httpClient.get('https://newsapi.org/v2/everything', {
                params: {
                    q: query,
                    from: fromDate,
                    sortBy: 'publishedAt',
                    language: 'en',
                    pageSize: maxResults,
                    apiKey: this.newsApiKey
                },
                timeout: 30000
            });
            const articles = [];
            const responseArticles = response.data.articles || [];
            for (const article of responseArticles) {
                try {
                    if (!article.title || !article.url) {
                        continue;
                    }
                    const description = article.description || '';
                    const cleanDescription = (0, helpers_1.cleanHtml)(description);
                    const fullText = await this.fetchFullArticleText(article.url);
                    const newsArticle = {
                        id: (0, helpers_1.generateId)('news', article.url),
                        title: article.title.trim(),
                        description: (0, helpers_1.truncateText)(cleanDescription, 300),
                        url: article.url,
                        source: article.source?.name || 'Unknown',
                        published: article.publishedAt || new Date().toISOString(),
                        author: article.author || undefined,
                        thumbnail: article.urlToImage || undefined,
                        type: 'news'
                    };
                    if (fullText) {
                        newsArticle.full_text_content = fullText;
                    }
                    articles.push(newsArticle);
                }
                catch (articleError) {
                    logger_1.logger.warn('Error processing news article:', articleError);
                }
            }
            return articles;
        }
        catch (error) {
            if (error.response?.status === 429) {
                logger_1.logger.error('News API rate limit exceeded');
            }
            else {
                logger_1.logger.error('Error collecting news articles:', error);
            }
            return [];
        }
    }
    async collectYouTubeVideos() {
        try {
            if (!this.youtubeApiKey) {
                logger_1.logger.info('YouTube API key not provided - skipping YouTube collection');
                return [];
            }
            logger_1.logger.info('🎥 Collecting YouTube videos...');
            const channels = this.config.sources.youtube.channels;
            const keywords = this.config.sources.youtube.keywords;
            const maxResults = this.config.sources.youtube.max_results || 20;
            const videos = [];
            const resultsPerChannel = Math.max(1, Math.floor(maxResults / channels.length));
            for (const channelId of channels) {
                try {
                    // Search for videos from the specific channel
                    const searchResponse = await this.httpClient.get('https://www.googleapis.com/youtube/v3/search', {
                        params: {
                            part: 'snippet',
                            channelId,
                            maxResults: resultsPerChannel * 2, // Get extra to filter
                            order: 'date',
                            type: 'video',
                            key: this.youtubeApiKey
                        },
                        timeout: 20000
                    });
                    const videoItems = searchResponse.data.items || [];
                    // Filter videos by keywords
                    const relevantVideos = videoItems.filter((item) => {
                        const title = item.snippet.title.toLowerCase();
                        const description = item.snippet.description.toLowerCase();
                        return keywords.some((keyword) => title.includes(keyword.toLowerCase()) ||
                            description.includes(keyword.toLowerCase()));
                    }).slice(0, resultsPerChannel);
                    if (relevantVideos.length > 0) {
                        const videoIds = relevantVideos.map((item) => item.id.videoId);
                        // Get detailed video information
                        const detailsResponse = await this.httpClient.get('https://www.googleapis.com/youtube/v3/videos', {
                            params: {
                                part: 'snippet,contentDetails,statistics',
                                id: videoIds.join(','),
                                key: this.youtubeApiKey
                            },
                            timeout: 20000
                        });
                        const videoDetails = detailsResponse.data.items || [];
                        const detailsMap = new Map(videoDetails.map((v) => [v.id, v]));
                        for (const item of relevantVideos) {
                            try {
                                const videoId = item.id.videoId;
                                const details = detailsMap.get(videoId);
                                const video = {
                                    id: `youtube-${videoId}`,
                                    title: item.snippet.title.trim(),
                                    description: (0, helpers_1.truncateText)(item.snippet.description, 500),
                                    url: `https://www.youtube.com/watch?v=${videoId}`,
                                    thumbnail: item.snippet.thumbnails?.high?.url ||
                                        item.snippet.thumbnails?.medium?.url ||
                                        item.snippet.thumbnails?.default?.url || undefined,
                                    channel: item.snippet.channelTitle,
                                    published: item.snippet.publishedAt,
                                    source: 'YouTube',
                                    type: 'video'
                                };
                                if (details) {
                                    const contentDetails = details.contentDetails || {};
                                    const statistics = details.statistics || {};
                                    video.duration = contentDetails.duration || '';
                                    video.view_count = parseInt(statistics.viewCount || '0');
                                    video.like_count = parseInt(statistics.likeCount || '0');
                                }
                                videos.push(video);
                            }
                            catch (videoError) {
                                logger_1.logger.warn('Error processing YouTube video:', videoError);
                            }
                        }
                    }
                }
                catch (channelError) {
                    logger_1.logger.error(`Error collecting videos from channel ${channelId}:`, channelError);
                }
            }
            return videos;
        }
        catch (error) {
            logger_1.logger.error('Error collecting YouTube videos:', error);
            return [];
        }
    }
    async collectCompanyBlogs() {
        try {
            logger_1.logger.info('📝 Collecting company blog posts...');
            const feeds = this.config.sources.company_blogs.feeds;
            const maxResults = this.config.sources.company_blogs.max_results || 25;
            const resultsPerFeed = Math.max(1, Math.floor(maxResults / feeds.length));
            const blogPosts = [];
            for (const feed of feeds) {
                try {
                    logger_1.logger.debug(`Fetching RSS feed: ${feed.name}`);
                    const response = await this.httpClient.get(feed.url, {
                        timeout: 30000,
                        headers: {
                            'Accept': 'application/rss+xml, application/xml, text/xml'
                        }
                    });
                    const result = await (0, xml2js_1.parseStringPromise)(response.data);
                    // Handle different RSS/Atom formats
                    let entries = result.rss?.channel?.[0]?.item || // RSS 2.0
                        result.feed?.entry || // Atom
                        result['rdf:RDF']?.item || // RSS 1.0
                        [];
                    entries = entries.slice(0, resultsPerFeed);
                    for (const entry of entries) {
                        try {
                            // Extract title
                            const title = entry.title?.[0]?._ || entry.title?.[0] || entry.title || '';
                            // Extract description/content
                            let description = entry.description?.[0] ||
                                entry.summary?.[0]?._ ||
                                entry.summary?.[0] ||
                                entry.content?.[0]?._ ||
                                entry.content?.[0] ||
                                '';
                            // Clean HTML if present
                            if (description && (description.includes('<') && description.includes('>'))) {
                                description = (0, helpers_1.cleanHtml)(description);
                            }
                            // Extract URL
                            const url = entry.link?.[0]?.$ ? entry.link[0].$.href :
                                (entry.link?.[0] ||
                                    entry.guid?.[0]?._ ||
                                    entry.guid?.[0] || '');
                            if (!title || !url) {
                                continue;
                            }
                            // Extract publication date
                            const published = entry.pubDate?.[0] ||
                                entry.published?.[0] ||
                                entry['dc:date']?.[0] ||
                                new Date().toISOString();
                            const fullText = await this.fetchFullArticleText(url);
                            const post = {
                                id: (0, helpers_1.generateId)('blog', url),
                                title: title.replace(/\s+/g, ' ').trim(),
                                description: (0, helpers_1.truncateText)(description, 300),
                                url,
                                published,
                                source: feed.name,
                                type: 'blog',
                                thumbnail: undefined
                            };
                            if (fullText) {
                                post.full_text_content = fullText;
                            }
                            // Try to extract thumbnail
                            if (entry.content || entry['content:encoded']) {
                                const content = entry.content?.[0]?._ ||
                                    entry.content?.[0] ||
                                    entry['content:encoded']?.[0] || '';
                                if (content) {
                                    const $ = cheerio.load(content);
                                    const img = $('img').first();
                                    if (img.length > 0) {
                                        post.thumbnail = img.attr('src') || undefined;
                                    }
                                }
                            }
                            blogPosts.push(post);
                        }
                        catch (entryError) {
                            logger_1.logger.warn(`Error processing blog entry from ${feed.name}:`, entryError);
                        }
                    }
                }
                catch (feedError) {
                    logger_1.logger.error(`Error collecting from feed ${feed.name}:`, feedError);
                }
            }
            return blogPosts;
        }
        catch (error) {
            logger_1.logger.error('Error collecting blog posts:', error);
            return [];
        }
    }
}
exports.DataCollector = DataCollector;
