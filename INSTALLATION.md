# VoltMonitor 安装指南

## 系统要求

### 硬件要求
- **macOS 10.15+** (当前版本针对 macOS 优化)
- **4GB RAM** 推荐
- **蓝牙 4.0+** 支持
- **ELM327 蓝牙 OBD-II 适配器**

### 软件依赖
- **Node.js 18+**
- **npm 或 yarn**
- **Git**

## 快速安装

### 1. 克隆项目
```bash
git clone <repository-url>
cd VoltMonitor
```

### 2. 安装依赖
```bash
# 如遇到依赖冲突，使用以下命令之一：
npm install --legacy-peer-deps
# 或
npm install --force
```

### 3. 启动开发环境
```bash
npm run dev
```

## 构建和打包

### 开发构建
```bash
npm run build
```

### 生产打包
```bash
npm run package
```

这将生成 macOS 应用程序包，可在 Finder 中直接运行。

## 常见问题解决

### 依赖安装失败
如果遇到 `ERESOLVE` 错误：
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### 蓝牙连接问题
1. 确保 macOS 蓝牙已启用
2. OBD-II 适配器处于配对模式
3. 车辆点火开关打开 (ON 位置)
4. 检查 OBD-II 端口连接

### Electron 启动失败
```bash
# 重新安装 Electron
npm install electron@latest --save-dev
```

## 硬件设置

### OBD-II 适配器推荐
- **BAFX Products 34t5 Bluetooth OBDII**
- **OBDLink MX+**  
- **ELM327 v2.1** (确保正品)

### 连接步骤
1. 将 ELM327 适配器插入车辆 OBD-II 端口
2. 车辆点火至 ON 位置（无需启动）
3. 在 VoltMonitor 中点击"Scan"扫描设备
4. 选择对应设备并点击"Connect"

## Chevrolet Volt 兼容性

### 支持车型年份
- **2011-2019 Chevrolet Volt** (第一代和第二代)
- **Volt 专用 PID** 在所有年份中可能有差异
- **标准 OBD-II PID** 普遍兼容

### 注意事项
- 部分 Volt 专用 PID 可能需要特定的诊断模式
- 建议在安全环境下进行首次连接测试
- 某些参数可能需要车辆在特定状态下才能读取

## 开发环境配置

### TypeScript 配置
项目包含完整的 TypeScript 配置：
- `tsconfig.json` - React 前端配置
- `electron/tsconfig.json` - Electron 后端配置

### 调试模式
```bash
# 启用详细日志
npm run dev -- --verbose

# 打开开发者工具
# 在应用中按 Cmd+Option+I (macOS)
```

### 数据库
应用使用 SQLite 本地数据库，位置：
- **macOS**: `~/Library/Application Support/VoltMonitor/volt_data.db`

## 故障排除

### 数据不更新
1. 检查 OBD-II 连接状态
2. 验证车辆点火状态
3. 确认适配器兼容性
4. 查看应用日志输出

### 性能问题
- 调整设置中的"更新间隔"
- 减少"最大历史点数"
- 关闭不需要的图表显示

### 权限问题
确保应用具有以下权限：
- 蓝牙访问权限
- 文件系统读写权限

## 更新和维护

### 更新应用
```bash
git pull origin main
npm install --legacy-peer-deps
npm run build
```

### 清理缓存
```bash
rm -rf node_modules package-lock.json dist/
npm install --legacy-peer-deps
```

### 数据备份
重要数据位置：
- **历史数据**: SQLite 数据库文件
- **设置配置**: 应用配置文件
- **收藏的 PID**: 用户偏好设置

---

如有其他问题，请查看项目 `docs/` 目录中的详细文档或提交 Issue。