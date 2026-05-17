import React, { useEffect, useState } from 'react';
import {
  Card, Badge, Button, Space, Tag, Typography, Row, Col, Statistic,
  Table, Timeline, Empty, message, Drawer, Select,
} from 'antd';
import {
  BellOutlined, WarningOutlined, CheckCircleOutlined,
  ToolOutlined, ExperimentOutlined, FileTextOutlined,
  DashboardOutlined, ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface AIAlert {
  id: string;
  type: 'qc' | 'instrument' | 'sample' | 'data';
  level: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  sourceId: string;
  sourceType: string;
  suggestion: string;
  status: 'new' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

interface AlertStats {
  total: number;
  new: number;
  acknowledged: number;
  resolved: number;
  critical: number;
  warning: number;
  info: number;
  trend: { date: string; qc: number; instrument: number; sample: number; data: number }[];
}

const typeConfig: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  qc: { icon: <ExperimentOutlined />, label: '质控', color: '#1677ff' },
  instrument: { icon: <ToolOutlined />, label: '仪器', color: '#faad14' },
  sample: { icon: <FileTextOutlined />, label: '样品', color: '#52c41a' },
  data: { icon: <DashboardOutlined />, label: '数据', color: '#722ed1' },
};

const levelConfig: Record<string, { color: string; label: string }> = {
  info: { color: 'blue', label: '信息' },
  warning: { color: 'orange', label: '警告' },
  critical: { color: 'red', label: '严重' },
};

const statusConfig: Record<string, { color: string; label: string }> = {
  new: { color: 'red', label: '新预警' },
  acknowledged: { color: 'orange', label: '已确认' },
  resolved: { color: 'green', label: '已解决' },
};

// Simple bar chart for trend
const TrendChart: React.FC<{ data: AlertStats['trend'] }> = ({ data }) => {
  const maxVal = Math.max(...data.flatMap(d => [d.qc, d.instrument, d.sample, d.data]));
  const h = 160;
  const barW = 24;
  const gap = 12;
  const totalW = data.length * (barW * 4 + gap) + gap;

  return (
    <svg viewBox={`0 0 ${totalW} ${h + 30}`} style={{ width: '100%', height: 200 }}>
      {data.map((d, i) => {
        const x = gap + i * (barW * 4 + gap);
        const vals = [
          { v: d.qc, c: typeConfig.qc.color },
          { v: d.instrument, c: typeConfig.instrument.color },
          { v: d.sample, c: typeConfig.sample.color },
          { v: d.data, c: typeConfig.data.color },
        ];
        return (
          <g key={d.date}>
            {vals.map((val, j) => {
              const bh = maxVal > 0 ? (val.v / maxVal) * h : 0;
              return (
                <rect
                  key={j}
                  x={x + j * barW}
                  y={h - bh}
                  width={barW - 2}
                  height={bh}
                  fill={val.c}
                  rx={2}
                />
              );
            })}
            <text x={x + barW * 2} y={h + 18} textAnchor="middle" fontSize={10} fill="#999">{d.date}</text>
          </g>
        );
      })}
      {/* Legend */}
      {Object.entries(typeConfig).map(([key, cfg], i) => (
        <g key={key} transform={`translate(${gap + i * 70}, ${h + 26})`}>
          <rect width={8} height={8} fill={cfg.color} rx={2} />
          <text x={12} y={7} fontSize={10} fill="#666">{cfg.label}</text>
        </g>
      ))}
    </svg>
  );
};

export const AIAlertPage: React.FC = () => {
  const [alerts, setAlerts] = useState<AIAlert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AIAlert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const fetchData = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== 'all') params.set('status', filterStatus);
    if (filterType !== 'all') params.set('type', filterType);

    Promise.all([
      fetch(`/api/v1/ai/alerts?${params.toString()}`).then(r => r.json()),
      fetch('/api/v1/ai/alerts/stats').then(r => r.json()),
    ]).then(([alertsRes, statsRes]) => {
      if (alertsRes.code === 200) setAlerts(alertsRes.data.list);
      if (statsRes.code === 200) setStats(statsRes.data);
    }).catch(() => message.error('加载数据失败'))
    .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData(); // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterType]);

  const handleAck = (id: string) => {
    fetch(`/api/v1/ai/alerts/${id}/ack`, { method: 'PUT' })
      .then(r => r.json())
      .then(res => {
        if (res.code === 200) {
          setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'acknowledged' } : a));
          message.success('已确认');
          fetchData();
        }
      });
  };

  const handleResolve = (id: string) => {
    fetch(`/api/v1/ai/alerts/${id}/resolve`, { method: 'PUT' })
      .then(r => r.json())
      .then(res => {
        if (res.code === 200) {
          setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved', resolvedAt: new Date().toISOString() } : a));
          message.success('已解决');
          fetchData();
        }
      });
  };

  const openDetail = (alert: AIAlert) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  const columns: ColumnsType<AIAlert> = [
    {
      title: '预警类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (v: string) => (
        <Tag color={typeConfig[v]?.color} icon={typeConfig[v]?.icon}>
          {typeConfig[v]?.label}
        </Tag>
      ),
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (v: string) => (
        <Tag color={levelConfig[v]?.color}>{levelConfig[v]?.label}</Tag>
      ),
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '来源',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (v: string) => (
        <Badge status={statusConfig[v]?.color as 'success' | 'processing' | 'error' | 'default' | 'warning'} text={statusConfig[v]?.label} />
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_: unknown, record: AIAlert) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => openDetail(record)}>详情</Button>
          {record.status === 'new' && (
            <Button type="link" size="small" onClick={() => handleAck(record.id)}>确认</Button>
          )}
          {record.status !== 'resolved' && (
            <Button type="link" size="small" onClick={() => handleResolve(record.id)}>解决</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <BellOutlined style={{ marginRight: 8 }} />
        异常预警看板
      </Title>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日预警"
              value={stats?.total || 0}
              valueStyle={{ color: '#1677ff' }}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="新预警"
              value={stats?.new || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已确认"
              value={stats?.acknowledged || 0}
              valueStyle={{ color: '#faad14' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="高风险"
              value={stats?.critical || 0}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<WarningOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Trend Chart */}
      <Card title="近6天预警趋势" style={{ marginBottom: 16 }}>
        {stats?.trend ? <TrendChart data={stats.trend} /> : <Empty description="暂无趋势数据" />}
      </Card>

      {/* Alert Table */}
      <Card
        title="预警列表"
        extra={
          <Space>
            <Select
              value={filterType}
              onChange={setFilterType}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'qc', label: '质控' },
                { value: 'instrument', label: '仪器' },
                { value: 'sample', label: '样品' },
                { value: 'data', label: '数据' },
              ]}
              size="small"
            />
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'new', label: '新预警' },
                { value: 'acknowledged', label: '已确认' },
                { value: 'resolved', label: '已解决' },
              ]}
              size="small"
            />
            <Button size="small" onClick={fetchData}>刷新</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={alerts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          size="small"
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="预警详情"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={520}
      >
        {selectedAlert && (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Tag color={typeConfig[selectedAlert.type]?.color} style={{ marginBottom: 8 }}>
                {typeConfig[selectedAlert.type]?.label}
              </Tag>
              <Tag color={levelConfig[selectedAlert.level]?.color}>
                {levelConfig[selectedAlert.level]?.label}
              </Tag>
              <Title level={5} style={{ marginTop: 8 }}>{selectedAlert.title}</Title>
            </div>

            <Card size="small" title="预警描述">
              <Text>{selectedAlert.description}</Text>
            </Card>

            <Card size="small" title="AI 建议措施" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>
              <Text><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />{selectedAlert.suggestion}</Text>
            </Card>

            <Row gutter={16}>
              <Col span={12}>
                <Card size="small"><Statistic title="来源类型" value={selectedAlert.sourceType} valueStyle={{ fontSize: 14 }} /></Card>
              </Col>
              <Col span={12}>
                <Card size="small"><Statistic title="来源ID" value={selectedAlert.sourceId} valueStyle={{ fontSize: 14 }} /></Card>
              </Col>
            </Row>

            <Timeline
              items={[
                { color: 'blue', children: <><Text strong>创建预警</Text><br /><Text type="secondary">{selectedAlert.createdAt}</Text></> },
                ...(selectedAlert.status !== 'new' ? [{ color: 'orange', children: <><Text strong>确认预警</Text><br /><Text type="secondary">操作人员已确认该预警</Text></> }] : []),
                ...(selectedAlert.status === 'resolved' ? [{ color: 'green', children: <><Text strong>解决完成</Text><br /><Text type="secondary">{selectedAlert.resolvedAt}</Text></> }] : []),
              ]}
            />

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              {selectedAlert.status === 'new' && (
                <Button type="primary" onClick={() => { handleAck(selectedAlert.id); setDrawerOpen(false); }}>确认预警</Button>
              )}
              {selectedAlert.status !== 'resolved' && (
                <Button onClick={() => { handleResolve(selectedAlert.id); setDrawerOpen(false); }}>标记解决</Button>
              )}
            </Space>
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default AIAlertPage;
