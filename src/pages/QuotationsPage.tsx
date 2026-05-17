import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space,
  Input, Select, message, Modal, Form, InputNumber, Divider,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const api = (p: string) => `/api/v1${p}`;

interface QuotationItem {
  key: string; testItem: string; method: string; unit: string;
  unitPrice: number; quantity: number;
}

interface Quotation {
  id: string; no: string; customerId: string; customerName: string;
  items: QuotationItem[]; totalAmount: number; validUntil: string;
  status: string; remark: string;
  createdAt: string;
}

const statusColor: Record<string, string> = {
  draft: 'default', sent: 'blue', confirmed: 'green', rejected: 'red',
};
const statusLabel: Record<string, string> = {
  draft: '草稿', sent: '已发送', confirmed: '已确认', rejected: '已拒绝',
};

const testItemOptions = [
  { value: 'COD', label: 'COD测定', method: '重铬酸钾法', unit: 'mg/L', price: 80 },
  { value: 'BOD5', label: 'BOD5测定', method: '稀释接种法', unit: 'mg/L', price: 120 },
  { value: 'SS', label: '悬浮物', method: '重量法', unit: 'mg/L', price: 60 },
  { value: 'NH3N', label: '氨氮', method: '纳氏试剂法', unit: 'mg/L', price: 100 },
  { value: 'TP', label: '总磷', method: '钼酸铵法', unit: 'mg/L', price: 90 },
  { value: 'TN', label: '总氮', method: '碱性过硫酸钾法', unit: 'mg/L', price: 110 },
  { value: 'pH', label: 'pH值', method: '玻璃电极法', unit: '-', price: 40 },
  { value: 'CL', label: '氯离子', method: '离子色谱法', unit: 'mg/L', price: 70 },
];

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [customers, setCustomers] = useState<LooseAny[]>([]);
  const [form] = Form.useForm();
  const [items, setItems] = useState<QuotationItem[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [qr, cr] = await Promise.all([
        fetch(api('/quotations')).then(r => r.json()),
        fetch(api('/clients')).then(r => r.json()),
      ]);
      if (qr.code === 200) setQuotations(qr.data?.list || []);
      if (cr.code === 200) setCustomers(cr.data?.list || []);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadData(); }, [loadData]);

  const addItem = () => {
    setItems(prev => [...prev, { key: `item-${Date.now()}`, testItem: '', method: '', unit: '', unitPrice: 0, quantity: 1 }]);
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };

  const updateItem = (key: string, field: string, value: LooseAny) => {
    setItems(prev => prev.map(i => {
      if (i.key !== key) return i;
      const updated = { ...i, [field]: value };
      // Auto-fill from template
      if (field === 'testItem') {
        const tpl = testItemOptions.find(t => t.value === value);
        if (tpl) { updated.method = tpl.method; updated.unit = tpl.unit; updated.unitPrice = tpl.price; }
      }
      return updated;
    }));
  };

  const totalAmount = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);

  const handleSave = async (values: LooseAny) => {
    if (items.length === 0) { message.warning('请至少添加一个检测项目'); return; }
    const payload = { ...values, items, totalAmount };
    try {
      const res = await fetch(api('/quotations'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('报价单已创建');
        setModalVisible(false);
        setItems([]);
        loadData();
      }
    } catch { message.error('保存失败'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(api(`/quotations/${id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      message.success('状态已更新');
      loadData();
    } catch { message.error('更新失败'); }
  };

  const columns = [
    { title: '编号', dataIndex: 'no', width: 140 },
    { title: '客户', dataIndex: 'customerName', ellipsis: true },
    { title: '金额', dataIndex: 'totalAmount', render: (v: number) => `¥${(v || 0).toLocaleString()}` },
    { title: '有效期', dataIndex: 'validUntil' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt' },
    { title: '操作', render: (_: string, r: Quotation) => (
      <Space size="small">
        {r.status === 'draft' && <Button size="small" icon={<SendOutlined />} onClick={() => handleStatusChange(r.id, 'sent')}>发送</Button>}
        {r.status === 'sent' && <Button size="small" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(r.id, 'confirmed')}>确认</Button>}
        {r.status === 'sent' && <Button size="small" icon={<CloseCircleOutlined />} onClick={() => handleStatusChange(r.id, 'rejected')}>拒绝</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>报价管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setItems([]); setModalVisible(true); }}>新建报价</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card><Statistic title="报价总数" value={quotations.length} /></Card></Col>
        <Col span={6}><Card><Statistic title="待确认" value={quotations.filter(q => q.status === 'sent').length} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="已确认" value={quotations.filter(q => q.status === 'confirmed').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="总金额" value={`¥${quotations.reduce((s, q) => s + (q.totalAmount || 0), 0).toLocaleString()}`} valueStyle={{ color: '#722ed1' }} /></Card></Col>
      </Row>

      <Card>
        <Table dataSource={quotations} rowKey="id" loading={loading} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="新建报价单" open={modalVisible} onCancel={() => setModalVisible(false)} width={700}
        footer={<Space><Button onClick={() => setModalVisible(false)}>取消</Button><Button type="primary" onClick={() => form.submit()}>创建报价单</Button></Space>}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ validUntil: '2026-06-17' }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
                <Select placeholder="选择客户" showSearch>
                  {customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="validUntil" label="有效期至"><Input /></Form.Item>
            </Col>
          </Row>

          <Divider>检测项目清单</Divider>
          {items.map((item) => (
            <Row gutter={8} key={item.key} align="middle" style={{ marginBottom: 8 }}>
              <Col span={5}>
                <Select placeholder="检测项目" value={item.testItem || undefined} style={{ width: '100%' }}
                  onChange={v => updateItem(item.key, 'testItem', v)}
                  options={testItemOptions.map(t => ({ value: t.value, label: t.label }))}
                />
              </Col>
              <Col span={5}><Text type="secondary" style={{ fontSize: 11 }}>{item.method || '选择项目自动填充'}</Text></Col>
              <Col span={3}><Text type="secondary" style={{ fontSize: 11 }}>{item.unit}</Text></Col>
              <Col span={4}>
                <InputNumber size="small" placeholder="单价" style={{ width: '100%' }}
                  value={item.unitPrice} onChange={v => updateItem(item.key, 'unitPrice', v)}
                  prefix="¥" min={0} />
              </Col>
              <Col span={3}>
                <InputNumber size="small" placeholder="数量" style={{ width: '100%' }}
                  value={item.quantity} onChange={v => updateItem(item.key, 'quantity', v)} min={1} />
              </Col>
              <Col span={2}><Text>¥{(item.unitPrice * item.quantity).toLocaleString()}</Text></Col>
              <Col span={2}>
                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => removeItem(item.key)} />
              </Col>
            </Row>
          ))}
          <Button size="small" type="dashed" onClick={addItem} block icon={<PlusOutlined />}>添加检测项目</Button>

          <Divider />
          <Row justify="space-between">
            <Col><Text strong>合计</Text></Col>
            <Col><Text strong style={{ fontSize: 18, color: '#1677ff' }}>¥{totalAmount.toLocaleString()}</Text></Col>
          </Row>
          <Form.Item name="remark" label="备注"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
