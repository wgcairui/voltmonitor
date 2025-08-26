import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme, App as AntApp } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Ant Design 主题配置
const antdTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a', 
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    borderRadius: 6,
    wireframe: false,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    Layout: {
      bodyBg: '#f5f5f5',
      siderBg: '#001529',
      triggerBg: '#002140',
    },
    Menu: {
      darkItemBg: '#001529',
      darkItemSelectedBg: '#1890ff',
      darkItemHoverBg: '#112545',
    },
    Card: {
      borderRadiusLG: 8,
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);