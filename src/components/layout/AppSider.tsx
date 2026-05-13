import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  InboxOutlined,
  ScheduleOutlined,
  TeamOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  ToolOutlined,
  BarChartOutlined,
  SettingOutlined,
  FileSearchOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '首页 Dashboard' },
  { key: '/samples', icon: <InboxOutlined />, label: '样品管理' },
  { key: '/tasks', icon: <ExperimentOutlined />, label: '检测管理' },
  { key: '/reports', icon: <FileTextOutlined />, label: '报告管理' },
  { key: '/schedules', icon: <ScheduleOutlined />, label: '排程管理' },
  { key: '/clients', icon: <TeamOutlined />, label: '客户管理' },
  { key: '/contracts', icon: <BankOutlined />, label: '合同管理' },
  { key: '/quality', icon: <SafetyCertificateOutlined />, label: '质控管理' },
  { key: '/instruments', icon: <ToolOutlined />, label: '仪器设备' },
  { key: '/statistics', icon: <BarChartOutlined />, label: '统计分析' },
  { key: '/query', icon: <FileSearchOutlined />, label: '数据查询' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

const recentItems = [
  { key: '/samples/SP-2025-001', label: 'SP-2025-001' },
  { key: '/reports/RP-2025-045', label: 'RP-2025-045' },
  { key: '/tasks/TK-2025-128', label: 'TK-2025-128' },
];

export const AppSider: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const selectedKey = menuItems.some((item) => location.pathname.startsWith(item.key))
    ? menuItems.find((item) => location.pathname.startsWith(item.key))?.key
    : '/dashboard';

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      collapsedWidth={80}
      style={{
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)',
        overflow: 'auto',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey || '/dashboard']}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, paddingTop: 8 }}
      />

      {!collapsed && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <HistoryOutlined />
            最近访问
          </Text>
          <Menu
            mode="inline"
            selectedKeys={[]}
            items={recentItems.map((item) => ({
              key: item.key,
              label: item.label,
            }))}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </div>
      )}
    </Sider>
  );
};
