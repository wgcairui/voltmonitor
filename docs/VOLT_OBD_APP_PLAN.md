# 雪佛兰 Volt OBD 监控应用开发计划

## 📋 项目概述

**应用名称**: VoltMonitor  
**技术栈**: Electron + React + Ant Design + TypeScript  
**目标平台**: macOS (初期)  
**OBD 连接**: 蓝牙 ELM327 适配器  
**核心库**: obd-node  
**数据源**: 
- 雪佛兰 Volt 专用 PID 数据库 (52 条)
- 通用 OBD-II 标准 PID 数据库 (83 条)
- 支持自定义 PID 扩展  

## 🎯 核心功能设计

### 1. 连接管理模块
- **蓝牙设备扫描**: 自动发现附近的 OBD 蓝牙设备
- **连接状态监控**: 实时显示连接状态，支持自动重连
- **设备配置**: 保存常用设备，快速连接历史记录
- **连接诊断**: 连接问题排查和解决建议

### 2. 实时监控仪表盘
- **Volt 专用指标**: 电池 SOC、HV电压电流、双电机转速扭矩、充电功率
- **标准 OBD 参数**: 发动机转速、车速、冷却液温度、燃油液位
- **综合监控**: 83 个标准 OBD-II 参数 + 52 个 Volt 专用参数
- **智能切换**: 根据车辆状态自动显示相关参数
- **自定义布局**: 拖拽式仪表盘，支持混合显示标准和专用参数

### 3. 数据记录与分析
- **历史数据**: SQLite 本地数据库存储
- **趋势分析**: 电池健康度、充电效率趋势
- **报告生成**: PDF/Excel 导出功能
- **数据同步**: 可选云端备份

### 4. 告警系统
- **智能告警**: 电池温度过高、电压异常等
- **自定义阈值**: 用户可设定告警条件
- **通知推送**: macOS 系统通知集成
- **告警历史**: 记录和分析告警事件

## 🏗️ 技术架构

### 前端架构
```
src/
├── components/           # React 组件
│   ├── Dashboard/       # 仪表盘组件
│   ├── Connection/      # 连接管理
│   ├── Charts/         # 图表组件
│   └── Settings/       # 设置页面
├── hooks/              # 自定义 Hooks
├── services/           # 业务逻辑层
│   ├── obdService.ts   # OBD 通信服务
│   ├── dataService.ts  # 数据处理服务
│   ├── voltPids.ts     # Volt 专用 PID 定义
│   ├── standardPids.ts # 标准 OBD-II PID 定义
│   └── pidManager.ts   # 统一 PID 管理器
├── store/              # Redux/Zustand 状态管理
├── utils/              # 工具函数
└── types/              # TypeScript 类型定义
```

### 后端架构 (Electron Main Process)
```
electron/
├── main.ts             # 主进程入口
├── services/
│   ├── bluetooth.ts    # 蓝牙管理
│   ├── database.ts     # SQLite 数据库
│   └── fileSystem.ts   # 文件操作
├── ipc/               # 进程间通信
└── menu/              # 应用菜单
```

## 🔧 技术实现详情

### 1. 统一 PID 管理系统
```typescript
// 统一的 PID 管理器，整合所有数据源
import { voltPids } from './voltPids';
import { standardPids } from './standardPids';

interface PIDDefinition {
  pid: string;
  mode: string;
  description: string;
  unit: string;
  formula: string;
  category: 'volt' | 'standard' | 'custom';
  header?: string;
  response?: string;
}

class PIDManager {
  private allPids: Map<string, PIDDefinition> = new Map();
  
  constructor() {
    this.loadAllPids();
  }
  
  private loadAllPids() {
    // 加载 Volt 专用 PIDs (52 条)
    voltPids.forEach(pid => {
      this.allPids.set(pid.pid, { ...pid, category: 'volt' });
    });
    
    // 加载标准 OBD-II PIDs (83 条)
    standardPids.forEach(pid => {
      this.allPids.set(pid.pid, { ...pid, category: 'standard' });
    });
  }
  
  // 获取所有可用 PID
  getAllPids(): PIDDefinition[] {
    return Array.from(this.allPids.values());
  }
  
  // 按类别获取 PID
  getPidsByCategory(category: string): PIDDefinition[] {
    return this.getAllPids().filter(pid => pid.category === category);
  }
  
  // 获取推荐的监控 PID 组合
  getRecommendedPids(): PIDDefinition[] {
    const recommended = [
      '22005B', // Volt SOC
      '220042', // Volt 控制模块电压
      '2204B0', // Volt HV电池电压
      '0C',     // 标准发动机转速
      '0D',     // 标准车速
      '05',     // 标准冷却液温度
      '2F',     // 标准燃油液位
    ];
    
    return recommended.map(pid => this.allPids.get(pid)).filter(Boolean);
  }
}

// OBD 服务集成双数据源
class VoltOBDService {
  private client: OBD2Client;
  private pidManager = new PIDManager();
  
  async connectBluetooth(deviceAddress: string) {
    this.client = new OBD2Client({
      type: 'bluetooth',
      address: deviceAddress
    });
    
    await this.client.connect();
    return this.initializeAllPIDs();
  }
  
  // 初始化所有 PID 定义
  initializeAllPIDs() {
    const allPids = this.pidManager.getAllPids();
    
    allPids.forEach(pidDef => {
      this.client.addCustomCommand(pidDef.description, {
        pid: pidDef.pid,
        mode: pidDef.mode,
        decoder: this.createDecoder(pidDef.formula),
        unit: pidDef.unit,
        header: pidDef.header || '7E0'
      });
    });
  }
  
  // 动态公式解码器
  createDecoder(formula: string) {
    return (data: number[]) => {
      const A = data[0] || 0;
      const B = data[1] || 0;
      const C = data[2] || 0;
      const D = data[3] || 0;
      
      try {
        // 使用安全的公式解析
        return this.evaluateFormula(formula, { A, B, C, D });
      } catch (error) {
        console.error('PID decode error:', error);
        return 0;
      }
    };
  }
}
```

### 2. 实时数据流
```typescript
// 使用 React Hooks 管理实时数据
const useVoltData = () => {
  const [data, setData] = useState<VoltData>({});
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(async () => {
      if (isConnected) {
        const newData = await obdService.getAllVoltData();
        setData(newData);
      }
    }, 1000); // 1秒更新一次
    
    return () => clearInterval(interval);
  }, [isConnected]);
  
  return { data, isConnected };
};
```

### 3. 增强 UI 组件设计 (双数据源支持)
```typescript
// 统一仪表盘组件，集成双数据源
const EnhancedDashboard: React.FC = () => {
  const { voltData, standardData } = useUnifiedOBDData();
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div>
      {/* 顶部标签切换 */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="综合概览" key="overview">
          <Row gutter={[16, 16]}>
            {/* Volt 专用数据 */}
            <Col span={12}>
              <Card title="🔋 电池系统 (Volt 专用)" className="volt-card">
                <Progress 
                  type="circle" 
                  percent={voltData.soc} 
                  format={percent => `${percent}%`}
                />
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="HV电压" value={voltData.hvVoltage} suffix="V" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="HV电流" value={voltData.hvCurrent} suffix="A" />
                  </Col>
                </Row>
                <Statistic title="电池温度" value={voltData.batteryTemp} suffix="°C" />
              </Card>
            </Col>
            
            {/* 标准 OBD 数据 */}
            <Col span={12}>
              <Card title="🚗 标准参数 (OBD-II)" className="standard-card">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="发动机转速" value={standardData.engineRPM} suffix="RPM" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="车速" value={standardData.speed} suffix="km/h" />
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="冷却液温度" value={standardData.coolantTemp} suffix="°C" />
                  </Col>
                  <Col span={12}>
                    <Statistic title="燃油液位" value={standardData.fuelLevel} suffix="%" />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          
          {/* 混合显示区域 */}
          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col span={8}>
              <Card title="⚡ 电机状态">
                <Gauge value={voltData.motorARPM} title="电机A" unit="RPM" />
                <Gauge value={voltData.motorBRPM} title="电机B" unit="RPM" />
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="🔌 充电状态">
                <Statistic title="充电功率" value={voltData.chargingPower} suffix="kW" />
                <Statistic title="充电电压" value={voltData.chargeVoltage} suffix="V" />
                <Statistic title="充电电流" value={voltData.chargeCurrent} suffix="A" />
              </Card>
            </Col>
            
            <Col span={8}>
              <Card title="📊 综合信息">
                <Statistic title="发动机负载" value={standardData.engineLoad} suffix="%" />
                <Statistic title="节气门位置" value={standardData.throttlePos} suffix="%" />
                <Statistic title="进气温度" value={standardData.intakeTemp} suffix="°C" />
              </Card>
            </Col>
          </Row>
        </TabPane>
        
        <TabPane tab="Volt 专用" key="volt">
          <VoltSpecificView data={voltData} />
        </TabPane>
        
        <TabPane tab="标准 OBD" key="standard">
          <StandardOBDView data={standardData} />
        </TabPane>
        
        <TabPane tab="PID 浏览器" key="browser">
          <PIDBrowser />
        </TabPane>
      </Tabs>
    </div>
  );
};

// PID 浏览器组件 - 显示所有 135 个 PID
const PIDBrowser: React.FC = () => {
  const { allPids } = usePIDManager();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPids = allPids.filter(pid => {
    const matchCategory = selectedCategory === 'all' || pid.category === selectedCategory;
    const matchSearch = pid.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });
  
  return (
    <div>
      {/* 过滤器 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Select 
            style={{ width: '100%' }}
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            <Option value="all">全部 PID ({allPids.length})</Option>
            <Option value="volt">Volt 专用 (52)</Option>
            <Option value="standard">标准 OBD-II (83)</Option>
          </Select>
        </Col>
        <Col span={16}>
          <Input 
            placeholder="搜索 PID 描述..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
          />
        </Col>
      </Row>
      
      {/* PID 列表 */}
      <Table
        dataSource={filteredPids}
        columns={[
          { title: 'PID', dataIndex: 'pid', width: 80 },
          { title: '描述', dataIndex: 'description', ellipsis: true },
          { title: '单位', dataIndex: 'unit', width: 60 },
          { title: '类型', dataIndex: 'category', width: 80, 
            render: (category) => (
              <Tag color={category === 'volt' ? 'blue' : 'green'}>
                {category === 'volt' ? 'VOLT' : 'OBD-II'}
              </Tag>
            )
          },
          { title: '实时值', width: 100,
            render: (_, record) => (
              <LiveValue pidCode={record.pid} />
            )
          }
        ]}
        size="small"
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
};
```

## 📱 用户界面设计

### 主界面布局
```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] VoltMonitor    [连接状态] [PID统计: 135] [设置] [帮助] │
├─────────────────────────────────────────────────────────────┤
│ 侧边栏导航                    │ 主内容区域                    │
│ ┌─ 📊 综合仪表盘            │ ┌───────────────────────────┐ │
│ ├─ 🔋 电池监控 (Volt)      │ │ 📋 [综合概览] [Volt专用]  │ │
│ ├─ ⚡ 电机性能 (Volt)      │ │     [标准OBD] [PID浏览器] │ │
│ ├─ 🔌 充电状态 (Volt)      │ ├───────────────────────────┤ │
│ ├─ 🚗 标准OBD监控          │ │                           │ │
│ ├─ 📈 历史数据分析          │ │   混合数据显示区域        │ │
│ ├─ ⚠️  告警中心            │ │   Volt (52) + OBD (83)   │ │
│ ├─ 🔍 PID浏览器           │ │                           │ │
│ └─ ⚙️  设置               │ └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 页面功能分布 (增强版 - 双数据源)

1. **📊 综合仪表盘页面**
   - **混合显示**: Volt 专用 + 标准 OBD 参数
   - **智能布局**: 根据车辆状态自动调整显示优先级
   - **快速切换**: 四个标签页 (综合概览/Volt专用/标准OBD/PID浏览器)
   - **实时监控**: 135 个参数的实时更新

2. **🔋 电池监控页面 (Volt 专用 + 标准)**
   - **Volt 数据**: SOC、HV电压电流、电池温度 (52个专用PID)
   - **标准数据**: 控制模块电压、运行时间 (相关OBD-II PID)
   - **混合分析**: 电池健康度综合评估
   - **温度监控**: 多传感器温度热力图

3. **⚡ 电机性能页面 (Volt 专用 + 发动机)**
   - **双电机监控**: A/B 电机转速扭矩对比 (Volt PID)
   - **发动机数据**: RPM、负载、扭矩 (标准 OBD-II)
   - **动力分析**: 电机+发动机综合性能曲线
   - **效率计算**: 基于双数据源的效率分析

4. **🔌 充电状态页面 (Volt 专用)**
   - **充电监控**: AC/DC 电压电流、功率 (8个充电PID)
   - **充电曲线**: 实时充电过程可视化
   - **历史记录**: 充电效率趋势分析
   - **智能提醒**: 充电异常检测

5. **🚗 标准OBD监控页面**
   - **83个标准参数**: 完整的 OBD-II 监控
   - **分类显示**: 发动机、燃油、排放、传感器等
   - **故障诊断**: DTC 代码读取和分析
   - **兼容性监控**: 标准OBD支持状态

6. **🔍 PID浏览器页面 (NEW)**
   - **全参数浏览**: 135个PID的完整列表
   - **智能搜索**: 按描述、类别、PID代码搜索
   - **实时值显示**: 每个PID的当前值
   - **自定义监控**: 选择任意PID加入监控列表

7. **📈 历史数据分析页面 (增强)**
   - **双源数据**: Volt + 标准 OBD 历史趋势
   - **关联分析**: 跨数据源的参数关联性分析
   - **智能报告**: 基于135个参数的综合报告
   - **导出功能**: Excel/CSV 包含完整数据源标注

## 🔄 开发阶段规划

### Phase 1: 基础框架 (1-2周)
- [x] Electron + React 项目搭建
- [x] Ant Design 集成和主题配置
- [x] 基础路由和布局结构
- [x] TypeScript 类型定义
- [x] obd-node 库集成测试

### Phase 2: OBD 连接 (1-2周)
- [x] 蓝牙设备扫描功能
- [x] OBD 连接管理
- [x] Volt 自定义 PID 实现
- [x] 连接状态监控
- [x] 错误处理和重连机制

### Phase 3: 核心功能 (2-3周)
- [x] 实时数据获取和展示
- [x] 仪表盘组件开发
- [x] 数据可视化图表
- [x] 本地数据存储 (SQLite)
- [x] 基础告警系统

### Phase 4: 高级功能 (2-3周)
- [x] 历史数据分析
- [x] 趋势图表和报告
- [x] 自定义仪表盘
- [x] 数据导出功能
- [x] 用户设置和偏好

### Phase 5: 优化和发布 (1周)
- [x] 性能优化
- [x] UI/UX 改进
- [x] 错误处理完善
- [x] 打包和分发准备
- [x] 用户文档编写

## 📦 依赖包清单

### 主要依赖
```json
{
  "dependencies": {
    "electron": "^latest",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "antd": "^5.0.0",
    "obd-node": "^latest",
    "@ant-design/icons": "^5.0.0",
    "recharts": "^2.8.0",
    "sqlite3": "^5.1.0",
    "zustand": "^4.4.0",
    "dayjs": "^1.11.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

## ⚠️ 技术挑战和解决方案

### 1. 蓝牙连接稳定性
**挑战**: macOS 蓝牙权限，连接断线处理  
**方案**: 实现自动重连机制，用户友好的权限申请流程

### 2. 实时数据性能
**挑战**: 高频数据更新可能影响界面性能  
**方案**: 使用 React.memo, useMemo 优化渲染，数据节流

### 3. 自定义 PID 支持  
**挑战**: obd-node 库对 Volt 专用 PID 的支持  
**方案**: 扩展库功能，实现自定义 PID 解码器

### 4. 数据准确性
**挑战**: 确保 PID 数据解析的准确性  
**方案**: 基于社区验证的公式，提供数据校准功能

## 🎯 成功标准 (增强版)

- ✅ 稳定连接蓝牙 OBD 设备
- ✅ 实时显示 **135 个参数** (52 Volt 专用 + 83 标准 OBD-II)
- ✅ **双数据源无缝集成** - 统一界面显示混合数据  
- ✅ **智能PID管理** - 自动识别和分类不同类型参数
- ✅ 响应式和直观的用户界面
- ✅ **PID浏览器** - 完整的参数探索和自定义监控
- ✅ 可靠的数据记录和分析功能
- ✅ **跨数据源关联分析** - 发现 Volt 专用与标准参数的关系
- ✅ 智能告警和通知系统
- ✅ 良好的错误处理和用户体验

## 🌟 双数据源集成优势

### 📊 数据完整性
- **完整覆盖**: 52 + 83 = 135 个监控参数
- **无盲点监控**: Volt 专用系统 + 标准车辆系统
- **数据验证**: 双源交叉验证，提高数据准确性

### 🔍 深度分析能力  
- **关联分析**: 电池状态与发动机性能的关系
- **综合诊断**: 结合专用和标准参数的故障诊断
- **趋势预测**: 基于更全面数据的预测分析

### 💡 用户价值
- **专业级监控**: 媲美专业诊断工具的功能
- **学习价值**: 了解混合动力车辆的完整工作原理  
- **维护指导**: 基于全面数据的维护建议
- **故障排查**: 更精准的问题定位和解决方案

### 🚀 技术创新
- **首创集成**: 首个集成 Volt 专用 + 标准 OBD 的监控应用
- **智能 PID 管理**: 动态加载和管理不同类型 PID
- **统一数据流**: 无缝整合两套完全不同的数据源

## 💰 预估工作量

**总开发时间**: 8-12 周  
**核心功能**: 6-8 周  
**测试优化**: 2-4 周  

这个计划为您提供了一个功能完整、技术先进的雪佛兰 Volt OBD 监控应用。请 review 这个计划，我可以根据您的反馈进行调整和补充！