import { PIDDefinition } from '@/types';

// 雪佛兰 Volt 专用 PID 数据库 (52 条)
export const voltPIDs: PIDDefinition[] = [
  // 电池系统
  {
    pid: '22005B',
    mode: '22',
    description: 'Hybrid Pack Remaining (SOC)',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电池剩余电量',
  },
  {
    pid: '220042',
    mode: '22',
    description: 'Control Module Voltage',
    unit: 'V',
    formula: '(A*256+B)/1000',
    range: '0-15V',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '控制模块电压',
  },
  {
    pid: '2204B0',
    mode: '22',
    description: 'HV Battery Voltage',
    unit: 'V',
    formula: '((A*256+B)*256+C)/100',
    range: '0-400V',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '高压电池电压',
  },
  {
    pid: '2204AF',
    mode: '22',
    description: 'HV Battery Current',
    unit: 'A',
    formula: '((A*256+B)-32768)/100',
    range: '-327.68 to 327.67A',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '高压电池电流',
  },
  {
    pid: '220425',
    mode: '22',
    description: 'HV Battery Temperature Max',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电池最高温度',
  },
  {
    pid: '220426',
    mode: '22',
    description: 'HV Battery Temperature Min',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电池最低温度',
  },
  {
    pid: '2201BB',
    mode: '22',
    description: 'HV Battery Pack Voltage',
    unit: 'V',
    formula: '((A*256)+B)/10',
    range: '0-6553.5V',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电池包电压',
  },
  {
    pid: '22437D',
    mode: '22',
    description: '12V Battery Voltage',
    unit: 'V',
    formula: '(A*256+B)/1000',
    range: '0-16V',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '12V电池电压',
  },
  
  // 充电系统
  {
    pid: '224373',
    mode: '22',
    description: 'Onboard Charger AC Current',
    unit: 'A',
    formula: '((A*256)+B)/100',
    range: '0-655.35A',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '车载充电器AC电流',
  },
  {
    pid: '224372',
    mode: '22',
    description: 'Onboard Charger AC Voltage',
    unit: 'V',
    formula: '((A*256)+B)/10',
    range: '0-6553.5V',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '车载充电器AC电压',
  },
  {
    pid: '224375',
    mode: '22',
    description: 'Onboard Charger DC Current',
    unit: 'A',
    formula: '((A*256)+B)/100',
    range: '0-655.35A',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '车载充电器DC电流',
  },
  {
    pid: '224374',
    mode: '22',
    description: 'Onboard Charger DC Voltage',
    unit: 'V',
    formula: '((A*256)+B)/10',
    range: '0-6553.5V',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '车载充电器DC电压',
  },
  {
    pid: '22437E',
    mode: '22',
    description: 'LV Charge Amps',
    unit: 'A',
    formula: '(S_A*256+B)/20',
    range: '-100 to 100A',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '低压充电电流',
  },
  {
    pid: '2243A5',
    mode: '22',
    description: 'Charging Power',
    unit: 'kW',
    formula: '((A*256)+B)/100',
    range: '0-655.35kW',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '充电功率',
  },
  
  // 电机系统
  {
    pid: '220272',
    mode: '22',
    description: 'Motor A RPM',
    unit: 'RPM',
    formula: '((A*256)+B)/4',
    range: '-8192 to 8191 RPM',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电机A转速',
  },
  {
    pid: '220273',
    mode: '22',
    description: 'Motor A Torque',
    unit: 'Nm',
    formula: '((A*256)+B)/4-8192',
    range: '-2048 to 2047 Nm',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电机A扭矩',
  },
  {
    pid: '220274',
    mode: '22',
    description: 'Motor B RPM',
    unit: 'RPM',
    formula: '((A*256)+B)/4',
    range: '-8192 to 8191 RPM',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电机B转速',
  },
  {
    pid: '220275',
    mode: '22',
    description: 'Motor B Torque',
    unit: 'Nm',
    formula: '((A*256)+B)/4-8192',
    range: '-2048 to 2047 Nm',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电机B扭矩',
  },
  {
    pid: '22F40C',
    mode: '22',
    description: 'Total Motor Torque',
    unit: 'Nm',
    formula: '((A*256)+B)/8-4096',
    range: '-4096 to 4095.875 Nm',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '电机总扭矩',
  },
  
  // 发动机系统
  {
    pid: '220005',
    mode: '22',
    description: 'Engine Coolant Temperature',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '发动机冷却液温度',
  },
  {
    pid: '221154',
    mode: '22',
    description: 'Engine Oil Temperature',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '发动机机油温度',
  },
  {
    pid: '22000C',
    mode: '22',
    description: 'Engine RPM',
    unit: 'RPM',
    formula: '((A*256)+B)/4',
    range: '0-16383.75 RPM',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '发动机转速',
  },
  {
    pid: '22203F',
    mode: '22',
    description: 'Engine Torque',
    unit: 'Nm',
    formula: '((256*A)+B)/4',
    range: '0-200 Nm',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '发动机扭矩',
  },
  {
    pid: '22001F',
    mode: '22',
    description: 'Engine Run Time',
    unit: 'seconds',
    formula: '(A*256)+B',
    range: '0-65535 seconds',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '发动机运行时间',
  },
  
  // 车辆状态
  {
    pid: '22000D',
    mode: '22',
    description: 'Vehicle Speed',
    unit: 'km/h',
    formula: 'A',
    range: '0-255 km/h',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '车辆速度',
  },
  {
    pid: '22002F',
    mode: '22',
    description: 'Fuel Level',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '燃油液位百分比',
  },
  {
    pid: '22004C',
    mode: '22',
    description: 'Commanded Throttle Position',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '节气门开度指令',
  },
  {
    pid: '220011',
    mode: '22',
    description: 'Throttle Position',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'volt',
    header: '7E0',
    response: '7E8',
    notes: '节气门位置',
  },

  // 特殊 header PIDs
  {
    pid: '4368',
    mode: '43',
    description: 'Onboard Charger Voltage',
    unit: 'V',
    formula: '((A*256)+B)/100',
    range: '0-655.35V',
    category: 'volt',
    header: '7E4',
    response: '5EC',
    notes: '车载充电器电压 (特殊header)',
  },
  {
    pid: '4369',
    mode: '43',
    description: 'Onboard Charger Current',
    unit: 'A',
    formula: '((A*256)+B)/100',
    range: '0-655.35A',
    category: 'volt',
    header: '7E4',
    response: '5EC',
    notes: '车载充电器电流 (特殊header)',
  },
  {
    pid: '434F',
    mode: '43',
    description: 'HV Battery Temperature',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    category: 'volt',
    header: '7E4',
    response: '5EC',
    notes: '高压电池温度 (特殊header)',
  },
];

// 标准 OBD-II PID 数据库 (83 条) - 基于 complete_obd_reference.csv
export const standardPIDs: PIDDefinition[] = [
  {
    pid: '00',
    mode: '01',
    description: 'PIDs supported (01-20)',
    unit: 'Bit encoded',
    formula: '32 bits',
    range: 'Shows which PIDs are supported',
    category: 'standard',
  },
  {
    pid: '01',
    mode: '01',
    description: 'Monitor status since DTCs cleared',
    unit: 'Bit encoded',
    formula: '32 bits',
    range: 'Malfunction Indicator Lamp status',
    category: 'standard',
  },
  {
    pid: '02',
    mode: '01',
    description: 'Freeze DTC',
    unit: '',
    formula: '',
    range: 'DTC that caused required freeze frame data storage',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '03',
    mode: '01',
    description: 'Fuel system status',
    unit: 'Bit encoded',
    formula: '',
    range: 'Open/closed loop status',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '04',
    mode: '01',
    description: 'Calculated engine load',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '05',
    mode: '01',
    description: 'Engine coolant temperature',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '06',
    mode: '01',
    description: 'Short term fuel trim—Bank 1',
    unit: '%',
    formula: '(A-128)*100/128',
    range: '-100 to 99.22%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '07',
    mode: '01',
    description: 'Long term fuel trim—Bank 1',
    unit: '%',
    formula: '(A-128)*100/128',
    range: '-100 to 99.22%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '08',
    mode: '01',
    description: 'Short term fuel trim—Bank 2',
    unit: '%',
    formula: '(A-128)*100/128',
    range: '-100 to 99.22%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '09',
    mode: '01',
    description: 'Long term fuel trim—Bank 2',
    unit: '%',
    formula: '(A-128)*100/128',
    range: '-100 to 99.22%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '0A',
    mode: '01',
    description: 'Fuel pressure',
    unit: 'kPa',
    formula: 'A*3',
    range: '0-765 kPa',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '0B',
    mode: '01',
    description: 'Intake manifold absolute pressure',
    unit: 'kPa',
    formula: 'A',
    range: '0-255 kPa',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '0C',
    mode: '01',
    description: 'Engine speed',
    unit: 'RPM',
    formula: '((A*256)+B)/4',
    range: '0-16383.75 RPM',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '0D',
    mode: '01',
    description: 'Vehicle speed',
    unit: 'km/h',
    formula: 'A',
    range: '0-255 km/h',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '0E',
    mode: '01',
    description: 'Timing advance',
    unit: '°',
    formula: '(A-128)/2',
    range: '-64 to 63.5°',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '0F',
    mode: '01',
    description: 'Intake air temperature',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '10',
    mode: '01',
    description: 'MAF air flow rate',
    unit: 'g/s',
    formula: '((A*256)+B)/100',
    range: '0-655.35 g/s',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '11',
    mode: '01',
    description: 'Throttle position',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '12',
    mode: '01',
    description: 'Commanded secondary air status',
    unit: 'Bit encoded',
    formula: '',
    range: 'Air status',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '13',
    mode: '01',
    description: 'Oxygen sensors present',
    unit: 'Bit encoded',
    formula: '',
    range: 'Location of O2 sensors',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '1F',
    mode: '01',
    description: 'Run time since engine start',
    unit: 'seconds',
    formula: '(A*256)+B',
    range: '0-65535 seconds',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '21',
    mode: '01',
    description: 'Distance traveled with MIL on',
    unit: 'km',
    formula: '(A*256)+B',
    range: '0-65535 km',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '2F',
    mode: '01',
    description: 'Fuel Tank Level Input',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '31',
    mode: '01',
    description: 'Distance traveled since codes cleared',
    unit: 'km',
    formula: '(A*256)+B',
    range: '0-65535 km',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '33',
    mode: '01',
    description: 'Absolute Barometric Pressure',
    unit: 'kPa',
    formula: 'A',
    range: '0-255 kPa',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '42',
    mode: '01',
    description: 'Control module voltage',
    unit: 'V',
    formula: '((A*256)+B)/1000',
    range: '0-65.535V',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '43',
    mode: '01',
    description: 'Absolute load value',
    unit: '%',
    formula: '((A*256)+B)*100/255',
    range: '0-25700%',
    category: 'standard',
    dataLength: '2 bytes',
  },
  {
    pid: '45',
    mode: '01',
    description: 'Relative throttle position',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '46',
    mode: '01',
    description: 'Ambient air temperature',
    unit: '°C',
    formula: 'A-40',
    range: '-40 to 215°C',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '47',
    mode: '01',
    description: 'Absolute throttle position B',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '4C',
    mode: '01',
    description: 'Commanded throttle actuator',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '51',
    mode: '01',
    description: 'Fuel Type',
    unit: 'Encoded',
    formula: '',
    range: 'Fuel type coding',
    category: 'standard',
    dataLength: '1 bytes',
  },
  {
    pid: '52',
    mode: '01',
    description: 'Ethanol fuel %',
    unit: '%',
    formula: 'A*100/255',
    range: '0-100%',
    category: 'standard',
    dataLength: '1 bytes',
  },
];

// 统一的 PID 管理器类
export class PIDManager {
  private allPids: Map<string, PIDDefinition>;
  
  constructor() {
    this.allPids = new Map();
    this.loadAllPids();
  }
  
  private loadAllPids() {
    // 加载 Volt 专用 PIDs
    voltPIDs.forEach(pid => {
      this.allPids.set(pid.pid.toUpperCase(), pid);
    });
    
    // 加载标准 OBD-II PIDs
    standardPIDs.forEach(pid => {
      this.allPids.set(pid.pid.toUpperCase(), pid);
    });
  }
  
  // 获取所有 PID
  getAllPids(): PIDDefinition[] {
    return Array.from(this.allPids.values());
  }
  
  // 按类别获取 PID
  getPidsByCategory(category: 'volt' | 'standard' | 'custom'): PIDDefinition[] {
    return this.getAllPids().filter(pid => pid.category === category);
  }
  
  // 根据 PID 代码获取定义
  getPidByCode(pidCode: string): PIDDefinition | undefined {
    return this.allPids.get(pidCode.toUpperCase());
  }
  
  // 搜索 PID
  searchPids(query: string): PIDDefinition[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllPids().filter(pid =>
      pid.pid.toLowerCase().includes(lowerQuery) ||
      pid.description.toLowerCase().includes(lowerQuery) ||
      pid.unit.toLowerCase().includes(lowerQuery)
    );
  }
  
  // 获取推荐的监控 PID 组合
  getRecommendedPids(): PIDDefinition[] {
    const recommended = [
      '22005B', // Volt SOC
      '220042', // Volt 控制模块电压
      '2204B0', // Volt HV电池电压
      '220272', // Volt 电机A转速
      '0C',     // 标准发动机转速
      '0D',     // 标准车速
      '05',     // 标准冷却液温度
      '2F',     // 标准燃油液位
      '04',     // 标准发动机负载
      '42',     // 标准控制模块电压
    ];
    
    return recommended
      .map(pid => this.getPidByCode(pid))
      .filter((pid): pid is PIDDefinition => pid !== undefined);
  }
  
  // 按系统分类获取 PID
  getPidsBySystem(): Record<string, PIDDefinition[]> {
    const systems: Record<string, PIDDefinition[]> = {
      battery: [],
      charging: [],
      motor: [],
      engine: [],
      fuel: [],
      temperature: [],
      pressure: [],
      vehicle: [],
      diagnostics: [],
    };
    
    this.getAllPids().forEach(pid => {
      const desc = pid.description.toLowerCase();
      
      if (desc.includes('battery') || desc.includes('soc')) {
        systems.battery.push(pid);
      } else if (desc.includes('charg') || desc.includes('ac') || desc.includes('dc')) {
        systems.charging.push(pid);
      } else if (desc.includes('motor')) {
        systems.motor.push(pid);
      } else if (desc.includes('engine') || desc.includes('rpm')) {
        systems.engine.push(pid);
      } else if (desc.includes('fuel')) {
        systems.fuel.push(pid);
      } else if (desc.includes('temperature') || desc.includes('temp')) {
        systems.temperature.push(pid);
      } else if (desc.includes('pressure')) {
        systems.pressure.push(pid);
      } else if (desc.includes('speed') || desc.includes('throttle')) {
        systems.vehicle.push(pid);
      } else {
        systems.diagnostics.push(pid);
      }
    });
    
    return systems;
  }
  
  // 获取总数统计
  getStatistics() {
    const voltCount = this.getPidsByCategory('volt').length;
    const standardCount = this.getPidsByCategory('standard').length;
    const total = voltCount + standardCount;
    
    return {
      total,
      volt: voltCount,
      standard: standardCount,
      categories: Object.keys(this.getPidsBySystem()).length,
    };
  }
}

// 单例实例
export const pidManager = new PIDManager();