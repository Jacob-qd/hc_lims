import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space,
  Input, Select, message, Modal, Form, InputNumber, Divider, Descriptions, Popconfirm,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, SendOutlined, CheckCircleOutlined, CloseCircleOutlined,
  EyeOutlined, EditOutlined, CopyOutlined,
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
  const [detailVisible, setDetailVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selected, setSelected] = useState<Quotation | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
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

  useEffect(() => { loadData(); }, [loadData]);

  const addItem = () => {
    setItems(prev => [...prev, { key: `item-${Date.now()}`, testItem: '', method: '', unit: '', unitPrice: 0, quantity: 1 }]);
  };

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(i => i.key !== key));
  };

  const updateItem = (key: string, field: string, value: any) => {
    setItems(prev => prev.map(i => {
      if (i.key !== key) return i;
      const updated = { ...i, [field]: value };
      if (field === 'testItem') {
        const tpl = testItemOptions.find(t => t.value === value);
        if (tpl) { updated.method = tpl.method; updated.unit = tpl.unit; updated.unitPrice = tpl.price; }
      }
      return updated;
    }));
  };

  const totalAmount = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);

  const handleSave = async (values: any) => {
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

  const handleUpdate = async () => {
    if (!selected) return;
    const values = editForm.getFieldsValue();
    try {
      const res = await fetch(api(`/quotations/${selected.id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...selected, ...values }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('报价单已更新');
        setEditVisible(false);
        loadData();
        if (detailVisible) setSelected({ ...selected, ...values });
      }
    } catch { message.error('更新失败'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(api(`/quotations/${id}`), { method: 'DELETE' });
      const json = await res.json();
      if (json.code === 200) {
        message.success('报价单已删除');
        loadData();
        if (selected?.id === id) { setDetailVisible(false); setSelected(null); }
      }
    } catch { message.error('删除失败'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await fetch(api(`/quotations/${id}`), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      message.success('状态已更新');
      loadData();
      if (selected?.id === id) setSelected({ ...selected, status });
    } catch { message.error('更新失败'); }
  };

  const handleGenerateOrder = async (quotation: Quotation) => {
    try {
      const res = await fetch(api('/orders'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: quotation.customerId,
          projectName: `报价转化-${quotation.no}`,
          sampleCount: quotation.items.reduce((s, i) => s + i.quantity, 0),
          totalAmount: quotation.totalAmount,
          paymentStatus: 'unpaid',
          status: 'pending',
          remark: `由报价单 ${quotation.no} 生成`,
        }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('委托单已生成');
      }
    } catch { message.error('生成失败'); }
  };

  const columns = [
    { title: '编号', dataIndex: 'no', width: 140 },
    { title: '客户', dataIndex: 'customerName', ellipsis: true },
    { title: '金额', dataIndex: 'totalAmount', render: (v: number) => `¥${(v || 0).toLocaleString()}` },
    { title: '有效期', dataIndex: 'validUntil' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt' },
    { title: '操作', width: 320, render: (_: any, r: Quotation) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDetailVisible(true); }}>详情</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelected(r); editForm.setFieldsValue({ remark: r.remark, validUntil: r.validUntil }); setEditVisible(true); }}>编辑</Button>
        {r.status === 'draft' && <Button size="small" icon={<SendOutlined />} onClick={() => handleStatusChange(r.id, 'sent')}>发送</Button>}
        {r.status === 'sent' && <Button size="small" icon={<CheckCircleOutlined />} onClick={() => handleStatusChange(r.id, 'confirmed')}>确认</Button>}
        {r.status === 'sent' && <Button size="small" icon={<CloseCircleOutlined />} onClick={() => handleStatusChange(r.id, 'rejected')}>拒绝</Button>}
        {r.status === 'confirmed' && <Button size="small" type="primary" icon={<CopyOutlined />} onClick={() => handleGenerateOrder(r)}>生成委托单</Button>}
        <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
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

      {/* Create Modal */}
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

      {/* Edit Modal */}
      <Modal title="编辑报价单" open={editVisible} onOk={handleUpdate} onCancel={() => setEditVisible(false)}>
        <Form form={editForm} layout="vertical">
          <Form.Item name="validUntil" label="有效期至"><Input /></Form.Item>
          <Form.Item name="remark" label="备注"><TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal title={`报价单详情: ${selected?.no}`} open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={600}>
        {selected && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="报价编号" span={2}>{selected.no}</Descriptions.Item>
              <Descriptions.Item label="客户" span={2}>{selected.customerName}</Descriptions.Item>
              <Descriptions.Item label="有效期">{selected.validUntil}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusColor[selected.status]}>{statusLabel[selected.status]}</Tag></Descriptions.Item>
              <Descriptions.Item label="总金额" span={2}>¥{(selected.totalAmount || 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="备注" span={2}>{selected.remark || '-'}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Text strong>检测项目清单</Text>
            <Table dataSource={selected.items} rowKey="key" pagination={false} size="small" style={{ marginTop: 8 }} columns={[
              { title: '检测项目', dataIndex: 'testItem' },
              { title: '方法', dataIndex: 'method' },
              { title: '单价', dataIndex: 'unitPrice', render: (v: number) => `¥${v}` },
              { title: '数量', dataIndex: 'quantity' },
              { title: '小计', render: (_: any, r: QuotationItem) => `¥${(r.unitPrice * r.quantity).toLocaleString()}` },
            ]} />
            {selected.status === 'confirmed' && (
              <>
                <Divider />
                <Button type="primary" icon={<CopyOutlined />} block onClick={() => handleGenerateOrder(selected)}>生成委托单</Button>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};
