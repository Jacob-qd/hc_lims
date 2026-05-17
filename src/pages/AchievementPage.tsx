import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Tabs, Statistic, Row, Col, Modal, Form, Input, Select, message, Popconfirm } from 'antd';
import { TrophyOutlined, FileTextOutlined, GoldOutlined, StarOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { Column } from '@ant-design/plots';

interface Achievement {
  id: string; type: string; typeLabel: string;
  title: string; authors: string[]; date: string;
  metadata: Record<string, any>;
}

const typeColors: Record<string, string> = { paper: 'blue', patent: 'purple', project_completion: 'green', award: 'orange' };
const typeIcons: Record<string, React.ReactNode> = { paper: <FileTextOutlined />, patent: <GoldOutlined />, project_completion: <StarOutlined />, award: <TrophyOutlined /> };

export const AchievementPage: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/v1/research/publications').then(r => r.json()),
      fetch('/api/v1/achievements/statistics').then(r => r.json()),
    ]).then(([achRes, statRes]) => {
      if (achRes.code === 200) setAchievements(achRes.data.list);
      if (statRes.code === 200) setStatistics(statRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = (id: string) => {
    fetch(`/api/v1/achievements/${id}`, { method: 'DELETE' })
      .then(() => { message.success('删除成功'); fetchData(); });
  };

  const handleSubmit = async (values: any) => {
    const payload = { ...values, authors: values.authors?.split(',').map((s: string) => s.trim()) || [] };
    const res = await fetch('/api/v1/achievements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.code === 200) { message.success('添加成功'); setModalOpen(false); form.resetFields(); fetchData(); }
  };

  const filtered = activeTab === 'all' ? achievements : achievements.filter(a => a.type === activeTab);

  const columns = [
    { title: '类型', dataIndex: 'type', width: 100, render: (t: string, r: Achievement) => <Tag color={typeColors[t]} icon={typeIcons[t]}>{r.typeLabel}</Tag> },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '作者/完成人', dataIndex: 'authors', render: (v: any) => (Array.isArray(v) ? v.join(', ') : typeof v === 'string' ? v : '-'), ellipsis: true },
    { title: '日期', dataIndex: 'date', width: 120 },
    { title: '详细信息', render: (_: any, r: Achievement) => {
      if (r.type === 'paper') return <span>期刊: {r.metadata.journal} | IF: {r.metadata.impactFactor}</span>;
      if (r.type === 'patent') return <span>专利号: {r.metadata.patentNo} | {r.metadata.type}</span>;
      if (r.type === 'award') return <span>{r.metadata.awardName} | {r.metadata.level}</span>;
      if (r.type === 'project_completion') return <span>项目编号: {r.metadata.projectCode} | 等级: {r.metadata.grade}</span>;
      return '-';
    }, ellipsis: true },
    { title: '操作', width: 100, render: (_: any, r: Achievement) => (
      <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}><Button size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
    )},
  ];

  const statData = statistics ? [
    { type: '论文', value: statistics.paperCount },
    { type: '专利', value: statistics.patentCount },
    { type: '获奖', value: statistics.awardCount },
    { type: '项目结题', value: statistics.completionCount },
  ] : [];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}><Card><Statistic title="成果总数" value={statistics?.total || 0} prefix={<TrophyOutlined />} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="论文" value={statistics?.paperCount || 0} prefix={<FileTextOutlined />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="专利" value={statistics?.patentCount || 0} prefix={<GoldOutlined />} valueStyle={{ color: '#722ed1' }} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="总被引" value={statistics?.totalCitations || 0} prefix={<StarOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="成果分类统计">
            <Column data={statData} xField="type" yField="value" height={200} />
          </Card>
        </Col>
      </Row>

      <Card title={<Space><TrophyOutlined />成果管理</Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true); }}>添加成果</Button>}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="全部" key="all" />
          <Tabs.TabPane tab={<Space><FileTextOutlined />论文</Space>} key="paper" />
          <Tabs.TabPane tab={<Space><GoldOutlined />专利</Space>} key="patent" />
          <Tabs.TabPane tab={<Space><StarOutlined />项目结题</Space>} key="project_completion" />
          <Tabs.TabPane tab={<Space><TrophyOutlined />获奖</Space>} key="award" />
        </Tabs>
        <Table dataSource={filtered} rowKey="id" columns={columns} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="添加成果" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="type" label="成果类型" rules={[{ required: true }]} >
            <Select placeholder="选择类型">
              <Select.Option value="paper">论文</Select.Option>
              <Select.Option value="patent">专利</Select.Option>
              <Select.Option value="project_completion">项目结题</Select.Option>
              <Select.Option value="award">获奖</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="authors" label="作者/完成人（逗号分隔）" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]} > <Input placeholder="YYYY-MM-DD" /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
