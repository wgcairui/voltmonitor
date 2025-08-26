// 全局类型定义

// PID 相关类型
export interface PIDDefinition {
  pid: string;
  mode: string;
  description: string;
  unit: string;
  formula: string;
  range?: string;
  category: 'volt' | 'standard' | 'custom';
  header?: string;
  response?: string;
  dataLength?: string;
  notes?: string;
}

export interface PIDResult {
  pid: string;
  value: number | string;
  unit?: string;
  timestamp: number;
  error?: string;
}

// OBD 数据类型
export interface OBDData {
  // Volt 专用数据
  soc?: number;              // 22005B - Battery SOC
  hvVoltage?: number;        // 2204B0 - HV Battery Voltage  
  hvCurrent?: number;        // 2204AF - HV Battery Current
  batteryTempMax?: number;   // 220425 - Battery Temp Max
  batteryTempMin?: number;   // 220426 - Battery Temp Min
  controlVoltage?: number;   // 220042 - Control Module Voltage
  motorARPM?: number;        // 220272 - Motor A RPM
  motorATorque?: number;     // 220273 - Motor A Torque
  motorBRPM?: number;        // 220274 - Motor B RPM  
  motorBTorque?: number;     // 220275 - Motor B Torque
  chargingPower?: number;    // 2243A5 - Charging Power
  chargeACVoltage?: number;  // 224372 - Charger AC Voltage
  chargeACCurrent?: number;  // 224373 - Charger AC Current
  chargeDCVoltage?: number;  // 224374 - Charger DC Voltage
  chargeDCCurrent?: number;  // 224375 - Charger DC Current
  
  // 标准 OBD-II 数据
  engineRPM?: number;        // 0C - Engine RPM
  vehicleSpeed?: number;     // 0D - Vehicle Speed
  engineLoad?: number;       // 04 - Engine Load
  coolantTemp?: number;      // 05 - Coolant Temperature
  intakeTemp?: number;       // 0F - Intake Air Temperature
  throttlePos?: number;      // 11 - Throttle Position
  fuelLevel?: number;        // 2F - Fuel Level
  fuelPressure?: number;     // 0A - Fuel Pressure
  manifoldPressure?: number; // 0B - Manifold Pressure
  timingAdvance?: number;    // 0E - Timing Advance
  mafFlow?: number;          // 10 - MAF Air Flow
  
  // 通用属性
  timestamp: number;
  connected: boolean;
}

// 连接状态
export interface ConnectionStatus {
  connected: boolean;
  deviceAddress?: string;
  deviceName?: string;
  lastError?: string;
  connectionTime?: number;
  dataRate?: number; // PIDs per second
}

// 蓝牙设备
export interface BluetoothDevice {
  address: string;
  name: string;
  rssi?: number;
  connected: boolean;
  lastSeen?: number;
}

// 告警相关
export interface Alert {
  id: string;
  pidCode: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  message: string;
  value: number;
  threshold?: number;
  timestamp: number;
  acknowledged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// 设置相关
export interface AppSettings {
  // 连接设置
  autoReconnect: boolean;
  reconnectInterval: number;
  connectionTimeout: number;
  
  // 数据设置
  updateInterval: number; // ms
  maxHistoryPoints: number;
  enableDataLogging: boolean;
  
  // 告警设置
  enableAlerts: boolean;
  alertSound: boolean;
  alertThresholds: Record<string, { min?: number; max?: number; enabled: boolean }>;
  
  // UI 设置
  theme: 'light' | 'dark' | 'auto';
  showVoltageGraphs: boolean;
  showCurrentGraphs: boolean;
  showTemperatureGraphs: boolean;
  
  // 自定义仪表盘
  dashboardLayout: DashboardLayout;
  favoritesPIDs: string[];
}

export interface DashboardLayout {
  components: DashboardComponent[];
  columns: number;
}

export interface DashboardComponent {
  id: string;
  type: 'stat' | 'gauge' | 'chart' | 'table';
  pidCodes: string[];
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
}

// 历史数据
export interface HistoryDataPoint {
  timestamp: number;
  values: Record<string, number>;
}

export interface HistoryQuery {
  pidCodes: string[];
  startTime: number;
  endTime: number;
  interval?: number; // 数据采样间隔
}

// 导出相关
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  pidCodes: string[];
  startTime: number;
  endTime: number;
  includeMetadata: boolean;
}

// 图表数据
export interface ChartData {
  name: string;
  timestamp: number;
  [key: string]: string | number;
}

// 应用状态
export interface AppState {
  connection: ConnectionStatus;
  obdData: OBDData;
  alerts: Alert[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
}

// API 响应
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Electron IPC 事件
export interface ElectronEvents {
  'menu:preferences': () => void;
  'menu:new-session': () => void;
  'menu:open-file': () => void;
  'menu:export-data': () => void;
  'menu:export-report': () => void;
  'menu:navigate': (route: string) => void;
  'menu:scan-devices': () => void;
  'menu:connect': () => void;
  'menu:disconnect': () => void;
  'menu:show-shortcuts': () => void;
  'menu:check-updates': () => void;
}

// 组件 Props
export interface DashboardProps {
  data: OBDData;
  connectionStatus: ConnectionStatus;
  onRefresh?: () => void;
}

export interface PIDTableProps {
  pids: PIDDefinition[];
  currentValues?: Record<string, PIDResult>;
  onPIDSelect?: (pid: PIDDefinition) => void;
  loading?: boolean;
}

export interface ConnectionPanelProps {
  status: ConnectionStatus;
  devices: BluetoothDevice[];
  onScan: () => void;
  onConnect: (deviceAddress: string) => void;
  onDisconnect: () => void;
  scanning?: boolean;
}

export interface ChartComponentProps {
  title: string;
  data: ChartData[];
  xKey: string;
  yKeys: string[];
  height?: number;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
}

// 工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;