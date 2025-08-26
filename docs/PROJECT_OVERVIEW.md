# VoltMonitor Project Overview

## 项目发展历程

### 阶段一：OBD 数据提取工具开发
1. **obd_extractor.py** - 基础 OBD 命令提取工具
2. **enhanced_obd_extractor.py** - 增强版，内置 83 个标准 OBD-II PID 参考
3. **complete_obd_reference.csv** - 生成的完整标准 OBD 参考数据

### 阶段二：Chevrolet Volt 专用 PID 研究
1. **chevrolet_volt_pids.py** - 52 个 Volt 专用 PID 数据库
2. 输出格式：
   - **chevrolet_volt_pids.csv** - CSV 格式
   - **chevrolet_volt_pids.json** - JSON 格式  
   - **volt_torque_pids.csv** - Torque Pro 兼容格式

### 阶段三：VoltMonitor 应用开发
完整的 Electron + React + TypeScript 应用，整合双数据源架构：
- **52 个 Volt 专用 PID** + **83 个标准 OBD-II PID** = **135 个参数**

## 核心数据源

### Volt 专用 PID (52个)
关键参数包括：
- `22005B` - Battery SOC (电池电量)
- `2204B0` - HV Battery Voltage (高压电池电压)
- `2204AF` - HV Battery Current (高压电池电流)
- `220425/220426` - Battery Temperature Max/Min (电池温度)
- `220272/220274` - Motor A/B RPM (电机转速)
- `220273/220275` - Motor A/B Torque (电机扭矩)
- `2243A5` - Charging Power (充电功率)
- `224372-224375` - AC/DC Charging Voltage/Current (充电电压电流)

### 标准 OBD-II PID (83个)
包含完整的标准诊断参数：
- 引擎性能 (RPM, Load, Throttle Position)
- 燃油系统 (Fuel Level, Fuel Pressure, MAF Flow)
- 温度监控 (Coolant, Intake Air Temperature)
- 压力传感器 (Manifold Pressure, Fuel Pressure)
- 排放控制和其他诊断参数

## 技术架构

### 前端技术栈
- **React 18** + **TypeScript**
- **Ant Design** - UI 组件库
- **Zustand** - 状态管理
- **Recharts** - 数据可视化
- **Vite** - 构建工具

### 后端服务
- **Electron** - 桌面应用框架
- **SQLite** - 本地数据库
- **蓝牙连接管理** - OBD-II 设备通信
- **实时数据处理** - PID 解析和存储

### 核心功能模块
1. **Dashboard** - 混合数据实时仪表盘
2. **VoltMonitor** - Volt 专用参数监控
3. **StandardOBD** - 标准 OBD-II 参数
4. **PIDBrowser** - 135 参数完整浏览
5. **ConnectionPanel** - 蓝牙设备管理
6. **Settings** - 应用配置管理

## 文档结构

```
docs/
├── PROJECT_OVERVIEW.md          # 项目总览 (本文档)
├── VOLT_OBD_APP_PLAN.md        # 原始应用开发计划
├── ENHANCED_OBD_USAGE.md       # OBD 工具使用指南
├── UPDATED_APP_FEATURES.md     # 应用功能更新说明
├── CHEVROLET_VOLT_PIDS_GUIDE.md # Volt PID 参数指南
├── OBD_EXTRACTOR_README.md     # 提取工具说明
├── 
├── # 数据工具
├── obd_extractor.py            # 基础 OBD 提取工具
├── enhanced_obd_extractor.py   # 增强版提取工具
├── chevrolet_volt_pids.py      # Volt PID 数据库生成器
├── 
├── # 参考数据
├── complete_obd_reference.csv  # 83个标准 OBD-II PID
├── chevrolet_volt_pids.csv     # 52个 Volt 专用 PID (CSV)
├── chevrolet_volt_pids.json    # 52个 Volt 专用 PID (JSON)
├── volt_torque_pids.csv        # Torque Pro 兼容格式
├── sample_obd_commands.csv     # 示例 OBD 命令
├── sample_obd_commands.json    # 示例 OBD 命令 (JSON)
├── complete_obd_reference.json # 完整 OBD 参考 (JSON)
└── requirements_obd.txt        # Python 依赖清单
```

## 开发成就

### ✅ 已完成功能
- [x] 双数据源 PID 数据库 (135 个参数)
- [x] 完整的 Electron + React 应用架构
- [x] 实时数据可视化和监控界面
- [x] 蓝牙 OBD 设备连接管理
- [x] 历史数据存储和图表显示
- [x] PID 参数搜索和浏览功能
- [x] 应用设置和配置管理
- [x] macOS 原生体验优化

### 🔄 待优化功能
- [ ] 实际 obd-node 库集成测试
- [ ] 数据导出功能完善
- [ ] 告警阈值和通知系统
- [ ] 移动端适配
- [ ] 多语言支持

## 使用场景

### 目标用户
- **Chevrolet Volt 车主** - 深度了解混合动力系统状态
- **汽车爱好者** - 实时监控车辆性能数据
- **技术人员** - 专业诊断和故障排除
- **研发人员** - 混合动力技术研究

### 应用价值
- **实时监控** - 135 个参数的全面覆盖
- **专业诊断** - Volt 专用参数深度分析
- **数据可视化** - 直观的图表和趋势显示
- **历史追踪** - 长期性能数据记录
- **开源免费** - 完全开放的技术方案

---

**VoltMonitor** 项目展示了从数据提取、处理到可视化的完整技术栈实现，为 Chevrolet Volt 混合动力车提供了专业级的 OBD-II 监控解决方案。