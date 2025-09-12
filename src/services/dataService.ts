import { ipcMain } from 'electron';
import { DataManager } from './dataManager';
import { DataScheduler } from './scheduler';
import { logger } from '../utils/logger';

export class DataService {
  private dataManager: DataManager;
  private scheduler: DataScheduler;
  private isRefreshing = false;

  constructor(config?: any) {
    logger.info('🚀 Initializing AIFEED DataService...');
    
    // Initialize core services
    this.dataManager = new DataManager(config);
    this.scheduler = new DataScheduler(this.dataManager, {
      autoRefreshInterval: '0 */2 * * *', // Every 2 hours
      enabled: true
    });
    
    this.setupIPC();
    logger.info('✅ DataService initialized successfully');
  }

  private setupIPC(): void {
    // Data retrieval operations
    ipcMain.handle('data:getItems', async (_, filters: any) => {
      try {
        return await this.dataManager.getItems(filters);
      } catch (error) {
        logger.error('Error getting items:', error);
        return [];
      }
    });

    ipcMain.handle('data:getItemById', async (_, id: string) => {
      try {
        return await this.dataManager.getItemById(id);
      } catch (error) {
        logger.error('Error getting item by ID:', error);
        return null;
      }
    });

    ipcMain.handle('data:searchItems', async (_, query: string, limit?: number) => {
      try {
        return await this.dataManager.searchItems(query, limit);
      } catch (error) {
        logger.error('Error searching items:', error);
        return [];
      }
    });

    ipcMain.handle('data:getStats', async () => {
      try {
        return await this.dataManager.getStats();
      } catch (error) {
        logger.error('Error getting stats:', error);
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
    ipcMain.handle('data:updateBookmark', async (_, id: string, bookmarked: boolean) => {
      try {
        const success = await this.dataManager.updateBookmark(id, bookmarked);
        if (success) {
          logger.info(`Bookmark updated for item ${id}: ${bookmarked}`);
        }
        return success;
      } catch (error) {
        logger.error('Error updating bookmark:', error);
        return false;
      }
    });

    ipcMain.handle('data:updateReadStatus', async (_, id: string, isRead: boolean) => {
      try {
        const success = await this.dataManager.updateReadStatus(id, isRead);
        if (success) {
          logger.info(`Read status updated for item ${id}: ${isRead}`);
        }
        return success;
      } catch (error) {
        logger.error('Error updating read status:', error);
        return false;
      }
    });

    // Data refresh operations
    ipcMain.handle('data:refreshData', async () => {
      return await this.refreshData();
    });

    ipcMain.handle('data:isRefreshing', () => {
      return this.isRefreshing;
    });

    // Scheduler operations
    ipcMain.handle('scheduler:getStatus', () => {
      return this.scheduler.getStatus();
    });

    ipcMain.handle('scheduler:start', () => {
      this.scheduler.start();
      return { success: true, message: 'Scheduler started' };
    });

    ipcMain.handle('scheduler:stop', () => {
      this.scheduler.stop();
      return { success: true, message: 'Scheduler stopped' };
    });

    ipcMain.handle('scheduler:triggerRefresh', async () => {
      return await this.scheduler.triggerRefresh();
    });

    ipcMain.handle('scheduler:updateConfig', (_, config) => {
      this.scheduler.updateConfig(config);
      return { success: true, message: 'Scheduler configuration updated' };
    });

    // Configuration operations
    ipcMain.handle('config:get', () => {
      return this.dataManager.getConfig();
    });

    ipcMain.handle('config:update', (_, newConfig) => {
      this.dataManager.updateConfig(newConfig);
      return { success: true, message: 'Configuration updated' };
    });

    logger.info('🔧 IPC handlers registered successfully');
  }

  async refreshData(): Promise<{ success: boolean; message: string; stats?: any }> {
    if (this.isRefreshing) {
      logger.warn('Data refresh already in progress');
      return { 
        success: false, 
        message: 'Data refresh already in progress. Please wait for the current refresh to complete.' 
      };
    }

    this.isRefreshing = true;
    logger.info('🔄 Starting comprehensive data refresh...');

    try {
      const result = await this.dataManager.refreshData();
      
      if (result.success) {
        logger.info('✅ Data refresh completed successfully:', result.message);
      } else {
        logger.error('❌ Data refresh failed:', result.message);
      }

      return result;
    } catch (error) {
      const message = `Unexpected error during data refresh: ${(error as Error).message}`;
      logger.error('💥 Data refresh error:', error);
      return { 
        success: false, 
        message
      };
    } finally {
      this.isRefreshing = false;
    }
  }

  // Initialize and start the scheduler
  startAutoRefresh(): void {
    try {
      this.scheduler.start();
      logger.info('🕐 Automatic data refresh scheduler started');
    } catch (error) {
      logger.error('Failed to start scheduler:', error);
    }
  }

  // Stop the scheduler
  stopAutoRefresh(): void {
    try {
      this.scheduler.stop();
      logger.info('⏹️ Automatic data refresh scheduler stopped');
    } catch (error) {
      logger.error('Failed to stop scheduler:', error);
    }
  }

  // Get current refresh status
  getRefreshStatus(): {
    isRefreshing: boolean;
    schedulerStatus: any;
    lastRefresh?: string;
  } {
    return {
      isRefreshing: this.isRefreshing,
      schedulerStatus: this.scheduler.getStatus(),
      lastRefresh: new Date().toISOString()
    };
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    try {
      logger.info('🛑 Shutting down DataService...');
      
      // Stop the scheduler
      this.scheduler.stop();
      
      // Close the data manager
      this.dataManager.close();
      
      logger.info('✅ DataService shutdown completed');
    } catch (error) {
      logger.error('Error during DataService shutdown:', error);
    }
  }

  // Health check
  async healthCheck(): Promise<{ 
    status: 'healthy' | 'warning' | 'error';
    services: Record<string, boolean>;
    message: string;
  }> {
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
    } catch (error) {
      logger.error('Health check failed:', error);
      return {
        status: 'error',
        services: { database: false, scheduler: false, dataManager: false },
        message: `Health check failed: ${(error as Error).message}`
      };
    }
  }

  // Get service for direct access (if needed)
  getDataManager(): DataManager {
    return this.dataManager;
  }

  getScheduler(): DataScheduler {
    return this.scheduler;
  }
}