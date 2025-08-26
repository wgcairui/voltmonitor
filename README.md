# VoltMonitor

🚗⚡ **Chevrolet Volt OBD-II Monitor** - 专为雪佛兰 Volt 混合动力车型设计的实时 OBD 数据监控应用

## 项目特色

### 📊 双数据源架构
- **52 个 Volt 专用 PID** - 电池、电机、充电系统监控
- **83 个标准 OBD-II PID** - 引擎、燃油、温度等传统参数
- **总计 135 个参数** - 全面的车辆诊断覆盖

### 🔧 技术栈
- **Electron** - 跨平台桌面应用框架
- **React 18** + **TypeScript** - 现代前端技术栈
- **Ant Design** - 企业级 UI 组件库
- **Zustand** - 轻量级状态管理
- **Recharts** - 数据可视化图表库
- **SQLite** - 本地数据持久化

### 🎯 核心功能

#### 1. 实时仪表盘 (`/`)
- 混合 Volt + 标准 OBD 数据展示
- 电池 SOC、高压电压/电流监控
- 双电机转速/扭矩显示
- 实时图表：电压、电流、温度趋势

#### 2. Volt 专用监控 (`/volt`)
- 52 个 Volt 特有参数
- 电池管理系统数据
- 充电功率和状态
- 热管理系统监控
- 电机控制单元数据

#### 3. 标准 OBD 监控 (`/standard`) 
- 83 个标准 OBD-II 参数
- 引擎性能指标
- 燃油系统状态
- 排放控制数据
- 传感器读数

#### 4. PID 浏览器 (`/browser`)
- 135 个参数的完整数据库
- 实时数据搜索和过滤
- 收藏夹功能
- 分类标签和状态指示
- 数据导出功能

#### 5. 智能连接管理
- 蓝牙 OBD 设备自动扫描
- 设备状态实时显示
- 连接质量监控
- 自动重连功能

## 🗂 项目结构

```
VoltMonitor/
├── electron/                 # Electron 主进程
│   ├── main.ts              # 应用入口和窗口管理
│   ├── preload.ts           # 安全的 IPC 接口
│   └── services/            # 后端服务
│       ├── bluetooth.ts     # 蓝牙 OBD 连接
│       └── database.ts      # SQLite 数据管理
├── src/                     # React 前端源码
│   ├── components/          # UI 组件
│   │   ├── Dashboard/       # 仪表盘组件
│   │   ├── VoltMonitor/     # Volt 专用界面
│   │   ├── StandardOBD/     # 标准 OBD 界面
│   │   ├── PIDBrowser/      # PID 浏览器
│   │   ├── Connection/      # 连接管理
│   │   └── Settings/        # 设置界面
│   ├── services/            # 前端服务
│   │   └── pidDatabase.ts   # PID 数据库 (135个参数)
│   ├── store/               # 状态管理
│   │   └── appStore.ts      # Zustand 全局状态
│   └── types/               # TypeScript 类型定义
└── public/                  # 静态资源
```

## 🔌 硬件要求

### OBD-II 适配器
- **ELM327 蓝牙适配器** (推荐)
- 支持 ISO 15765-4 (CAN) 协议
- 兼容 Chevrolet Volt (2011-2019)

### 系统要求
- **macOS 10.15+** (当前版本专为 macOS 优化)
- 蓝牙 4.0+ 支持
- 2GB RAM 最低要求

## 🚀 安装和运行

### 开发环境
```bash
# 安装依赖 (需要解决依赖冲突)
npm install --legacy-peer-deps

# 启动开发服务器
npm run dev

# 构建应用
npm run build

# 打包应用
npm run package
```

### 生产部署
```bash
# 构建并打包为 macOS 应用
npm run build
npm run package
```

## 📱 界面预览

### 主仪表盘
- 实时显示电池 SOC、高压系统状态
- 双电机性能监控
- 多图表数据可视化

### Volt 专用界面
- 52 个 Volt 特有参数表格
- 电池温度、充电功率监控
- 电机扭矩/转速实时显示

### PID 浏览器
- 135 个参数的完整列表
- 智能搜索和过滤
- 实时数据更新指示

## 🔧 关键技术实现

### 1. PID 数据库架构
```typescript
// Volt 专用 PID (52个)
export const voltPIDs: PIDDefinition[] = [
  {
    pid: '22005B',
    description: 'Battery SOC',
    unit: '%',
    category: 'volt',
    formula: 'A*100/255'
  },
  // ... 52 个 Volt 专用 PID
];

// 标准 OBD-II PID (83个)  
export const standardPIDs: PIDDefinition[] = [
  {
    pid: '0C',
    description: 'Engine RPM', 
    unit: 'rpm',
    category: 'standard',
    formula: '((A*256)+B)/4'
  },
  // ... 83 个标准 PID
];
```

### 2. 实时数据流管理
```typescript
// Zustand 状态管理
export const useAppStore = create<AppState & AppActions>()(
  devtools((set, get) => ({
    // 实时 PID 数据更新
    updatePIDValue: (pid: string, result: PIDResult) => {
      set({
        currentPIDValues: {
          ...get().currentPIDValues,
          [pid]: result
        }
      });
    },
    // ... 其他状态管理逻辑
  }))
);
```

### 3. 蓝牙连接模拟
```typescript
// 开发环境模拟数据生成
simulatePIDData: () => {
  const randomPIDs = allPIDs
    .sort(() => 0.5 - Math.random())
    .slice(0, 8); // 模拟同时读取 8 个 PID
    
  randomPIDs.forEach(pidDef => {
    const mockValue = generateMockValue(pidDef);
    updatePIDValue(pidDef.pid, {
      pid: pidDef.pid,
      value: mockValue,
      timestamp: Date.now()
    });
  });
};
```

## 🎯 开发状态

✅ **已完成核心功能:**
- [x] Electron + React + TypeScript 项目架构
- [x] 135 个 PID 参数数据库 (52 Volt + 83 Standard)
- [x] Zustand 全局状态管理
- [x] 5 个主要 UI 界面组件
- [x] 蓝牙连接管理界面
- [x] 实时数据可视化图表
- [x] PID 浏览器和搜索功能
- [x] 设置和配置界面

🔄 **待优化功能:**
- [ ] 实际 obd-node 库集成
- [ ] 数据导出功能实现
- [ ] 告警阈值配置
- [ ] 历史数据分析

## 🎨 设计亮点

### macOS 原生体验
- 自定义标题栏设计
- 系统级菜单集成
- 原生窗口控制按钮

### 响应式布局
- 移动端友好设计
- 自适应网格布局
- 智能组件折叠

### 数据可视化
- Recharts 实时图表
- 多维度数据展示
- 交互式数据探索

## 📄 License

MIT License - 开源项目，欢迎贡献代码

---

**VoltMonitor** - 为 Chevrolet Volt 车主打造的专业 OBD-II 监控解决方案 ⚡🚗# voltmonitor
