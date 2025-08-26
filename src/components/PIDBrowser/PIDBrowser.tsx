import React, { useState, useMemo } from 'react';
import { Table, Input, Select, Card, Tag, Button, Space, Tooltip, Badge, Switch } from 'antd';
import { Search, Download, Filter, Star, Eye } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { voltPIDs, standardPIDs, PIDDefinition } from '../../services/pidDatabase';
import type { ColumnsType } from 'antd/es/table';

const { Search: AntSearch } = Input;
const { Option } = Select;

const PIDBrowser: React.FC = () => {
  const { 
    currentPIDValues, 
    settings, 
    updateSettings,
    connectionStatus 
  } = useAppStore();

  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  // 合并所有 PID 数据
  const allPIDs = useMemo(() => [...voltPIDs, ...standardPIDs], []);

  // 过滤和搜索逻辑
  const filteredPIDs = useMemo(() => {
    return allPIDs.filter(pid => {
      // 文本搜索
      const matchesSearch = !searchText || 
        pid.pid.toLowerCase().includes(searchText.toLowerCase()) ||
        pid.description.toLowerCase().includes(searchText.toLowerCase());

      // 类别过滤
      const matchesCategory = categoryFilter === 'all' || pid.category === categoryFilter;

      // 仅显示活跃 PID
      const matchesActive = !showOnlyActive || currentPIDValues[pid.pid];

      return matchesSearch && matchesCategory && matchesActive;
    });
  }, [allPIDs, searchText, categoryFilter, showOnlyActive, currentPIDValues]);

  // 切换收藏状态
  const toggleFavorite = (pidCode: string) => {
    const currentFavorites = settings.favoritesPIDs || [];
    const isFavorite = currentFavorites.includes(pidCode);
    
    const newFavorites = isFavorite
      ? currentFavorites.filter(code => code !== pidCode)
      : [...currentFavorites, pidCode];
      
    updateSettings({ favoritesPIDs: newFavorites });
  };

  const columns: ColumnsType<PIDDefinition> = [
    {
      title: 'Favorite',
      key: 'favorite',
      width: 60,
      render: (_, record) => {
        const isFavorite = settings.favoritesPIDs?.includes(record.pid);
        return (
          <Button
            type="text"
            size="small"
            icon={<Star size={14} />}
            style={{ 
              color: isFavorite ? '#faad14' : '#d9d9d9',
              background: isFavorite ? '#fffbe6' : 'transparent'
            }}
            onClick={() => toggleFavorite(record.pid)}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          />
        );
      }
    },
    {
      title: 'PID',
      dataIndex: 'pid',
      key: 'pid',
      width: 100,
      render: (pid: string, record) => (
        <div>
          <span style={{ 
            fontFamily: 'monospace', 
            fontSize: '13px', 
            fontWeight: 'bold',
            color: record.category === 'volt' ? '#722ed1' : '#52c41a'
          }}>
            {pid.toUpperCase()}
          </span>
          {currentPIDValues[pid] && (
            <div style={{ fontSize: '10px', color: '#52c41a' }}>
              <Eye size={10} style={{ marginRight: '2px' }} />
              LIVE
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.pid.localeCompare(b.pid),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text: string, record) => (
        <div>
          <div style={{ fontWeight: 500, marginBottom: '2px' }}>{text}</div>
          {record.notes && (
            <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
              {record.notes}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Current Value',
      key: 'currentValue',
      width: 120,
      render: (_, record) => {
        const pidResult = currentPIDValues[record.pid];
        if (!pidResult) {
          return <span style={{ color: '#d9d9d9', fontSize: '12px' }}>No data</span>;
        }

        const isUpdating = pidResult.timestamp && (Date.now() - pidResult.timestamp < 2000);
        return (
          <div className={`live-value ${isUpdating ? 'updating' : ''}`}>
            <span style={{ fontFamily: 'monospace' }}>
              {typeof pidResult.value === 'number' 
                ? pidResult.value.toFixed(2) 
                : pidResult.value}
            </span>
            {record.unit && (
              <span style={{ marginLeft: '4px' }}>{record.unit}</span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => {
        const categoryConfig = {
          'volt': { color: '#722ed1', text: 'Volt' },
          'standard': { color: '#52c41a', text: 'Standard' },
          'custom': { color: '#1890ff', text: 'Custom' }
        };
        
        const config = categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.custom;
        
        return (
          <Tag color={config.color} style={{ fontSize: '11px' }}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Volt', value: 'volt' },
        { text: 'Standard', value: 'standard' },
        { text: 'Custom', value: 'custom' }
      ],
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      render: (unit: string) => (
        <span style={{ 
          fontSize: '12px', 
          color: '#666',
          fontFamily: 'monospace'
        }}>
          {unit || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Range',
      dataIndex: 'range',
      key: 'range',
      width: 100,
      ellipsis: true,
      render: (range: string) => (
        <Tooltip title={range} placement="topLeft">
          <span style={{ fontSize: '11px', color: '#999' }}>
            {range || 'N/A'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Formula',
      dataIndex: 'formula',
      key: 'formula',
      width: 120,
      ellipsis: true,
      render: (formula: string) => (
        <Tooltip title={formula} placement="topLeft">
          <span style={{ 
            fontSize: '11px', 
            color: '#666',
            fontFamily: 'monospace'
          }}>
            {formula || 'N/A'}
          </span>
        </Tooltip>
      ),
    }
  ];

  const handleExport = () => {
    const dataToExport = filteredPIDs.map(pid => ({
      PID: pid.pid,
      Description: pid.description,
      Category: pid.category,
      Unit: pid.unit,
      Formula: pid.formula,
      Range: pid.range,
      CurrentValue: currentPIDValues[pid.pid]?.value || 'N/A',
      LastUpdated: currentPIDValues[pid.pid]?.timestamp 
        ? new Date(currentPIDValues[pid.pid].timestamp).toISOString()
        : 'Never'
    }));

    // TODO: Implement actual CSV export
    console.log('Exporting PID data:', dataToExport);
  };

  const getStatistics = () => {
    const totalPIDs = allPIDs.length;
    const voltPIDsCount = allPIDs.filter(p => p.category === 'volt').length;
    const standardPIDsCount = allPIDs.filter(p => p.category === 'standard').length;
    const activePIDs = Object.keys(currentPIDValues).length;
    const favoritesPIDs = settings.favoritesPIDs?.length || 0;

    return {
      total: totalPIDs,
      volt: voltPIDsCount,
      standard: standardPIDsCount,
      active: activePIDs,
      favorites: favoritesPIDs
    };
  };

  const stats = getStatistics();

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      {/* 页面标题和统计 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div>
          <h2 style={{ margin: 0 }}>PID Browser</h2>
          <Space style={{ marginTop: '4px' }}>
            <Badge count={stats.total} showZero style={{ backgroundColor: '#722ed1' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Total</span>
            </Badge>
            <Badge count={stats.volt} showZero style={{ backgroundColor: '#722ed1' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Volt</span>
            </Badge>
            <Badge count={stats.standard} showZero style={{ backgroundColor: '#52c41a' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Standard</span>
            </Badge>
            <Badge count={stats.active} showZero style={{ backgroundColor: '#1890ff' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Active</span>
            </Badge>
            <Badge count={stats.favorites} showZero style={{ backgroundColor: '#faad14' }}>
              <span style={{ fontSize: '12px', color: '#666' }}>Favorites</span>
            </Badge>
          </Space>
        </div>
        
        <Button
          icon={<Download size={16} />}
          onClick={handleExport}
          disabled={filteredPIDs.length === 0}
        >
          Export ({filteredPIDs.length})
        </Button>
      </div>

      {/* 搜索和过滤控件 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space wrap style={{ width: '100%' }}>
          <AntSearch
            placeholder="Search PIDs or descriptions..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<Search size={14} />}
            allowClear
          />
          
          <Select
            value={categoryFilter}
            onChange={setCategoryFilter}
            style={{ width: 120 }}
            size="middle"
          >
            <Option value="all">All Categories</Option>
            <Option value="volt">Volt PIDs</Option>
            <Option value="standard">Standard PIDs</Option>
          </Select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Switch 
              size="small"
              checked={showOnlyActive}
              onChange={setShowOnlyActive}
              disabled={!connectionStatus.connected}
            />
            <span style={{ fontSize: '12px', color: '#666' }}>
              Active only {connectionStatus.connected ? `(${stats.active})` : '(Disconnected)'}
            </span>
          </div>
        </Space>
      </Card>

      {/* PID 表格 */}
      <Card>
        <Table
          className="pid-browser"
          columns={columns}
          dataSource={filteredPIDs}
          rowKey="pid"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} PIDs`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: true, y: 'calc(100vh - 300px)' }}
          size="small"
          bordered
          rowClassName={(record) => {
            if (settings.favoritesPIDs?.includes(record.pid)) {
              return 'favorite-row';
            }
            if (currentPIDValues[record.pid]) {
              return 'active-row';
            }
            return '';
          }}
        />
      </Card>

      <style jsx>{`
        .favorite-row {
          background: #fffbe6 !important;
        }
        .active-row {
          background: #f6ffed !important;
        }
      `}</style>
    </div>
  );
};

export default PIDBrowser;