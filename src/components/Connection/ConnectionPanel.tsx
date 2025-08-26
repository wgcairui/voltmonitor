import React, { useState } from 'react';
import { Button, Select, Spin, Dropdown, Space, Typography, Badge } from 'antd';
import type { MenuProps } from 'antd';
import { 
  Bluetooth, 
  BluetoothConnected, 
  RefreshCw, 
  Wifi, 
  WifiOff,
  MoreVertical,
  Settings 
} from 'lucide-react';
import { ConnectionPanelProps } from '../../types';

const { Text } = Typography;

const ConnectionPanel: React.FC<ConnectionPanelProps> = ({
  status,
  devices,
  onScan,
  onConnect,
  onDisconnect,
  scanning = false
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('');

  const handleConnect = () => {
    if (selectedDevice) {
      onConnect(selectedDevice);
    } else if (devices.length > 0) {
      onConnect(devices[0].address);
    }
  };

  const deviceMenuItems: MenuProps['items'] = [
    {
      key: 'scan',
      label: 'Scan for Devices',
      icon: <RefreshCw size={14} />,
      onClick: onScan
    },
    {
      key: 'settings',
      label: 'Connection Settings',
      icon: <Settings size={14} />,
      disabled: true // TODO: Implement settings
    }
  ];

  const getStatusColor = () => {
    if (status.connected) return '#52c41a';
    if (scanning) return '#1890ff';
    return '#ff4d4f';
  };

  const getStatusText = () => {
    if (status.connected) return 'Connected';
    if (scanning) return 'Scanning...';
    return 'Disconnected';
  };

  const getStatusIcon = () => {
    if (status.connected) return <BluetoothConnected size={14} />;
    if (scanning) return <Spin size="small" />;
    return <WifiOff size={14} />;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* 连接状态指示 */}
      <div className="connection-status" style={{
        background: status.connected ? '#f6ffed' : scanning ? '#e6f7ff' : '#fff2f0',
        color: getStatusColor()
      }}>
        {getStatusIcon()}
        <Text style={{ color: getStatusColor(), fontSize: '12px', fontWeight: 500 }}>
          {getStatusText()}
        </Text>
        {status.connected && status.dataRate !== undefined && (
          <Text style={{ color: '#999', fontSize: '11px' }}>
            {status.dataRate} PID/s
          </Text>
        )}
      </div>

      {!status.connected && (
        <>
          {/* 设备选择 */}
          <Select
            value={selectedDevice}
            onChange={setSelectedDevice}
            placeholder="Select OBD device"
            style={{ minWidth: '160px' }}
            size="small"
            loading={scanning}
            notFoundContent={scanning ? 'Scanning...' : 'No devices found'}
          >
            {devices.map(device => (
              <Select.Option key={device.address} value={device.address}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
                      {device.name || 'Unknown Device'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#999' }}>
                      {device.address}
                    </div>
                  </div>
                  {device.rssi && (
                    <Badge 
                      count={`${device.rssi}dBm`} 
                      style={{ 
                        backgroundColor: device.rssi > -50 ? '#52c41a' : device.rssi > -70 ? '#faad14' : '#ff4d4f',
                        fontSize: '10px'
                      }} 
                    />
                  )}
                </div>
              </Select.Option>
            ))}
          </Select>

          {/* 连接按钮 */}
          <Button
            type="primary"
            size="small"
            icon={<Bluetooth size={14} />}
            onClick={handleConnect}
            disabled={devices.length === 0 && !selectedDevice}
            loading={scanning}
          >
            Connect
          </Button>

          {/* 扫描按钮 */}
          <Button
            size="small"
            icon={<RefreshCw size={14} />}
            onClick={onScan}
            loading={scanning}
            title="Scan for Bluetooth devices"
          />
        </>
      )}

      {status.connected && (
        <>
          {/* 连接信息 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <Text style={{ fontSize: '12px', fontWeight: 500, color: '#333' }}>
              {status.deviceName || 'OBD Device'}
            </Text>
            <Text style={{ fontSize: '11px', color: '#999' }}>
              {status.deviceAddress}
            </Text>
          </div>

          {/* 断开按钮 */}
          <Button
            size="small"
            danger
            icon={<WifiOff size={14} />}
            onClick={onDisconnect}
          >
            Disconnect
          </Button>
        </>
      )}

      {/* 更多选项 */}
      <Dropdown menu={{ items: deviceMenuItems }} placement="bottomRight">
        <Button 
          size="small" 
          type="text" 
          icon={<MoreVertical size={14} />}
          style={{ color: '#666' }}
        />
      </Dropdown>
    </div>
  );
};

export default ConnectionPanel;