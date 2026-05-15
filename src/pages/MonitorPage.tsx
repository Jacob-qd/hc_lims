import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag, Alert, Progress, Space, Button, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, SyncOutlined, DashboardOutlined, CloudServerOutlined, DatabaseOutlined, ApiOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const api = (p: string) => `/api/v1${p}`;

const mockMetrics = [
  { key: 'cpu', label: 'CPU 使用率', value: '32%', status: 'normal', threshold: 80 },
  { key: 'memory', label: '内存使用率', value: '58%', status: 'normal', threshold: 85 },
  { key: 'disk', label: '磁盘使用率', value: '42%', status: 'normal', threshold: 90 },
  { key: 'db', label: '数据库连接', value: '12/100', status: 'normal', threshold: 80 },
  { key: 'api', label: 'API 响应时间(P99)', value: '320ms', status: 'normal', threshold: 5000 },
  { key: 'error', label: '错误率(5min)', value: '0.02%', status: 'normal', threshold: 1 },
  { key: 'backup', label: '备份状态', value: '正常', status: 'normal', threshold: 0 },
  { key: 'users', label: '在线用户', value: '8', status: 'normal', threshold: 0 },
];

export const MonitorPage: React.FC = () => {
  const [metrics] = useState(mockMetrics);
  const normal = metrics.filter(m => m.status === 'normal').length;

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ margin: 0, marginBottom: 16 }}><DashboardOutlined /> 系统监控</Title>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="系统状态" value="正常" valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="健康指标" value={`${normal}/${metrics.length}`} suffix="正常" valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="运行时间" value="7天 12h" prefix={<SyncOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="告警数" value={0} valueStyle={{ color: '#52c41a' }} prefix={<WarningOutlined />} /></Card></Col>
      </Row>

      <Row gutter={[16,16]}>
        {metrics.map(m => (
          <Col span={6} key={m.key}>
            <Card size="small" hoverable>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text type="secondary">{m.label}</Text>
                <Text style={{ fontSize: 24, fontWeight: 600, color: m.status === 'normal' ? '#52c41a' : '#ff4d4f' }}>{m.value}</Text>
                <Progress percent={parseInt(m.value) || 0} size="small" strokeColor={m.status === 'normal' ? '#52c41a' : '#ff4d4f'} />
                <Text type="secondary" style={{ fontSize: 11 }}>阈值: {m.threshold}{m.label.includes('率') ? '%' : ''}</Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="告警规则" style={{ marginTop: 16 }} extra={<Button size="small" onClick={() => message.success('告警规则已保存')}>保存配置</Button>}>
        <Table dataSource={[
          { rule:'CPU > 80% 持续5分钟', level:'警告', action:'通知管理员', enabled:true },
          { rule:'磁盘 > 90%', level:'警告', action:'通知管理员', enabled:true },
          { rule:'API P99 > 5s', level:'严重', action:'通知+自动重启', enabled:false },
          { rule:'备份失败', level:'严重', action:'通知管理员', enabled:true },
        ]} rowKey="rule" pagination={false} size="small" columns={[
          { title:'告警规则', dataIndex:'rule' }, { title:'级别', dataIndex:'level', render:(s:string)=><Tag color={s==='严重'?'red':'orange'}>{s}</Tag> },
          { title:'动作', dataIndex:'action' }, { title:'启用', dataIndex:'enabled', render:(v:boolean)=><Tag color={v?'green':'default'}>{v?'启用':'禁用'}</Tag> },
        ]} />
      </Card>
    </div>
  );
};
