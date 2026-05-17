import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Badge, Table, Tag, Spin, message } from 'antd';
import { AlertOutlined, SafetyOutlined, RiseOutlined, FallOutlined, MinusOutlined, AreaChartOutlined } from '@ant-design/icons';
import { Area } from '@ant-design/plots';

export const AIPredictionPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/ai/anomaly/dashboard')
      .then(r => r.json())
      .then(res => { if (res.code === 200) setData(res.data); else message.error(res.message); })
      .catch(() => message.error('加载失败'))
      .finally(() => setLoading(false));
  }, []);

  const levelConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
    critical: { color: '#ff4d4f', label: '紧急', icon: <FallOutlined /> },
    warning: { color: '#faad14', label: '警告', icon: <AlertOutlined /> },
    info: { color: '#1677ff', label: '提示', icon: <MinusOutlined /> },
  };

  const alertColumns = [
    { title: '级别', dataIndex: 'level', width: 80, render: (l: string) => { const cfg = levelConfig[l]; return <Tag color={cfg.color} icon={cfg.icon}>{cfg.label}</Tag>; } },
    { title: '标题', dataIndex: 'title', width: 200 },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    { title: '来源', dataIndex: 'source', width: 140 },
    { title: '发生时间', dataIndex: 'occurredAt', width: 160 },
    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Badge status={s === 'active' ? 'processing' : 'default'} text={s === 'active' ? '未处理' : '已解决'} /> },
    { title: '建议操作', dataIndex: 'suggestedAction', ellipsis: true },
  ];

  const areaConfig = data?.predictions ? {
    data: data.predictions.flatMap((p: any) => [
      { date: p.date, value: p.predicted, type: '预测值' },
      { date: p.date, value: p.upper, type: '上限' },
      { date: p.date, value: p.lower, type: '下限' },
    ]), xField: 'date', yField: 'value', seriesField: 'type', smooth: true, height: 280,
    legend: { position: 'top' as const }, color: ['#722ed1', '#d3adf7', '#d3adf7'],
    areaStyle: (datum: any) => datum.type === '上限' || datum.type === '下限' ? { fillOpacity: 0.1 } : { fillOpacity: 0.2 },
  } : null;

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '40px auto' }} />;

  const activeAlerts = data?.alerts?.filter((a: any) => a.status === 'active') || [];
  const criticalCount = activeAlerts.filter((a: any) => a.level === 'critical').length;
  const warningCount = activeAlerts.filter((a: any) => a.level === 'warning').length;

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><Card><Statistic title="综合风险评分" value={data?.riskScore || 0} suffix="/ 100"
          valueStyle={{ color: (data?.riskScore || 0) > 70 ? '#ff4d4f' : (data?.riskScore || 0) > 40 ? '#faad14' : '#52c41a', fontSize: 36 }} prefix={<SafetyOutlined />} />
          <div style={{ marginTop: 8 }}><Tag color={criticalCount > 0 ? 'red' : 'green'}>{criticalCount} 个紧急</Tag><Tag color={warningCount > 0 ? 'orange' : 'green'}>{warningCount} 个警告</Tag></div>
        </Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="活跃告警" value={activeAlerts.length} valueStyle={{ color: '#ff4d4f' }} prefix={<AlertOutlined />} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="已解决" value={(data?.alerts?.filter((a: any) => a.status === 'resolved').length) || 0} valueStyle={{ color: '#52c41a' }} prefix={<RiseOutlined />} /></Card></Col>
      </Row>
      <Card title="异常告警" style={{ marginBottom: 24 }}><Table dataSource={data?.alerts} rowKey="id" columns={alertColumns} size="small" pagination={{ pageSize: 10 }} /></Card>
      <Row gutter={16}><Col span={24}><Card title={<><AreaChartOutlined /> 周期时间预测趋势（未来7天）</>}>{areaConfig && <Area {...areaConfig} />}</Card></Col></Row>
    </div>
  );
};
