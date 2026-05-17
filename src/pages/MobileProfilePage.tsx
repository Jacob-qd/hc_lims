import React, { useState, useEffect } from 'react';
import {
  Card, Button, Typography, Space, List, Tag, Avatar, Badge, message,
} from 'antd';
import {
  UserOutlined, PhoneOutlined, MailOutlined,
  SettingOutlined, ArrowLeftOutlined, SafetyCertificateOutlined,
  FileTextOutlined, BellOutlined, RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface UserProfile {
  id: string; username: string; realName: string; role: string;
  roleLabel: string; department: string; phone: string; email: string;
  avatar?: string; status: string;
}

export const MobileProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/mobile/profile')
      .then(r => r.json())
      .then(d => { if (d.code === 200) setProfile(d.data); });
    fetch('/api/v1/mobile/messages')
      .then(r => r.json())
      .then(d => { if (d.code === 200) setMessages(d.data?.list || []); });
  }, []);

  const menuItems = [
    { icon: <BellOutlined />, label: '消息通知', badge: messages.filter(m => !m.read).length, path: '/messages' },
    { icon: <FileTextOutlined />, label: '我的资质', path: '/profile/docs' },
    { icon: <SafetyCertificateOutlined />, label: '培训记录', path: '/profile/training' },
    { icon: <SettingOutlined />, label: '设置', path: '/profile/settings' },
  ];

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', padding: '12px 12px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>我的</Title>
      </div>

      {/* 用户信息卡片 */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space align="start" style={{ width: '100%' }}>
          <Avatar size={64} icon={<UserOutlined />} style={{ background: '#e6f4ff', color: '#1677ff' }} />
          <Space direction="vertical" style={{ flex: 1 }}>
            <Text strong style={{ fontSize: 18 }}>{profile?.realName || '当前用户'}</Text>
            <Space>
              <Tag color="blue">{profile?.roleLabel || '采样员'}</Tag>
              <Tag color="green">{profile?.department || '检测部'}</Tag>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <PhoneOutlined /> {profile?.phone || '138-****-5678'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <MailOutlined /> {profile?.email || 'user@hc-lims.com'}
            </Text>
          </Space>
        </Space>
      </Card>

      {/* 统计 */}
      <Card size="small" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space style={{ width: '100%', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>12</div>
            <div style={{ fontSize: 11, color: '#999' }}>本月采样</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>8</div>
            <div style={{ fontSize: 11, color: '#999' }}>完成任务</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>3</div>
            <div style={{ fontSize: 11, color: '#999' }}>待处理</div>
          </div>
        </Space>
      </Card>

      {/* 菜单 */}
      <Card size="small" style={{ borderRadius: 12 }}>
        <List
          dataSource={menuItems}
          renderItem={item => (
            <List.Item
              style={{ padding: '12px 0', cursor: 'pointer' }}
              onClick={() => navigate(item.path)}
              extra={<RightOutlined style={{ color: '#999' }} />}
            >
              <List.Item.Meta
                avatar={<span style={{ fontSize: 20, color: '#1677ff' }}>{item.icon}</span>}
                title={
                  <Space>
                    <Text>{item.label}</Text>
                    {item.badge ? <Badge count={item.badge} /> : null}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* 底部退出 */}
      <Button block style={{ marginTop: 24, borderRadius: 12 }} onClick={() => { localStorage.clear(); message.success('已退出登录'); navigate('/login'); }}>
        退出登录
      </Button>
    </div>
  );
};
