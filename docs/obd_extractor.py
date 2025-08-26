#!/usr/bin/env python3
"""
OBD Command Extractor Tool
用于从文档中提取 OBD-II 查询指令并生成表格
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
                 notes: str = ""):
        self.pid = pid.upper()
        self.mode = mode
        self.description = description
        self.data_length = data_length
        self.unit = unit
        self.formula = formula
        self.range_values = range_values
        self.notes = notes
    
    def to_dict(self) -> Dict:
        return {
            'PID': self.pid,
            'Mode': self.mode,
            'Description': self.description,
            'Data Length': self.data_length,
            'Unit': self.unit,
            'Formula': self.formula,
            'Range': self.range_values,
            'Notes': self.notes
        }

class OBDExtractor:
    """OBD 指令提取器"""
    
    def __init__(self):
        self.commands: List[OBDCommand] = []
        
        # 常见的 PID 正则模式
        self.pid_patterns = [
            r'PID\s*[:\-]?\s*([0-9A-Fa-f]{2})',  # PID: 01, PID-02 等
            r'([0-9A-Fa-f]{2})\s*[:\-]\s*(.+)',   # 01: Engine RPM 等
            r'0x([0-9A-Fa-f]{2})',                 # 0x01 格式
        ]
        
        # 数据长度模式
        self.length_patterns = [
            r'(\d+)\s*bytes?',
            r'(\d+)\s*字节',
            r'长度\s*[:\-]?\s*(\d+)',
        ]
        
        # 单位模式
        self.unit_patterns = [
            r'单位\s*[:\-]?\s*([^\n\r,]+)',
            r'Unit\s*[:\-]?\s*([^\n\r,]+)',
            r'\(([^)]+)\)$',  # 括号中的单位
        ]
        
    def extract_from_text(self, text: str) -> List[OBDCommand]:
        """从文本中提取 OBD 命令"""
        lines = text.split('\n')
        current_command = None
        
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
                
                # 开始新命令
                current_command = OBDCommand()
                current_command.pid = pid_match['pid']
                current_command.description = pid_match['description']
            
            elif current_command:
                # 继续解析当前命令的其他属性
                self._parse_command_details(current_command, line)
        
        # 添加最后一个命令
        if current_command and current_command.pid:
            self.commands.append(current_command)
            
        return self.commands
    
    def _find_pid_in_line(self, line: str) -> Optional[Dict]:
        """在行中查找 PID"""
        for pattern in self.pid_patterns:
            match = re.search(pattern, line, re.IGNORECASE)
            if match:
                if len(match.groups()) >= 2:
                    return {
                        'pid': match.group(1),
                        'description': match.group(2).strip()
                    }
                else:
                    return {
                        'pid': match.group(1),
                        'description': line.replace(match.group(0), '').strip()
                    }
        return None
    
    def _parse_command_details(self, command: OBDCommand, line: str):
        """解析命令详细信息"""
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
                    command.unit = match.group(1).strip()
                    break
        
        # 查找公式
        if 'formula' in line_lower or '公式' in line_lower or '计算' in line_lower:
            formula_match = re.search(r'[:=]\s*(.+)', line)
            if formula_match:
                command.formula = formula_match.group(1).strip()
        
        # 查找范围
        if 'range' in line_lower or '范围' in line_lower or '取值' in line_lower:
            range_match = re.search(r'[:=]\s*(.+)', line)
            if range_match:
                command.range_values = range_match.group(1).strip()
        
        # 其他信息作为备注
        if any(keyword in line_lower for keyword in ['note', 'remark', '备注', '说明']):
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
            fieldnames = ['PID', 'Mode', 'Description', 'Data Length', 'Unit', 'Formula', 'Range', 'Notes']
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
        print(f"\n=== OBD 命令提取结果 ===")
        print(f"总共找到 {len(self.commands)} 条 OBD 命令")
        
        if self.commands:
            print("\n前 5 条命令预览:")
            for i, cmd in enumerate(self.commands[:5], 1):
                print(f"{i}. PID {cmd.pid}: {cmd.description}")

def main():
    parser = argparse.ArgumentParser(description='OBD Command Extractor - 从文档中提取 OBD 查询指令')
    parser.add_argument('input_file', help='输入文件路径 (支持 .txt)')
    parser.add_argument('-o', '--output', help='输出文件名 (不含扩展名)', default='obd_commands')
    parser.add_argument('-f', '--format', choices=['csv', 'excel', 'json', 'all'], 
                       default='csv', help='输出格式')
    
    args = parser.parse_args()
    
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
    
    # 创建提取器并处理
    extractor = OBDExtractor()
    extractor.extract_from_text(content)
    extractor.print_summary()
    
    # 导出结果
    if args.format == 'csv' or args.format == 'all':
        extractor.export_to_csv(f"{args.output}.csv")
    
    if args.format == 'excel' or args.format == 'all':
        try:
            extractor.export_to_excel(f"{args.output}.xlsx")
        except ImportError:
            print("警告：需要安装 openpyxl 来导出 Excel 文件: pip install openpyxl")
    
    if args.format == 'json' or args.format == 'all':
        extractor.export_to_json(f"{args.output}.json")

if __name__ == '__main__':
    main()