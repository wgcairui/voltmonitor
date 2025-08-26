# 增强版 OBD 查询指令提取工具使用指南

## 🎯 解决您的 Google Drive 文档问题

由于技术限制无法直接访问您的 Google Drive 文档，但这个增强版工具提供了完美的解决方案：

### ⭐ 主要特色

1. **内置完整 OBD-II 参考库** - 包含 80+ 个常见 PID (00-52)
2. **智能文档解析** - 从您的文档中提取额外的 PID
3. **自动数据补全** - 结合参考数据补充缺失信息
4. **多种输出格式** - CSV、Excel、JSON

## 🚀 使用方法

### 方法 1：处理您的 Google Drive 文档

```bash
# 1. 将您的 Google Drive 文档内容复制到文本文件
# 2. 运行增强版提取工具
python3 enhanced_obd_extractor.py your_document.txt

# 工具会：
# - 提取文档中的所有 PID
# - 自动补全参考数据中的信息
# - 询问是否添加未找到的常见 PID
```

### 方法 2：直接导出所有常见 PID

```bash
# 导出所有常见的 OBD-II PID 参考数据
python3 enhanced_obd_extractor.py -r

# 或者指定输出格式
python3 enhanced_obd_extractor.py -r -f all -o complete_obd_reference
```

### 方法 3：无输入文件时自动使用参考数据

```bash
# 不指定输入文件，直接导出参考数据
python3 enhanced_obd_extractor.py -o my_obd_pids -f excel
```

## 📊 输出数据包含

| 字段 | 说明 | 示例 |
|------|------|------|
| PID | 参数标识符 | 0C, 1F, 42 |
| Mode | 服务模式 | 01 |
| Description | 参数描述 | Engine speed, Run time since engine start |
| Data Length | 数据长度 | 2 bytes, 4 bytes |
| Unit | 单位 | RPM, °C, %, V |
| Formula | 计算公式 | ((A*256)+B)/4, A-40 |
| Range | 取值范围 | 0-16383.75 RPM, -40 to 215°C |
| Min Value | 最小值 | 0, -40 |
| Max Value | 最大值 | 16383.75, 215 |
| Notes | 备注信息 | 其他说明 |

## 🔧 命令参数

```bash
python3 enhanced_obd_extractor.py [选项] [输入文件]

选项:
  -o OUTPUT     输出文件名（不含扩展名）
  -f FORMAT     输出格式: csv, excel, json, all
  -r            仅导出参考数据（忽略输入文件）
  -h            显示帮助信息
```

## 📈 内置参考数据涵盖

- **PID 00-52**: 标准 OBD-II 参数
- **引擎参数**: RPM, 负载, 温度, 压力
- **燃油系统**: 燃油修正, 燃油压力, 油位
- **传感器数据**: 氧传感器, MAF, 节气门位置
- **排放系统**: EGR, 催化转换器温度
- **诊断信息**: DTC, 监控状态

## 💡 使用技巧

1. **处理您的文档**：
   - 将 Google Drive 文档内容全选复制
   - 粘贴到记事本并另存为 UTF-8 格式的 .txt 文件
   - 运行工具处理

2. **获取完整数据**：
   - 工具会自动询问是否添加常见 PID
   - 选择"是"获得最完整的数据集

3. **选择合适格式**：
   - CSV: 适合数据分析和导入其他工具
   - Excel: 适合查看和编辑
   - JSON: 适合程序处理

## 🎯 针对您的需求

这个工具专门为解决您的 Google Drive 文档访问问题而设计：

✅ 无需网络访问文档  
✅ 包含完整的 OBD-II 标准数据  
✅ 自动识别和补全信息  
✅ 生成标准化的查询指令表格  
✅ 支持中英文混合内容  

立即试用这个增强版工具，获得完整的 OBD 查询指令数据库！