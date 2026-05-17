import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Row, Col, Card, Table, Tag, List, Button,
  Typography, Badge, Select, message, Statistic, Divider, Space
} from 'antd';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation(['common', 'dashboard']);
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
    { titleKey: 'dashboard:kpi.totalSamples', value: stats?.totalSamples ?? 0, change: stats?.totalSamplesChange ?? 0, icon: <InboxOutlined style={{ color: '#1677ff' }} />, color: '#e6f4ff' },
    { titleKey: 'dashboard:kpi.pendingTests', value: stats?.pendingTests ?? 0, change: stats?.pendingTestsChange ?? 0, icon: <ExperimentOutlined style={{ color: '#52c41a' }} />, color: '#f6ffed' },
    { titleKey: 'dashboard:kpi.overdueTasks', value: stats?.overdueTasks ?? 0, change: stats?.overdueTasksChange ?? 0, icon: <WarningOutlined style={{ color: '#faad14' }} />, color: '#fffbe6' },
    { titleKey: 'dashboard:kpi.completedReports', value: stats?.completedReports ?? 0, change: stats?.completedReportsChange ?? 0, icon: <FileTextOutlined style={{ color: '#722ed1' }} />, color: '#f9f0ff' },
  ];

  const taskQueueItems = [
    { labelKey: 'dashboard:taskQueueItems.pendingAssign', value: taskQueue?.pendingAssign ?? 0, icon: <ClockCircleOutlined />, color: '#1677ff' },
    { labelKey: 'dashboard:taskQueueItems.pendingTest', value: taskQueue?.pendingTest ?? 0, icon: <ExperimentOutlined />, color: '#52c41a' },
    { labelKey: 'dashboard:taskQueueItems.pendingReview', value: taskQueue?.pendingReview ?? 0, icon: <FileTextOutlined />, color: '#722ed1' },
    { labelKey: 'dashboard:taskQueueItems.pendingApprove', value: taskQueue?.pendingApprove ?? 0, icon: <CheckCircleOutlined />, color: '#13c2c2' },
    { labelKey: 'dashboard:taskQueueItems.overdue', value: taskQueue?.overdue ?? 0, icon: <WarningOutlined />, color: '#f5222d' },
  ];

  const sampleColumns = [
    { title: t('dashboard:columns.sampleNo'), dataIndex: 'sampleNo', key: 'sampleNo', render: (v: string) => <Text style={{ color: '#1677ff' }}>{v}</Text> },
    { title: t('dashboard:columns.sampleName'), dataIndex: 'name', key: 'name' },
    { title: t('dashboard:columns.sampleType'), dataIndex: 'typeLabel', key: 'typeLabel' },
    { title: t('dashboard:columns.customerName'), dataIndex: 'customerName', key: 'customerName' },
    { title: t('dashboard:columns.receivingDate'), dataIndex: 'receivingTime', key: 'receivingTime' },
    { title: t('dashboard:columns.status'), dataIndex: 'statusLabel', key: 'status', render: (v: string, record: Sample) => {
      const colors: Record<string, string> = {
        '待接收': 'blue', '已接收': 'cyan', '待分配': 'blue', '已分配': 'processing',
        '检测中': 'warning', '待审核': 'purple', '审核中': 'processing', '已完成': 'success',
      };
      return <Tag color={colors[record.statusLabel] || 'default'}>{v}</Tag>;
    }},
  ];

  const lineConfig = {
    data: turnaroundData.flatMap((d: any) => [
      { date: d.date, value: d.all, type: t('dashboard:sampleTypes.all') },
      { date: d.date, value: d.water, type: t('dashboard:sampleTypes.water') },
      { date: d.date, value: d.soil, type: t('dashboard:sampleTypes.soil') },
      { date: d.date, value: d.air, type: t('dashboard:sampleTypes.air') },
    ]),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    smooth: true,
    height: 240,
    legend: { position: 'top' as const },
    yAxis: { title: { text: t('dashboard:kpi.unitDay') } },
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
      title: { content: t('dashboard:sampleDistribution') },
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

  const quickActions = [
    { labelKey: 'dashboard:quickActionItems.registerSample', icon: <InboxOutlined />, path: '/samples', color: '#1677ff' },
    { labelKey: 'dashboard:quickActionItems.createTask', icon: <ExperimentOutlined />, path: '/tasks', color: '#52c41a' },
    { labelKey: 'dashboard:quickActionItems.viewReport', icon: <FileTextOutlined />, path: '/reports', color: '#722ed1' },
    { labelKey: 'dashboard:quickActionItems.auditTrail', icon: <EyeOutlined />, path: '/settings', color: '#fa8c16' },
    { labelKey: 'dashboard:quickActionItems.dataAnalysis', icon: <SettingOutlined />, path: '/statistics', color: '#13c2c2' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" style={{ marginBottom: 8 }}>
        <Col><Title level={4} style={{ margin: 0 }}>{t('dashboard:title')}</Title></Col>
        <Col><Button icon={<AppstoreOutlined />} onClick={() => setWorkspaceOpen(true)}>{t('dashboard:customizeWorkspace')}</Button></Col>
      </Row>
      <Row justify="space-between" style={{marginBottom:16}}>
        <Col><Text>{t('dashboard:welcome')}</Text></Col>
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
            <Card hoverable onClick={() => navigate('/samples')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: card.color, fontSize: 24
                }}>{card.icon}</div>
                <div>
                  <div style={{ color: '#666', fontSize: 14 }}>{t(card.titleKey)}</div>
                  <div style={{ fontSize: 32, fontWeight: 'bold', color: '#111' }}>{card.value.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: card.change >= 0 ? '#52c41a' : '#f5222d' }}>
                    {t('dashboard:kpi.changeFromYesterday')} {card.change >= 0 ? '+' : ''}{card.change}
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
            title={t('dashboard:recentSamples')}
            extra={<Button type="link" onClick={() => navigate('/samples')}>{t('action.viewAll')}</Button>}
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
          <Card title={t('dashboard:taskQueue')} extra={<Button type="link" onClick={() => navigate('/tasks')}>{t('action.viewAll')}</Button>}>
            <List
              dataSource={taskQueueItems}
              renderItem={(item) => (
                <List.Item>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 12 }}>
                    <span style={{ color: item.color, fontSize: 18 }}>{item.icon}</span>
                    <span style={{ flex: 1 }}>{t(item.labelKey)}</span>
                    <span style={{ fontSize: 18, fontWeight: 'bold', color: item.color }}>{item.value}</span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Turnaround Trend */}
        <Col span={12}>
          <Card title={t('dashboard:turnaroundTrend')} extra={<Button type="link" onClick={() => navigate('/statistics')}>{t('action.viewDetails')}</Button>}>
            <Line {...lineConfig} />
          </Card>
        </Col>

        {/* Sample Type Distribution */}
        <Col span={6}>
          <Card title={t('dashboard:sampleDistribution')} extra={<Button type="link" onClick={() => navigate('/statistics')}>{t('action.viewDetails')}</Button>}>
            <Pie {...pieConfig} />
          </Card>
        </Col>

        {/* Instrument Status */}
        <Col span={6}>
          <Card title={t('dashboard:instrumentStatus')} extra={<Button type="link" onClick={() => navigate('/instruments')}>{t('action.viewAll')}</Button>}>
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
          <Card title={t('dashboard:systemAlerts')} extra={<Button type="link" onClick={() => message.info('所有系统提醒列表')}>{t('action.viewAll')}</Button>}>
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
          <Card title={t('dashboard:quickActions')}>
            <Row gutter={[16, 16]}>
              {quickActions.map((action, i) => (
                <Col span={8} key={i}>
                  <Card
                    hoverable
                    onClick={() => navigate(action.path)}
                    style={{ textAlign: 'center', cursor: 'pointer' }}
                    styles={{ body: { padding: 16 } }}
                  >
                    <div style={{ fontSize: 28, color: action.color, marginBottom: 8 }}>{action.icon}</div>
                    <div style={{ fontWeight: 500 }}>{t(`${action.labelKey}.label` as const)}</div>
                    <div style={{ fontSize: 12, color: '#999' }}>{t(`${action.labelKey}.desc` as const)}</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>

      {/* AI Prediction */}
      <Card title={<Space><BarChartOutlined /> {t('dashboard:aiPrediction')}</Space>} style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Card size="small" style={{ background: '#f6ffed' }}>
              <Statistic title={t('dashboard:waterTypes.surface')} value="3.2" suffix={t('common.unitDay')} valueStyle={{ color: '#52c41a' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>较上月 -0.5{t('common.unitDay')}</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: '#fff7e6' }}>
              <Statistic title={t('dashboard:waterTypes.soil')} value="5.8" suffix={t('common.unitDay')} valueStyle={{ color: '#faad14' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>较上月 +0.3{t('common.unitDay')}</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: '#fff0f6' }}>
              <Statistic title={t('dashboard:waterTypes.wasteWater')} value="4.5" suffix={t('common.unitDay')} valueStyle={{ color: '#eb2f96' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>较上月 -0.2{t('common.unitDay')}</Text>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ background: '#e6f7ff' }}>
              <Statistic title={t('dashboard:waterTypes.air')} value="6.1" suffix={t('common.unitDay')} valueStyle={{ color: '#1890ff' }} />
              <Text type="secondary" style={{ fontSize: 11 }}>较上月 +0.8{t('common.unitDay')} ↑</Text>
            </Card>
          </Col>
        </Row>
        <Divider />
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>{t('dashboard:prediction.model')}:</Text>
            <Tag color="blue">{t('dashboard:prediction.arima')}</Tag>
            <Tag color="green">{t('dashboard:prediction.accuracy')} 87%</Tag>
          </Col>
          <Col span={8}>
            <Text strong>{t('dashboard:prediction.trainingData')}:</Text>
            <Text type="secondary">{t('dashboard:prediction.last12Months')}</Text>
          </Col>
          <Col span={8}>
            <Text strong>{t('dashboard:prediction.nextUpdate')}:</Text>
            <Text type="secondary">{t('dashboard:prediction.autoRetrain')}</Text>
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
