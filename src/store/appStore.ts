import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  ConnectionStatus, 
  BluetoothDevice, 
  OBDData, 
  Alert, 
  AppSettings,
  PIDResult,
  HistoryDataPoint
} from '../types';
import { voltPIDs, standardPIDs } from '../services/pidDatabase';

interface AppState {
  // 连接状态
  connectionStatus: ConnectionStatus;
  devices: BluetoothDevice[];
  isLoading: boolean;
  error: string | null;
  
  // OBD 数据
  obdData: OBDData;
  currentPIDValues: Record<string, PIDResult>;
  historyData: HistoryDataPoint[];
  
  // 告警
  alerts: Alert[];
  unreadAlerts: number;
  
  // 设置
  settings: AppSettings;
  
  // UI 状态
  selectedPage: string;
  sidebarCollapsed: boolean;
}

interface AppActions {
  // 应用初始化
  initializeApp: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // 设备管理
  scanBluetoothDevices: () => Promise<void>;
  connectToDevice: (address: string) => Promise<void>;
  disconnectDevice: () => void;
  updateDevices: (devices: BluetoothDevice[]) => void;
  
  // 数据管理
  updateOBDData: (data: Partial<OBDData>) => void;
  updatePIDValue: (pid: string, result: PIDResult) => void;
  addHistoryPoint: (point: HistoryDataPoint) => void;
  clearHistory: () => void;
  
  // 告警管理
  addAlert: (alert: Alert) => void;
  acknowledgeAlert: (alertId: string) => void;
  clearAllAlerts: () => void;
  
  // 设置管理
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // UI 状态
  setSelectedPage: (page: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const defaultSettings: AppSettings = {
  autoReconnect: true,
  reconnectInterval: 5000,
  connectionTimeout: 10000,
  updateInterval: 1000,
  maxHistoryPoints: 1000,
  enableDataLogging: true,
  enableAlerts: true,
  alertSound: true,
  alertThresholds: {},
  theme: 'light',
  showVoltageGraphs: true,
  showCurrentGraphs: true,
  showTemperatureGraphs: true,
  dashboardLayout: {
    components: [],
    columns: 3
  },
  favoritesPIDs: []
};

const initialState: AppState = {
  connectionStatus: {
    connected: false,
    deviceAddress: undefined,
    deviceName: undefined,
    lastError: undefined,
    connectionTime: undefined,
    dataRate: 0
  },
  devices: [],
  isLoading: false,
  error: null,
  obdData: {
    timestamp: Date.now(),
    connected: false
  },
  currentPIDValues: {},
  historyData: [],
  alerts: [],
  unreadAlerts: 0,
  settings: defaultSettings,
  selectedPage: 'dashboard',
  sidebarCollapsed: false
};

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 应用初始化
      initializeApp: () => {
        console.log('Initializing VoltMonitor app...');
        set({ isLoading: true });
        
        // 模拟初始化过程
        setTimeout(() => {
          set({ 
            isLoading: false,
            error: null
          });
          console.log('VoltMonitor initialized successfully');
        }, 2000);
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setError: (error: string | null) => {
        set({ error });
      },
      
      // 设备管理
      scanBluetoothDevices: async () => {
        console.log('Scanning for Bluetooth devices...');
        set({ isLoading: true });
        
        try {
          // 模拟扫描过程
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // 模拟发现的设备
          const mockDevices: BluetoothDevice[] = [
            {
              address: '00:11:22:33:44:55',
              name: 'OBDII ELM327',
              rssi: -45,
              connected: false,
              lastSeen: Date.now()
            },
            {
              address: '66:77:88:99:AA:BB',
              name: 'Car Scanner ELM',
              rssi: -58,
              connected: false,
              lastSeen: Date.now()
            }
          ];
          
          set({ 
            devices: mockDevices,
            isLoading: false 
          });
          
          console.log(`Found ${mockDevices.length} devices`);
        } catch (error) {
          console.error('Scan failed:', error);
          set({ 
            error: 'Failed to scan for devices',
            isLoading: false 
          });
        }
      },
      
      connectToDevice: async (address: string) => {
        const device = get().devices.find(d => d.address === address);
        if (!device) return;
        
        console.log(`Connecting to ${device.name} (${address})`);
        set({ isLoading: true });
        
        try {
          // 模拟连接过程
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // 更新连接状态
          set({ 
            connectionStatus: {
              connected: true,
              deviceAddress: address,
              deviceName: device.name,
              connectionTime: Date.now(),
              dataRate: 0
            },
            devices: get().devices.map(d => ({
              ...d,
              connected: d.address === address
            })),
            isLoading: false,
            error: null
          });
          
          console.log(`Connected to ${device.name}`);
          
          // 开始数据采集
          get().startDataCollection();
        } catch (error) {
          console.error('Connection failed:', error);
          set({ 
            error: `Failed to connect to ${device.name}`,
            isLoading: false 
          });
        }
      },
      
      disconnectDevice: () => {
        console.log('Disconnecting from OBD device...');
        
        set({
          connectionStatus: {
            connected: false,
            deviceAddress: undefined,
            deviceName: undefined,
            connectionTime: undefined,
            dataRate: 0
          },
          devices: get().devices.map(d => ({ ...d, connected: false })),
          obdData: {
            ...get().obdData,
            connected: false
          }
        });
        
        // 停止数据采集
        get().stopDataCollection();
      },
      
      updateDevices: (devices: BluetoothDevice[]) => {
        set({ devices });
      },
      
      // 数据管理
      updateOBDData: (data: Partial<OBDData>) => {
        set({
          obdData: {
            ...get().obdData,
            ...data,
            timestamp: Date.now()
          }
        });
      },
      
      updatePIDValue: (pid: string, result: PIDResult) => {
        const currentValues = get().currentPIDValues;
        set({
          currentPIDValues: {
            ...currentValues,
            [pid]: result
          }
        });
        
        // 检查告警阈值
        get().checkAlertThresholds(pid, result);
      },
      
      addHistoryPoint: (point: HistoryDataPoint) => {
        const history = get().historyData;
        const maxPoints = get().settings.maxHistoryPoints;
        
        const newHistory = [...history, point];
        if (newHistory.length > maxPoints) {
          newHistory.splice(0, newHistory.length - maxPoints);
        }
        
        set({ historyData: newHistory });
      },
      
      clearHistory: () => {
        set({ historyData: [] });
      },
      
      // 告警管理
      addAlert: (alert: Alert) => {
        const alerts = get().alerts;
        set({
          alerts: [alert, ...alerts],
          unreadAlerts: get().unreadAlerts + 1
        });
      },
      
      acknowledgeAlert: (alertId: string) => {
        const alerts = get().alerts.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        );
        set({ 
          alerts,
          unreadAlerts: Math.max(0, get().unreadAlerts - 1)
        });
      },
      
      clearAllAlerts: () => {
        set({ 
          alerts: [],
          unreadAlerts: 0
        });
      },
      
      // 设置管理
      updateSettings: (newSettings: Partial<AppSettings>) => {
        set({
          settings: {
            ...get().settings,
            ...newSettings
          }
        });
      },
      
      // UI 状态
      setSelectedPage: (page: string) => {
        set({ selectedPage: page });
      },
      
      setSidebarCollapsed: (collapsed: boolean) => {
        set({ sidebarCollapsed: collapsed });
      },
      
      // 内部方法
      startDataCollection: () => {
        const interval = setInterval(() => {
          if (!get().connectionStatus.connected) {
            clearInterval(interval);
            return;
          }
          
          // 模拟 PID 数据更新
          get().simulatePIDData();
        }, get().settings.updateInterval);
        
        // 存储 interval 以便清除
        (get() as any).dataCollectionInterval = interval;
      },
      
      stopDataCollection: () => {
        const interval = (get() as any).dataCollectionInterval;
        if (interval) {
          clearInterval(interval);
          (get() as any).dataCollectionInterval = null;
        }
      },
      
      simulatePIDData: () => {
        const allPIDs = [...voltPIDs, ...standardPIDs];
        const randomPIDs = allPIDs
          .sort(() => 0.5 - Math.random())
          .slice(0, 8); // 模拟同时读取 8 个 PID
        
        const newOBDData: Partial<OBDData> = { connected: true };
        const historyPoint: HistoryDataPoint = {
          timestamp: Date.now(),
          values: {}
        };
        
        randomPIDs.forEach(pidDef => {
          const mockValue = get().generateMockValue(pidDef);
          const result: PIDResult = {
            pid: pidDef.pid,
            value: mockValue,
            unit: pidDef.unit,
            timestamp: Date.now()
          };
          
          get().updatePIDValue(pidDef.pid, result);
          historyPoint.values[pidDef.pid] = typeof mockValue === 'number' ? mockValue : 0;
          
          // 映射到 OBDData 结构
          get().mapPIDToOBDData(pidDef.pid, mockValue, newOBDData);
        });
        
        get().updateOBDData(newOBDData);
        get().addHistoryPoint(historyPoint);
        
        // 更新数据率
        const currentRate = get().connectionStatus.dataRate || 0;
        set({
          connectionStatus: {
            ...get().connectionStatus,
            dataRate: Math.round((currentRate + randomPIDs.length) / 2 * 10) / 10
          }
        });
      },
      
      generateMockValue: (pidDef: any) => {
        // 根据 PID 类型生成模拟数据
        if (pidDef.category === 'volt') {
          switch (pidDef.pid) {
            case '22005B': return Math.random() * 100; // SOC
            case '2204B0': return 300 + Math.random() * 50; // HV Voltage
            case '2204AF': return -20 + Math.random() * 40; // HV Current
            case '220425': return 20 + Math.random() * 15; // Battery Temp Max
            case '220426': return 15 + Math.random() * 10; // Battery Temp Min
            case '220272': return Math.random() * 3000; // Motor A RPM
            case '220273': return -100 + Math.random() * 200; // Motor A Torque
            default: return Math.random() * 100;
          }
        } else {
          switch (pidDef.pid) {
            case '0C': return Math.random() * 6000; // Engine RPM
            case '0D': return Math.random() * 120; // Vehicle Speed
            case '04': return Math.random() * 100; // Engine Load
            case '05': return 80 + Math.random() * 20; // Coolant Temp
            case '0F': return 20 + Math.random() * 30; // Intake Temp
            default: return Math.random() * 100;
          }
        }
      },
      
      mapPIDToOBDData: (pid: string, value: any, obdData: Partial<OBDData>) => {
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        
        // Volt 专用映射
        switch (pid) {
          case '22005B': obdData.soc = numValue; break;
          case '2204B0': obdData.hvVoltage = numValue; break;
          case '2204AF': obdData.hvCurrent = numValue; break;
          case '220425': obdData.batteryTempMax = numValue; break;
          case '220426': obdData.batteryTempMin = numValue; break;
          case '220272': obdData.motorARPM = numValue; break;
          case '220273': obdData.motorATorque = numValue; break;
          case '220274': obdData.motorBRPM = numValue; break;
          case '220275': obdData.motorBTorque = numValue; break;
          case '2243A5': obdData.chargingPower = numValue; break;
          case '224372': obdData.chargeACVoltage = numValue; break;
          case '224373': obdData.chargeACCurrent = numValue; break;
          case '224374': obdData.chargeDCVoltage = numValue; break;
          case '224375': obdData.chargeDCCurrent = numValue; break;
        }
        
        // 标准 OBD-II 映射
        switch (pid) {
          case '0C': obdData.engineRPM = numValue; break;
          case '0D': obdData.vehicleSpeed = numValue; break;
          case '04': obdData.engineLoad = numValue; break;
          case '05': obdData.coolantTemp = numValue; break;
          case '0F': obdData.intakeTemp = numValue; break;
          case '11': obdData.throttlePos = numValue; break;
          case '2F': obdData.fuelLevel = numValue; break;
          case '0A': obdData.fuelPressure = numValue; break;
          case '0B': obdData.manifoldPressure = numValue; break;
          case '0E': obdData.timingAdvance = numValue; break;
          case '10': obdData.mafFlow = numValue; break;
        }
      },
      
      checkAlertThresholds: (pid: string, result: PIDResult) => {
        const settings = get().settings;
        if (!settings.enableAlerts) return;
        
        const threshold = settings.alertThresholds[pid];
        if (!threshold || !threshold.enabled) return;
        
        const value = typeof result.value === 'number' ? result.value : parseFloat(result.value as string);
        if (isNaN(value)) return;
        
        let alertType: 'warning' | 'error' | 'info' = 'info';
        let alertMessage = '';
        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        
        if (threshold.max !== undefined && value > threshold.max) {
          alertType = 'error';
          alertMessage = `Value ${value} exceeds maximum threshold ${threshold.max}`;
          severity = 'high';
        } else if (threshold.min !== undefined && value < threshold.min) {
          alertType = 'warning';
          alertMessage = `Value ${value} below minimum threshold ${threshold.min}`;
          severity = 'medium';
        }
        
        if (alertMessage) {
          const pidDef = [...voltPIDs, ...standardPIDs].find(p => p.pid === pid);
          const alert: Alert = {
            id: `${pid}-${Date.now()}`,
            pidCode: pid,
            type: alertType,
            title: pidDef?.description || `PID ${pid}`,
            message: alertMessage,
            value,
            threshold: threshold.max || threshold.min,
            timestamp: Date.now(),
            acknowledged: false,
            severity
          };
          
          get().addAlert(alert);
        }
      }
    }),
    { name: 'volt-monitor-store' }
  )
);