import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Space,
  Select,
  message,
  theme as antTheme,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore, roleLabels } from '../stores/authStore';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const { token } = antTheme.useToken();

  const handleSubmit = async (values: {
    username: string;
    password: string;
    role: string;
  }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (data.code === 200) {
        login(data.data.user, data.data.token);
        message.success('登录成功');
        navigate('/dashboard');
      } else {
        message.error(data.message || '登录失败');
      }
    } catch (err) {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${token.colorPrimary} 0%, ${token.colorPrimaryActive} 100%)`,
      }}
    >
      <Card
        style={{ width: 420, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                background: token.colorPrimary,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: 24,
                marginBottom: 16,
              }}
            >
              HC
            </div>
            <Title level={3} style={{ margin: 0 }}>
              红创 LIMS
            </Title>
            <Text type="secondary">实验室信息管理系统</Text>
          </div>

          <Form
            name="login"
            size="large"
            onFinish={handleSubmit}
            autoComplete="off"
            initialValues={{ role: 'admin' }}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            <Form.Item
              name="role"
              rules={[{ required: true, message: '请选择角色' }]}
            >
              <Select placeholder="选择角色">
                {Object.entries(roleLabels).map(([value, label]) => (
                  <Select.Option key={value} value={value}>
                    {label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
              >
                登录
              </Button>
            </Form.Item>
          </Form>

          <Text type="secondary" style={{ display: 'block', textAlign: 'center', fontSize: 12 }}>
            测试账号: admin / admin123
          </Text>
        </Space>
      </Card>
    </div>
  );
};
