import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic,
  Input, Select, message, Modal, Form, Descriptions, Timeline, Divider, InputNumber,
} from 'antd';
import {
  PlusOutlined, EyeOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExperimentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const api = (p: string) => `/api/v1${p}`;

interface Order {
  id: string; no: string; customerId: string; customerName: string;
  quotationId?: string; projectName: string;
  sampleCount: number; totalAmount: number; paidAmount: number;
  status: string; paymentStatus: string;
  samples: string[]; remark: string;
  createdAt: string; updatedAt: string;
}

const statusColor: Record<string, string> = {
  pending: 'orange', sampling: 'blue', testing: 'processing', completed: 'green',
};
const statusLabel: Record<string, string> = {
  pending: '待处理', sampling: '采样中', testing: '检测中', completed: '已完成',
};
const payColor: Record<string, string> = { unpaid: 'red', partial: 'orange', paid: 'green' };
const payLabel: Record<string, string> = { unpaid: '未付款', partial: '部分付款', paid: '已付款' };

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<LooseAny[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [form] = Form.useForm();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [or, cr] = await Promise.all([
        fetch(api('/orders')).then(r => r.json()),
        fetch(api('/clients')).then(r => r.json()),
      ]);
      if (or.code === 200) setOrders(or.data?.list || []);
      if (cr.code === 200) setCustomers(cr.data?.list || []);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => o.status === 'sampling' || o.status === 'testing').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const handleCreate = async (values: LooseAny) => {
    try {
      const res = await fetch(api('/orders'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('委托单已创建');
        setModalVisible(false);
        form.resetFields();
        loadData();
      }
    } catch { message.error('创建失败'); }
  };

  const columns = [
    { title: '委托编号', dataIndex: 'no', width: 140 },
    { title: '客户', dataIndex: 'customerName', ellipsis: true },
    { title: '项目名称', dataIndex: 'projectName', ellipsis: true },
    { title: '样品数', dataIndex: 'sampleCount', width: 70 },
    { title: '金额', dataIndex: 'totalAmount', render: (v: number) => `¥${(v || 0).toLocaleString()}` },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag> },
    { title: '付款', dataIndex: 'paymentStatus', render: (s: string) => <Tag color={payColor[s]}>{payLabel[s]}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt' },
    { title: '操作', render: (_: string, r: Order) => (
      <Button type="link" size="small" icon={<EyeOutlined />}
        onClick={() => { setSelected(r); setDetailVisible(true); }}>详情</Button>
    )},
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>委托单管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true); }}>新建委托单</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="委托总数" value={stats.total} /></Card></Col>
        <Col span={6}><Card><Statistic title="待处理" value={stats.pending} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="进行中" value={stats.active} valueStyle={{ color: '#1677ff' }} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col span={6}><Card><Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
      </Row>

      <Card>
        <Table dataSource={orders} rowKey="id" loading={loading} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      {/* Create Modal */}
      <Modal title="新建委托单" open={modalVisible} onOk={() => form.submit()} onCancel={() => setModalVisible(false)} width={560}>
        <Form form={form} layout="vertical" onFinish={handleCreate} initialValues={{ sampleCount: 1, totalAmount: 0, paymentStatus: 'unpaid', status: 'pending' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
                <Select placeholder="选择客户" showSearch>
                  {customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="projectName" label="项目名称"><Input /></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="sampleCount" label="样品数量"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={8}><Form.Item name="totalAmount" label="总金额(元)"><InputNumber min={0} style={{ width: '100%' }} prefix="¥" /></Form.Item></Col>
            <Col span={8}>
              <Form.Item name="paymentStatus" label="付款状态">
                <Select>{[{v:'unpaid',l:'未付款'},{v:'partial',l:'部分付款'},{v:'paid',l:'已付款'}].map(p => <Option key={p.v} value={p.v}>{p.l}</Option>)}</Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal title={`委托单: ${selected?.no}`} open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={520}>
        {selected && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="委托编号" span={2}>{selected.no}</Descriptions.Item>
              <Descriptions.Item label="客户" span={2}>{selected.customerName}</Descriptions.Item>
              <Descriptions.Item label="项目">{selected.projectName}</Descriptions.Item>
              <Descriptions.Item label="样品数">{selected.sampleCount}</Descriptions.Item>
              <Descriptions.Item label="金额">¥{(selected.totalAmount || 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="已付">¥{(selected.paidAmount || 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="状态" span={2}><Tag color={statusColor[selected.status]}>{statusLabel[selected.status]}</Tag></Descriptions.Item>
              <Descriptions.Item label="付款" span={2}><Tag color={payColor[selected.paymentStatus]}>{payLabel[selected.paymentStatus]}</Tag></Descriptions.Item>
            </Descriptions>
            <Divider>进度追踪</Divider>
            <Timeline items={[
              { color: 'green', children: <>{selected.createdAt} 委托单创建</> },
              ...(selected.status !== 'pending' ? [{ color: 'blue' as const, children: <>采样完成</> }] : []),
              ...(selected.status === 'testing' || selected.status === 'completed' ? [{ color: 'processing' as const, children: <>检测中</> }] : []),
              ...(selected.status === 'completed' ? [{ color: 'green' as const, children: <>检测完成</> }] : []),
            ]} />
            {selected.remark && <><Divider /><Text type="secondary">{selected.remark}</Text></>}
          </>
        )}
      </Modal>
    </div>
  );
};
