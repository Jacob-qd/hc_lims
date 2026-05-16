import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Badge, Modal, Form, Input, Select, message, Timeline } from 'antd';
import { PlusOutlined, ApartmentOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const mockWorkflows = [
  { id: 'wf1', name: '样品检测流程', nodes: 5, type: '检测', status: 'active', used: 128 },
  { id: 'wf2', name: '报告审核流程', nodes: 3, type: '报告', status: 'active', used: 95 },
  { id: 'wf3', name: '采购审批流程', nodes: 4, type: '采购', status: 'active', used: 32 },
  { id: 'wf4', name: '偏差处理流程', nodes: 4, type: '质量', status: 'draft', used: 0 },
];

const mockInstances = [
  { id: 'i1', workflow: '样品检测流程', sample: 'SMP20240521001', step: '检测中', assignee: '张伟', startTime: '2024-05-21 09:00', status: 'running' },
  { id: 'i2', workflow: '报告审核流程', report: 'RPT20240521001', step: '技术审核', assignee: '王强', startTime: '2024-05-21 10:00', status: 'running' },
  { id: 'i3', workflow: '采购审批流程', pr: 'PR-2025-001', step: '部门审批', assignee: '李明', startTime: '2024-05-20', status: 'running' },
];

export const WorkflowPage: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [wfForm] = Form.useForm();

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}><ApartmentOutlined /> 工作流引擎</Title>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="流程模板" value={mockWorkflows.length} prefix={<ApartmentOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="运行中实例" value={mockInstances.filter(i => i.status === 'running').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已完成" value={256} valueStyle={{ color: '#1677ff' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="待处理" value={3} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="templates" items={[
        { key: 'templates', label: '流程模板', children: <Card extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>新建流程</Button>}>
          <Table dataSource={mockWorkflows} rowKey="id" columns={[
            { title: '流程名称', dataIndex: 'name', render: (n: string) => <a>{n}</a> },
            { title: '审批节点数', dataIndex: 'nodes', render: (n: number) => <Tag>{n}个节点</Tag> },
            { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color="blue">{t}</Tag> },
            { title: '已使用次数', dataIndex: 'used' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'active' ? 'success' : 'default'} text={s === 'active' ? '已启用' : '草稿'} /> },
            { title: '操作', render: () => <Space><Button type="link" size="small">编辑</Button><Button type="link" size="small">部署</Button></Space> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'instances', label: '运行中实例', children: <Card>
          <Table dataSource={mockInstances} rowKey="id" columns={[
            { title: '流程', dataIndex: 'workflow' },
            { title: '关联业务', dataIndex: 'sample', render: (_: string, r: any) => r.sample || r.report || r.pr },
            { title: '当前步骤', dataIndex: 'step', render: (step: string) => <Tag color="blue">{step}</Tag> },
            { title: '处理人', dataIndex: 'assignee' },
            { title: '开始时间', dataIndex: 'startTime' },
            { title: '状态', dataIndex: 'status', render: () => <Badge status="processing" text="运行中" /> },
          ]} pagination={false} size="middle" />
          <Timeline style={{marginTop:16}} items={[
            {color:'green', children:'样品接收 → 任务分配 → 检测中 → 数据审核 → 报告生成'},
          ]} />
        </Card>},
      ]} />

      <Modal title="新建流程模板" open={createVisible} onOk={() => wfForm.submit()} onCancel={() => { setCreateVisible(false); wfForm.resetFields(); }}>
        <Form form={wfForm} layout="vertical" onFinish={() => { message.success('流程模板创建成功'); setCreateVisible(false); }}>
          <Form.Item name="name" label="流程名称" required><Input placeholder="如: 样品检测流程" /></Form.Item>
          <Form.Item name="type" label="流程类型"><Select><Select.Option value="检测">检测</Select.Option><Select.Option value="报告">报告</Select.Option><Select.Option value="采购">采购</Select.Option><Select.Option value="质量">质量</Select.Option></Select></Form.Item>
          <Form.Item name="nodes" label="审批节点"><Select mode="multiple" placeholder="选择审批节点">
            {['申请','部门审批','质量审批','批准'].map(n => <Select.Option key={n}>{n}</Select.Option>)}
          </Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
