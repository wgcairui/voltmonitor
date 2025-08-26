# OBD 查询指令提取工具

这个工具可以帮助您从文档中提取 OBD-II 查询指令并生成结构化的表格。

## 安装依赖

```bash
pip install -r requirements_obd.txt
```

## 使用方法

### 步骤 1: 准备文档
由于无法直接访问 Google Drive 文档，请您：
1. 下载 Google Drive 中的文档
2. 如果是 PDF，请复制文档内容到文本文件
3. 保存为 `.txt` 文件

### 步骤 2: 运行提取工具

```bash
# 基本用法 - 导出为 CSV
python obd_extractor.py your_document.txt

# 指定输出文件名和格式
python obd_extractor.py your_document.txt -o my_obd_commands -f excel

# 导出所有格式 (CSV, Excel, JSON)
python obd_extractor.py your_document.txt -o obd_data -f all
```

### 参数说明
- `input_file`: 输入的文本文件路径
- `-o, --output`: 输出文件名（不含扩展名），默认为 `obd_commands`
- `-f, --format`: 输出格式，可选：`csv`, `excel`, `json`, `all`

## 输出表格结构

工具会提取以下信息并生成表格：

| 字段 | 说明 | 示例 |
|------|------|------|
| PID | 参数标识符（十六进制） | 01, 0C, 1F |
| Mode | 服务模式 | 01 |
| Description | 参数描述 | Engine RPM, Coolant Temperature |
| Data Length | 数据长度 | 2 bytes, 4 bytes |
| Unit | 单位 | RPM, °C, % |
| Formula | 计算公式 | ((A*256)+B)/4, A-40 |
| Range | 取值范围 | 0-8191.75 RPM |
| Notes | 备注信息 | 其他说明 |

## 支持的文档格式

工具可以识别以下格式的 OBD 命令：
- `PID: 01` 或 `PID-01`
- `01: Engine RPM`
- `0x01`
- 包含长度、单位、公式等信息的描述

## 示例输入格式

```
PID: 01 - Engine Load
Data Length: 1 byte
Unit: %
Formula: A * 100 / 255
Range: 0-100%

0x0C: Engine RPM  
Length: 2 bytes
Unit: RPM
Formula: ((A*256)+B)/4
Range: 0-16383.75 RPM
```

## 注意事项

1. 确保文档内容格式清晰，每个 PID 信息相对独立
2. 如果提取结果不理想，可能需要手动调整文档格式
3. 支持中英文混合内容
4. 建议使用 UTF-8 编码的文本文件