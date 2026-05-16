import React, { useState, useEffect, useCallback } from 'react';
import {Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Badge, Progress, Timeline, Select, Descriptions, Alert, List} from 'antd';
import { DashboardOutlined, AlertOutlined, ApiOutlined, ClockCircleOutlined, CloudServerOutlined, SettingOutlined, WarningOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockSystemMetrics = {
  cpu: { usage: 34.5, cores: 8, temp: 52 },
  memory: { total: 32, used: 18.2, percentage: 57 },
  disk: { total: 500, used: 178, percentage: 36 },
  db: { connections: 12, maxConnections: 200, latency: 2.3, status: 'healthy' },
  network: { in: '12.5 MB/s', out: '3.2 MB/s', connections: 45 },
  uptime: '14天 6小时 23分钟',
};

const mockAlerts = [
  { id: 'a1', level: 'warning', message: '磁盘使用率超过70%阈值', time: '2024-05-15 14:23', source: 'disk-watcher', acknowledged: false },
  { id: 'a2', level: 'error', message: '数据库连接池接近上限 (85%)', time: '2024-05-15 12:45', source: 'db-monitor', acknowledged: false },
  { id: 'a3', level: 'info', message: '自动备份完成: hc_lims_full_20260515_120000.sql (256MB)', time: '2024-05-15 12:00', source: 'backup-service', acknowledged: true },
  { id: 'a4', level: 'warning', message: 'GC-MS #3 离线超过30分钟', time: '2024-05-15 10:15', source: 'instrument-monitor', acknowledged: false },
];

const mockLogs = [
  { id: 'l1', timestamp: '2024-05-15 14:30:12', level: 'INFO', service: 'api-gateway', message: 'GET /api/v1/samples 200 45ms' },
  { id: 'l2', timestamp: '2024-05-15 14:30:11', level: 'WARN', service: 'auth', message: '登录失败: 用户 admin 密码错误 (第3次)' },
  { id: 'l3', timestamp: '2024-05-15 14:30:10', level: 'INFO', service: 'sign-service', message: 'SM2签名验证通过: dsig-1715783410' },
  { id: 'l4', timestamp: '2024-05-15 14:30:08', level: 'ERROR', service: 'instrument-gateway', message: 'RS232连接超时: COM3 (HPLC#2)' },
  { id: 'l5', timestamp: '2024-05-15 14:30:05', level: 'INFO', service: 'workflow-engine', message: '流程实例 i1: 节点 transfer → approval' },
];

const AlertConfigPanel: React.FC = () => (
  <Card title={<><SettingOutlined /> 告警规则配置</>} size="small">
    <Table dataSource={[
      { rule: 'CPU使用率 > 90%', level: '严重', action: '短信+邮件', enabled: true },
      { rule: '内存使用率 > 85%', level: '严重', action: '邮件', enabled: true },
      { rule: '磁盘使用率 > 80%', level: '警告', action: '邮件', enabled: true },
      { rule: '数据库连接 > 80%', level: '警告', action: '邮件+站内', enabled: true },
      { rule: '仪器离线 > 30分钟', level: '警告', action: '站内通知', enabled: true },
      { rule: 'API响应 > 5s', level: '提示', action: '日志', enabled: false },
    ]} rowKey="rule" pagination={false} size="small" columns={[
      { title: '规则', dataIndex: 'rule' },
      { title: '级别', dataIndex: 'level', render: (l: string) => <Tag color={l === '严重' ? 'red' : l === '警告' ? 'orange' : 'blue'}>{l}</Tag> },
      { title: '通知方式', dataIndex: 'action' },
      { title: '状态', dataIndex: 'enabled', render: (e: boolean) => <Badge status={e ? 'success' : 'default'} text={e ? '启用' : '停用'} /> },
      { title: '操作', render: () => <Space><Button type="link" size="small">编辑</Button><Button type="link" size="small">测试</Button></Space> },
    ]} />
  </Card>
);

export const SystemMonitorPage: React.FC = () => {
  const [metrics, setMetrics] = useState(mockSystemMetrics);
  const [selectedService, setSelectedService] = useState('all');

  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: { ...prev.cpu, usage: +(prev.cpu.usage + (Math.random() - 0.5) * 10).toFixed(1) },
        memory: { ...prev.memory, percentage: +(prev.memory.percentage + (Math.random() - 0.5) * 5).toFixed(1) },
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getLevelTag = (level: string) => {
    const map: Record<string, { color: string; text: string }> = {
      error: { color: 'red', text: '错误' }, warning: { color: 'orange', text: '警告' },
      info: { color: 'blue', text: '信息' }, debug: { color: 'default', text: '调试' },
    };
    return <Tag color={map[level]?.color}>{map[level]?.text || level}</Tag>;
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}><DashboardOutlined /> 系统监控</Title>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small" hoverable><Statistic title="CPU使用率" value={metrics.cpu.usage} suffix="%" precision={1} valueStyle={{ color: metrics.cpu.usage > 80 ? '#ff4d4f' : '#52c41a' }} /><Progress percent={metrics.cpu.usage} size="small" showInfo={false} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="内存使用" value={metrics.memory.percentage} suffix={`% (${metrics.memory.used}GB/${metrics.memory.total}GB)`} precision={1} /><Progress percent={metrics.memory.percentage} size="small" showInfo={false} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="磁盘使用" value={metrics.disk.percentage} suffix={`% (${metrics.disk.used}GB/${metrics.disk.total}GB)`} precision={1} /><Progress percent={metrics.disk.percentage} size="small" showInfo={false} /></Card></Col>
        <Col span={6}><Card size="small" hoverable><Statistic title="运行时间" value={metrics.uptime} valueStyle={{ fontSize: 16 }} prefix={<ClockCircleOutlined />} /></Card></Col>
      </Row>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={12}><Card size="small"><Statistic title="数据库连接" value={metrics.db.connections} suffix={`/ ${metrics.db.maxConnections}`} prefix={<ApiOutlined />} valueStyle={{ color: metrics.db.connections > 160 ? '#ff4d4f' : '#52c41a' }} /><Text type="secondary">延迟: {metrics.db.latency}ms | 状态: <Badge status="success" text="正常" /></Text></Card></Col>
        <Col span={12}><Card size="small"><Statistic title="网络流量" value={metrics.network.in} suffix={`入 / ${metrics.network.out}出`} prefix={<CloudServerOutlined />} /><Text type="secondary">活跃连接: {metrics.network.connections}</Text></Card></Col>
      </Row>

      <Tabs defaultActiveKey="alerts" items={[
        { key: 'alerts', label: <span><AlertOutlined /> 告警 ({mockAlerts.filter(a => !a.acknowledged).length})</span>, children: <Card>
          {mockAlerts.filter(a => !a.acknowledged).length > 0 && (
            <Alert message={`${mockAlerts.filter(a => !a.acknowledged).length} 条未确认告警`} type="warning" showIcon style={{ marginBottom: 16 }} action={<Button size="small" onClick={() => message.success('全部确认')}>全部确认</Button>} />
          )}
          <List dataSource={mockAlerts} renderItem={a => (
            <List.Item actions={[<Button size="small" type="link">确认</Button>, <Button size="small" type="link">查看</Button>]}>
              <List.Item.Meta
                avatar={<WarningOutlined style={{ fontSize: 18, color: a.level === 'error' ? '#ff4d4f' : a.level === 'warning' ? '#faad14' : '#1677ff' }} />}
                title={<Space>{getLevelTag(a.level)} {a.message} {!a.acknowledged && <Badge status="processing" />}</Space>}
                description={<Text type="secondary">{a.time} · {a.source}</Text>}
              />
            </List.Item>
          )} />
        </Card>},
        { key: 'logs', label: '系统日志', children: <Card extra={
          <Space><Select value={selectedService} onChange={setSelectedService} style={{ width: 150 }} options={[{ value: 'all', label: '全部服务' }, { value: 'api-gateway', label: 'API网关' }, { value: 'auth', label: '认证服务' }, { value: 'sign-service', label: '签名服务' }, { value: 'workflow-engine', label: '工作流引擎' }]} /><Button>导出日志</Button></Space>
        }>
          <Table dataSource={mockLogs} rowKey="id" pagination={{ size: 'small', pageSize: 10 }} size="small" columns={[
            { title: '时间', dataIndex: 'timestamp', width: 180 },
            { title: '级别', dataIndex: 'level', width: 70, render: (l: string) => {
              const colors: Record<string, string> = { INFO: 'blue', WARN: 'orange', ERROR: 'red', DEBUG: 'default' };
              return <Tag color={colors[l]}>{l}</Tag>;
            }},
            { title: '服务', dataIndex: 'service', width: 150 },
            { title: '消息', dataIndex: 'message', ellipsis: true },
          ]} />
        </Card>},
        { key: 'rules', label: '告警规则', children: <AlertConfigPanel /> },
      ]} />
    </div>
  );
};
