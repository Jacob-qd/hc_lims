import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Drawer, Descriptions, Tabs, Modal, Form, message, Timeline, Progress, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, CopyOutlined, FileTextOutlined, CheckCircleOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const statusColors: Record<string, string> = { active: '#52c41a', revision: '#faad14', archived: '#d9d9d9', draft: '#1677ff' };
const statusLabels: Record<string, string> = { active: '生效', revision: '修订中', archived: '已归档', draft: '草稿' };

interface ValidationItem {
  id: string; methodId: string; item: string; status: 'passed' | 'testing' | 'pending';
}

interface MethodVersion {
  id: string; methodId: string; version: string; effectiveDate: string; note: string;
}

interface MethodSop {
  id: string; methodId: string; content: string; updatedAt: string;
}

export const MethodsPage: React.FC = () => {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [copyModal, setCopyModal] = useState(false);
  const [sopModal, setSopModal] = useState(false);
  const [releaseModal, setReleaseModal] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [copyForm] = Form.useForm();
  const [sopForm] = Form.useForm();
  const [releaseForm] = Form.useForm();

  const [validations, setValidations] = useState<ValidationItem[]>([
    { id:'v1', methodId:'mtd1', item:'准确度', status:'passed' },
    { id:'v2', methodId:'mtd1', item:'精密度', status:'passed' },
    { id:'v3', methodId:'mtd1', item:'线性范围', status:'passed' },
    { id:'v4', methodId:'mtd1', item:'检出限', status:'passed' },
    { id:'v5', methodId:'mtd1', item:'定量限', status:'testing' },
    { id:'v6', methodId:'mtd1', item:'回收率', status:'pending' },
  ]);

  const [versions, setVersions] = useState<MethodVersion[]>([
    { id:'ver1', methodId:'mtd1', version:'v2.1', effectiveDate:'2024-01-15', note:'修订检出限' },
    { id:'ver2', methodId:'mtd1', version:'v2.0', effectiveDate:'2023-06-01', note:'更新仪器参数' },
    { id:'ver3', methodId:'mtd1', version:'v1.0', effectiveDate:'2023-01-01', note:'初版发布' },
  ]);

  const [sops, setSops] = useState<MethodSop[]>([
    { id:'s1', methodId:'mtd1', content:'1. 样品采集与保存...\n2. 样品前处理...\n3. 仪器条件设置...\n4. 标准曲线绘制...\n5. 样品测定...\n6. 结果计算与报告...', updatedAt:'2024-01-15' },
    { id:'s2', methodId:'mtd2', content:'1. 样品采集...\n2. 显色反应...\n3. 分光光度测定...\n4. 结果计算...', updatedAt:'2023-06-01' },
  ]);

  const fetchMethods = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/methods').then(r => r.json());
    setMethods(res.data.list); setLoading(false);
  };
  useEffect(() => { fetchMethods(); }, []);

  const filtered = methods.filter((m: any) => m.name.includes(search) || m.code.includes(search) || m.analyte.includes(search));
  const stats = { active: methods.filter((m: any) => m.status === 'active').length, revision: methods.filter((m: any) => m.status === 'revision').length, archived: methods.filter((m: any) => m.status === 'archived').length };

  const handleCreate = async (values: any) => {
    const payload = { ...values, status: values.status || 'draft' };
    const res = await fetch('/api/v1/methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.code === 200) {
      message.success('方法创建成功');
      setCreateModal(false);
      form.resetFields();
      fetchMethods();
    }
  };

  const handleUpdate = async (values: any) => {
    if (!selected) return;
    const res = await fetch(`/api/v1/methods/${selected.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const data = await res.json();
    if (data.code === 200) {
      message.success('方法已更新');
      setEditModal(false);
      editForm.resetFields();
      setSelected(null);
      fetchMethods();
    }
  };

  const handleCopy = async (values: any) => {
    if (!selected) return;
    const payload = {
      code: values.newCode,
      name: values.newName,
      analyte: selected.analyte,
      matrix: selected.matrix,
      instrument: selected.instrument,
      detectionLimit: selected.detectionLimit,
      version: 'v1.0',
      status: 'draft',
      effectiveDate: new Date().toISOString().split('T')[0],
      responsible: selected.responsible || '当前用户',
    };
    const res = await fetch('/api/v1/methods', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.code === 200) {
      message.success(`方法 ${selected.code} 已复制为 ${values.newCode}`);
      setCopyModal(false);
      copyForm.resetFields();
      fetchMethods();
    }
  };

  const handleRelease = () => {
    if (!selected) return;
    const values = releaseForm.getFieldsValue();
    const newVersion: MethodVersion = {
      id: `ver-${Date.now()}`,
      methodId: selected.id,
      version: values.version,
      effectiveDate: values.effectiveDate,
      note: values.note,
    };
    setVersions([newVersion, ...versions]);
    // Update method status to active via API
    fetch(`/api/v1/methods/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active', version: values.version, effectiveDate: values.effectiveDate }),
    }).then(() => {
      message.success(`版本 ${values.version} 已发布`);
      setReleaseModal(false);
      releaseForm.resetFields();
      setSelected(null);
      fetchMethods();
    });
  };

  const handleSaveSop = () => {
    if (!selected) return;
    const values = sopForm.getFieldsValue();
    const existing = sops.find(s => s.methodId === selected.id);
    if (existing) {
      setSops(sops.map(s => s.id === existing.id ? { ...s, content: values.content, updatedAt: new Date().toISOString().split('T')[0] } : s));
    } else {
      setSops([...sops, { id: `s-${Date.now()}`, methodId: selected.id, content: values.content, updatedAt: new Date().toISOString().split('T')[0] }]);
    }
    message.success('SOP已保存');
    setSopModal(false);
  };

  const handleToggleValidation = (valId: string) => {
    setValidations(validations.map(v => {
      if (v.id !== valId) return v;
      const next = v.status === 'passed' ? 'testing' : v.status === 'testing' ? 'pending' : 'passed';
      return { ...v, status: next };
    }));
  };

  const handleDeleteMethod = async (id: string) => {
    await fetch(`/api/v1/methods/${id}`, { method: 'DELETE' });
    message.success('方法已删除');
    fetchMethods();
  };

  const currentValidations = selected ? validations.filter(v => v.methodId === selected.id) : [];
  const currentVersions = selected ? versions.filter(v => v.methodId === selected.id) : [];
  const currentSop = selected ? sops.find(s => s.methodId === selected.id) : null;

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}><Col><Title level={4}>方法管理</Title></Col>
        <Col><Space>
          <Button icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>新建方法</Button>
        </Space></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="生效方法" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="修订中" value={stats.revision} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="归档版本" value={stats.archived} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="验证任务" value={validations.filter(v => v.status !== 'passed').length} valueStyle={{ color: '#1677ff' }} /></Card></Col>
      </Row>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索方法名称/编号/分析项目" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
          <Select placeholder="状态" style={{ width: 120 }} allowClear>
            {Object.entries(statusColors).map(([k, v]) => <Select.Option key={k} value={k}><Tag color={v}>{statusLabels[k]}</Tag></Select.Option>)}
          </Select>
        </Space>
        <Table dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
          { title: '方法编号', dataIndex: 'code', render: (c: string) => <Text code>{c}</Text> },
          { title: '方法名称', dataIndex: 'name', render: (n: string, r: any) => <a onClick={() => { setSelected(r); setDrawer(true); }}>{n}</a> },
          { title: '分析项目', dataIndex: 'analyte' },
          { title: '版本', dataIndex: 'version' },
          { title: '样品基质', dataIndex: 'matrix' },
          { title: '适用仪器', dataIndex: 'instrument' },
          { title: '检出限', dataIndex: 'detectionLimit' },
          { title: '生效日期', dataIndex: 'effectiveDate' },
          { title: '负责人', dataIndex: 'responsible' },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s] || s}</Tag> },
          { title: '操作', width: 220, render: (_: any, r: any) => <Space>
            <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawer(true); }}>详情</Button>
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelected(r); editForm.setFieldsValue({...r}); setEditModal(true); }}>编辑</Button>
            <Button type="link" size="small" icon={<CopyOutlined />} onClick={() => { setSelected(r); copyForm.setFieldsValue({ newCode: `${r.code}-COPY`, newName: `${r.name}(复制)` }); setCopyModal(true); }}>复制</Button>
            <Popconfirm title="确认删除?" onConfirm={() => handleDeleteMethod(r.id)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
          </Space> },
        ]} size="middle" />
      </Card>

      <Drawer title={`${selected?.code} ${selected?.name}`} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={560}>
        {selected && (<>
          <Space style={{ marginBottom: 12 }}>
            <Button size="small" type="primary" icon={<FileTextOutlined />} onClick={() => { sopForm.setFieldsValue({ content: currentSop?.content || '' }); setSopModal(true); }}>编辑SOP</Button>
            <Button size="small" icon={<CheckCircleOutlined />} onClick={() => { releaseForm.setFieldsValue({ version: `v${Number((selected.version||'v1.0').replace('v','')) + 0.1}.0`, effectiveDate: new Date().toISOString().split('T')[0] }); setReleaseModal(true); }}>版本发布</Button>
            <Button size="small" icon={<EditOutlined />} onClick={() => { editForm.setFieldsValue({...selected}); setEditModal(true); }}>编辑方法</Button>
          </Space>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="方法编号" span={2}>{selected.code}</Descriptions.Item>
            <Descriptions.Item label="名称" span={2}>{selected.name}</Descriptions.Item>
            <Descriptions.Item label="版本">{selected.version}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusColors[selected.status]}>{selected.statusLabel}</Tag></Descriptions.Item>
            <Descriptions.Item label="分析项目">{selected.analyte}</Descriptions.Item>
            <Descriptions.Item label="样品基质">{selected.matrix}</Descriptions.Item>
            <Descriptions.Item label="适用仪器">{selected.instrument}</Descriptions.Item>
            <Descriptions.Item label="检出限">{selected.detectionLimit}</Descriptions.Item>
            <Descriptions.Item label="生效日期">{selected.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="负责人">{selected.responsible}</Descriptions.Item>
          </Descriptions>
          <Tabs style={{ marginTop: 16 }} items={[
            { key: 'sop', label: 'SOP文档', children: (
              <Card size="small">
                {currentSop ? (
                  <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.8 }}>{currentSop.content}</div>
                ) : (
                  <Text type="secondary">暂无SOP文档，请点击「编辑SOP」创建</Text>
                )}
              </Card>
            )},
            { key: 'versions', label: '版本历史', children: (
              <Timeline items={[
                ...currentVersions.map(v => ({ color: 'green', children: <><Text strong>{v.version}</Text><br />{v.effectiveDate} {v.note}</> })),
                { color: 'blue', children: <><Text strong>v1.0 初版</Text><br />创建</> },
              ]} />
            )},
            { key: 'validation', label: '验证记录', children: (
              <div>
                <Progress type="circle" percent={Math.round(currentValidations.filter(v => v.status === 'passed').length / Math.max(currentValidations.length, 1) * 100)} size={80} /><br />
                <Space direction="vertical" style={{marginTop:16, width:'100%'}}>
                  {currentValidations.map(v => (
                    <Card key={v.id} size="small" style={{marginBottom:4}} hoverable onClick={() => handleToggleValidation(v.id)}>
                      <Row justify="space-between"><Col><Text>{v.item}</Text></Col><Col><Tag color={v.status==='passed'?'green':v.status==='testing'?'orange':'default'}>{v.status==='passed'?'已验证':v.status==='testing'?'验证中':'待验证'}</Tag></Col></Row>
                    </Card>
                  ))}
                  {currentValidations.length === 0 && <Text type="secondary">暂无验证记录</Text>}
                </Space>
              </div>
            )},
          ]} />
        </>)}
      </Drawer>

      {/* Create Modal */}
      <Modal title="新建方法" open={createModal} onOk={() => form.submit()} onCancel={() => { setCreateModal(false); form.resetFields(); }}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="code" label="方法编号" rules={[{ required: true }]}><Input placeholder="如 HJ 828-2017" /></Form.Item>
          <Form.Item name="name" label="方法名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="analyte" label="分析项目"><Input /></Form.Item>
          <Form.Item name="matrix" label="样品基质"><Input /></Form.Item>
          <Form.Item name="instrument" label="适用仪器"><Input /></Form.Item>
          <Form.Item name="detectionLimit" label="检出限"><Input /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="draft">
            <Select><Select.Option value="draft">草稿</Select.Option><Select.Option value="active">生效</Select.Option><Select.Option value="revision">修订中</Select.Option><Select.Option value="archived">已归档</Select.Option></Select>
          </Form.Item>
          <Form.Item name="responsible" label="负责人"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal title="编辑方法" open={editModal} onOk={() => editForm.submit()} onCancel={() => { setEditModal(false); editForm.resetFields(); }}>
        <Form form={editForm} layout="vertical" onFinish={handleUpdate}>
          <Form.Item name="name" label="方法名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="analyte" label="分析项目"><Input /></Form.Item>
          <Form.Item name="matrix" label="样品基质"><Input /></Form.Item>
          <Form.Item name="instrument" label="适用仪器"><Input /></Form.Item>
          <Form.Item name="detectionLimit" label="检出限"><Input /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select><Select.Option value="draft">草稿</Select.Option><Select.Option value="active">生效</Select.Option><Select.Option value="revision">修订中</Select.Option><Select.Option value="archived">已归档</Select.Option></Select>
          </Form.Item>
          <Form.Item name="responsible" label="负责人"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Copy Modal */}
      <Modal title="复制方法" open={copyModal} onOk={() => copyForm.submit()} onCancel={() => { setCopyModal(false); copyForm.resetFields(); }}>
        <Form form={copyForm} layout="vertical" onFinish={handleCopy}>
          <Form.Item name="newCode" label="新方法编号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="newName" label="新方法名称" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>

      {/* SOP Modal */}
      <Modal title="编辑SOP文档" open={sopModal} onOk={() => sopForm.submit()} onCancel={() => { setSopModal(false); sopForm.resetFields(); }} width={600}>
        <Form form={sopForm} layout="vertical" onFinish={handleSaveSop}>
          <Form.Item name="content" label="SOP内容"><Input.TextArea rows={10} placeholder="输入标准操作程序..." /></Form.Item>
        </Form>
      </Modal>

      {/* Release Modal */}
      <Modal title="版本发布" open={releaseModal} onOk={() => releaseForm.submit()} onCancel={() => { setReleaseModal(false); releaseForm.resetFields(); }}>
        <Form form={releaseForm} layout="vertical" onFinish={handleRelease}>
          <Form.Item name="version" label="新版本号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="effectiveDate" label="生效日期" rules={[{ required: true }]}><Input type="date" /></Form.Item>
          <Form.Item name="note" label="版本说明"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
