import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, theme as antTheme } from 'antd';
import {
  InboxOutlined,
  ExperimentOutlined,
  FileTextOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EuroOutlined,
} from '@ant-design/icons';

interface Stats {
  todaySamples: number;
  pendingTasks: number;
  processingTasks: number;
  completedTasks: number;
  pendingReports: number;
  approvedReports: number;
  totalClients: number;
  monthlyRevenue: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const { token } = antTheme.useToken();

  useEffect(() => {
    fetch('/api/v1/dashboard/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setStats(data.data);
        }
      });
  }, []);

  const statCards = [
    { title: '今日样品', value: stats?.todaySamples ?? 0, icon: <InboxOutlined />, color: token.colorPrimary },
    { title: '待检测任务', value: stats?.pendingTasks ?? 0, icon: <ClockCircleOutlined />, color: '#faad14' },
    { title: '检测中', value: stats?.processingTasks ?? 0, icon: <ExperimentOutlined />, color: '#722ed1' },
    { title: '已完成', value: stats?.completedTasks ?? 0, icon: <CheckCircleOutlined />, color: '#52c41a' },
    { title: '待审核报告', value: stats?.pendingReports ?? 0, icon: <FileTextOutlined />, color: '#eb2f96' },
    { title: '已签发报告', value: stats?.approvedReports ?? 0, icon: <FileTextOutlined />, color: '#13c2c2' },
    { title: '客户总数', value: stats?.totalClients ?? 0, icon: <TeamOutlined />, color: '#1890ff' },
    { title: '本月营收', value: stats?.monthlyRevenue ?? 0, icon: <EuroOutlined />, color: '#f5222d', prefix: '¥' },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>工作台</h2>
      <Row gutter={[16, 16]}>
        {statCards.map((card) => (
          <Col xs={24} sm={12} lg={6} key={card.title}>
            <Card hoverable>
              <Statistic
                title={card.title}
                value={card.value}
                prefix={card.prefix}
                valueStyle={{ color: card.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="快捷入口" hoverable>
            <p>功能开发中...</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="系统公告" hoverable>
            <p>欢迎使用华测 LIMS 系统</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
