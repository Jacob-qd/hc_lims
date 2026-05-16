import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Tabs, Button, Space, Typography, message, Modal, Form, Input, InputNumber, Switch, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface DictType {
  id: string;
  code: string;
  name: string;
  description: string;
  sort: number;
  status: 'active' | 'inactive';
}

interface DictItem {
  id: string;
  typeId: string;
  typeCode: string;
  code: string;
  name: string;
  sort: number;
  status: 'active' | 'inactive';
}

export const DictPage: React.FC = () => {
  const [dictTypes, setDictTypes] = useState<DictType[]>([]);
  const [dictItems, setDictItems] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<string>('');

  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [typeModalMode, setTypeModalMode] = useState<'create' | 'edit'>('create');
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [typeForm] = Form.useForm();

  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [itemModalMode, setItemModalMode] = useState<'create' | 'edit'>('create');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [typeRes, itemRes] = await Promise.all([
        fetch('/api/v1/dict-types').then(r => r.json()),
        fetch('/api/v1/dict-items').then(r => r.json()),
      ]);
      if (typeRes.code === 200) {
        setDictTypes(typeRes.data.list);
        if (typeRes.data.list.length > 0 && !activeType) {
          setActiveType(typeRes.data.list[0].id);
        }
      }
      if (itemRes.code === 200) setDictItems(itemRes.data.list);
    } catch (e) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openTypeModal = (mode: 'create' | 'edit', record?: DictType) => {
    setTypeModalMode(mode);
    setEditingTypeId(mode === 'edit' ? record?.id || null : null);
    typeForm.resetFields();
    if (mode === 'edit' && record) {
      typeForm.setFieldsValue({ ...record });
    }
    setTypeModalVisible(true);
  };

  const handleTypeSave = async () => {
    try {
      const values = await typeForm.validateFields();
      const url = typeModalMode === 'create' ? '/api/v1/dict-types' : `/api/v1/dict-types/${editingTypeId}`;
      const method = typeModalMode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const data = await res.json();
      if (data.code === 200) {
        message.success(typeModalMode === 'create' ? '创建成功' : '更新成功');
        setTypeModalVisible(false);
        fetchData();
      } else {
        message.error(data.message || '操作失败');
      }
    } catch (e) {
      // validation error
    }
  };

  const handleTypeDelete = async (id: string) => {
    const res = await fetch(`/api/v1/dict-types/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.code === 200) {
      message.success('删除成功');
      if (activeType === id && dictTypes.length > 1) {
        setActiveType(dictTypes.find(t => t.id !== id)?.id || '');
      }
      fetchData();
    }
  };

  const openItemModal = (mode: 'create' | 'edit', record?: DictItem) => {
    setItemModalMode(mode);
    setEditingItemId(mode === 'edit' ? record?.id || null : null);
    itemForm.resetFields();
    if (mode === 'edit' && record) {
      itemForm.setFieldsValue({ ...record });
    } else {
      const currentType = dictTypes.find(t => t.id === activeType);
      itemForm.setFieldsValue({ typeId: activeType, typeCode: currentType?.code || '', status: 'active' });
    }
    setItemModalVisible(true);
  };

  const handleItemSave = async () => {
    try {
      const values = await itemForm.validateFields();
      const url = itemModalMode === 'create' ? '/api/v1/dict-items' : `/api/v1/dict-items/${editingItemId}`;
      const method = itemModalMode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const data = await res.json();
      if (data.code === 200) {
        message.success(itemModalMode === 'create' ? '创建成功' : '更新成功');
        setItemModalVisible(false);
        fetchData();
      } else {
        message.error(data.message || '操作失败');
      }
    } catch (e) {
      // validation error
    }
  };

  const handleItemDelete = async (id: string) => {
    const res = await fetch(`/api/v1/dict-items/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.code === 200) {
      message.success('删除成功');
      fetchData();
    }
  };

  const currentItems = dictItems.filter(i => i.typeId === activeType);
  const currentType = dictTypes.find(t => t.id === activeType);

  const typeColumns = [
    { title: '编码', dataIndex: 'code', key: 'code' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '禁用'}</Tag> },
    {
      title: '操作', key: 'action', render: (_: any, record: DictType) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openTypeModal('edit', record)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleTypeDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const itemColumns = [
    { title: '编码', dataIndex: 'code', key: 'code' },
    { title: '名称', dataIndex: 'name', key: 'name' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '启用' : '禁用'}</Tag> },
    {
      title: '操作', key: 'action', render: (_: any, record: DictItem) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openItemModal('edit', record)}>编辑</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleItemDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>数据字典</Title>
      <Card
        tabList={dictTypes.map(t => ({ key: t.id, tab: t.name }))}
        activeTabKey={activeType}
        onTabChange={setActiveType}
        tabBarExtraContent={
          <Space>
            <Button size="small" icon={<PlusOutlined />} onClick={() => openTypeModal('create')}>新增类型</Button>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => openItemModal('create')}>新增字典项</Button>
          </Space>
        }
      >
        {currentType && (
          <div style={{ marginBottom: 16 }}>
            <Tag color="blue">编码: {currentType.code}</Tag>
            <Tag>描述: {currentType.description || '-'}</Tag>
            <Tag color={currentType.status === 'active' ? 'green' : 'default'}>
              {currentType.status === 'active' ? '启用' : '禁用'}
            </Tag>
          </div>
        )}
        <Table
          dataSource={currentItems}
          rowKey="id"
          columns={itemColumns}
          loading={loading}
          pagination={false}
          size="middle"
        />
      </Card>

      <Modal
        title={typeModalMode === 'create' ? '新增字典类型' : '编辑字典类型'}
        open={typeModalVisible}
        onCancel={() => setTypeModalVisible(false)}
        onOk={handleTypeSave}
      >
        <Form form={typeForm} layout="vertical">
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input placeholder="sampleType" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="样品类型" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input placeholder="描述信息" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" defaultChecked />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={itemModalMode === 'create' ? '新增字典项' : '编辑字典项'}
        open={itemModalVisible}
        onCancel={() => setItemModalVisible(false)}
        onOk={handleItemSave}
      >
        <Form form={itemForm} layout="vertical">
          <Form.Item name="typeId" hidden><Input /></Form.Item>
          <Form.Item name="typeCode" hidden><Input /></Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}>
            <Input placeholder="surface_water" />
          </Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input placeholder="地表水" />
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="active" valuePropName="checked" getValueFromEvent={(c: boolean) => c ? 'active' : 'inactive'} getValueProps={(v: string) => ({ checked: v === 'active' })}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
