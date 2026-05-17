import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, message, Timeline, Descriptions, Divider, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, FileTextOutlined, SignatureOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface ELNEntry {
  id: string; templateId: string; templateName: string; projectName?: string;
  title: string; authorName: string; fields: any[]; content: string;
  signatures: any[]; version: number; status: string;
  createdAt: string; updatedAt: string;
}

interface ELNTemplate { id: string; name: string; category: string; fields: any[]; }

export const ELNPage: React.FC = () => {
  const [entries, setEntries] = useState<ELNEntry[]>([]);
  const [templates, setTemplates] = useState<ELNTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<ELNEntry | null>(null);
  const [form] = Form.useForm();
  const [selectedTemplate, setSelectedTemplate] = useState<ELNTemplate | null>(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/v1/research/eln-entries').then(r => r.json()),
      fetch('/api/v1/eln/templates').then(r => r.json()),
    ]).then(([entriesRes, templatesRes]) => {
      if (entriesRes.code === 200) setEntries(entriesRes.data.list);
      if (templatesRes.code === 200) setTemplates(templatesRes.data.list);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id: string) => {
    fetch(`/api/v1/research/eln-entries/${id}`, { method: 'DELETE' }).then(() => { message.success('删除成功'); fetchData(); });
  };

  const handleSign = async (entry: ELNEntry) => {
    const res = await fetch(`/api/v1/research/eln-entries/${entry.id}/sign`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'author', userId: '3', userName: '李思' }),
    });
    const data = await res.json();
    if (data.code === 200) { message.success('签名成功'); fetchData(); }
  };

  const handleSubmit = async (values: any) => {
    const tpl = templates.find(t => t.id === values.templateId);
    const payload = { ...values, templateName: tpl?.name || '', fields: tpl?.fields.map((f: any) => ({ ...f, value: values[`field_${f.id}`] || '' })) || [] };
    tpl?.fields.forEach((f: any) => delete payload[`field_${f.id}`]);
    const res = await fetch('/api/v1/research/eln-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.code === 200) { message.success('创建成功'); setModalOpen(false); form.resetFields(); fetchData(); }
  };

  const statusColors: Record<string, string> = { draft: 'default', submitted: 'blue', signed: 'green', witnessed: 'purple' };
  const statusLabels: Record<string, string> = { draft: '草稿', submitted: '已提交', signed: '已签名', witnessed: '已见证' };

  const columns = [
    { title: '标题', dataIndex: 'title', render: (v: string, r: ELNEntry) => <Button type="link" onClick={() => { setSelectedEntry(r); setDetailOpen(true); }}>{v}</Button> },
    { title: '模板', dataIndex: 'templateName', width: 140 },
    { title: '作者', dataIndex: 'authorName', width: 100 },
    { title: '版本', dataIndex: 'version', width: 70 },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 160 },
    { title: '操作', width: 200, render: (_: any, r: ELNEntry) => (
      <Space>
        <Button size="small" icon={<EyeOutlined />} onClick={() => { setSelectedEntry(r); setDetailOpen(true); }}>查看</Button>
        {r.status === 'draft' && <Button size="small" icon={<SignatureOutlined />} onClick={() => handleSign(r)}>签名</Button>}
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)}>删除</Button>
      </Space>
    )},
  ];

  return (
    <div>
      <Card title={<Space><FileTextOutlined />电子实验记录本 (ELN)</Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedTemplate(null); form.resetFields(); setModalOpen(true); }}>新建记录</Button>}>
        <Table dataSource={entries} rowKey="id" columns={columns} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title="新建实验记录" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose width={700}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="templateId" label="选择模板" rules={[{ required: true }]}>
            <Select placeholder="选择模板" onChange={(v) => setSelectedTemplate(templates.find(t => t.id === v) || null)}>
              {templates.map(t => <Option key={t.id} value={t.id}>{t.name} ({t.category})</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="title" label="记录标题" rules={[{ required: true }]} > <Input placeholder="输入标题" /> </Form.Item>
          <Form.Item name="projectName" label="关联项目"> <Input placeholder="可选" /> </Form.Item>
          <Form.Item name="authorName" label="实验人" rules={[{ required: true }]} initialValue="李思"> <Input /> </Form.Item>
          {selectedTemplate?.fields.map((f: any) => (
            <Form.Item key={f.id} name={`field_${f.id}`} label={f.label} rules={[{ required: f.required }]}>
              {f.type === 'select' ? (
                <Select placeholder={`选择${f.label}`}>{f.options?.map((o: string) => <Option key={o} value={o}>{o}</Option>)}</Select>
              ) : f.type === 'table' ? (
                <TextArea rows={3} placeholder={`输入${f.label}，每行一个数据`} />
              ) : (
                <Input placeholder={`输入${f.label}`} />
              )}
            </Form.Item>
          ))}
          <Form.Item name="content" label="补充说明"> <TextArea rows={3} placeholder="其他需要记录的内容" /> </Form.Item>
        </Form>
      </Modal>
      <Modal title="记录详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={700}>
        {selectedEntry && (
          <div>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="标题" span={2}>{selectedEntry.title}</Descriptions.Item>
              <Descriptions.Item label="模板">{selectedEntry.templateName}</Descriptions.Item>
              <Descriptions.Item label="作者">{selectedEntry.authorName}</Descriptions.Item>
              <Descriptions.Item label="关联项目">{selectedEntry.projectName || '-'}</Descriptions.Item>
              <Descriptions.Item label="版本">{selectedEntry.version}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusColors[selectedEntry.status]}>{statusLabels[selectedEntry.status]}</Tag></Descriptions.Item>
              <Descriptions.Item label="创建时间">{selectedEntry.createdAt}</Descriptions.Item>
              <Descriptions.Item label="更新时间">{selectedEntry.updatedAt}</Descriptions.Item>
            </Descriptions>
            <Divider>结构化数据</Divider>
            {selectedEntry.fields?.map((f: any) => (
              <Row key={f.id} style={{ marginBottom: 8 }}>
                <Col span={6} style={{ fontWeight: 500 }}>{f.label}:</Col>
                <Col span={18}>{Array.isArray(f.value) ? JSON.stringify(f.value) : f.value || '-'}</Col>
              </Row>
            ))}
            {selectedEntry.content && <><Divider>补充说明</Divider><div dangerouslySetInnerHTML={{ __html: selectedEntry.content }} /></>}
            <Divider>签名记录</Divider>
            <Timeline>
              {selectedEntry.signatures?.length ? selectedEntry.signatures.map((s: any, i: number) => (
                <Timeline.Item key={i}><strong>{s.role === 'author' ? '实验人签名' : '见证人签名'}</strong>: {s.userName} ({s.signedAt})</Timeline.Item>
              )) : <Timeline.Item>暂无签名</Timeline.Item>}
            </Timeline>
          </div>
        )}
      </Modal>
    </div>
  );
};
