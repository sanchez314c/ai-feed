"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const electronAPI = {
    store: {
        get: (key) => electron_1.ipcRenderer.invoke('store:get', key),
        set: (key, value) => electron_1.ipcRenderer.invoke('store:set', key, value),
        delete: (key) => electron_1.ipcRenderer.invoke('store:delete', key)
    },
    app: {
        getVersion: () => electron_1.ipcRenderer.invoke('app:getVersion'),
        getName: () => electron_1.ipcRenderer.invoke('app:getName')
    },
    window: {
        minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
        maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
        close: () => electron_1.ipcRenderer.invoke('window:close')
    },
    shell: {
        openExternal: (url) => electron_1.ipcRenderer.invoke('shell:openExternal', url)
    },
    log: {
        info: (message, meta) => electron_1.ipcRenderer.invoke('log:info', message, meta),
        error: (message, error) => electron_1.ipcRenderer.invoke('log:error', message, error)
    },
    data: {
        getItems: (filters) => electron_1.ipcRenderer.invoke('data:getItems', filters),
        getItemById: (id) => electron_1.ipcRenderer.invoke('data:getItemById', id),
        searchItems: (query) => electron_1.ipcRenderer.invoke('data:searchItems', query),
        updateBookmark: (id, bookmarked) => electron_1.ipcRenderer.invoke('data:updateBookmark', id, bookmarked),
        updateReadStatus: (id, isRead) => electron_1.ipcRenderer.invoke('data:updateReadStatus', id, isRead),
        getStats: () => electron_1.ipcRenderer.invoke('data:getStats'),
        refreshData: () => electron_1.ipcRenderer.invoke('data:refreshData'),
        isRefreshing: () => electron_1.ipcRenderer.invoke('data:isRefreshing')
    },
    on: (channel, callback) => {
        electron_1.ipcRenderer.on(channel, (_, data) => callback(data));
    },
    off: (channel, callback) => {
        electron_1.ipcRenderer.removeListener(channel, callback);
    }
};
// Expose the API to the renderer process
electron_1.contextBridge.exposeInMainWorld('electronAPI', electronAPI);
