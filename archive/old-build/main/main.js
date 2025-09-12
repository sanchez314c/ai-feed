"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = require("path");
const electron_log_1 = __importDefault(require("electron-log"));
const electron_updater_1 = require("electron-updater");
const electron_store_1 = __importDefault(require("electron-store"));
// import { DataService } from '../services/dataService';
// import { setupDataHandlers } from './dataHandlers';
const realDataHandlers_1 = require("./realDataHandlers");
const isDev = process.env.NODE_ENV === 'development';
// Initialize logging
electron_log_1.default.transports.file.level = 'info';
electron_log_1.default.info('Application starting...');
// Initialize secure store
const store = new electron_store_1.default({
    name: 'aifeed-config',
    encryptionKey: 'aifeed-secure-key-change-in-production'
});
class AIfeedApplication {
    // private dataService: DataService | null = null;
    constructor() {
        this.mainWindow = null;
        this.isQuitting = false;
        this.setupEventHandlers();
        this.setupAutoUpdater();
    }
    setupEventHandlers() {
        electron_1.app.whenReady().then(() => {
            this.createWindow();
            this.setupMenu();
            this.setupIPC();
            (0, realDataHandlers_1.setupRealDataHandlers)(); // Setup REAL data handlers that actually work!
            // this.initializeDataService();
            electron_1.app.on('activate', () => {
                if (electron_1.BrowserWindow.getAllWindows().length === 0) {
                    this.createWindow();
                }
            });
        });
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                this.isQuitting = true;
                electron_1.app.quit();
            }
        });
        electron_1.app.on('before-quit', () => {
            this.isQuitting = true;
        });
        // Security: Prevent navigation to external URLs
        electron_1.app.on('web-contents-created', (_, contents) => {
            contents.setWindowOpenHandler(({ url }) => {
                const parsedUrl = new URL(url);
                if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
                    electron_1.shell.openExternal(url);
                    return { action: 'deny' };
                }
                return { action: 'allow' };
            });
        });
    }
    createWindow() {
        // Get stored window bounds or use defaults
        const windowBounds = store.get('windowBounds', {
            width: 1400,
            height: 900,
            x: undefined,
            y: undefined
        });
        this.mainWindow = new electron_1.BrowserWindow({
            width: windowBounds.width,
            height: windowBounds.height,
            x: windowBounds.x,
            y: windowBounds.y,
            minWidth: 1000,
            minHeight: 600,
            show: false,
            autoHideMenuBar: false,
            titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
            icon: (0, path_1.join)(__dirname, '../../assets/icon.png'),
            webPreferences: {
                preload: (0, path_1.join)(__dirname, 'preload.js'),
                sandbox: false,
                contextIsolation: true,
                nodeIntegration: false,
                webSecurity: true
            }
        });
        // Event handlers for the main window
        this.mainWindow.on('ready-to-show', () => {
            if (this.mainWindow) {
                this.mainWindow.show();
                if (isDev) {
                    this.mainWindow.webContents.openDevTools();
                }
                // Log what's actually loading
                console.log('Main window loaded successfully');
            }
        });
        this.mainWindow.on('close', (event) => {
            if (!this.isQuitting && process.platform === 'darwin') {
                event.preventDefault();
                this.mainWindow?.hide();
            }
            else {
                // Save window bounds
                if (this.mainWindow) {
                    store.set('windowBounds', this.mainWindow.getBounds());
                }
            }
        });
        this.mainWindow.on('closed', () => {
            this.mainWindow = null;
        });
        this.mainWindow.webContents.setWindowOpenHandler((details) => {
            electron_1.shell.openExternal(details.url);
            return { action: 'deny' };
        });
        // Load the correct URL based on environment
        if (isDev) {
            // Use Vite's development server
            const devUrl = 'http://localhost:5173';
            electron_log_1.default.info(`Loading development server: ${devUrl}`);
            this.mainWindow.loadURL(devUrl);
        }
        else {
            // Load the built production app
            // The renderer is built to build/renderer, not build/main/renderer
            const prodPath = (0, path_1.join)(__dirname, '../renderer/index.html');
            electron_log_1.default.info(`Loading production build: ${prodPath}`);
            electron_log_1.default.info(`Current __dirname: ${__dirname}`);
            this.mainWindow.loadFile(prodPath);
        }
        // Add error logging
        this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
            electron_log_1.default.error(`FAILED TO LOAD: ${validatedURL} - ${errorDescription} (${errorCode})`);
        });
        this.mainWindow.webContents.on('did-finish-load', () => {
            electron_log_1.default.info(`SUCCESS: Loaded window`);
        });
    }
    setupMenu() {
        if (process.platform === 'darwin') {
            const template = [
                {
                    label: 'AIFEED',
                    submenu: [
                        { role: 'about' },
                        { type: 'separator' },
                        { role: 'services' },
                        { type: 'separator' },
                        { role: 'hide' },
                        { role: 'hideothers' },
                        { role: 'unhide' },
                        { type: 'separator' },
                        { role: 'quit' }
                    ]
                },
                {
                    label: 'File',
                    submenu: [
                        {
                            label: 'New Collection',
                            accelerator: 'Cmd+N',
                            click: () => this.sendToRenderer('menu:new-collection')
                        },
                        { type: 'separator' },
                        {
                            label: 'Import',
                            accelerator: 'Cmd+I',
                            click: () => this.sendToRenderer('menu:import')
                        },
                        {
                            label: 'Export',
                            accelerator: 'Cmd+E',
                            click: () => this.sendToRenderer('menu:export')
                        }
                    ]
                },
                {
                    label: 'Edit',
                    submenu: [
                        { role: 'undo' },
                        { role: 'redo' },
                        { type: 'separator' },
                        { role: 'cut' },
                        { role: 'copy' },
                        { role: 'paste' },
                        { role: 'selectall' }
                    ]
                },
                {
                    label: 'View',
                    submenu: [
                        {
                            label: 'Refresh',
                            accelerator: 'Cmd+R',
                            click: () => this.sendToRenderer('menu:refresh')
                        },
                        { type: 'separator' },
                        { role: 'reload' },
                        { role: 'forceReload' },
                        { role: 'toggleDevTools' },
                        { type: 'separator' },
                        { role: 'resetZoom' },
                        { role: 'zoomIn' },
                        { role: 'zoomOut' },
                        { type: 'separator' },
                        { role: 'togglefullscreen' }
                    ]
                },
                {
                    label: 'Window',
                    submenu: [
                        { role: 'minimize' },
                        { role: 'close' }
                    ]
                }
            ];
            electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(template));
        }
        else {
            electron_1.Menu.setApplicationMenu(null);
        }
    }
    setupIPC() {
        // Store management
        electron_1.ipcMain.handle('store:get', (_, key) => {
            return store.get(key);
        });
        electron_1.ipcMain.handle('store:set', (_, key, value) => {
            store.set(key, value);
            return true;
        });
        electron_1.ipcMain.handle('store:delete', (_, key) => {
            store.delete(key);
            return true;
        });
        // App info
        electron_1.ipcMain.handle('app:getVersion', () => {
            return electron_1.app.getVersion();
        });
        electron_1.ipcMain.handle('app:getName', () => {
            return electron_1.app.getName();
        });
        // Window management
        electron_1.ipcMain.handle('window:minimize', () => {
            this.mainWindow?.minimize();
        });
        electron_1.ipcMain.handle('window:maximize', () => {
            if (this.mainWindow?.isMaximized()) {
                this.mainWindow.unmaximize();
            }
            else {
                this.mainWindow?.maximize();
            }
        });
        electron_1.ipcMain.handle('window:close', () => {
            this.mainWindow?.close();
        });
        // External links
        electron_1.ipcMain.handle('shell:openExternal', (_, url) => {
            electron_1.shell.openExternal(url);
        });
        // Logging
        electron_1.ipcMain.handle('log:info', (_, message, meta) => {
            electron_log_1.default.info(message, meta);
        });
        electron_1.ipcMain.handle('log:error', (_, message, error) => {
            electron_log_1.default.error(message, error);
        });
    }
    setupAutoUpdater() {
        if (!isDev) {
            electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
            electron_updater_1.autoUpdater.on('update-available', () => {
                electron_log_1.default.info('Update available');
                this.sendToRenderer('updater:update-available');
            });
            electron_updater_1.autoUpdater.on('update-downloaded', () => {
                electron_log_1.default.info('Update downloaded');
                this.sendToRenderer('updater:update-downloaded');
            });
        }
    }
    sendToRenderer(channel, data) {
        if (this.mainWindow?.webContents) {
            this.mainWindow.webContents.send(channel, data);
        }
    }
}
// Initialize the application
new AIfeedApplication();
// This method will be called when Electron has finished initialization
electron_1.app.on('ready', () => {
    electron_1.app.setAppUserModelId('com.aifeed.app');
});
// Quit when all windows are closed, except on macOS
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
