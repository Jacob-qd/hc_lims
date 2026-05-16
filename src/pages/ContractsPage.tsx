import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, message, Modal, Form, DatePicker } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const contracts = [
  { id: 'ct1', no: 'CT-2025-001', name: '地表水环境质量监测', client: '绿源环保', amount: '¥150,000', startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', type: '年度合同' },
  { id: 'ct2', no: 'CT-2025-002', name: '饮用水水质检测', client: '博克水务', amount: '¥280,000', startDate: '2025-03-01', endDate: '2025-09-01', status: 'active', type: '项目合同' },
  { id: 'ct3', no: 'CT-2025-003', name: '废水排放合规检测', client: '清源化工', amount: '¥96,000', startDate: '2025-04-15', endDate: '2025-10-15', status: 'active', type: '项目合同' },
  { id: 'ct4', no: 'CT-2024-008', name: '环境空气监测', client: '蓝天监测站', amount: '¥200,000', startDate: '2024-06-01', endDate: '2025-05-31', status: 'expiring', type: '年度合同' },
  { id: 'ct5', no: 'CT-2024-002', name: '食品安全检测', client: '宏达食品', amount: '¥120,000', startDate: '2024-01-01', endDate: '2024-12-31', status: 'expired', type: '年度合同' },
];

const statusColors: Record<string, string> = { active: '#52c41a', expiring: '#faad14', expired: '#d9d9d9' };
const statusLabels: Record<string, string> = { active: '执行中', expiring: '即将到期', expired: '已到期' };

export const ContractsPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();

  const handleFinish = (v: any) => {
    if (editing) {
      Object.assign(editing, v);
      message.success('合同更新成功');
    } else {
      contracts.push({ id: 'ct' + (contracts.length + 1), no: 'CT-2025-' + String(contracts.length + 1).padStart(3, '0'), status: 'active', ...v });
      message.success('合同创建成功');
    }
    setModalVisible(false); setEditing(null); form.resetFields();
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>合同管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setModalVisible(true); }}>新建合同</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={8}><Card><Statistic title="执行中" value={contracts.filter(c => c.status === 'active').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={8}><Card><Statistic title="即将到期" value={contracts.filter(c => c.status === 'expiring').length} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={8}><Card><Statistic title="已到期" value={contracts.filter(c => c.status === 'expired').length} valueStyle={{ color: '#d9d9d9' }} /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索合同编号/名称" prefix={<SearchOutlined />} style={{ width: 240 }} allowClear />
          <Select placeholder="状态" style={{ width: 120 }} allowClear>
            <Select.Option value="active">执行中</Select.Option>
            <Select.Option value="expiring">即将到期</Select.Option>
            <Select.Option value="expired">已到期</Select.Option>
          </Select>
        </Space>
        <Table dataSource={contracts} rowKey="id" columns={[
          { title: '合同编号', dataIndex: 'no', render: (n: string) => <Text code>{n}</Text> },
          { title: '合同名称', dataIndex: 'name' },
          { title: '客户', dataIndex: 'client' },
          { title: '金额', dataIndex: 'amount' },
          { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
          { title: '起始日期', dataIndex: 'startDate' },
          { title: '截止日期', dataIndex: 'endDate' },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
          { title: '操作', render: (_: any, r: any) => <Space size="small">
            <Button type="link" size="small" icon={<EyeOutlined />}>查看</Button>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setModalVisible(true); }}>编辑</Button>
            <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({ title: '删除合同', content: `确认删除 ${r.no}？`, onOk: () => message.success('已删除') })}>删除</Button>
          </Space> },
        ]} pagination={false} size="middle" />
      </Card>

      <Modal title={editing ? '编辑合同' : '新建合同'} open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); setEditing(null); form.resetFields(); }} width={560}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="name" label="合同名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="client" label="客户" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="amount" label="金额"><Input placeholder="¥150,000" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="type" label="合同类型"><Select>{['年度合同', '项目合同', '框架合同'].map(t => <Select.Option key={t}>{t}</Select.Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态"><Select>{['active', 'expiring', 'expired'].map(s => <Select.Option key={s}>{s === 'active' ? '执行中' : s === 'expiring' ? '即将到期' : '已到期'}</Select.Option>)}</Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="startDate" label="开始日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="endDate" label="截止日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
