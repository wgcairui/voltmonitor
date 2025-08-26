import React, { useEffect, useState } from 'react';
import { Layout, message } from 'antd';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Layout/Sidebar';
import TitleBar from '@/components/Layout/TitleBar';
import Dashboard from '@/components/Dashboard/Dashboard';
import VoltMonitor from '@/components/VoltMonitor/VoltMonitor';
import StandardOBD from '@/components/StandardOBD/StandardOBD';
import PIDBrowser from '@/components/PIDBrowser/PIDBrowser';
import Settings from '@/components/Settings/Settings';
import ConnectionPanel from '@/components/Connection/ConnectionPanel';
import { useAppStore } from '@/store/appStore';
import { ElectronEvents } from '@/types';

const { Content, Sider } = Layout;

const App: React.FC = () => {
  const navigate = useNavigate();
  const { 
    connectionStatus, 
    initializeApp, 
    isLoading,
    scanBluetoothDevices,
    connectToDevice,
    disconnectDevice,
    devices
  } = useAppStore();

  useEffect(() => {
    // 初始化应用
    initializeApp();
    
    // 设置 Electron 菜单事件监听
    if (window.electronAPI) {
      const electronAPI = window.electronAPI as any;
      
      // 菜单导航事件
      const handleMenuNavigate = (route: string) => {
        switch (route) {
          case 'dashboard':
            navigate('/');
            break;
          case 'volt':
            navigate('/volt');
            break;
          case 'standard':
            navigate('/standard');
            break;
          case 'browser':
            navigate('/browser');
            break;
          default:
            navigate('/');
        }
      };
      
      // 连接相关事件
      const handleScanDevices = () => {
        scanBluetoothDevices();
        message.info('Scanning for Bluetooth devices...');
      };
      
      const handleConnect = () => {
        if (devices.length > 0) {
          const firstDevice = devices[0];
          connectToDevice(firstDevice.address);
        } else {
          message.warning('No devices found. Please scan first.');
        }
      };
      
      const handleDisconnect = () => {
        disconnectDevice();
        message.info('Disconnecting from OBD device...');
      };
      
      // 其他事件处理
      const handlePreferences = () => {
        navigate('/settings');
      };
      
      const handleExportData = () => {
        message.info('Export data feature coming soon...');
      };
      
      // 注册事件监听器（在真实的 Electron 环境中）
      if (typeof electronAPI.onMenuEvent === 'function') {
        electronAPI.onMenuEvent('navigate', handleMenuNavigate);
        electronAPI.onMenuEvent('scan-devices', handleScanDevices);
        electronAPI.onMenuEvent('connect', handleConnect);
        electronAPI.onMenuEvent('disconnect', handleDisconnect);
        electronAPI.onMenuEvent('preferences', handlePreferences);
        electronAPI.onMenuEvent('export-data', handleExportData);
      }
    }
  }, [navigate, initializeApp, scanBluetoothDevices, connectToDevice, disconnectDevice, devices]);

  if (isLoading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
        color: 'white',
        fontSize: '18px'
      }}>
        Initializing VoltMonitor...
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* macOS 标题栏 */}
      <TitleBar />
      
      <Layout style={{ height: 'calc(100vh - 28px)' }}>
        {/* 侧边栏 */}
        <Sider
          width={240}
          className="app-sidebar"
          theme="dark"
        >
          <div style={{ 
            height: 64, 
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #434343'
          }}>
            <div style={{ 
              color: 'white', 
              fontSize: '18px', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1890ff, #722ed1)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              VoltMonitor
            </div>
          </div>
          <Sidebar />
        </Sider>

        {/* 主内容区 */}
        <Layout className="app-content">
          {/* 连接状态栏 */}
          <div style={{
            background: 'white',
            padding: '8px 16px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ fontSize: '14px', color: '#666' }}>
              PID Database: <strong>135 parameters</strong> (52 Volt + 83 Standard OBD-II)
            </div>
            <ConnectionPanel 
              status={connectionStatus}
              devices={devices}
              onScan={scanBluetoothDevices}
              onConnect={connectToDevice}
              onDisconnect={disconnectDevice}
            />
          </div>

          <Content style={{ padding: 0, overflow: 'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/volt" element={<VoltMonitor />} />
              <Route path="/standard" element={<StandardOBD />} />
              <Route path="/browser" element={<PIDBrowser />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default App;