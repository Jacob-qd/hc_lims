import React, { useState, useCallback } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Badge, Modal, Form, Input, Select, message, Timeline, Descriptions, List, Avatar, Dropdown } from 'antd';
import { PlusOutlined, ApartmentOutlined, CheckCircleOutlined, ClockCircleOutlined, BranchesOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined, UserOutlined, SwapOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

// ---- Mock Data ----
const mockDefinitions = [
  { id: 'wf1', name: '样品检测流程', version: 'v3.2', nodes: 6, type: '检测', status: 'active', used: 128, desc: '样品接收→分配→检测→审核→报告' },
  { id: 'wf2', name: '报告审核签发流程', version: 'v2.1', nodes: 4, type: '报告', status: 'active', used: 95, desc: '编制→技术审核→批准→签发' },
  { id: 'wf3', name: '采购审批流程', version: 'v1.5', nodes: 5, type: '采购', status: 'active', used: 32, desc: '申请→部门审批→质量确认→财务审批→采购' },
  { id: 'wf4', name: '偏差/OOS处理流程', version: 'v1.0', nodes: 6, type: '质量', status: 'draft', used: 0, desc: '发现→评估→调查→CAPA→验证→关闭' },
  { id: 'wf5', name: '仪器校准流程', version: 'v2.0', nodes: 4, type: '设备', status: 'active', used: 18, desc: '申请→外部校准→验证→确认' },
];

const mockInstances = [
  { id: 'i1', workflow: '样品检测流程', businessId: 'SMP20240521001', currentNode: '检测中', assignee: '张伟', startTime: '2024-05-21 09:00', deadline: '2024-05-25 18:00', status: 'running', priority: 'normal' },
  { id: 'i2', workflow: '报告审核签发流程', businessId: 'RPT20240521001', currentNode: '技术审核', assignee: '王强', startTime: '2024-05-21 10:00', deadline: '2024-05-23 18:00', status: 'running', priority: 'high' },
  { id: 'i3', workflow: '采购审批流程', businessId: 'PR-2025-001', currentNode: '部门审批', assignee: '李明', startTime: '2024-05-20', deadline: '2024-05-27', status: 'running', priority: 'normal' },
  { id: 'i4', workflow: '报告审核签发流程', businessId: 'RPT20240520005', currentNode: '已签发', assignee: '-', startTime: '2024-05-20 14:00', completedAt: '2024-05-21 16:00', status: 'completed', priority: 'normal' },
  { id: 'i5', workflow: '偏差/OOS处理流程', businessId: 'DEV-2024-012', currentNode: '调查中', assignee: '赵丽', startTime: '2024-05-19', deadline: '2024-06-02', status: 'running', priority: 'urgent' },
];

const mockTasks = [
  { id: 't1', type: '待办', instanceId: 'i2', title: '技术审核: RPT20240521001', workflow: '报告审核签发流程', from: '李思(编制人)', deadline: '2024-05-23 18:00', priority: 'high' },
  { id: 't2', type: '待办', instanceId: 'i3', title: '部门审批: PR-2025-001', workflow: '采购审批流程', from: '张伟(申请人)', deadline: '2024-05-27', priority: 'normal' },
  { id: 't3', type: '已办', instanceId: 'i4', title: '批准: RPT20240520005', workflow: '报告审核签发流程', action: '通过', time: '2024-05-21 16:00' },
  { id: 't4', type: '抄送', instanceId: 'i5', title: '偏差处理: DEV-2024-012 进入调查阶段', workflow: '偏差/OOS处理流程', time: '2024-05-19 14:00' },
];

// ---- Visual Workflow Designer (simplified SVG) ----
const DesignerNode: React.FC<{ label: string; type: string; x: number; y: number; active?: boolean }> = ({ label, type, x, y, active }) => {
  const colors: Record<string, string> = { start: '#52c41a', approval: '#1677ff', condition: '#faad14', end: '#ff4d4f', parallel: '#722ed1', notification: '#13c2c2', timer: '#fa8c16' };
  const color = colors[type] || '#1677ff';
  return (
    <g>
      <rect x={x} y={y} width={120} height={48} rx={type === 'start' || type === 'end' ? 24 : 6} fill={active ? color : '#fff'} stroke={color} strokeWidth={2} />
      <text x={x + 60} y={y + 28} textAnchor="middle" fill={active ? '#fff' : '#333'} fontSize={12} fontWeight={500}>{label}</text>
    </g>
  );
};

const WorkflowDesigner: React.FC<{ definition?: any }> = ({ definition }) => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);
  const nodes = [
    { id: 'start', label: '开始', type: 'start', x: 30, y: 60 },
    { id: 'node1', label: '样品接收', type: 'approval', x: 30, y: 140 },
    { id: 'node2', label: '任务分配', type: 'approval', x: 30, y: 220 },
    { id: 'condition1', label: '需要复检?', type: 'condition', x: 30, y: 300 },
    { id: 'node3a', label: '复检', type: 'approval', x: 200, y: 300 },
    { id: 'node3b', label: '审核', type: 'approval', x: 30, y: 380 },
    { id: 'end', label: '结束', type: 'end', x: 30, y: 460 },
  ];

  const edges = [
    { from: 'start', to: 'node1' },
    { from: 'node1', to: 'node2' },
    { from: 'node2', to: 'condition1' },
    { from: 'condition1', to: 'node3a', label: '是' },
    { from: 'node3a', to: 'node3b' },
    { from: 'condition1', to: 'node3b', label: '否' },
    { from: 'node3b', to: 'end' },
  ];

  return (
    <div style={{ background: '#fafafa', borderRadius: 8, padding: 16, overflow: 'auto' }}>
      <div style={{ marginBottom: 8 }}><Text strong>流程设计器</Text> <Tag color="blue">拖拽节点进行设计</Tag></div>
      <svg width="100%" height="540" style={{ background: '#fff', borderRadius: 8, border: '1px dashed #d9d9d9' }}>
        {/* Grid */}
        <defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="540" fill="url(#grid)" />
        {/* Edges */}
        {edges.map((e, i) => {
          const fromNode = nodes.find(n => n.id === e.from)!;
          const toNode = nodes.find(n => n.id === e.to)!;
          const midY = (fromNode.y + 48 + toNode.y) / 2;
          return (
            <g key={i}>
              <line x1={fromNode.x + 60} y1={fromNode.y + 48} x2={toNode.x + 60} y2={toNode.y} stroke="#bbb" strokeWidth={1.5} markerEnd="url(#arrow)" />
              {e.label && <text x={fromNode.x + 80} y={midY} fill="#999" fontSize={11}>{e.label}</text>}
            </g>
          );
        })}
        <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#bbb" /></marker></defs>
        {nodes.map((n, i) => (
          <g key={n.id} onClick={() => setSelectedNode(i)} style={{ cursor: 'pointer' }}>
            <DesignerNode label={n.label} type={n.type} x={n.x} y={n.y} active={selectedNode === i} />
          </g>
        ))}
      </svg>
      {selectedNode !== null && (
        <Card size="small" style={{ marginTop: 8 }} title={`节点属性: ${nodes[selectedNode].label}`}>
          <Form layout="inline" size="small">
            <Form.Item label="审批人"><Select defaultValue="role" style={{ width: 150 }} options={[{ value: 'role', label: '技术负责人' }, { value: 'user', label: '指定用户' }]} /></Form.Item>
            <Form.Item label="超时(h)"><Input style={{ width: 80 }} defaultValue="24" /></Form.Item>
            <Form.Item label="超时策略"><Select defaultValue="notify" style={{ width: 130 }} options={[{ value: 'notify', label: '通知升级' }, { value: 'transfer', label: '自动转交' }, { value: 'auto', label: '自动通过' }]} /></Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export const WorkflowPage: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [designerVisible, setDesignerVisible] = useState(false);
  const [wfForm] = Form.useForm();

  const taskActions = (task: any) => {
    if (task.type === '待办') {
      return (
        <Space size="small">
          <Button size="small" type="primary" onClick={() => message.success('已通过')}>通过</Button>
          <Button size="small" danger onClick={() => {
            Modal.confirm({ title: '驳回', content: <Input.TextArea placeholder="驳回理由" />, onOk: () => message.success('已驳回') });
          }}>驳回</Button>
          <Button size="small" onClick={() => message.success('已转办')}>转办</Button>
        </Space>
      );
    }
    if (task.type === '抄送') return <Button size="small" type="link">已读</Button>;
    return <Tag color="green">{task.action}</Tag>;
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}><ApartmentOutlined /> 工作流引擎</Title>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="流程模板" value={mockDefinitions.length} prefix={<BranchesOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="运行中实例" value={mockInstances.filter(i => i.status === 'running').length} valueStyle={{ color: '#1677ff' }} prefix={<PlayCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已完成" value={256} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="待处理任务" value={mockTasks.filter(t => t.type === '待办').length} valueStyle={{ color: '#faad14' }} prefix={<ClockCircleOutlined />} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="tasks" items={[
        {
          key: 'tasks', label: <span><ClockCircleOutlined /> 待办/已办</span>, children: <Card>
            <Tabs size="small" items={[
              { key: 'todo', label: `待办 (${mockTasks.filter(t => t.type === '待办').length})`, children: <List dataSource={mockTasks.filter(t => t.type === '待办')} renderItem={t => (
                <List.Item extra={taskActions(t)}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} style={{ background: t.priority === 'high' ? '#ff4d4f' : t.priority === 'urgent' ? '#faad14' : '#1677ff' }} />}
                    title={<Space>{t.title} {t.priority === 'urgent' && <Tag color="red">紧急</Tag>} {t.priority === 'high' && <Tag color="orange">高优</Tag>}</Space>}
                    description={<Text type="secondary">来自: {t.from} | 流程: {t.workflow} | 截止: {t.deadline}</Text>}
                  />
                </List.Item>
              )} /> },
              { key: 'done', label: `已办 (${mockTasks.filter(t => t.type === '已办').length})`, children: <List dataSource={mockTasks.filter(t => t.type === '已办')} renderItem={t => (
                <List.Item><List.Item.Meta title={t.title} description={`${t.action} · ${t.time}`} /></List.Item>
              )} /> },
              { key: 'cc', label: `抄送 (${mockTasks.filter(t => t.type === '抄送').length})`, children: <List dataSource={mockTasks.filter(t => t.type === '抄送')} renderItem={t => (
                <List.Item extra={taskActions(t)}><List.Item.Meta title={t.title} description={t.time} /></List.Item>
              )} /> },
            ]} />
          </Card>
        },
        {
          key: 'definitions', label: '流程模板', children: <Card extra={<Space><Button icon={<PlusOutlined />} onClick={() => setDesignerVisible(true)}>可视化设计</Button><Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>新建流程</Button></Space>}>
            <Table dataSource={mockDefinitions} rowKey="id" columns={[
              { title: '流程名称', dataIndex: 'name', render: (n: string) => <a onClick={() => setDesignerVisible(true)}>{n}</a> },
              { title: '版本', dataIndex: 'version', render: (v: string) => <Tag>{v}</Tag> },
              { title: '节点数', dataIndex: 'nodes', render: (n: number) => <Tag color="blue">{n}个节点</Tag> },
              { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
              { title: '使用次数', dataIndex: 'used' },
              { title: '描述', dataIndex: 'desc', ellipsis: true },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'active' ? 'success' : 'default'} text={s === 'active' ? '已发布' : '草稿'} /> },
              { title: '操作', render: () => <Space size="small">
                <Button type="link" size="small" onClick={() => setDesignerVisible(true)}>设计</Button>
                <Dropdown menu={{ items: [{ key: 'publish', label: '发布' }, { key: 'clone', label: '克隆' }, { key: 'history', label: '版本历史' }, { key: 'delete', label: '删除', danger: true }] }}><Button type="link" size="small">更多</Button></Dropdown>
              </Space> },
            ]} pagination={false} size="middle" />
          </Card>
        },
        {
          key: 'instances', label: '流程实例', children: <Card>
            <Table dataSource={mockInstances} rowKey="id" columns={[
              { title: '流程', dataIndex: 'workflow' },
              { title: '业务ID', dataIndex: 'businessId', render: (id: string) => <code>{id}</code> },
              { title: '当前节点', dataIndex: 'currentNode', render: (n: string) => <Tag color={n === '已签发' ? 'green' : 'blue'}>{n}</Tag> },
              { title: '处理人', dataIndex: 'assignee' },
              { title: '开始时间', dataIndex: 'startTime' },
              { title: '截止时间', dataIndex: 'deadline', render: (d: string) => d || '-' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'running' ? 'processing' : 'success'} text={s === 'running' ? '运行中' : '已完成'} /> },
              { title: '操作', render: (_: any, r: any) => r.status === 'running' ? (
                <Space size="small"><Button type="link" size="small">查看</Button><Button type="link" size="small" danger onClick={() => message.warning('已终止')}>终止</Button></Space>
              ) : <Button type="link" size="small">查看详情</Button> },
            ]} pagination={false} size="middle" />
          </Card>
        },
        {
          key: 'monitor', label: '流程监控', children: <Card>
            <Descriptions bordered size="small" column={3} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="总实例数">380</Descriptions.Item>
              <Descriptions.Item label="平均完成时间">18.5小时</Descriptions.Item>
              <Descriptions.Item label="超时率">3.2%</Descriptions.Item>
              <Descriptions.Item label="驳回率">8.1%</Descriptions.Item>
              <Descriptions.Item label="转办率">2.4%</Descriptions.Item>
              <Descriptions.Item label="自动通过率">1.2%</Descriptions.Item>
            </Descriptions>
            <Timeline items={[
              { color: 'green', children: '报告审核签发流程 — 平均耗时 6.5h (目标<8h) ✅' },
              { color: 'green', children: '样品检测流程 — 平均耗时 22.3h (目标<48h) ✅' },
              { color: 'orange', children: '偏差处理流程 — 平均耗时 96h (目标<72h) ⚠️ 需优化' },
              { color: 'red', children: '采购审批流程 — 平均耗时 58h (目标<24h) 🔴 严重超时' },
            ]} />
          </Card>
        },
      ]} />

      {/* Create workflow modal */}
      <Modal title="新建流程模板" open={createVisible} onOk={() => wfForm.submit()} onCancel={() => { setCreateVisible(false); wfForm.resetFields(); }}>
        <Form form={wfForm} layout="vertical" onFinish={() => { message.success('流程模板创建成功'); setCreateVisible(false); }}>
          <Form.Item name="name" label="流程名称" required><Input placeholder="如: 样品检测流程" /></Form.Item>
          <Form.Item name="type" label="流程类型"><Select options={[
            { value: '检测', label: '检测流程' }, { value: '报告', label: '报告审批' },
            { value: '采购', label: '采购审批' }, { value: '质量', label: '质量控制' },
            { value: '设备', label: '设备管理' },
          ]} /></Form.Item>
          <Form.Item name="desc" label="描述"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>

      {/* Visual Designer Modal */}
      <Modal title="可视化流程设计器" open={designerVisible} onCancel={() => setDesignerVisible(false)} width={800} footer={<Space><Button onClick={() => setDesignerVisible(false)}>取消</Button><Button type="primary" onClick={() => { message.success('流程设计已保存'); setDesignerVisible(false); }}>保存设计</Button></Space>}>
        <WorkflowDesigner />
      </Modal>
    </div>
  );
};
