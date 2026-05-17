import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, InputNumber, Select, message, Modal, Form, DatePicker, Popconfirm, Descriptions,
} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Contract {
  id: string;
  no: string;
  name: string;
  customerId: string;
  customerName: string;
  amount: number;
  type: 'annual' | 'project';
  typeLabel: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired';
  statusLabel: string;
  signDate: string;
  contactPerson: string;
  contactPhone: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = { active: 'green', expiring: 'orange', expired: 'default' };
const statusLabels: Record<string, string> = { active: '执行中', expiring: '即将到期', expired: '已到期' };

interface Customer {
  id: string;
  name: string;
}

export const ContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/v1/clients');
      const data = await res.json();
      if (data.code === 200) {
        setCustomers(data.data.list.map((c: any) => ({ id: c.id, name: c.name })));
      }
    } catch (e) {
      // silently fail
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (searchKeyword) params.set('keyword', searchKeyword);
      const res = await fetch(`/api/v1/contracts?${params.toString()}`);
      const data = await res.json();
      if (data.code === 200) {
        setContracts(data.data.list);
      }
    } catch (e) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, searchKeyword]);

  const openModal = (mode: 'create' | 'edit' | 'view', record?: Contract) => {
    setModalMode(mode);
    setEditingId(mode !== 'create' ? record?.id || null : null);
    form.resetFields();
    if (record) {
      form.setFieldsValue({
        ...record,
        startDate: record.startDate ? dayjs(record.startDate) : undefined,
        endDate: record.endDate ? dayjs(record.endDate) : undefined,
        signDate: record.signDate ? dayjs(record.signDate) : undefined,
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const customer = customers.find(c => c.id === values.customerId);
      const payload = {
        ...values,
        customerName: customer?.name || values.customerName || '',
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
        signDate: values.signDate?.format('YYYY-MM-DD'),
        typeLabel: values.type === 'annual' ? '年度合同' : '项目合同',
        statusLabel: statusLabels[values.status] || values.status,
      };
      const url = modalMode === 'create' ? '/api/v1/contracts' : `/api/v1/contracts/${editingId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.code === 200) {
        message.success(modalMode === 'create' ? '创建成功' : '更新成功');
        setModalVisible(false);
        fetchData();
      } else {
        message.error(data.message || '操作失败');
      }
    } catch (e) {
      // validation error
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/v1/contracts/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.code === 200) {
      message.success('删除成功');
      fetchData();
    }
  };

  const columns = [
    { title: '合同编号', dataIndex: 'no', key: 'no', render: (n: string) => <Text code>{n}</Text> },
    { title: '合同名称', dataIndex: 'name', key: 'name' },
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v: number) => `¥${v?.toLocaleString()}` },
    { title: '类型', dataIndex: 'typeLabel', key: 'typeLabel', render: (t: string) => <Tag>{t}</Tag> },
    { title: '起始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '截止日期', dataIndex: 'endDate', key: 'endDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
    {
      title: '操作', key: 'action', render: (_: any, record: Contract) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openModal('view', record)}>查看</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openModal('edit', record)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const activeCount = contracts.filter(c => c.status === 'active').length;
  const expiringCount = contracts.filter(c => c.status === 'expiring').length;
  const expiredCount = contracts.filter(c => c.status === 'expired').length;
  const totalAmount = contracts.reduce((s, c) => s + (c.amount || 0), 0);

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>合同管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => openModal('create')}>新建合同</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} lg={6}><Card><Statistic title="执行中" value={activeCount} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="即将到期" value={expiringCount} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="已到期" value={expiredCount} valueStyle={{ color: '#d9d9d9' }} /></Card></Col>
        <Col xs={12} lg={6}><Card><Statistic title="合同总金额" value={`¥${totalAmount.toLocaleString()}`} valueStyle={{ color: '#1890ff' }} /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索合同编号/名称/客户"
            prefix={<SearchOutlined />}
            style={{ width: 260 }}
            allowClear
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
          />
          <Select
            placeholder="状态"
            style={{ width: 120 }}
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: 'all', label: '全部' },
              { value: 'active', label: '执行中' },
              { value: 'expiring', label: '即将到期' },
              { value: 'expired', label: '已到期' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={() => { setSearchKeyword(''); setStatusFilter('all'); }} />
        </Space>
        <Table
          dataSource={contracts}
          rowKey="id"
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      <Modal
        title={modalMode === 'create' ? '新建合同' : modalMode === 'edit' ? '编辑合同' : '合同详情'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={modalMode !== 'view' ? handleSave : undefined}
        footer={modalMode === 'view' ? <Button onClick={() => setModalVisible(false)}>关闭</Button> : undefined}
        width={720}
      >
        {modalMode === 'view' ? (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="合同编号">{form.getFieldValue('no')}</Descriptions.Item>
            <Descriptions.Item label="合同名称">{form.getFieldValue('name')}</Descriptions.Item>
            <Descriptions.Item label="客户">{form.getFieldValue('customerName')}</Descriptions.Item>
            <Descriptions.Item label="金额">¥{(form.getFieldValue('amount') || 0).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="类型">{form.getFieldValue('typeLabel')}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusColors[form.getFieldValue('status')]}>{statusLabels[form.getFieldValue('status')]}</Tag></Descriptions.Item>
            <Descriptions.Item label="起始日期">{form.getFieldValue('startDate')?.format?.('YYYY-MM-DD') || form.getFieldValue('startDate')}</Descriptions.Item>
            <Descriptions.Item label="截止日期">{form.getFieldValue('endDate')?.format?.('YYYY-MM-DD') || form.getFieldValue('endDate')}</Descriptions.Item>
            <Descriptions.Item label="签订日期">{form.getFieldValue('signDate')?.format?.('YYYY-MM-DD') || form.getFieldValue('signDate')}</Descriptions.Item>
            <Descriptions.Item label="联系人">{form.getFieldValue('contactPerson')}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{form.getFieldValue('contactPhone')}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{form.getFieldValue('remark') || '-'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="no" label="合同编号" rules={[{ required: true }]}>
                  <Input placeholder="CT-2025-001" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="name" label="合同名称" rules={[{ required: true }]}>
                  <Input placeholder="地表水环境质量监测" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="customerId" label="客户" rules={[{ required: true }]}>
                  <Select placeholder="选择客户" options={customers.map(c => ({ value: c.id, label: c.name }))} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="amount" label="金额(元)" rules={[{ required: true }]}>
                  <InputNumber min={0} style={{ width: '100%' }} placeholder="150000" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="type" label="合同类型" rules={[{ required: true }]} initialValue="annual">
                  <Select options={[{ value: 'annual', label: '年度合同' }, { value: 'project', label: '项目合同' }]} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="status" label="状态" rules={[{ required: true }]} initialValue="active">
                  <Select options={[
                    { value: 'active', label: '执行中' },
                    { value: 'expiring', label: '即将到期' },
                    { value: 'expired', label: '已到期' },
                  ]} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item name="startDate" label="起始日期" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="endDate" label="截止日期" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item name="signDate" label="签订日期" rules={[{ required: true }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="contactPerson" label="联系人">
                  <Input placeholder="张经理" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="contactPhone" label="联系电话">
                  <Input placeholder="13800138001" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="remark" label="备注">
              <Input.TextArea rows={2} placeholder="备注信息" />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};
