import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Typography, Space, Tabs, Row, Col, Statistic,
  Modal, Descriptions, Badge, Progress, Input, Form, message, Divider,
} from 'antd';
import {
  WalletOutlined, DollarOutlined, BankOutlined, FileTextOutlined,
  AlertOutlined, CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const sourceColor: Record<string, string> = {
  national: 'blue', self: 'green', horizontal: 'purple', matching: 'orange', other: 'default',
};
const sourceLabel: Record<string, string> = {
  national: '国拨', self: '自筹', horizontal: '横向', matching: '配套', other: '其他',
};

const mockFunds = [
  {
    id: 'f1', projectNo: 'NSFC-2025-001', projectName: '水体污染物迁移转化机制研究',
    groupId: 'g1', groupName: '环境课题组', source: 'national', totalAmount: 1000000,
    startDate: '2025-01-01', endDate: '2027-12-31', status: 'active',
    budgets: [
      { category: 'equipment', categoryLabel: '设备费', amount: 300000, spent: 280000, remaining: 20000, executionRate: 93 },
      { category: 'material', categoryLabel: '材料费', amount: 200000, spent: 150000, remaining: 50000, executionRate: 75 },
      { category: 'testing', categoryLabel: '测试费', amount: 150000, spent: 120000, remaining: 30000, executionRate: 80 },
      { category: 'travel', categoryLabel: '差旅费', amount: 100000, spent: 80000, remaining: 20000, executionRate: 80 },
      { category: 'labor', categoryLabel: '劳务费', amount: 150000, spent: 150000, remaining: 0, executionRate: 100 },
      { category: 'indirect', categoryLabel: '间接费用', amount: 100000, spent: 70000, remaining: 30000, executionRate: 70 },
    ],
  },
  {
    id: 'f2', projectNo: 'HZ-2025-002', projectName: '土壤修复技术开发',
    groupId: 'g1', groupName: '环境课题组', source: 'horizontal', totalAmount: 500000,
    startDate: '2025-03-01', endDate: '2025-12-31', status: 'active',
    budgets: [
      { category: 'material', categoryLabel: '材料费', amount: 200000, spent: 180000, remaining: 20000, executionRate: 90 },
      { category: 'testing', categoryLabel: '测试费', amount: 150000, spent: 80000, remaining: 70000, executionRate: 53 },
      { category: 'travel', categoryLabel: '差旅费', amount: 50000, spent: 20000, remaining: 30000, executionRate: 40 },
      { category: 'labor', categoryLabel: '劳务费', amount: 100000, spent: 50000, remaining: 50000, executionRate: 50 },
    ],
  },
];

const mockExpenditures = [
  { id: 'e1', fundId: 'f1', projectName: '水体污染物迁移转化机制研究', category: '材料费', amount: 15000, date: '2026-05-10', description: '采购色谱柱', applicantName: '张三', status: 'approved', approvedAt: '2026-05-11' },
  { id: 'e2', fundId: 'f1', projectName: '水体污染物迁移转化机制研究', category: '测试费', amount: 8000, date: '2026-05-08', description: '外送样品检测', applicantName: '李四', status: 'pending' },
  { id: 'e3', fundId: 'f2', projectName: '土壤修复技术开发', category: '材料费', amount: 25000, date: '2026-05-05', description: '修复剂采购', applicantName: '张三', status: 'approved', approvedAt: '2026-05-06' },
];

export const ResearchFundPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<any>(null);
  const [newExpOpen, setNewExpOpen] = useState(false);
  const [newExpForm] = Form.useForm();

  const totalFunds = mockFunds.reduce((s, f) => s + f.totalAmount, 0);
  const totalSpent = mockFunds.reduce((s, f) => s + f.budgets.reduce((bs, b) => bs + b.spent, 0), 0);
  const totalBudgets = mockFunds.reduce((s, f) => s + f.budgets.reduce((bs, b) => bs + b.amount, 0), 0);
  const executionRate = Math.round((totalSpent / totalBudgets) * 100);

  const alerts = mockFunds.flatMap(f =>
    f.budgets.filter(b => b.executionRate >= 95 || b.remaining < b.amount * 0.1).map(b => ({
      projectName: f.projectName,
      category: b.categoryLabel,
      executionRate: b.executionRate,
      type: b.executionRate >= 100 ? 'over_budget' : 'near_budget',
    }))
  );

  const fundColumns = [
    { title: '项目编号', dataIndex: 'projectNo', width: 150 },
    { title: '项目名称', dataIndex: 'projectName', ellipsis: true },
    { title: '课题组', dataIndex: 'groupName', width: 120 },
    { title: '来源', dataIndex: 'source', render: (v: string) => <Tag color={sourceColor[v]}>{sourceLabel[v]}</Tag> },
    { title: '总经费', dataIndex: 'totalAmount', render: (v: number) => `¥${(v / 10000).toFixed(1)}万`, width: 120 },
    { title: '执行率', dataIndex: 'budgets', render: (budgets: any[]) => {
      const spent = budgets.reduce((s, b) => s + b.spent, 0);
      const total = budgets.reduce((s, b) => s + b.amount, 0);
      const rate = Math.round((spent / total) * 100);
      return <Progress percent={rate} size="small" status={rate >= 95 ? 'exception' : 'success'} />;
    }, width: 120 },
    { title: '状态', dataIndex: 'status', render: () => <Badge status="success" text="在研" />, width: 80 },
    { title: '操作', width: 100, render: (_: any, r: any) => (
      <Button type="link" size="small" onClick={() => { setSelectedFund(r); setDetailOpen(true); }}>详情</Button>
    )},
  ];

  const handleNewExp = () => {
    newExpForm.validateFields().then(values => {
      message.success(`支出申请 ¥${values.amount} 已提交`);
      setNewExpOpen(false);
      newExpForm.resetFields();
    });
  };

  const tabItems = [
    {
      key: 'overview',
      label: '经费总览',
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}><Card><Statistic title="总经费" value={`¥${(totalFunds / 10000).toFixed(1)}万`} prefix={<WalletOutlined />} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="已执行" value={`¥${(totalSpent / 10000).toFixed(1)}万`} prefix={<DollarOutlined />} valueStyle={{ color: '#1677ff' }} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="总执行率" value={`${executionRate}%`} prefix={<CheckCircleOutlined />} valueStyle={{ color: executionRate >= 90 ? '#52c41a' : '#faad14' }} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="在研项目" value={mockFunds.length} prefix={<FileTextOutlined />} /></Card></Col>
          </Row>

          {alerts.length > 0 && (
            <Card title={<Space><AlertOutlined />预算预警</Space>} style={{ marginBottom: 24, borderLeft: '4px solid #ff4d4f' }}>
              {alerts.map((a, i) => (
                <Text key={i} style={{ color: a.type === 'over_budget' ? '#ff4d4f' : '#faad14', display: 'block', marginBottom: 8 }}>
                  ⚠️ {a.projectName} — {a.category} 执行率 {a.executionRate}% {a.type === 'over_budget' ? '已超支' : '临近预算'}
                </Text>
              ))}
            </Card>
          )}

          <Card title="项目经费列表" extra={<Button type="primary">新建项目经费</Button>}>
            <Table dataSource={mockFunds} rowKey="id" columns={fundColumns} pagination={false} size="middle" />
          </Card>
        </>
      ),
    },
    {
      key: 'expenditures',
      label: '经费支出',
      children: (
        <Card title="支出记录" extra={<Button type="primary" onClick={() => setNewExpOpen(true)}>新建支出</Button>}>
          <Table
            dataSource={mockExpenditures}
            rowKey="id"
            columns={[
              { title: '项目名称', dataIndex: 'projectName', ellipsis: true },
              { title: '科目', dataIndex: 'category', width: 100 },
              { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v.toLocaleString()}`, width: 120 },
              { title: '日期', dataIndex: 'date', width: 110 },
              { title: '用途', dataIndex: 'description', ellipsis: true },
              { title: '申请人', dataIndex: 'applicantName', width: 100 },
              { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'approved' ? 'green' : v === 'pending' ? 'orange' : 'red'}>{v === 'approved' ? '已审批' : v === 'pending' ? '待审批' : '已驳回'}</Tag> },
              { title: '操作', width: 100, render: (_: any, r: any) => r.status === 'pending' ? (
                <Space><Button type="link" size="small" onClick={() => message.success('已通过')}>通过</Button><Button type="link" size="small" danger onClick={() => message.warning('已驳回')}>驳回</Button></Space>
              ) : '-' },
            ]}
            pagination={false}
            size="middle"
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}><BankOutlined /> 科研经费管理</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal title={selectedFund?.projectName} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}>
        {selectedFund && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="项目编号" span={2}>{selectedFund.projectNo}</Descriptions.Item>
              <Descriptions.Item label="课题组">{selectedFund.groupName}</Descriptions.Item>
              <Descriptions.Item label="经费来源"><Tag color={sourceColor[selectedFund.source]}>{sourceLabel[selectedFund.source]}</Tag></Descriptions.Item>
              <Descriptions.Item label="总经费">¥{selectedFund.totalAmount.toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="已执行">¥{selectedFund.budgets.reduce((s: number, b: any) => s + b.spent, 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="剩余">¥{selectedFund.budgets.reduce((s: number, b: any) => s + b.remaining, 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="执行率">{Math.round(selectedFund.budgets.reduce((s: number, b: any) => s + b.spent, 0) / selectedFund.budgets.reduce((s: number, b: any) => s + b.amount, 0) * 100)}%</Descriptions.Item>
              <Descriptions.Item label="周期">{selectedFund.startDate} ~ {selectedFund.endDate}</Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={5}>预算科目执行情况</Title>
            {selectedFund.budgets.map((b: any) => (
              <Row key={b.category} align="middle" style={{ marginBottom: 12 }}>
                <Col span={6}><Text>{b.categoryLabel}</Text></Col>
                <Col span={12}><Progress percent={b.executionRate} size="small" status={b.executionRate >= 95 ? 'exception' : 'success'} /></Col>
                <Col span={6} style={{ textAlign: 'right' }}>
                  <Text type="secondary">¥{b.spent.toLocaleString()} / ¥{b.amount.toLocaleString()}</Text>
                </Col>
              </Row>
            ))}
          </>
        )}
      </Modal>

      <Modal title="新建支出申请" open={newExpOpen} onCancel={() => setNewExpOpen(false)} onOk={handleNewExp} width={480}>
        <Form form={newExpForm} layout="vertical">
          <Form.Item name="fund" label="关联项目" rules={[{ required: true }]}>
            <Input placeholder="选择项目" />
          </Form.Item>
          <Form.Item name="category" label="预算科目" rules={[{ required: true }]}>
            <Input placeholder="如：材料费" />
          </Form.Item>
          <Form.Item name="amount" label="金额" rules={[{ required: true }]}>
            <Input type="number" prefix="¥" />
          </Form.Item>
          <Form.Item name="description" label="用途说明">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
