import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Space, Input, Select, Modal, Form, message, Tabs, Descriptions, Timeline, Segmented, List, Badge, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, CheckCircleOutlined, AppstoreOutlined, UnorderedListOutlined, FileTextOutlined, LockOutlined, SignatureOutlined, CalendarOutlined, ExperimentOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColors: Record<string, string> = { draft: '#1677ff', signed: '#52c41a', locked: '#d9d9d9' };
const statusLabels: Record<string, string> = { draft: '草稿', signed: '已签名', locked: '已锁定' };

export const ELNPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [createVisible, setCreateVisible] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [signVisible, setSignVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await window.fetch('/api/v1/research/eln-entries');
      const json = await res.json();
      setEntries(json.data.list);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = entries.filter((e: any) => {
    const matchSearch = e.title.includes(searchText) || e.author.includes(searchText);
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreate = async (values: any) => {
    const res = await window.fetch('/api/v1/research/eln-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const json = await res.json();
    if (json.code === 200) { message.success('创建成功'); setCreateVisible(false); form.resetFields(); fetchData(); }
  };

  const openEditor = (entry: any) => {
    setCurrentEntry(entry);
    setTitle(entry?.title || '');
    setContent('');
    setEditorVisible(true);
  };

  const handleSave = async () => {
    if (currentEntry) {
      message.success('保存成功');
      setEditorVisible(false);
      fetchData();
    }
  };

  const handleSign = async () => {
    if (!currentEntry) return;
    const res = await window.fetch(`/api/v1/research/eln-entries/${currentEntry.id}/sign`, { method: 'POST' });
    const json = await res.json();
    if (json.code === 200) { message.success('签名成功'); setSignVisible(false); setEditorVisible(false); fetchData(); }
  };

  const tableColumns = [
    { title: '实验编号', dataIndex: 'no', render: (n: string) => <Text code>{n}</Text> },
    { title: '标题', dataIndex: 'title', render: (t: string, r: any) => <a onClick={() => openEditor(r)}>{t}</a> },
    { title: '实验人', dataIndex: 'author' },
    { title: '所属项目', dataIndex: 'project' },
    { title: '课题组', dataIndex: 'group' },
    { title: '实验日期', dataIndex: 'date' },
    { title: 'Protocol', dataIndex: 'protocol' },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
    { title: '操作', render: (_: any, r: any) => (
      <Space>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditor(r)}>编辑</Button>
        {r.status === 'draft' && <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => { setCurrentEntry(r); setSignVisible(true); }}>签名</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>电子实验记录 (ELN)</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>新建实验记录</Button></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="全文搜索标题/作者/标签" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 300 }} allowClear />
          <Select placeholder="状态" style={{ width: 120 }} allowClear value={statusFilter} onChange={v => setStatusFilter(v)}>
            {Object.entries(statusLabels).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
          </Select>
          <Segmented value={viewMode} onChange={v => setViewMode(v as 'table' | 'card')} options={[
            { value: 'table', icon: <UnorderedListOutlined /> },
            { value: 'card', icon: <AppstoreOutlined /> },
          ]} />
        </Space>
        {viewMode === 'table' ? (
          <Table dataSource={filtered} rowKey="id" loading={loading} columns={tableColumns} size="middle" pagination={{ pageSize: 10 }} />
        ) : (
          <Row gutter={[16, 16]}>
            {filtered.map((e: any) => (
              <Col xs={24} sm={12} lg={8} key={e.id}>
                <Card hoverable size="small" onClick={() => openEditor(e)} title={
                  <Space><FileTextOutlined />{e.no}</Space>
                } extra={<Tag color={statusColors[e.status]}>{statusLabels[e.status]}</Tag>}>
                  <Text strong style={{ fontSize: 16 }}>{e.title}</Text>
                  <div style={{ marginTop: 8 }}>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                      <Text type="secondary"><ExperimentOutlined /> {e.project}</Text>
                      <Text type="secondary"><TeamOutlined /> {e.group}</Text>
                      <Text type="secondary"><CalendarOutlined /> {e.date}</Text>
                      <div>{e.tags?.map((tag: string) => <Tag key={tag} size="small">{tag}</Tag>)}</div>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Card>

      <Modal title="新建实验记录" open={createVisible} onOk={() => form.submit()} onCancel={() => { setCreateVisible(false); form.resetFields(); }} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="title" label="实验标题" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="author" label="实验人" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="project" label="所属项目"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="group" label="课题组"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="protocol" label="关联Protocol"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="date" label="实验日期"><Input placeholder="YYYY-MM-DD" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      <Modal title={currentEntry?.no ? `编辑: ${currentEntry.no}` : '新建实验记录'} open={editorVisible} onOk={handleSave} onCancel={() => setEditorVisible(false)} width={900} okText="保存" destroyOnClose>
        <Row gutter={16}>
          <Col span={16}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="实验标题" size="large" />
              <div style={{border:'1px solid #d9d9d9',borderRadius:6,overflow:'hidden'}}>
                <div style={{padding:'4px 8px',background:'#fafafa',borderBottom:'1px solid #d9d9d9',display:'flex',gap:4}}>
                  {['H1','H2','B','I','U','列表','表格','图片','公式','链接'].map(t => <Button key={t} size="small" type="text" style={{fontSize:12}}>{t}</Button>)}
                </div>
                <Tabs defaultActiveKey="content" items={[
                  { key: 'content', label: '实验内容', children: <TextArea rows={12} value={content} onChange={e => setContent(e.target.value)} placeholder="在这里记录实验目的、步骤、结果和结论..." style={{border:'none',borderRadius:0}} /> },
                  { key: 'steps', label: '实验步骤', children: <div style={{padding:8}}>
                    {['样品准备','仪器设置','数据采集','数据分析'].map((s,i) => <div key={s} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid #f0f0f0'}}>
                      <span style={{width:20,height:20,borderRadius:'50%',background:i<2?'#52c41a':'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12}}>{i+1}</span>
                      <Text strong style={{width:80}}>{s}</Text>
                      <Input size="small" placeholder="操作描述..." style={{flex:1}} />
                      <Tag color={i<2?'green':'default'}>{i<2?'已完成':'待开始'}</Tag>
                    </div>)}
                  </div>},
                ]} />
              </div>
              <div style={{border:'1px dashed #d9d9d9',borderRadius:6,padding:16,textAlign:'center',cursor:'pointer'}}>
                <Text type="secondary">📎 拖拽文件到此处上传 (图谱、数据表、照片)</Text>
              </div>
            </Space>
          </Col>
          <Col span={8}>
            <Card size="small" title="元信息" style={{ marginBottom: 16 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="编号">{currentEntry?.no}</Descriptions.Item>
                <Descriptions.Item label="实验人">{currentEntry?.author}</Descriptions.Item>
                <Descriptions.Item label="日期">{currentEntry?.date}</Descriptions.Item>
                <Descriptions.Item label="项目">{currentEntry?.project}</Descriptions.Item>
                <Descriptions.Item label="课题组">{currentEntry?.group}</Descriptions.Item>
                <Descriptions.Item label="Protocol">{currentEntry?.protocol}</Descriptions.Item>
                <Descriptions.Item label="状态"><Tag color={statusColors[currentEntry?.status]}>{statusLabels[currentEntry?.status]}</Tag></Descriptions.Item>
              </Descriptions>
            </Card>
            <Card size="small" title="附件">
              <Text type="secondary">暂无附件</Text>
            </Card>
          </Col>
        </Row>
      </Modal>

      <Modal title="提交签名与见证" open={signVisible} onOk={handleSign} onCancel={() => setSignVisible(false)} okText="确认签名">
        <Descriptions column={1} size="small">
          <Descriptions.Item label="实验编号">{currentEntry?.no}</Descriptions.Item>
          <Descriptions.Item label="标题">{currentEntry?.title}</Descriptions.Item>
          <Descriptions.Item label="实验人">{currentEntry?.author}</Descriptions.Item>
          <Descriptions.Item label="实验日期">{currentEntry?.date}</Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
          <Text strong>签名确认</Text>
          <Input.Password placeholder="输入密码验证身份" style={{ marginTop: 8 }} />
          <Text type="secondary" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>签名后将记录时间戳和IP地址</Text>
        </div>
        <Timeline style={{ marginTop: 16 }} items={[
          { color: 'blue', children: '1. 实验人提交签名（当前）' },
          { color: 'gray', children: '2. 导师审阅并批注' },
          { color: 'gray', children: '3. 见证人签名（可选）' },
          { color: 'gray', children: '4. 记录锁定' },
        ]} />
      </Modal>
    </div>
  );
};
