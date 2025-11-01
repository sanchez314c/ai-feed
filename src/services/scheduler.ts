import * as cron from 'node-cron';
import { DataManager } from './dataManager';
import { logger } from '../utils/logger';

interface SchedulerConfig {
  autoRefreshInterval: string; // Cron expression
  enabled: boolean;
}

export class DataScheduler {
  private dataManager: DataManager;
  private config: SchedulerConfig;
  private tasks: Map<string, cron.ScheduledTask> = new Map();
  private isRunning = false;

  constructor(dataManager: DataManager, config?: SchedulerConfig) {
    this.dataManager = dataManager;
    this.config = config || {
      autoRefreshInterval: '0 */2 * * *', // Every 2 hours
      enabled: true,
    };

    logger.info('📅 DataScheduler initialized');
  }

  start(): void {
    if (this.isRunning) {
      logger.warn('Scheduler is already running');
      return;
    }

    if (!this.config.enabled) {
      logger.info('Scheduler is disabled in configuration');
      return;
    }

    this.scheduleAutoRefresh();
    this.isRunning = true;
    logger.info('✅ Scheduler started');
  }

  stop(): void {
    if (!this.isRunning) {
      return;
    }

    // Stop all scheduled tasks
    this.tasks.forEach((task, name) => {
      task.stop();
      logger.info(`Stopped scheduled task: ${name}`);
    });

    this.tasks.clear();
    this.isRunning = false;
    logger.info('🛑 Scheduler stopped');
  }

  private scheduleAutoRefresh(): void {
    const task = cron.schedule(this.config.autoRefreshInterval, async () => {
      try {
        logger.info('🔄 Starting scheduled data refresh...');
        const result = await this.dataManager.refreshData();

        if (result.success) {
          logger.info('✅ Scheduled refresh completed:', result.message);
        } else {
          logger.error('❌ Scheduled refresh failed:', result.message);
        }
      } catch (error) {
        logger.error('💥 Scheduled refresh error:', error);
      }
    });

    task.start();
    this.tasks.set('autoRefresh', task);
    logger.info(`🕐 Scheduled auto-refresh: ${this.config.autoRefreshInterval}`);
  }

  // Manual trigger for immediate refresh
  async triggerRefresh(): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('🔄 Manual data refresh triggered...');
      const result = await this.dataManager.refreshData();
      return result;
    } catch (error) {
      logger.error('Manual refresh error:', error);
      return {
        success: false,
        message: `Manual refresh failed: ${(error as Error).message}`,
      };
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<SchedulerConfig>): void {
    const wasRunning = this.isRunning;

    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...newConfig };
    logger.info('Scheduler configuration updated', this.config);

    if (wasRunning && this.config.enabled) {
      this.start();
    }
  }

  getConfig(): SchedulerConfig {
    return { ...this.config };
  }

  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  getScheduledTasks(): string[] {
    return Array.from(this.tasks.keys());
  }

  // Get next scheduled run times
  getNextRuns(): Record<string, Date | null> {
    const nextRuns: Record<string, Date | null> = {};

    this.tasks.forEach((task, name) => {
      try {
        // Get the next scheduled run (this is a simplified approach)
        // In a real implementation, you might want to use a more sophisticated method
        nextRuns[name] = this.getNextCronRun(this.config.autoRefreshInterval);
      } catch (error) {
        nextRuns[name] = null;
      }
    });

    return nextRuns;
  }

  private getNextCronRun(cronExpression: string): Date | null {
    try {
      // Simple calculation - in production you might want to use a proper cron parser
      const now = new Date();
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      return new Date(now.getTime() + twoHours);
    } catch (error) {
      logger.error('Error calculating next cron run:', error);
      return null;
    }
  }

  // Schedule a one-time refresh at a specific time
  scheduleOneTimeRefresh(date: Date): boolean {
    try {
      const now = new Date();
      if (date <= now) {
        logger.warn('Cannot schedule refresh in the past');
        return false;
      }

      const delay = date.getTime() - now.getTime();

      const timeout = setTimeout(async () => {
        try {
          logger.info('🔄 One-time scheduled refresh starting...');
          const result = await this.dataManager.refreshData();
          logger.info('✅ One-time refresh completed:', result.message);
        } catch (error) {
          logger.error('One-time refresh error:', error);
        }
      }, delay);

      logger.info(`📅 One-time refresh scheduled for: ${date.toISOString()}`);
      return true;
    } catch (error) {
      logger.error('Error scheduling one-time refresh:', error);
      return false;
    }
  }

  // Get scheduler status info
  getStatus(): {
    running: boolean;
    config: SchedulerConfig;
    activeTasks: string[];
    nextRuns: Record<string, Date | null>;
  } {
    return {
      running: this.isRunning,
      config: this.config,
      activeTasks: this.getScheduledTasks(),
      nextRuns: this.getNextRuns(),
    };
  }
}
