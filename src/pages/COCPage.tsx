import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, InputNumber,
  Timeline, Descriptions, Modal, Form, message, Select, Tabs, Empty,
  Alert, Divider, QRCode, Popconfirm,
} from 'antd';
import {
  BarcodeOutlined, EyeOutlined, WarningOutlined,
  SwapOutlined, ReloadOutlined, FilePdfOutlined, PrinterOutlined,
  ClockCircleOutlined, UserOutlined, EnvironmentOutlined,
  ScanOutlined, DeleteOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const { Title, Text } = Typography;
const { Option } = Select;

// ===== Types =====
type COCEventType =
  | 'SAMPLING' | 'SUBMISSION' | 'RECEIPT' | 'REGISTRATION'
  | 'SUB_SAMPLING' | 'TESTING' | 'RETENTION' | 'DISPOSAL' | 'EXCEPTION';

interface COCEvent {
  id: string; chainId: string; eventType: COCEventType;
  operatorName: string; occurredAt: string; location?: string;
  notes?: string; metadata?: Record<string, unknown>;
  prevEventId: string | null; signature?: string;
}

interface COCChain {
  id: string; cocNumber: string; sampleId: string; sampleName: string;
  status: 'active' | 'completed' | 'broken' | 'disposed';
  integrity: boolean; integrityMsg?: string; events: COCEvent[];
  createdAt: string; completedAt?: string;
}

const EVENT_CONFIG: Record<COCEventType, { label: string; color: string; icon: string }> = {
  SAMPLING: { label: '采样', color: '#1677ff', icon: '📍' },
  SUBMISSION: { label: '送样', color: '#722ed1', icon: '📤' },
  RECEIPT: { label: '收样', color: '#13c2c2', icon: '📥' },
  REGISTRATION: { label: '登记', color: '#52c41a', icon: '📝' },
  SUB_SAMPLING: { label: '分样', color: '#fa8c16', icon: '🔬' },
  TESTING: { label: '检测', color: '#eb2f96', icon: '🧪' },
  RETENTION: { label: '留样', color: '#faad14', icon: '📦' },
  DISPOSAL: { label: '处置', color: '#ff4d4f', icon: '🗑️' },
  EXCEPTION: { label: '异常', color: '#ff4d4f', icon: '⚠️' },
};

const VALID_SEQUENCE: Record<string, string[]> = {
  SAMPLING: ['SUBMISSION'],
  SUBMISSION: ['RECEIPT'],
  RECEIPT: ['REGISTRATION', 'SUB_SAMPLING', 'TESTING', 'EXCEPTION'],
  REGISTRATION: ['TESTING', 'SUB_SAMPLING', 'RETENTION', 'EXCEPTION'],
  SUB_SAMPLING: ['TESTING', 'EXCEPTION'],
  TESTING: ['RETENTION', 'EXCEPTION'],
  RETENTION: ['DISPOSAL', 'EXCEPTION'],
  DISPOSAL: [],
  EXCEPTION: ['RECEIPT', 'REGISTRATION', 'TESTING', 'RETENTION', 'DISPOSAL'],
};

const api = (p: string) => `/api/v1${p}`;

// ===== QR Component =====
const COCQRCode: React.FC<{ value: string; size?: number }> = ({ value, size = 160 }) => (
  <div style={{ textAlign: 'center', padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #f0f0f0' }}>
    <QRCode value={value} size={size} />
    <Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>{value}</Text>
  </div>
);

export const COCPage: React.FC = () => {
  const [chains, setChains] = useState<COCChain[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChain, setSelectedChain] = useState<COCChain | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [disposalOpen, setDisposalOpen] = useState(false);
  const [printOpen, setPrintOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [newEventType, setNewEventType] = useState<COCEventType>('RECEIPT');
  const scanInputRef = useRef<any>(null);
  const [transferForm] = Form.useForm();
  const [disposalForm] = Form.useForm();

  const loadChains = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(api('/coc/chains'));
      const json = await res.json();
      setChains(json.data?.list || []);
    } catch { message.error('加载COC数据失败'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadChains(); }, [loadChains]);

  const filteredChains = chains.filter(c => {
    const matchesSearch = !searchText || c.cocNumber.includes(searchText) || c.sampleName.includes(searchText);
    if (!matchesSearch) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return c.status === 'active';
    if (activeTab === 'broken') return c.status === 'broken' || !c.integrity;
    if (activeTab === 'disposed') return c.status === 'disposed';
    return true;
  });

  const stats = {
    total: chains.length,
    active: chains.filter(c => c.status === 'active').length,
    completed: chains.filter(c => c.status === 'completed' || c.status === 'disposed').length,
    broken: chains.filter(c => !c.integrity || c.status === 'broken').length,
  };

  const showDetail = async (chainId: string) => {
    const res = await fetch(api(`/coc/chains/${chainId}`));
    const json = await res.json();
    if (json.code === 200) {
      setSelectedChain(json.data);
      setDetailOpen(true);
    }
  };

  const handleTransfer = async (values: any) => {
    const res = await fetch(api('/coc/transfer'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
    const json = await res.json();
    if (json.code === 200) {
      message.success('交接记录创建成功');
      setTransferOpen(false);
      loadChains();
    } else {
      message.error(json.message || '交接失败');
    }
  };

  const handleDisposal = async (values: any) => {
    if (!selectedChain) return;
    const res = await fetch(api('/coc/disposal'), {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chainId: selectedChain.id, ...values }),
    });
    const json = await res.json();
    if (json.code === 200) {
      message.success('样品处置记录成功');
      setDisposalOpen(false);
      loadChains();
      showDetail(selectedChain.id);
    } else {
      message.error(json.message || '处置失败');
    }
  };

  const handleAddEvent = async (chainId: string, eventType: COCEventType) => {
    const res = await fetch(api(`/coc/chains/${chainId}/events`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        operatorName: '当前用户',
        occurredAt: new Date().toISOString(),
        location: '实验室',
      }),
    });
    const json = await res.json();
    if (json.code === 200) {
      message.success(`${EVENT_CONFIG[eventType].label}事件已记录`);
      loadChains();
      if (selectedChain?.id === chainId) showDetail(chainId);
    } else {
      message.error(json.message || '添加事件失败');
    }
  };

  const handleVerify = async (chainId: string) => {
    const res = await fetch(api(`/coc/chains/${chainId}/verify`), { method: 'POST' });
    const json = await res.json();
    if (json.code === 200) {
      message[json.data.valid ? 'success' : 'warning'](json.data.msg);
      loadChains();
      if (selectedChain?.id === chainId) showDetail(chainId);
    }
  };

  const exportPDF = (chain: COCChain) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 40;

    doc.setFontSize(18);
    doc.text('COC 监管链审计报告', pageWidth / 2, y, { align: 'center' });
    y += 28;

    doc.setFontSize(10);
    doc.text(`报告生成时间: ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`, 40, y);
    y += 20;

    doc.setFontSize(12);
    doc.text(`COC 编号: ${chain.cocNumber}`, 40, y);
    y += 18;
    doc.text(`样品名称: ${chain.sampleName}`, 40, y);
    y += 18;
    doc.text(`样品编号: ${chain.sampleId}`, 40, y);
    y += 18;
    doc.text(`链状态: ${chain.status === 'active' ? '流转中' : chain.status === 'disposed' ? '已处置' : chain.status === 'broken' ? '链断裂' : '已完成'}`, 40, y);
    y += 18;
    doc.text(`链完整性: ${chain.integrity ? '✅ 完整' : '❌ 异常'}`, 40, y);
    y += 24;

    if (chain.integrityMsg) {
      doc.setTextColor(255, 0, 0);
      doc.text(`异常说明: ${chain.integrityMsg}`, 40, y);
      doc.setTextColor(0, 0, 0);
      y += 20;
    }

    const sortedEvents = [...chain.events].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
    autoTable(doc, {
      startY: y,
      head: [['序号', '事件类型', '操作人', '时间', '地点', '备注']],
      body: sortedEvents.map((e, i) => [
        String(i + 1),
        EVENT_CONFIG[e.eventType]?.label || e.eventType,
        e.operatorName,
        dayjs(e.occurredAt).format('YYYY-MM-DD HH:mm'),
        e.location || '-',
        e.notes || '-',
      ]),
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [22, 119, 255] },
    });

    doc.save(`COC审计报告_${chain.cocNumber}.pdf`);
  };

  const columns = [
    { title: 'COC 编号', dataIndex: 'cocNumber', key: 'cocNumber', width: 160 },
    { title: '样品', dataIndex: 'sampleName', key: 'sampleName', width: 180 },
    {
      title: '完整性', dataIndex: 'integrity', key: 'integrity', width: 100,
      render: (_: boolean, r: COCChain) => (
        r.integrity
          ? <Tag color="green" icon={<CheckCircleOutlined />}>完整</Tag>
          : <Tag color="red" icon={<WarningOutlined />}>异常</Tag>
      ),
    },
    {
      title: '流程状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => {
        const map: Record<string, { color: string; label: string }> = {
          active: { color: 'blue', label: '流转中' },
          completed: { color: 'green', label: '已完成' },
          broken: { color: 'red', label: '链断裂' },
          disposed: { color: 'default', label: '已处置' },
        };
        return <Tag color={map[v]?.color}>{map[v]?.label || v}</Tag>;
      },
    },
    {
      title: '事件数', key: 'eventCount', width: 80,
      render: (_: any, r: COCChain) => r.events?.length || 0,
    },
    {
      title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 160,
      render: (v: string) => dayjs(v).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作', key: 'action', width: 320,
      render: (_: any, r: COCChain) => (
        <Space size="small" wrap>
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(r.id)}>详情</Button>
          <Button size="small" icon={<FilePdfOutlined />} onClick={() => exportPDF(r)}>导出PDF</Button>
          <Button size="small" icon={<PrinterOutlined />} onClick={() => { setSelectedChain(r); setPrintOpen(true); }}>打印</Button>
          <Button size="small" icon={<ReloadOutlined />} onClick={() => handleVerify(r.id)}>校验</Button>
          {r.status === 'active' && (
            <>
              <Select value={newEventType} onChange={(v) => setNewEventType(v)} size="small" style={{ width: 90 }}>
                {Object.entries(EVENT_CONFIG).filter(([k]) => r.events?.length > 0
                  ? VALID_SEQUENCE[r.events[r.events.length - 1]?.eventType]?.includes(k)
                  : k === 'SAMPLING'
                ).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
              </Select>
              <Button size="small" type="primary" onClick={() => handleAddEvent(r.id, newEventType)}>添加</Button>
            </>
          )}
          {r.status === 'active' && (
            <Button size="small" danger icon={<DeleteOutlined />} onClick={() => { setSelectedChain(r); setDisposalOpen(true); }}>处置</Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}><BarcodeOutlined /> COC 监管链</Title></Col>
        <Col>
          <Space>
            <Input.Search
              placeholder="搜索COC编号或样品"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={() => { }}
              style={{ width: 240 }}
              allowClear
            />
            <Button icon={<SwapOutlined />} onClick={() => setTransferOpen(true)}>新建交接</Button>
            <Button icon={<ReloadOutlined />} onClick={loadChains}>刷新</Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="总链数" value={stats.total} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="流转中" value={stats.active} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已完成" value={stats.completed} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small" style={stats.broken > 0 ? { borderColor: '#ff4d4f' } : {}}>
          <Statistic title="链异常" value={stats.broken} valueStyle={{ color: stats.broken > 0 ? '#ff4d4f' : undefined }} />
        </Card></Col>
      </Row>

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'all', label: `全部 (${stats.total})` },
          { key: 'active', label: `流转中 (${stats.active})` },
          { key: 'broken', label: <span style={{ color: '#ff4d4f' }}>链异常 ({stats.broken})</span> },
          { key: 'disposed', label: '已处置' },
        ]} />
        <Table
          dataSource={filteredChains}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t: number) => `共 ${t} 条` }}
          locale={{ emptyText: <Empty description="暂无COC记录" /> }}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '8px 24px' }}>
                <COCTimeline events={record.events} />
              </div>
            ),
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`COC: ${selectedChain?.cocNumber || ''}`}
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelectedChain(null); }}
        footer={null}
        width={780}
      >
        {selectedChain && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={16}>
                <Descriptions column={2} size="small" bordered>
                  <Descriptions.Item label="COC 编号">{selectedChain.cocNumber}</Descriptions.Item>
                  <Descriptions.Item label="样品">{selectedChain.sampleName}</Descriptions.Item>
                  <Descriptions.Item label="完整性">
                    <Tag color={selectedChain.integrity ? 'green' : 'red'}>
                      {selectedChain.integrity ? '链完整' : '链异常'}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="流程状态">
                    <Tag>{selectedChain.status}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">{dayjs(selectedChain.createdAt).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                  <Descriptions.Item label="事件数">{selectedChain.events?.length || 0}</Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={8}>
                <COCQRCode value={selectedChain.cocNumber} size={140} />
              </Col>
            </Row>
            {!selectedChain.integrity && selectedChain.integrityMsg && (
              <Alert type="warning" message={`链完整性异常: ${selectedChain.integrityMsg}`} showIcon style={{ marginBottom: 16 }} />
            )}
            <Space style={{ marginBottom: 16 }}>
              <Button size="small" icon={<FilePdfOutlined />} onClick={() => exportPDF(selectedChain)}>导出PDF</Button>
              <Button size="small" icon={<PrinterOutlined />} onClick={() => setPrintOpen(true)}>打印COC</Button>
              <Button size="small" icon={<ReloadOutlined />} onClick={() => handleVerify(selectedChain.id)}>重新校验</Button>
            </Space>
            <Title level={5}>事件时间线</Title>
            <COCTimeline events={selectedChain.events || []} />
          </>
        )}
      </Modal>

      {/* Transfer Modal */}
      <Modal
        title={<span><SwapOutlined /> 新建交接记录</span>}
        open={transferOpen}
        onCancel={() => setTransferOpen(false)}
        width={600}
        footer={null}
      >
        <Form layout="vertical" form={transferForm} onFinish={handleTransfer}>
          <Form.Item name="chainId" label="COC 链" rules={[{ required: true }]}>
            <Select placeholder="选择COC链" showSearch>
              {chains.filter(c => c.status === 'active').map(c => (
                <Option key={c.id} value={c.id}>{c.cocNumber} - {c.sampleName}</Option>
              ))}
            </Select>
          </Form.Item>

          <Divider orientation="left">扫码快速选择</Divider>
          <Form.Item>
            <Input.Search
              ref={(ref) => { scanInputRef.current = ref as any; }}
              placeholder="扫描COC编号或样品条码"
              enterButton={<><ScanOutlined /> 扫描</>}
              onSearch={(val) => {
                const found = chains.find(c => c.cocNumber === val || c.sampleId === val);
                if (found) {
                  transferForm.setFieldsValue({ chainId: found.id });
                  message.success(`已识别: ${found.cocNumber}`);
                  // @ts-ignore
                  scanInputRef.current?.blur?.();
                } else {
                  message.error('未找到匹配的COC链');
                }
              }}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fromParty" label="转出方" rules={[{ required: true }]}>
                <Input placeholder="如: 采样员 刘强" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toParty" label="转入方" rules={[{ required: true }]}>
                <Input placeholder="如: 收样员 张伟" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="sampleCount" label="样品数量" rules={[{ required: true }]} initialValue={1}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="intactCount" label="完好数量" initialValue={1}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="damagedCount" label="破损数量" initialValue={0}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="transportMode" label="运输方式">
                <Select placeholder="选择运输方式" allowClear>
                  <Option value="冷链">冷链专送</Option>
                  <Option value="常温">常温运输</Option>
                  <Option value="专人">专人送达</Option>
                  <Option value="快递">快递</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="temperature" label="运输温度(°C)">
                <InputNumber placeholder="如 4.0" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">电子签名</Divider>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fromSignature" label="转出方签名">
                <Input placeholder="输入签名确认" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="toSignature" label="转入方签名">
                <Input placeholder="输入签名确认" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setTransferOpen(false)}>取消</Button>
              <Button type="primary" htmlType="submit">创建交接</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Disposal Modal */}
      <Modal
        title={<span><DeleteOutlined /> 样品处置</span>}
        open={disposalOpen}
        onCancel={() => setDisposalOpen(false)}
        width={500}
        footer={null}
      >
        {selectedChain && (
          <Alert
            message={`处置 COC: ${selectedChain.cocNumber} - ${selectedChain.sampleName}`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        <Form layout="vertical" form={disposalForm} id="disposalForm" onFinish={handleDisposal}>
          <Form.Item name="disposalMethod" label="处置方式" rules={[{ required: true }]}>
            <Select placeholder="选择处置方式">
              <Option value="销毁">销毁</Option>
              <Option value="退回">退回委托方</Option>
              <Option value="续期">延长留样期限</Option>
              <Option value="移交">移交其他实验室</Option>
            </Select>
          </Form.Item>
          <Form.Item name="reason" label="处置原因/说明" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="如: 留样到期，按危废流程销毁" />
          </Form.Item>
          <Form.Item name="operatorName" label="处置人">
            <Input placeholder="当前用户" />
          </Form.Item>
          <Form.Item name="approvedBy" label="审批人">
            <Input placeholder="主管审批签名" />
          </Form.Item>
          <Form.Item name="disposalDate" label="处置日期" initialValue={dayjs().format('YYYY-MM-DD HH:mm')}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => setDisposalOpen(false)}>取消</Button>
              <Popconfirm title="确认处置后COC链将关闭，不可再添加事件，确认吗？" onConfirm={() => {
                disposalForm.submit();
              }}>
                <Button type="primary" danger>确认处置</Button>
              </Popconfirm>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Print Modal */}
      <Modal
        title={<span><PrinterOutlined /> 打印 COC 表单</span>}
        open={printOpen}
        onCancel={() => setPrintOpen(false)}
        width={500}
        footer={[
          <Button key="close" onClick={() => setPrintOpen(false)}>关闭</Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={() => {
            const content = document.getElementById('coc-print-area');
            if (!content) return;
            const win = window.open('', '_blank');
            if (win) {
              win.document.write(`<html><head><title>COC表单-${selectedChain?.cocNumber}</title><style>body{padding:24px;font-family:sans-serif}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px}</style></head><body>${content.innerHTML}</body></html>`);
              win.document.close();
              win.print();
            }
          }}>打印</Button>,
        ]}
      >
        {selectedChain && (
          <div id="coc-print-area" style={{ padding: 16, border: '1px dashed #ccc' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 'bold' }}>COC 监管链表单</div>
              <div style={{ fontSize: 12, color: '#666' }}>Chain of Custody Form</div>
            </div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <div><strong>COC 编号:</strong> {selectedChain.cocNumber}</div>
                <div><strong>样品:</strong> {selectedChain.sampleName}</div>
                <div><strong>状态:</strong> {selectedChain.status}</div>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <QRCode value={selectedChain.cocNumber} size={100} />
              </Col>
            </Row>
            <table>
              <thead>
                <tr><th>序号</th><th>事件</th><th>操作人</th><th>时间</th><th>地点</th><th>签名</th></tr>
              </thead>
              <tbody>
                {[...selectedChain.events].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()).map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>{EVENT_CONFIG[e.eventType]?.label || e.eventType}</td>
                    <td>{e.operatorName}</td>
                    <td>{dayjs(e.occurredAt).format('YYYY-MM-DD HH:mm')}</td>
                    <td>{e.location || '-'}</td>
                    <td>{e.signature ? '✍️ 已签' : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16, fontSize: 11, color: '#666' }}>
              生成时间: {dayjs().format('YYYY-MM-DD HH:mm:ss')} | 本表单由 HC-LIMS 系统自动生成
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ===== COC Timeline Component =====
const COCTimeline: React.FC<{ events: COCEvent[] }> = ({ events }) => {
  if (!events || events.length === 0) {
    return <Empty description="暂无事件记录" />;
  }
  const sorted = [...events].sort((a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime());
  return (
    <Timeline
      items={sorted.map((e, i) => {
        const cfg = EVENT_CONFIG[e.eventType] || { label: e.eventType, color: '#999', icon: '?' };
        return {
          color: cfg.color,
          dot: <span style={{ fontSize: 16 }}>{cfg.icon}</span>,
          children: (
            <div>
              <Space>
                <Text strong style={{ color: cfg.color }}>{cfg.label}</Text>
                {i === sorted.length - 1 && <Tag color="blue">当前</Tag>}
                {e.signature && <Tag color="gold">✍️ 已签</Tag>}
              </Space>
              <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>
                <UserOutlined /> {e.operatorName}
                {' | '}
                <ClockCircleOutlined /> {dayjs(e.occurredAt).format('MM-DD HH:mm')}
                {e.location && <> | <EnvironmentOutlined /> {e.location}</>}
              </div>
              {e.notes && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>📝 {e.notes}</div>}
            </div>
          ),
        };
      })}
    />
  );
};

export default COCPage;
