import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic,
  Input, Select, message, Modal, Form, Descriptions, Timeline, Divider, InputNumber, Popconfirm, Tabs, Space,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  CheckCircleOutlined, ClockCircleOutlined, ExperimentOutlined,
  ArrowRightOutlined, FileTextOutlined,
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

const nextStatusMap: Record<string, string> = {
  pending: 'sampling', sampling: 'testing', testing: 'completed',
};

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

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

  useEffect(() => { loadData(); }, [loadData]);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    active: orders.filter(o => o.status === 'sampling' || o.status === 'testing').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const handleCreate = async (values: any) => {
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

  const handleUpdate = async () => {
    if (!selected) return;
    const values = editForm.getFieldsValue();
    try {
      const res = await fetch(api(`/orders/${selected.id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('委托单已更新');
        setEditModal(false);
        loadData();
        if (detailVisible) {
          setSelected({ ...selected, ...values });
        }
      }
    } catch { message.error('更新失败'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(api(`/orders/${id}`), { method: 'DELETE' });
      const json = await res.json();
      if (json.code === 200) {
        message.success('委托单已删除');
        loadData();
        if (selected?.id === id) {
          setDetailVisible(false);
          setSelected(null);
        }
      }
    } catch { message.error('删除失败'); }
  };

  const handleAdvanceStatus = async (order: Order) => {
    const next = nextStatusMap[order.status];
    if (!next) { message.info('委托单已完成'); return; }
    try {
      const res = await fetch(api(`/orders/${order.id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success(`状态已更新为: ${statusLabel[next]}`);
        loadData();
        if (selected?.id === order.id) {
          setSelected({ ...order, status: next });
        }
      }
    } catch { message.error('更新失败'); }
  };

  const handlePayment = async (order: Order) => {
    const amount = order.totalAmount - (order.paidAmount || 0);
    if (amount <= 0) { message.info('已全额付款'); return; }
    try {
      const res = await fetch(api(`/orders/${order.id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidAmount: order.totalAmount,
          paymentStatus: 'paid',
        }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('已标记为全额付款');
        loadData();
        if (selected?.id === order.id) {
          setSelected({ ...order, paidAmount: order.totalAmount, paymentStatus: 'paid' });
        }
      }
    } catch { message.error('更新失败'); }
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
    { title: '操作', width: 220, render: (_: any, r: Order) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDetailVisible(true); }}>详情</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelected(r); editForm.setFieldsValue({...r}); setEditModal(true); }}>编辑</Button>
        {r.status !== 'completed' && (
          <Button type="link" size="small" icon={<ArrowRightOutlined />} onClick={() => handleAdvanceStatus(r)}>推进</Button>
        )}
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
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

      {/* Edit Modal */}
      <Modal title="编辑委托单" open={editModal} onOk={() => editForm.submit()} onCancel={() => setEditModal(false)} width={560}>
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="projectName" label="项目名称"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="sampleCount" label="样品数量"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="totalAmount" label="总金额(元)"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}>
              <Form.Item name="paymentStatus" label="付款状态">
                <Select>{[{v:'unpaid',l:'未付款'},{v:'partial',l:'部分付款'},{v:'paid',l:'已付款'}].map(p => <Option key={p.v} value={p.v}>{p.l}</Option>)}</Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="remark" label="备注"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal title={`委托单: ${selected?.no}`} open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={600}>
        {selected && (
          <>
            <Space style={{ marginBottom: 12 }}>
              <Button size="small" icon={<EditOutlined />} onClick={() => { setDetailVisible(false); editForm.setFieldsValue({...selected}); setEditModal(true); }}>编辑</Button>
              {selected.status !== 'completed' && (
                <Button size="small" type="primary" icon={<ArrowRightOutlined />} onClick={() => handleAdvanceStatus(selected)}>推进状态</Button>
              )}
              {selected.paymentStatus !== 'paid' && (
                <Button size="small" icon={<CheckCircleOutlined />} onClick={() => handlePayment(selected)}>标记付款</Button>
              )}
              <Popconfirm title="确认删除?" onConfirm={() => handleDelete(selected.id)}>
                <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            </Space>
            <Tabs items={[
              { key: 'info', label: <span><FileTextOutlined /> 基本信息</span>, children: (
                <Descriptions column={2} bordered size="small">
                  <Descriptions.Item label="委托编号" span={2}>{selected.no}</Descriptions.Item>
                  <Descriptions.Item label="客户" span={2}>{selected.customerName}</Descriptions.Item>
                  <Descriptions.Item label="项目">{selected.projectName}</Descriptions.Item>
                  <Descriptions.Item label="样品数">{selected.sampleCount}</Descriptions.Item>
                  <Descriptions.Item label="金额">¥{(selected.totalAmount || 0).toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="已付">¥{(selected.paidAmount || 0).toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="状态" span={2}><Tag color={statusColor[selected.status]}>{statusLabel[selected.status]}</Tag></Descriptions.Item>
                  <Descriptions.Item label="付款" span={2}><Tag color={payColor[selected.paymentStatus]}>{payLabel[selected.paymentStatus]}</Tag></Descriptions.Item>
                  <Descriptions.Item label="备注" span={2}>{selected.remark || '-'}</Descriptions.Item>
                </Descriptions>
              )},
              { key: 'progress', label: <span><ExperimentOutlined /> 进度追踪</span>, children: (
                <Timeline items={[
                  { color: 'green', children: <>{selected.createdAt} 委托单创建</> },
                  ...(selected.status !== 'pending' ? [{ color: 'blue' as const, children: <>采样完成</> }] : []),
                  ...(selected.status === 'testing' || selected.status === 'completed' ? [{ color: 'processing' as const, children: <>检测中</> }] : []),
                  ...(selected.status === 'completed' ? [{ color: 'green' as const, children: <>检测完成</> }] : []),
                ]} />
              )},
              { key: 'samples', label: <span>样品详情</span>, children: (
                <Text type="secondary">样品详情页将在样品管理模块关联后展示</Text>
              )},
            ]} />
          </>
        )}
      </Modal>
    </div>
  );
};
