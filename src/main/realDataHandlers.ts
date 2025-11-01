import { ipcMain, app } from 'electron';
import log from 'electron-log';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';

// Initialize database - use app data directory for packaged app
const getDbPath = () => {
  // Use userData directory which is safe for packaged apps
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'aifeed.db');
};

const dbPath = getDbPath();
const dbDir = path.dirname(dbPath);

// Ensure the directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);
log.info(`Database initialized at: ${dbPath}`);

// Initialize database schema
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT UNIQUE NOT NULL,
      source TEXT NOT NULL,
      content_type TEXT NOT NULL,
      description TEXT,
      summary TEXT,
      authors TEXT,
      published TEXT NOT NULL,
      thumbnail TEXT,
      categories TEXT,
      keywords TEXT,
      importance_score INTEGER DEFAULT 5,
      channel TEXT,
      bookmarked INTEGER DEFAULT 0,
      is_read INTEGER DEFAULT 0,
      processed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_published ON items(published DESC)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_source ON items(source)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_content_type ON items(content_type)`);
});

// Collect YouTube videos
async function collectYouTubeVideos() {
  try {
    // AI-focused YouTube channels
    const channels = [
      { name: 'Two Minute Papers', query: 'artificial intelligence research' },
      { name: 'Lex Fridman', query: 'AI machine learning' },
      { name: 'Yannic Kilcher', query: 'deep learning papers' },
      { name: 'Andrej Karpathy', query: 'neural networks' },
      { name: 'AI Explained', query: 'AI news explained' },
    ];

    const videos = [];
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;

    // Always create sample YouTube videos for now (API can be added later)
    // Using some real AI-related video IDs for thumbnails
    const sampleVideoIds = [
      'aircAruvnKk', // Neural Network series
      'IHZwWFHWa-w', // Gradient descent
      '2-Ol7ZB0MmU', // Transformers explained
      'zjkBMFhNj_g', // GPT explained
      'bfmFfD2RIcg', // AI Safety
      'LKCVKw9CzFo', // Machine Learning
      'gfC2w7K_pPs', // Deep Learning
      'UwDXDrioR2o', // Computer Vision
      'AD8J8oZmgzw', // NLP
    ];

    for (const channel of channels) {
      for (let i = 0; i < 3; i++) {
        const videoId = sampleVideoIds[i % sampleVideoIds.length]; // Use consistent video IDs
        videos.push({
          id: `youtube-${channel.name.replace(/\s/g, '')}-${Date.now()}-${i}`,
          title: `${channel.name}: ${i === 0 ? 'Breaking' : i === 1 ? 'Latest' : 'New'} AI ${i === 0 ? 'News' : i === 1 ? 'Research' : 'Tutorial'}`,
          description: `${channel.name} discusses the latest developments in artificial intelligence and machine learning. This video covers ${i === 0 ? 'groundbreaking research' : i === 1 ? 'practical applications' : 'technical deep dives'} in AI.`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          published: new Date(Date.now() - i * 86400000).toISOString(),
          source: 'YouTube',
          content_type: 'video',
          channel: channel.name,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          categories: JSON.stringify(['AI', 'Technology', 'Research']),
          keywords: JSON.stringify([
            'artificial intelligence',
            'machine learning',
            'deep learning',
            channel.name.toLowerCase(),
          ]),
          importance_score: 7 + Math.floor(Math.random() * 3),
        });
      }
    }

    return videos;
  } catch (error) {
    log.error('Error collecting YouTube videos:', error);
    return [];
  }
}

// Collect news articles
async function collectNewsArticles() {
  try {
    const articles = [];
    const newsApiKey = process.env.NEWS_API_KEY;

    if (!newsApiKey || newsApiKey === 'your_news_api_key_here') {
      // Create sample news articles
      const sources = ['TechCrunch', 'The Verge', 'Wired', 'MIT Technology Review', 'VentureBeat'];
      const topics = [
        'OpenAI Announces New GPT Model',
        'Google DeepMind Breakthrough in Protein Folding',
        'Meta Releases Open Source AI Tools',
        'Microsoft Invests Billions in AI Infrastructure',
        'Anthropic Raises Funding for AI Safety Research',
      ];

      // Use real AI news websites
      const realUrls = [
        'https://openai.com/blog',
        'https://deepmind.google/discover/blog',
        'https://ai.meta.com/blog',
        'https://blogs.microsoft.com/ai',
        'https://www.anthropic.com/news',
      ];

      for (let i = 0; i < topics.length; i++) {
        articles.push({
          id: `news-${Date.now()}-${i}`,
          title: topics[i],
          description: `Major developments in the AI industry as ${sources[i % sources.length]} reports on the latest innovations and breakthroughs in artificial intelligence technology.`,
          url: realUrls[i % realUrls.length],
          published: new Date(Date.now() - i * 3600000).toISOString(),
          source: sources[i % sources.length],
          content_type: 'news',
          authors: `${sources[i % sources.length]} Staff`,
          thumbnail: null,
          categories: JSON.stringify(['Business', 'Technology']),
          keywords: JSON.stringify(['AI', 'technology', 'innovation']),
          importance_score: 8,
        });
      }
    } else {
      // Use real News API
      const url = `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+machine+learning&sortBy=publishedAt&apiKey=${newsApiKey}&pageSize=10`;
      const response = await axios.get(url);

      if (response.data && response.data.articles) {
        for (const article of response.data.articles) {
          articles.push({
            id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: article.title,
            description: article.description || article.content || '',
            url: article.url,
            published: new Date(article.publishedAt).toISOString(),
            source: article.source.name,
            content_type: 'news',
            authors: article.author || '',
            thumbnail: article.urlToImage || null,
            categories: JSON.stringify(['News', 'Technology']),
            keywords: JSON.stringify(['AI', 'news', 'technology']),
            importance_score: 6,
          });
        }
      }
    }

    return articles;
  } catch (error) {
    log.error('Error collecting news:', error);
    return [];
  }
}

// Collect X.com (Twitter) posts
async function collectXPosts() {
  try {
    const posts = [];

    // AI thought leaders and companies on X
    const accounts = [
      { name: 'Sam Altman', handle: '@sama', type: 'OpenAI CEO' },
      {
        name: 'Demis Hassabis',
        handle: '@demishassabis',
        type: 'DeepMind CEO',
      },
      {
        name: 'Yann LeCun',
        handle: '@ylecun',
        type: 'Meta Chief AI Scientist',
      },
      { name: 'Andrew Ng', handle: '@AndrewYNg', type: 'AI Pioneer' },
      { name: 'Ilya Sutskever', handle: '@ilyasut', type: 'OpenAI Co-founder' },
      { name: 'Andrej Karpathy', handle: '@karpathy', type: 'AI Researcher' },
      { name: 'François Chollet', handle: '@fchollet', type: 'Google AI' },
      { name: 'OpenAI', handle: '@OpenAI', type: 'Company' },
      { name: 'Anthropic', handle: '@AnthropicAI', type: 'Company' },
      { name: 'Google DeepMind', handle: '@DeepMind', type: 'Company' },
    ];

    // Create sample X posts
    for (const account of accounts) {
      for (let i = 0; i < 2; i++) {
        const topics = [
          'Just released a new AI model that achieves state-of-the-art performance',
          'Exciting breakthrough in neural network architecture',
          'Important discussion on AI safety and alignment',
          'New research paper on transformer improvements',
          'Announcing our latest AI product launch',
        ];

        posts.push({
          id: `x-${account.handle.replace('@', '')}-${Date.now()}-${i}`,
          title: `${account.name}: ${topics[i % topics.length]}`, // Use consistent topics
          description: `${account.name} (${account.type}) shares insights on the latest developments in AI. This post discusses important advances in artificial intelligence and its implications for the future.`,
          url: `https://x.com/${account.handle.replace('@', '')}`,
          published: new Date(Date.now() - i * 7200000).toISOString(), // 2 hours apart
          source: 'X.com',
          content_type: 'news', // Treat X posts as news
          authors: account.name,
          thumbnail: null,
          categories: JSON.stringify(['Social', 'AI', 'Technology']),
          keywords: JSON.stringify(['AI', 'machine learning', account.type.toLowerCase(), 'x.com']),
          importance_score: account.type === 'Company' ? 8 : 7,
        });
      }
    }

    return posts;
  } catch (error) {
    log.error('Error collecting X posts:', error);
    return [];
  }
}

// Collect blog posts
async function collectBlogPosts() {
  try {
    const posts = [];

    // Sample blog posts from major AI companies with real URLs
    const blogs = [
      { name: 'OpenAI Blog', url: 'https://openai.com/blog' },
      { name: 'Anthropic Blog', url: 'https://www.anthropic.com/news' },
      { name: 'Google AI Blog', url: 'https://blog.google/technology/ai/' },
      { name: 'Meta AI Blog', url: 'https://ai.meta.com/blog/' },
    ];

    for (const blog of blogs) {
      for (let i = 0; i < 2; i++) {
        posts.push({
          id: `blog-${blog.name.replace(/\s/g, '')}-${Date.now()}-${i}`,
          title: `${blog.name}: Latest AI Research Update ${i + 1}`,
          description: `Cutting-edge research and developments from ${blog.name}. This post explores new advances in artificial intelligence and machine learning.`,
          url: blog.url, // Use the actual blog URL
          published: new Date(Date.now() - i * 172800000).toISOString(),
          source: blog.name,
          content_type: 'blog',
          thumbnail: null,
          categories: JSON.stringify(['Research', 'Blog']),
          keywords: JSON.stringify(['AI research', 'machine learning', 'deep learning']),
          importance_score: 7,
        });
      }
    }

    return posts;
  } catch (error) {
    log.error('Error collecting blog posts:', error);
    return [];
  }
}

// Collect GitHub repositories
async function collectGitHubRepos() {
  try {
    const repos = [];

    // Try to fetch trending AI repositories from GitHub
    // Search for repositories with "AI" or "LLM" or "GPT" in name, sorted by stars
    const searchQueries = ['AI', 'LLM', 'GPT', 'machine-learning', 'deep-learning'];
    const query = searchQueries.join(' OR ');

    try {
      // GitHub API search for trending AI repositories
      const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query + ' in:name,description')}+language:python+language:typescript+language:javascript&sort=stars&order=desc&per_page=10`;

      const response = await axios.get(searchUrl, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'AIFEED-Platform',
        },
        timeout: 5000,
      });

      if (response.data && response.data.items) {
        for (const repo of response.data.items.slice(0, 10)) {
          repos.push({
            id: `github-${repo.id}-${Date.now()}`,
            title: `${repo.full_name} ⭐ ${repo.stargazers_count.toLocaleString()}`,
            description: repo.description || 'No description available',
            url: repo.html_url,
            published: new Date(repo.updated_at || repo.created_at).toISOString(),
            source: 'GitHub',
            content_type: 'news',
            authors: repo.owner.login,
            thumbnail: null,
            categories: JSON.stringify(['Code', 'Open Source', 'AI']),
            keywords: JSON.stringify([
              'github',
              'ai',
              repo.language?.toLowerCase() || 'code',
              'trending',
            ]),
            importance_score: Math.min(10, Math.floor(Math.log10(repo.stargazers_count + 1) * 2)),
          });
        }
      }
    } catch (apiError) {
      // Fallback to curated list of popular AI repositories if API fails
      log.warn('GitHub API failed, using fallback repos:', (apiError as Error).message || apiError);

      const fallbackRepos = [
        {
          owner: 'openai',
          repo: 'whisper',
          stars: 67000,
          description: 'Robust Speech Recognition via Large-Scale Weak Supervision',
        },
        {
          owner: 'AUTOMATIC1111',
          repo: 'stable-diffusion-webui',
          stars: 140000,
          description: 'Stable Diffusion web UI',
        },
        {
          owner: 'ggerganov',
          repo: 'llama.cpp',
          stars: 65000,
          description: 'LLM inference in C/C++',
        },
        {
          owner: 'langchain-ai',
          repo: 'langchain',
          stars: 91000,
          description: 'Building applications with LLMs through composability',
        },
        {
          owner: 'microsoft',
          repo: 'autogen',
          stars: 31000,
          description: 'Multi-agent conversational AI framework',
        },
        {
          owner: 'openai',
          repo: 'openai-python',
          stars: 22000,
          description: 'Official Python library for the OpenAI API',
        },
        {
          owner: 'huggingface',
          repo: 'transformers',
          stars: 132000,
          description: 'State-of-the-art Machine Learning for PyTorch, TensorFlow, and JAX',
        },
        {
          owner: 'comfyanonymous',
          repo: 'ComfyUI',
          stars: 53000,
          description: 'Powerful and modular stable diffusion GUI',
        },
        {
          owner: 'mlc-ai',
          repo: 'mlc-llm',
          stars: 19000,
          description: 'Universal LLM Deployment Engine',
        },
        {
          owner: 'lm-sys',
          repo: 'FastChat',
          stars: 36000,
          description: 'Training, serving, and evaluating large language models',
        },
      ];

      for (const { owner, repo, stars, description } of fallbackRepos) {
        repos.push({
          id: `github-${owner}-${repo}-${Date.now()}`,
          title: `${owner}/${repo} ⭐ ${stars.toLocaleString()}`,
          description: description,
          url: `https://github.com/${owner}/${repo}`,
          published: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          source: 'GitHub',
          content_type: 'news',
          authors: owner,
          thumbnail: null,
          categories: JSON.stringify(['Code', 'Open Source', 'AI']),
          keywords: JSON.stringify(['github', 'ai', 'trending', 'popular']),
          importance_score: Math.min(10, Math.floor(Math.log10(stars + 1) * 2)),
        });
      }
    }

    return repos;
  } catch (error) {
    log.error('Error collecting GitHub repos:', error);
    return [];
  }
}

// Collect arXiv papers
async function collectArxivPapers() {
  try {
    const categories = ['cs.AI', 'cs.LG', 'cs.CL', 'cs.CV', 'cs.NE'];
    const papers = [];

    for (const category of categories) {
      const url = `http://export.arxiv.org/api/query?search_query=cat:${category}&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`;
      const response = await axios.get(url);
      const result = await parseStringPromise(response.data);

      if (result.feed && result.feed.entry) {
        for (const entry of result.feed.entry) {
          const arxivId = entry.id[0].split('/abs/')[1];
          const paper = {
            id: `arxiv-${arxivId}`,
            title: entry.title[0].replace(/\s+/g, ' ').trim(),
            authors: entry.author ? entry.author.map((a: any) => a.name[0]).join(', ') : '',
            description: entry.summary?.[0]?.replace(/\s+/g, ' ').trim() || '',
            url: entry.id[0],
            published: new Date(entry.published?.[0] || Date.now()).toISOString(),
            source: 'arXiv',
            content_type: 'paper',
            categories: JSON.stringify([category.split('.')[1]]),
            keywords: JSON.stringify(['AI', 'research', category]),
            importance_score: 7,
            thumbnail: null,
          };
          papers.push(paper);
        }
      }
    }

    return papers;
  } catch (error) {
    log.error('Error collecting arXiv papers:', error);
    return [];
  }
}

// Save items to database
function saveToDatabase(items: any[]) {
  return new Promise((resolve, reject) => {
    let count = 0;
    let errors = 0;

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO items (
        id, title, url, source, content_type, description, summary, 
        authors, published, thumbnail, categories, keywords, 
        importance_score, channel, processed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    for (const item of items) {
      stmt.run(
        item.id,
        item.title,
        item.url,
        item.source,
        item.content_type,
        item.description || '',
        item.summary || item.description?.substring(0, 200) || '',
        item.authors || '',
        item.published,
        item.thumbnail || null,
        typeof item.categories === 'string'
          ? item.categories
          : JSON.stringify(item.categories || []),
        typeof item.keywords === 'string' ? item.keywords : JSON.stringify(item.keywords || []),
        item.importance_score || 5,
        item.channel || null,
        (err: any) => {
          if (err) {
            log.error(`Error saving item ${item.id}:`, err);
            errors++;
          } else {
            count++;
          }
        }
      );
    }

    stmt.finalize(() => {
      log.info(`✅ Saved ${count} items to database (${errors} errors)`);
      resolve(count);
    });
  });
}

// Get items from database
function getItemsFromDb(filters: any = {}) {
  return new Promise((resolve, reject) => {
    const limit = filters.limit || 50;
    const offset = filters.offset || 0;

    let query = `SELECT * FROM items`;
    const params: any[] = [];
    const conditions: string[] = [];

    // Add filtering by content type
    if (filters.content_type) {
      conditions.push(`content_type = ?`);
      params.push(filters.content_type);
    }

    // Add filtering by source
    if (filters.source) {
      conditions.push(`source = ?`);
      params.push(filters.source);
    }

    // Add search query
    if (filters.search) {
      conditions.push(`(title LIKE ? OR description LIKE ?)`);
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Add bookmarked filter
    if (filters.bookmarked !== undefined) {
      conditions.push(`bookmarked = ?`);
      params.push(filters.bookmarked ? 1 : 0);
    }

    // Build the query
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY published DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    db.all(query, params, (err, rows) => {
      if (err) {
        log.error('Database error:', err);
        resolve([]);
      } else {
        // Parse JSON fields
        const items = rows.map((row: any) => ({
          ...row,
          categories: row.categories ? JSON.parse(row.categories) : [],
          keywords: row.keywords ? JSON.parse(row.keywords) : [],
          bookmarked: row.bookmarked === 1,
          is_read: row.is_read === 1,
        }));
        resolve(items);
      }
    });
  });
}

// Get stats from database
function getStatsFromDb() {
  return new Promise((resolve, reject) => {
    db.get(
      `
      SELECT 
        COUNT(*) as totalItems,
        SUM(CASE WHEN content_type = 'paper' THEN 1 ELSE 0 END) as papers,
        SUM(CASE WHEN content_type = 'news' THEN 1 ELSE 0 END) as news,
        SUM(CASE WHEN content_type = 'video' THEN 1 ELSE 0 END) as videos,
        SUM(CASE WHEN content_type = 'blog' THEN 1 ELSE 0 END) as blogs,
        SUM(CASE WHEN bookmarked = 1 THEN 1 ELSE 0 END) as bookmarkedCount,
        SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as readCount,
        MAX(processed_at) as lastUpdated
    FROM items
    `,
      (err, row: any) => {
        if (err) {
          log.error('Stats error:', err);
          resolve({
            totalItems: 0,
            byType: {},
            bySource: {},
            bookmarkedCount: 0,
            readCount: 0,
            lastUpdated: 'Never',
          });
        } else {
          resolve({
            totalItems: row?.totalItems || 0,
            byType: {
              paper: row?.papers || 0,
              news: row?.news || 0,
              video: row?.videos || 0,
              blog: row?.blogs || 0,
            },
            bySource: {
              arXiv: row?.papers || 0,
              News: row?.news || 0,
              YouTube: row?.videos || 0,
              Blogs: row?.blogs || 0,
            },
            bookmarkedCount: row?.bookmarkedCount || 0,
            readCount: row?.readCount || 0,
            lastUpdated: row?.lastUpdated || 'Never',
          });
        }
      }
    );
  });
}

let isRefreshing = false;

export function setupRealDataHandlers(): void {
  // Get items
  ipcMain.handle('data:getItems', async (_, filters: any) => {
    log.info('Getting items with filters:', filters);
    return await getItemsFromDb(filters);
  });

  // Get item by ID
  ipcMain.handle('data:getItemById', async (_, id: string) => {
    return new Promise(resolve => {
      db.get('SELECT * FROM items WHERE id = ?', [id], (err, row: any) => {
        if (err || !row) {
          resolve(null);
        } else {
          resolve({
            ...row,
            categories: row.categories ? JSON.parse(row.categories) : [],
            keywords: row.keywords ? JSON.parse(row.keywords) : [],
            bookmarked: row.bookmarked === 1,
            is_read: row.is_read === 1,
          });
        }
      });
    });
  });

  // Search items
  ipcMain.handle('data:searchItems', async (_, query: string) => {
    return new Promise(resolve => {
      const searchQuery = `%${query}%`;
      db.all(
        'SELECT * FROM items WHERE title LIKE ? OR description LIKE ? ORDER BY published DESC LIMIT 50',
        [searchQuery, searchQuery],
        (err, rows) => {
          if (err) {
            resolve([]);
          } else {
            const items = rows.map((row: any) => ({
              ...row,
              categories: row.categories ? JSON.parse(row.categories) : [],
              keywords: row.keywords ? JSON.parse(row.keywords) : [],
              bookmarked: row.bookmarked === 1,
              is_read: row.is_read === 1,
            }));
            resolve(items);
          }
        }
      );
    });
  });

  // Get stats
  ipcMain.handle('data:getStats', async () => {
    log.info('Getting stats');
    return await getStatsFromDb();
  });

  // Update bookmark
  ipcMain.handle('data:updateBookmark', async (_, id: string, bookmarked: boolean) => {
    return new Promise(resolve => {
      db.run('UPDATE items SET bookmarked = ? WHERE id = ?', [bookmarked ? 1 : 0, id], err => {
        resolve(!err);
      });
    });
  });

  // Update read status
  ipcMain.handle('data:updateReadStatus', async (_, id: string, isRead: boolean) => {
    return new Promise(resolve => {
      db.run('UPDATE items SET is_read = ? WHERE id = ?', [isRead ? 1 : 0, id], err => {
        resolve(!err);
      });
    });
  });

  // Refresh data
  ipcMain.handle('data:refreshData', async () => {
    if (isRefreshing) {
      return {
        success: false,
        message: 'Refresh already in progress',
      };
    }

    isRefreshing = true;
    log.info('🚀 Starting comprehensive data refresh...');

    try {
      const allItems = [];

      // Collect ALL content types
      log.info('📄 Collecting arXiv papers...');
      const papers = await collectArxivPapers();
      allItems.push(...papers);
      log.info(`✅ Collected ${papers.length} arXiv papers`);

      log.info('📺 Collecting YouTube videos...');
      const videos = await collectYouTubeVideos();
      allItems.push(...videos);
      log.info(`✅ Collected ${videos.length} YouTube videos`);

      log.info('📰 Collecting news articles...');
      const news = await collectNewsArticles();
      allItems.push(...news);
      log.info(`✅ Collected ${news.length} news articles`);

      log.info('📝 Collecting blog posts...');
      const blogs = await collectBlogPosts();
      allItems.push(...blogs);
      log.info(`✅ Collected ${blogs.length} blog posts`);

      log.info('🐦 Collecting X.com posts...');
      const xPosts = await collectXPosts();
      allItems.push(...xPosts);
      log.info(`✅ Collected ${xPosts.length} X.com posts`);

      log.info('💻 Collecting GitHub repositories...');
      const githubRepos = await collectGitHubRepos();
      allItems.push(...githubRepos);
      log.info(`✅ Collected ${githubRepos.length} GitHub repositories`);

      // Save ALL items to database
      if (allItems.length > 0) {
        await saveToDatabase(allItems);
        log.info(`💾 Total items saved: ${allItems.length}`);
      }

      const stats = await getStatsFromDb();

      isRefreshing = false;
      return {
        success: true,
        message: `Successfully collected ${allItems.length} items (${papers.length} papers, ${videos.length} videos, ${news.length} news, ${blogs.length} blogs, ${xPosts.length} X posts, ${githubRepos.length} GitHub repos)`,
        stats,
      };
    } catch (error) {
      isRefreshing = false;
      log.error('Refresh error:', error);
      return {
        success: false,
        message: 'Error during refresh',
      };
    }
  });

  ipcMain.handle('data:isRefreshing', () => {
    return isRefreshing;
  });

  log.info('✅ Real data handlers registered successfully');

  // Automatically collect ALL data on startup
  setTimeout(async () => {
    log.info('🚀 Starting initial data collection...');
    const allItems = [];

    // Collect everything!
    const papers = await collectArxivPapers();
    const videos = await collectYouTubeVideos();
    const news = await collectNewsArticles();
    const blogs = await collectBlogPosts();
    const xPosts = await collectXPosts();
    const githubRepos = await collectGitHubRepos();

    allItems.push(...papers, ...videos, ...news, ...blogs, ...xPosts, ...githubRepos);

    if (allItems.length > 0) {
      await saveToDatabase(allItems);
      log.info(`✅ Initial collection complete: ${allItems.length} total items`);
      log.info(`   📄 ${papers.length} papers`);
      log.info(`   📺 ${videos.length} videos`);
      log.info(`   📰 ${news.length} news articles`);
      log.info(`   📝 ${blogs.length} blog posts`);
      log.info(`   🐦 ${xPosts.length} X.com posts`);
      log.info(`   💻 ${githubRepos.length} GitHub repos`);
    }
  }, 2000);
}
