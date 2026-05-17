import React from 'react';
import { Layout, Space, Avatar, Dropdown, Switch, Typography, Badge, Select } from 'antd';
import {
  BellOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useI18nStore } from '../../stores/i18nStore';
import { useThemeStore } from '../../stores/themeStore';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  onOpenDrawer: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onOpenDrawer }) => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { locale, setLocale } = useI18nStore();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const items = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: t('nav.profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: t('nav.settings'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: t('common.logout'),
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          HC
        </div>
        <Text strong style={{ fontSize: 18, color: 'var(--text-primary)' }}>
          {t('app.name')}
        </Text>
      </div>

      <Space size={20}>
        <Select
          value={locale}
          onChange={(v: 'zh' | 'en') => setLocale(v)}
          size="small"
          style={{ width: 78 }}
          variant="borderless"
          options={[
            { value: 'zh', label: '🇨🇳 中文' },
            { value: 'en', label: '🇬🇧 EN' },
          ]}
        />
        <Switch
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          checked={theme === 'dark'}
          onChange={toggleTheme}
        />
        <Badge count={5} size="small">
          <BellOutlined
            style={{ fontSize: 18, color: 'var(--text-secondary)', cursor: 'pointer' }}
            onClick={onOpenDrawer}
          />
        </Badge>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar src={user?.avatar || undefined} icon={!user?.avatar && <UserOutlined />} size="small" />
            <Text style={{ color: 'var(--text-primary)' }}>{user?.realName || t('common.notLoggedIn')}</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
};
