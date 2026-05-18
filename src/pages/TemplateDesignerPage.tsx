import React, { useState } from 'react';
import {
  Card, Button, Form, Input, Select, Space, Tag, Row, Col, Modal, message,
  Divider, Typography, Radio, Switch, Slider,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, CopyOutlined, EyeOutlined,
  SaveOutlined, DragOutlined, CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const fieldTypes: Record<string, string> = {
  text: '文本框', number: '数值框', select: '下拉选择',
  radio: '单选框', checkbox: '复选框', table: '数据表格',
  date: '日期选择', formula: '公式计算', attachment: '附件上传', textarea: '多行文本',
};

interface FieldDef {
  id: string; type: string; label: string; required: boolean;
  defaultValue?: any; options?: string[]; validation?: any;
  formula?: string; unit?: string; order: number;
}

interface ELNTemplate {
  id: string; name: string; category: string; version: number;
  status: 'draft' | 'published'; fields: FieldDef[];
}

const mockTemplates: ELNTemplate[] = [
  {
    id: 'tpl1', name: '水质检测原始记录', category: '环境检测', version: 1, status: 'published',
    fields: [
      { id: 'f1', type: 'text', label: '样品编号', required: true, order: 1 },
      { id: 'f2', type: 'select', label: '检测项目', required: true, options: ['pH', 'COD', '氨氮', '总磷', '总氮'], order: 2 },
      { id: 'f3', type: 'number', label: '吸光度', required: true, unit: 'AU', order: 3 },
      { id: 'f4', type: 'formula', label: '浓度', required: false, formula: '(吸光度 - 空白) * 因子 / 体积', unit: 'mg/L', order: 4 },
      { id: 'f5', type: 'table', label: '标准曲线数据', required: true, order: 5 },
      { id: 'f6', type: 'attachment', label: '原始数据文件', required: false, order: 6 },
    ],
  },
  {
    id: 'tpl2', name: '土壤重金属检测记录', category: '土壤检测', version: 2, status: 'published',
    fields: [
      { id: 'f1', type: 'text', label: '样品编号', required: true, order: 1 },
      { id: 'f2', type: 'select', label: '检测元素', required: true, options: ['Pb', 'Cd', 'Hg', 'As', 'Cr'], order: 2 },
      { id: 'f3', type: 'number', label: '峰面积', required: true, order: 3 },
      { id: 'f4', type: 'formula', label: '含量', required: false, formula: 'MEAN(峰面积) * 标准曲线斜率 + 截距', unit: 'mg/kg', order: 4 },
    ],
  },
];

export const TemplateDesignerPage: React.FC = () => {
  const [templates, setTemplates] = useState<ELNTemplate[]>(mockTemplates);
  const [editing, setEditing] = useState<ELNTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTpl, setPreviewTpl] = useState<ELNTemplate | null>(null);

  const addField = (type: string) => {
    if (!editing) return;
    const newField: FieldDef = {
      id: `f${Date.now()}`, type, label: fieldTypes[type] || '新字段',
      required: false, order: editing.fields.length + 1,
    };
    setEditing({ ...editing, fields: [...editing.fields, newField] });
  };

  const updateField = (fid: string, key: keyof FieldDef, value: any) => {
    if (!editing) return;
    setEditing({
      ...editing,
      fields: editing.fields.map(f => f.id === fid ? { ...f, [key]: value } : f),
    });
  };

  const removeField = (fid: string) => {
    if (!editing) return;
    setEditing({ ...editing, fields: editing.fields.filter(f => f.id !== fid) });
  };

  const saveTemplate = () => {
    if (!editing) return;
    if (!editing.name.trim()) { message.warning('请输入模板名称'); return; }
    setTemplates(prev => {
      const exists = prev.find(t => t.id === editing.id);
      if (exists) return prev.map(t => t.id === editing.id ? editing : t);
      return [...prev, editing];
    });
    message.success('模板已保存');
    setEditing(null);
  };

  const cloneTemplate = (tpl: ELNTemplate) => {
    const clone: ELNTemplate = {
      ...tpl, id: `tpl${Date.now()}`, name: `${tpl.name} (副本)`,
      version: tpl.version + 1, status: 'draft',
      fields: tpl.fields.map(f => ({ ...f, id: `f${Date.now()}_${f.id}` })),
    };
    setTemplates([...templates, clone]);
    message.success('模板已克隆');
  };

  return (
    <div>
      <Title level={3}><CopyOutlined /> ELN 模板设计器</Title>
      {!editing ? (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {templates.map(tpl => (
              <Col xs={24} sm={12} md={8} key={tpl.id}>
                <Card
                  title={tpl.name}
                  extra={<Tag color={tpl.status === 'published' ? 'green' : 'orange'}>{tpl.status === 'published' ? '已发布' : '草稿'}</Tag>}
                  actions={[
                    <Button type="link" icon={<EyeOutlined />} onClick={() => { setPreviewTpl(tpl); setPreviewOpen(true); }}>预览</Button>,
                    <Button type="link" icon={<CopyOutlined />} onClick={() => cloneTemplate(tpl)}>克隆</Button>,
                    <Button type="link" icon={<PlusOutlined />} onClick={() => setEditing({ ...tpl })}>编辑</Button>,
                  ]}
                >
                  <Text type="secondary">分类：{tpl.category}</Text><br />
                  <Text type="secondary">版本：v{tpl.version}</Text><br />
                  <Text type="secondary">字段数：{tpl.fields.length}</Text>
                </Card>
              </Col>
            ))}
            <Col xs={24} sm={12} md={8}>
              <Card style={{ textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px dashed #d9d9d9' }}
                onClick={() => setEditing({ id: `tpl${Date.now()}`, name: '', category: '环境检测', version: 1, status: 'draft', fields: [] })}
              >
                <PlusOutlined style={{ fontSize: 32, color: '#1677ff' }} /><br />
                <Text style={{ color: '#1677ff' }}>新建模板</Text>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card title={`编辑模板：${editing.name || '未命名'}`} extra={
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => { setPreviewTpl(editing); setPreviewOpen(true); }}>预览</Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={saveTemplate}>保存</Button>
            <Button onClick={() => setEditing(null)}>返回</Button>
          </Space>
        }>
          <Row gutter={16}>
            <Col span={12}>
              <Form layout="vertical">
                <Form.Item label="模板名称"><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></Form.Item>
                <Form.Item label="分类">
                  <Select value={editing.category} onChange={v => setEditing({ ...editing, category: v })}>
                    {['环境检测', '食品检测', '土壤检测', '大气检测', '生物检测', '其他'].map(c => <Option key={c} value={c}>{c}</Option>)}
                  </Select>
                </Form.Item>
              </Form>
            </Col>
            <Col span={12}>
              <Card size="small" title="字段工具箱">
                <Space wrap>
                  {Object.entries(fieldTypes).map(([type, label]) => (
                    <Button key={type} size="small" icon={<PlusOutlined />} onClick={() => addField(type)}>{label}</Button>
                  ))}
                </Space>
              </Card>
            </Col>
          </Row>
          <Divider />
          <Title level={5}>字段列表（{editing.fields.length}）</Title>
          {editing.fields.map((field, idx) => (
            <Card key={field.id} size="small" style={{ marginBottom: 12 }} title={
              <Space><DragOutlined />{idx + 1}. {fieldTypes[field.type]} — {field.label}</Space>
            } extra={
              <Button type="link" danger icon={<DeleteOutlined />} size="small" onClick={() => removeField(field.id)}>删除</Button>
            }>
              <Row gutter={16}>
                <Col span={8}><Form.Item label="标签"><Input value={field.label} onChange={e => updateField(field.id, 'label', e.target.value)} /></Form.Item></Col>
                <Col span={4}><Form.Item label="必填"><Switch checked={field.required} onChange={v => updateField(field.id, 'required', v)} /></Form.Item></Col>
                <Col span={6}><Form.Item label="默认值"><Input value={field.defaultValue || ''} onChange={e => updateField(field.id, 'defaultValue', e.target.value)} placeholder="选填" /></Form.Item></Col>
                <Col span={6}><Form.Item label="单位"><Input value={field.unit || ''} onChange={e => updateField(field.id, 'unit', e.target.value)} placeholder="如 mg/L" /></Form.Item></Col>
              </Row>
              {['select', 'radio', 'checkbox'].includes(field.type) && (
                <Form.Item label="选项（逗号分隔）">
                  <Input value={field.options?.join(', ') || ''} onChange={e => updateField(field.id, 'options', e.target.value.split(',').map(s => s.trim()))} placeholder="选项1, 选项2, 选项3" />
                </Form.Item>
              )}
              {field.type === 'number' && (
                <Row gutter={16}>
                  <Col span={8}><Form.Item label="最小值"><Input type="number" value={field.validation?.min || ''} onChange={e => updateField(field.id, 'validation', { ...field.validation, min: Number(e.target.value) })} /></Form.Item></Col>
                  <Col span={8}><Form.Item label="最大值"><Input type="number" value={field.validation?.max || ''} onChange={e => updateField(field.id, 'validation', { ...field.validation, max: Number(e.target.value) })} /></Form.Item></Col>
                  <Col span={8}><Form.Item label="小数位"><Slider min={0} max={6} value={field.validation?.precision || 2} onChange={v => updateField(field.id, 'validation', { ...field.validation, precision: v })} /></Form.Item></Col>
                </Row>
              )}
              {field.type === 'formula' && (
                <Form.Item label="公式表达式">
                  <Input value={field.formula || ''} onChange={e => updateField(field.id, 'formula', e.target.value)} placeholder="如: (吸光度 - 空白) * 因子 / 体积" />
                </Form.Item>
              )}
            </Card>
          ))}
        </Card>
      )}

      <Modal title="模板预览" open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} width={600}>
        {previewTpl && (
          <>
            <Title level={5}>{previewTpl.name} <Tag>v{previewTpl.version}</Tag></Title>
            <Text type="secondary">分类：{previewTpl.category} | 字段数：{previewTpl.fields.length}</Text>
            <Divider />
            {previewTpl.fields.map(f => (
              <Form.Item key={f.id} label={f.label} required={f.required}>
                {f.type === 'text' && <Input placeholder={f.label} />}
                {f.type === 'textarea' && <Input.TextArea rows={2} placeholder={f.label} />}
                {f.type === 'number' && <Input type="number" placeholder={f.label} addonAfter={f.unit} />}
                {f.type === 'select' && <Select placeholder={f.label} options={f.options?.map(o => ({ value: o, label: o }))} />}
                {f.type === 'radio' && <Radio.Group options={f.options?.map(o => ({ value: o, label: o }))} />}
                {f.type === 'date' && <Input type="date" />}
                {f.type === 'formula' && <Input disabled placeholder={`公式: ${f.formula}`} addonAfter={f.unit} />}
                {f.type === 'attachment' && <Button icon={<PlusOutlined />}>上传附件</Button>}
                {f.type === 'table' && <Text type="secondary">[数据表格]</Text>}
              </Form.Item>
            ))}
          </>
        )}
      </Modal>
    </div>
  );
};
