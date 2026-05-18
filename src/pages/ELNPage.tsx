import React, { useState, useEffect } from 'react';
import {
  Card, Button, Table, Tag, Space, Modal, Form, Input, Select, message,
  Timeline, Descriptions, Divider, Row, Col, Statistic, Tabs, Upload,
  List, Typography, Empty,
} from 'antd';
import {
  PlusOutlined, EyeOutlined, FileTextOutlined,
  SignatureOutlined, LockOutlined, CommentOutlined, HistoryOutlined,
  FilePdfOutlined, UploadOutlined, InboxOutlined, BookOutlined,
} from '@ant-design/icons';
const { TextArea } = Input;
const { Title, Text } = Typography;

interface ELNEntry {
  id: string; templateId: string; templateName: string; projectName?: string;
  title: string; authorName: string; authorId: string; fields: any[];
  content: string; signatures: ELNSignature[]; annotations: ELNAnnotation[];
  version: number; status: 'draft' | 'submitted' | 'signed' | 'witnessed' | 'locked';
  statusLabel: string; attachments: Attachment[]; auditTrail: AuditEntry[];
  versions: VersionEntry[]; createdAt: string; updatedAt: string;
}

interface ELNSignature { role: string; userName: string; signedAt: string; meaning: string; }
interface ELNAnnotation {
  id: string; fieldId?: string; authorName: string; content: string;
  createdAt: string; resolvedAt?: string; replies: AnnotationReply[];
}
interface AnnotationReply { authorName: string; content: string; createdAt: string; }
interface Attachment { id: string; name: string; size: string; url: string; }
interface AuditEntry { action: string; userName: string; timestamp: string; fieldId?: string; oldValue?: any; newValue?: any; reason?: string; }
interface VersionEntry { version: number; updatedAt: string; updatedBy: string; changes: string; }
interface ELNTemplate { id: string; name: string; category: string; fields: any[]; }

const statusColor: Record<string, string> = {
  draft: 'default', submitted: 'blue', signed: 'cyan', witnessed: 'green', locked: 'purple',
};
const statusLabelMap: Record<string, string> = {
  draft: '草稿', submitted: '已提交', signed: '已签名', witnessed: '已见证', locked: '已锁定',
};

const mockEntries: ELNEntry[] = [
  {
    id: 'eln1', templateId: 'tpl1', templateName: '水质检测原始记录', projectName: '水体污染物迁移转化机制研究',
    title: '2026-05-15 水质COD检测', authorName: '张三', authorId: 'r1', version: 3,
    status: 'witnessed', statusLabel: '已见证',
    fields: [
      { fieldId: 'f1', label: '样品编号', value: 'SMP20250601001' },
      { fieldId: 'f2', label: '检测项目', value: 'COD' },
      { fieldId: 'f3', label: '吸光度', value: 0.512, unit: 'AU' },
      { fieldId: 'f4', label: '浓度', value: 25.6, unit: 'mg/L', computed: true },
    ],
    content: '标准曲线：y = 0.0198x + 0.0032, R²=0.9998',
    signatures: [
      { role: 'author', userName: '张三', signedAt: '2026-05-15T10:00:00Z', meaning: '我已审核本记录内容真实准确' },
      { role: 'witness', userName: '王教授', signedAt: '2026-05-16T09:30:00Z', meaning: '我已见证本记录内容真实有效' },
    ],
    annotations: [
      {
        id: 'a1', fieldId: 'f3', authorName: '王教授', content: '吸光度偏大，请检查空白值是否正确',
        createdAt: '2026-05-15T14:00:00Z',
        replies: [
          { authorName: '张三', content: '已重测空白，吸光度0.003，已修正', createdAt: '2026-05-15T16:00:00Z' },
        ],
      },
    ],
    attachments: [
      { id: 'att1', name: 'COD_raw_20250615.txt', size: '12KB', url: '#' },
      { id: 'att2', name: '标准曲线图.png', size: '156KB', url: '#' },
    ],
    auditTrail: [
      { action: 'create', userName: '张三', timestamp: '2026-05-15T09:00:00Z' },
      { action: 'update', userName: '张三', timestamp: '2026-05-15T10:00:00Z', fieldId: 'f3', oldValue: 0.508, newValue: 0.512, reason: '重新测量' },
      { action: 'lock', userName: '张三', timestamp: '2026-05-15T10:00:00Z' },
      { action: 'witness', userName: '王教授', timestamp: '2026-05-16T09:30:00Z' },
    ],
    versions: [
      { version: 1, updatedAt: '2026-05-15T09:00:00Z', updatedBy: '张三', changes: '创建记录' },
      { version: 2, updatedAt: '2026-05-15T10:00:00Z', updatedBy: '张三', changes: '修正吸光度' },
      { version: 3, updatedAt: '2026-05-16T09:30:00Z', updatedBy: '王教授', changes: '见证签名' },
    ],
    createdAt: '2026-05-15T09:00:00Z', updatedAt: '2026-05-16T09:30:00Z',
  },
  {
    id: 'eln2', templateId: 'tpl2', templateName: '土壤重金属检测记录', projectName: '土壤修复技术开发',
    title: '2026-05-10 土壤Pb检测', authorName: '李四', authorId: 'r2', version: 1,
    status: 'signed', statusLabel: '已签名',
    fields: [
      { fieldId: 'f1', label: '样品编号', value: 'SMP20250601005' },
      { fieldId: 'f2', label: '检测元素', value: 'Pb' },
      { fieldId: 'f3', label: '峰面积', value: 15234 },
      { fieldId: 'f4', label: '含量', value: 45.2, unit: 'mg/kg', computed: true },
    ],
    content: '',
    signatures: [
      { role: 'author', userName: '李四', signedAt: '2026-05-10T16:00:00Z', meaning: '我已审核本记录内容真实准确' },
    ],
    annotations: [],
    attachments: [{ id: 'att3', name: 'Pb_spectrum.raw', size: '2.1MB', url: '#' }],
    auditTrail: [
      { action: 'create', userName: '李四', timestamp: '2026-05-10T14:00:00Z' },
      { action: 'lock', userName: '李四', timestamp: '2026-05-10T16:00:00Z' },
    ],
    versions: [
      { version: 1, updatedAt: '2026-05-10T16:00:00Z', updatedBy: '李四', changes: '创建并签名' },
    ],
    createdAt: '2026-05-10T14:00:00Z', updatedAt: '2026-05-10T16:00:00Z',
  },
  {
    id: 'eln3', templateId: 'tpl1', templateName: '水质检测原始记录',
    title: '2026-05-17 水质pH检测', authorName: '张三', authorId: 'r1', version: 1,
    status: 'draft', statusLabel: '草稿',
    fields: [
      { fieldId: 'f1', label: '样品编号', value: 'SMP20250601012' },
      { fieldId: 'f2', label: '检测项目', value: 'pH' },
      { fieldId: 'f3', label: 'pH值', value: 7.2 },
    ],
    content: '温度25°C，电极校准正常',
    signatures: [], annotations: [], attachments: [],
    auditTrail: [{ action: 'create', userName: '张三', timestamp: '2026-05-17T08:00:00Z' }],
    versions: [{ version: 1, updatedAt: '2026-05-17T08:00:00Z', updatedBy: '张三', changes: '创建草稿' }],
    createdAt: '2026-05-17T08:00:00Z', updatedAt: '2026-05-17T08:00:00Z',
  },
];

export const ELNPage: React.FC = () => {
  const [entries, setEntries] = useState<ELNEntry[]>(mockEntries);
  const [templates, setTemplates] = useState<ELNTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ELNEntry | null>(null);
  const [form] = Form.useForm();
  const [newAnnotation, setNewAnnotation] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState('content');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/v1/research/eln-entries').then(r => r.json()),
      fetch('/api/v1/eln/templates').then(r => r.json()),
    ]).then(([entriesRes, tplRes]) => {
      if (entriesRes.data?.list) setEntries(entriesRes.data.list);
      if (tplRes.data?.list) setTemplates(tplRes.data.list);
    }).catch(() => {
      // use mock data
    }).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: entries.length,
    draft: entries.filter(e => e.status === 'draft').length,
    signed: entries.filter(e => e.status === 'signed').length,
    witnessed: entries.filter(e => e.status === 'witnessed').length,
    locked: entries.filter(e => e.status === 'locked').length,
  };

  const handleCreate = () => {
    form.validateFields().then(values => {
      const tpl = templates.find(t => t.id === values.templateId);
      const entry: ELNEntry = {
        id: `eln${Date.now()}`,
        templateId: values.templateId,
        templateName: tpl?.name || '',
        projectName: values.projectName,
        title: values.title,
        authorName: '当前用户', authorId: 'me',
        fields: [], content: values.content || '',
        signatures: [], annotations: [], attachments: [],
        auditTrail: [{ action: 'create', userName: '当前用户', timestamp: new Date().toISOString() }],
        versions: [{ version: 1, updatedAt: new Date().toISOString(), updatedBy: '当前用户', changes: '创建记录' }],
        status: 'draft', statusLabel: '草稿', version: 1,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      setEntries([entry, ...entries]);
      message.success('实验记录已创建');
      setModalOpen(false);
      form.resetFields();
    });
  };

  const handleLock = (entry: ELNEntry) => {
    setEntries(prev => prev.map(e => e.id === entry.id ? {
      ...e, status: 'signed', statusLabel: '已签名',
      signatures: [...e.signatures, { role: 'author', userName: '当前用户', signedAt: new Date().toISOString(), meaning: '我已审核本记录内容真实准确' }],
      auditTrail: [...e.auditTrail, { action: 'lock', userName: '当前用户', timestamp: new Date().toISOString() }],
    } : e));
    message.success('记录已签名锁定');
  };

  const handleWitness = (entry: ELNEntry) => {
    setEntries(prev => prev.map(e => e.id === entry.id ? {
      ...e, status: 'witnessed', statusLabel: '已见证',
      signatures: [...e.signatures, { role: 'witness', userName: '当前用户', signedAt: new Date().toISOString(), meaning: '我已见证本记录内容真实有效' }],
      auditTrail: [...e.auditTrail, { action: 'witness', userName: '当前用户', timestamp: new Date().toISOString() }],
    } : e));
    message.success('记录已见证');
  };

  const handleAddAnnotation = () => {
    if (!selectedEntry || !newAnnotation.trim()) return;
    const annotation: ELNAnnotation = {
      id: `a${Date.now()}`, authorName: '当前用户',
      content: newAnnotation, createdAt: new Date().toISOString(), replies: [],
    };
    setEntries(prev => prev.map(e => e.id === selectedEntry.id ? {
      ...e, annotations: [...e.annotations, annotation],
    } : e));
    setSelectedEntry(prev => prev ? { ...prev, annotations: [...prev.annotations, annotation] } : null);
    setNewAnnotation('');
    message.success('批注已添加');
  };

  const handleExportPDF = () => {
    message.success({ content: 'PDF 导出中...（模拟）', duration: 3 });
  };

  const columns = [
    { title: '记录标题', dataIndex: 'title', ellipsis: true },
    { title: '模板', dataIndex: 'templateName', width: 160 },
    { title: '作者', dataIndex: 'authorName', width: 100 },
    { title: '版本', dataIndex: 'version', width: 60 },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => <Tag color={statusColor[s]}>{statusLabelMap[s]}</Tag> },
    { title: '日期', dataIndex: 'createdAt', width: 160, render: (v: string) => v.slice(0, 10) },
    {
      title: '操作', width: 220, render: (_: any, r: ELNEntry) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedEntry(r); setDetailOpen(true); }}>详情</Button>
          {r.status === 'draft' && <Button type="link" size="small" icon={<LockOutlined />} onClick={() => handleLock(r)}>签名</Button>}
          {r.status === 'signed' && <Button type="link" size="small" icon={<SignatureOutlined />} onClick={() => handleWitness(r)}>见证</Button>}
          <Button type="link" size="small" icon={<FilePdfOutlined />} onClick={handleExportPDF}>导出</Button>
        </Space>
      ),
    },
  ];

  const detailTabItems = selectedEntry ? [
    {
      key: 'content',
      label: <span><FileTextOutlined /> 记录内容</span>,
      children: (
        <>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="记录编号" span={2}>{selectedEntry.id}</Descriptions.Item>
            <Descriptions.Item label="模板">{selectedEntry.templateName}</Descriptions.Item>
            <Descriptions.Item label="作者">{selectedEntry.authorName}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusColor[selectedEntry.status]}>{selectedEntry.statusLabel}</Tag></Descriptions.Item>
            <Descriptions.Item label="版本">v{selectedEntry.version}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedEntry.createdAt}</Descriptions.Item>
          </Descriptions>
          <Divider />
          <Title level={5}>结构化数据</Title>
          {selectedEntry.fields.map((f: any) => (
            <Row key={f.fieldId} style={{ marginBottom: 8 }}>
              <Col span={8}><Text strong>{f.label}</Text></Col>
              <Col span={16}>
                <Text>{f.value} {f.unit}</Text>
                {f.computed && <Tag color="blue" style={{ marginLeft: 8 }}>自动计算</Tag>}
              </Col>
            </Row>
          ))}
          {selectedEntry.content && (
            <>
              <Divider />
              <Title level={5}>补充说明</Title>
              <Text>{selectedEntry.content}</Text>
            </>
          )}
          <Divider />
          <Title level={5}>附件 ({selectedEntry.attachments.length})</Title>
          {selectedEntry.attachments.length === 0 ? <Empty description="暂无附件" image={Empty.PRESENTED_IMAGE_SIMPLE} /> : (
            <List size="small" dataSource={selectedEntry.attachments} renderItem={item => (
              <List.Item actions={[<Button type="link" size="small">下载</Button>]}>
                <List.Item.Meta title={item.name} description={item.size} />
              </List.Item>
            )} />
          )}
          <Upload style={{ marginTop: 12 }}><Button icon={<UploadOutlined />}>上传附件</Button></Upload>
        </>
      ),
    },
    {
      key: 'annotations',
      label: <span><CommentOutlined /> 批注协作 ({selectedEntry.annotations.length})</span>,
      children: (
        <>
          {selectedEntry.annotations.length === 0 ? <Empty description="暂无批注" /> : (
            <Timeline items={selectedEntry.annotations.map(a => ({
              color: a.resolvedAt ? 'green' : 'blue',
              children: (
                <div>
                  <Text strong>{a.authorName}</Text> <Text type="secondary" style={{ fontSize: 12 }}>{a.createdAt}</Text>
                  <p>{a.content}</p>
                  {a.replies.map((reply, idx) => (
                    <div key={idx} style={{ marginLeft: 24, padding: 8, background: '#f6f8fa', borderRadius: 8 }}>
                      <Text strong style={{ fontSize: 13 }}>{reply.authorName}</Text>
                      <p style={{ margin: 0 }}>{reply.content}</p>
                    </div>
                  ))}
                </div>
              ),
            }))} />
          )}
          <Divider />
          <TextArea rows={2} placeholder="添加批注..." value={newAnnotation} onChange={e => setNewAnnotation(e.target.value)} />
          <Button type="primary" style={{ marginTop: 8 }} onClick={handleAddAnnotation}>添加批注</Button>
        </>
      ),
    },
    {
      key: 'audit',
      label: <span><HistoryOutlined /> 审计追踪 ({selectedEntry.auditTrail.length})</span>,
      children: (
        <Timeline items={selectedEntry.auditTrail.map(a => ({
          color: a.action === 'create' ? 'blue' : a.action === 'update' ? 'orange' : a.action === 'lock' ? 'cyan' : 'green',
          children: (
            <div>
              <Text strong>{a.action === 'create' ? '创建' : a.action === 'update' ? '修改' : a.action === 'lock' ? '签名锁定' : a.action === 'witness' ? '见证' : a.action}</Text>
              <br /><Text type="secondary">{a.userName} · {a.timestamp}</Text>
              {a.fieldId && (
                <div style={{ marginTop: 4, padding: 8, background: '#f6f8fa', borderRadius: 4 }}>
                  <Text style={{ fontSize: 12 }}>字段：{a.fieldId}</Text><br />
                  <Text delete style={{ fontSize: 12 }}>{String(a.oldValue)}</Text> → <Text style={{ fontSize: 12 }}>{String(a.newValue)}</Text><br />
                  {a.reason && <Text type="secondary" style={{ fontSize: 12 }}>原因：{a.reason}</Text>}
                </div>
              )}
            </div>
          ),
        }))} />
      ),
    },
    {
      key: 'versions',
      label: <span><FileTextOutlined /> 版本历史 ({selectedEntry.versions.length})</span>,
      children: (
        <Timeline items={selectedEntry.versions.map(v => ({
          color: v.version === selectedEntry.version ? 'green' : 'blue',
          children: (
            <div>
              <Text strong>v{v.version}</Text> <Text type="secondary" style={{ fontSize: 12 }}>{v.updatedBy} · {v.updatedAt}</Text>
              <p>{v.changes}</p>
            </div>
          ),
        }))} />
      ),
    },
    {
      key: 'signatures',
      label: <span><SignatureOutlined /> 签名信息 ({selectedEntry.signatures.length})</span>,
      children: (
        <>
          {selectedEntry.signatures.length === 0 ? <Empty description="未签名" /> : (
            <Descriptions column={1} bordered size="small">
              {selectedEntry.signatures.map((s, i) => (
                <Descriptions.Item key={i} label={s.role === 'author' ? '作者签名' : '见证签名'}>
                  <Text strong>{s.userName}</Text><br />
                  <Text type="secondary">{s.signedAt}</Text><br />
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.meaning}</Text>
                </Descriptions.Item>
              ))}
            </Descriptions>
          )}
        </>
      ),
    },
  ] : [];

  return (
    <div>
      <Title level={3}><BookOutlined /> 电子实验记录 (ELN) v2.0</Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8} md={4}><Card><Statistic title="总记录" value={stats.total} prefix={<InboxOutlined />} /></Card></Col>
        <Col xs={12} sm={8} md={4}><Card><Statistic title="草稿" value={stats.draft} valueStyle={{ color: '#999' }} /></Card></Col>
        <Col xs={12} sm={8} md={4}><Card><Statistic title="已签名" value={stats.signed} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={12} sm={8} md={4}><Card><Statistic title="已见证" value={stats.witnessed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={12} sm={8} md={4}><Card><Statistic title="已锁定" value={stats.locked} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col xs={12} sm={8} md={4}><Card><Button type="primary" icon={<PlusOutlined />} block onClick={() => setModalOpen(true)}>新建记录</Button></Card></Col>
      </Row>

      <Card>
        <Table dataSource={entries} rowKey="id" columns={columns} loading={loading} pagination={false} size="middle" />
      </Card>

      <Modal title="新建实验记录" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={handleCreate} width={560}>
        <Form form={form} layout="vertical">
          <Form.Item name="templateId" label="选择模板" rules={[{ required: true }]}>
            <Select placeholder="选择实验记录模板" options={templates.map(t => ({ value: t.id, label: t.name }))} />
          </Form.Item>
          <Form.Item name="title" label="记录标题" rules={[{ required: true }]}><Input placeholder="如：2026-05-15 水质COD检测" /></Form.Item>
          <Form.Item name="projectName" label="关联项目"><Input placeholder="选填" /></Form.Item>
          <Form.Item name="content" label="实验内容"><TextArea rows={4} placeholder="记录实验方法、条件、现象等" /></Form.Item>
        </Form>
      </Modal>

      <Modal title={selectedEntry?.title} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={720}>
        {selectedEntry && (
          <Tabs activeKey={activeDetailTab} onChange={setActiveDetailTab} items={detailTabItems} />
        )}
      </Modal>
    </div>
  );
};
