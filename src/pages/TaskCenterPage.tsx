import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Tabs, Badge, Modal, Form, Input, Select, message, Space, Avatar, Descriptions
} from 'antd';
import {
  CheckCircleOutlined, ClockCircleOutlined, MailOutlined,
  SwapOutlined, EyeOutlined, ApartmentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const api = (path: string) => `/api/v1${path}`;

type TaskStatus = 'pending' | 'approved' | 'rejected' | 'transferred';
type TaskType = 'pending' | 'done' | 'cc';

interface WFTask {
  id: string;
  instanceId: string;
  defName: string;
  nodeId: string;
  nodeName: string;
  businessSummary: string;
  assignee: string;
  status: TaskStatus;
  action?: string;
  comment?: string;
  createdAt: string;
  actedAt?: string;
  deadline?: string;
  type: TaskType;
}

const statusMap: Record<string, { text: string; color: string }> = {
  pending: { text: '待处理', color: 'processing' },
  approved: { text: '已通过', color: 'success' },
  rejected: { text: '已驳回', color: 'error' },
  transferred: { text: '已转交', color: 'warning' },
};

export const TaskCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TaskType>('pending');
  const [tasks, setTasks] = useState<WFTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<WFTask | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveForm] = Form.useForm();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectForm] = Form.useForm();
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferForm] = Form.useForm();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const fetchTasks = useCallback(async (type: TaskType) => {
    setLoading(true);
    try {
      const res = await fetch(api(`/workflow/tasks?type=${type}`));
      const json = await res.json();
      setTasks(json.data?.list || []);
    } catch {
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(activeTab);
  }, [activeTab, fetchTasks]);

  const handleApprove = async () => {
    if (!selectedTaskId) return;
    const values = await approveForm.validateFields();
    try {
      const res = await fetch(api(`/workflow/tasks/${selectedTaskId}/approve`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('审批通过');
        setApproveOpen(false);
        approveForm.resetFields();
        setSelectedTaskId(null);
        fetchTasks(activeTab);
      }
    } catch {
      message.error('审批失败');
    }
  };

  const handleReject = async () => {
    if (!selectedTaskId) return;
    const values = await rejectForm.validateFields();
    try {
      const res = await fetch(api(`/workflow/tasks/${selectedTaskId}/reject`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('已驳回');
        setRejectOpen(false);
        rejectForm.resetFields();
        setSelectedTaskId(null);
        fetchTasks(activeTab);
      }
    } catch {
      message.error('驳回失败');
    }
  };

  const handleTransfer = async () => {
    if (!selectedTaskId) return;
    const values = await transferForm.validateFields();
    try {
      const res = await fetch(api(`/workflow/tasks/${selectedTaskId}/transfer`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('转交成功');
        setTransferOpen(false);
        transferForm.resetFields();
        setSelectedTaskId(null);
        fetchTasks(activeTab);
      }
    } catch {
      message.error('转交失败');
    }
  };

  const openDetail = (task: WFTask) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const isOverdue = (deadline?: string) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  const columns = [
    {
      title: '任务',
      dataIndex: 'businessSummary',
      render: (v: string, r: WFTask) => (
        <div>
          <Text strong>{v || r.defName}</Text>
          <div style={{ fontSize: 12, color: '#666' }}>
            {r.defName} → {r.nodeName}
          </div>
        </div>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 100,
      render: (t: TaskType) => {
        const map: Record<string, { icon: React.ReactNode; text: string; color: string }> = {
          pending: { icon: <ClockCircleOutlined />, text: '审批', color: 'blue' },
          done: { icon: <CheckCircleOutlined />, text: '已办', color: 'green' },
          cc: { icon: <MailOutlined />, text: '抄送', color: 'cyan' },
        };
        const m = map[t] || map.pending;
        return <Tag color={m.color}>{m.icon} {m.text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s: TaskStatus) => <Badge status={statusMap[s]?.color as any} text={statusMap[s]?.text} />,
    },
    {
      title: '处理人',
      dataIndex: 'assignee',
      width: 120,
      render: (v: string) => (
        <Space>
          <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>{v?.[0]}</Avatar>
          <Text>{v}</Text>
        </Space>
      ),
    },
    {
      title: '截止时间',
      dataIndex: 'deadline',
      width: 160,
      render: (v?: string) => {
        if (!v) return <Text type="secondary">-</Text>;
        const overdue = isOverdue(v);
        return <Text type={overdue ? 'danger' : 'secondary'}>{overdue ? '已超时 ' : ''}{v}</Text>;
      },
    },
    {
      title: '收到时间',
      dataIndex: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      width: 220,
      render: (_: any, r: WFTask) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)}>
            详情
          </Button>
          {r.type === 'pending' && (
            <>
              <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => { setSelectedTaskId(r.id); setApproveOpen(true); }}>
                通过
              </Button>
              <Button type="link" size="small" danger icon={<ClockCircleOutlined />} onClick={() => { setSelectedTaskId(r.id); setRejectOpen(true); }}>
                驳回
              </Button>
              <Button type="link" size="small" icon={<SwapOutlined />} onClick={() => { setSelectedTaskId(r.id); setTransferOpen(true); }}>
                转交
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'pending',
      label: (
        <span>
          <ClockCircleOutlined /> 待办任务
          <Badge count={tasks.length} style={{ marginLeft: 8 }} showZero={false} />
        </span>
      ),
    },
    {
      key: 'done',
      label: (
        <span>
          <CheckCircleOutlined /> 已办任务
        </span>
      ),
    },
    {
      key: 'cc',
      label: (
        <span>
          <MailOutlined /> 抄送我的
        </span>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <ApartmentOutlined /> 任务中心
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <ClockCircleOutlined style={{ fontSize: 28, color: '#1890ff' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>待办任务</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                  {tasks.filter(t => t.type === 'pending').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CheckCircleOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>今日已办</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                  {tasks.filter(t => t.type === 'done').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MailOutlined style={{ fontSize: 28, color: '#13c2c2' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>抄送我的</Text>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#13c2c2' }}>
                  {tasks.filter(t => t.type === 'cc').length}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as TaskType)} items={tabItems} />
        <Table
          dataSource={tasks}
          rowKey="id"
          loading={loading}
          size="middle"
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* Task Detail Modal */}
      <Modal
        title="任务详情"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="close" onClick={() => setDetailOpen(false)}>关闭</Button>,
        ]}
        width={600}
      >
        {detailTask && (
          <>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="流程">{detailTask.defName}</Descriptions.Item>
              <Descriptions.Item label="节点">{detailTask.nodeName}</Descriptions.Item>
              <Descriptions.Item label="业务摘要">{detailTask.businessSummary}</Descriptions.Item>
              <Descriptions.Item label="处理人">{detailTask.assignee}</Descriptions.Item>
              <Descriptions.Item label="状态">
                <Badge status={statusMap[detailTask.status]?.color as any} text={statusMap[detailTask.status]?.text} />
              </Descriptions.Item>
              <Descriptions.Item label="收到时间">{detailTask.createdAt}</Descriptions.Item>
              {detailTask.deadline && (
                <Descriptions.Item label="截止时间">
                  <Text type={isOverdue(detailTask.deadline) ? 'danger' : undefined}>{detailTask.deadline}</Text>
                </Descriptions.Item>
              )}
              {detailTask.actedAt && (
                <Descriptions.Item label="处理时间">{detailTask.actedAt}</Descriptions.Item>
              )}
              {detailTask.comment && (
                <Descriptions.Item label="审批意见">{detailTask.comment}</Descriptions.Item>
              )}
            </Descriptions>
          </>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="审批通过"
        open={approveOpen}
        onOk={handleApprove}
        onCancel={() => { setApproveOpen(false); approveForm.resetFields(); setSelectedTaskId(null); }}
      >
        <Form form={approveForm} layout="vertical">
          <Form.Item name="comment" label="审批意见">
            <TextArea rows={3} placeholder="请输入审批意见（可选）" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="驳回"
        open={rejectOpen}
        onOk={handleReject}
        onCancel={() => { setRejectOpen(false); rejectForm.resetFields(); setSelectedTaskId(null); }}
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item name="comment" label="驳回原因" rules={[{ required: true, message: '请输入驳回原因' }]}>
            <TextArea rows={3} placeholder="请输入驳回原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Transfer Modal */}
      <Modal
        title="转交任务"
        open={transferOpen}
        onOk={handleTransfer}
        onCancel={() => { setTransferOpen(false); transferForm.resetFields(); setSelectedTaskId(null); }}
      >
        <Form form={transferForm} layout="vertical">
          <Form.Item name="assignee" label="新处理人" rules={[{ required: true, message: '请选择处理人' }]}>
            <Select placeholder="选择处理人">
              <Option value="张伟">张伟</Option>
              <Option value="李思">李思</Option>
              <Option value="王强">王强</Option>
              <Option value="李明">李明</Option>
            </Select>
          </Form.Item>
          <Form.Item name="comment" label="转交说明">
            <TextArea rows={2} placeholder="请输入转交说明（可选）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
