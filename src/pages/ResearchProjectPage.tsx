import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, Progress, Statistic, Row, Col, message, Tabs, Timeline, Descriptions, Popconfirm, List, Avatar, Divider, InputNumber, Steps } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FundOutlined, CalendarOutlined, CheckCircleOutlined, UserOutlined, FileTextOutlined, TeamOutlined, BookOutlined, SolutionOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;

interface Milestone {
  id: string; name: string; plannedDate: string; actualDate?: string; status: string; deliverable?: string;
}
interface Member {
  id: string; name: string; role: string;
}
interface ResearchProject {
  id: string; code: string; name: string; type: string; typeLabel: string;
  leaderName: string; groupName: string; budget: number; spent: number;
  startDate: string; endDate: string; status: string; statusLabel: string;
  source?: string; progress?: number;
  milestones: Milestone[]; members: Member[];
}

const statusColors: Record<string, string> = { applying: 'blue', running: 'green', completed: 'purple', archived: 'default' };

export const ResearchProjectPage: React.FC = () => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [form] = Form.useForm();

  // filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterKeyword, setFilterKeyword] = useState('');

  const fetchProjects = () => {
    setLoading(true);
    fetch('/api/v1/research/projects').then(r => r.json())
      .then(res => { if (res.code === 200) setProjects(res.data.list); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = (id: string) => {
    fetch(`/api/v1/research/projects/${id}`, { method: 'DELETE' })
      .then(() => { message.success('删除成功'); fetchProjects(); });
  };

  const handleSubmit = async (values: any) => {
    const payload = {
      ...values,
      startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: values.dateRange?.[1]?.format('YYYY-MM-DD'),
      budget: Number(values.budget) || 0,
      spent: Number(values.spent) || 0,
      progress: Number(values.progress) || 0,
    };
    delete payload.dateRange;
    const url = selectedProject ? `/api/v1/research/projects/${selectedProject.id}` : '/api/v1/research/projects';
    const method = selectedProject ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.code === 200) { message.success(selectedProject ? '更新成功' : '创建成功'); setModalOpen(false); form.resetFields(); fetchProjects(); }
  };

  const filteredProjects = projects.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    if (filterType !== 'all' && p.type !== filterType) return false;
    if (filterKeyword) {
      const kw = filterKeyword.toLowerCase();
      return p.name.toLowerCase().includes(kw) || p.code.toLowerCase().includes(kw) || p.leaderName.toLowerCase().includes(kw);
    }
    return true;
  });

  const columns = [
    { title: '项目编号', dataIndex: 'code', width: 150 },
    { title: '项目名称', dataIndex: 'name', ellipsis: true, render: (v: string, r: ResearchProject) => <Button type="link" onClick={() => { setSelectedProject(r); setDetailOpen(true); }}>{v}</Button> },
    { title: '类型', dataIndex: 'typeLabel', width: 90, render: (v: string) => <Tag>{v}</Tag> },
    { title: '负责人', dataIndex: 'leaderName', width: 100 },
    { title: '起止日期', render: (_: any, r: ResearchProject) => `${r.startDate} ~ ${r.endDate}`, width: 180 },
    { title: '预算执行', render: (_: any, r: ResearchProject) => <Progress percent={r.budget ? Math.round((r.spent / r.budget) * 100) : 0} size="small" />, width: 120 },
    { title: '进度', dataIndex: 'progress', width: 80, render: (v: number) => `${v || 0}%` },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string, r: ResearchProject) => <Tag color={statusColors[s]}>{r.statusLabel}</Tag> },
    { title: '操作', width: 150, render: (_: any, r: ResearchProject) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setSelectedProject(r); form.setFieldsValue({ ...r, dateRange: [dayjs(r.startDate), dayjs(r.endDate)] }); setModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}><Button size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )},
  ];

  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}><Card><Statistic title="项目总数" value={projects.length} prefix={<FundOutlined />} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="进行中" value={projects.filter(p => p.status === 'running').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="总预算" value={`¥${(totalBudget / 10000).toFixed(1)}万`} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="总支出" value={`¥${(totalSpent / 10000).toFixed(1)}万`} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Card title="科研项目管理" extra={
        <Space>
          <Input.Search placeholder="搜索项目名称/编号/负责人" allowClear style={{ width: 220 }} onSearch={setFilterKeyword} />
          <Select placeholder="状态筛选" allowClear style={{ width: 120 }} onChange={setFilterStatus} value={filterStatus}>
            <Option value="all">全部状态</Option>
            <Option value="applying">申报中</Option>
            <Option value="running">进行中</Option>
            <Option value="completed">已结题</Option>
            <Option value="archived">已归档</Option>
          </Select>
          <Select placeholder="类型筛选" allowClear style={{ width: 120 }} onChange={setFilterType} value={filterType}>
            <Option value="all">全部类型</Option>
            <Option value="national">国家级</Option>
            <Option value="provincial">省级</Option>
            <Option value="school">校级</Option>
            <Option value="enterprise">企业委托</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedProject(null); form.resetFields(); setModalOpen(true); }}>新建项目</Button>
        </Space>
      }>
        <Table dataSource={filteredProjects} rowKey="id" columns={columns} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      {/* 新建/编辑项目 Modal */}
      <Modal title={selectedProject ? '编辑项目' : '新建项目'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose width={700}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="项目名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="code" label="项目编号" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="type" label="项目类型" rules={[{ required: true }]}>
              <Select placeholder="选择类型">
                <Option value="national">国家级</Option>
                <Option value="provincial">省级</Option>
                <Option value="school">校级</Option>
                <Option value="enterprise">企业委托</Option>
              </Select>
            </Form.Item></Col>
            <Col span={12}><Form.Item name="source" label="项目来源" rules={[{ required: true }]}><Input placeholder="如：国家自然科学基金面上项目" /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="leaderName" label="负责人" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="groupName" label="所属团队" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="budget" label="预算（元）" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
            <Col span={12}><Form.Item name="spent" label="已支出（元）"><InputNumber style={{ width: '100%' }} min={0} /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="progress" label="当前进度(%)"><InputNumber style={{ width: '100%' }} min={0} max={100} /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态" rules={[{ required: true }]}>
              <Select><Option value="applying">申报中</Option><Option value="running">进行中</Option><Option value="completed">已结题</Option><Option value="archived">已归档</Option></Select>
            </Form.Item></Col>
          </Row>
          <Form.Item name="dateRange" label="起止日期" rules={[{ required: true }]}><RangePicker style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      {/* 项目详情 Modal */}
      <Modal title="项目详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={800}>
        {selectedProject && (
          <Tabs defaultActiveKey="1" items={[
            { key: '1', label: <span><SolutionOutlined /> 基本信息</span>, children: (
              <Descriptions column={2} bordered>
                <Descriptions.Item label="项目编号" span={2}>{selectedProject.code}</Descriptions.Item>
                <Descriptions.Item label="名称" span={2}>{selectedProject.name}</Descriptions.Item>
                <Descriptions.Item label="类型">{selectedProject.typeLabel}</Descriptions.Item>
                <Descriptions.Item label="来源">{selectedProject.source || '-'}</Descriptions.Item>
                <Descriptions.Item label="负责人">{selectedProject.leaderName}</Descriptions.Item>
                <Descriptions.Item label="所属团队">{selectedProject.groupName}</Descriptions.Item>
                <Descriptions.Item label="预算">¥{selectedProject.budget.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="已支出">¥{selectedProject.spent.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="执行率"><Progress percent={selectedProject.budget ? Math.round((selectedProject.spent / selectedProject.budget) * 100) : 0} /></Descriptions.Item>
                <Descriptions.Item label="总进度">{selectedProject.progress || 0}%</Descriptions.Item>
                <Descriptions.Item label="起止日期" span={2}>{selectedProject.startDate} ~ {selectedProject.endDate}</Descriptions.Item>
                <Descriptions.Item label="状态" span={2}><Tag color={statusColors[selectedProject.status]}>{selectedProject.statusLabel}</Tag></Descriptions.Item>
              </Descriptions>
            )},
            { key: '2', label: <span><FundOutlined /> 经费看板</span>, children: (
              <Row gutter={16}>
                <Col span={12}>
                  <Pie data={[
                    { type: '已使用', value: selectedProject.spent },
                    { type: '剩余', value: Math.max(0, selectedProject.budget - selectedProject.spent) }
                  ]} angleField="value" colorField="type" height={250} />
                </Col>
                <Col span={12}>
                  <Statistic title="总预算" value={`¥${selectedProject.budget.toLocaleString()}`} />
                  <Statistic title="已支出" value={`¥${selectedProject.spent.toLocaleString()}`} valueStyle={{ color: '#ff4d4f' }} />
                  <Statistic title="剩余" value={`¥${(selectedProject.budget - selectedProject.spent).toLocaleString()}`} valueStyle={{ color: '#52c41a' }} />
                </Col>
              </Row>
            )},
            { key: '3', label: <span><CalendarOutlined /> 里程碑</span>, children: (
              <Timeline mode="left">
                {selectedProject.milestones?.map((m: any) => (
                  <Timeline.Item key={m.id} dot={m.status === 'completed' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CalendarOutlined />} label={m.plannedDate}>
                    <p><strong>{m.name}</strong> {m.status === 'completed' && <Tag color="green">已完成</Tag>} {m.status === 'active' && <Tag color="blue">进行中</Tag>}</p>
                    {m.actualDate && <p>实际完成: {m.actualDate}</p>}
                    {m.deliverable && <p>交付物: {m.deliverable}</p>}
                  </Timeline.Item>
                ))}
              </Timeline>
            )},
            { key: '4', label: <span><TeamOutlined /> 团队成员</span>, children: (
              <List
                dataSource={selectedProject.members || []}
                renderItem={(m: any) => (
                  <List.Item>
                    <List.Item.Meta avatar={<Avatar icon={<UserOutlined />} />} title={m.name} description={m.role} />
                  </List.Item>
                )}
              />
            )},
            { key: '5', label: <span><FileTextOutlined /> 任务分解</span>, children: (
              <Steps direction="vertical" size="small" current={1}>
                {selectedProject.milestones?.map((m: any, _idx: number) => (
                  <Step key={m.id} title={m.name} description={m.deliverable || ''} status={m.status === 'completed' ? 'finish' : m.status === 'active' ? 'process' : 'wait'} />
                ))}
                {!selectedProject.milestones?.length && <div style={{ color: '#999' }}>暂无任务分解</div>}
              </Steps>
            )},
            { key: '6', label: <span><BookOutlined /> 成果关联</span>, children: (
              <div style={{ color: '#999' }}>成果关联功能开发中...<br/>可关联论文、专利、奖励等</div>
            )},
          ]} />
        )}
      </Modal>
    </div>
  );
};
