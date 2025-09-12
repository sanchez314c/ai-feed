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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const sqlite3 = __importStar(require("sqlite3"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const electron_1 = require("electron");
class DatabaseService {
    constructor() {
        // Get app data directory
        const appDataPath = electron_1.app ? electron_1.app.getPath('userData') : path.join(process.cwd(), 'data');
        // Ensure data directory exists
        if (!fs.existsSync(appDataPath)) {
            fs.mkdirSync(appDataPath, { recursive: true });
        }
        this.dbPath = path.join(appDataPath, 'aifeed.db');
        console.log(`📁 Database path: ${this.dbPath}`);
        // Initialize database
        this.db = new sqlite3.Database(this.dbPath);
        this.initializeDatabase();
    }
    async initializeDatabase() {
        console.log('🏗️  Initializing database schema...');
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Enable WAL mode for better performance
                this.db.run("PRAGMA journal_mode = WAL");
                // Create items table
                this.db.run(`
          CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            url TEXT UNIQUE NOT NULL,
            source TEXT NOT NULL,
            source_type TEXT NOT NULL,
            content_type TEXT NOT NULL,
            description TEXT,
            summary TEXT,
            authors TEXT,
            published TEXT NOT NULL,
            thumbnail TEXT,
            categories TEXT DEFAULT '[]',
            keywords TEXT DEFAULT '[]',
            importance_score INTEGER DEFAULT 5,
            channel TEXT,
            bookmarked INTEGER DEFAULT 0,
            is_read INTEGER DEFAULT 0,
            processed_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_fetched_at TEXT DEFAULT CURRENT_TIMESTAMP,
            raw_data TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
                // Create source_metadata table
                this.db.run(`
          CREATE TABLE IF NOT EXISTS source_metadata (
            source_id TEXT PRIMARY KEY,
            last_fetch_time TEXT NOT NULL,
            last_item_id TEXT,
            status TEXT DEFAULT 'active',
            error_count INTEGER DEFAULT 0,
            last_error TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
                // Create indexes for better query performance
                this.db.run("CREATE INDEX IF NOT EXISTS idx_items_content_type ON items(content_type)");
                this.db.run("CREATE INDEX IF NOT EXISTS idx_items_source ON items(source)");
                this.db.run("CREATE INDEX IF NOT EXISTS idx_items_published ON items(published)");
                this.db.run("CREATE INDEX IF NOT EXISTS idx_items_bookmarked ON items(bookmarked)");
                this.db.run("CREATE INDEX IF NOT EXISTS idx_items_is_read ON items(is_read)");
                this.db.run("CREATE INDEX IF NOT EXISTS idx_items_importance ON items(importance_score)", (err) => {
                    if (err) {
                        console.error('Database initialization error:', err);
                        reject(err);
                    }
                    else {
                        console.log('✅ Database initialized successfully');
                        resolve();
                    }
                });
            });
        });
    }
    // Insert or update content items
    async insertOrUpdateItems(items) {
        console.log(`💾 Saving ${items.length} items to database...`);
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO items (
          id, title, url, source, source_type, content_type, description, summary, authors,
          published, thumbnail, categories, keywords, importance_score, channel,
          bookmarked, is_read, processed_at, last_fetched_at, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
            let inserted = 0;
            let completed = 0;
            this.db.serialize(() => {
                this.db.run("BEGIN TRANSACTION");
                for (const item of items) {
                    stmt.run([
                        item.id,
                        item.title,
                        item.url,
                        item.source,
                        item.source_type || item.source,
                        item.content_type,
                        item.description,
                        item.summary,
                        item.authors,
                        item.published,
                        item.thumbnail,
                        JSON.stringify(item.categories || []),
                        JSON.stringify(item.keywords || []),
                        item.importance_score || 5,
                        item.channel,
                        item.bookmarked ? 1 : 0,
                        item.is_read ? 1 : 0,
                        item.processed_at || new Date().toISOString(),
                        item.last_fetched_at || new Date().toISOString(),
                        item.raw_data ? JSON.stringify(item.raw_data) : null
                    ], function (err) {
                        if (err) {
                            console.error(`Failed to insert item ${item.id}:`, err);
                        }
                        else {
                            inserted++;
                        }
                        completed++;
                        if (completed === items.length) {
                            stmt.finalize();
                            console.log(`✅ Successfully saved ${inserted} items`);
                            resolve(inserted);
                        }
                    });
                }
                this.db.run("COMMIT");
            });
        });
    }
    // Get all items with filtering
    async getItems(filters = {}) {
        return new Promise((resolve, reject) => {
            let query = `SELECT * FROM items WHERE 1=1`;
            const params = [];
            if (filters.type) {
                query += ` AND content_type = ?`;
                params.push(filters.type);
            }
            if (filters.source) {
                query += ` AND source = ?`;
                params.push(filters.source);
            }
            if (filters.bookmarked !== undefined) {
                query += ` AND bookmarked = ?`;
                params.push(filters.bookmarked ? 1 : 0);
            }
            if (filters.isRead !== undefined) {
                query += ` AND is_read = ?`;
                params.push(filters.isRead ? 1 : 0);
            }
            if (filters.search) {
                query += ` AND (title LIKE ? OR description LIKE ? OR summary LIKE ?)`;
                const searchTerm = `%${filters.search}%`;
                params.push(searchTerm, searchTerm, searchTerm);
            }
            query += ` ORDER BY published DESC`;
            if (filters.limit) {
                query += ` LIMIT ?`;
                params.push(filters.limit);
                if (filters.offset) {
                    query += ` OFFSET ?`;
                    params.push(filters.offset);
                }
            }
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const items = rows.map(row => ({
                    ...row,
                    categories: JSON.parse(row.categories || '[]'),
                    keywords: JSON.parse(row.keywords || '[]'),
                    bookmarked: !!row.bookmarked,
                    is_read: !!row.is_read,
                    raw_data: row.raw_data ? JSON.parse(row.raw_data) : undefined
                }));
                resolve(items);
            });
        });
    }
    // Get a single item by ID
    async getItemById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM items WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve(null);
                    return;
                }
                resolve({
                    ...row,
                    categories: JSON.parse(row.categories || '[]'),
                    keywords: JSON.parse(row.keywords || '[]'),
                    bookmarked: !!row.bookmarked,
                    is_read: !!row.is_read,
                    raw_data: row.raw_data ? JSON.parse(row.raw_data) : undefined
                });
            });
        });
    }
    // Update bookmark status
    async updateBookmark(id, bookmarked) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE items SET bookmarked = ? WHERE id = ?', [bookmarked ? 1 : 0, id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes > 0);
            });
        });
    }
    // Update read status
    async updateReadStatus(id, isRead) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE items SET is_read = ? WHERE id = ?', [isRead ? 1 : 0, id], function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(this.changes > 0);
            });
        });
    }
    // Search items
    async searchItems(query, limit = 50) {
        return new Promise((resolve, reject) => {
            const searchTerm = `%${query}%`;
            this.db.all(`
        SELECT * FROM items 
        WHERE title LIKE ? OR description LIKE ? OR summary LIKE ? OR authors LIKE ?
        ORDER BY importance_score DESC, published DESC
        LIMIT ?
      `, [searchTerm, searchTerm, searchTerm, searchTerm, limit], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const items = rows.map(row => ({
                    ...row,
                    categories: JSON.parse(row.categories || '[]'),
                    keywords: JSON.parse(row.keywords || '[]'),
                    bookmarked: !!row.bookmarked,
                    is_read: !!row.is_read,
                    raw_data: row.raw_data ? JSON.parse(row.raw_data) : undefined
                }));
                resolve(items);
            });
        });
    }
    // Get database statistics
    async getStats() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                let stats = {
                    byType: {},
                    bySource: {},
                    totalItems: 0,
                    bookmarkedCount: 0,
                    readCount: 0,
                    lastUpdated: 'Never'
                };
                // Total items
                this.db.get('SELECT COUNT(*) as count FROM items', (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    stats.totalItems = result.count;
                });
                // By type
                this.db.all('SELECT content_type, COUNT(*) as count FROM items GROUP BY content_type', (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    stats.byType = rows.reduce((acc, row) => {
                        acc[row.content_type] = row.count;
                        return acc;
                    }, {});
                });
                // By source
                this.db.all('SELECT source, COUNT(*) as count FROM items GROUP BY source', (err, rows) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    stats.bySource = rows.reduce((acc, row) => {
                        acc[row.source] = row.count;
                        return acc;
                    }, {});
                });
                // Bookmarked count
                this.db.get('SELECT COUNT(*) as count FROM items WHERE bookmarked = 1', (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    stats.bookmarkedCount = result.count;
                });
                // Read count
                this.db.get('SELECT COUNT(*) as count FROM items WHERE is_read = 1', (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    stats.readCount = result.count;
                });
                // Last updated
                this.db.get('SELECT MAX(processed_at) as last_updated FROM items', (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    stats.lastUpdated = result.last_updated || 'Never';
                    resolve(stats);
                });
            });
        });
    }
    // Update source metadata
    async updateSourceMetadata(sourceId, lastFetchTime, lastItemId) {
        return new Promise((resolve, reject) => {
            this.db.run(`
        INSERT OR REPLACE INTO source_metadata (source_id, last_fetch_time, last_item_id, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `, [sourceId, lastFetchTime, lastItemId], (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    // Get source metadata
    async getSourceMetadata(sourceId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM source_metadata WHERE source_id = ?', [sourceId], (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve(null);
                    return;
                }
                resolve({
                    lastFetchTime: row.last_fetch_time,
                    lastItemId: row.last_item_id
                });
            });
        });
    }
    // Close database connection
    close() {
        this.db.close();
    }
}
exports.DatabaseService = DatabaseService;
