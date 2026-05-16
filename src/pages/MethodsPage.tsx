import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Drawer, Descriptions, Tabs, Modal, Form, message, Timeline, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, HistoryOutlined, PrinterOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const statusColors: Record<string, string> = { active: '#52c41a', revision: '#faad14', archived: '#d9d9d9', draft: '#1677ff' };

const SopView: React.FC<{method: any}> = ({method}) => <div>
  <Descriptions column={1} size="small" bordered style={{ marginBottom: 12 }}>
    <Descriptions.Item label="方法">{method?.code} - {method?.name}</Descriptions.Item>
    <Descriptions.Item label="SOP编号">SOP-{method?.code}-v2</Descriptions.Item>
    <Descriptions.Item label="版本">v2.0</Descriptions.Item>
    <Descriptions.Item label="生效日期">2024-06-01</Descriptions.Item>
    <Descriptions.Item label="编制人">张伟</Descriptions.Item>
    <Descriptions.Item label="审核人">王强</Descriptions.Item>
  </Descriptions>
  <Table dataSource={[
    { section: '1. 适用范围', desc: '适用于地表水、地下水中重金属元素的测定' },
    { section: '2. 方法原理', desc: '样品经酸化处理后，采用ICP-MS法测定' },
    { section: '3. 试剂与材料', desc: '硝酸(优级纯)、标准溶液、高纯氩气' },
    { section: '4. 操作步骤', desc: '样品前处理 → 仪器准备 → 上机检测 → 数据处理' },
    { section: '5. 质量控制', desc: '空白、平行样、加标回收、标准参考物质' },
  ]} rowKey="section" pagination={false} size="small" columns={[
    { title: '章节', dataIndex: 'section', width: 160 },
    { title: '内容摘要', dataIndex: 'desc' },
  ]} />
  <Button type="primary" size="small" style={{ marginTop: 8 }} onClick={() => { const sop = `SOP文档: ${method?.code}\n方法: ${method?.name}\n版本: v2.0\n---\n1. 适用范围\n2. 方法原理\n3. 试剂与材料\n4. 操作步骤\n5. 质量控制`; const blob = new Blob([sop],{type:'text/plain'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `SOP-${method?.code}.txt`; a.click(); }}>下载完整SOP</Button>
</div>;

export const MethodsPage: React.FC = () => {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [versionModal, setVersionModal] = useState(false);
  const [sopModal, setSopModal] = useState(false);
  const [versionForm] = Form.useForm();
  const [sopForm] = Form.useForm();
  const [createModal, setCreateModal] = useState(false);
  const [form] = Form.useForm();

  const fetchMethods = async () => {
    setLoading(true);
    const res = await window.fetch('/api/v1/methods').then(r => r.json());
    setMethods(res.data.list); setLoading(false);
  };
  useEffect(() => { fetchMethods(); }, []);

  const filtered = methods.filter((m: any) => m.name.includes(search) || m.code.includes(search) || m.analyte.includes(search));
  const stats = { active: methods.filter((m: any) => m.status === 'active').length, revision: methods.filter((m: any) => m.status === 'revision').length, archived: methods.filter((m: any) => m.status === 'archived').length };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}><Col><Title level={4}>方法管理</Title></Col>
        <Col><Space>
          <Button icon={<PlusOutlined />} onClick={() => setCreateModal(true)}>新建方法</Button>
          <Button onClick={() => setVersionModal(true)}>版本发布</Button>
          <Button onClick={() => setSopModal(true)}>关联SOP</Button>
        </Space></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="生效方法" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="修订中" value={stats.revision} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="归档版本" value={stats.archived} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="验证任务" value={3} valueStyle={{ color: '#1677ff' }} /></Card></Col>
      </Row>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索方法名称/编号/分析项目" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 320 }} allowClear />
          <Select placeholder="状态" style={{ width: 120 }} allowClear>
            {Object.entries(statusColors).map(([k, v]) => <Select.Option key={k}><Tag color={v}>{k==='active'?'生效':k==='revision'?'修订中':k==='archived'?'已归档':'草稿'}</Tag></Select.Option>)}
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
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s==='active'?'生效':s==='revision'?'修订中':s==='archived'?'已归档':'草稿'}</Tag> },
          { title: '操作', render: (_: any, r: any) => <Space><Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawer(true); }}>详情</Button><Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditingMethod(r); form.setFieldsValue(r); setEditModal(true); }}>编辑</Button><Button type="link" size="small" onClick={() => { methods.push({...r, id:'m'+(methods.length+1),code:r.code+'-CPY',version:'v1.0(draft)',name:r.name+' (副本)'}); message.success('已复制方法: '+r.code); }}>复制</Button></Space> },
        ]} size="middle" />
      </Card>

      <Drawer title={`${selected?.code} ${selected?.name}`} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={520} extra={<Space><Button icon={<EditOutlined />} onClick={() => { setEditingMethod(selected); form.setFieldsValue(selected); setEditModal(true); }}>编辑</Button><Button icon={<PrinterOutlined />} onClick={() => { const content = `方法: ${selected?.code} ${selected?.name}\n分析项目: ${selected?.analyte}\n版本: ${selected?.version}\n适用仪器: ${selected?.instrument}\n检出限: ${selected?.detectionLimit}`; const blob = new Blob([content],{type:'text/plain'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${selected?.code}.txt`; a.click(); }}>导出PDF</Button></Space>}>
        {selected && (<>
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
            { key: 'sop', label: 'SOP文档', children: <SopView method={selected} /> },
            { key: 'versions', label: '版本历史', children: <Timeline items={[
              { color: 'green', children: <>{selected.version} 当前版本<br />{selected.effectiveDate} 生效</> },
              { color: 'blue', children: <>v1.0 初版<br />2023-01-01 发布</> },
            ]} /> },
            { key: 'validation', label: '验证记录', children: <div><Progress type="circle" percent={75} size={80} /><br /><Space style={{marginTop:16}} direction="vertical" style={{width:'100%'}}>
              {[{item:'准确度',status:'passed'},{item:'精密度',status:'passed'},{item:'线性范围',status:'passed'},{item:'检出限',status:'passed'},{item:'定量限',status:'testing'},{item:'回收率',status:'pending'}].map(v =>
                <Card key={v.item} size="small" style={{marginBottom:4}}>
                  <Row justify="space-between"><Col><Text>{v.item}</Text></Col><Col><Tag color={v.status==='passed'?'green':v.status==='testing'?'orange':'default'}>{v.status==='passed'?'已验证':v.status==='testing'?'验证中':'待验证'}</Tag></Col></Row>
                </Card>
              )}
            </Space></div> },
          ]} />
        </>)}
      </Drawer>

      <Modal title="编辑方法" open={editModal} onOk={() => form.submit()} onCancel={() => { setEditModal(false); setEditingMethod(null); form.resetFields(); }}>
        <Form form={form} layout="vertical" onFinish={(v) => { if(editingMethod) Object.assign(editingMethod, v); message.success('方法更新成功'); setEditModal(false); setEditingMethod(null); form.resetFields(); }}>
          <Form.Item name="code" label="方法编号"><Input disabled /></Form.Item>
          <Form.Item name="name" label="方法名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="analyte" label="分析项目"><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="matrix" label="样品基质"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="instrument" label="适用仪器"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="detectionLimit" label="检出限"><Input /></Form.Item>
        </Form>
      </Modal>

      <Modal title="版本发布" open={versionModal} onOk={() => versionForm.submit()} onCancel={() => { setVersionModal(false); versionForm.resetFields(); }}>
        <Form form={versionForm} layout="vertical" onFinish={(v) => { message.success(`方法 ${v.methodCode} 版本 ${v.newVersion} 已发布`); setVersionModal(false); versionForm.resetFields(); }}>
          <Form.Item name="methodCode" label="方法编号" rules={[{ required: true }]}><Select>{methods.filter(m=>m.status==='revision').map(m=><Select.Option key={m.code}>{m.code} - {m.name}</Select.Option>)}</Select></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="newVersion" label="新版本号" rules={[{ required: true }]}><Input placeholder="v2.1" /></Form.Item></Col>
            <Col span={12}><Form.Item name="effectiveDate" label="生效日期"><Input placeholder="2024-06-01" /></Form.Item></Col>
          </Row>
          <Form.Item name="changeLog" label="变更说明"><Input.TextArea rows={3} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="关联SOP文档" open={sopModal} onOk={() => sopForm.submit()} onCancel={() => { setSopModal(false); sopForm.resetFields(); }}>
        <Form form={sopForm} layout="vertical" onFinish={(v) => { message.success(`SOP文档已关联到方法 ${v.methodCode}`); setSopModal(false); sopForm.resetFields(); }}>
          <Form.Item name="methodCode" label="方法编号" rules={[{ required: true }]}><Select>{methods.map(m=><Select.Option key={m.code}>{m.code} - {m.name}</Select.Option>)}</Select></Form.Item>
          <Form.Item name="sopTitle" label="SOP标题" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sopFile" label="文件路径"><Input placeholder="/docs/sop/METHOD-001-v2.pdf" /></Form.Item>
          <Form.Item name="version" label="SOP版本"><Input placeholder="v2.0" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
