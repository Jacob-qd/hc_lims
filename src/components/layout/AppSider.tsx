import React, { useMemo, useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLabTypeStore } from '../../stores/labTypeStore';
import {
  DashboardOutlined, ExperimentOutlined, FileTextOutlined,
  InboxOutlined, ScheduleOutlined, TeamOutlined,
  BankOutlined, SafetyCertificateOutlined, ToolOutlined,
  BarChartOutlined, SettingOutlined, FileSearchOutlined,
  HistoryOutlined, UserOutlined, BookOutlined, WarningOutlined,
  TrophyOutlined, ShopOutlined, ProfileOutlined, ApartmentOutlined,
  FundOutlined, CalendarOutlined, SafetyOutlined,
  CloudServerOutlined, ApiOutlined, RobotOutlined, LinkOutlined,
  DatabaseOutlined, AuditOutlined, BellOutlined, QuestionCircleOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '首页' },
  { key: 'divider1', type: 'divider' as const },
  { key: 'detection', icon: <ExperimentOutlined />, label: '检测实验室', children: [
    { key: '/samples', icon: <InboxOutlined />, label: '样品管理' },
    { key: '/tasks', icon: <ExperimentOutlined />, label: '检测管理' },
    { key: '/reports', icon: <FileTextOutlined />, label: '报告管理' },
    { key: '/certificates', icon: <SafetyCertificateOutlined />, label: '签名证书' },
    { key: '/quality', icon: <SafetyCertificateOutlined />, label: '质量控制' },
    { key: '/instruments', icon: <ToolOutlined />, label: '仪器管理' },
    { key: '/inventory', icon: <ShopOutlined />, label: '库存管理' },
    { key: '/methods', icon: <ProfileOutlined />, label: '方法管理' },
  ]},
  { key: 'business', icon: <TeamOutlined />, label: '商务管理', children: [
    { key: '/orders', icon: <BankOutlined />, label: '委托管理' },
    { key: '/clients', icon: <TeamOutlined />, label: '客户管理' },
    { key: '/contracts', icon: <BankOutlined />, label: '合同管理' },
  ]},
  { key: 'admin', icon: <SettingOutlined />, label: '运营管理', children: [
    { key: '/personnel', icon: <UserOutlined />, label: '人员与培训' },
    { key: '/schedules', icon: <ScheduleOutlined />, label: '排程管理' },
    { key: '/query', icon: <FileSearchOutlined />, label: '综合查询' },
    { key: '/statistics', icon: <BarChartOutlined />, label: '数据分析' },
    { key: '/settings', icon: <SettingOutlined />, label: '系统管理' },
  ]},
  { key: 'tools', icon: <ToolOutlined />, label: '系统工具', children: [
    { key: '/workflow', icon: <ApartmentOutlined />, label: '工作流引擎' },
    { key: '/reports/engine', icon: <BarChartOutlined />, label: '报表引擎' },
    { key: '/coc', icon: <HistoryOutlined />, label: 'COC监管链' },
    { key: '/backup', icon: <DatabaseOutlined />, label: '数据备份' },
    { key: '/system-monitor', icon: <CloudServerOutlined />, label: '系统监控' },
    { key: '/instruments/data', icon: <ApiOutlined />, label: '仪器数据直连' },
    { key: '/proficiency-testing', icon: <TrophyOutlined />, label: '能力验证' },
    { key: '/ai-assistant', icon: <RobotOutlined />, label: 'AI助手' },
    { key: '/settings/integration', icon: <LinkOutlined />, label: '企业集成' },
    { key: '/settings/field-configs', icon: <SettingOutlined />, label: '字段配置' },
  ]},
  { key: 'divider2', type: 'divider' as const },
  { key: 'research', icon: <ApartmentOutlined />, label: '🔬 高校科研版', children: [
    { key: '/research/groups', icon: <TeamOutlined />, label: '课题组管理' },
    { key: '/research/projects', icon: <FundOutlined />, label: '研究项目管理' },
    { key: '/research/eln', icon: <BookOutlined />, label: '电子实验记录ELN' },
    { key: '/research/reservations', icon: <CalendarOutlined />, label: '仪器共享预约' },
    { key: '/teaching', icon: <SafetyOutlined />, label: '教学实验管理' },
    { key: '/safety', icon: <WarningOutlined />, label: '安全与废弃物' },
    { key: '/achievements', icon: <TrophyOutlined />, label: '成果管理' },
  ]},
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
  const { labType } = useLabTypeStore();
  
  const filteredMenu = useMemo(() => labType === 'research' ? menuItems : menuItems.filter(item => {
    if (item.key === 'research' || item.key === 'divider2') return false;
    return true;
  }), [labType]);

  const getSelectedKey = () => {
    const flatItems = filteredMenu.flatMap((item: any) => item.children ? [item, ...item.children] : [item]);
    return flatItems.find((item: any) => item.key && location.pathname.startsWith(item.key))?.key || '/dashboard';
  };
  const selectedKey = getSelectedKey();

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
        items={filteredMenu}
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
