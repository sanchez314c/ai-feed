"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupDataHandlers = setupDataHandlers;
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
function setupDataHandlers() {
    // Mock data handlers for now to get the UI working
    electron_1.ipcMain.handle('data:getItems', async (_, filters) => {
        electron_log_1.default.info('Mock getItems called with filters:', filters);
        // Return empty array for now
        return [];
    });
    electron_1.ipcMain.handle('data:getItemById', async (_, id) => {
        electron_log_1.default.info('Mock getItemById called with id:', id);
        return null;
    });
    electron_1.ipcMain.handle('data:searchItems', async (_, query) => {
        electron_log_1.default.info('Mock searchItems called with query:', query);
        return [];
    });
    electron_1.ipcMain.handle('data:getStats', async () => {
        electron_log_1.default.info('Mock getStats called');
        return {
            totalItems: 0,
            byType: {
                paper: 0,
                news: 0,
                video: 0,
                blog: 0
            },
            bySource: {
                'arXiv': 0,
                'News': 0,
                'YouTube': 0,
                'Blogs': 0
            },
            bookmarkedCount: 0,
            readCount: 0,
            lastUpdated: new Date().toISOString()
        };
    });
    electron_1.ipcMain.handle('data:updateBookmark', async (_, id, bookmarked) => {
        electron_log_1.default.info(`Mock updateBookmark called: ${id} -> ${bookmarked}`);
        return true;
    });
    electron_1.ipcMain.handle('data:updateReadStatus', async (_, id, isRead) => {
        electron_log_1.default.info(`Mock updateReadStatus called: ${id} -> ${isRead}`);
        return true;
    });
    electron_1.ipcMain.handle('data:refreshData', async () => {
        electron_log_1.default.info('Mock refreshData called');
        return {
            success: true,
            message: 'Mock refresh completed',
            stats: {
                papers: 0,
                news: 0,
                videos: 0,
                blogs: 0
            }
        };
    });
    electron_1.ipcMain.handle('data:isRefreshing', () => {
        return false;
    });
    electron_log_1.default.info('✅ Data handlers registered successfully');
}
