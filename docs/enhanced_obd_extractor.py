#!/usr/bin/env python3
"""
增强版 OBD 查询指令提取工具
包含常见 OBD-II PID 参考数据，并能从文档中提取更多指令
"""

import re
import csv
import json
from typing import List, Dict, Optional
import argparse
import sys

# 尝试导入 pandas，如果失败则禁用 Excel 功能
try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

class OBDCommand:
    """OBD 命令数据结构"""
    def __init__(self, 
                 pid: str = "", 
                 mode: str = "01", 
                 description: str = "", 
                 data_length: str = "", 
                 unit: str = "", 
                 formula: str = "", 
                 range_values: str = "", 
                 notes: str = "",
                 min_value: str = "",
                 max_value: str = ""):
        self.pid = pid.upper()
        self.mode = mode
        self.description = description
        self.data_length = data_length
        self.unit = unit
        self.formula = formula
        self.range_values = range_values
        self.notes = notes
        self.min_value = min_value
        self.max_value = max_value
    
    def to_dict(self) -> Dict:
        return {
            'PID': self.pid,
            'Mode': self.mode,
            'Description': self.description,
            'Data Length': self.data_length,
            'Unit': self.unit,
            'Formula': self.formula,
            'Range': self.range_values,
            'Min Value': self.min_value,
            'Max Value': self.max_value,
            'Notes': self.notes
        }

class EnhancedOBDExtractor:
    """增强版 OBD 指令提取器，包含常见 PID 参考数据"""
    
    def __init__(self):
        self.commands: List[OBDCommand] = []
        self.reference_pids = self._load_reference_pids()
        
        # 扩展的 PID 正则模式
        self.pid_patterns = [
            r'PID\s*[:\-]?\s*([0-9A-Fa-f]{2,4})',
            r'([0-9A-Fa-f]{2,4})\s*[:\-]\s*(.+)',
            r'0x([0-9A-Fa-f]{2,4})',
            r'参数\s*([0-9A-Fa-f]{2,4})',
            r'Parameter\s*([0-9A-Fa-f]{2,4})',
            r'\$([0-9A-Fa-f]{2,4})',
        ]
        
        # 数据长度模式（增强版）
        self.length_patterns = [
            r'(\d+)\s*bytes?',
            r'(\d+)\s*字节',
            r'长度\s*[:\-]?\s*(\d+)',
            r'Length\s*[:\-]?\s*(\d+)',
            r'Data\s*Length\s*[:\-]?\s*(\d+)',
            r'(\d+)\s*byte\s*response',
        ]
        
        # 单位模式（增强版）
        self.unit_patterns = [
            r'单位\s*[:\-]?\s*([^\n\r,;]+)',
            r'Unit\s*[:\-]?\s*([^\n\r,;]+)',
            r'Units?\s*[:\-]?\s*([^\n\r,;]+)',
            r'\(([^)]+)\)(?:\s*$|\s*[,;])',
            r'in\s+([a-zA-Z/%°\s]+)',
        ]
        
        # 公式模式（增强版）
        self.formula_patterns = [
            r'公式\s*[:\-]?\s*(.+)',
            r'Formula\s*[:\-]?\s*(.+)',
            r'Calculation\s*[:\-]?\s*(.+)',
            r'计算\s*[:\-]?\s*(.+)',
            r'=\s*(.+)(?:\s*[,;\n]|$)',
        ]
        
    def _load_reference_pids(self) -> Dict[str, OBDCommand]:
        """加载常见的 OBD-II PID 参考数据"""
        reference_data = [
            ("00", "PIDs supported (01-20)", "4", "Bit encoded", "32 bits", "Shows which PIDs are supported"),
            ("01", "Monitor status since DTCs cleared", "4", "Bit encoded", "32 bits", "Malfunction Indicator Lamp status"),
            ("02", "Freeze DTC", "2", "", "", "DTC that caused required freeze frame data storage"),
            ("03", "Fuel system status", "2", "Bit encoded", "", "Open/closed loop status"),
            ("04", "Calculated engine load", "1", "%", "A*100/255", "0-100%"),
            ("05", "Engine coolant temperature", "1", "°C", "A-40", "-40 to 215°C"),
            ("06", "Short term fuel trim—Bank 1", "1", "%", "(A-128)*100/128", "-100 to 99.22%"),
            ("07", "Long term fuel trim—Bank 1", "1", "%", "(A-128)*100/128", "-100 to 99.22%"),
            ("08", "Short term fuel trim—Bank 2", "1", "%", "(A-128)*100/128", "-100 to 99.22%"),
            ("09", "Long term fuel trim—Bank 2", "1", "%", "(A-128)*100/128", "-100 to 99.22%"),
            ("0A", "Fuel pressure", "1", "kPa", "A*3", "0-765 kPa"),
            ("0B", "Intake manifold absolute pressure", "1", "kPa", "A", "0-255 kPa"),
            ("0C", "Engine speed", "2", "RPM", "((A*256)+B)/4", "0-16383.75 RPM"),
            ("0D", "Vehicle speed", "1", "km/h", "A", "0-255 km/h"),
            ("0E", "Timing advance", "1", "°", "(A-128)/2", "-64 to 63.5°"),
            ("0F", "Intake air temperature", "1", "°C", "A-40", "-40 to 215°C"),
            ("10", "MAF air flow rate", "2", "g/s", "((A*256)+B)/100", "0-655.35 g/s"),
            ("11", "Throttle position", "1", "%", "A*100/255", "0-100%"),
            ("12", "Commanded secondary air status", "1", "Bit encoded", "", "Air status"),
            ("13", "Oxygen sensors present", "1", "Bit encoded", "", "Location of O2 sensors"),
            ("14", "Oxygen Sensor 1", "2", "V, %", "A/200, (B-128)*100/128", "0-1.275V, -100 to 99.22%"),
            ("15", "Oxygen Sensor 2", "2", "V, %", "A/200, (B-128)*100/128", "0-1.275V, -100 to 99.22%"),
            ("16", "Oxygen Sensor 3", "2", "V, %", "A/200, (B-128)*100/128", "0-1.275V, -100 to 99.22%"),
            ("17", "Oxygen Sensor 4", "2", "V, %", "A/200, (B-128)*100/128", "0-1.275V, -100 to 99.22%"),
            ("18", "Oxygen Sensor 5", "2", "V, %", "A/200, (B-128)*100/128", "0-1.275V, -100 to 99.22%"),
            ("19", "Oxygen Sensor 6", "2", "V, %", "A/200, (B-128)*100/128", "0-1.275V, -100 to 99.22%"),
            ("1A", "Oxygen Sensor 7", "2", "V, %", "A/200, (B-128)*100/128", "0-1.275V, -100 to 99.22%"),
            ("1B", "Oxygen Sensor 8", "2", "V, %", "A/200, (B-128)*100/128", "0-1.275V, -100 to 99.22%"),
            ("1C", "OBD standards", "1", "Bit encoded", "", "OBD standard compliance"),
            ("1D", "Oxygen sensors present", "1", "Bit encoded", "", "Similar to PID 13"),
            ("1E", "Auxiliary input status", "1", "Bit encoded", "", "Power take off status"),
            ("1F", "Run time since engine start", "2", "seconds", "(A*256)+B", "0-65535 seconds"),
            ("20", "PIDs supported (21-40)", "4", "Bit encoded", "32 bits", "Shows which PIDs are supported"),
            ("21", "Distance traveled with MIL on", "2", "km", "(A*256)+B", "0-65535 km"),
            ("22", "Fuel Rail Pressure", "2", "kPa", "((A*256)+B)*0.079", "0-5177.265 kPa"),
            ("23", "Fuel Rail Gauge Pressure", "2", "kPa", "((A*256)+B)*10", "0-655350 kPa"),
            ("24", "Oxygen Sensor 1 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/32768", ""),
            ("25", "Oxygen Sensor 2 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/32768", ""),
            ("26", "Oxygen Sensor 3 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/32768", ""),
            ("27", "Oxygen Sensor 4 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/32768", ""),
            ("28", "Oxygen Sensor 5 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/32768", ""),
            ("29", "Oxygen Sensor 6 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/32768", ""),
            ("2A", "Oxygen Sensor 7 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/32768", ""),
            ("2B", "Oxygen Sensor 8 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/32768", ""),
            ("2C", "Commanded EGR", "1", "%", "A*100/255", "0-100%"),
            ("2D", "EGR Error", "1", "%", "(A-128)*100/128", "-100 to 99.22%"),
            ("2E", "Commanded evaporative purge", "1", "%", "A*100/255", "0-100%"),
            ("2F", "Fuel Tank Level Input", "1", "%", "A*100/255", "0-100%"),
            ("30", "Warm-ups since codes cleared", "1", "count", "A", "0-255"),
            ("31", "Distance traveled since codes cleared", "2", "km", "(A*256)+B", "0-65535 km"),
            ("32", "Evap. System Vapor Pressure", "2", "Pa", "((A*256)+B)/4", "0-16383.75 Pa"),
            ("33", "Absolute Barometric Pressure", "1", "kPa", "A", "0-255 kPa"),
            ("34", "Oxygen Sensor 1 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/8", ""),
            ("35", "Oxygen Sensor 2 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/8", ""),
            ("36", "Oxygen Sensor 3 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/8", ""),
            ("37", "Oxygen Sensor 4 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/8", ""),
            ("38", "Oxygen Sensor 5 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/8", ""),
            ("39", "Oxygen Sensor 6 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/8", ""),
            ("3A", "Oxygen Sensor 7 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/8", ""),
            ("3B", "Oxygen Sensor 8 - Fuel–Air Equivalence Ratio", "4", "", "((A*256)+B)/32768, ((C*256)+D)/8", ""),
            ("3C", "Catalyst Temperature: Bank 1, Sensor 1", "2", "°C", "((A*256)+B)/10-40", "-40 to 6513.5°C"),
            ("3D", "Catalyst Temperature: Bank 2, Sensor 1", "2", "°C", "((A*256)+B)/10-40", "-40 to 6513.5°C"),
            ("3E", "Catalyst Temperature: Bank 1, Sensor 2", "2", "°C", "((A*256)+B)/10-40", "-40 to 6513.5°C"),
            ("3F", "Catalyst Temperature: Bank 2, Sensor 2", "2", "°C", "((A*256)+B)/10-40", "-40 to 6513.5°C"),
            ("40", "PIDs supported (41-60)", "4", "Bit encoded", "32 bits", "Shows which PIDs are supported"),
            ("41", "Monitor status this drive cycle", "4", "Bit encoded", "", "Monitoring test status"),
            ("42", "Control module voltage", "2", "V", "((A*256)+B)/1000", "0-65.535V"),
            ("43", "Absolute load value", "2", "%", "((A*256)+B)*100/255", "0-25700%"),
            ("44", "Fuel–Air commanded equivalence ratio", "2", "", "((A*256)+B)/32768", "0-2"),
            ("45", "Relative throttle position", "1", "%", "A*100/255", "0-100%"),
            ("46", "Ambient air temperature", "1", "°C", "A-40", "-40 to 215°C"),
            ("47", "Absolute throttle position B", "1", "%", "A*100/255", "0-100%"),
            ("48", "Absolute throttle position C", "1", "%", "A*100/255", "0-100%"),
            ("49", "Accelerator pedal position D", "1", "%", "A*100/255", "0-100%"),
            ("4A", "Accelerator pedal position E", "1", "%", "A*100/255", "0-100%"),
            ("4B", "Accelerator pedal position F", "1", "%", "A*100/255", "0-100%"),
            ("4C", "Commanded throttle actuator", "1", "%", "A*100/255", "0-100%"),
            ("4D", "Time run with MIL on", "2", "minutes", "(A*256)+B", "0-65535 minutes"),
            ("4E", "Time since trouble codes cleared", "2", "minutes", "(A*256)+B", "0-65535 minutes"),
            ("4F", "Maximum value for Fuel–Air equivalence ratio, oxygen sensor voltage, oxygen sensor current, and intake manifold absolute pressure", "4", "", "A, B, C, D*10", ""),
            ("50", "Maximum value for air flow rate from mass air flow sensor", "4", "", "A*10, B, C, D*10", ""),
            ("51", "Fuel Type", "1", "Encoded", "", "Fuel type coding"),
            ("52", "Ethanol fuel %", "1", "%", "A*100/255", "0-100%"),
        ]
        
        reference = {}
        for data in reference_data:
            pid, desc, length, unit, formula, range_val = data
            cmd = OBDCommand(
                pid=pid,
                description=desc,
                data_length=f"{length} bytes" if length.isdigit() else length,
                unit=unit,
                formula=formula,
                range_values=range_val
            )
            reference[pid.upper()] = cmd
        
        return reference
    
    def extract_from_text(self, text: str) -> List[OBDCommand]:
        """从文本中提取 OBD 命令，结合参考数据"""
        lines = text.split('\n')
        current_command = None
        found_pids = set()
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # 检查是否是新的 PID 行
            pid_match = self._find_pid_in_line(line)
            if pid_match:
                # 保存之前的命令
                if current_command and current_command.pid:
                    self.commands.append(current_command)
                    found_pids.add(current_command.pid)
                
                # 开始新命令
                pid = pid_match['pid'].upper()
                current_command = OBDCommand()
                current_command.pid = pid
                current_command.description = pid_match['description']
                
                # 如果在参考数据中找到，使用参考信息补充
                if pid in self.reference_pids:
                    ref_cmd = self.reference_pids[pid]
                    if not current_command.description or current_command.description == pid:
                        current_command.description = ref_cmd.description
                    if not current_command.data_length:
                        current_command.data_length = ref_cmd.data_length
                    if not current_command.unit:
                        current_command.unit = ref_cmd.unit
                    if not current_command.formula:
                        current_command.formula = ref_cmd.formula
                    if not current_command.range_values:
                        current_command.range_values = ref_cmd.range_values
            
            elif current_command:
                # 继续解析当前命令的其他属性
                self._parse_command_details(current_command, line)
        
        # 添加最后一个命令
        if current_command and current_command.pid:
            self.commands.append(current_command)
            found_pids.add(current_command.pid)
        
        print(f"从文档中提取到 {len(self.commands)} 条 PID")
        
        # 询问是否添加未在文档中找到的常见 PID
        missing_pids = set(self.reference_pids.keys()) - found_pids
        if missing_pids:
            print(f"发现 {len(missing_pids)} 个常见 PID 未在文档中找到")
            response = input("是否要添加所有常见的 OBD-II PID 到结果中？ (y/n): ").lower().strip()
            if response in ['y', 'yes', '是']:
                for pid in sorted(missing_pids):
                    self.commands.append(self.reference_pids[pid])
                print(f"已添加 {len(missing_pids)} 个常见 PID")
            
        return sorted(self.commands, key=lambda x: x.pid)
    
    def _find_pid_in_line(self, line: str) -> Optional[Dict]:
        """在行中查找 PID（增强版）"""
        for pattern in self.pid_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                pid = match.group(1)
                if len(pid) >= 2:  # 确保是有效的 PID
                    if len(match.groups()) >= 2:
                        return {
                            'pid': pid,
                            'description': match.group(2).strip()
                        }
                    else:
                        # 尝试从行的其余部分提取描述
                        desc = line.replace(match.group(0), '').strip()
                        desc = re.sub(r'^[:\-\s]+', '', desc)  # 清理开头的符号
                        return {
                            'pid': pid,
                            'description': desc if desc else pid
                        }
        return None
    
    def _parse_command_details(self, command: OBDCommand, line: str):
        """解析命令详细信息（增强版）"""
        line_lower = line.lower()
        
        # 查找数据长度
        if not command.data_length:
            for pattern in self.length_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    command.data_length = match.group(1) + " bytes"
                    break
        
        # 查找单位
        if not command.unit:
            for pattern in self.unit_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    unit = match.group(1).strip()
                    # 清理单位字符串
                    unit = re.sub(r'^[:\-\s]+', '', unit)
                    unit = re.sub(r'[,;\s]+$', '', unit)
                    if unit and len(unit) < 20:  # 避免太长的字符串
                        command.unit = unit
                        break
        
        # 查找公式
        if not command.formula:
            for pattern in self.formula_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    formula = match.group(1).strip()
                    command.formula = formula
                    break
        
        # 查找范围
        if 'range' in line_lower or '范围' in line_lower or '取值' in line_lower or 'min' in line_lower or 'max' in line_lower:
            range_match = re.search(r'[:=]\s*(.+)', line)
            if range_match:
                command.range_values = range_match.group(1).strip()
        
        # 其他信息作为备注
        if any(keyword in line_lower for keyword in ['note', 'remark', '备注', '说明', 'comment']):
            if command.notes:
                command.notes += "; " + line
            else:
                command.notes = line
    
    def export_to_csv(self, filename: str):
        """导出到 CSV 文件"""
        if not self.commands:
            print("没有找到 OBD 命令数据")
            return
            
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            fieldnames = ['PID', 'Mode', 'Description', 'Data Length', 'Unit', 'Formula', 'Range', 'Min Value', 'Max Value', 'Notes']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for command in self.commands:
                writer.writerow(command.to_dict())
        
        print(f"已导出 {len(self.commands)} 条 OBD 命令到 {filename}")
    
    def export_to_excel(self, filename: str):
        """导出到 Excel 文件"""
        if not self.commands:
            print("没有找到 OBD 命令数据")
            return
        
        if not PANDAS_AVAILABLE:
            print("错误：需要安装 pandas 和 openpyxl 来导出 Excel 文件")
            print("运行: pip install pandas openpyxl")
            return
            
        df = pd.DataFrame([cmd.to_dict() for cmd in self.commands])
        try:
            df.to_excel(filename, index=False, engine='openpyxl')
            print(f"已导出 {len(self.commands)} 条 OBD 命令到 {filename}")
        except ImportError:
            print("错误：需要安装 openpyxl 来导出 Excel 文件: pip install openpyxl")
    
    def export_to_json(self, filename: str):
        """导出到 JSON 文件"""
        if not self.commands:
            print("没有找到 OBD 命令数据")
            return
            
        data = [cmd.to_dict() for cmd in self.commands]
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"已导出 {len(self.commands)} 条 OBD 命令到 {filename}")
    
    def print_summary(self):
        """打印提取结果摘要"""
        print(f"\n=== 增强版 OBD 命令提取结果 ===")
        print(f"总共找到 {len(self.commands)} 条 OBD 命令")
        
        if self.commands:
            print(f"\nPID 范围分布:")
            ranges = {"00-1F": 0, "20-3F": 0, "40-5F": 0, "60-7F": 0, "80-9F": 0, "A0-BF": 0, "C0-DF": 0, "E0-FF": 0}
            
            for cmd in self.commands:
                if cmd.pid and len(cmd.pid) >= 2:
                    try:
                        pid_val = int(cmd.pid[:2], 16)
                        if pid_val <= 0x1F:
                            ranges["00-1F"] += 1
                        elif pid_val <= 0x3F:
                            ranges["20-3F"] += 1
                        elif pid_val <= 0x5F:
                            ranges["40-5F"] += 1
                        elif pid_val <= 0x7F:
                            ranges["60-7F"] += 1
                        elif pid_val <= 0x9F:
                            ranges["80-9F"] += 1
                        elif pid_val <= 0xBF:
                            ranges["A0-BF"] += 1
                        elif pid_val <= 0xDF:
                            ranges["C0-DF"] += 1
                        else:
                            ranges["E0-FF"] += 1
                    except ValueError:
                        pass
            
            for range_name, count in ranges.items():
                if count > 0:
                    print(f"  {range_name}: {count} 个 PID")
            
            print("\n前 10 条命令预览:")
            for i, cmd in enumerate(self.commands[:10], 1):
                print(f"{i:2d}. PID {cmd.pid}: {cmd.description[:50]}")

def main():
    parser = argparse.ArgumentParser(description='Enhanced OBD Command Extractor - 增强版 OBD 查询指令提取工具')
    parser.add_argument('input_file', nargs='?', help='输入文件路径 (支持 .txt，可选)')
    parser.add_argument('-o', '--output', help='输出文件名 (不含扩展名)', default='enhanced_obd_commands')
    parser.add_argument('-f', '--format', choices=['csv', 'excel', 'json', 'all'], 
                       default='csv', help='输出格式')
    parser.add_argument('-r', '--reference-only', action='store_true', 
                       help='仅导出常见 OBD-II PID 参考数据')
    
    args = parser.parse_args()
    
    # 创建提取器
    extractor = EnhancedOBDExtractor()
    
    if args.reference_only:
        # 仅导出参考数据
        print("导出常见 OBD-II PID 参考数据...")
        extractor.commands = list(extractor.reference_pids.values())
    else:
        if args.input_file:
            # 读取输入文件
            try:
                with open(args.input_file, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                with open(args.input_file, 'r', encoding='gb2312') as f:
                    content = f.read()
            except FileNotFoundError:
                print(f"错误：找不到文件 {args.input_file}")
                sys.exit(1)
            
            # 提取命令
            extractor.extract_from_text(content)
        else:
            print("未指定输入文件，将导出所有常见 OBD-II PID...")
            extractor.commands = list(extractor.reference_pids.values())
    
    extractor.print_summary()
    
    # 导出结果
    if args.format == 'csv' or args.format == 'all':
        extractor.export_to_csv(f"{args.output}.csv")
    
    if args.format == 'excel' or args.format == 'all':
        extractor.export_to_excel(f"{args.output}.xlsx")
    
    if args.format == 'json' or args.format == 'all':
        extractor.export_to_json(f"{args.output}.json")

if __name__ == '__main__':
    main()