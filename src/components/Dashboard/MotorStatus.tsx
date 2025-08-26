import React from 'react';
import { Card, Row, Col, Statistic, Progress } from 'antd';
import { RotateCcw, Zap } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const MotorStatus: React.FC = () => {
  const { currentPIDValues } = useAppStore();

  const getStatValue = (pidCode: string, fallback: number = 0) => {
    const pidResult = currentPIDValues[pidCode];
    if (pidResult && typeof pidResult.value === 'number') {
      return pidResult.value;
    }
    return fallback;
  };

  const motorARPM = getStatValue('220272', 0);
  const motorATorque = getStatValue('220273', 0);
  const motorBRPM = getStatValue('220274', 0);
  const motorBTorque = getStatValue('220275', 0);

  const getMotorColor = (rpm: number) => {
    if (rpm === 0) return '#d9d9d9';
    if (rpm < 1000) return '#52c41a';
    if (rpm < 2000) return '#1890ff';
    if (rpm < 3000) return '#faad14';
    return '#ff4d4f';
  };

  const getTorqueColor = (torque: number) => {
    if (torque > 0) return '#52c41a'; // 正扭矩（驱动）
    if (torque < 0) return '#1890ff'; // 负扭矩（再生制动）
    return '#d9d9d9';
  };

  return (
    <Card title="Motor Status" size="small" className="chart-container">
      <Row gutter={[16, 16]}>
        {/* Motor A */}
        <Col span={12}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#666' }}>Motor A (Front)</h4>
            
            <Statistic
              title="RPM"
              value={Math.abs(motorARPM).toFixed(0)}
              prefix={<RotateCcw size={16} />}
              valueStyle={{ 
                color: getMotorColor(Math.abs(motorARPM)),
                fontSize: '20px'
              }}
            />
            
            <Progress
              type="circle"
              percent={Math.min((Math.abs(motorARPM) / 3000) * 100, 100)}
              size={80}
              strokeColor={getMotorColor(Math.abs(motorARPM))}
              format={() => ''}
              style={{ margin: '8px 0' }}
            />
            
            <Statistic
              title="Torque"
              value={motorATorque.toFixed(1)}
              suffix="Nm"
              prefix={<Zap size={16} />}
              valueStyle={{ 
                color: getTorqueColor(motorATorque),
                fontSize: '16px'
              }}
            />
            
            <div style={{ 
              fontSize: '12px', 
              color: '#999', 
              marginTop: '4px'
            }}>
              {motorATorque > 0 ? 'Drive' : motorATorque < 0 ? 'Regen' : 'Idle'}
            </div>
          </div>
        </Col>

        {/* Motor B */}
        <Col span={12}>
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#666' }}>Motor B (Rear)</h4>
            
            <Statistic
              title="RPM"
              value={Math.abs(motorBRPM).toFixed(0)}
              prefix={<RotateCcw size={16} />}
              valueStyle={{ 
                color: getMotorColor(Math.abs(motorBRPM)),
                fontSize: '20px'
              }}
            />
            
            <Progress
              type="circle"
              percent={Math.min((Math.abs(motorBRPM) / 3000) * 100, 100)}
              size={80}
              strokeColor={getMotorColor(Math.abs(motorBRPM))}
              format={() => ''}
              style={{ margin: '8px 0' }}
            />
            
            <Statistic
              title="Torque"
              value={motorBTorque.toFixed(1)}
              suffix="Nm"
              prefix={<Zap size={16} />}
              valueStyle={{ 
                color: getTorqueColor(motorBTorque),
                fontSize: '16px'
              }}
            />
            
            <div style={{ 
              fontSize: '12px', 
              color: '#999', 
              marginTop: '4px'
            }}>
              {motorBTorque > 0 ? 'Drive' : motorBTorque < 0 ? 'Regen' : 'Idle'}
            </div>
          </div>
        </Col>
      </Row>

      {/* 综合状态指示 */}
      <div style={{ 
        textAlign: 'center', 
        padding: '12px 0', 
        borderTop: '1px solid #f0f0f0',
        marginTop: '8px'
      }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
          System Status
        </div>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 'bold',
          color: (motorARPM !== 0 || motorBRPM !== 0) ? '#52c41a' : '#d9d9d9'
        }}>
          {(motorARPM !== 0 || motorBRPM !== 0) ? 'ACTIVE' : 'STANDBY'}
        </div>
      </div>
    </Card>
  );
};

export default MotorStatus;