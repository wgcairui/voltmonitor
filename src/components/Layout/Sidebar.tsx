import React from 'react';
import { Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Battery,
  Car,
  Search,
  Settings,
  Zap,
  BarChart3
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <LayoutDashboard size={16} />,
      label: 'Dashboard',
      title: 'Overview of all systems'
    },
    {
      key: '/volt',
      icon: <Battery size={16} />,
      label: 'Volt Monitor',
      title: 'Chevrolet Volt specific parameters'
    },
    {
      key: '/standard',
      icon: <Car size={16} />,
      label: 'Standard OBD',
      title: 'Standard OBD-II parameters'
    },
    {
      key: '/browser',
      icon: <Search size={16} />,
      label: 'PID Browser',
      title: 'Browse all 135 PID parameters'
    },
    {
      key: '/settings',
      icon: <Settings size={16} />,
      label: 'Settings',
      title: 'Application preferences and configuration'
    }
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[location.pathname]}
      items={menuItems}
      onClick={handleMenuClick}
      style={{
        height: '100%',
        borderRight: 0,
        background: 'transparent'
      }}
    />
  );
};

export default Sidebar;