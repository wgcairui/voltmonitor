import React from 'react';
import { Row, Col, Card, Statistic, Table, Empty, Tag, Button } from 'antd';
import { 
  Car, 
  Gauge, 
  Thermometer, 
  Activity,
  Fuel,
  Wind,
  Download
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { standardPIDs } from '../../services/pidDatabase';
import type { ColumnsType } from 'antd/es/table';

const StandardOBD: React.FC = () => {
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

  // 表格数据 - 显示所有标准 OBD-II PID 的当前值
  const tableData = standardPIDs.map(pid => ({
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
          {pid.toUpperCase()}
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
          'Engine': '#52c41a',
          'Fuel': '#faad14',
          'Temperature': '#ff4d4f',
          'Pressure': '#1890ff',
          'Speed': '#722ed1',
          'Load': '#13c2c2',
          'Control': '#eb2f96'
        };
        
        // 根据描述判断类别
        let category = 'Control';
        if (record.description.toLowerCase().includes('engine') || record.description.toLowerCase().includes('rpm')) category = 'Engine';
        else if (record.description.toLowerCase().includes('fuel')) category = 'Fuel';
        else if (record.description.toLowerCase().includes('temp')) category = 'Temperature';
        else if (record.description.toLowerCase().includes('pressure')) category = 'Pressure';
        else if (record.description.toLowerCase().includes('speed')) category = 'Speed';
        else if (record.description.toLowerCase().includes('load')) category = 'Load';
        
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
                Connect to view standard OBD-II parameters
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
          <h2 style={{ margin: 0, color: '#52c41a' }}>Standard OBD-II Monitor</h2>
          <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>
            83 Standard OBD-II parameters · Universal vehicle diagnostics
          </p>
        </div>
        <Button
          icon={<Download size={16} />}
          onClick={() => {
            // TODO: Export standard OBD data
            console.log('Export standard OBD data');
          }}
        >
          Export Data
        </Button>
      </div>

      {/* 关键指标概览 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="standard-card">
            <Statistic
              title="Engine RPM"
              value={formatValue(getStatValue('0C', 0), 0)}
              suffix="rpm"
              prefix={<Gauge size={20} />}
              valueStyle={{ color: '#52c41a', fontSize: '24px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="standard-card">
            <Statistic
              title="Vehicle Speed"
              value={formatValue(getStatValue('0D', 0))}
              suffix="km/h"
              prefix={<Car size={20} />}
              valueStyle={{ color: '#1890ff', fontSize: '24px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="standard-card">
            <Statistic
              title="Engine Load"
              value={formatValue(getStatValue('04', 0))}
              suffix="%"
              prefix={<Activity size={20} />}
              valueStyle={{ color: '#faad14', fontSize: '24px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="standard-card">
            <Statistic
              title="Fuel Level"
              value={formatValue(getStatValue('2F', 0))}
              suffix="%"
              prefix={<Fuel size={20} />}
              valueStyle={{ 
                color: getStatValue('2F', 0) > 25 ? '#52c41a' : '#ff4d4f',
                fontSize: '24px'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 温度监控 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={8}>
          <Card className="standard-card">
            <Statistic
              title="Coolant Temperature"
              value={formatValue(getStatValue('05', 0))}
              suffix="°C"
              prefix={<Thermometer size={20} />}
              valueStyle={{ 
                color: getStatValue('05', 0) > 100 ? '#cf1322' : '#1890ff',
                fontSize: '20px'
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="standard-card">
            <Statistic
              title="Intake Air Temperature"
              value={formatValue(getStatValue('0F', 0))}
              suffix="°C"
              prefix={<Wind size={20} />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card className="standard-card">
            <Statistic
              title="Throttle Position"
              value={formatValue(getStatValue('11', 0))}
              suffix="%"
              prefix={<Activity size={20} />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 压力和流量 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '20px' }}>
        <Col xs={24} sm={6}>
          <Card className="standard-card">
            <Statistic
              title="Fuel Pressure"
              value={formatValue(getStatValue('0A', 0))}
              suffix="kPa"
              prefix={<Activity size={16} />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card className="standard-card">
            <Statistic
              title="Manifold Pressure"
              value={formatValue(getStatValue('0B', 0))}
              suffix="kPa"
              prefix={<Activity size={16} />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card className="standard-card">
            <Statistic
              title="MAF Air Flow"
              value={formatValue(getStatValue('10', 0))}
              suffix="g/s"
              prefix={<Wind size={16} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={6}>
          <Card className="standard-card">
            <Statistic
              title="Timing Advance"
              value={formatValue(getStatValue('0E', 0))}
              suffix="°"
              prefix={<Gauge size={16} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细 PID 数据表格 */}
      <Card title="All Standard OBD-II Parameters" style={{ marginBottom: '16px' }}>
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

export default StandardOBD;