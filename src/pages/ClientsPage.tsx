import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space,
  Input, Select, Drawer, Descriptions, Tabs, Modal, Form, message, Popconfirm,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined, ExperimentOutlined, TeamOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const typeColor: Record<string, string> = { 企业: '#1677ff', 政府: '#52c41a', 个人: '#d9d9d9' };
const statusColor: Record<string, string> = { active: '#52c41a', pending: '#faad14', suspended: '#ff4d4f' };
const statusLabel: Record<string, string> = { active: '合作中', pending: '暂停', suspended: '终止' };
const creditColor: Record<string, string> = { A: '#52c41a', B: '#faad14', C: '#ff4d4f' };

const api = (p: string) => `/api/v1${p}`;

interface Client {
  id: string; name: string; shortName?: string;
  type: string; industry: string;
  contact: string; phone: string; email?: string; address?: string;
  credit: string; status: string; source: string;
  samples: number; contracts: number;
  createdAt: string; updatedAt: string;
}

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selected, setSelected] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [form] = Form.useForm();

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(api('/clients'));
      const json = await res.json();
      if (json.code === 200) setClients(json.data?.list || []);
    } catch { message.error('加载客户列表失败'); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadClients(); }, [loadClients]);

  const filtered = clients.filter(c =>
    !search || c.name.includes(search) || c.contact.includes(search) || c.phone.includes(search)
  );

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    newThisMonth: clients.filter(c => c.createdAt?.startsWith('2026-05')).length,
    expiringContracts: clients.filter(c => c.status === 'active').length,
  };

  const openCreate = () => {
    setEditingClient(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    form.setFieldsValue(client);
    setModalVisible(true);
  };

  const handleSave = async (values: unknown) => {
    const isEdit = !!editingClient;
    const url = isEdit ? api(`/clients/${editingClient!.id}`) : api('/clients');
    const method = isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success(isEdit ? '客户信息已更新' : '客户已创建');
        setModalVisible(false);
        loadClients();
      }
    } catch { message.error('保存失败'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(api(`/clients/${id}`), { method: 'DELETE' });
      const json = await res.json();
      if (json.code === 200) {
        message.success('客户已删除');
        loadClients();
      }
    } catch { message.error('删除失败'); }
  };

  const columns = [
    { title: '客户名称', dataIndex: 'name', key: 'name', render: (n: string, r: Client) =>
      <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{n}</a>
    },
    { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={typeColor[t]}>{t}</Tag> },
    { title: '行业', dataIndex: 'industry' },
    { title: '联系人', dataIndex: 'contact' },
    { title: '电话', dataIndex: 'phone' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag> },
    { title: '信用', dataIndex: 'credit', render: (c: string) => <Tag color={creditColor[c]}>{c}</Tag> },
    { title: '样品数', dataIndex: 'samples' },
    { title: '操作', render: (_: string, r: Client) => (
      <Space size="small">
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawerVisible(true); }}>查看</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEdit(r)}>编辑</Button>
        <Popconfirm title="确认删除此客户？" onConfirm={() => handleDelete(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>客户管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>新增客户</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="客户总数" value={stats.total} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="活跃客户" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="本月新增" value={stats.newThisMonth} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="活跃合同" value={stats.expiringContracts} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索名称/联系人/电话" prefix={<SearchOutlined />} value={search}
            onChange={e => setSearch(e.target.value)} style={{ width: 240 }} allowClear />
          <Select placeholder="类型" style={{ width: 100 }} allowClear>
            {['企业','政府','个人'].map(t => <Option key={t}>{t}</Option>)}
          </Select>
          <Select placeholder="状态" style={{ width: 100 }} allowClear>
            {['active','pending','suspended'].map(s => <Option key={s}>{statusLabel[s]}</Option>)}
          </Select>
        </Space>
        <Table dataSource={filtered} rowKey="id" loading={loading} columns={columns} pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      {/* Detail Drawer */}
      <Drawer title={selected?.name} open={drawerVisible} onClose={() => { setDrawerVisible(false); setSelected(null); }} width={420}>
        {selected && (
          <>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="客户名称">{selected.name}</Descriptions.Item>
              <Descriptions.Item label="简称">{selected.shortName || '-'}</Descriptions.Item>
              <Descriptions.Item label="类型"><Tag color={typeColor[selected.type]}>{selected.type}</Tag></Descriptions.Item>
              <Descriptions.Item label="行业">{selected.industry}</Descriptions.Item>
              <Descriptions.Item label="联系人">{selected.contact}</Descriptions.Item>
              <Descriptions.Item label="电话">{selected.phone}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selected.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="地址">{selected.address || '-'}</Descriptions.Item>
              <Descriptions.Item label="来源">{selected.source || '-'}</Descriptions.Item>
              <Descriptions.Item label="信用"><Tag color={creditColor[selected.credit]}>{selected.credit}</Tag></Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusColor[selected.status]}>{statusLabel[selected.status]}</Tag></Descriptions.Item>
            </Descriptions>
            <Tabs style={{ marginTop: 16 }} items={[
              { key: 'contracts', label: <span><FileTextOutlined /> 合同</span>, children: <Text type="secondary">合同列表（待集成）</Text> },
              { key: 'orders', label: <span><ExperimentOutlined /> 委托单</span>, children: <Text type="secondary">委托记录（待集成）</Text> },
              { key: 'samples', label: <span><TeamOutlined /> 历史样品</span>, children: <Text type="secondary">样品记录（待集成）</Text> },
            ]} />
          </>
        )}
      </Drawer>

      {/* Create/Edit Modal */}
      <Modal
        title={editingClient ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onOk={() => form.submit()}
        onCancel={() => setModalVisible(false)}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ type: '企业', credit: 'B', status: 'active', source: '自行开发' }}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="客户名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="shortName" label="简称"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="type" label="类型"><Select>{['企业','政府','个人'].map(t => <Option key={t}>{t}</Option>)}</Select></Form.Item></Col>
            <Col span={8}><Form.Item name="industry" label="行业"><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="source" label="客户来源"><Select>{['自行开发','客户推荐','展会','线上渠道','其他'].map(s => <Option key={s}>{s}</Option>)}</Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="contact" label="联系人" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="phone" label="电话" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={8}><Form.Item name="email" label="邮箱"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="address" label="地址"><Input /></Form.Item></Col>
            <Col span={6}><Form.Item name="credit" label="信用等级"><Select>{['A','B','C'].map(c => <Option key={c}>{c}</Option>)}</Select></Form.Item></Col>
            <Col span={6}><Form.Item name="status" label="状态"><Select>{['active','pending','suspended'].map(s => <Option key={s}>{statusLabel[s]}</Option>)}</Select></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
