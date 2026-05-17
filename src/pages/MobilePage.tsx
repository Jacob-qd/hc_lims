import React, { useEffect, useState } from 'react';
import {
  Card, List, Tag, Badge, Typography, Space, Row, Col, Progress, Button,
} from 'antd';
import {
  ExperimentOutlined, ClockCircleOutlined,
  InboxOutlined, EnvironmentOutlined,
  TeamOutlined, BarChartOutlined, BellOutlined, RightOutlined, ScanOutlined,
  FileTextOutlined, EditOutlined, UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

/** 移动端 H5 首页 - 采样员工作台 */
export const MobilePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [fieldSamples, setFieldSamples] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/dashboard/stats').then(r => r.json()).then(d => {
      if (d.code === 200) setStats(d.data);
    });
    fetch('/api/v1/tasks').then(r => r.json()).then(d => {
      if (d.code === 200) setTasks((d.data?.list || []).slice(0, 5));
    });
    fetch('/api/v1/mobile/field-samples').then(r => r.json()).then(d => {
      if (d.code === 200) setFieldSamples(d.data?.list || []);
    });
  }, []);

  const quickActions = [
    { icon: <EnvironmentOutlined />, label: '现场采样', path: '/mobile/sampling', color: '#52c41a', count: 0 },
    { icon: <ScanOutlined />, label: '扫码签收', path: '/mobile/scan-receipt', color: '#1677ff', count: 0 },
    { icon: <EditOutlined />, label: '结果录入', path: '/mobile/result-entry', color: '#722ed1', count: 0 },
    { icon: <FileTextOutlined />, label: '报告查看', path: '/mobile/reports', color: '#13c2c2', count: 0 },
    { icon: <InboxOutlined />, label: '我的任务', path: '/mobile/tasks', color: '#fa8c16', count: tasks.filter((t: any) => t.status === 'pending').length },
    { icon: <BellOutlined />, label: '待处理', path: '/quality', color: '#ff4d4f', count: stats?.pendingIssues || 0 },
    { icon: <UserOutlined />, label: '我的', path: '/mobile/profile', color: '#eb2f96', count: 0 },
    { icon: <TeamOutlined />, label: '人员', path: '/personnel', color: '#2f54eb', count: 0 },
  ];

  const statusColor: Record<string, string> = { pending: 'orange', in_progress: 'blue', completed: 'green' };
  const statusLabel: Record<string, string> = { pending: '待处理', in_progress: '进行中', completed: '已完成' };

  // 从离线队列读取待同步数
  const offlineCount = (() => {
    try {
      const q = JSON.parse(localStorage.getItem('sampling_offline_queue') || '[]');
      return q.length;
    } catch { return 0; }
  })();

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh',
      background: '#f5f5f5', padding: '12px 12px 80px', fontFamily: '-apple-system, sans-serif',
    }}>
      {/* 头部 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: '#1677ff', fontSize: 20 }}>
          <ExperimentOutlined /> 红创 LIMS
        </Title>
        <Text type="secondary" style={{ fontSize: 12 }}>移动实验室 · 采样员工作台</Text>
      </div>

      {/* 快捷操作 */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        {quickActions.map((a, i) => (
          <Col span={6} key={i}>
            <Card
              size="small" hoverable
              style={{ textAlign: 'center', borderRadius: 12 }}
              onClick={() => navigate(a.path)}
              styles={{ body: { padding: '12px 4px' } }}
            >
              <div style={{ fontSize: 24, color: a.color }}>{a.icon}</div>
              <div style={{ fontSize: 11, marginTop: 4, color: '#666' }}>{a.label}</div>
              {a.count > 0 && (
                <Badge count={a.count} style={{ backgroundColor: a.color, fontSize: 10 }} overflowCount={99} />
              )}
            </Card>
          </Col>
        ))}
      </Row>

      {/* 统计卡片 */}
      <Card size="small" style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={8}>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10 }}>今日采样</Text>
            <div><Text strong style={{ fontSize: 18 }}>{stats?.todaySamples || 0}</Text></div>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10 }}>进行中</Text>
            <div><Text strong style={{ fontSize: 18, color: '#1677ff' }}>{stats?.inProgress || fieldSamples.length || 0}</Text></div>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10 }}>今日完成</Text>
            <div><Text strong style={{ fontSize: 18, color: '#52c41a' }}>{stats?.todayCompleted || 0}</Text></div>
          </Col>
          <Col span={6} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 10 }}>待同步</Text>
            <div><Text strong style={{ fontSize: 18, color: offlineCount > 0 ? '#faad14' : '#999' }}>{offlineCount}</Text></div>
          </Col>
        </Row>
      </Card>

      {/* 最近采样记录 */}
      <Card
        size="small"
        title={<Space><EnvironmentOutlined style={{ color: '#52c41a' }} />最近采样</Space>}
        extra={<a onClick={() => navigate('/mobile/sampling')}>全部 <RightOutlined /></a>}
        style={{ marginBottom: 16, borderRadius: 12 }}
      >
        <List
          dataSource={fieldSamples.slice(0, 3)}
          renderItem={(s: any) => (
            <List.Item style={{ padding: '8px 0' }}>
              <List.Item.Meta
                avatar={<EnvironmentOutlined style={{ fontSize: 18, color: '#52c41a' }} />}
                title={<Text style={{ fontSize: 13 }}>{s.name}</Text>}
                description={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {s.sampleNo} · 📍 {s.location?.latitude?.toFixed(2)}, {s.location?.longitude?.toFixed(2)}
                  </Text>
                }
              />
              <Tag color="green" style={{ fontSize: 10 }}>已同步</Tag>
            </List.Item>
          )}
          locale={{ emptyText: (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Text type="secondary">暂无采样记录</Text>
              <br />
              <Button size="small" type="primary" onClick={() => navigate('/mobile/sampling')} style={{ marginTop: 8 }}>
                开始采样
              </Button>
            </div>
          )}}
        />
      </Card>

      {/* 待办任务 */}
      <Card
        size="small"
        title={<Space><ClockCircleOutlined />待办任务</Space>}
        extra={<a onClick={() => navigate('/mobile/tasks')}>全部 <RightOutlined /></a>}
        style={{ marginBottom: 16, borderRadius: 12 }}
      >
        <List
          dataSource={tasks.slice(0, 3)}
          renderItem={(t: any) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '8px 0' }}
              onClick={() => navigate('/mobile/tasks')}
            >
              <List.Item.Meta
                avatar={<Badge status={(t.status === 'pending' ? 'warning' : t.status === 'in_progress' ? 'processing' : 'success') as any} />}
                title={<Text style={{ fontSize: 13 }}>{t.sampleName}</Text>}
                description={
                  <div style={{ fontSize: 11 }}>
                    <Text type="secondary">{t.testItem}</Text>
                    {t.progress != null && <Progress percent={t.progress} size="small" style={{ marginTop: 2 }} />}
                  </div>
                }
              />
              <Tag color={statusColor[t.status]} style={{ fontSize: 10 }}>{statusLabel[t.status]}</Tag>
            </List.Item>
          )}
          locale={{ emptyText: '暂无待办任务' }}
        />
      </Card>

      {/* 离线队列提醒 */}
      {offlineCount > 0 && (
        <Card size="small" style={{ borderRadius: 12, marginBottom: 16, borderColor: '#faad14' }}>
          <Space>
            <Badge status="warning" />
            <Text type="secondary" style={{ fontSize: 12 }}>有 {offlineCount} 条离线采样记录待同步</Text>
            <Button size="small" onClick={() => navigate('/mobile/sampling')}>查看</Button>
          </Space>
        </Card>
      )}

      {/* 底部导航 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 480, margin: '0 auto',
        background: '#fff', borderRadius: '12px 12px 0 0', padding: '6px 0',
        boxShadow: '0 -2px 8px rgba(0,0,0,0.06)', zIndex: 100,
      }}>
        <Row>
          {[
            { icon: <BarChartOutlined />, label: '首页', path: '/mobile' },
            { icon: <EnvironmentOutlined />, label: '采样', path: '/mobile/sampling' },
            { icon: <ScanOutlined />, label: '签收', path: '/mobile/scan-receipt' },
            { icon: <EditOutlined />, label: '录入', path: '/mobile/result-entry' },
            { icon: <FileTextOutlined />, label: '报告', path: '/mobile/reports' },
          ].map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <Col span={Math.floor(24 / 5)} key={i} style={{ textAlign: 'center' }}>
                <div
                  style={{ cursor: 'pointer', color: isActive ? '#1677ff' : '#999', padding: '4px 0' }}
                  onClick={() => navigate(item.path)}
                >
                  <div style={{ fontSize: 20 }}>{item.icon}</div>
                  <div style={{ fontSize: 10, marginTop: 2 }}>{item.label}</div>
                </div>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
};
