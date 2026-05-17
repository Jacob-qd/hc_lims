import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Form, Input, Button, Card, Typography, Space, message, Tag, Divider,
} from 'antd';
import {
  UserOutlined, LockOutlined, ExperimentOutlined,
  SafetyCertificateOutlined, FileTextOutlined, EnvironmentOutlined, TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore, roleLabels } from '../stores/authStore';

const { Title, Text } = Typography;

// 角色对应的图标和颜色
const roleMeta: Record<string, { icon: React.ReactNode; color: string; desc: string; defaultPage: string }> = {
  admin: { icon: <SafetyCertificateOutlined />, color: '#1677ff', desc: '系统配置、用户管理、审计日志', defaultPage: '/dashboard' },
  lab_tech: { icon: <ExperimentOutlined />, color: '#52c41a', desc: '样品登记、检测任务、结果录入', defaultPage: '/tasks' },
  reviewer: { icon: <FileTextOutlined />, color: '#722ed1', desc: '报告审核、电子签名、签发', defaultPage: '/reports' },
  sampler: { icon: <EnvironmentOutlined />, color: '#fa8c16', desc: '现场采样、GPS定位、样品管理', defaultPage: '/mobile/sampling' },
  client: { icon: <TeamOutlined />, color: '#13c2c2', desc: '委托查询、报告下载、进度追踪', defaultPage: '/portal' },
};

/** 实验室背景浮动画布 */
const LabBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = canvas.width = window.innerWidth;
    let h = canvas.height = window.innerHeight;
    let animId: number;

    // 分子结构粒子
    class Molecule {
      x: number; y: number; vx: number; vy: number; radius: number;
      connections: Molecule[] = [];
      opacity: number; hue: number;
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 3 + 1.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.hue = Math.random() * 60 + 200; // blue-cyan range
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
        ctx.fill();
      }
    }

    // 烧瓶/试管形状
    class Flask {
      x: number; y: number; size: number; rotation: number; speed: number;
      constructor() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.size = Math.random() * 30 + 20;
        this.rotation = Math.random() * Math.PI * 2;
        this.speed = (Math.random() - 0.5) * 0.002;
      }
      update() {
        this.rotation += this.speed;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = 0.06;
        ctx.strokeStyle = '#1677ff';
        ctx.lineWidth = 1.5;
        // Simple flask shape
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.3, -this.size * 0.5);
        ctx.lineTo(this.size * 0.3, -this.size * 0.5);
        ctx.lineTo(this.size * 0.4, 0);
        ctx.lineTo(this.size * 0.6, this.size * 0.6);
        ctx.lineTo(-this.size * 0.6, this.size * 0.6);
        ctx.lineTo(-this.size * 0.4, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
    }

    const molecules: Molecule[] = [];
    const flasks: Flask[] = [];

    for (let i = 0; i < 60; i++) molecules.push(new Molecule());
    for (let i = 0; i < 8; i++) flasks.push(new Flask());

    // Store connections data
    const connections: { a: Molecule; b: Molecule; opacity: number }[] = [];

    const animate = () => {
      ctx.clearRect(0, 0, w, h);

      // Draw connection lines between nearby molecules
      connections.length = 0;
      for (let i = 0; i < molecules.length; i++) {
        for (let j = i + 1; j < molecules.length; j++) {
          const dx = molecules[i].x - molecules[j].x;
          const dy = molecules[i].y - molecules[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            connections.push({
              a: molecules[i], b: molecules[j],
              opacity: (1 - dist / 150) * 0.15,
            });
          }
        }
      }

      connections.forEach(c => {
        ctx.beginPath();
        ctx.moveTo(c.a.x, c.a.y);
        ctx.lineTo(c.b.x, c.b.y);
        ctx.strokeStyle = `rgba(22, 119, 255, ${c.opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      molecules.forEach(m => { m.update(); m.draw(ctx); });
      flasks.forEach(f => { f.update(); f.draw(ctx); });

      animId = requestAnimationFrame(animate);
    };

    const onResize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    />
  );
};

/** 重新设计的登录页面 */
export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form] = Form.useForm();

  // 选择角色时同步到表单
  useEffect(() => {
    form.setFieldsValue({ role: selectedRole });
  }, [selectedRole, form]);

  const handleSubmit = async (values: { username: string; password: string; role: string }) => {
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
        message.success(`欢迎回来，${data.data.user.realName}`);
        const defaultPage = roleMeta[values.role]?.defaultPage || '/dashboard';
        navigate(defaultPage);
      } else {
        message.error(data.message || '登录失败');
      }
    } catch {
      message.error('网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a1628' }}>
      {/* 实验室动态背景 */}
      <LabBackground />

      {/* 渐变叠加层 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(22,119,255,0.15) 50%, rgba(10,22,40,0.9) 100%)',
      }} />

      {/* 登录卡片 */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 440, zIndex: 10,
      }}>
        <Card
          style={{
            borderRadius: 20,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
            border: 'none',
          }}
          styles={{ body: { padding: '36px 32px 28px' } }}
        >
          {/* Logo + 标题 */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 60, height: 60, borderRadius: 16,
              background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 26, marginBottom: 14,
              boxShadow: '0 4px 12px rgba(22,119,255,0.3)',
            }}>
              HC
            </div>
            <Title level={3} style={{ margin: 0, fontWeight: 600, fontSize: 22 }}>
              红创检测认证
            </Title>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 2 }}>
              实验室信息管理系统 HC-LIMS
            </Text>
          </div>

          {/* 角色选择卡片 */}
          <div style={{ marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              选择角色登录
            </Text>
            <Space direction="vertical" style={{ width: '100%' }} size={4}>
              {Object.entries(roleLabels).map(([value, label]) => {
                const meta = roleMeta[value];
                const active = selectedRole === value;
                return (
                  <div
                    key={value}
                    onClick={() => setSelectedRole(value)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                      background: active ? `${meta.color}10` : '#f5f5f5',
                      border: `1.5px solid ${active ? meta.color : '#e8e8e8'}`,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: active ? meta.color : '#e8e8e8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: active ? '#fff' : '#999', fontSize: 16,
                    }}>
                      {meta.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text strong style={{ fontSize: 13, display: 'block' }}>{label}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>{meta.desc}</Text>
                    </div>
                    {active && <Tag color={meta.color}>当前</Tag>}
                  </div>
                );
              })}
            </Space>
          </div>

          {/* 登录表单 */}
          <Form
            form={form}
            name="login"
            size="large"
            onFinish={handleSubmit}
            autoComplete="off"
            initialValues={{ role: selectedRole, username: 'admin', password: 'admin123' }}
          >
            <Form.Item name="role" hidden>
              <Input />
            </Form.Item>
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
              <Input prefix={<UserOutlined style={{ color: '#999' }} />} placeholder="用户名" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: '#999' }} />} placeholder="密码" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                style={{ height: 44, borderRadius: 10, fontSize: 15, fontWeight: 500 }}
              >
                进入系统
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ margin: '16px 0 8px' }} />
          <div style={{ fontSize: 11, color: '#bbb', textAlign: 'center' }}>
            测试账号: admin / admin123 &nbsp;|&nbsp; 各角色使用对应密码登录
          </div>
        </Card>
      </div>

      {/* 版权 */}
      <div style={{
        position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center',
        color: 'rgba(255,255,255,0.3)', fontSize: 11, zIndex: 10,
      }}>
        © 2026 红创检测认证有限公司 HC-LIMS v2.0
      </div>
    </div>
  );
};
