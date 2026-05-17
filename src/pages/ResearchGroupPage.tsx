import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Descriptions, Progress, Statistic, Row, Col, message, Popconfirm, Drawer } from 'antd';
import { TeamOutlined, PlusOutlined, DeleteOutlined, EditOutlined, UserOutlined, FundOutlined, ProjectOutlined } from '@ant-design/icons';

interface ResearchGroup {
  id: string; name: string; leaderName: string; researchArea: string;
  memberCount: number; projectCount: number; totalBudget: number; spentBudget: number;
  status: 'active' | 'inactive'; createdAt: string;
}

export const ResearchGroupPage: React.FC = () => {
  const [groups, setGroups] = useState<ResearchGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ResearchGroup | null>(null);
  const [form] = Form.useForm();

  const fetchGroups = () => {
    setLoading(true);
    fetch('/api/v1/research/groups/expanded')
      .then(r => r.json())
      .then(res => { if (res.code === 200) setGroups(res.data.list); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleDelete = (id: string) => {
    fetch(`/api/v1/research/groups/${id}`, { method: 'DELETE' })
      .then(() => { message.success('删除成功'); fetchGroups(); });
  };

  const handleSubmit = async (values: any) => {
    const url = selectedGroup ? `/api/v1/research/groups/${selectedGroup.id}` : '/api/v1/research/groups';
    const method = selectedGroup ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const data = await res.json();
    if (data.code === 200) { message.success(selectedGroup ? '更新成功' : '创建成功'); setModalOpen(false); form.resetFields(); fetchGroups(); }
  };

  const columns = [
    { title: '团队名称', dataIndex: 'name', render: (v: string, r: ResearchGroup) => <Button type="link" onClick={() => { setSelectedGroup(r); setDrawerOpen(true); }}>{v}</Button> },
    { title: '负责人', dataIndex: 'leaderName' },
    { title: '研究方向', dataIndex: 'researchArea', ellipsis: true },
    { title: '成员', dataIndex: 'memberCount', render: (v: number) => <Tag icon={<UserOutlined />}>{v}人</Tag> },
    { title: '项目', dataIndex: 'projectCount', render: (v: number) => <Tag icon={<ProjectOutlined />}>{v}个</Tag> },
    { title: '经费执行率', render: (_: any, r: ResearchGroup) => <Progress percent={r.totalBudget ? Math.round((r.spentBudget / r.totalBudget) * 100) : 0} size="small" /> },
    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '活跃' : '归档'}</Tag> },
    { title: '操作', render: (_: any, r: ResearchGroup) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setSelectedGroup(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}><Button size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}><Card><Statistic title="团队总数" value={groups.length} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="活跃团队" value={groups.filter(g => g.status === 'active').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="总经费" value={`¥${(groups.reduce((s, g) => s + g.totalBudget, 0) / 10000).toFixed(1)}万`} prefix={<FundOutlined />} /></Card></Col>
        <Col xs={24} sm={6}><Card><Statistic title="经费执行率" value={`${groups.reduce((s, g) => s + g.totalBudget, 0) ? Math.round((groups.reduce((s, g) => s + g.spentBudget, 0) / groups.reduce((s, g) => s + g.totalBudget, 0)) * 100) : 0}%`} /></Card></Col>
      </Row>
      <Card title="科研团队管理"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedGroup(null); form.resetFields(); setModalOpen(true); }}>新建团队</Button>}>
        <Table dataSource={groups} rowKey="id" columns={columns} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>
      <Modal title={selectedGroup ? '编辑团队' : '新建团队'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="团队名称" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="leaderName" label="负责人" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="researchArea" label="研究方向" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]} > <Input placeholder="active 或 inactive" /> </Form.Item>
        </Form>
      </Modal>
      <Drawer title="团队详情" width={560} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        {selectedGroup && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="团队名称">{selectedGroup.name}</Descriptions.Item>
            <Descriptions.Item label="负责人">{selectedGroup.leaderName}</Descriptions.Item>
            <Descriptions.Item label="研究方向">{selectedGroup.researchArea}</Descriptions.Item>
            <Descriptions.Item label="成员数">{selectedGroup.memberCount} 人</Descriptions.Item>
            <Descriptions.Item label="在研项目">{selectedGroup.projectCount} 个</Descriptions.Item>
            <Descriptions.Item label="总经费">¥{selectedGroup.totalBudget.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="已使用">¥{selectedGroup.spentBudget.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="执行率"><Progress percent={selectedGroup.totalBudget ? Math.round((selectedGroup.spentBudget / selectedGroup.totalBudget) * 100) : 0} /></Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={selectedGroup.status === 'active' ? 'green' : 'default'}>{selectedGroup.status === 'active' ? '活跃' : '归档'}</Tag></Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};
