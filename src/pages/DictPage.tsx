import React, { useState } from 'react';
import { Card, Table, Tag, Tabs, Button, Space, Typography, message, Modal, Form, Input, InputNumber, Select, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

const initialDictData: Record<string, { code: string; name: string; sort: number; status: string }[]> = {
  sampleType: [
    { code: 'surface_water', name: '地表水', sort: 1, status: 'active' },
    { code: 'groundwater', name: '地下水', sort: 2, status: 'active' },
    { code: 'drinking_water', name: '饮用水', sort: 3, status: 'active' },
    { code: 'waste_water', name: '废水', sort: 4, status: 'active' },
    { code: 'soil', name: '土壤', sort: 5, status: 'active' },
  ],
  testItem: [
    { code: 'ph', name: 'pH值', sort: 1, status: 'active' },
    { code: 'cod', name: '化学需氧量(COD)', sort: 2, status: 'active' },
    { code: 'nh3', name: '氨氮', sort: 3, status: 'active' },
    { code: 'tp', name: '总磷', sort: 4, status: 'active' },
    { code: 'pb', name: '重金属(Pb)', sort: 5, status: 'active' },
  ],
  priority: [
    { code: 'urgent', name: '紧急', sort: 1, status: 'active' },
    { code: 'high', name: '高', sort: 2, status: 'active' },
    { code: 'medium', name: '中', sort: 3, status: 'active' },
    { code: 'low', name: '低', sort: 4, status: 'active' },
  ],
};

const dictLabels: Record<string, string> = { sampleType: '样品类型', testItem: '检测项目', priority: '优先级' };

export const DictPage: React.FC = () => {
  const [dictData, setDictData] = useState(initialDictData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<{ code: string; name: string; sort: number; status: string } | null>(null);
  const [currentKey, setCurrentKey] = useState('sampleType');
  const [form] = Form.useForm();

  const handleOpenCreate = (key: string) => {
    setCurrentKey(key);
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleOpenEdit = (key: string, item: any) => {
    setCurrentKey(key);
    setEditingItem(item);
    form.setFieldsValue(item);
    setModalVisible(true);
  };

  const handleDelete = (key: string, code: string) => {
    setDictData(prev => ({ ...prev, [key]: prev[key].filter(i => i.code !== code) }));
    message.success('已删除');
  };

  const handleFinish = (v: any) => {
    const key = currentKey;
    if (editingItem) {
      setDictData(prev => ({
        ...prev,
        [key]: prev[key].map(i => i.code === editingItem.code ? { ...i, ...v } : i),
      }));
      message.success('字典项更新成功');
    } else {
      setDictData(prev => ({
        ...prev,
        [key]: [...prev[key], { ...v, status: 'active' }],
      }));
      message.success('字典项创建成功');
    }
    setModalVisible(false);
    setEditingItem(null);
    form.resetFields();
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>数据字典</Title>
      <Tabs items={Object.entries(dictData).map(([key, data]) => ({
        key, label: dictLabels[key],
        children: <Card extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => handleOpenCreate(key)}>新增</Button>}>
          <Table dataSource={data} rowKey="code" pagination={false} size="middle" columns={[
            { title: '编码', dataIndex: 'code', render: (c: string) => <code>{c}</code> },
            { title: '名称', dataIndex: 'name' },
            { title: '排序', dataIndex: 'sort' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '启用' : '停用'}</Tag> },
            { title: '操作', render: (_: any, r: any) => <Space size="small">
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(key, r)}>编辑</Button>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(key, r.code)}>删除</Button>
            </Space> },
          ]} />
        </Card>,
      }))} />

      <Modal title={editingItem ? '编辑字典项' : '新增字典项'} open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); setEditingItem(null); form.resetFields(); }}>
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input placeholder="如: surface_water" disabled={!!editingItem} /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input placeholder="如: 地表水" /></Form.Item>
          <Form.Item name="sort" label="排序"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="status" label="状态"><Select defaultValue="active"><Select.Option value="active">启用</Select.Option><Select.Option value="inactive">停用</Select.Option></Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
