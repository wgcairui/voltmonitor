import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import * as path from 'path';
import { isDev } from './utils/environment';
import { createAppMenu } from './menu/appMenu';
import { DatabaseManager } from './services/database';
import { BluetoothManager } from './services/bluetooth';

class VoltMonitorApp {
  private mainWindow: BrowserWindow | null = null;
  private databaseManager: DatabaseManager;
  private bluetoothManager: BluetoothManager;

  constructor() {
    this.databaseManager = new DatabaseManager();
    this.bluetoothManager = new BluetoothManager();
    this.init();
  }

  private async init() {
    await this.setupApp();
    this.setupEventListeners();
    this.setupIPC();
  }

  private async setupApp() {
    // Mac specific settings
    if (process.platform === 'darwin') {
      app.dock?.setIcon(path.join(__dirname, '../assets/icon.png'));
    }

    // Security
    app.setAsDefaultProtocolClient('voltmonitor');
    
    // Initialize database
    await this.databaseManager.initialize();
  }

  private setupEventListeners() {
    app.whenReady().then(() => {
      this.createWindow();
      this.setupMenu();
      
      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('before-quit', async () => {
      await this.cleanup();
    });
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1200,
      minHeight: 800,
      titleBarStyle: 'hiddenInset',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
        webSecurity: !isDev(),
      },
      show: false,
    });

    // Load the app
    if (isDev()) {
      this.mainWindow.loadURL('http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // Show window when ready
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      
      // Focus on macOS
      if (process.platform === 'darwin') {
        app.focus();
      }
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });
  }

  private setupMenu() {
    const menu = createAppMenu(this.mainWindow);
    Menu.setApplicationMenu(menu);
  }

  private setupIPC() {
    // Database operations
    ipcMain.handle('db:query', async (_, sql: string, params?: any[]) => {
      return this.databaseManager.query(sql, params);
    });

    ipcMain.handle('db:run', async (_, sql: string, params?: any[]) => {
      return this.databaseManager.run(sql, params);
    });

    // Bluetooth operations
    ipcMain.handle('bluetooth:scan', async () => {
      return this.bluetoothManager.scanDevices();
    });

    ipcMain.handle('bluetooth:connect', async (_, deviceAddress: string) => {
      return this.bluetoothManager.connect(deviceAddress);
    });

    ipcMain.handle('bluetooth:disconnect', async () => {
      return this.bluetoothManager.disconnect();
    });

    ipcMain.handle('bluetooth:getStatus', async () => {
      return this.bluetoothManager.getConnectionStatus();
    });

    // OBD operations
    ipcMain.handle('obd:queryPID', async (_, pidCode: string) => {
      return this.bluetoothManager.queryPID(pidCode);
    });

    ipcMain.handle('obd:queryMultiplePIDs', async (_, pidCodes: string[]) => {
      return this.bluetoothManager.queryMultiplePIDs(pidCodes);
    });

    // App operations
    ipcMain.handle('app:getVersion', () => {
      return app.getVersion();
    });

    ipcMain.handle('app:quit', () => {
      app.quit();
    });

    ipcMain.handle('app:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('app:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });
  }

  private async cleanup() {
    await this.bluetoothManager.disconnect();
    await this.databaseManager.close();
  }
}

// Create the app instance
new VoltMonitorApp();