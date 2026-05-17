import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Button, Typography, Space, Modal, Form, Input, InputNumber, Select, Switch,
  message, Row, Col, Tag, Tabs, Empty, Tooltip, Divider,
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  AppstoreOutlined, FileTextOutlined, ExperimentOutlined, SettingOutlined,
} from '@ant-design/icons';
import type { FieldConfig, ModuleType } from '../types/dynamicForm';
import { DynamicFieldRenderer } from '../components/DynamicFieldRenderer';

const { Title, Text } = Typography;
const { Option } = Select;

const MODULES: { key: ModuleType; label: string; icon: React.ReactNode }[] = [
  { key: 'sample', label: '样品管理', icon: <ExperimentOutlined /> },
  { key: 'test', label: '检测管理', icon: <FileTextOutlined /> },
  { key: 'report', label: '报告管理', icon: <FileTextOutlined /> },
  { key: 'instrument', label: '仪器管理', icon: <SettingOutlined /> },
  { key: 'inventory', label: '库存管理', icon: <AppstoreOutlined /> },
];

const FIELD_TYPES = [
  { value: 'text', label: '文本' },
  { value: 'textarea', label: '多行文本' },
  { value: 'number', label: '数字' },
  { value: 'date', label: '日期' },
  { value: 'datetime', label: '日期时间' },
  { value: 'select', label: '下拉选择' },
  { value: 'multiSelect', label: '多选' },
  { value: 'radio', label: '单选' },
  { value: 'switch', label: '开关' },
  { value: 'upload', label: '文件上传' },
  { value: 'signature', label: '签名' },
  { value: 'reference', label: '关联查询' },
];

const api = (path: string) => `/api/v1${path}`;

export const FieldConfigEditor: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('sample');
  const [configs, setConfigs] = useState<FieldConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState<FieldConfig | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});
  const [form] = Form.useForm();

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(api(`/field-configs?module=${activeModule}`));
      const json = await res.json();
      setConfigs((json.data?.list || []).sort((a: FieldConfig, b: FieldConfig) => a.sortOrder - b.sortOrder));
    } catch {
      message.error('加载字段配置失败');
    } finally {
      setLoading(false);
    }
  }, [activeModule]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchConfigs(); }, [fetchConfigs]);

  const handleSave = async () => {
    const values = await form.validateFields();
    const body: Record<string, unknown> = { ...values, module: activeModule };
    if (editingField) body.id = editingField.id;

    try {
      const res = await fetch(editingField ? api(`/field-configs/${editingField.id}`) : api('/field-configs'), {
        method: editingField ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success(editingField ? '字段更新成功' : '字段创建成功');
        setModalOpen(false);
        setEditingField(null);
        form.resetFields();
        fetchConfigs();
      }
    } catch { message.error('操作失败'); }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除该字段？',
      content: '删除后该字段将不再显示，已保存的数据不受影响。',
      onOk: async () => {
        const res = await fetch(api(`/field-configs/${id}`), { method: 'DELETE' });
        const json = await res.json();
        if (json.code === 200) { message.success('删除成功'); fetchConfigs(); }
      },
    });
  };

  const handleEdit = (field: FieldConfig) => {
    setEditingField(field);
    form.setFieldsValue(field);
    setModalOpen(true);
  };

  const openCreate = () => {
    setEditingField(null);
    form.resetFields();
    form.setFieldsValue({ module: activeModule, sortOrder: configs.length + 1, required: false, active: true });
    setModalOpen(true);
  };

  const handleReorder = async (dragId: string, targetId: string) => {
    // Simple reorder: swap sortOrder
    const updated = [...configs];
    const dragIdx = updated.findIndex(c => c.id === dragId);
    const targetIdx = updated.findIndex(c => c.id === targetId);
    if (dragIdx < 0 || targetIdx < 0) return;
    const tempOrder = updated[dragIdx].sortOrder;
    updated[dragIdx].sortOrder = updated[targetIdx].sortOrder;
    updated[targetIdx].sortOrder = tempOrder;
    updated.sort((a, b) => a.sortOrder - b.sortOrder);
    setConfigs(updated);

    const orderedIds = updated.map(c => c.id);
    await fetch(api('/field-configs/reorder'), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module: activeModule, orderedIds }),
    });
  };

  const columns = [
    { title: '排序', dataIndex: 'sortOrder', key: 'sortOrder', width: 60 },
    { title: '字段标识', dataIndex: 'fieldKey', key: 'fieldKey', width: 140 },
    { title: '显示名称', dataIndex: 'label', key: 'label', width: 140 },
    {
      title: '类型', dataIndex: 'fieldType', key: 'fieldType', width: 100,
      render: (v: string) => <Tag>{FIELD_TYPES.find(t => t.value === v)?.label || v}</Tag>,
    },
    {
      title: '必填', dataIndex: 'required', key: 'required', width: 60,
      render: (v: boolean) => v ? <Tag color="red">是</Tag> : <Tag>否</Tag>,
    },
    {
      title: '分组', dataIndex: 'groupName', key: 'groupName', width: 100,
      render: (v: string) => v || '-',
    },
    {
      title: '条件显示', key: 'condition', width: 160,
      render: (_: string, r: FieldConfig) =>
        r.conditionRules?.map((c, i) => (
          <Tag key={i} color="blue" style={{ marginBottom: 2 }}>
            {c.field} {c.operator} {String(c.value)}
          </Tag>
        )) || '-',
    },
    {
      title: '状态', dataIndex: 'active', key: 'active', width: 60,
      render: (v: boolean) => v ? <Tag color="green">启用</Tag> : <Tag>禁用</Tag>,
    },
    {
      title: '操作', key: 'action', width: 150,
      render: (_: string, r: FieldConfig) => (
        <Space>
          <Tooltip title="编辑"><Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(r)} /></Tooltip>
          <Tooltip title="下移"><Button size="small" onClick={() => {
            const next = configs.find(c => c.sortOrder === r.sortOrder + 1);
            if (next) handleReorder(r.id, next.id);
          }}>↓</Button></Tooltip>
          <Tooltip title="上移"><Button size="small" onClick={() => {
            const prev = configs.find(c => c.sortOrder === r.sortOrder - 1);
            if (prev) handleReorder(r.id, prev.id);
          }}>↑</Button></Tooltip>
          <Tooltip title="删除"><Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)} /></Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>自定义字段配置</Title></Col>
        <Col>
          <Space>
            <Button onClick={() => { setPreviewValues({}); setPreviewOpen(true); }} icon={<EyeOutlined />}>预览表单</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>添加字段</Button>
          </Space>
        </Col>
      </Row>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        在此配置各模块的自定义字段，配置后表单将自动按设置的字段、类型和规则渲染。
      </Text>

      <Tabs
        activeKey={activeModule}
        onChange={(k) => setActiveModule(k as ModuleType)}
        items={MODULES.map(m => ({
          key: m.key,
          label: <span>{m.icon} {m.label}</span>,
          children: (
            <Card>
              <Table
                dataSource={configs}
                columns={columns}
                rowKey="id"
                loading={loading}
                pagination={false}
                size="small"
                locale={{ emptyText: <Empty description={'暂无字段配置，点击「添加字段」开始'} /> }}
              />
            </Card>
          ),
        }))}
      />

      {/* 添加/编辑字段弹窗 */}
      <Modal
        title={editingField ? '编辑字段' : '添加字段'}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); setEditingField(null); }}
        onOk={handleSave}
        width={640}
        okText="保存"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fieldKey" label="字段标识" rules={[{ required: true, message: '请输入字段标识' }]}>
                <Input placeholder="英文标识，如 codDilution" disabled={!!editingField} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="label" label="显示名称" rules={[{ required: true, message: '请输入显示名称' }]}>
                <Input placeholder="如 COD稀释倍数" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="fieldType" label="字段类型" rules={[{ required: true }]}>
                <Select placeholder="选择类型">
                  {FIELD_TYPES.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="groupName" label="所属分组">
                <Input placeholder="如 基本信息" />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="required" label="必填" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="active" label="启用" valuePropName="checked">
                <Switch defaultChecked />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sortOrder" label="排序号"><InputNumber min={1} style={{ width: '100%' }} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="placeholder" label="占位提示"><Input /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="defaultValue" label="默认值"><Input /></Form.Item>
            </Col>
          </Row>

          <Divider>校验规则</Divider>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name={['validation', 'min']} label="最小值"><InputNumber style={{ width: '100%' }} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['validation', 'max']} label="最大值"><InputNumber style={{ width: '100%' }} /></Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name={['validation', 'pattern']} label="正则校验"><Input placeholder="如 ^\\d+$" /></Form.Item>
            </Col>
          </Row>

          <Divider>下拉选项 (选择/多选/单选类型填写)</Divider>
          <Form.Item name="options">
            <Select mode="tags" placeholder="输入选项后回车添加" tokenSeparators={[',']} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览弹窗 */}
      <Modal
        title="表单预览"
        open={previewOpen}
        onCancel={() => setPreviewOpen(false)}
        footer={null}
        width={500}
      >
        <Form
          layout="vertical"
          onValuesChange={(changed) => setPreviewValues((prev: Record<string, unknown>) => ({ ...prev, ...changed }))}
        >
          <DynamicFieldRenderer
            configs={configs}
            values={previewValues}
            onChange={setPreviewValues}
          />
        </Form>
        <Divider />
        <Text type="secondary">
          提示: 选择"样品类型"后，条件显示的字段会根据所选值动态出现/隐藏。
        </Text>
      </Modal>
    </div>
  );
};
