import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import { join } from 'path';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import Store from 'electron-store';
// import { DataService } from '../services/dataService';
// import { setupDataHandlers } from './dataHandlers';
import { setupRealDataHandlers } from './realDataHandlers';

const isDev = process.env.NODE_ENV === 'development';

// Initialize logging
log.transports.file.level = 'info';
log.info('Application starting...');

// Initialize secure store
const store = new Store({
  name: 'aifeed-config',
  encryptionKey: 'aifeed-secure-key-change-in-production',
});

class AIfeedApplication {
  private mainWindow: BrowserWindow | null = null;
  private isQuitting = false;
  // private dataService: DataService | null = null;

  constructor() {
    this.setupEventHandlers();
    this.setupAutoUpdater();
  }

  private setupEventHandlers(): void {
    app.whenReady().then(() => {
      this.createWindow();
      this.setupMenu();
      this.setupIPC();
      setupRealDataHandlers(); // Setup REAL data handlers that actually work!
      // this.initializeDataService();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        this.isQuitting = true;
        app.quit();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });

    // Security: Prevent navigation to external URLs
    app.on('web-contents-created', (_, contents) => {
      contents.setWindowOpenHandler(({ url }) => {
        const parsedUrl = new URL(url);

        if (parsedUrl.origin !== 'http://localhost:3000' && parsedUrl.origin !== 'file://') {
          shell.openExternal(url);
          return { action: 'deny' };
        }
        return { action: 'allow' };
      });
    });
  }

  private createWindow(): void {
    // Get stored window bounds or use defaults
    const windowBounds = store.get('windowBounds', {
      width: 1400,
      height: 900,
      x: undefined,
      y: undefined,
    }) as { width: number; height: number; x?: number; y?: number };

    this.mainWindow = new BrowserWindow({
      width: windowBounds.width,
      height: windowBounds.height,
      x: windowBounds.x,
      y: windowBounds.y,
      minWidth: 1000,
      minHeight: 600,
      show: false,
      autoHideMenuBar: false,
      titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
      icon: join(__dirname, '../../assets/icon.png'),
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
      },
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

    this.mainWindow.on('close', event => {
      if (!this.isQuitting && process.platform === 'darwin') {
        event.preventDefault();
        this.mainWindow?.hide();
      } else {
        // Save window bounds
        if (this.mainWindow) {
          store.set('windowBounds', this.mainWindow.getBounds());
        }
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    this.mainWindow.webContents.setWindowOpenHandler(details => {
      shell.openExternal(details.url);
      return { action: 'deny' };
    });

    // Load the correct URL based on environment
    if (isDev) {
      // Use Vite's development server
      const devUrl = 'http://localhost:5173';
      log.info(`Loading development server: ${devUrl}`);
      this.mainWindow.loadURL(devUrl);
    } else {
      // Load the built production app
      // The renderer is built to build/renderer, not build/main/renderer
      const prodPath = join(__dirname, '../renderer/index.html');
      log.info(`Loading production build: ${prodPath}`);
      log.info(`Current __dirname: ${__dirname}`);
      this.mainWindow.loadFile(prodPath);
    }

    // Add error logging
    this.mainWindow.webContents.on(
      'did-fail-load',
      (event, errorCode, errorDescription, validatedURL) => {
        log.error(`FAILED TO LOAD: ${validatedURL} - ${errorDescription} (${errorCode})`);
      }
    );

    this.mainWindow.webContents.on('did-finish-load', () => {
      log.info(`SUCCESS: Loaded window`);
    });
  }

  private setupMenu(): void {
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
            { role: 'quit' },
          ],
        },
        {
          label: 'File',
          submenu: [
            {
              label: 'New Collection',
              accelerator: 'Cmd+N',
              click: () => this.sendToRenderer('menu:new-collection'),
            },
            { type: 'separator' },
            {
              label: 'Import',
              accelerator: 'Cmd+I',
              click: () => this.sendToRenderer('menu:import'),
            },
            {
              label: 'Export',
              accelerator: 'Cmd+E',
              click: () => this.sendToRenderer('menu:export'),
            },
          ],
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
            { role: 'selectall' },
          ],
        },
        {
          label: 'View',
          submenu: [
            {
              label: 'Refresh',
              accelerator: 'Cmd+R',
              click: () => this.sendToRenderer('menu:refresh'),
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
            { role: 'togglefullscreen' },
          ],
        },
        {
          label: 'Window',
          submenu: [{ role: 'minimize' }, { role: 'close' }],
        },
      ];

      Menu.setApplicationMenu(Menu.buildFromTemplate(template as any));
    } else {
      Menu.setApplicationMenu(null);
    }
  }

  private setupIPC(): void {
    // Store management
    ipcMain.handle('store:get', (_, key: string) => {
      return store.get(key);
    });

    ipcMain.handle('store:set', (_, key: string, value: any) => {
      store.set(key, value);
      return true;
    });

    ipcMain.handle('store:delete', (_, key: string) => {
      store.delete(key);
      return true;
    });

    // App info
    ipcMain.handle('app:getVersion', () => {
      return app.getVersion();
    });

    ipcMain.handle('app:getName', () => {
      return app.getName();
    });

    // Window management
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });

    // External links
    ipcMain.handle('shell:openExternal', (_, url: string) => {
      shell.openExternal(url);
    });

    // Logging
    ipcMain.handle('log:info', (_, message: string, meta?: any) => {
      log.info(message, meta);
    });

    ipcMain.handle('log:error', (_, message: string, error?: any) => {
      log.error(message, error);
    });
  }

  private setupAutoUpdater(): void {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();

      autoUpdater.on('update-available', () => {
        log.info('Update available');
        this.sendToRenderer('updater:update-available');
      });

      autoUpdater.on('update-downloaded', () => {
        log.info('Update downloaded');
        this.sendToRenderer('updater:update-downloaded');
      });
    }
  }

  private sendToRenderer(channel: string, data?: any): void {
    if (this.mainWindow?.webContents) {
      this.mainWindow.webContents.send(channel, data);
    }
  }

  // private initializeDataService(): void {
  //   try {
  //     log.info('Initializing data service...');
  //     this.dataService = new DataService();

  //     // Start auto-refresh
  //     this.dataService.startAutoRefresh();

  //     log.info('Data service initialized successfully');
  //   } catch (error) {
  //     log.error('Failed to initialize data service:', error);
  //   }
  // }
}

// Initialize the application
new AIfeedApplication();

// This method will be called when Electron has finished initialization
app.on('ready', () => {
  app.setAppUserModelId('com.aifeed.app');
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
