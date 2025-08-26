import React from 'react';
import { 
  Card, 
  Form, 
  Switch, 
  InputNumber, 
  Select, 
  Divider, 
  Button, 
  Space, 
  message,
  Row,
  Col,
  Typography,
  Slider
} from 'antd';
import { 
  Settings as SettingsIcon,
  Bluetooth,
  Database,
  Bell,
  Palette,
  BarChart3,
  Save,
  RotateCcw
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import type { AppSettings } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const { settings, updateSettings } = useAppStore();
  const [form] = Form.useForm();

  const handleSave = async (values: AppSettings) => {
    try {
      updateSettings(values);
      message.success('Settings saved successfully');
    } catch (error) {
      message.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('Settings reset to current values');
  };

  const handleRestoreDefaults = () => {
    const defaultSettings = {
      autoReconnect: true,
      reconnectInterval: 5000,
      connectionTimeout: 10000,
      updateInterval: 1000,
      maxHistoryPoints: 1000,
      enableDataLogging: true,
      enableAlerts: true,
      alertSound: true,
      alertThresholds: {},
      theme: 'light' as const,
      showVoltageGraphs: true,
      showCurrentGraphs: true,
      showTemperatureGraphs: true,
      dashboardLayout: {
        components: [],
        columns: 3
      },
      favoritesPIDs: []
    };
    
    form.setFieldsValue(defaultSettings);
    updateSettings(defaultSettings);
    message.success('Settings restored to defaults');
  };

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      {/* 页面标题 */}
      <div style={{ 
        marginBottom: '24px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SettingsIcon size={24} />
          Settings
        </Title>
        <Text type="secondary">Configure VoltMonitor preferences and behavior</Text>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
        onFinish={handleSave}
        autoComplete="off"
      >
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={12}>
            {/* 连接设置 */}
            <Card 
              size="small" 
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bluetooth size={16} />
                  Connection Settings
                </span>
              }
              style={{ marginBottom: '16px' }}
            >
              <Form.Item 
                name="autoReconnect" 
                valuePropName="checked"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Auto Reconnect</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Automatically reconnect to the last connected device
                    </Text>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item 
                name="reconnectInterval"
                label="Reconnect Interval (ms)"
              >
                <InputNumber
                  min={1000}
                  max={30000}
                  step={1000}
                  style={{ width: '100%' }}
                  formatter={value => `${value}ms`}
                  parser={value => value?.replace('ms', '') || ''}
                />
              </Form.Item>

              <Form.Item 
                name="connectionTimeout"
                label="Connection Timeout (ms)"
              >
                <InputNumber
                  min={5000}
                  max={60000}
                  step={5000}
                  style={{ width: '100%' }}
                  formatter={value => `${value}ms`}
                  parser={value => value?.replace('ms', '') || ''}
                />
              </Form.Item>
            </Card>

            {/* 数据设置 */}
            <Card 
              size="small" 
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={16} />
                  Data Settings
                </span>
              }
              style={{ marginBottom: '16px' }}
            >
              <Form.Item 
                name="updateInterval"
                label="Update Interval (ms)"
              >
                <Slider
                  min={100}
                  max={5000}
                  step={100}
                  marks={{
                    100: '100ms',
                    1000: '1s',
                    2500: '2.5s',
                    5000: '5s'
                  }}
                  tooltip={{
                    formatter: value => `${value}ms`
                  }}
                />
              </Form.Item>

              <Form.Item 
                name="maxHistoryPoints"
                label="Max History Points"
              >
                <Select>
                  <Option value={500}>500 points</Option>
                  <Option value={1000}>1,000 points</Option>
                  <Option value={2000}>2,000 points</Option>
                  <Option value={5000}>5,000 points</Option>
                </Select>
              </Form.Item>

              <Form.Item 
                name="enableDataLogging" 
                valuePropName="checked"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Enable Data Logging</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Save historical data to local database
                    </Text>
                  </div>
                  <Switch />
                </div>
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            {/* 告警设置 */}
            <Card 
              size="small" 
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Bell size={16} />
                  Alert Settings
                </span>
              }
              style={{ marginBottom: '16px' }}
            >
              <Form.Item 
                name="enableAlerts" 
                valuePropName="checked"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Enable Alerts</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Show notifications for threshold violations
                    </Text>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item 
                name="alertSound" 
                valuePropName="checked"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>Alert Sound</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      Play sound notifications for alerts
                    </Text>
                  </div>
                  <Switch />
                </div>
              </Form.Item>
            </Card>

            {/* UI 设置 */}
            <Card 
              size="small" 
              title={
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Palette size={16} />
                  Display Settings
                </span>
              }
              style={{ marginBottom: '16px' }}
            >
              <Form.Item 
                name="theme"
                label="Theme"
              >
                <Select>
                  <Option value="light">Light</Option>
                  <Option value="dark">Dark</Option>
                  <Option value="auto">Auto</Option>
                </Select>
              </Form.Item>

              <Divider style={{ margin: '12px 0' }} />

              <div style={{ marginBottom: '12px' }}>
                <Text strong>Chart Display</Text>
              </div>

              <Form.Item 
                name="showVoltageGraphs" 
                valuePropName="checked"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Voltage Charts</span>
                  <Switch size="small" />
                </div>
              </Form.Item>

              <Form.Item 
                name="showCurrentGraphs" 
                valuePropName="checked"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Current Charts</span>
                  <Switch size="small" />
                </div>
              </Form.Item>

              <Form.Item 
                name="showTemperatureGraphs" 
                valuePropName="checked"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Temperature Charts</span>
                  <Switch size="small" />
                </div>
              </Form.Item>
            </Card>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <Card size="small">
          <Space>
            <Button 
              type="primary" 
              htmlType="submit"
              icon={<Save size={16} />}
            >
              Save Settings
            </Button>
            
            <Button 
              onClick={handleReset}
              icon={<RotateCcw size={16} />}
            >
              Reset
            </Button>
            
            <Button 
              danger
              onClick={handleRestoreDefaults}
            >
              Restore Defaults
            </Button>
          </Space>

          <Divider style={{ margin: '16px 0' }} />

          <div style={{ fontSize: '12px', color: '#666' }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>VoltMonitor v1.0.0</strong>
            </div>
            <div>
              Chevrolet Volt OBD-II monitoring application
            </div>
            <div style={{ marginTop: '8px' }}>
              PID Database: 52 Volt-specific + 83 Standard OBD-II = 135 total parameters
            </div>
          </div>
        </Card>
      </Form>
    </div>
  );
};

export default Settings;