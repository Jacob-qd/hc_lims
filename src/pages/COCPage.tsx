import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Timeline, Descriptions, Modal, Form, message, Steps } from 'antd';
import { PlusOutlined, SearchOutlined, SendOutlined, CheckCircleOutlined, BarcodeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockCOC = [
  { id: 'coc1', no: 'COC-2025-001', sample: 'SMP20240521001', from: '采样员 刘强', to: '张伟', time: '2024-05-21 10:45', status: 'signed', type: '接收' },
  { id: 'coc2', no: 'COC-2025-001', sample: 'SMP20240521001', from: '张伟', to: '理化实验室', time: '2024-05-21 14:00', status: 'signed', type: '移交' },
  { id: 'coc3', no: 'COC-2025-002', sample: 'SMP20240520045', from: '采样员 王明', to: '郑丽', time: '2024-05-20 16:45', status: 'signed', type: '接收' },
  { id: 'coc4', no: 'COC-2025-003', sample: 'SMP20240522001', from: '客户 张经理', to: '李思', time: '2024-05-22 09:30', status: 'pending', type: '接收' },
];

export const COCPage: React.FC = () => {
  const [records] = useState(mockCOC);
  const [modalVisible, setModalVisible] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const stats = { total: records.length, signed: records.filter(r => r.status === 'signed').length, pending: records.filter(r => r.status === 'pending').length };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><BarcodeOutlined /> COC 监管链</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建交接记录</Button></Col>
      </Row>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="总交接记录" value={stats.total} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已完成" value={stats.signed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="待签收" value={stats.pending} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="样品流转中" value={3} valueStyle={{ color: '#1677ff' }} /></Card></Col>
      </Row>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索交接单号/样品编号" prefix={<SearchOutlined />} style={{ width: 260 }} allowClear />
        </Space>
        <Table dataSource={records} rowKey="id" columns={[
          { title: '交接单号', dataIndex: 'no' },
          { title: '样品编号', dataIndex: 'sample' },
          { title: '转出方', dataIndex: 'from' },
          { title: '接收方', dataIndex: 'to' },
          { title: '交接时间', dataIndex: 'time' },
          { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={t === '接收' ? 'blue' : 'green'}>{t}</Tag> },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'signed' ? 'green' : 'orange'}>{s === 'signed' ? '已签收' : '待签收'}</Tag> },
          { title: '操作', render: (_: any, r: any) => <Button type="link" size="small" onClick={() => setSelected(r)}>查看</Button> },
        ]} pagination={false} size="middle" />
      </Card>
      <Card title="样品流转时间线" size="small" style={{ marginTop: 16 }}>
        <Timeline items={records.filter(r => r.status === 'signed').map(r => ({
          color: 'green',
          children: <><Text strong>{r.sample}</Text><br /><Text>{r.from} → {r.to}</Text><br /><Text type="secondary">{r.time} | {r.type}</Text></>
        }))} />
      </Card>

      <Modal title="新建交接记录" open={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form layout="vertical" onFinish={(v) => { message.success('交接记录已创建'); setModalVisible(false); }}>
          <Form.Item name="sample" label="样品编号" required><Input placeholder="扫描或输入条码" /></Form.Item>
          <Form.Item name="from" label="转出方" required><Input /></Form.Item>
          <Form.Item name="to" label="接收方" required><Input /></Form.Item>
          <Form.Item name="type" label="交接类型"><Input placeholder="接收/移交/退回" /></Form.Item>
          <Button type="primary" block htmlType="submit">确认交接</Button>
        </Form>
      </Modal>
    </div>
  );
};
