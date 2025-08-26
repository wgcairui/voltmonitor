import React from 'react';
import { Row, Col, Card, Statistic, Progress, Table, Empty, Tag, Button } from 'antd';
import { 
  BatteryCharging, 
  Zap, 
  Thermometer, 
  Activity,
  Power,
  RotateCcw,
  Download
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { voltPIDs } from '../../services/pidDatabase';
import type { ColumnsType } from 'antd/es/table';

const VoltMonitor: React.FC = () => {
  const { 
    connectionStatus, 
    currentPIDValues,
    obdData 
  } = useAppStore();

  const isConnected = connectionStatus.connected;

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

  // 表格数据 - 显示所有 Volt 专用 PID 的当前值
  const tableData = voltPIDs.map(pid => ({
    key: pid.pid,
    pid: pid.pid,
    description: pid.description,
    currentValue: currentPIDValues[pid.pid]?.value || 'N/A',
    unit: pid.unit,
    category: pid.category,
    formula: pid.formula,
    range: pid.range,
    lastUpdated: currentPIDValues[pid.pid]?.timestamp
  }));

  const columns: ColumnsType<any> = [
    {
      title: 'PID',
      dataIndex: 'pid',
      key: 'pid',
      width: 80,
      render: (pid: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold' }}>
          {pid}
        </span>
      )
    },
    {
      title: 'Parameter',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string, record: any) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          {record.range && (
            <div style={{ fontSize: '11px', color: '#999' }}>
              Range: {record.range}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Current Value',
      dataIndex: 'currentValue',
      key: 'currentValue',
      width: 120,
      render: (value: any, record: any) => {
        const isUpdating = record.lastUpdated && (Date.now() - record.lastUpdated < 2000);
        return (
          <div className={`live-value ${isUpdating ? 'updating' : ''}`}>
            <span style={{ fontFamily: 'monospace' }}>
              {typeof value === 'number' ? value.toFixed(2) : value}
            </span>
            {record.unit && <span style={{ marginLeft: '4px' }}>{record.unit}</span>}
          </div>
        );
      }
    },
    {
      title: 'Category',
      key: 'category',
      width: 100,
      render: (_, record: any) => {
        const categoryColors: Record<string, string> = {
          'Battery': '#722ed1',
          'Motor': '#52c41a',
          'Charging': '#1890ff',
          'Control': '#faad14',
          'Thermal': '#ff4d4f'
        };
        
        // 根据描述判断类别
        let category = 'Control';
        if (record.description.toLowerCase().includes('battery')) category = 'Battery';
        else if (record.description.toLowerCase().includes('motor')) category = 'Motor';
        else if (record.description.toLowerCase().includes('charg')) category = 'Charging';
        else if (record.description.toLowerCase().includes('temp')) category = 'Thermal';
        
        return (
          <Tag color={categoryColors[category]} style={{ fontSize: '11px' }}>
            {category}
          </Tag>
        );
      }
    }
  ];

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
                Connect to view Chevrolet Volt specific parameters
              </span>
            </span>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      {/* 页面标题和操作 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div>
          <h2 style={{ margin: 0, color: '#722ed1' }}>Chevrolet Volt Monitor</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            52 Volt-specific parameters · Real-time hybrid system monitoring
          </p>
        </div>
        <Button
          icon={<Download size={16} />}
          onClick={() => {
            // TODO: Export Volt data
            console.log('Export Volt data');
          }}
        >
          Export Data
        </Button>
      </div>

      {/* 关键指标概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="volt-card">
            <Statistic
              title="Battery SOC"
              value={formatValue(getStatValue('22005B', 0))}
              suffix="%"
              prefix={<BatteryCharging size={20} />}
              valueStyle={{ 
                color: getStatValue('22005B', 0) > 20 ? '#3f8600' : '#cf1322',
                fontSize: '24px'
              }}
            />
            <Progress
              percent={getStatValue('22005B', 0)}
              showInfo={false}
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

        <Col xs={24} sm={12} lg={6}>
          <Card className="volt-card">
            <Statistic
              title="HV Voltage"
              value={formatValue(getStatValue('2204B0', 0))}
              suffix="V"
              prefix={<Zap size={20} />}
              valueStyle={{ color: '#722ed1', fontSize: '24px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="volt-card">
            <Statistic
              title="HV Current"
              value={formatValue(getStatValue('2204AF', 0), 2)}
              suffix="A"
              prefix={<Activity size={20} />}
              valueStyle={{ 
                color: getStatValue('2204AF', 0) >= 0 ? '#52c41a' : '#1890ff',
                fontSize: '24px'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="volt-card">
            <Statistic
              title="Charging Power"
              value={formatValue(getStatValue('2243A5', 0), 1)}
              suffix="kW"
              prefix={<Power size={20} />}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 电机状态 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} lg={12}>
          <Card title="Motor A (Front)" className="volt-card">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="RPM"
                  value={formatValue(getStatValue('220272', 0), 0)}
                  prefix={<RotateCcw size={16} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Torque"
                  value={formatValue(getStatValue('220273', 0), 1)}
                  suffix="Nm"
                  prefix={<Zap size={16} />}
                  valueStyle={{ 
                    color: getStatValue('220273', 0) >= 0 ? '#52c41a' : '#1890ff'
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Motor B (Rear)" className="volt-card">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="RPM"
                  value={formatValue(getStatValue('220274', 0), 0)}
                  prefix={<RotateCcw size={16} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Torque"
                  value={formatValue(getStatValue('220275', 0), 1)}
                  suffix="Nm"
                  prefix={<Zap size={16} />}
                  valueStyle={{ 
                    color: getStatValue('220275', 0) >= 0 ? '#52c41a' : '#1890ff'
                  }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* 温度监控 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={8}>
          <Card className="volt-card">
            <Statistic
              title="Battery Temp Max"
              value={formatValue(getStatValue('220425', 0))}
              suffix="°C"
              prefix={<Thermometer size={20} />}
              valueStyle={{ 
                color: getStatValue('220425', 0) > 40 ? '#cf1322' : '#1890ff'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="volt-card">
            <Statistic
              title="Battery Temp Min"
              value={formatValue(getStatValue('220426', 0))}
              suffix="°C"
              prefix={<Thermometer size={20} />}
              valueStyle={{ 
                color: getStatValue('220426', 0) < 0 ? '#cf1322' : '#52c41a'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="volt-card">
            <Statistic
              title="Control Voltage"
              value={formatValue(getStatValue('220042', 0))}
              suffix="V"
              prefix={<Zap size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细 PID 数据表格 */}
      <Card title="All Volt Parameters" style={{ marginBottom: '16px' }}>
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} parameters`
          }}
          scroll={{ x: true }}
          size="small"
        />
      </Card>
    </div>
  );
};

export default VoltMonitor;