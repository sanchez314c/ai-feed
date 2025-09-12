"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataService = void 0;
const electron_1 = require("electron");
const dataManager_1 = require("./dataManager");
const scheduler_1 = require("./scheduler");
const logger_1 = require("../utils/logger");
class DataService {
    constructor(config) {
        this.isRefreshing = false;
        logger_1.logger.info('🚀 Initializing AIFEED DataService...');
        // Initialize core services
        this.dataManager = new dataManager_1.DataManager(config);
        this.scheduler = new scheduler_1.DataScheduler(this.dataManager, {
            autoRefreshInterval: '0 */2 * * *', // Every 2 hours
            enabled: true
        });
        this.setupIPC();
        logger_1.logger.info('✅ DataService initialized successfully');
    }
    setupIPC() {
        // Data retrieval operations
        electron_1.ipcMain.handle('data:getItems', async (_, filters) => {
            try {
                return await this.dataManager.getItems(filters);
            }
            catch (error) {
                logger_1.logger.error('Error getting items:', error);
                return [];
            }
        });
        electron_1.ipcMain.handle('data:getItemById', async (_, id) => {
            try {
                return await this.dataManager.getItemById(id);
            }
            catch (error) {
                logger_1.logger.error('Error getting item by ID:', error);
                return null;
            }
        });
        electron_1.ipcMain.handle('data:searchItems', async (_, query, limit) => {
            try {
                return await this.dataManager.searchItems(query, limit);
            }
            catch (error) {
                logger_1.logger.error('Error searching items:', error);
                return [];
            }
        });
        electron_1.ipcMain.handle('data:getStats', async () => {
            try {
                return await this.dataManager.getStats();
            }
            catch (error) {
                logger_1.logger.error('Error getting stats:', error);
                return {
                    totalItems: 0,
                    byType: {},
                    bySource: {},
                    bookmarkedCount: 0,
                    readCount: 0,
                    lastUpdated: 'Never'
                };
            }
        });
        // Data modification operations
        electron_1.ipcMain.handle('data:updateBookmark', async (_, id, bookmarked) => {
            try {
                const success = await this.dataManager.updateBookmark(id, bookmarked);
                if (success) {
                    logger_1.logger.info(`Bookmark updated for item ${id}: ${bookmarked}`);
                }
                return success;
            }
            catch (error) {
                logger_1.logger.error('Error updating bookmark:', error);
                return false;
            }
        });
        electron_1.ipcMain.handle('data:updateReadStatus', async (_, id, isRead) => {
            try {
                const success = await this.dataManager.updateReadStatus(id, isRead);
                if (success) {
                    logger_1.logger.info(`Read status updated for item ${id}: ${isRead}`);
                }
                return success;
            }
            catch (error) {
                logger_1.logger.error('Error updating read status:', error);
                return false;
            }
        });
        // Data refresh operations
        electron_1.ipcMain.handle('data:refreshData', async () => {
            return await this.refreshData();
        });
        electron_1.ipcMain.handle('data:isRefreshing', () => {
            return this.isRefreshing;
        });
        // Scheduler operations
        electron_1.ipcMain.handle('scheduler:getStatus', () => {
            return this.scheduler.getStatus();
        });
        electron_1.ipcMain.handle('scheduler:start', () => {
            this.scheduler.start();
            return { success: true, message: 'Scheduler started' };
        });
        electron_1.ipcMain.handle('scheduler:stop', () => {
            this.scheduler.stop();
            return { success: true, message: 'Scheduler stopped' };
        });
        electron_1.ipcMain.handle('scheduler:triggerRefresh', async () => {
            return await this.scheduler.triggerRefresh();
        });
        electron_1.ipcMain.handle('scheduler:updateConfig', (_, config) => {
            this.scheduler.updateConfig(config);
            return { success: true, message: 'Scheduler configuration updated' };
        });
        // Configuration operations
        electron_1.ipcMain.handle('config:get', () => {
            return this.dataManager.getConfig();
        });
        electron_1.ipcMain.handle('config:update', (_, newConfig) => {
            this.dataManager.updateConfig(newConfig);
            return { success: true, message: 'Configuration updated' };
        });
        logger_1.logger.info('🔧 IPC handlers registered successfully');
    }
    async refreshData() {
        if (this.isRefreshing) {
            logger_1.logger.warn('Data refresh already in progress');
            return {
                success: false,
                message: 'Data refresh already in progress. Please wait for the current refresh to complete.'
            };
        }
        this.isRefreshing = true;
        logger_1.logger.info('🔄 Starting comprehensive data refresh...');
        try {
            const result = await this.dataManager.refreshData();
            if (result.success) {
                logger_1.logger.info('✅ Data refresh completed successfully:', result.message);
            }
            else {
                logger_1.logger.error('❌ Data refresh failed:', result.message);
            }
            return result;
        }
        catch (error) {
            const message = `Unexpected error during data refresh: ${error.message}`;
            logger_1.logger.error('💥 Data refresh error:', error);
            return {
                success: false,
                message
            };
        }
        finally {
            this.isRefreshing = false;
        }
    }
    // Initialize and start the scheduler
    startAutoRefresh() {
        try {
            this.scheduler.start();
            logger_1.logger.info('🕐 Automatic data refresh scheduler started');
        }
        catch (error) {
            logger_1.logger.error('Failed to start scheduler:', error);
        }
    }
    // Stop the scheduler
    stopAutoRefresh() {
        try {
            this.scheduler.stop();
            logger_1.logger.info('⏹️ Automatic data refresh scheduler stopped');
        }
        catch (error) {
            logger_1.logger.error('Failed to stop scheduler:', error);
        }
    }
    // Get current refresh status
    getRefreshStatus() {
        return {
            isRefreshing: this.isRefreshing,
            schedulerStatus: this.scheduler.getStatus(),
            lastRefresh: new Date().toISOString()
        };
    }
    // Graceful shutdown
    async shutdown() {
        try {
            logger_1.logger.info('🛑 Shutting down DataService...');
            // Stop the scheduler
            this.scheduler.stop();
            // Close the data manager
            this.dataManager.close();
            logger_1.logger.info('✅ DataService shutdown completed');
        }
        catch (error) {
            logger_1.logger.error('Error during DataService shutdown:', error);
        }
    }
    // Health check
    async healthCheck() {
        try {
            // Check if we can get stats (database connectivity)
            const stats = await this.dataManager.getStats();
            // Check scheduler status
            const schedulerStatus = this.scheduler.getStatus();
            const services = {
                database: stats.totalItems >= 0, // Simple check
                scheduler: schedulerStatus.running,
                dataManager: true // If we got here, it's working
            };
            const allHealthy = Object.values(services).every(status => status);
            return {
                status: allHealthy ? 'healthy' : 'warning',
                services,
                message: allHealthy
                    ? 'All services are running normally'
                    : 'Some services may have issues'
            };
        }
        catch (error) {
            logger_1.logger.error('Health check failed:', error);
            return {
                status: 'error',
                services: { database: false, scheduler: false, dataManager: false },
                message: `Health check failed: ${error.message}`
            };
        }
    }
    // Get service for direct access (if needed)
    getDataManager() {
        return this.dataManager;
    }
    getScheduler() {
        return this.scheduler;
    }
}
exports.DataService = DataService;
