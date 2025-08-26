import React from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../../store/appStore';

const VoltageChart: React.FC = () => {
  const { historyData, settings } = useAppStore();
  
  if (!settings.showVoltageGraphs) {
    return null;
  }

  const chartData = historyData.slice(-50).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    timestamp: point.timestamp,
    hvVoltage: point.values['2204B0'] || 0,
    chargeVoltage: point.values['224374'] || 0,
    controlVoltage: point.values['220042'] || 0,
  }));

  return (
    <Card title="Voltage Monitoring" size="small" className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={['dataMin - 10', 'dataMax + 10']}
            tick={{ fontSize: 12 }}
            label={{ value: 'Voltage (V)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            labelFormatter={(value, payload) => {
              if (payload && payload[0]) {
                return new Date((payload[0].payload as any).timestamp).toLocaleString();
              }
              return value;
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="hvVoltage" 
            stroke="#722ed1" 
            strokeWidth={2}
            name="HV Battery"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="chargeVoltage" 
            stroke="#1890ff" 
            strokeWidth={2}
            name="DC Charge"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="controlVoltage" 
            stroke="#52c41a" 
            strokeWidth={1}
            name="Control"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default VoltageChart;