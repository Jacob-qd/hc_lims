import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Table, Tag, List, Button,
  Typography, Badge, Select, message, Statistic, Divider, Space
} from 'antd';
import { CustomWorkspace } from '../components/CustomWorkspace';
import {
  InboxOutlined, ExperimentOutlined, FileTextOutlined,
  WarningOutlined, CheckCircleOutlined, ClockCircleOutlined,
  ArrowUpOutlined, ArrowDownOutlined,
  EyeOutlined, BellOutlined, SettingOutlined, AppstoreOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Line, Pie } from '@ant-design/plots';
import type { Sample } from '../mocks/data';

const { Title, Text } = Typography;

interface DashboardStats {
  totalSamples: number;
  totalSamplesChange: number;
  pendingTests: number;
  pendingTestsChange: number;
  overdueTasks: number;
  overdueTasksChange: number;
  completedReports: number;
  completedReportsChange: number;
}

interface TaskQueue {
  pendingAssign: number;
  pendingTest: number;
  pendingReview: number;
  pendingApprove: number;
  overdue: number;
}

interface Instrument {
  id: string;
  name: string;
  status: string;
  statusLabel: string;
}

interface Alert {
  id: string;
  level: string;
  title: string;
  desc: string;
  time: string;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(
    () => JSON.parse(localStorage.getItem('dashboard_widgets') || 'null') || ['kpi','recent_samples','task_queue','instruments','alerts','chart_trend','chart_dist','quick_actions']
  );
  const [taskQueue, setTaskQueue] = useState<TaskQueue | null>(null);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentSamples, setRecentSamples] = useState<Sample[]>([]);
  const [turnaroundData, setTurnaroundData] = useState<any[]>([]);
  const [typeDistribution, setTypeDistribution] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/dashboard/stats').then(r => r.json()),
      fetch('/api/v1/dashboard/task-queue').then(r => r.json()),
      fetch('/api/v1/dashboard/instruments').then(r => r.json()),
      fetch('/api/v1/dashboard/alerts').then(r => r.json()),
      fetch('/api/v1/dashboard/recent-samples').then(r => r.json()),
      fetch('/api/v1/dashboard/turnaround-trend').then(r => r.json()),
      fetch('/api/v1/dashboard/sample-distribution').then(r => r.json()),
    ]).then(([statsRes, taskRes, instRes, alertRes, sampleRes, trendRes, distRes]) => {
      if (statsRes.code === 200) setStats(statsRes.data);
      if (taskRes.code === 200) setTaskQueue(taskRes.data);
      if (instRes.code === 200) setInstruments(instRes.data);
      if (alertRes.code === 200) setAlerts(alertRes.data);
      if (sampleRes.code === 200) setRecentSamples(sampleRes.data);
      if (trendRes.code === 200) setTurnaroundData(trendRes.data);
      if (distRes.code === 200) setTypeDistribution(distRes.data);
    });
  }, []);

  const statCards = [
    { title: '样品总数', value: stats?.totalSamples ?? 0, change: stats?.totalSamplesChange ?? 0, icon: <InboxOutlined style={{ color: '#1677ff' }} />, color: '#e6f4ff' },
    { title: '待检测数', value: stats?.pendingTests ?? 0, change: stats?.pendingTestsChange ?? 0, icon: <ExperimentOutlined style={{ color: '#52c41a' }} />, color: '#f6ffed' },
    { title: '逾期任务', value: stats?.overdueTasks ?? 0, change: stats?.overdueTasksChange ?? 0, icon: <WarningOutlined style={{ color: '#faad14' }} />, color: '#fffbe6' },
    { title: '已完成报告', value: stats?.completedReports ?? 0, change: stats?.completedReportsChange ?? 0, icon: <FileTextOutlined style={{ color: '#722ed1' }} />, color: '#f9f0ff' },
  ];

  const taskQueueItems = [
    { label: '待分配任务', value: taskQueue?.pendingAssign ?? 0, icon: <ClockCircleOutlined />, color: '#1677ff' },
    { label: '待检测任务', value: taskQueue?.pendingTest ?? 0, icon: <ExperimentOutlined />, color: '#52c41a' },
    { label: '待审核报告', value: taskQueue?.pendingReview ?? 0, icon: <FileTextOutlined />, color: '#722ed1' },
    { label: '待批准报告', value: taskQueue?.pendingApprove ?? 0, icon: <CheckCircleOutlined />, color: '#13c2c2' },
    { label: '已逾期任务', value: taskQueue?.overdue ?? 0, icon: <WarningOutlined />, color: '#f5222d' },
  ];

  const sampleColumns = [
    { title: '样品编号', dataIndex: 'sampleNo', key: 'sampleNo', render: (v: string) => <Text style={{ color: '#1677ff' }}>{v}</Text> },
    { title: '样品名称', dataIndex: 'name', key: 'name' },
    { title: '样品类型', dataIndex: 'typeLabel', key: 'typeLabel' },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    { title: '接收日期', dataIndex: 'receivingTime', key: 'receivingTime' },
    { title: '状态', dataIndex: 'statusLabel', key: 'status', render: (v: string, record: Sample) => {
      const colors: Record<string, string> = {
        '待接收': 'blue', '已接收': 'cyan', '待分配': 'blue', '已分配': 'processing',
        '检测中': 'warning', '待审核': 'purple', '审核中': 'processing', '已完成': 'success',
      };
      return <Tag color={colors[record.statusLabel] || 'default'}>{v}</Tag>;
    }},
  ];

  const lineConfig = {
    data: turnaroundData.flatMap((d: any) => [
      { date: d.date, value: d.all, type: '所有样品' },
      { date: d.date, value: d.water, type: '环境水' },
      { date: d.date, value: d.soil, type: '土壤' },
      { date: d.date, value: d.air, type: '空气' },
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    height: 240,
    legend: { position: 'top' as const },
    yAxis: { title: { text: '平均天数' } },
  };

  const pieConfig = {
    data: typeDistribution.map((d: any) => ({ type: d.type, value: d.count })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
    height: 240,
    label: false,
    statistic: {
      title: { content: '总样品数' },
      content: { content: String(typeDistribution.reduce((sum: number, d: any) => sum + d.count, 0)) },
    },
    legend: { position: 'right' as const, layout: 'vertical' as const },
  };

  const alertIconMap: Record<string, React.ReactNode> = {
    error: <WarningOutlined style={{ color: '#f5222d' }} />,
    warning: <WarningOutlined style={{ color: '#faad14' }} />,
    info: <BellOutlined style={{ color: '#1677ff' }} />,
    success: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Col><Title level={4} style={{ margin: 0 }}>首页 Dashboard</Title></Col>
        <Col><Button icon={<AppstoreOutlined />} onClick={() => setWorkspaceOpen(true)}>自定义工作台</Button></Col>
      </Row>
      <Row justify="space-between" style={{marginBottom:16}}>
        <Col><Text>上午好，张伟 | 欢迎使用红创LIMS实验室信息管理系统</Text></Col>
        <Col><Select defaultValue="center" size="small" style={{width:150}} onChange={v => message.info('已切换到: '+ (v==='center'?'中心实验室':'理化实验室'))}>
          <Select.Option value="center">🏢 中心实验室</Select.Option>
          <Select.Option value="physics">🔬 理化实验室</Select.Option>
          <Select.Option value="instrument">⚙️ 仪器分析室</Select.Option>
        </Select></Col>
      </Row>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statCards.map((card, i) => (
          <Col span={6} key={i}>
            <Card hoverable onClick={() => {
              if (card.title === '样品总数') navigate('/samples');
              else if (card.title === '待检测数' || card.title === '逾期任务') navigate('/tasks');
              else if (card.title === '已完成报告') navigate('/reports');
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: card.color, fontSize: 24
                }}>{card.icon}</div>
                <div>
                  <div style={{ color: '#666', fontSize: 14 }}>{card.title}</div>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#111' }}>{card.value.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: card.change >= 0 ? '#52c41a' : '#f5222d' }}>
                    较昨日 {card.change >= 0 ? '+' : ''}{card.change}
                    {card.change >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Samples */}
        <Col span={16}>
          <Card
            title="最近样品"
            extra={<Button type="link" onClick={() => navigate('/samples')}>查看全部</Button>}
          >
            <Table
              dataSource={recentSamples}
              columns={sampleColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        {/* Task Queue */}
        <Col span={8}>
          <Card title="任务队列" extra={<Button type="link" onClick={() => navigate('/tasks')}>查看全部</Button>}>
            <List
              dataSource={taskQueueItems}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                    <span style={{ color: item.color, fontSize: 18 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 'bold', color: item.color }}>{item.value}</span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Turnaround Trend */}
        <Col span={12}>
          <Card title="周转时间趋势（平均天数）" extra={<Button type="link" onClick={() => navigate('/statistics')}>查看详情</Button>}>
            <Line {...lineConfig} />
          </Card>
        </Col>

        {/* Sample Type Distribution */}
        <Col span={6}>
          <Card title="样品类型分布" extra={<Button type="link" onClick={() => navigate('/statistics')}>查看详情</Button>}>
            <Pie {...pieConfig} />
          </Card>
        </Col>

        {/* Instrument Status */}
        <Col span={6}>
          <Card title="仪器状态" extra={<Button type="link" onClick={() => navigate('/instruments')}>查看全部</Button>}>
            <List
              dataSource={instruments}
              renderItem={(inst) => {
                const statusColors: Record<string, string> = {
                  running: '#52c41a', idle: '#1677ff', maintenance: '#faad14',
                };
                return (
                  <List.Item>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                      <Badge color={statusColors[inst.status] || '#999'} />
                      <span style={{ flex: 1 }}>{inst.name}</span>
                      <Tag color={statusColors[inst.status] || 'default'}>{inst.statusLabel}</Tag>
                    </div>
                  </List.Item>
                );
              }}
            />
          </Card>
        </Col>

        {/* System Alerts */}
        <Col span={12}>
          <Card title="系统提醒" extra={<Button type="link" onClick={() => message.info('所有系统提醒列表')}>查看全部</Button>}>
            <List
              dataSource={alerts}
              renderItem={(alert) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 12 }}>
                    <span style={{ fontSize: 18 }}>{alertIconMap[alert.level]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 500 }}>{alert.title}</div>
                      <div style={{ fontSize: 12, color: '#999' }}>{alert.desc}</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#999' }}>{alert.time}</span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col span={12}>
          <Card title="快速操作">
            <Row gutter={[16, 16]}>
              {[
                { label: '样品登记', desc: '新建样品信息', icon: <InboxOutlined />, path: '/samples', color: '#1677ff' },
                { label: '创建检测', desc: '新建检测任务', icon: <ExperimentOutlined />, path: '/tasks', color: '#52c41a' },
                { label: '查看报告', desc: '浏览检测报告', icon: <FileTextOutlined />, path: '/reports', color: '#722ed1' },
                { label: '审计追踪', desc: '查看操作记录', icon: <EyeOutlined />, path: '/settings', color: '#fa8c16' },
                { label: '数据分析', desc: '统计分析报表', icon: <SettingOutlined />, path: '/statistics', color: '#13c2c2' },
              ].map((action, i) => (
                <Col span={8} key={i}>
                  <Card
                    hoverable
                    onClick={() => navigate(action.path)}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <div style={{ fontSize: 28, color: action.color, marginBottom: 8 }}>{action.icon}</div>
                    <div style={{ fontWeight: 500 }}>{action.label}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{action.desc}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* AI 预测：检测周期预测 */}
      <Card title={<Space><BarChartOutlined /> AI 检测周期预测</Space>} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small" style={{ background: '#f6ffed' }}>
              <Statistic title="地表水" value="3.2" suffix="天" valueStyle={{ color: '#52c41a' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>较上月 -0.5天</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: '#fff7e6' }}>
              <Statistic title="土壤" value="5.8" suffix="天" valueStyle={{ color: '#faad14' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>较上月 +0.3天</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: '#fff0f6' }}>
              <Statistic title="废水" value="4.5" suffix="天" valueStyle={{ color: '#eb2f96' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>较上月 -0.2天</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: '#e6f7ff' }}>
              <Statistic title="空气/废气" value="6.1" suffix="天" valueStyle={{ color: '#1890ff' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>较上月 +0.8天 ↑</Text>
            </Card>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>预测模型：</Text>
            <Tag color="blue">时序分析 (ARIMA)</Tag>
            <Tag color="green">准确率 87%</Tag>
          </Col>
          <Col span={8}>
            <Text strong>训练数据：</Text>
            <Text type="secondary">近 12 个月检测记录</Text>
          </Col>
          <Col span={8}>
            <Text strong>下次更新：</Text>
            <Text type="secondary">每日 03:00 自动重训练</Text>
          </Col>
        </Row>
      </Card>

      <CustomWorkspace
        open={workspaceOpen}
        onClose={() => setWorkspaceOpen(false)}
        onSave={(v) => { setVisibleWidgets(v); localStorage.setItem('dashboard_widgets', JSON.stringify(v)); }}
        initialVisible={visibleWidgets}
      />
    </div>
  );
};

export default DashboardPage;
