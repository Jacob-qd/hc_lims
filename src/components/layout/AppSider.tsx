import React, { useMemo, useState } from 'react';
import { Layout, Menu, Typography, Avatar, Tag, Space, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
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
  CheckCircleOutlined, RobotOutlined, LineChartOutlined,
  MobileOutlined, FormOutlined, ScanOutlined,
  MedicineBoxOutlined, DollarOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

// ===== 全量菜单定义 =====
const allMenuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '首页', roles: ['admin', 'lab_tech', 'reviewer', 'sampler', 'client'] },
  { key: 'divider1', type: 'divider' as const, roles: ['admin', 'lab_tech', 'reviewer'] },
  { key: 'detection', icon: <ExperimentOutlined />, label: '检测实验室', roles: ['admin', 'lab_tech', 'reviewer', 'sampler'], children: [
    { key: '/samples', icon: <InboxOutlined />, label: '样品管理', roles: ['admin', 'lab_tech', 'sampler'] },
    { key: '/coc', icon: <SafetyCertificateOutlined />, label: 'COC监管链', roles: ['admin', 'lab_tech', 'sampler'] },
    { key: '/tasks', icon: <ExperimentOutlined />, label: '检测管理', roles: ['admin', 'lab_tech'] },
    { key: '/reports', icon: <FileTextOutlined />, label: '报告管理', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/certificates', icon: <SafetyCertificateOutlined />, label: '签名证书', roles: ['admin', 'reviewer'] },
    { key: '/quality', icon: <SafetyCertificateOutlined />, label: '质量控制', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/instruments', icon: <ToolOutlined />, label: '仪器管理', roles: ['admin', 'lab_tech'] },
    { key: '/inventory', icon: <ShopOutlined />, label: '库存管理', roles: ['admin', 'lab_tech'] },
    { key: '/methods', icon: <ProfileOutlined />, label: '方法管理', roles: ['admin', 'lab_tech'] },
  ]},
  { key: 'business', icon: <TeamOutlined />, label: '商务管理', roles: ['admin'], children: [
    { key: '/clients', icon: <TeamOutlined />, label: '客户管理', roles: ['admin'] },
    { key: '/contracts', icon: <BankOutlined />, label: '合同管理', roles: ['admin'] },
    { key: '/quotations', icon: <FileTextOutlined />, label: '报价管理', roles: ['admin'] },
    { key: '/orders', icon: <ExperimentOutlined />, label: '委托单管理', roles: ['admin'] },
  ]},
  { key: 'admin', icon: <SettingOutlined />, label: '运营管理', roles: ['admin'], children: [
    { key: '/personnel', icon: <UserOutlined />, label: '人员与培训', roles: ['admin'] },
    { key: '/schedules', icon: <ScheduleOutlined />, label: '排程管理', roles: ['admin'] },
    { key: '/query', icon: <FileSearchOutlined />, label: '综合查询', roles: ['admin'] },
    { key: '/statistics', icon: <BarChartOutlined />, label: '数据分析', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/settings', icon: <SettingOutlined />, label: '系统管理', roles: ['admin'] },
  ]},
  { key: 'ai', icon: <RobotOutlined />, label: '🤖 AI智能助手', roles: ['admin', 'lab_tech', 'reviewer'], children: [
    { key: '/ai-assistant', icon: <RobotOutlined />, label: '智能对话助手', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/ai-prediction', icon: <LineChartOutlined />, label: '异常预警看板', roles: ['admin', 'lab_tech', 'reviewer'] },
  ]},
  { key: 'workflow', icon: <ApartmentOutlined />, label: '工作流引擎', roles: ['admin', 'lab_tech', 'reviewer'], children: [
    { key: '/workflow', icon: <ApartmentOutlined />, label: '流程管理', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/workflow/tasks', icon: <CheckCircleOutlined />, label: '任务中心', roles: ['admin', 'lab_tech', 'reviewer'] },
  ]},
  { key: 'mobile', icon: <MobileOutlined />, label: '📱 移动端功能', roles: ['admin', 'lab_tech', 'sampler'], children: [
    { key: '/mobile', icon: <MobileOutlined />, label: '移动端首页', roles: ['admin', 'lab_tech', 'sampler'] },
    { key: '/mobile/sampling', icon: <EnvironmentOutlined />, label: '移动采样', roles: ['admin', 'lab_tech', 'sampler'] },
    { key: '/mobile/scan-receipt', icon: <ScanOutlined />, label: '扫码签收', roles: ['admin', 'lab_tech', 'sampler'] },
    { key: '/mobile/result-entry', icon: <FormOutlined />, label: '结果录入', roles: ['admin', 'lab_tech'] },
    { key: '/mobile/reports', icon: <FileTextOutlined />, label: '报告查看', roles: ['admin', 'lab_tech', 'reviewer'] },
    { key: '/mobile/profile', icon: <UserOutlined />, label: '个人中心', roles: ['admin', 'lab_tech', 'sampler', 'reviewer'] },
  ]},
  { key: 'divider2', type: 'divider' as const, roles: ['admin'] },
  { key: 'research', icon: <ApartmentOutlined />, label: '🔬 高校科研版', roles: ['admin'], children: [
    { key: '/research/groups', icon: <TeamOutlined />, label: '课题组管理', roles: ['admin'] },
    { key: '/research/projects', icon: <FundOutlined />, label: '研究项目管理', roles: ['admin'] },
    { key: '/research/eln', icon: <BookOutlined />, label: '电子实验记录ELN', roles: ['admin'] },
    { key: '/research/reservations', icon: <CalendarOutlined />, label: '仪器共享预约', roles: ['admin'] },
    { key: '/research/researchers', icon: <MedicineBoxOutlined />, label: '科研人员管理', roles: ['admin'] },
    { key: '/research/funds', icon: <DollarOutlined />, label: '科研经费管理', roles: ['admin'] },
    { key: '/research/reagents', icon: <ExperimentOutlined />, label: '试剂耗材管理', roles: ['admin'] },
    { key: '/research/inspections', icon: <SafetyOutlined />, label: '实验室安全检查', roles: ['admin'] },
    { key: '/teaching', icon: <SafetyOutlined />, label: '教学实验管理', roles: ['admin'] },
    { key: '/safety', icon: <WarningOutlined />, label: '安全与废弃物', roles: ['admin'] },
    { key: '/achievements', icon: <TrophyOutlined />, label: '成果管理', roles: ['admin'] },
  ]},
  // 采样员专用菜单
  { key: 'sampler-menu', icon: <EnvironmentOutlined />, label: '现场采样', roles: ['sampler'], children: [
    { key: '/mobile/sampling', icon: <EnvironmentOutlined />, label: '移动采样', roles: ['sampler'] },
    { key: '/samples', icon: <InboxOutlined />, label: '我的样品', roles: ['sampler'] },
    { key: '/coc', icon: <SafetyCertificateOutlined />, label: 'COC监管链', roles: ['sampler'] },
  ]},
  // 客户专用菜单
  { key: 'client-menu', icon: <GlobalOutlined />, label: '客户服务', roles: ['client'], children: [
    { key: '/portal', icon: <DashboardOutlined />, label: '客户首页', roles: ['client'] },
    { key: '/portal/orders', icon: <InboxOutlined />, label: '我的委托', roles: ['client'] },
    { key: '/portal/reports', icon: <FileTextOutlined />, label: '报告下载', roles: ['client'] },
  ]},
];

// 根据角色过滤菜单
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

const roleNameMap: Record<string, string> = {
  admin: '系统管理员', lab_tech: '检测技术员', reviewer: '报告审核员',
  sampler: '采样人员', client: '客户代表', quality_manager: '质量主管',
  analyst: '分析员', signatory: '签发人', instrument_manager: '仪器管理员',
};

export const AppSider: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAuthenticated } = useAuthStore();
  // 未认证时不显示菜单，认证后按角色过滤
  const userRole = isAuthenticated && user ? user.role : 'guest';

  const filteredMenu = useMemo(
    () => filterMenuByRole(allMenuItems, userRole),
    [userRole]
  );

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
      {/* 用户信息区 */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
          <Space>
            <Avatar src={user?.avatar} icon={<UserOutlined />} size={32} />
            <div style={{ lineHeight: 1.3 }}>
              <Text strong style={{ fontSize: 13, display: 'block' }}>{user?.realName || '用户'}</Text>
              <Tag color="blue" style={{ fontSize: 10, lineHeight: '16px' }}>
                {roleNameMap[userRole] || userRole}
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
            最近访问
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
            退出登录
          </Button>
        </div>
      )}
    </Sider>
  );
};
