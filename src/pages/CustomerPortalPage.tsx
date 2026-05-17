import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Typography, Space, Tabs, Progress, Steps, message,
  Form, Input, Select, Row, Col, Statistic, Timeline, Descriptions, Modal, Divider,
  Badge,
} from 'antd';
import {
  FileTextOutlined, CloudUploadOutlined, InboxOutlined, DownloadOutlined,
  EyeOutlined, ClockCircleOutlined, BellOutlined, PhoneOutlined, MailOutlined,
  UserOutlined, BankOutlined, SendOutlined, WalletOutlined, GlobalOutlined,
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

/** 取样项目模板 */
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

/** 模拟客户数据 */
const mockClientOrders = [
  { id: 'ord1', no: 'WT-2025-001', sample: '地表水样品', items: 'pH, COD, 氨氮', submitDate: '2026-05-15', status: 'testing', progress: 45, amount: 320, paidAmount: 320 },
  { id: 'ord2', no: 'WT-2025-002', sample: '土壤样品', items: '重金属(Pb, Cd)', submitDate: '2026-05-10', status: 'completed', progress: 100, amount: 450, paidAmount: 450 },
  { id: 'ord3', no: 'WT-2025-005', sample: '饮用水样品', items: '余氯, 微生物', submitDate: '2026-05-16', status: 'received', progress: 10, amount: 280, paidAmount: 0 },
];

const mockReports = [
  { id: 'rpt1', no: 'RPT20240521001', sample: '地表水检测报告', date: '2026-05-14', status: 'available', size: '2.3MB' },
  { id: 'rpt2', no: 'RPT20240520022', sample: '土壤检测报告', date: '2026-05-12', status: 'available', size: '1.8MB' },
];

const mockNotifications = [
  { id: 'n1', title: '委托单 WT-2025-001 检测中', desc: '预计 3 天后完成', time: '1小时前', type: 'info' },
  { id: 'n2', title: '报告 RPT20240521001 已生成', desc: '点击下载查看', time: '昨天', type: 'success' },
];

/** 客户自助门户 — 对标金现代 LIMS 客户端 */
export const CustomerPortalPage: React.FC = () => {
  
  const [activeTab, setActiveTab] = useState('home');
  const [trackNo, setTrackNo] = useState('');
  const [trackResult, setTrackResult] = useState<any>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [newOrderForm] = Form.useForm();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);

  const handleTrack = () => {
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
      message.success({
        content: '委托申请已提交！预计 1 小时内收到确认短信（测试环境：秒级确认）',
        duration: 5,
      });
      setActiveTab('orders');
      newOrderForm.resetFields();
      setSelectedItems([]);
      setEstimatedTotal(0);
    });
  };

  const stats = {
    totalOrders: mockClientOrders.length,
    activeOrders: mockClientOrders.filter(o => o.status !== 'completed').length,
    reports: mockReports.length,
    totalSpent: mockClientOrders.reduce((s, o) => s + o.amount, 0),
    unpaid: mockClientOrders.reduce((s, o) => s + (o.amount - o.paidAmount), 0),
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* 顶部横幅 */}
      <Card style={{
        marginBottom: 24, textAlign: 'center',
        background: 'linear-gradient(135deg, #1677ff 0%, #0958d9 100%)',
        color: '#fff', borderRadius: 16, border: 'none',
      }}>
        <Title level={2} style={{ color: '#fff', margin: 0, fontSize: 24 }}>
          <GlobalOutlined style={{ marginRight: 8 }} />红创检测认证
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 15 }}>
          客户自助服务 · 在线委托 · 进度追踪 · 报告下载
        </Text>
      </Card>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="large"
        items={[
          {
            key: 'home',
            label: <Space><UserOutlined />客户首页</Space>,
            children: (
              <>
                {/* KPI 卡片 */}
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                  <Col xs={12} sm={4}><Card hoverable onClick={() => setActiveTab('orders')}><Statistic title="我的委托" value={stats.totalOrders} prefix={<InboxOutlined />} /></Card></Col>
                  <Col xs={12} sm={4}><Card hoverable onClick={() => setActiveTab('orders')}><Statistic title="进行中" value={stats.activeOrders} valueStyle={{ color: '#1677ff' }} prefix={<ClockCircleOutlined />} /></Card></Col>
                  <Col xs={12} sm={4}><Card hoverable onClick={() => setActiveTab('reports')}><Statistic title="可下载报告" value={stats.reports} valueStyle={{ color: '#52c41a' }} prefix={<FileTextOutlined />} /></Card></Col>
                  <Col xs={12} sm={4}><Card hoverable><Statistic title="累计消费" value={`¥${stats.totalSpent}`} valueStyle={{ color: '#722ed1' }} prefix={<WalletOutlined />} /></Card></Col>
                  <Col xs={12} sm={4}><Card><Statistic title="待付款" value={`¥${stats.unpaid}`} valueStyle={{ color: stats.unpaid > 0 ? '#ff4d4f' : '#999' }} prefix={<BankOutlined />} /></Card></Col>
                  <Col xs={12} sm={4}>
                    <Card hoverable onClick={() => setActiveTab('new')}>
                      <Statistic title="在线委托" value="立即委托" valueStyle={{ fontSize: 16, color: '#1677ff' }} prefix={<CloudUploadOutlined />} />
                    </Card>
                  </Col>
                </Row>

                {/* 进度追踪 + 通知 */}
                <Row gutter={16}>
                  <Col span={16}>
                    <Card title="快速查询" style={{ marginBottom: 24 }}>
                      <Space>
                        <Input.Search
                          placeholder="输入委托单号或样品名称"
                          value={trackNo}
                          onChange={e => setTrackNo(e.target.value)}
                          onSearch={handleTrack}
                          style={{ width: 400 }}
                          enterButton="查询"
                          size="large"
                        />
                      </Space>
                      {trackResult && (
                        <Card size="small" style={{ marginTop: 16, borderRadius: 12 }}>
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
                          <Button type="link" size="small" onClick={() => { setOrderDetail(trackResult); setDetailOpen(true); }}>
                            查看详情
                          </Button>
                        </Card>
                      )}
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={<Space><BellOutlined />通知</Space>} style={{ marginBottom: 24 }}>
                      <Timeline items={mockNotifications.map(n => ({
                        color: n.type === 'success' ? 'green' : 'blue',
                        children: <div><Text strong>{n.title}</Text><br /><Text type="secondary">{n.desc}</Text><br /><Text type="secondary" style={{ fontSize: 11 }}>{n.time}</Text></div>,
                      }))} />
                    </Card>
                  </Col>
                </Row>
              </>
            ),
          },
          {
            key: 'orders',
            label: <Space><InboxOutlined />我的委托 ({mockClientOrders.length})</Space>,
            children: (
              <Card>
                <Table
                  dataSource={mockClientOrders}
                  rowKey="id"
                  columns={[
                    { title: '委托单号', dataIndex: 'no', width: 160 },
                    { title: '样品名称', dataIndex: 'sample', ellipsis: true },
                    { title: '检测项目', dataIndex: 'items', ellipsis: true },
                    { title: '金额', dataIndex: 'amount', render: (v: number) => `¥${v}` },
                    { title: '日期', dataIndex: 'submitDate' },
                    {
                      title: '进度', dataIndex: 'progress', width: 120,
                      render: (p: number) => <Progress percent={p} size="small" />,
                    },
                    {
                      title: '状态', dataIndex: 'status', width: 100,
                      render: (s: string) => <Badge status={s === 'completed' ? 'success' : 'processing'} text={statusMap[s]?.label || s} />,
                    },
                    {
                      title: '操作', width: 120,
                      render: (_: any, r: any) => (
                        <Button type="link" size="small" icon={<EyeOutlined />}
                          onClick={() => { setOrderDetail(r); setDetailOpen(true); }}>
                          详情
                        </Button>
                      ),
                    },
                  ]}
                  pagination={false}
                  size="middle"
                />
              </Card>
            ),
          },
          {
            key: 'reports',
            label: <Space><FileTextOutlined />报告下载 ({mockReports.length})</Space>,
            children: (
              <Card>
                <Table
                  dataSource={mockReports}
                  rowKey="id"
                  columns={[
                    { title: '报告编号', dataIndex: 'no', width: 180 },
                    { title: '报告名称', dataIndex: 'sample', ellipsis: true },
                    { title: '生成日期', dataIndex: 'date', width: 120 },
                    { title: '大小', dataIndex: 'size', width: 80 },
                    { title: '状态', dataIndex: 'status', width: 80, render: () => <Tag color="green">可下载</Tag> },
                    {
                      title: '操作', width: 180,
                      render: () => (
                        <Space>
                          <Button size="small" icon={<EyeOutlined />} onClick={() => message.info('预览报告')}>预览</Button>
                          <Button type="primary" size="small" icon={<DownloadOutlined />} onClick={() => message.success('报告下载中...')}>下载</Button>
                        </Space>
                      ),
                    },
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
              <Card style={{ maxWidth: 700 }}>
                <div style={{padding:16,background:"#e6f7ff",borderRadius:8,marginBottom:24}}>message="委托申请提交后，客服将在 1 个工作小时内与您确认。" type="info" </div>
                <Form form={newOrderForm} layout="vertical">
                  <Row gutter={16}>
                    <Col span={12}><Form.Item name="contactName" label="联系人" rules={[{ required: true }]}><Input placeholder="姓名" /></Form.Item></Col>
                    <Col span={12}><Form.Item name="contactPhone" label="联系电话" rules={[{ required: true }]}><Input placeholder="手机号" /></Form.Item></Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={12}><Form.Item name="sampleName" label="样品名称" rules={[{ required: true }]}><Input placeholder="如：工业废水" /></Form.Item></Col>
                    <Col span={12}>
                      <Form.Item name="sampleType" label="样品类型" rules={[{ required: true }]}>
                        <Select placeholder="选择">
                          {['地表水','地下水','废水','土壤','环境空气','固体废物','饮用水'].map(s => <Option key={s} value={s}>{s}</Option>)}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item name="sampleLocation" label="采样地点"><Input placeholder="采样地址" /></Form.Item>

                  <Divider>选择检测项目（预估价格）</Divider>
                  <Row gutter={[8, 8]}>
                    {testItemTemplates.map((tpl) => {
                      const active = selectedItems.includes(tpl.value);
                      return (
                        <Col key={tpl.value}>
                          <Tag.CheckableTag
                            checked={active}
                            onChange={() => selectItem(tpl.value)}
                            style={{
                              padding: '4px 12px', borderRadius: 6, fontSize: 12,
                              border: active ? `1px solid #1677ff` : '1px solid #d9d9d9',
                              background: active ? '#e6f4ff' : '#fff',
                              color: active ? '#1677ff' : '#666',
                            }}
                          >
                            {tpl.label} <Text type="secondary" style={{ fontSize: 11 }}>¥{tpl.price}</Text>
                          </Tag.CheckableTag>
                        </Col>
                      );
                    })}
                  </Row>

                  {selectedItems.length > 0 && (
                    <div style={{ marginTop: 16, padding: 12, background: '#f6f8fa', borderRadius: 8 }}>
                      <Text>已选 {selectedItems.length} 项 · 预估费用 </Text>
                      <Text strong style={{ fontSize: 18, color: '#1677ff' }}>¥{estimatedTotal}</Text>
                    </div>
                  )}

                  <Form.Item name="remark" label="备注"><TextArea rows={2} placeholder="其他说明..." /></Form.Item>
                  <Button type="primary" size="large" icon={<SendOutlined />} onClick={handleSubmit} block>
                    提交委托申请
                  </Button>
                </Form>
              </Card>
            ),
          },
          {
            key: 'info',
            label: <Space><UserOutlined />账户信息</Space>,
            children: (
              <Card style={{ maxWidth: 600 }}>
                <Descriptions column={1} bordered size="small" title="公司信息">
                  <Descriptions.Item label="公司名称">绿源环保科技有限公司</Descriptions.Item>
                  <Descriptions.Item label="信用等级"><Tag color="green">A 级</Tag></Descriptions.Item>
                  <Descriptions.Item label="联系人">王经理</Descriptions.Item>
                  <Descriptions.Item label="联系电话">138-0001-1234</Descriptions.Item>
                  <Descriptions.Item label="邮箱">wang@lyep.com</Descriptions.Item>
                  <Descriptions.Item label="地址">杭州市西湖区文一路 88 号</Descriptions.Item>
                </Descriptions>
                <Divider />
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>联系方式</Text>
                  <Text><PhoneOutlined /> 客服热线：400-888-6789</Text>
                  <Text><MailOutlined /> 邮箱：service@hc-lims.com</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>工作日 9:00-18:00</Text>
                </Space>
              </Card>
            ),
          },
        ]}
      />

      {/* 委托详情 Modal */}
      <Modal title={`委托单 ${orderDetail?.no}`} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={520}>
        {orderDetail && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="委托单号" span={2}>{orderDetail.no}</Descriptions.Item>
              <Descriptions.Item label="样品" span={2}>{orderDetail.sample}</Descriptions.Item>
              <Descriptions.Item label="检测项目" span={2}>{orderDetail.items}</Descriptions.Item>
              <Descriptions.Item label="金额">¥{orderDetail.amount}</Descriptions.Item>
              <Descriptions.Item label="已付">¥{orderDetail.paidAmount}</Descriptions.Item>
              <Descriptions.Item label="提交日期">{orderDetail.submitDate}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag>{statusMap[orderDetail.status]?.label}</Tag></Descriptions.Item>
            </Descriptions>
            <Divider>进度</Divider>
            <Steps
              current={['pending', 'received', 'sampling', 'testing', 'completed'].indexOf(orderDetail.status)}
              direction="vertical"
              size="small"
              items={[
                { title: '委托提交', description: orderDetail.submitDate },
                { title: '样品接收', description: orderDetail.status !== 'pending' ? orderDetail.submitDate : '待处理' },
                { title: '检测中', description: ['testing', 'completed'].includes(orderDetail.status) ? '进行中' : '—' },
                { title: '报告出具', description: orderDetail.status === 'completed' ? '已完成' : '—' },
              ]}
            />
            {orderDetail.status === 'completed' && (
              <Button type="primary" block icon={<DownloadOutlined />} style={{ marginTop: 16 }}>
                下载检测报告
              </Button>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};
