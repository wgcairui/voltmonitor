#!/usr/bin/env python3
"""
雪佛兰 Volt 专用 PID 数据库
基于社区收集的数据和官方信息
"""

import csv
import json
from typing import List, Dict

class VoltPID:
    """Volt PID 数据结构"""
    def __init__(self, pid: str, description: str, unit: str = "", 
                 formula: str = "", range_values: str = "", 
                 header: str = "7E0", response: str = "7E8",
                 category: str = "", notes: str = ""):
        self.pid = pid.upper()
        self.description = description
        self.unit = unit
        self.formula = formula
        self.range_values = range_values
        self.header = header
        self.response = response
        self.category = category
        self.notes = notes
    
    def to_dict(self) -> Dict:
        return {
            'PID': self.pid,
            'Description': self.description,
            'Unit': self.unit,
            'Formula': self.formula,
            'Range': self.range_values,
            'OBD Header': self.header,
            'Response': self.response,
            'Category': self.category,
            'Notes': self.notes
        }

class VoltPIDDatabase:
    """雪佛兰 Volt PID 数据库"""
    
    def __init__(self):
        self.pids: List[VoltPID] = []
        self._load_volt_pids()
    
    def _load_volt_pids(self):
        """加载 Volt 专用 PID 数据"""
        volt_pid_data = [
            # 电池相关 PIDs
            ("22005B", "Hybrid Pack Remaining (SOC)", "%", "A*100/255", "0-100%", "7E0", "7E8", "Battery", "电池剩余电量"),
            ("220042", "Control Module Voltage", "V", "(A*256+B)/1000", "0-15V", "7E0", "7E8", "Battery", "控制模块电压"),
            ("2204B0", "HV Battery Voltage", "V", "((A*256+B)*256+C)/100", "0-400V", "7E0", "7E8", "Battery", "高压电池电压"),
            ("2204AF", "HV Battery Current", "A", "((A*256+B)-32768)/100", "-327.68 to 327.67A", "7E0", "7E8", "Battery", "高压电池电流"),
            ("220425", "HV Battery Temperature Max", "°C", "A-40", "-40 to 215°C", "7E0", "7E8", "Battery", "电池最高温度"),
            ("220426", "HV Battery Temperature Min", "°C", "A-40", "-40 to 215°C", "7E0", "7E8", "Battery", "电池最低温度"),
            ("2201BB", "HV Battery Pack Voltage", "V", "((A*256)+B)/10", "0-6553.5V", "7E0", "7E8", "Battery", "电池包电压"),
            ("22437D", "12V Battery Voltage", "V", "(A*256+B)/1000", "0-16V", "7E0", "7E8", "Battery", "12V电池电压"),
            
            # 充电相关 PIDs
            ("224373", "Onboard Charger AC Current", "A", "((A*256)+B)/100", "0-655.35A", "7E0", "7E8", "Charging", "车载充电器AC电流"),
            ("224372", "Onboard Charger AC Voltage", "V", "((A*256)+B)/10", "0-6553.5V", "7E0", "7E8", "Charging", "车载充电器AC电压"),
            ("224375", "Onboard Charger DC Current", "A", "((A*256)+B)/100", "0-655.35A", "7E0", "7E8", "Charging", "车载充电器DC电流"),
            ("224374", "Onboard Charger DC Voltage", "V", "((A*256)+B)/10", "0-6553.5V", "7E0", "7E8", "Charging", "车载充电器DC电压"),
            ("22437E", "LV Charge Amps", "A", "(S_A*256+B)/20", "-100 to 100A", "7E0", "7E8", "Charging", "低压充电电流"),
            ("2243A5", "Charging Power", "kW", "((A*256)+B)/100", "0-655.35kW", "7E0", "7E8", "Charging", "充电功率"),
            
            # 发动机相关 PIDs  
            ("220005", "Engine Coolant Temperature", "°C", "A-40", "-40 to 215°C", "7E0", "7E8", "Engine", "发动机冷却液温度"),
            ("221154", "Engine Oil Temperature", "°C", "A-40", "-40 to 215°C", "7E0", "7E8", "Engine", "发动机机油温度"),
            ("22000C", "Engine RPM", "RPM", "((A*256)+B)/4", "0-16383.75 RPM", "7E0", "7E8", "Engine", "发动机转速"),
            ("22203F", "Engine Torque", "Nm", "((256*A)+B)/4", "0-200 Nm", "7E0", "7E8", "Engine", "发动机扭矩"),
            ("22001F", "Engine Run Time", "seconds", "(A*256)+B", "0-65535 seconds", "7E0", "7E8", "Engine", "发动机运行时间"),
            
            # 电机相关 PIDs
            ("220272", "Motor A RPM", "RPM", "((A*256)+B)/4", "-8192 to 8191 RPM", "7E0", "7E8", "Motor", "电机A转速"),
            ("220273", "Motor A Torque", "Nm", "((A*256)+B)/4-8192", "-2048 to 2047 Nm", "7E0", "7E8", "Motor", "电机A扭矩"),
            ("220274", "Motor B RPM", "RPM", "((A*256)+B)/4", "-8192 to 8191 RPM", "7E0", "7E8", "Motor", "电机B转速"),
            ("220275", "Motor B Torque", "Nm", "((A*256)+B)/4-8192", "-2048 to 2047 Nm", "7E0", "7E8", "Motor", "电机B扭矩"),
            ("22F40C", "Total Motor Torque", "Nm", "((A*256)+B)/8-4096", "-4096 to 4095.875 Nm", "7E0", "7E8", "Motor", "电机总扭矩"),
            
            # 车辆状态 PIDs
            ("22000D", "Vehicle Speed", "km/h", "A", "0-255 km/h", "7E0", "7E8", "Vehicle", "车辆速度"),
            ("22002F", "Fuel Level", "%", "A*100/255", "0-100%", "7E0", "7E8", "Vehicle", "燃油液位百分比"),
            ("22002F", "Fuel Remaining", "gallons", "(A/255)*9.3122", "0-9.3 gallons", "7E0", "7E8", "Vehicle", "剩余燃油量"),
            ("22004C", "Commanded Throttle Position", "%", "A*100/255", "0-100%", "7E0", "7E8", "Vehicle", "节气门开度指令"),
            ("220011", "Throttle Position", "%", "A*100/255", "0-100%", "7E0", "7E8", "Vehicle", "节气门位置"),
            ("220047", "Absolute Throttle Position B", "%", "A*100/255", "0-100%", "7E0", "7E8", "Vehicle", "绝对节气门位置B"),
            
            # 温度监测 PIDs
            ("22000F", "Intake Air Temperature", "°C", "A-40", "-40 to 215°C", "7E0", "7E8", "Temperature", "进气温度"),
            ("220046", "Ambient Air Temperature", "°C", "A-40", "-40 to 215°C", "7E0", "7E8", "Temperature", "环境温度"),
            ("22003C", "Catalyst Temperature Bank 1 Sensor 1", "°C", "((A*256)+B)/10-40", "-40 to 6513.5°C", "7E0", "7E8", "Temperature", "催化器温度"),
            ("221C43", "Power Electronics Cooling Loop", "°C", "A-40", "-40 to 215°C", "7E0", "7E8", "Temperature", "功率电子冷却回路温度"),
            
            # 压力相关 PIDs
            ("22000A", "Fuel Pressure", "kPa", "A*3", "0-765 kPa", "7E0", "7E8", "Pressure", "燃油压力"),
            ("22000B", "Intake Manifold Pressure", "kPa", "A", "0-255 kPa", "7E0", "7E8", "Pressure", "进气歧管压力"),
            ("220033", "Absolute Barometric Pressure", "kPa", "A", "0-255 kPa", "7E0", "7E8", "Pressure", "绝对大气压力"),
            
            # 燃油系统 PIDs
            ("220006", "Short Term Fuel Trim Bank 1", "%", "(A-128)*100/128", "-100 to 99.22%", "7E0", "7E8", "Fuel", "短期燃油修正值1"),
            ("220007", "Long Term Fuel Trim Bank 1", "%", "(A-128)*100/128", "-100 to 99.22%", "7E0", "7E8", "Fuel", "长期燃油修正值1"),
            ("220008", "Short Term Fuel Trim Bank 2", "%", "(A-128)*100/128", "-100 to 99.22%", "7E0", "7E8", "Fuel", "短期燃油修正值2"),
            ("220009", "Long Term Fuel Trim Bank 2", "%", "(A-128)*100/128", "-100 to 99.22%", "7E0", "7E8", "Fuel", "长期燃油修正值2"),
            
            # HVAC 空调系统 PIDs
            ("221C40", "HVAC Compressor Speed", "RPM", "((A*256)+B)", "0-65535 RPM", "7E0", "7E8", "HVAC", "空调压缩机转速"),
            ("221C41", "HVAC High Side Pressure", "kPa", "((A*256)+B)/10", "0-6553.5 kPa", "7E0", "7E8", "HVAC", "空调高压侧压力"),
            ("221C42", "HVAC Low Side Pressure", "kPa", "((A*256)+B)/10", "0-6553.5 kPa", "7E0", "7E8", "HVAC", "空调低压侧压力"),
            
            # 里程和距离 PIDs  
            ("220021", "Distance with MIL On", "km", "(A*256)+B", "0-65535 km", "7E0", "7E8", "Distance", "MIL灯亮时的行驶距离"),
            ("220031", "Distance Since Codes Cleared", "km", "(A*256)+B", "0-65535 km", "7E0", "7E8", "Distance", "故障码清除后的行驶距离"),
            
            # 诊断相关 PIDs
            ("220001", "Monitor Status Since DTCs Cleared", "Bitfield", "32 bits", "Bitfield", "7E0", "7E8", "Diagnostics", "DTC清除后监测状态"),
            ("220041", "Monitor Status This Drive Cycle", "Bitfield", "32 bits", "Bitfield", "7E0", "7E8", "Diagnostics", "本次驾驶循环监测状态"),
            ("22001C", "OBD Standards", "Encoded", "A", "1-250", "7E0", "7E8", "Diagnostics", "OBD标准"),
            
            # 特殊 Volt PIDs (需要特定 header)
            ("4368", "Onboard Charger Voltage", "V", "((A*256)+B)/100", "0-655.35V", "7E4", "5EC", "Charging", "车载充电器电压 (特殊header)"),
            ("4369", "Onboard Charger Current", "A", "((A*256)+B)/100", "0-655.35A", "7E4", "5EC", "Charging", "车载充电器电流 (特殊header)"),
            ("434F", "HV Battery Temperature", "°C", "A-40", "-40 to 215°C", "7E4", "5EC", "Battery", "高压电池温度 (特殊header)"),
        ]
        
        for pid_info in volt_pid_data:
            pid = VoltPID(*pid_info)
            self.pids.append(pid)
    
    def get_pids_by_category(self, category: str) -> List[VoltPID]:
        """按类别获取 PID"""
        return [pid for pid in self.pids if pid.category.lower() == category.lower()]
    
    def get_pid_by_code(self, pid_code: str) -> VoltPID:
        """根据 PID 代码获取特定 PID"""
        pid_code = pid_code.upper()
        for pid in self.pids:
            if pid.pid == pid_code:
                return pid
        return None
    
    def get_all_categories(self) -> List[str]:
        """获取所有类别"""
        categories = set(pid.category for pid in self.pids if pid.category)
        return sorted(list(categories))
    
    def export_to_csv(self, filename: str = "chevrolet_volt_pids.csv"):
        """导出到 CSV 文件"""
        with open(filename, 'w', newline='', encoding='utf-8-sig') as csvfile:
            fieldnames = ['PID', 'Description', 'Unit', 'Formula', 'Range', 
                         'OBD Header', 'Response', 'Category', 'Notes']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for pid in sorted(self.pids, key=lambda x: (x.category, x.pid)):
                writer.writerow(pid.to_dict())
        
        print(f"已导出 {len(self.pids)} 条雪佛兰 Volt PID 到 {filename}")
    
    def export_to_json(self, filename: str = "chevrolet_volt_pids.json"):
        """导出到 JSON 文件"""
        data = {
            "vehicle": "Chevrolet Volt",
            "description": "雪佛兰 Volt 专用 OBD-II PID 数据库",
            "categories": self.get_all_categories(),
            "pid_count": len(self.pids),
            "pids": [pid.to_dict() for pid in sorted(self.pids, key=lambda x: (x.category, x.pid))]
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"已导出 {len(self.pids)} 条雪佛兰 Volt PID 到 {filename}")
    
    def export_torque_csv(self, filename: str = "volt_torque_pids.csv"):
        """导出 Torque Pro 应用专用格式"""
        with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
            # Torque Pro CSV 格式
            fieldnames = ['Name', 'ShortName', 'ModeAndPID', 'Equation', 'Min Value', 'Max Value', 'Units', 'Header']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for pid in sorted(self.pids, key=lambda x: (x.category, x.pid)):
                # 从范围中提取最小值和最大值
                min_val, max_val = self._extract_min_max(pid.range_values)
                
                row = {
                    'Name': pid.description,
                    'ShortName': pid.description[:20],  # 限制短名称长度
                    'ModeAndPID': f"22{pid.pid}" if not pid.pid.startswith('22') else pid.pid,
                    'Equation': pid.formula if pid.formula else "A",
                    'Min Value': min_val,
                    'Max Value': max_val,
                    'Units': pid.unit,
                    'Header': pid.header
                }
                writer.writerow(row)
        
        print(f"已导出 Torque Pro 格式文件到 {filename}")
    
    def _extract_min_max(self, range_str: str) -> tuple:
        """从范围字符串中提取最小值和最大值"""
        if not range_str:
            return ("", "")
        
        import re
        # 尝试匹配 "min-max" 或 "min to max" 格式
        patterns = [
            r'(-?\d+\.?\d*)\s*-\s*(\d+\.?\d*)',
            r'(-?\d+\.?\d*)\s+to\s+(\d+\.?\d*)',
            r'(\d+\.?\d*)\s*~\s*(\d+\.?\d*)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, range_str)
            if match:
                return (match.group(1), match.group(2))
        
        return ("", "")
    
    def print_summary(self):
        """打印 PID 数据库摘要"""
        print(f"\n=== 雪佛兰 Volt PID 数据库摘要 ===")
        print(f"总 PID 数量: {len(self.pids)}")
        
        categories = self.get_all_categories()
        print(f"\n按类别分布:")
        for category in categories:
            count = len(self.get_pids_by_category(category))
            print(f"  {category}: {count} 个 PID")
        
        print(f"\n关键 PIDs 预览:")
        key_pids = ["22005B", "220042", "2204B0", "220272", "22000C"]
        for pid_code in key_pids:
            pid = self.get_pid_by_code(pid_code)
            if pid:
                print(f"  {pid.pid}: {pid.description} ({pid.unit})")

def main():
    """主函数"""
    print("=== 雪佛兰 Volt PID 数据库生成器 ===\n")
    
    # 创建数据库
    db = VoltPIDDatabase()
    db.print_summary()
    
    # 导出选项
    print(f"\n请选择导出格式:")
    print("1. CSV (通用格式)")
    print("2. JSON (结构化数据)")
    print("3. Torque Pro CSV (Torque应用专用)")
    print("4. 全部格式")
    
    choice = input("请选择 (1-4): ").strip()
    
    if choice in ['1', '4']:
        db.export_to_csv()
    
    if choice in ['2', '4']:
        db.export_to_json()
    
    if choice in ['3', '4']:
        db.export_torque_csv()
    
    print(f"\n✅ 导出完成！")
    print(f"📊 包含 {len(db.pids)} 条雪佛兰 Volt 专用 PID")
    print(f"📋 涵盖 {len(db.get_all_categories())} 个系统类别")
    
    print(f"\n💡 使用提示:")
    print(f"- CSV 文件可用 Excel 打开查看")
    print(f"- Torque CSV 可导入 Torque Pro 应用")
    print(f"- 大部分 PID 使用标准 header 7E0/7E8")
    print(f"- 部分特殊 PID 需要使用 7E4/5EC header")

if __name__ == '__main__':
    main()