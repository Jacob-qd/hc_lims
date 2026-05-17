import React, { useEffect, useState } from 'react';
import {
  Card, List, Tag, Badge, Typography, Space, Row, Col, Progress,
} from 'antd';
import {
  ExperimentOutlined, FileTextOutlined, ClockCircleOutlined,
  InboxOutlined,
  TeamOutlined, BarChartOutlined, BellOutlined, RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

/** 移动端 H5 首页 - 对标金现代 LIMS 移动版 */
export const MobilePage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/v1/dashboard/stats').then(r => r.json()).then(d => {
      if (d.code === 200) setStats(d.data);
    });
    fetch('/api/v1/tasks').then(r => r.json()).then(d => {
      if (d.code === 200) setTasks((d.data?.list || []).slice(0, 5));
    });
  }, []);

  const quickActions = [
    { icon: <ExperimentOutlined />, label: '样品登记', path: '/samples', color: '#1677ff', count: stats?.pendingSamples || 0 },
    { icon: <InboxOutlined />, label: '我的任务', path: '/tasks', color: '#52c41a', count: tasks.filter((t:any) => t.status === 'pending').length },
    { icon: <FileTextOutlined />, label: '报告审批', path: '/reports', color: '#faad14', count: stats?.pendingReports || 0 },
    { icon: <BellOutlined />, label: '待处理', path: '/quality', color: '#ff4d4f', count: stats?.pendingIssues || 0 },
  ];

  const statusColor: Record<string, string> = {
    pending: 'orange', in_progress: 'blue', completed: 'green',
  };
  const statusLabel: Record<string, string> = {
    pending: '待处理', in_progress: '进行中', completed: '已完成',
  };

  return (
    <div style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh',
      background: '#f5f5f5', padding: 12, fontFamily: '-apple-system, sans-serif',
    }}>
      {/* 头部 */}
      <div style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0, color: '#1677ff' }}>
          <ExperimentOutlined /> 红创 LIMS
        </Title>
        <Text type="secondary">移动实验室</Text>
      </div>

      {/* 快捷操作 */}
      <Row gutter={[8, 8]} style={{ marginBottom: 16 }}>
        {quickActions.map((a, i) => (
          <Col span={6} key={i}>
            <Card
              size="small"
              hoverable
              style={{ textAlign: 'center', borderRadius: 12 }}
              onClick={() => navigate(a.path)}
              bodyStyle={{ padding: '12px 4px' }}
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
          <Col span={8} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>今日采样</Text>
            <div><Text strong style={{ fontSize: 20 }}>{stats?.todaySamples || 0}</Text></div>
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>进行中</Text>
            <div><Text strong style={{ fontSize: 20, color: '#1677ff' }}>{stats?.inProgress || 0}</Text></div>
          </Col>
          <Col span={8} style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11 }}>今日完成</Text>
            <div><Text strong style={{ fontSize: 20, color: '#52c41a' }}>{stats?.todayCompleted || 0}</Text></div>
          </Col>
        </Row>
      </Card>

      {/* 待办任务 */}
      <Card
        size="small"
        title={<Space><ClockCircleOutlined />待办任务</Space>}
        extra={<a onClick={() => navigate('/tasks')}>全部 <RightOutlined /></a>}
        style={{ marginBottom: 16, borderRadius: 12 }}
      >
        <List
          dataSource={tasks.slice(0, 3)}
          renderItem={(t: any) => (
            <List.Item
              style={{ cursor: 'pointer', padding: '8px 0' }}
              onClick={() => navigate('/tasks')}
            >
              <List.Item.Meta
                avatar={
                  <Badge status={(t.status === 'pending' ? 'warning' : t.status === 'in_progress' ? 'processing' : 'success') as any} />
                }
                title={<Text style={{ fontSize: 13 }}>{t.sampleName}</Text>}
                description={
                  <div style={{ fontSize: 11 }}>
                    <Text type="secondary">{t.testItem}</Text>
                    {t.progress != null && (
                      <Progress percent={t.progress} size="small" style={{ marginTop: 2 }} />
                    )}
                  </div>
                }
              />
              <Tag color={statusColor[t.status]} style={{ fontSize: 10 }}>
                {statusLabel[t.status]}
              </Tag>
            </List.Item>
          )}
          locale={{ emptyText: '暂无待办任务' }}
        />
      </Card>

      {/* 底部导航 */}
      <div style={{
        position: 'sticky', bottom: 0, background: '#fff',
        borderRadius: 12, padding: '8px 0', boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
      }}>
        <Row>
          {[
            { icon: <BarChartOutlined />, label: '首页', path: '/mobile' },
            { icon: <ExperimentOutlined />, label: '样品', path: '/samples' },
            { icon: <FileTextOutlined />, label: '报告', path: '/reports' },
            { icon: <TeamOutlined />, label: '我的', path: '/profile' },
          ].map((item, i) => (
            <Col span={6} key={i} style={{ textAlign: 'center' }}>
              <div
                style={{ cursor: 'pointer', color: i === 0 ? '#1677ff' : '#999' }}
                onClick={() => navigate(item.path)}
              >
                <div style={{ fontSize: 20 }}>{item.icon}</div>
                <div style={{ fontSize: 10 }}>{item.label}</div>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};
