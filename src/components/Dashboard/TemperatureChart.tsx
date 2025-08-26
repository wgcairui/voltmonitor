import React from 'react';
import { Card } from 'antd';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../../store/appStore';

const TemperatureChart: React.FC = () => {
  const { historyData, settings } = useAppStore();
  
  if (!settings.showTemperatureGraphs) {
    return null;
  }

  const chartData = historyData.slice(-50).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    timestamp: point.timestamp,
    batteryTempMax: point.values['220425'] || 0,
    batteryTempMin: point.values['220426'] || 0,
    coolantTemp: point.values['05'] || 0,
    intakeTemp: point.values['0F'] || 0,
  }));

  return (
    <Card title="Temperature Monitoring" size="small" className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            domain={['dataMin - 5', 'dataMax + 5']}
            tick={{ fontSize: 12 }}
            label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }}
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
          <Area 
            type="monotone" 
            dataKey="batteryTempMax" 
            stackId="1"
            stroke="#ff4d4f" 
            fill="#ff4d4f"
            fillOpacity={0.3}
            name="Battery Max"
          />
          <Area 
            type="monotone" 
            dataKey="batteryTempMin" 
            stackId="2"
            stroke="#1890ff" 
            fill="#1890ff"
            fillOpacity={0.3}
            name="Battery Min"
          />
          <Area 
            type="monotone" 
            dataKey="coolantTemp" 
            stackId="3"
            stroke="#52c41a" 
            fill="#52c41a"
            fillOpacity={0.2}
            name="Coolant"
          />
          <Area 
            type="monotone" 
            dataKey="intakeTemp" 
            stackId="4"
            stroke="#faad14" 
            fill="#faad14"
            fillOpacity={0.2}
            name="Intake"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default TemperatureChart;