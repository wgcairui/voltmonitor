import React from 'react';
import { Row, Col, Card, Statistic, Progress, Alert, Empty } from 'antd';
import { 
  BatteryCharging, 
  Zap, 
  Thermometer, 
  Gauge, 
  Activity,
  Car
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import VoltageChart from './VoltageChart';
import CurrentChart from './CurrentChart';
import TemperatureChart from './TemperatureChart';
import MotorStatus from './MotorStatus';

const Dashboard: React.FC = () => {
  const { 
    obdData, 
    connectionStatus, 
    currentPIDValues,
    alerts 
  } = useAppStore();

  const isConnected = connectionStatus.connected;
  const recentAlerts = alerts.filter(alert => !alert.acknowledged).slice(0, 3);

  // 获取关键指标的当前值
  const getStatValue = (pidCode: string, fallback: number = 0) => {
    const pidResult = currentPIDValues[pidCode];
    if (pidResult && typeof pidResult.value === 'number') {
      return pidResult.value;
    }
    return fallback;
  };

  const formatValue = (value: number, decimals: number = 1): string => {
    return value.toFixed(decimals);
  };

  if (!isConnected) {
    return (
      <div style={{ padding: '24px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span style={{ fontSize: '16px', color: '#666' }}>
              Not connected to OBD device
              <br />
              <span style={{ fontSize: '14px', color: '#999' }}>
                Connect to a device to view real-time data
              </span>
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      {/* 告警区域 */}
      {recentAlerts.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {recentAlerts.map(alert => (
            <Alert
              key={alert.id}
              type={alert.type}
              message={alert.title}
              description={alert.message}
              showIcon
              closable
              style={{ marginBottom: '8px' }}
            />
          ))}
        </div>
      )}

      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={8} md={6}>
          <Card className="volt-card">
            <Statistic
              title="Battery SOC"
              value={formatValue(getStatValue('22005B', 0))}
              suffix="%"
              prefix={<BatteryCharging size={20} />}
              valueStyle={{ 
                color: getStatValue('22005B', 0) > 20 ? '#3f8600' : '#cf1322',
                fontSize: '20px'
              }}
            />
            <Progress
              percent={getStatValue('22005B', 0)}
              showInfo={false}
              size="small"
              strokeColor={{
                '0%': '#ff4d4f',
                '20%': '#faad14',
                '50%': '#1890ff',
                '80%': '#52c41a',
              }}
              style={{ marginTop: '8px' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6}>
          <Card className="volt-card">
            <Statistic
              title="HV Voltage"
              value={formatValue(getStatValue('2204B0', 0))}
              suffix="V"
              prefix={<Zap size={20} />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6}>
          <Card className="volt-card">
            <Statistic
              title="HV Current"
              value={formatValue(getStatValue('2204AF', 0))}
              suffix="A"
              prefix={<Activity size={20} />}
              valueStyle={{ 
                color: getStatValue('2204AF', 0) >= 0 ? '#52c41a' : '#1890ff',
                fontSize: '20px'
              }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6}>
          <Card className="standard-card">
            <Statistic
              title="Vehicle Speed"
              value={formatValue(getStatValue('0D', 0))}
              suffix="km/h"
              prefix={<Car size={20} />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 电池温度指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={12} sm={8} md={6}>
          <Card className="volt-card">
            <Statistic
              title="Battery Temp Max"
              value={formatValue(getStatValue('220425', 0))}
              suffix="°C"
              prefix={<Thermometer size={20} />}
              valueStyle={{ 
                color: getStatValue('220425', 0) > 40 ? '#cf1322' : '#1890ff',
                fontSize: '18px'
              }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6}>
          <Card className="volt-card">
            <Statistic
              title="Battery Temp Min"
              value={formatValue(getStatValue('220426', 0))}
              suffix="°C"
              prefix={<Thermometer size={20} />}
              valueStyle={{ 
                color: getStatValue('220426', 0) < 0 ? '#cf1322' : '#52c41a',
                fontSize: '18px'
              }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6}>
          <Card className="standard-card">
            <Statistic
              title="Engine RPM"
              value={formatValue(getStatValue('0C', 0), 0)}
              suffix="rpm"
              prefix={<Gauge size={20} />}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6}>
          <Card className="standard-card">
            <Statistic
              title="Engine Load"
              value={formatValue(getStatValue('04', 0))}
              suffix="%"
              prefix={<Activity size={20} />}
              valueStyle={{ color: '#faad14', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} lg={12}>
          <VoltageChart />
        </Col>
        <Col xs={24} lg={12}>
          <CurrentChart />
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} lg={12}>
          <TemperatureChart />
        </Col>
        <Col xs={24} lg={12}>
          <MotorStatus />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;