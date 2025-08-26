import { contextBridge, ipcRenderer } from 'electron';

// 定义 API 接口
export interface ElectronAPI {
  // Database operations
  db: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    run: (sql: string, params?: any[]) => Promise<{ lastID?: number; changes?: number }>;
  };

  // Bluetooth operations
  bluetooth: {
    scan: () => Promise<BluetoothDevice[]>;
    connect: (deviceAddress: string) => Promise<boolean>;
    disconnect: () => Promise<void>;
    getStatus: () => Promise<BluetoothStatus>;
  };

  // OBD operations
  obd: {
    queryPID: (pidCode: string) => Promise<PIDResult>;
    queryMultiplePIDs: (pidCodes: string[]) => Promise<PIDResult[]>;
  };

  // App operations
  app: {
    getVersion: () => Promise<string>;
    quit: () => Promise<void>;
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
  };
}

// 类型定义
export interface BluetoothDevice {
  address: string;
  name: string;
  rssi?: number;
  connected: boolean;
}

export interface BluetoothStatus {
  connected: boolean;
  deviceAddress?: string;
  deviceName?: string;
  lastError?: string;
}

export interface PIDResult {
  pid: string;
  value: number | string;
  unit?: string;
  timestamp: number;
  error?: string;
}

// 暴露安全的 API 到渲染进程
const electronAPI: ElectronAPI = {
  db: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db:query', sql, params),
    run: (sql: string, params?: any[]) => ipcRenderer.invoke('db:run', sql, params),
  },
  
  bluetooth: {
    scan: () => ipcRenderer.invoke('bluetooth:scan'),
    connect: (deviceAddress: string) => ipcRenderer.invoke('bluetooth:connect', deviceAddress),
    disconnect: () => ipcRenderer.invoke('bluetooth:disconnect'),
    getStatus: () => ipcRenderer.invoke('bluetooth:getStatus'),
  },
  
  obd: {
    queryPID: (pidCode: string) => ipcRenderer.invoke('obd:queryPID', pidCode),
    queryMultiplePIDs: (pidCodes: string[]) => ipcRenderer.invoke('obd:queryMultiplePIDs', pidCodes),
  },
  
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
    maximize: () => ipcRenderer.invoke('app:maximize'),
  },
};

// 将 API 暴露到全局
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// TypeScript 声明
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}