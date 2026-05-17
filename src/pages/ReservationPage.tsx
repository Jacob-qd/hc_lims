import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Space, Modal, Form, Input, Select, DatePicker, TimePicker, message, Alert, Row, Col, Statistic } from 'antd';
import { PlusOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

interface Reservation {
  id: string; instrumentId: string; instrumentName: string;
  userName: string; startTime: string; endTime: string; purpose: string;
  status: string; statusLabel: string; cost: number;
}

const instruments = [
  { id: 'i1', name: 'ICP-MS', model: 'NexION 350X', status: 'available', statusLabel: '可用' },
  { id: 'i2', name: 'GC-MS', model: 'Agilent 7890B', status: 'available', statusLabel: '可用' },
  { id: 'i3', name: '原子吸收光谱仪', model: 'PinAAcle 900T', status: 'maintenance', statusLabel: '维护中' },
  { id: 'i4', name: '离子色谱仪', model: 'ICS-600', status: 'available', statusLabel: '可用' },
  { id: 'i5', name: '紫外分光光度计', model: 'UV-2600', status: 'available', statusLabel: '可用' },
];

export const ReservationPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [conflictMsg, setConflictMsg] = useState('');
  const [form] = Form.useForm();

  const fetchReservations = () => {
    setLoading(true);
    fetch('/api/v1/research/reservations')
      .then(r => r.json())
      .then(res => { if (res.code === 200) setReservations(res.data.list); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReservations(); }, []);

  const handleDelete = (id: string) => {
    fetch(`/api/v1/research/reservations/${id}`, { method: 'DELETE' })
      .then(() => { message.success('取消成功'); fetchReservations(); });
  };

  const checkConflict = (instrumentId: string, start: string, end: string) => {
    return reservations.find(r =>
      r.instrumentId === instrumentId && r.status !== 'rejected' &&
      ((start >= r.startTime && start < r.endTime) || (end > r.startTime && end <= r.endTime))
    );
  };

  const handleSubmit = async (values: any) => {
    const date = values.date.format('YYYY-MM-DD');
    const startTime = values.timeRange[0].format('HH:mm');
    const endTime = values.timeRange[1].format('HH:mm');
    const start = `${date} ${startTime}:00`;
    const end = `${date} ${endTime}:00`;
    const conflict = checkConflict(values.instrumentId, start, end);
    if (conflict) { setConflictMsg(`该时段已被 ${conflict.userName} 预约 (${conflict.startTime.slice(11, 16)}-${conflict.endTime.slice(11, 16)})`); return; }
    setConflictMsg('');
    const instrument = instruments.find(i => i.id === values.instrumentId);
    const payload = { instrumentId: values.instrumentId, instrumentName: instrument?.name || '', userId: '3', userName: '李思', startTime: start, endTime: end, purpose: values.purpose, sampleInfo: values.sampleInfo };
    const res = await fetch('/api/v1/research/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.code === 200) { message.success('预约成功'); setModalOpen(false); form.resetFields(); fetchReservations(); }
    else if (data.code === 409) { setConflictMsg(data.message); }
    else { message.error(data.message || '预约失败'); }
  };

  const statusColors: Record<string, string> = { pending: 'orange', approved: 'green', rejected: 'red', completed: 'blue' };

  const columns = [
    { title: '仪器', dataIndex: 'instrumentName' },
    { title: '预约人', dataIndex: 'userName', width: 100 },
    { title: '用途', dataIndex: 'purpose', ellipsis: true },
    { title: '开始时间', dataIndex: 'startTime', width: 160 },
    { title: '结束时间', dataIndex: 'endTime', width: 160 },
    { title: '状态', dataIndex: 'status', width: 100, render: (s: string, r: Reservation) => <Tag color={statusColors[s]}>{r.statusLabel}</Tag> },
    { title: '操作', width: 120, render: (_: any, r: Reservation) => <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)}>取消</Button> },
  ];

  const todayRes = reservations.filter(r => r.startTime?.startsWith(dayjs().format('YYYY-MM-DD')));

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><Card><Statistic title="今日预约" value={todayRes.length} prefix={<CalendarOutlined />} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="进行中" value={todayRes.filter(r => r.status === 'approved').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="可用仪器" value={instruments.filter(i => i.status === 'available').length} suffix={`/ ${instruments.length}`} /></Card></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {instruments.map(inst => (
          <Col key={inst.id} xs={24} sm={12} md={8}>
            <Card size="small">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><strong>{inst.name}</strong><div style={{ fontSize: 12, color: '#999' }}>{inst.model}</div></div>
                <Tag color={inst.status === 'available' ? 'green' : inst.status === 'maintenance' ? 'orange' : 'red'}>{inst.statusLabel}</Tag>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title={<Space><ClockCircleOutlined />仪器预约</Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setConflictMsg(''); form.resetFields(); setModalOpen(true); }}>新建预约</Button>}>
        <Table dataSource={reservations} rowKey="id" columns={columns} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title="新建预约" open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose width={500}>
        {conflictMsg && <Alert message={conflictMsg} type="error" showIcon style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="instrumentId" label="选择仪器" rules={[{ required: true }]}>
            <Select placeholder="选择仪器">
              {instruments.filter(i => i.status === 'available').map(i => (
                <Option key={i.id} value={i.id}>{i.name} ({i.model})</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="date" label="预约日期" rules={[{ required: true }]} ><DatePicker style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="timeRange" label="预约时段" rules={[{ required: true }]} ><TimePicker.RangePicker format="HH:mm" minuteStep={15} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="purpose" label="用途" rules={[{ required: true }]} > <Input placeholder="填写用途" /> </Form.Item>
          <Form.Item name="sampleInfo" label="样品信息"> <Input placeholder="可选" /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
