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
exports.DataScheduler = void 0;
const cron = __importStar(require("node-cron"));
const logger_1 = require("../utils/logger");
class DataScheduler {
    constructor(dataManager, config) {
        this.tasks = new Map();
        this.isRunning = false;
        this.dataManager = dataManager;
        this.config = config || {
            autoRefreshInterval: '0 */2 * * *', // Every 2 hours
            enabled: true
        };
        logger_1.logger.info('📅 DataScheduler initialized');
    }
    start() {
        if (this.isRunning) {
            logger_1.logger.warn('Scheduler is already running');
            return;
        }
        if (!this.config.enabled) {
            logger_1.logger.info('Scheduler is disabled in configuration');
            return;
        }
        this.scheduleAutoRefresh();
        this.isRunning = true;
        logger_1.logger.info('✅ Scheduler started');
    }
    stop() {
        if (!this.isRunning) {
            return;
        }
        // Stop all scheduled tasks
        this.tasks.forEach((task, name) => {
            task.stop();
            logger_1.logger.info(`Stopped scheduled task: ${name}`);
        });
        this.tasks.clear();
        this.isRunning = false;
        logger_1.logger.info('🛑 Scheduler stopped');
    }
    scheduleAutoRefresh() {
        const task = cron.schedule(this.config.autoRefreshInterval, async () => {
            try {
                logger_1.logger.info('🔄 Starting scheduled data refresh...');
                const result = await this.dataManager.refreshData();
                if (result.success) {
                    logger_1.logger.info('✅ Scheduled refresh completed:', result.message);
                }
                else {
                    logger_1.logger.error('❌ Scheduled refresh failed:', result.message);
                }
            }
            catch (error) {
                logger_1.logger.error('💥 Scheduled refresh error:', error);
            }
        });
        task.start();
        this.tasks.set('autoRefresh', task);
        logger_1.logger.info(`🕐 Scheduled auto-refresh: ${this.config.autoRefreshInterval}`);
    }
    // Manual trigger for immediate refresh
    async triggerRefresh() {
        try {
            logger_1.logger.info('🔄 Manual data refresh triggered...');
            const result = await this.dataManager.refreshData();
            return result;
        }
        catch (error) {
            logger_1.logger.error('Manual refresh error:', error);
            return {
                success: false,
                message: `Manual refresh failed: ${error.message}`
            };
        }
    }
    // Update configuration
    updateConfig(newConfig) {
        const wasRunning = this.isRunning;
        if (wasRunning) {
            this.stop();
        }
        this.config = { ...this.config, ...newConfig };
        logger_1.logger.info('Scheduler configuration updated', this.config);
        if (wasRunning && this.config.enabled) {
            this.start();
        }
    }
    getConfig() {
        return { ...this.config };
    }
    isSchedulerRunning() {
        return this.isRunning;
    }
    getScheduledTasks() {
        return Array.from(this.tasks.keys());
    }
    // Get next scheduled run times
    getNextRuns() {
        const nextRuns = {};
        this.tasks.forEach((task, name) => {
            try {
                // Get the next scheduled run (this is a simplified approach)
                // In a real implementation, you might want to use a more sophisticated method
                nextRuns[name] = this.getNextCronRun(this.config.autoRefreshInterval);
            }
            catch (error) {
                nextRuns[name] = null;
            }
        });
        return nextRuns;
    }
    getNextCronRun(cronExpression) {
        try {
            // Simple calculation - in production you might want to use a proper cron parser
            const now = new Date();
            const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
            return new Date(now.getTime() + twoHours);
        }
        catch (error) {
            logger_1.logger.error('Error calculating next cron run:', error);
            return null;
        }
    }
    // Schedule a one-time refresh at a specific time
    scheduleOneTimeRefresh(date) {
        try {
            const now = new Date();
            if (date <= now) {
                logger_1.logger.warn('Cannot schedule refresh in the past');
                return false;
            }
            const delay = date.getTime() - now.getTime();
            const timeout = setTimeout(async () => {
                try {
                    logger_1.logger.info('🔄 One-time scheduled refresh starting...');
                    const result = await this.dataManager.refreshData();
                    logger_1.logger.info('✅ One-time refresh completed:', result.message);
                }
                catch (error) {
                    logger_1.logger.error('One-time refresh error:', error);
                }
            }, delay);
            logger_1.logger.info(`📅 One-time refresh scheduled for: ${date.toISOString()}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error scheduling one-time refresh:', error);
            return false;
        }
    }
    // Get scheduler status info
    getStatus() {
        return {
            running: this.isRunning,
            config: this.config,
            activeTasks: this.getScheduledTasks(),
            nextRuns: this.getNextRuns()
        };
    }
}
exports.DataScheduler = DataScheduler;
