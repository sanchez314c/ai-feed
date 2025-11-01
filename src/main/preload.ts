import { contextBridge, ipcRenderer } from 'electron';

// Define the API interface
export interface ElectronAPI {
  // Store management
  store: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<boolean>;
    delete: (key: string) => Promise<boolean>;
  };

  // App info
  app: {
    getVersion: () => Promise<string>;
    getName: () => Promise<string>;
  };

  // Window management
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
  };

  // External links
  shell: {
    openExternal: (url: string) => Promise<void>;
  };

  // Logging
  log: {
    info: (message: string, meta?: any) => Promise<void>;
    error: (message: string, error?: any) => Promise<void>;
  };

  // Data API
  data: {
    getItems: (filters?: any) => Promise<any[]>;
    getItemById: (id: string) => Promise<any | null>;
    searchItems: (query: string) => Promise<any[]>;
    updateBookmark: (id: string, bookmarked: boolean) => Promise<boolean>;
    updateReadStatus: (id: string, isRead: boolean) => Promise<boolean>;
    getStats: () => Promise<any>;
    refreshData: () => Promise<{
      success: boolean;
      message: string;
      stats?: any;
    }>;
    isRefreshing: () => Promise<boolean>;
  };

  // Event listeners
  on: (channel: string, callback: (data: any) => void) => void;
  off: (channel: string, callback: (data: any) => void) => void;
}

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI: ElectronAPI = {
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
  },

  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
  },

  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
  },

  log: {
    info: (message: string, meta?: any) => ipcRenderer.invoke('log:info', message, meta),
    error: (message: string, error?: any) => ipcRenderer.invoke('log:error', message, error),
  },

  data: {
    getItems: (filters?: any) => ipcRenderer.invoke('data:getItems', filters),
    getItemById: (id: string) => ipcRenderer.invoke('data:getItemById', id),
    searchItems: (query: string) => ipcRenderer.invoke('data:searchItems', query),
    updateBookmark: (id: string, bookmarked: boolean) =>
      ipcRenderer.invoke('data:updateBookmark', id, bookmarked),
    updateReadStatus: (id: string, isRead: boolean) =>
      ipcRenderer.invoke('data:updateReadStatus', id, isRead),
    getStats: () => ipcRenderer.invoke('data:getStats'),
    refreshData: () => ipcRenderer.invoke('data:refreshData'),
    isRefreshing: () => ipcRenderer.invoke('data:isRefreshing'),
  },

  on: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.on(channel, (_, data) => callback(data));
  },

  off: (channel: string, callback: (data: any) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },
};

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Types for TypeScript
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
