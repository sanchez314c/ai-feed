import { ipcMain } from 'electron';
import log from 'electron-log';

export function setupDataHandlers(): void {
  // Mock data handlers for now to get the UI working
  
  ipcMain.handle('data:getItems', async (_, filters: any) => {
    log.info('Mock getItems called with filters:', filters);
    // Return empty array for now
    return [];
  });

  ipcMain.handle('data:getItemById', async (_, id: string) => {
    log.info('Mock getItemById called with id:', id);
    return null;
  });

  ipcMain.handle('data:searchItems', async (_, query: string) => {
    log.info('Mock searchItems called with query:', query);
    return [];
  });

  ipcMain.handle('data:getStats', async () => {
    log.info('Mock getStats called');
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

  ipcMain.handle('data:updateBookmark', async (_, id: string, bookmarked: boolean) => {
    log.info(`Mock updateBookmark called: ${id} -> ${bookmarked}`);
    return true;
  });

  ipcMain.handle('data:updateReadStatus', async (_, id: string, isRead: boolean) => {
    log.info(`Mock updateReadStatus called: ${id} -> ${isRead}`);
    return true;
  });

  ipcMain.handle('data:refreshData', async () => {
    log.info('Mock refreshData called');
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

  ipcMain.handle('data:isRefreshing', () => {
    return false;
  });

  log.info('✅ Data handlers registered successfully');
}