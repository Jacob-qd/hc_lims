import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Typography, Space, Tabs, Progress, Steps, message,
  Form, Input, Select, Row, Col, Statistic, Timeline, Descriptions, Modal, Divider,
  Badge, Result, List,
} from 'antd';
import {
  FileTextOutlined, CloudUploadOutlined, InboxOutlined, DownloadOutlined,
  EyeOutlined, ClockCircleOutlined, BellOutlined, PhoneOutlined, MailOutlined,
  UserOutlined, BankOutlined, SendOutlined, WalletOutlined, GlobalOutlined,
  CheckCircleOutlined, CustomerServiceOutlined, QuestionCircleOutlined,
  SafetyCertificateOutlined, HomeOutlined, SearchOutlined, EditOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const statusMap: Record<string, { color: string; label: string }> = {
  pending: { color: 'default', label: '待确认' },
  received: { color: 'blue', label: '已接收' },
  sampling: { color: 'purple', label: '采样中' },
  testing: { color: 'orange', label: '检测中' },
  completed: { color: 'green', label: '已完成' },
};

const flowSteps = ['委托提交', '样品接收', '采样中', '检测中', '报告出具'];

const testItemTemplates = [
  { value: 'pH', label: 'pH值', price: 40, category: '常规' },
  { value: 'COD', label: 'COD测定', price: 80, category: '常规' },
  { value: 'BOD5', label: 'BOD5测定', price: 120, category: '常规' },
  { value: 'SS', label: '悬浮物', price: 60, category: '常规' },
  { value: 'NH3N', label: '氨氮', price: 100, category: '常规' },
  { value: 'TP', label: '总磷', price: 90, category: '常规' },
  { value: 'TN', label: '总氮', price: 110, category: '常规' },
  { value: 'Pb', label: '铅(Pb)', price: 150, category: '重金属' },
  { value: 'Cd', label: '镉(Cd)', price: 150, category: '重金属' },
  { value: 'Hg', label: '汞(Hg)', price: 180, category: '重金属' },
  { value: 'TVOC', label: 'TVOC', price: 200, category: '有机' },
  { value: '苯系物', label: '苯系物', price: 250, category: '有机' },
  { value: '微生物', label: '微生物', price: 130, category: '微生物' },
];

const mockClientOrders = [
  { id: 'ord1', no: 'WT-2025-001', sample: '地表水样品', sampleCount: 3, items: 'pH, COD, 氨氮', submitDate: '2026-05-15', status: 'testing', progress: 45, amount: 320, paidAmount: 320, estimatedDate: '2026-05-20' },
  { id: 'ord2', no: 'WT-2025-002', sample: '土壤样品', sampleCount: 2, items: '重金属(Pb, Cd)', submitDate: '2026-05-10', status: 'completed', progress: 100, amount: 450, paidAmount: 450, estimatedDate: '2026-05-14' },
  { id: 'ord3', no: 'WT-2025-005', sample: '饮用水样品', sampleCount: 5, items: '余氯, 微生物', submitDate: '2026-05-16', status: 'received', progress: 10, amount: 280, paidAmount: 0, estimatedDate: '2026-05-22' },
  { id: 'ord4', no: 'WT-2025-006', sample: '废水样品', sampleCount: 1, items: 'pH, COD, 重金属', submitDate: '2026-05-17', status: 'pending', progress: 0, amount: 520, paidAmount: 0, estimatedDate: '2026-05-25' },
];

const mockReports = [
  { id: 'rpt1', no: 'RPT20240521001', orderNo: 'WT-2025-002', sample: '土壤检测报告', date: '2026-05-14', status: 'available', size: '2.3MB', signed: false },
  { id: 'rpt2', no: 'RPT20240520022', orderNo: 'WT-2025-001', sample: '地表水检测报告', date: '2026-05-12', status: 'available', size: '1.8MB', signed: true },
];

const mockContracts = [
  { id: 'ct1', no: 'CT-2025-001', name: '年度水质检测服务合同', amount: 50000, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', daysLeft: 228 },
  { id: 'ct2', no: 'CT-2025-002', name: '土壤检测项目合同', amount: 12000, startDate: '2025-03-01', endDate: '2025-06-30', status: 'expiring', daysLeft: 44 },
];

const mockNotifications = [
  { id: 'n1', title: '委托单 WT-2025-001 检测中', desc: '预计 3 天后完成', time: '1小时前', type: 'info', read: false },
  { id: 'n2', title: '报告 RPT20240521001 已生成', desc: '点击下载查看', time: '昨天', type: 'success', read: true },
  { id: 'n3', title: '合同 CT-2025-002 即将到期', desc: '请于到期前联系续约', time: '2天前', type: 'warning', read: false },
];

const mockProfile = {
  companyName: '绿源环保科技有限公司',
  creditLevel: 'A',
  contactName: '王经理',
  phone: '138-0001-1234',
  email: 'wang@lyep.com',
  address: '杭州市西湖区文一路 88 号',
  totalSpent: 128000,
  totalOrders: 24,
};

export const CustomerPortalPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [trackNo, setTrackNo] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [signingReport, setSigningReport] = useState<any>(null);
  const [newOrderForm] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [signName, setSignName] = useState('');
  const [notices, setNotices] = useState(mockNotifications);

  const unreadCount = notices.filter(n => !n.read).length;

  const handleTrack = () => {
    if (!trackNo.trim()) { message.warning('请输入委托单号'); return; }
    const found = mockClientOrders.find(o => o.no === trackNo || o.sample.includes(trackNo));
    if (found) setTrackResult(found);
    else message.warning('未找到匹配的委托单');
  };

  const selectItem = (value: string) => {
    const updated = selectedItems.includes(value)
      ? selectedItems.filter(v => v !== value)
      : [...selectedItems, value];
    setSelectedItems(updated);
    const total = updated.reduce((s, v) => {
      const tpl = testItemTemplates.find(t => t.value === v);
      return s + (tpl?.price || 0);
    }, 0);
    setEstimatedTotal(total);
  };

  const handleSubmit = () => {
    if (selectedItems.length === 0) { message.warning('请选择至少一个检测项目'); return; }
    newOrderForm.validateFields().then(() => {
      message.success({ content: '委托申请已提交！客服将在 1 小时内确认。', duration: 5 });
      setActiveTab('orders');
      newOrderForm.resetFields();
      setSelectedItems([]);
      setEstimatedTotal(0);
    });
  };

  const handleSign = () => {
    if (!signName.trim()) { message.warning('请输入签名人姓名'); return; }
    message.success(`✅ ${signingReport.no} 已签收`);
    setSignOpen(false);
    setSigningReport(null);
    setSignName('');
  };

  const markRead = (id: string) => {
    setNotices(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const stats = {
    totalOrders: mockClientOrders.length,
    activeOrders: mockClientOrders.filter(o => o.status !== 'completed').length,
    reports: mockReports.length,
    totalSpent: mockClientOrders.reduce((s, o) => s + o.amount, 0),
    unpaid: mockClientOrders.reduce((s, o) => s + (o.amount - o.paidAmount), 0),
  };

  const tabItems = [
    {
      key: 'home',
      label: <Space><HomeOutlined />首页</Space>,
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable onClick={() => setActiveTab('orders')} style={{ borderRadius: 12, textAlign: 'center' }}>
                <Statistic title="我的委托" value={stats.totalOrders} prefix={<InboxOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable onClick={() => setActiveTab('orders')} style={{ borderRadius: 12, textAlign: 'center' }}>
                <Statistic title="进行中" value={stats.activeOrders} valueStyle={{ color: '#1677ff' }} prefix={<ClockCircleOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable onClick={() => setActiveTab('reports')} style={{ borderRadius: 12, textAlign: 'center' }}>
                <Statistic title="可下载报告" value={stats.reports} valueStyle={{ color: '#52c41a' }} prefix={<FileTextOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                <Statistic title="累计消费" value={`¥${stats.totalSpent.toLocaleString()}`} valueStyle={{ color: '#722ed1' }} prefix={<WalletOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card style={{ borderRadius: 12, textAlign: 'center' }}>
                <Statistic title="待付款" value={`¥${stats.unpaid}`} valueStyle={{ color: stats.unpaid > 0 ? '#ff4d4f' : '#999' }} prefix={<BankOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={4}>
              <Card hoverable onClick={() => setActiveTab('new')} style={{ borderRadius: 12, textAlign: 'center', background: '#e6f4ff' }}>
                <Statistic title="在线委托" value="立即委托" valueStyle={{ fontSize: 16, color: '#1677ff' }} prefix={<CloudUploadOutlined />} />
              </Card>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Card title={<Space><SearchOutlined />快速查询</Space>} style={{ borderRadius: 12, marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Input.Search
                    placeholder="输入委托单号或样品名称"
                    value={trackNo}
                    onChange={e => setTrackNo(e.target.value)}
                    onSearch={handleTrack}
                    enterButton="查询进度"
                    size="large"
                  />
                  {trackResult && (
                    <Card size="small" style={{ marginTop: 8, borderRadius: 12, background: '#f6f8fa' }}>
                      <Row justify="space-between" align="middle">
                        <Col>
                          <Text strong style={{ fontSize: 16 }}>{trackResult.no}</Text>
                          <br /><Text type="secondary">{trackResult.sample} · {trackResult.items}</Text>
                        </Col>
                        <Col><Tag color={statusMap[trackResult.status]?.color} style={{ fontSize: 14 }}>{statusMap[trackResult.status]?.label}</Tag></Col>
                      </Row>
                      <Progress percent={trackResult.progress} style={{ marginTop: 12 }} />
                      <Steps
                        current={['pending', 'received', 'sampling', 'testing', 'completed'].indexOf(trackResult.status)}
                        size="small"
                        style={{ marginTop: 12 }}
                        items={flowSteps.map(s => ({ title: s }))}
                      />
                      <Button type="link" size="small" onClick={() => { setOrderDetail(trackResult); setDetailOpen(true); }}>查看详情</Button>
                    </Card>
                  )}
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                title={<Space><BellOutlined />通知 {unreadCount > 0 && <Badge count={unreadCount} />}</Space>}
                style={{ borderRadius: 12, marginBottom: 16 }}
                extra={<Button type="link" size="small" onClick={() => setActiveTab('notifications')}>全部</Button>}
              >
                <Timeline items={notices.slice(0, 3).map(n => ({
                  color: n.type === 'success' ? 'green' : n.type === 'warning' ? 'orange' : 'blue',
                  children: (
                    <div style={{ opacity: n.read ? 0.7 : 1 }}>
                      <Text strong>{n.title}</Text>
                      <br /><Text type="secondary">{n.desc}</Text>
                      <br /><Text type="secondary" style={{ fontSize: 11 }}>{n.time}</Text>
                    </div>
                  ),
                }))} />
              </Card>
            </Col>
          </Row>
        </>
      ),
    },
    {
      key: 'orders',
      label: <Space><InboxOutlined />我的委托</Space>,
      children: (
        <Card style={{ borderRadius: 12 }}>
          <Table
            dataSource={mockClientOrders}
            rowKey="id"
            columns={[
              { title: '委托单号', dataIndex: 'no', width: 140 },
              { title: '样品', dataIndex: 'sample', ellipsis: true },
              { title: '数量', dataIndex: 'sampleCount', width: 60 },
              { title: '检测项目', dataIndex: 'items', ellipsis: true },
              { title: '金额', dataIndex: 'amount', width: 100, render: (v: number) => `¥${v}` },
              { title: '提交日期', dataIndex: 'submitDate', width: 110 },
              { title: '预计完成', dataIndex: 'estimatedDate', width: 110 },
              { title: '进度', dataIndex: 'progress', width: 120, render: (p: number) => <Progress percent={p} size="small" /> },
              { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.label}</Tag> },
              { title: '操作', width: 100, render: (_: any, r: any) => (
                <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setOrderDetail(r); setDetailOpen(true); }}>详情</Button>
              )},
            ]}
            pagination={false}
            size="middle"
          />
        </Card>
      ),
    },
    {
      key: 'new',
      label: <Space><CloudUploadOutlined />在线委托</Space>,
      children: (
        <Row justify="center">
          <Col xs={24} md={16}>
            <Card style={{ borderRadius: 12 }} title="提交检测委托">
              <Result status="info" icon={<CloudUploadOutlined />} title="在线委托申请" subTitle="选择检测项目，填写样品信息，提交后客服将在 1 小时内与您确认。" style={{ padding: '12px 0' }} />
              <Form form={newOrderForm} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="contactName" label="联系人" rules={[{ required: true }]}><Input placeholder="姓名" /></Form.Item></Col>
                  <Col span={12}><Form.Item name="contactPhone" label="联系电话" rules={[{ required: true }]}><Input placeholder="手机号" /></Form.Item></Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}><Form.Item name="sampleName" label="样品名称" rules={[{ required: true }]}><Input placeholder="如：工业废水" /></Form.Item></Col>
                  <Col span={12}>
                    <Form.Item name="sampleType" label="样品类型" rules={[{ required: true }]}>
                      <Select placeholder="选择">{['地表水','地下水','废水','土壤','环境空气','固体废物','饮用水'].map(s => <Option key={s} value={s}>{s}</Option>)}</Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="sampleLocation" label="采样地点"><Input placeholder="采样地址" /></Form.Item>

                <Divider>选择检测项目</Divider>
                <Row gutter={[8, 8]}>
                  {testItemTemplates.map((tpl) => {
                    const active = selectedItems.includes(tpl.value);
                    return (
                      <Col key={tpl.value}>
                        <Tag.CheckableTag
                          checked={active}
                          onChange={() => selectItem(tpl.value)}
                          style={{ padding: '6px 14px', borderRadius: 8, fontSize: 13, border: active ? '1px solid #1677ff' : '1px solid #d9d9d9', background: active ? '#e6f4ff' : '#fff', color: active ? '#1677ff' : '#666' }}
                        >
                          {tpl.label} <Text type="secondary" style={{ fontSize: 11 }}>¥{tpl.price}</Text>
                        </Tag.CheckableTag>
                      </Col>
                    );
                  })}
                </Row>

                {selectedItems.length > 0 && (
                  <Card size="small" style={{ marginTop: 16, background: '#f6f8fa', borderRadius: 8 }}>
                    <Row justify="space-between" align="middle">
                      <Col><Text>已选 {selectedItems.length} 项</Text></Col>
                      <Col><Text strong style={{ fontSize: 20, color: '#1677ff' }}>预估 ¥{estimatedTotal}</Text></Col>
                    </Row>
                  </Card>
                )}

                <Form.Item name="remark" label="备注" style={{ marginTop: 16 }}><TextArea rows={2} placeholder="其他说明..." /></Form.Item>
                <Button type="primary" size="large" icon={<SendOutlined />} onClick={handleSubmit} block>提交委托申请</Button>
              </Form>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'reports',
      label: <Space><FileTextOutlined />报告下载</Space>,
      children: (
        <Card style={{ borderRadius: 12 }}>
          <Table
            dataSource={mockReports}
            rowKey="id"
            columns={[
              { title: '报告编号', dataIndex: 'no', width: 180 },
              { title: '关联委托', dataIndex: 'orderNo', width: 140 },
              { title: '报告名称', dataIndex: 'sample', ellipsis: true },
              { title: '生成日期', dataIndex: 'date', width: 120 },
              { title: '大小', dataIndex: 'size', width: 80 },
              { title: '状态', dataIndex: 'status', width: 100, render: (_: any, r: any) => <Tag color={r.signed ? 'green' : 'blue'}>{r.signed ? '已签收' : '可下载'}</Tag> },
              { title: '操作', width: 200, render: (_: any, r: any) => (
                <Space>
                  <Button size="small" icon={<EyeOutlined />} onClick={() => message.info('预览报告')}>预览</Button>
                  <Button type="primary" size="small" icon={<DownloadOutlined />} onClick={() => message.success('报告下载中...')}>下载</Button>
                  {!r.signed && (
                    <Button size="small" icon={<EditOutlined />} onClick={() => { setSigningReport(r); setSignOpen(true); }}>签收</Button>
                  )}
                </Space>
              )},
            ]}
            pagination={false}
            size="middle"
          />
        </Card>
      ),
    },
    {
      key: 'contracts',
      label: <Space><SafetyCertificateOutlined />合同管理</Space>,
      children: (
        <Row gutter={[16, 16]}>
          {mockContracts.map(c => (
            <Col xs={24} sm={12} key={c.id}>
              <Card style={{ borderRadius: 12, borderLeft: `4px solid ${c.status === 'expiring' ? '#faad14' : '#52c41a'}` }}>
                <Row justify="space-between" align="middle" style={{ marginBottom: 8 }}>
                  <Col><Text strong style={{ fontSize: 16 }}>{c.name}</Text></Col>
                  <Col><Tag color={c.status === 'expiring' ? 'orange' : 'green'}>{c.status === 'expiring' ? '即将到期' : '执行中'}</Tag></Col>
                </Row>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text type="secondary">合同编号：{c.no}</Text>
                  <Text type="secondary">金额：¥{c.amount.toLocaleString()}</Text>
                  <Text type="secondary">有效期：{c.startDate} ~ {c.endDate}</Text>
                  {c.status === 'expiring' && <Text type="warning" strong>⚠️ 还剩 {c.daysLeft} 天到期，请联系续约</Text>}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      ),
    },
    {
      key: 'account',
      label: <Space><UserOutlined />账户信息</Space>,
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 12 }} title="公司信息">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="公司名称">{mockProfile.companyName}</Descriptions.Item>
                <Descriptions.Item label="信用等级"><Tag color={mockProfile.creditLevel === 'A' ? 'green' : mockProfile.creditLevel === 'B' ? 'orange' : 'red'}>{mockProfile.creditLevel} 级</Tag></Descriptions.Item>
                <Descriptions.Item label="联系人">{mockProfile.contactName}</Descriptions.Item>
                <Descriptions.Item label="联系电话">{mockProfile.phone}</Descriptions.Item>
                <Descriptions.Item label="邮箱">{mockProfile.email}</Descriptions.Item>
                <Descriptions.Item label="地址">{mockProfile.address}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 12 }} title="统计概览">
              <Row gutter={[16, 16]}>
                <Col span={12}><Card size="small"><Statistic title="累计委托" value={mockProfile.totalOrders} /></Card></Col>
                <Col span={12}><Card size="small"><Statistic title="累计消费" value={`¥${mockProfile.totalSpent.toLocaleString()}`} /></Card></Col>
              </Row>
              <Divider />
              <Space direction="vertical">
                <Text strong><CustomerServiceOutlined /> 客服联系方式</Text>
                <Text><PhoneOutlined /> 400-888-6789</Text>
                <Text><MailOutlined /> service@hc-lims.com</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>工作日 9:00-18:00</Text>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'notifications',
      label: <Space><BellOutlined />消息中心 {unreadCount > 0 && <Badge count={unreadCount} />}</Space>,
      children: (
        <Card style={{ borderRadius: 12 }}>
          <List
            dataSource={notices}
            renderItem={item => (
              <List.Item
                style={{ background: item.read ? 'transparent' : '#f6f8fa', padding: '12px 16px', borderRadius: 8, marginBottom: 8 }}
                actions={!item.read ? [<Button type="link" size="small" onClick={() => markRead(item.id)}>标记已读</Button>] : []}
              >
                <List.Item.Meta
                  avatar={<Badge status={item.type === 'success' ? 'success' : item.type === 'warning' ? 'warning' : 'processing'} />}
                  title={<Text strong style={{ opacity: item.read ? 0.7 : 1 }}>{item.title}</Text>}
                  description={<><Text type="secondary">{item.desc}</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>{item.time}</Text></>}
                />
              </List.Item>
            )}
          />
        </Card>
      ),
    },
    {
      key: 'help',
      label: <Space><QuestionCircleOutlined />帮助中心</Space>,
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 12 }} title="常见问题">
              <Timeline items={[
                { children: <><Text strong>如何提交在线委托？</Text><br /><Text type="secondary">点击「在线委托」标签，选择检测项目并填写样品信息即可。</Text></> },
                { children: <><Text strong>报告多久可以出具？</Text><br /><Text type="secondary">常规项目 3-5 个工作日，重金属项目 5-7 个工作日。</Text></> },
                { children: <><Text strong>如何采样？</Text><br /><Text type="secondary">您可以自行采样后送样，或预约我们的采样服务。</Text></> },
                { children: <><Text strong>支持哪些支付方式？</Text><br /><Text type="secondary">支持银行转账、对公付款，个人客户支持支付宝/微信。</Text></> },
              ]} />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card style={{ borderRadius: 12 }} title="联系客服">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Card size="small"><PhoneOutlined /> 客服热线：400-888-6789</Card>
                <Card size="small"><MailOutlined /> 邮箱：service@hc-lims.com</Card>
                <Card size="small"><ClockCircleOutlined /> 工作时间：工作日 9:00-18:00</Card>
              </Space>
            </Card>
          </Col>
        </Row>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px 40px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* 顶部 Banner */}
      <div style={{
        margin: '0 -16px 24px', padding: '32px 16px',
        background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
        color: '#fff', textAlign: 'center',
      }}>
        <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 28 }}>
          <GlobalOutlined style={{ marginRight: 12 }} />红创检测认证
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 16, display: 'block', marginTop: 8 }}>
          客户自助服务门户 · 在线委托 · 进度追踪 · 报告下载
        </Text>
      </div>

      {/* Tab 导航 */}
      <Card style={{ borderRadius: 12, marginBottom: 24 }} bodyStyle={{ padding: '12px 24px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large" items={tabItems} />
      </Card>

      {/* 委托详情 Modal */}
      <Modal title={`委托单 ${orderDetail?.no}`} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={560}>
        {orderDetail && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="委托单号" span={2}>{orderDetail.no}</Descriptions.Item>
              <Descriptions.Item label="样品" span={2}>{orderDetail.sample}</Descriptions.Item>
              <Descriptions.Item label="检测项目" span={2}>{orderDetail.items}</Descriptions.Item>
              <Descriptions.Item label="金额">¥{orderDetail.amount}</Descriptions.Item>
              <Descriptions.Item label="已付">¥{orderDetail.paidAmount}</Descriptions.Item>
              <Descriptions.Item label="提交日期">{orderDetail.submitDate}</Descriptions.Item>
              <Descriptions.Item label="预计完成">{orderDetail.estimatedDate}</Descriptions.Item>
              <Descriptions.Item label="状态" span={2}><Tag color={statusMap[orderDetail.status]?.color}>{statusMap[orderDetail.status]?.label}</Tag></Descriptions.Item>
            </Descriptions>
            <Divider>进度</Divider>
            <Steps
              current={['pending', 'received', 'sampling', 'testing', 'completed'].indexOf(orderDetail.status)}
              direction="vertical"
              size="small"
              items={[
                { title: '委托提交', description: orderDetail.submitDate },
                { title: '样品接收', description: orderDetail.status !== 'pending' ? '已接收' : '待处理' },
                { title: '检测中', description: ['testing', 'completed'].includes(orderDetail.status) ? '进行中' : '—' },
                { title: '报告出具', description: orderDetail.status === 'completed' ? '已完成' : '—' },
              ]}
            />
            {orderDetail.status === 'completed' && (
              <Button type="primary" block icon={<DownloadOutlined />} style={{ marginTop: 16 }} onClick={() => message.success('报告下载中...')}>
                下载检测报告
              </Button>
            )}
          </>
        )}
      </Modal>

      {/* 电子签收 Modal */}
      <Modal title="报告电子签收" open={signOpen} onCancel={() => setSignOpen(false)} footer={[
        <Button key="cancel" onClick={() => setSignOpen(false)}>取消</Button>,
        <Button key="confirm" type="primary" icon={<CheckCircleOutlined />} onClick={handleSign}>确认签收</Button>,
      ]}>
        {signingReport && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>报告编号：{signingReport.no}</Text>
            <Text>报告名称：{signingReport.sample}</Text>
            <Divider />
            <Text strong>请在下方输入您的姓名进行电子签名确认：</Text>
            <Input placeholder="请输入签名人姓名" value={signName} onChange={e => setSignName(e.target.value)} size="large" />
            <Text type="secondary" style={{ fontSize: 12 }}>签名即表示确认本报告内容真实有效，具有法律效力。</Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};
