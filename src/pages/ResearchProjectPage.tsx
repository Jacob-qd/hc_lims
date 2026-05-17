import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Drawer, Descriptions, Tabs, Progress, Modal, Form, message, Timeline, Spin
} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, CalendarOutlined, FlagOutlined, FundOutlined, TeamOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const typeColors: Record<string, string> = { 纵向: '#1677ff', 横向: '#faad14', 校内: '#d9d9d9' };
const statusColors: Record<string, string> = { active: '#52c41a', closing: '#faad14', closed: '#d9d9d9' };
const statusLabels: Record<string, string> = { active: '在研', closing: '待结题', closed: '已结题' };

interface ResearchProject {
  id: string;
  no: string;
  name: string;
  type: string;
  source: string;
  pi: string;
  group: string;
  startDate: string;
  endDate: string;
  budget: number;
  used: number;
  status: string;
  progress: number;
}

export const ResearchProjectPage: React.FC = () => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<ResearchProject | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await window.fetch('/api/v1/research/projects');
      const json = await res.json();
      setProjects(json.data?.list || []);
    } catch {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = projects.filter((p: ResearchProject) => {
    const matchesSearch = p.name.includes(searchText) || p.pi.includes(searchText) || p.no.includes(searchText);
    const matchesType = typeFilter ? p.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: projects.filter((p: ResearchProject) => p.status === 'active' || p.status === 'closing').length,
    budget: projects.reduce((s: number, p: ResearchProject) => s + p.budget, 0),
    used: projects.reduce((s: number, p: ResearchProject) => s + p.used, 0),
    rate: projects.length
      ? Math.round(
          projects.reduce((s: number, p: ResearchProject) => s + p.used, 0) /
            projects.reduce((s: number, p: ResearchProject) => s + p.budget, 0) *
            100
        )
      : 0,
  };

  const handleCreate = async (values: any) => {
    const res = await window.fetch('/api/v1/research/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...values, status: 'active', used: 0 }),
    });
    const json = await res.json();
    if (json.code === 200) {
      message.success('创建成功');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    }
  };

  const generateGanttItems = (p: ResearchProject) => {
    const start = new Date(p.startDate);
    const end = new Date(p.endDate);
    const mid = new Date((start.getTime() + end.getTime()) / 2);
    return [
      { color: 'blue', children: `项目立项: ${p.startDate}`, label: <FlagOutlined /> },
      { color: p.progress >= 50 ? 'green' : 'gray', children: `中期检查: ${mid.toISOString().slice(0, 10)}`, label: <CalendarOutlined /> },
      { color: p.status === 'closed' ? 'green' : 'gray', children: `结题验收: ${p.endDate}`, label: <FlagOutlined /> },
    ];
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>研究项目管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建项目</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="在研项目" value={stats.total} prefix={<FlagOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="经费总额" value={`¥${(stats.budget / 10000).toFixed(0)}万`} prefix={<FundOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="已使用经费" value={`¥${(stats.used / 10000).toFixed(0)}万`} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="预算执行率" value={stats.rate} suffix="%" valueStyle={{ color: stats.rate > 80 ? '#faad14' : '#52c41a' }} /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索项目名称/PI/编号" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 260 }} allowClear />
          <Select placeholder="项目类型" style={{ width: 120 }} allowClear onChange={v => setTypeFilter(v)}>
            <Select.Option value="纵向">纵向</Select.Option>
            <Select.Option value="横向">横向</Select.Option>
            <Select.Option value="校内">校内</Select.Option>
          </Select>
        </Space>
        <Table
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: '项目编号', dataIndex: 'no', render: (n: string) => <Text code>{n}</Text> },
            { title: '项目名称', dataIndex: 'name', render: (n: string, r: ResearchProject) => <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{n}</a> },
            { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={typeColors[t]}>{t}</Tag> },
            { title: '资金来源', dataIndex: 'source' },
            { title: 'PI', dataIndex: 'pi' },
            { title: '课题组', dataIndex: 'group' },
            { title: '经费', dataIndex: 'budget', render: (b: number) => `¥${(b / 10000).toFixed(1)}万` },
            { title: '执行率', dataIndex: 'progress', render: (p: number) => <Progress percent={p} size="small" /> },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag> },
            { title: '操作', render: (_: any, r: ResearchProject) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawerVisible(true); }}>详情</Button> },
          ]}
          size="middle"
        />
      </Card>

      <Drawer title={selected?.name} open={drawerVisible} onClose={() => { setDrawerVisible(false); setSelected(null); }} width={560}>
        {selected && (<>
          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}><Card size="small"><Statistic title="经费总额" value={`¥${(selected.budget / 10000).toFixed(1)}万`} /></Card></Col>
            <Col span={8}><Card size="small"><Statistic title="已使用" value={`¥${(selected.used / 10000).toFixed(1)}万`} /></Card></Col>
            <Col span={8}><Card size="small"><Statistic title="执行率" value={selected.progress} suffix="%" /></Card></Col>
          </Row>
          <Tabs items={[
            {
              key: 'info', label: '基本信息', children: (
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="项目名称">{selected.name}</Descriptions.Item>
                  <Descriptions.Item label="编号">{selected.no}</Descriptions.Item>
                  <Descriptions.Item label="类型"><Tag color={typeColors[selected.type]}>{selected.type}</Tag></Descriptions.Item>
                  <Descriptions.Item label="来源">{selected.source}</Descriptions.Item>
                  <Descriptions.Item label="PI">{selected.pi}</Descriptions.Item>
                  <Descriptions.Item label="课题组">{selected.group}</Descriptions.Item>
                  <Descriptions.Item label="起止日期">{selected.startDate} ~ {selected.endDate}</Descriptions.Item>
                </Descriptions>
              )
            },
            {
              key: 'timeline', label: '项目甘特图', children: (
                <Timeline mode="left" items={generateGanttItems(selected)} />
              )
            },
            {
              key: 'funds', label: '经费管理', children: (
                <Table
                  dataSource={[
                    { item: '设备费', budget: selected.budget * 0.4, used: selected.used * 0.35, remain: selected.budget * 0.4 - selected.used * 0.35, rate: 35 },
                    { item: '材料费', budget: selected.budget * 0.25, used: selected.used * 0.3, remain: selected.budget * 0.25 - selected.used * 0.3, rate: 30 },
                    { item: '测试费', budget: selected.budget * 0.15, used: selected.used * 0.2, remain: selected.budget * 0.15 - selected.used * 0.2, rate: 20 },
                    { item: '差旅费', budget: selected.budget * 0.1, used: selected.used * 0.1, remain: selected.budget * 0.1 - selected.used * 0.1, rate: 10 },
                    { item: '其他', budget: selected.budget * 0.1, used: selected.used * 0.05, remain: selected.budget * 0.1 - selected.used * 0.05, rate: 5 },
                  ]}
                  rowKey="item"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '预算科目', dataIndex: 'item' },
                    { title: '预算金额', dataIndex: 'budget', render: (v: number) => '¥' + (v / 10000).toFixed(1) + '万' },
                    { title: '已支出', dataIndex: 'used', render: (v: number) => '¥' + (v / 10000).toFixed(1) + '万' },
                    { title: '余额', dataIndex: 'remain', render: (v: number) => <Text type={v < 0 ? 'danger' : undefined}>¥{(v / 10000).toFixed(1)}万</Text> },
                    { title: '支出占比', dataIndex: 'rate', render: (v: number) => <Progress percent={v} size="small" /> },
                  ]}
                />
              )
            },
            {
              key: 'experiments', label: '关联实验', children: (
                <Table
                  dataSource={[
                    { no: 'ELN20240521-001', name: '土壤pH测定实验', date: '2024-05-21', status: '已签名' },
                    { no: 'ELN20240520-008', name: '二维材料表面改性测试', date: '2024-05-20', status: '已锁定' },
                  ]}
                  rowKey="no"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '实验编号', dataIndex: 'no' },
                    { title: '名称', dataIndex: 'name' },
                    { title: '日期', dataIndex: 'date' },
                    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === '已锁定' ? 'default' : 'green'}>{s}</Tag> },
                  ]}
                />
              )
            },
            {
              key: 'members', label: '项目成员', children: (
                <Table
                  dataSource={[
                    { name: selected.pi, role: '项目负责人', dept: selected.group },
                    { name: '李华', role: '核心成员', dept: selected.group },
                    { name: '王芳', role: '研究生', dept: selected.group },
                  ]}
                  rowKey="name"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '姓名', dataIndex: 'name' },
                    { title: '角色', dataIndex: 'role', render: (r: string) => <Tag>{r}</Tag> },
                    { title: '课题组', dataIndex: 'dept' },
                  ]}
                />
              )
            },
          ]} />
        </>)}
      </Drawer>

      <Modal title="新建研究项目" open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); form.resetFields(); }} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="项目名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="no" label="项目编号"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="type" label="类型"><Select><Select.Option value="纵向">纵向项目</Select.Option><Select.Option value="横向">横向项目</Select.Option><Select.Option value="校内">校内项目</Select.Option></Select></Form.Item></Col>
            <Col span={12}><Form.Item name="source" label="资金来源"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="pi" label="PI"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="group" label="所属课题组"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="budget" label="经费总额"><Input type="number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="startDate" label="开始日期"><Input placeholder="YYYY-MM-DD" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="endDate" label="结束日期"><Input placeholder="YYYY-MM-DD" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
