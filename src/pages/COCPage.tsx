import React, { useEffect, useState, useCallback } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input,
  Timeline, Descriptions, Modal, Form, message, Select, Tabs, Empty,
  Alert,
} from 'antd';
import {
  BarcodeOutlined, EyeOutlined, WarningOutlined,
  SwapOutlined, ReloadOutlined,
  ClockCircleOutlined, UserOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

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
  prevEventId: string | null;
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

export const COCPage: React.FC = () => {
  const [chains, setChains] = useState<COCChain[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedChain, setSelectedChain] = useState<COCChain | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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
    broken: chains.filter(c => !c.integrity).length,
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
    }
  };

  // 新增事件
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
    }
  };

  const [newEventType, setNewEventType] = useState<COCEventType>('RECEIPT');

  const columns = [
    { title: 'COC 编号', dataIndex: 'cocNumber', key: 'cocNumber', width: 160 },
    { title: '样品', dataIndex: 'sampleName', key: 'sampleName', width: 180 },
    {
      title: '状态', dataIndex: 'integrity', key: 'integrity', width: 100,
      render: (_: boolean, r: COCChain) => (
        r.integrity
          ? <Tag color="green">链完整</Tag>
          : <Tag color="red" icon={<WarningOutlined />}>链异常</Tag>
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
      title: '操作', key: 'action', width: 300,
      render: (_: any, r: COCChain) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => showDetail(r.id)}>详情</Button>
          {r.status === 'active' && (
            <>
              <Select value={newEventType} onChange={setNewEventType} size="small" style={{ width: 90 }}>
                {Object.entries(EVENT_CONFIG).filter(([k]) => r.events?.length > 0
                  ? VALID_SEQUENCE[r.events[r.events.length - 1]?.eventType]?.includes(k)
                  : k === 'SAMPLING'
                ).map(([k, v]) => <Option key={k} value={k}>{v.label}</Option>)}
              </Select>
              <Button size="small" type="primary" onClick={() => handleAddEvent(r.id, newEventType)}>添加</Button>
            </>
          )}
          <Button size="small" icon={<ReloadOutlined />} onClick={loadChains}>刷新</Button>
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
            <Button icon={<SwapOutlined />} onClick={() => setTransferOpen(true)}>新建交接</Button>
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
          pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
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

      {/* 详情弹窗 */}
      <Modal
        title={`COC: ${selectedChain?.cocNumber || ''}`}
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelectedChain(null); }}
        footer={null}
        width={700}
      >
        {selectedChain && (
          <>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="COC 编号">{selectedChain.cocNumber}</Descriptions.Item>
              <Descriptions.Item label="样品">{selectedChain.sampleName}</Descriptions.Item>
              <Descriptions.Item label="状态">
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
            {!selectedChain.integrity && selectedChain.integrityMsg && (
              <Alert type="warning" message={`链完整性异常: ${selectedChain.integrityMsg}`} showIcon style={{ marginBottom: 16 }} />
            )}
            <Title level={5}>事件时间线</Title>
            <COCTimeline events={selectedChain.events || []} />
          </>
        )}
      </Modal>

      {/* 新建交接弹窗 */}
      <Modal
        title="新建交接记录"
        open={transferOpen}
        onCancel={() => setTransferOpen(false)}
        onOk={() => {
          const form = (document.querySelector('#transferForm') as HTMLFormElement);
          if (form) form.requestSubmit();
        }}
        okText="创建交接"
      >
        <Form id="transferForm" layout="vertical" onFinish={handleTransfer}>
          <Form.Item name="chainId" label="COC 链" rules={[{ required: true }]}>
            <Select placeholder="选择COC链" showSearch>
              {chains.filter(c => c.status === 'active').map(c => (
                <Option key={c.id} value={c.id}>{c.cocNumber} - {c.sampleName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="fromParty" label="转出方" rules={[{ required: true }]}>
            <Input placeholder="如: 采样员 刘强" />
          </Form.Item>
          <Form.Item name="toParty" label="转入方" rules={[{ required: true }]}>
            <Input placeholder="如: 收样员 张伟" />
          </Form.Item>
          <Form.Item name="sampleCount" label="样品数量" rules={[{ required: true }]} initialValue={1}>
            <Input type="number" min={1} />
          </Form.Item>
          <Form.Item name="transportMode" label="运输方式">
            <Select placeholder="选择运输方式" allowClear>
              <Option value="冷链">冷链专送</Option>
              <Option value="常温">常温运输</Option>
              <Option value="专人">专人送达</Option>
              <Option value="快递">快递</Option>
            </Select>
          </Form.Item>
          <Form.Item name="temperature" label="运输温度(°C)">
            <Input type="number" placeholder="如 4.0" />
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
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
