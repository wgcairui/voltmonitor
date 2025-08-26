import React from 'react';
import { Card } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAppStore } from '../../store/appStore';

const CurrentChart: React.FC = () => {
  const { historyData, settings } = useAppStore();
  
  if (!settings.showCurrentGraphs) {
    return null;
  }

  const chartData = historyData.slice(-50).map(point => ({
    time: new Date(point.timestamp).toLocaleTimeString(),
    timestamp: point.timestamp,
    hvCurrent: point.values['2204AF'] || 0,
    chargeCurrent: point.values['224375'] || 0,
    acCurrent: point.values['224373'] || 0,
  }));

  return (
    <Card title="Current Monitoring" size="small" className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Current (A)', angle: -90, position: 'insideLeft' }}
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
            dataKey="hvCurrent" 
            stroke="#722ed1" 
            strokeWidth={2}
            name="HV Battery"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="chargeCurrent" 
            stroke="#52c41a" 
            strokeWidth={2}
            name="DC Charge"
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="acCurrent" 
            stroke="#faad14" 
            strokeWidth={1}
            name="AC Charge"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default CurrentChart;