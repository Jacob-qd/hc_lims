import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, DatePicker, Drawer, Descriptions, Tabs, Modal, Form, message, Badge, Steps, Timeline, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ExportOutlined, ImportOutlined, ThunderboltOutlined, HistoryOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

// ===== Mock Data =====
const mockTestPackages = [
  { id: 'pkg1', name: '地表水24项', category: '水质', itemCount: 24, estimatedTAT: 5, price: 2800 },
  { id: 'pkg2', name: '饮用水106项', category: '水质', itemCount: 106, estimatedTAT: 10, price: 12000 },
  { id: 'pkg3', name: '土壤8项', category: '土壤', itemCount: 8, estimatedTAT: 5, price: 1600 },
  { id: 'pkg4', name: '环境空气6项', category: '空气', itemCount: 6, estimatedTAT: 3, price: 1200 },
  { id: 'pkg5', name: '废水常规12项', category: '水质', itemCount: 12, estimatedTAT: 5, price: 2400 },
];

const mockOrders = [
  { id: 'o1', orderNo: 'ORD-20260516-001', customerName: '绿源环保科技有限公司', customerPoNo: 'LY-PO-20260058', projectName: '地表水监测项目', urgency: 'normal', status: 'in_progress', sampleCount: 12, estimatedTAT: 5, dueDate: '2026-05-21', totalAmount: 2800, billingStatus: 'unbilled', createdBy: '张伟', createdAt: '2026-05-16 09:15', submittedAt: '2026-05-16 09:20', templateId: 'pkg1' },
  { id: 'o2', orderNo: 'ORD-20260515-002', customerName: '博克水务集团', customerPoNo: 'BS-2026-0123', projectName: '饮用水检测', urgency: 'rush', status: 'received', sampleCount: 8, estimatedTAT: 8, dueDate: '2026-05-23', totalAmount: 12000, billingStatus: 'unbilled', createdBy: '张伟', createdAt: '2026-05-15 14:30', submittedAt: '2026-05-15 14:35' },
  { id: 'o3', orderNo: 'ORD-20260514-003', customerName: '清源化工有限公司', customerPoNo: 'QY-2026-0089', projectName: '废水排放合规检测', urgency: 'urgent', status: 'in_progress', sampleCount: 3, estimatedTAT: 3, dueDate: '2026-05-17', totalAmount: 1600, billingStatus: 'billed', createdBy: '李思', createdAt: '2026-05-14 10:00', submittedAt: '2026-05-14 10:05' },
  { id: 'o4', orderNo: 'ORD-20260513-004', customerName: '蓝天环境监测站', projectName: '空气质量监测', urgency: 'normal', status: 'completed', sampleCount: 15, estimatedTAT: 7, dueDate: '2026-05-20', totalAmount: 3200, billingStatus: 'paid', createdBy: '张伟', createdAt: '2026-05-13 08:30', submittedAt: '2026-05-13 08:35', completedAt: '2026-05-19' },
  { id: 'o5', orderNo: 'ORD-20260512-005', customerName: '宏达食品有限公司', projectName: '食品安全检测', urgency: 'normal', status: 'draft', sampleCount: 20, estimatedTAT: 14, dueDate: '2026-05-30', totalAmount: 5600, billingStatus: 'unbilled', createdBy: '李思', createdAt: '2026-05-12 16:45' },
  { id: 'o6', orderNo: 'ORD-20260516-006', customerName: '绿源环保科技有限公司', customerPoNo: 'LY-PO-20260062', projectName: '土壤检测', urgency: 'rush', status: 'submitted', sampleCount: 5, estimatedTAT: 5, dueDate: '2026-05-21', totalAmount: 1600, billingStatus: 'unbilled', createdBy: '张伟', createdAt: '2026-05-16 11:20', submittedAt: '2026-05-16 11:25' },
];

const statusColors: Record<string, string> = { draft: '#d9d9d9', submitted: '#1677ff', tech_review: '#722ed1', accepted: '#13c2c2', received: '#2f54eb', in_progress: '#fa8c16', partial_complete: '#52c41a', completed: '#52c41a', archived: '#8c8c8c', rejected: '#ff4d4f', cancelled: '#ff4d4f', on_hold: '#faad14' };
const statusLabels: Record<string, string> = { draft: '草稿', submitted: '已提交', tech_review: '技术审核', accepted: '已确认', received: '已收样', in_progress: '执行中', partial_complete: '部分完成', completed: '已完成', archived: '已归档', rejected: '已退回', cancelled: '已取消', on_hold: '暂停中' };
const urgencyColors: Record<string, string> = { normal: '#52c41a', rush: '#faad14', urgent: '#ff4d4f' };
const urgencyLabels: Record<string, string> = { normal: '普通', rush: '加急', urgent: '紧急' };

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState(mockOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form] = Form.useForm();
  const [quickForm] = Form.useForm();

  const filtered = orders.filter(o => {
    if (search && !o.orderNo.includes(search) && !o.customerName.includes(search) && !o.projectName.includes(search)) return false;
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: orders.length,
    inProgress: orders.filter(o => o.status === 'in_progress' || o.status === 'received').length,
    completed: orders.filter(o => o.status === 'completed').length,
    urgent: orders.filter(o => o.urgency === 'urgent').length,
    revenue: orders.filter(o => o.billingStatus === 'paid').reduce((s, o) => s + (o.totalAmount || 0), 0),
  };

  const getSLAColor = (order: any) => {
    if (order.status === 'completed' || order.status === 'archived') return '#52c41a';
    if (!order.dueDate) return '#1677ff';
    const daysLeft = Math.ceil((new Date(order.dueDate).getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return '#ff4d4f';
    if (daysLeft <= 2) return '#faad14';
    return '#52c41a';
  };

  const getSLAText = (order: any) => {
    if (order.status === 'completed') return '已完成';
    if (!order.dueDate) return '-';
    const daysLeft = Math.ceil((new Date(order.dueDate).getTime() - Date.now()) / 86400000);
    if (daysLeft < 0) return `超期 ${Math.abs(daysLeft)} 天`;
    if (daysLeft === 0) return '今天到期';
    return `剩余 ${daysLeft} 天`;
  };

  const handleCreate = (v: any) => {
    const pkg = mockTestPackages.find(p => p.id === v.testPackageId);
    const order = {
      id: 'o' + (orders.length + 1),
      orderNo: 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(orders.length + 1).padStart(3, '0'),
      customerName: v.customerName,
      customerPoNo: v.customerPoNo,
      projectName: v.projectName,
      urgency: v.urgency || 'normal',
      status: 'draft',
      sampleCount: v.sampleCount || 1,
      estimatedTAT: pkg?.estimatedTAT || 5,
      dueDate: v.dueDate?.format?.('YYYY-MM-DD') || v.dueDate,
      totalAmount: pkg?.price || 0,
      billingStatus: 'unbilled',
      createdBy: '当前用户',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      templateId: v.testPackageId,
    };
    setOrders(prev => [order, ...prev]);
    message.success(`委托 ${order.orderNo} 创建成功`);
    setCreateOpen(false); form.resetFields();
  };

  const handleQuickCreate = (v: any) => {
    const existing = orders.find(o => o.customerName === v.customerName);
    const pkg = mockTestPackages.find(p => p.id === v.testPackageId);
    const order = {
      id: 'o' + (orders.length + 1),
      orderNo: 'ORD-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(orders.length + 1).padStart(3, '0'),
      customerName: v.customerName,
      customerPoNo: v.customerPoNo || (existing?.customerPoNo || ''),
      projectName: v.projectName || (existing?.projectName || ''),
      urgency: v.urgency || 'normal',
      status: 'submitted' as const,
      sampleCount: v.sampleCount || 1,
      estimatedTAT: pkg?.estimatedTAT || 5,
      dueDate: new Date(Date.now() + (pkg?.estimatedTAT || 5) * 86400000).toISOString().slice(0, 10),
      totalAmount: (pkg?.price || 0) * (v.sampleCount || 1),
      billingStatus: 'unbilled' as const,
      createdBy: '当前用户',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      templateId: v.testPackageId,
    };
    setOrders(prev => [order, ...prev]);
    message.success(`快速委托 ${order.orderNo} 创建成功 (${v.sampleCount} 样品, ¥${order.totalAmount})`);
    setQuickOpen(false); quickForm.resetFields();
  };

  const handleSubmit = (orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'submitted', submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) } : o));
    message.success('委托已提交');
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}>委托管理</Title></Col>
        <Col>
          <Space>
            <Button icon={<ThunderboltOutlined />} type="primary" onClick={() => setQuickOpen(true)}>快速委托</Button>
            <Button icon={<PlusOutlined />} onClick={() => { setEditing(null); form.resetFields(); setCreateOpen(true); }}>新建委托</Button>
            <Button icon={<ImportOutlined />}>批量导入</Button>
            <Button icon={<ExportOutlined />} onClick={() => { const csv='委托编号,客户,项目,样品数,状态,金额\n'+orders.map(o=>[o.orderNo,o.customerName,o.projectName,o.sampleCount,statusLabels[o.status],o.totalAmount].join(',')).join('\n'); const b=new Blob([csv],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='orders.csv'; a.click(); }}>导出</Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16,16]} className="stat-cards-row">
        <Col xs={6}><Card size="small"><Statistic title="委托总数" value={stats.total} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="执行中" value={stats.inProgress} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="本月完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="紧急委托" value={stats.urgent} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }} wrap>
          <Input placeholder="搜索委托号/客户/项目" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280 }} allowClear />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130 }}>
            <Select.Option value="all">全部状态</Select.Option>
            {Object.entries(statusLabels).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
          </Select>
          <Select placeholder="紧急程度" style={{ width: 110 }} allowClear>
            {Object.entries(urgencyLabels).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}
          </Select>
        </Space>

        <Table dataSource={filtered} rowKey="id" pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }} size="middle" columns={[
          { title: '委托编号', dataIndex: 'orderNo', width: 180, render: (n: string) => <a onClick={() => { setSelected(orders.find(o=>o.orderNo===n)); setDetailOpen(true); }}><code>{n}</code></a> },
          { title: '客户', dataIndex: 'customerName', ellipsis: true },
          { title: '项目', dataIndex: 'projectName', ellipsis: true },
          { title: '样品数', dataIndex: 'sampleCount', width: 70 },
          { title: '金额', dataIndex: 'totalAmount', width: 100, render: (v: number) => v ? `¥${v.toLocaleString()}` : '-' },
          { title: '紧急程度', dataIndex: 'urgency', width: 80, render: (u: string) => <Tag color={urgencyColors[u]}>{urgencyLabels[u]}</Tag> },
          { title: '状态', dataIndex: 'status', width: 90, render: (s: string) => <Badge status={s==='completed'?'success':s==='in_progress'?'processing':s==='cancelled'?'error':'default'} text={statusLabels[s]} /> },
          {
            title: 'SLA', width: 110, render: (_: any, r: any) => {
              const color = getSLAColor(r);
              const daysLeft = r.dueDate ? Math.ceil((new Date(r.dueDate).getTime() - Date.now()) / 86400000) : null;
              return <Space size={4}>
                <Progress percent={r.status === 'completed' ? 100 : Math.min(100, Math.max(0, ((r.estimatedTAT - (daysLeft || 0)) / r.estimatedTAT) * 100))} size="small" showInfo={false} strokeColor={color} style={{ width: 60 }} />
                <Text style={{ fontSize: 12, color }}>{getSLAText(r)}</Text>
              </Space>;
            }
          },
          { title: '创建时间', dataIndex: 'createdAt', width: 140 },
          {
            title: '操作', width: 180, render: (_: any, r: any) => <Space size="small">
              <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDetailOpen(true); }}>详情</Button>
              {r.status === 'draft' && <Button type="link" size="small" onClick={() => handleSubmit(r.id)}>提交</Button>}
              {r.status !== 'completed' && r.status !== 'cancelled' && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditing(r); form.setFieldsValue(r); setCreateOpen(true); }}>变更</Button>}
            </Space>
          },
        ]} />
      </Card>

      {/* Detail Drawer */}
      <Drawer title={`委托详情: ${selected?.orderNo || ''}`} open={detailOpen} onClose={() => { setDetailOpen(false); setSelected(null); }} width={640}
        extra={<Space>{selected && selected.status !== 'cancelled' && selected.status !== 'completed' && <Button danger onClick={() => { setOrders(prev => prev.map(o => o.id === selected.id ? {...o, status:'cancelled'} : o)); message.warning('委托已取消'); setDetailOpen(false); }}>取消委托</Button>}<Button onClick={() => { const d=selected; const txt=`委托编号: ${d?.orderNo}\n客户: ${d?.customerName}\n项目: ${d?.projectName}\n样品数: ${d?.sampleCount}\n金额: ¥${d?.totalAmount}\n状态: ${statusLabels[d?.status||'']}`; const b=new Blob([txt],{type:'text/plain'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download=`${d?.orderNo}.txt`; a.click(); }}>导出</Button></Space>}
      >
        {selected && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="委托编号">{selected.orderNo}</Descriptions.Item>
              <Descriptions.Item label="状态"><Badge status={selected.status==='completed'?'success':'processing'} text={statusLabels[selected.status]} /></Descriptions.Item>
              <Descriptions.Item label="客户" span={2}>{selected.customerName}</Descriptions.Item>
              <Descriptions.Item label="客户采购单号">{selected.customerPoNo || '-'}</Descriptions.Item>
              <Descriptions.Item label="项目名称">{selected.projectName}</Descriptions.Item>
              <Descriptions.Item label="紧急程度"><Tag color={urgencyColors[selected.urgency]}>{urgencyLabels[selected.urgency]}</Tag></Descriptions.Item>
              <Descriptions.Item label="预估 TAT">{selected.estimatedTAT} 天</Descriptions.Item>
              <Descriptions.Item label="截止日期">{selected.dueDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="样品总数">{selected.sampleCount}</Descriptions.Item>
              <Descriptions.Item label="总金额">¥{(selected.totalAmount || 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="计费状态"><Tag>{selected.billingStatus === 'paid' ? '已收款' : selected.billingStatus === 'billed' ? '已开票' : '未开票'}</Tag></Descriptions.Item>
              <Descriptions.Item label="创建人">{selected.createdBy}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{selected.createdAt}</Descriptions.Item>
            </Descriptions>

            <Tabs size="small" items={[
              { key: 'timeline', label: '状态时间线', children: <Timeline items={[
                { color: 'green', children: <><Text strong>创建</Text><br /><Text type="secondary">{selected.createdAt} · {selected.createdBy}</Text></> },
                selected.submittedAt && { color: 'blue', children: <><Text strong>提交</Text><br /><Text type="secondary">{selected.submittedAt}</Text></> },
                selected.completedAt && { color: 'green', children: <><Text strong>完成</Text><br /><Text type="secondary">{selected.completedAt}</Text></> },
              ].filter(Boolean)} /> },
              { key: 'packages', label: '检测套餐', children: <Card size="small">
                {selected.templateId ? (
                  (() => { const pkg = mockTestPackages.find(p => p.id === selected.templateId);
                    return pkg ? <Descriptions size="small" column={1}>
                      <Descriptions.Item label="套餐名称">{pkg.name}</Descriptions.Item>
                      <Descriptions.Item label="检测项目数">{pkg.itemCount} 项</Descriptions.Item>
                      <Descriptions.Item label="预估周期">{pkg.estimatedTAT} 天</Descriptions.Item>
                      <Descriptions.Item label="单价">¥{pkg.price.toLocaleString()}</Descriptions.Item>
                    </Descriptions> : <Text type="secondary">未关联套餐</Text>;
                  })()
                ) : <Text type="secondary">未关联检测套餐</Text>}
              </Card>},
              { key: 'samples', label: '样品清单', children: <Table dataSource={Array.from({length: selected.sampleCount}, (_, i) => ({ key: i+1, no: `SMP-${selected.orderNo.slice(-3)}-${String(i+1).padStart(2,'0')}`, name: `${selected.projectName}-样品${i+1}`, status: i === 0 && selected.status === 'in_progress' ? '检测中' : selected.status === 'completed' ? '已完成' : '待收样' }))} rowKey="key" size="small" pagination={false} columns={[
                { title: '#', dataIndex: 'key', width: 40 },
                { title: '样品编号', dataIndex: 'no', render: (n: string) => <code>{n}</code> },
                { title: '样品名称', dataIndex: 'name' },
                { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s==='已完成'?'green':s==='检测中'?'blue':'default'}>{s}</Tag> },
              ]} /> },
            ]} />
          </>
        )}
      </Drawer>

      {/* Create/Edit Modal */}
      <Modal title={editing ? '变更委托' : '新建委托'} open={createOpen} onOk={() => form.submit()} onCancel={() => { setCreateOpen(false); setEditing(null); form.resetFields(); }} width={600}>
        <Form form={form} layout="vertical" onFinish={editing ? (v) => { setOrders(prev => prev.map(o => o.id === editing.id ? {...o, ...v} : o)); message.success('委托已更新'); setCreateOpen(false); setEditing(null); form.resetFields(); } : handleCreate}>
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true }]}><Input placeholder="选择或输入客户" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="customerPoNo" label="客户采购单号"><Input placeholder="PO编号" /></Form.Item></Col>
            <Col span={12}><Form.Item name="projectName" label="项目名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="testPackageId" label="检测套餐"><Select placeholder="选择检测套餐" allowClear>
            {mockTestPackages.map(p => <Select.Option key={p.id} value={p.id}>{p.name} ({p.itemCount}项 · ¥{p.price})</Select.Option>)}
          </Select></Form.Item>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="sampleCount" label="样品数量"><Input type="number" min={1} /></Form.Item></Col>
            <Col span={8}><Form.Item name="urgency" label="紧急程度"><Select>{Object.entries(urgencyLabels).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}</Select></Form.Item></Col>
            <Col span={8}><Form.Item name="dueDate" label="截止日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

      {/* Quick Order Modal */}
      <Modal title="⚡ 快速委托（30秒完成）" open={quickOpen} onOk={() => quickForm.submit()} onCancel={() => { setQuickOpen(false); quickForm.resetFields(); }} width={500}>
        <Form form={quickForm} layout="vertical" onFinish={handleQuickCreate}>
          <Form.Item name="customerName" label="选择客户" rules={[{ required: true }]}>
            <Select showSearch placeholder="搜索客户名称" options={[...new Set(orders.map(o => o.customerName))].map(c => ({ value: c, label: c }))} />
          </Form.Item>
          <Form.Item name="testPackageId" label="检测套餐" rules={[{ required: true }]}>
            <Select placeholder="选择套餐">
              {mockTestPackages.map(p => <Select.Option key={p.id} value={p.id}>{p.name} — {p.itemCount}项 · ¥{p.price} · {p.estimatedTAT}天</Select.Option>)}
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="sampleCount" label="样品数量" rules={[{ required: true }]}><Input type="number" min={1} defaultValue={1} /></Form.Item></Col>
            <Col span={12}><Form.Item name="urgency" label="紧急程度"><Select defaultValue="normal">{Object.entries(urgencyLabels).map(([k, v]) => <Select.Option key={k} value={k}>{v}</Select.Option>)}</Select></Form.Item></Col>
          </Row>
          <Alert message="系统将根据套餐自动计算预估完成时间和费用" type="info" showIcon style={{ marginTop: 8 }} />
        </Form>
      </Modal>
    </div>
  );
};
