import React, { useState } from 'react';
import {
  Card, Descriptions, Tag, Tabs, Timeline, Table, Button, Row, Col,
  Typography, Steps, Modal, message, Form, Input, Select, InputNumber,
  Drawer, Space, Popconfirm, Empty, DatePicker,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, InboxOutlined, EyeOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

// ===== 类型定义 =====
interface SubSample {
  id: string;
  no: string;
  name: string;
  amount: string;
  unit: string;
  purpose: string;
  status: 'pending' | 'testing' | 'completed';
  statusLabel: string;
  createdBy: string;
  createdAt: string;
  parentNo: string;
}

interface RetentionSample {
  id: string;
  batchNo: string;
  amount: string;
  unit: string;
  condition: string;
  expiryDate: string;
  daysLeft: number;
  status: 'normal' | 'expiring' | 'expired' | 'disposed';
  statusLabel: string;
  disposedAt?: string;
  disposedBy?: string;
  remark?: string;
}

interface FlowRecord {
  time: string;
  action: string;
  user: string;
  desc: string;
}

// ===== Mock 数据 =====
const mockSample = {
  id: 's1', sampleNo: 'SMP20240520001', name: '地表水样品-1', type: '环境水',
  status: 'testing', statusLabel: '检测中', customer: '绿源环保科技有限公司',
  project: '地表水环境质量监测', location: '市政水务集团', samplingTime: '2024-05-20 09:30',
  receivingTime: '2024-05-20 10:45', receiver: '张伟', priority: '高',
  container: '玻璃瓶 500mL×3', storage: '4℃冷藏', lab: '理化实验室',
};

const testItems = [
  { item: 'pH值', method: 'HJ 1147-2020', status: 'completed', result: '7.32', unit: '无量纲' },
  { item: '化学需氧量(COD)', method: 'HJ 828-2017', status: 'testing', result: '-', unit: 'mg/L' },
  { item: '氨氮(NH₃-N)', method: 'HJ 535-2009', status: 'pending', result: '-', unit: 'mg/L' },
  { item: '总磷(TP)', method: 'GB/T 11893-1989', status: 'pending', result: '-', unit: 'mg/L' },
];

const flowRecords: FlowRecord[] = [
  { time: '2024-05-20 09:30', action: '采样', user: '采样员 刘强', desc: '现场采样完成' },
  { time: '2024-05-20 10:45', action: '接收', user: '张伟', desc: '样品已接收，外观正常' },
  { time: '2024-05-20 14:00', action: '分配', user: '张伟', desc: '分配到理化实验室' },
  { time: '2024-05-21 09:00', action: '检测开始', user: '王明', desc: 'COD检测开始' },
];

export const SampleDetailPage: React.FC = () => {
  useParams();
  const navigate = useNavigate();
  const currentStep = mockSample.status === 'testing' ? 3 : 0;

  // ===== 子样品状态 =====
  const [subSamples, setSubSamples] = useState<SubSample[]>([
    { id: 'sub1', no: 'S-SUB-001', name: '子样品-1(COD专用)', amount: '200', unit: 'mL', purpose: 'COD复测备用', status: 'testing', statusLabel: '检测中', createdBy: '张伟', createdAt: '2024-05-20', parentNo: mockSample.sampleNo },
    { id: 'sub2', no: 'S-SUB-002', name: '子样品-2(重金属)', amount: '150', unit: 'mL', purpose: '重金属检测', status: 'pending', statusLabel: '待检测', createdBy: '张伟', createdAt: '2024-05-20', parentNo: mockSample.sampleNo },
  ]);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [subForm] = Form.useForm();
  const [subDetailOpen, setSubDetailOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<SubSample | null>(null);

  // ===== 留样状态 =====
  const [retentions, setRetentions] = useState<RetentionSample[]>([
    { id: 'r1', batchNo: 'RY-2026-001', amount: '200', unit: 'mL', condition: '4°C冷藏', expiryDate: '2026-06-15', daysLeft: 31, status: 'normal', statusLabel: '正常' },
    { id: 'r2', batchNo: 'RY-2026-002', amount: '150', unit: 'mL', condition: '-20°C冷冻', expiryDate: '2026-05-20', daysLeft: 5, status: 'expiring', statusLabel: '即将到期' },
  ]);
  const [retModalOpen, setRetModalOpen] = useState(false);
  const [retForm] = Form.useForm();
  const [retDetailOpen, setRetDetailOpen] = useState(false);
  const [selectedRet, setSelectedRet] = useState<RetentionSample | null>(null);

  // ===== 子样品操作 =====
  const handleCreateSub = () => {
    subForm.validateFields().then((values: any) => {
      const newSub: SubSample = {
        id: `sub${Date.now()}`,
        no: `S-SUB-${String(subSamples.length + 1).padStart(3, '0')}`,
        name: values.name,
        amount: String(values.amount),
        unit: values.unit,
        purpose: values.purpose || '-',
        status: 'pending',
        statusLabel: '待检测',
        createdBy: '当前用户',
        createdAt: dayjs().format('YYYY-MM-DD'),
        parentNo: mockSample.sampleNo,
      };
      setSubSamples([...subSamples, newSub]);
      message.success(`子样品 ${newSub.no} 创建成功`);
      setSubModalOpen(false);
      subForm.resetFields();
    });
  };

  const handleDeleteSub = (id: string) => {
    setSubSamples(prev => prev.filter(s => s.id !== id));
    message.success('子样品已删除');
  };

  // ===== 留样操作 =====
  const handleCreateRetention = () => {
    retForm.validateFields().then((values: any) => {
      const expiry = (values.expiryDate as Dayjs).format('YYYY-MM-DD');
      const daysLeft = dayjs(expiry).diff(dayjs(), 'day');
      const newRet: RetentionSample = {
        id: `r${Date.now()}`,
        batchNo: `RY-${dayjs().format('YYYYMM')}-${String(retentions.length + 1).padStart(3, '0')}`,
        amount: String(values.amount),
        unit: values.unit,
        condition: values.condition,
        expiryDate: expiry,
        daysLeft: Math.max(0, daysLeft),
        status: daysLeft <= 7 ? 'expiring' : 'normal',
        statusLabel: daysLeft <= 7 ? '即将到期' : '正常',
        remark: values.remark,
      };
      setRetentions([...retentions, newRet]);
      message.success(`留样 ${newRet.batchNo} 登记成功`);
      setRetModalOpen(false);
      retForm.resetFields();
    });
  };

  const handleDisposeRetention = (id: string) => {
    setRetentions(prev => prev.map(r => r.id === id ? {
      ...r, status: 'disposed', statusLabel: '已处置',
      disposedAt: dayjs().format('YYYY-MM-DD HH:mm'),
      disposedBy: '当前用户',
    } : r));
    message.success('留样已处置');
  };

  // ===== 渲染辅助 =====
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: 'blue', testing: 'orange', completed: 'green',
      normal: 'green', expiring: 'orange', expired: 'red', disposed: 'default',
    };
    return map[status] || 'default';
  };

  const subColumns = [
    { title: '子样品编号', dataIndex: 'no', width: 130 },
    { title: '名称', dataIndex: 'name', ellipsis: true },
    { title: '分样量', width: 100, render: (_: any, r: SubSample) => `${r.amount}${r.unit}` },
    { title: '用途', dataIndex: 'purpose', ellipsis: true },
    { title: '状态', width: 90, render: (_: any, r: SubSample) => <Tag color={getStatusColor(r.status)}>{r.statusLabel}</Tag> },
    { title: '创建人', dataIndex: 'createdBy', width: 100 },
    { title: '创建时间', dataIndex: 'createdAt', width: 110 },
    { title: '操作', width: 150, render: (_: any, r: SubSample) => (
      <Space>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedSub(r); setSubDetailOpen(true); }}>查看</Button>
        <Popconfirm title="确认删除此子样品？" onConfirm={() => handleDeleteSub(r.id)}>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      </Space>
    )},
  ];

  const retColumns = [
    { title: '留样批号', dataIndex: 'batchNo', width: 140 },
    { title: '留样量', width: 100, render: (_: any, r: RetentionSample) => `${r.amount}${r.unit}` },
    { title: '保存条件', dataIndex: 'condition', width: 110 },
    { title: '到期日期', dataIndex: 'expiryDate', width: 110 },
    { title: '剩余天数', width: 90, render: (_: any, r: RetentionSample) => {
      const c = r.daysLeft <= 7 ? '#ff4d4f' : r.daysLeft <= 14 ? '#faad14' : '#52c41a';
      return <span style={{ color: c, fontWeight: 600 }}>{r.daysLeft}天</span>;
    }},
    { title: '状态', width: 90, render: (_: any, r: RetentionSample) => <Tag color={getStatusColor(r.status)}>{r.statusLabel}</Tag> },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    { title: '操作', width: 180, render: (_: any, r: RetentionSample) => (
      <Space>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedRet(r); setRetDetailOpen(true); }}>查看</Button>
        {r.status !== 'disposed' && (
          <Popconfirm title="确认处置此留样？" onConfirm={() => handleDisposeRetention(r.id)}>
            <Button size="small" danger>处置</Button>
          </Popconfirm>
        )}
      </Space>
    )},
  ];

  return (
    <div>
      <Row align="middle" style={{ marginBottom: 16 }}>
        <Col><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/samples')} style={{ marginRight: 12 }}>返回</Button></Col>
        <Col><Title level={4} style={{ margin: 0 }}>样品详情 - {mockSample.sampleNo}</Title></Col>
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Tag color="blue">{mockSample.statusLabel}</Tag>
          <Tag color="red" style={{ marginLeft: 8 }}>{mockSample.priority}优先级</Tag>
        </Col>
      </Row>

      <Steps current={currentStep} size="small" style={{ marginBottom: 16 }} items={[
        { title: '采样登记' }, { title: '样品接收' }, { title: '任务分配' },
        { title: '检测中' }, { title: '数据审核' }, { title: '报告生成' },
      ]} />

      <Card style={{ marginBottom: 16 }}>
        <Descriptions title="基本信息" column={3} size="small" bordered>
          <Descriptions.Item label="样品编号">{mockSample.sampleNo}</Descriptions.Item>
          <Descriptions.Item label="样品名称">{mockSample.name}</Descriptions.Item>
          <Descriptions.Item label="样品类型">{mockSample.type}</Descriptions.Item>
          <Descriptions.Item label="客户">{mockSample.customer}</Descriptions.Item>
          <Descriptions.Item label="来源项目">{mockSample.project}</Descriptions.Item>
          <Descriptions.Item label="采样地点">{mockSample.location}</Descriptions.Item>
          <Descriptions.Item label="采样时间">{mockSample.samplingTime}</Descriptions.Item>
          <Descriptions.Item label="接收时间">{mockSample.receivingTime}</Descriptions.Item>
          <Descriptions.Item label="接收人">{mockSample.receiver}</Descriptions.Item>
          <Descriptions.Item label="容器信息">{mockSample.container}</Descriptions.Item>
          <Descriptions.Item label="保存条件">{mockSample.storage}</Descriptions.Item>
          <Descriptions.Item label="分配实验室">{mockSample.lab}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="items" items={[
        { key: 'items', label: '检测项目', children: (
          <Table dataSource={testItems} rowKey="item" pagination={false} columns={[
            { title: '检测项目', dataIndex: 'item' },
            { title: '检测方法', dataIndex: 'method' },
            { title: '结果', dataIndex: 'result' },
            { title: '单位', dataIndex: 'unit' },
            { title: '状态', dataIndex: 'status', render: (s: string) => {
              const m: Record<string, [string, string]> = { completed: ['green', '已完成'], testing: ['blue', '检测中'], pending: ['default', '待检测'] };
              return <Tag color={m[s][0]}>{m[s][1]}</Tag>;
            }},
          ]} size="small" />
        )},
        { key: 'flow', label: '流转记录', children: (
          <Timeline items={flowRecords.map(r => ({ color: 'green', children: <><Text strong>{r.action}</Text><br /><Text>{r.user}</Text><br /><Text type="secondary">{r.time} {r.desc}</Text></> }))} />
        )},
        { key: 'subsamples', label: `子样品 (${subSamples.length})`, children: (
          <div>
            <Button size="small" type="primary" icon={<PlusOutlined />} style={{ marginBottom: 12 }} onClick={() => setSubModalOpen(true)}>
              新建子样品
            </Button>
            {subSamples.length === 0 ? <Empty description="暂无子样品" /> : (
              <Table dataSource={subSamples} rowKey="id" pagination={false} size="small" columns={subColumns} />
            )}
          </div>
        )},
        { key: 'retention', label: `留样管理 (${retentions.filter(r => r.status !== 'disposed').length})`, children: (
          <div>
            <Button size="small" type="primary" icon={<InboxOutlined />} style={{ marginBottom: 12 }} onClick={() => setRetModalOpen(true)}>
              登记留样
            </Button>
            {retentions.length === 0 ? <Empty description="暂无留样记录" /> : (
              <Table dataSource={retentions} rowKey="id" pagination={false} size="small" columns={retColumns} />
            )}
          </div>
        )},
        { key: 'attachments', label: '附件', children: <Empty description="暂无附件" image={Empty.PRESENTED_IMAGE_SIMPLE} /> },
        { key: 'coc', label: 'COC监管链', children: (
          <div>
            <Button size="small" type="primary" style={{ marginBottom: 12 }} onClick={() => navigate('/coc')}>
              查看完整COC
            </Button>
            <Card title="COC 事件时间线" size="small">
              <Timeline items={[
                { color: 'blue', children: <><Text strong>采样</Text><br /><Text>采样员 刘强</Text><br /><Text type="secondary">2024-05-20 09:30 现场采样完成</Text></> },
                { color: 'purple', children: <><Text strong>送样</Text><br /><Text>采样员 刘强</Text><br /><Text type="secondary">2024-05-20 10:00 冷链专送</Text></> },
                { color: 'cyan', children: <><Text strong>收样</Text><br /><Text>张伟</Text><br /><Text type="secondary">2024-05-20 10:45 样品完好,温度4°C</Text></> },
                { color: 'green', children: <><Text strong>登记</Text><br /><Text>张伟</Text><br /><Text type="secondary">2024-05-20 11:00 编号SMP20240520001</Text></> },
                { color: 'orange', children: <><Text strong>检测</Text><br /><Text>王明</Text><br /><Text type="secondary">2024-05-21 09:00 COD检测中</Text></> },
              ]} />
            </Card>
            <Card title="COC 完整性" size="small" style={{ marginTop: 12 }}>
              <Tag color="green">✅ 链完整</Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>当前状态: 流转中</Text>
            </Card>
          </div>
        )},
      ]} />

      {/* ===== 新建子样品 Modal ===== */}
      <Modal title="新建子样品" open={subModalOpen} onCancel={() => { setSubModalOpen(false); subForm.resetFields(); }} onOk={handleCreateSub} width={520}>
        <Form form={subForm} layout="vertical">
          <Form.Item name="name" label="子样品名称" rules={[{ required: true }]}>
            <Input placeholder="如：子样品-COD复测备用" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="amount" label="分样量" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="单位" rules={[{ required: true }]} initialValue="mL">
                <Select>
                  <Option value="mL">mL</Option>
                  <Option value="L">L</Option>
                  <Option value="g">g</Option>
                  <Option value="kg">kg</Option>
                  <Option value="mL">mL</Option>
                  <Option value="个">个</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="purpose" label="用途/目的">
            <Input.TextArea rows={2} placeholder="说明此子样品的用途，如：COD复测备用、重金属专用等" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ===== 子样品详情 Drawer ===== */}
      <Drawer title={`子样品详情 - ${selectedSub?.no}`} width={400} open={subDetailOpen} onClose={() => setSubDetailOpen(false)}>
        {selectedSub && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="子样品编号">{selectedSub.no}</Descriptions.Item>
            <Descriptions.Item label="名称">{selectedSub.name}</Descriptions.Item>
            <Descriptions.Item label="分样量">{selectedSub.amount}{selectedSub.unit}</Descriptions.Item>
            <Descriptions.Item label="用途">{selectedSub.purpose}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={getStatusColor(selectedSub.status)}>{selectedSub.statusLabel}</Tag></Descriptions.Item>
            <Descriptions.Item label="父样品">{selectedSub.parentNo}</Descriptions.Item>
            <Descriptions.Item label="创建人">{selectedSub.createdBy}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedSub.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>

      {/* ===== 登记留样 Modal ===== */}
      <Modal title="登记留样" open={retModalOpen} onCancel={() => { setRetModalOpen(false); retForm.resetFields(); }} onOk={handleCreateRetention} width={520}>
        <Form form={retForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="amount" label="留样量" rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} placeholder="数量" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="unit" label="单位" rules={[{ required: true }]} initialValue="mL">
                <Select>
                  <Option value="mL">mL</Option>
                  <Option value="L">L</Option>
                  <Option value="g">g</Option>
                  <Option value="kg">kg</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="condition" label="保存条件" rules={[{ required: true }]} initialValue="4°C冷藏">
            <Select>
              <Option value="4°C冷藏">4°C冷藏</Option>
              <Option value="-20°C冷冻">-20°C冷冻</Option>
              <Option value="-80°C超低温">-80°C超低温</Option>
              <Option value="常温避光">常温避光</Option>
              <Option value="常温">常温</Option>
            </Select>
          </Form.Item>
          <Form.Item name="expiryDate" label="到期日期" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} placeholder="选择留样到期日期" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="留样备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ===== 留样详情 Drawer ===== */}
      <Drawer title={`留样详情 - ${selectedRet?.batchNo}`} width={400} open={retDetailOpen} onClose={() => setRetDetailOpen(false)}>
        {selectedRet && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="留样批号">{selectedRet.batchNo}</Descriptions.Item>
            <Descriptions.Item label="留样量">{selectedRet.amount}{selectedRet.unit}</Descriptions.Item>
            <Descriptions.Item label="保存条件">{selectedRet.condition}</Descriptions.Item>
            <Descriptions.Item label="到期日期">{selectedRet.expiryDate}</Descriptions.Item>
            <Descriptions.Item label="剩余天数">
              <span style={{ color: selectedRet.daysLeft <= 7 ? '#ff4d4f' : selectedRet.daysLeft <= 14 ? '#faad14' : '#52c41a', fontWeight: 600 }}>
                {selectedRet.daysLeft}天
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={getStatusColor(selectedRet.status)}>{selectedRet.statusLabel}</Tag></Descriptions.Item>
            {selectedRet.disposedAt && (
              <>
                <Descriptions.Item label="处置时间">{selectedRet.disposedAt}</Descriptions.Item>
                <Descriptions.Item label="处置人">{selectedRet.disposedBy}</Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="备注">{selectedRet.remark || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </div>
  );
};

export default SampleDetailPage;
