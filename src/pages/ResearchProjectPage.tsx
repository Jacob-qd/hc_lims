import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, DatePicker, Progress, Statistic, Row, Col, message, Tabs, Timeline, Descriptions, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FundOutlined, CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface ResearchProject {
  id: string; code: string; name: string; type: string; typeLabel: string;
  leaderName: string; groupName: string; budget: number; spent: number;
  startDate: string; endDate: string; status: string; statusLabel: string;
  milestones: any[]; members: any[];
}

const statusColors: Record<string, string> = { applying: 'blue', running: 'green', completed: 'purple', archived: 'default' };

export const ResearchProjectPage: React.FC = () => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ResearchProject | null>(null);
  const [form] = Form.useForm();

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
    const payload = { ...values, startDate: values.dateRange?.[0]?.format('YYYY-MM-DD'), endDate: values.dateRange?.[1]?.format('YYYY-MM-DD') };
    delete payload.dateRange;
    const url = selectedProject ? `/api/v1/research/projects/${selectedProject.id}` : '/api/v1/research/projects';
    const method = selectedProject ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.code === 200) { message.success(selectedProject ? '更新成功' : '创建成功'); setModalOpen(false); form.resetFields(); fetchProjects(); }
  };

  const columns = [
    { title: '项目编号', dataIndex: 'code', width: 140 },
    { title: '项目名称', dataIndex: 'name', ellipsis: true, render: (v: string, r: ResearchProject) => <Button type="link" onClick={() => { setSelectedProject(r); setDetailOpen(true); }}>{v}</Button> },
    { title: '类型', dataIndex: 'typeLabel', width: 90, render: (v: string) => <Tag>{v}</Tag> },
    { title: '负责人', dataIndex: 'leaderName', width: 100 },
    { title: '起止日期', render: (_: any, r: ResearchProject) => `${r.startDate} ~ ${r.endDate}`, width: 180 },
    { title: '预算执行', render: (_: any, r: ResearchProject) => <Progress percent={r.budget ? Math.round((r.spent / r.budget) * 100) : 0} size="small" />, width: 120 },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string, r: ResearchProject) => <Tag color={statusColors[s]}>{r.statusLabel}</Tag> },
    { title: '操作', width: 150, render: (_: any, r: ResearchProject) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setSelectedProject(r); form.setFieldsValue({ ...r, dateRange: [dayjs(r.startDate), dayjs(r.endDate)] }); setModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}><Button size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}><Card><Statistic title="项目总数" value={projects.length} prefix={<FundOutlined />} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="进行中" value={projects.filter(p => p.status === 'running').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="总预算" value={`¥${(projects.reduce((s, p) => s + p.budget, 0) / 10000).toFixed(1)}万`} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="总支出" value={`¥${(projects.reduce((s, p) => s + p.spent, 0) / 10000).toFixed(1)}万`} /></Card></Col>
      </Row>
      <Card title="科研项目管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedProject(null); form.resetFields(); setModalOpen(true); }}>新建项目</Button>}>
        <Table dataSource={projects} rowKey="id" columns={columns} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title={selectedProject ? '编辑项目' : '新建项目'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="项目名称" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="code" label="项目编号" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="type" label="项目类型" rules={[{ required: true }]} >
            <Select placeholder="选择类型"><Option value="national">国家级</Option><Option value="provincial">省级</Option><Option value="school">校级</Option><Option value="enterprise">企业委托</Option></Select>
          </Form.Item>
          <Form.Item name="leaderName" label="负责人" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="groupName" label="所属团队" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="budget" label="预算（元）" rules={[{ required: true }]} > <Input type="number" /> </Form.Item>
          <Form.Item name="dateRange" label="起止日期" rules={[{ required: true }]} > <RangePicker style={{ width: '100%' }} /> </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]} >
            <Select><Option value="applying">申报中</Option><Option value="running">进行中</Option><Option value="completed">已结题</Option><Option value="archived">已归档</Option></Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal title="项目详情" open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={700}>
        {selectedProject && (
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab="基本信息" key="1">
              <Descriptions column={2} bordered>
                <Descriptions.Item label="项目编号" span={2}>{selectedProject.code}</Descriptions.Item>
                <Descriptions.Item label="名称" span={2}>{selectedProject.name}</Descriptions.Item>
                <Descriptions.Item label="类型">{selectedProject.typeLabel}</Descriptions.Item>
                <Descriptions.Item label="负责人">{selectedProject.leaderName}</Descriptions.Item>
                <Descriptions.Item label="所属团队">{selectedProject.groupName}</Descriptions.Item>
                <Descriptions.Item label="预算">¥{selectedProject.budget.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="已支出">¥{selectedProject.spent.toLocaleString()}</Descriptions.Item>
                <Descriptions.Item label="执行率"><Progress percent={selectedProject.budget ? Math.round((selectedProject.spent / selectedProject.budget) * 100) : 0} /></Descriptions.Item>
                <Descriptions.Item label="起止日期" span={2}>{selectedProject.startDate} ~ {selectedProject.endDate}</Descriptions.Item>
              </Descriptions>
            </Tabs.TabPane>
            <Tabs.TabPane tab="经费看板" key="2">
              <Row gutter={16}>
                <Col span={12}>
                  <Pie data={[{ type: '已使用', value: selectedProject.spent }, { type: '剩余', value: Math.max(0, selectedProject.budget - selectedProject.spent) }]} angleField="value" colorField="type" height={250} />
                </Col>
                <Col span={12}>
                  <Statistic title="总预算" value={`¥${selectedProject.budget.toLocaleString()}`} />
                  <Statistic title="已支出" value={`¥${selectedProject.spent.toLocaleString()}`} valueStyle={{ color: '#ff4d4f' }} />
                  <Statistic title="剩余" value={`¥${(selectedProject.budget - selectedProject.spent).toLocaleString()}`} valueStyle={{ color: '#52c41a' }} />
                </Col>
              </Row>
            </Tabs.TabPane>
            <Tabs.TabPane tab="里程碑" key="3">
              <Timeline mode="left">
                {selectedProject.milestones?.map((m: any) => (
                  <Timeline.Item key={m.id} dot={m.status === 'completed' ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <CalendarOutlined />} label={m.plannedDate}>
                    <p><strong>{m.name}</strong> {m.status === 'completed' && <Tag color="green">已完成</Tag>}</p>
                    {m.actualDate && <p>实际完成: {m.actualDate}</p>}
                    {m.deliverable && <p>交付物: {m.deliverable}</p>}
                  </Timeline.Item>
                ))}
              </Timeline>
            </Tabs.TabPane>
          </Tabs>
        )}
      </Modal>
    </div>
  );
};
