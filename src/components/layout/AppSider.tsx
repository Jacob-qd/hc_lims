import React, { useMemo, useState } from 'react';
import { Layout, Menu, Typography, Avatar, Tag, Space, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import {
  DashboardOutlined, ExperimentOutlined, FileTextOutlined,
  InboxOutlined, ScheduleOutlined, TeamOutlined,
  BankOutlined, SafetyCertificateOutlined, ToolOutlined,
  BarChartOutlined, SettingOutlined, FileSearchOutlined,
  HistoryOutlined, UserOutlined, BookOutlined, WarningOutlined,
  TrophyOutlined, ShopOutlined, ProfileOutlined, ApartmentOutlined,
  FundOutlined, CalendarOutlined, SafetyOutlined,
  EnvironmentOutlined, GlobalOutlined, LogoutOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

// ===== menu key definitions =====
const allMenuKeys = [
  { key: '/dashboard', icon: <DashboardOutlined />, labelKey: 'nav.dashboard', roles: ['admin', 'lab_tech', 'reviewer', 'sampler', 'client'] },
  { key: 'divider1', type: 'divider' as const, roles: ['admin', 'lab_tech', 'reviewer'] },
  { key: 'detection', icon: <ExperimentOutlined />, labelKey: 'nav.detection', roles: ['admin', 'lab_tech', 'reviewer', 'sampler'], children: [
    { key: '/samples', icon: <InboxOutlined />, labelKey: 'nav.samples', roles: ['admin', 'lab_tech', 'sampler'] },
    { key: '/coc', icon: <SafetyCertificateOutlined />, labelKey: 'nav.coc', roles: ['admin', 'lab_tech', 'sampler'] },
    { key: '/tasks', icon: <ExperimentOutlined />, labelKey: 'nav.tasks', roles: ['admin', 'lab_tech'] },
    { key: '/reports', icon: <FileTextOutlined />, labelKey: 'nav.reports', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/certificates', icon: <SafetyCertificateOutlined />, labelKey: 'nav.certificates', roles: ['admin', 'reviewer'] },
    { key: '/quality', icon: <SafetyCertificateOutlined />, labelKey: 'nav.quality', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/instruments', icon: <ToolOutlined />, labelKey: 'nav.instruments', roles: ['admin', 'lab_tech'] },
    { key: '/inventory', icon: <ShopOutlined />, labelKey: 'nav.inventory', roles: ['admin', 'lab_tech'] },
    { key: '/methods', icon: <ProfileOutlined />, labelKey: 'nav.methods', roles: ['admin', 'lab_tech'] },
  ]},
  { key: 'business', icon: <TeamOutlined />, labelKey: 'nav.business', roles: ['admin'], children: [
    { key: '/clients', icon: <TeamOutlined />, labelKey: 'nav.clients', roles: ['admin'] },
    { key: '/contracts', icon: <BankOutlined />, labelKey: 'nav.contracts', roles: ['admin'] },
    { key: '/quotations', icon: <FileTextOutlined />, labelKey: 'nav.quotations', roles: ['admin'] },
    { key: '/orders', icon: <ExperimentOutlined />, labelKey: 'nav.orders', roles: ['admin'] },
  ]},
  { key: 'admin', icon: <SettingOutlined />, labelKey: 'nav.admin', roles: ['admin'], children: [
    { key: '/personnel', icon: <UserOutlined />, labelKey: 'nav.personnel', roles: ['admin'] },
    { key: '/schedules', icon: <ScheduleOutlined />, labelKey: 'nav.schedules', roles: ['admin'] },
    { key: '/query', icon: <FileSearchOutlined />, labelKey: 'nav.query', roles: ['admin'] },
    { key: '/statistics', icon: <BarChartOutlined />, labelKey: 'nav.statistics', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/settings', icon: <SettingOutlined />, labelKey: 'nav.settings', roles: ['admin'] },
  ]},
  { key: 'divider2', type: 'divider' as const, roles: ['admin'] },
  { key: 'research', icon: <ApartmentOutlined />, labelKey: 'nav.research', roles: ['admin'], children: [
    { key: '/research/groups', icon: <TeamOutlined />, labelKey: 'nav.researchGroups', roles: ['admin'] },
    { key: '/research/projects', icon: <FundOutlined />, labelKey: 'nav.researchProjects', roles: ['admin'] },
    { key: '/research/eln', icon: <BookOutlined />, labelKey: 'nav.eln', roles: ['admin'] },
    { key: '/research/reservations', icon: <CalendarOutlined />, labelKey: 'nav.reservations', roles: ['admin'] },
    { key: '/teaching', icon: <SafetyOutlined />, labelKey: 'nav.teaching', roles: ['admin'] },
    { key: '/safety', icon: <WarningOutlined />, labelKey: 'nav.safety', roles: ['admin'] },
    { key: '/achievements', icon: <TrophyOutlined />, labelKey: 'nav.achievements', roles: ['admin'] },
  ]},
  { key: 'sampler-menu', icon: <EnvironmentOutlined />, labelKey: 'nav.samplerMenu', roles: ['sampler'], children: [
    { key: '/mobile/sampling', icon: <EnvironmentOutlined />, labelKey: 'nav.mobileSampling', roles: ['sampler'] },
    { key: '/samples', icon: <InboxOutlined />, labelKey: 'nav.mySamples', roles: ['sampler'] },
    { key: '/coc', icon: <SafetyCertificateOutlined />, labelKey: 'nav.coc', roles: ['sampler'] },
  ]},
  { key: 'client-menu', icon: <GlobalOutlined />, labelKey: 'nav.clientMenu', roles: ['client'], children: [
    { key: '/portal', icon: <DashboardOutlined />, labelKey: 'nav.portal', roles: ['client'] },
    { key: '/portal/orders', icon: <InboxOutlined />, labelKey: 'nav.myOrders', roles: ['client'] },
    { key: '/portal/reports', icon: <FileTextOutlined />, labelKey: 'nav.reportDownload', roles: ['client'] },
  ]},
];

// Filter menu by role
const filterMenuByRole = (items: any[], role: string): any[] => {
  return items
    .filter(item => {
      if (!item.roles) return true;
      return item.roles.includes(role);
    })
    .map(item => {
      if (item.children) {
        return { ...item, children: filterMenuByRole(item.children, role) };
      }
      return item;
    })
    .filter(item => !item.children || item.children.length > 0);
};

const recentItems = [
  { key: '/samples/SP-2025-001', label: 'SP-2025-001' },
  { key: '/reports/RP-2025-045', label: 'RP-2025-045' },
  { key: '/tasks/TK-2025-128', label: 'TK-2025-128' },
];

export const AppSider: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  const { t } = useTranslation('common');
  const userRole = isAuthenticated && user ? user.role : 'guest';

  const buildMenuItems = (items: any[]): any[] => {
    return items.map(item => {
      const base: any = {
        key: item.key,
        icon: item.icon,
        label: item.labelKey ? t(item.labelKey) : item.label,
      };
      if (item.type === 'divider') {
        return { type: 'divider' };
      }
      if (item.children) {
        base.children = buildMenuItems(item.children);
      }
      return base;
    });
  };

  const filteredMenu = useMemo(() => {
    const roleFiltered = filterMenuByRole(allMenuKeys, userRole);
    return buildMenuItems(roleFiltered);
  }, [userRole, t]);

  const getSelectedKey = () => {
    const flatItems = filteredMenu.flatMap((item: any) => item.children ? [item, ...item.children] : [item]);
    const match = flatItems.find((item: any) => item.key && location.pathname.startsWith(item.key));
    return match?.key || '/dashboard';
  };
  const selectedKey = getSelectedKey();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={240}
      collapsedWidth={80}
      style={{ position: 'sticky', top: 64, height: 'calc(100vh - 64px)', overflow: 'auto' }}
    >
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Space>
            <Avatar src={user?.avatar} icon={<UserOutlined />} size={32} />
            <div style={{ lineHeight: 1.3 }}>
              <Text strong style={{ fontSize: 13, display: 'block' }}>{user?.realName || t('common.user')}</Text>
              <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px' }}>
                {t(`role.${userRole}`) || userRole}
              </Tag>
            </div>
          </Space>
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={[selectedKey || '/dashboard']}
        items={filteredMenu}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, paddingTop: 8 }}
      />

      {!collapsed && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <HistoryOutlined />
            {t('nav.recent')}
          </Text>
          <Menu
            mode="inline"
            selectedKeys={[]}
            items={recentItems.map((item) => ({ key: item.key, label: item.label }))}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
          <Button
            type="text"
            size="small"
            icon={<LogoutOutlined />}
            onClick={() => { logout(); navigate('/login'); }}
            style={{ marginTop: 8, color: '#999', width: '100%' }}
          >
            {t('common.logout')}
          </Button>
        </div>
      )}
    </Sider>
  );
};
