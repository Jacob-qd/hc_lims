import React, { useState } from 'react';
import { Card, Row, Col, Typography, Statistic, Table, Tag, Button, Input, Space, Tabs, Progress, Steps, message, Form, Select } from 'antd';
import { FileTextOutlined, ExperimentOutlined, CloudUploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockOrders = [
  { id: 'ord1', no: 'WT-2025-001', sample: '地表水样品', items: 'pH, COD, 氨氮', submitDate: '2024-05-20', status: 'testing', progress: 45 },
  { id: 'ord2', no: 'WT-2025-002', sample: '土壤样品', items: '重金属(Pb, Cd)', submitDate: '2024-05-18', status: 'completed', progress: 100 },
  { id: 'ord3', no: 'WT-2025-003', sample: '饮用水样品', items: '余氯, 微生物', submitDate: '2024-05-22', status: 'received', progress: 10 },
];

const mockReports = [
  { id: 'rpt1', no: 'RPT20240521001', sample: '地表水检测报告', date: '2024-05-21', status: 'available' },
  { id: 'rpt2', no: 'RPT20240520022', sample: '土壤检测报告', date: '2024-05-20', status: 'available' },
];

const statusMap: Record<string, [string, string]> = { pending: ['default', '待确认'], received: ['blue', '已接收'], testing: ['orange', '检测中'], completed: ['green', '已完成'] };
const flowSteps = ['委托提交', '样品接收', '检测中', '报告出具'];

export const CustomerPortalPage: React.FC = () => {
  const [trackNo, setTrackNo] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [orderVisible] = useState(false);

  const handleTrack = () => {
    const found = mockOrders.find(o => o.no === trackNo || o.sample.includes(trackNo));
    if (found) setTrackResult(found);
    else message.warning('未找到匹配的委托单');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <Card style={{ marginBottom: 16, textAlign: 'center', background: 'linear-gradient(135deg, #1677ff, #0958d9)', color: '#fff', borderRadius: 12 }}>
        <Title level={3} style={{ color: '#fff', margin: 0 }}>红创LIMS 客户自助门户</Title>
        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>在线委托 · 进度查询 · 报告下载</Text>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}><Card hoverable onClick={() => setOrderVisible(true)}><Statistic title="在线委托" value="新委托" prefix={<CloudUploadOutlined />} valueStyle={{ fontSize: 16 }} /></Card></Col>
        <Col span={8}><Card hoverable><Statistic title="我的委托" value={mockOrders.length} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col span={8}><Card hoverable><Statistic title="可下载报告" value={mockReports.length} prefix={<FileTextOutlined />} /></Card></Col>
      </Row>

      <Card title="样品进度查询" style={{ marginBottom: 16 }}>
        <Space>
          <Input.Search placeholder="输入委托单号或样品名称" value={trackNo} onChange={e => setTrackNo(e.target.value)} onSearch={handleTrack} style={{ width: 400 }} enterButton="查询" />
        </Space>
        {trackResult && (
          <Card size="small" style={{ marginTop: 16 }}>
            <Row justify="space-between"><Col><Text strong>{trackResult.no}</Text><br /><Text>{trackResult.sample}</Text></Col><Col><Tag color={statusMap[trackResult.status][0]}>{statusMap[trackResult.status][1]}</Tag></Col></Row>
            <Progress percent={trackResult.progress} size="small" style={{ marginTop: 8 }} />
            <Steps current={flowSteps.indexOf(trackResult.status === 'completed' ? '报告出具' : trackResult.status === 'testing' ? '检测中' : trackResult.status === 'received' ? '样品接收' : '委托提交')} size="small" style={{ marginTop: 8 }} items={flowSteps.map(s => ({ title: s }))} />
          </Card>
        )}
      </Card>

      <Tabs defaultActiveKey="orders" items={[
        { key: 'orders', label: '我的委托', children: (
          <Table dataSource={mockOrders} rowKey="id" columns={[
            { title: '委托单号', dataIndex: 'no' },
            { title: '样品名称', dataIndex: 'sample' },
            { title: '检测项目', dataIndex: 'items' },
            { title: '提交日期', dataIndex: 'submitDate' },
            { title: '进度', dataIndex: 'progress', render: (p: number) => <Progress percent={p} size="small" /> },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'completed' ? 'success' : 'processing'} text={statusMap[s][1]} /> },
          ]} pagination={false} size="middle" />
        )},
        { key: 'reports', label: '报告下载', children: (
          <Table dataSource={mockReports} rowKey="id" columns={[
            { title: '报告编号', dataIndex: 'no' },
            { title: '报告名称', dataIndex: 'sample' },
            { title: '生成日期', dataIndex: 'date' },
            { title: '状态', dataIndex: 'status', render: () => <Tag color="green">可下载</Tag> },
            { title: '操作', render: () => <Button type="primary" size="small" icon={<FileTextOutlined />} onClick={() => message.success('报告下载中...')}>下载PDF</Button> },
          ]} pagination={false} size="middle" />
        )},
        { key: 'new', label: '在线委托', children: (
          <Card>
            <Form layout="vertical" style={{ maxWidth: 600 }}>
              <Form.Item label="样品名称" required><Input placeholder="如：地表水样品" /></Form.Item>
              <Form.Item label="样品类型"><Select><Select.Option value="water">地表水</Select.Option><Select.Option value="soil">土壤</Select.Option><Select.Option value="air">环境空气</Select.Option></Select></Form.Item>
              <Form.Item label="检测项目"><Select mode="multiple" placeholder="选择检测项目"><Select.Option value="ph">pH值</Select.Option><Select.Option value="cod">COD</Select.Option><Select.Option value="nh3">氨氮</Select.Option></Select></Form.Item>
              <Form.Item label="联系人" required><Input /></Form.Item>
              <Form.Item label="联系电话" required><Input /></Form.Item>
              <Form.Item label="备注"><Input.TextArea rows={3} /></Form.Item>
              <Button type="primary" block size="large" onClick={() => message.success('委托申请已提交，我们将尽快与您联系')}>提交委托</Button>
            </Form>
          </Card>
        )},
      ]} />
    </div>
  );
};
