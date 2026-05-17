import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Row, Col, Typography, Statistic, Select, Modal, Form, message, Tabs, Input, Badge, Alert, Tag } from 'antd';
import { PlusOutlined, CalendarOutlined, DollarOutlined, WarningOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface Reservation {
  id: string; instrument: string; user: string; group: string; project: string;
  date: string; time: string; fee: number; status: string;
}

interface Rule {
  instrument: string; method: string; rate: string; priorityRate: string; freePeriod: string; overtimeRate: string; penalty: string;
}

export const ReservationPage: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [conflictMsg, setConflictMsg] = useState<string | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRes, ruleRes] = await Promise.all([
        window.fetch('/api/v1/research/reservations'),
        window.fetch('/api/v1/research/reservations/rules'),
      ]);
      const resJson = await resRes.json();
      const ruleJson = await ruleRes.json();
      setReservations(resJson.data?.list || []);
      setRules(ruleJson.data?.list || []);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const checkConflict = async (instrument: string, date: string) => {
    try {
      const res = await fetch(`/api/v1/research/reservations/conflicts?instrument=${encodeURIComponent(instrument)}&date=${date}`);
      const json = await res.json();
      if (json.data?.hasConflict) {
        setConflictMsg(`该仪器在 ${date} 已有 ${json.data.conflicts.length} 个预约，可能存在时间冲突`);
      } else {
        setConflictMsg(null);
      }
    } catch { setConflictMsg(null); }
  };

  const handleCreate = async (values: any) => {
    const res = await window.fetch('/api/v1/research/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const json = await res.json();
    if (json.code === 200) { message.success('预约成功'); setModalVisible(false); form.resetFields(); setConflictMsg(null); fetchData(); }
  };

  const stats = { total: reservations.length, active: reservations.filter(r => r.status === 'active').length, pending: reservations.filter(r => r.status === 'pending').length, totalFee: reservations.reduce((s, r) => s + (r.fee || 0), 0) };

  const statusBadge = (s: string) => {
    if (s === 'active') return <Badge status="processing" text="使用中" />;
    if (s === 'completed') return <Badge status="success" text="已完成" />;
    if (s === 'pending') return <Badge status="warning" text="待确认" />;
    return <Badge status="default" text={s} />;
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>仪器共享预约</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建预约</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="本月预约" value={stats.total} prefix={<CalendarOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="使用中" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="待确认" value={stats.pending} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="总费用" value={`¥${stats.totalFee}`} prefix={<DollarOutlined />} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="calendar" items={[
        { key: 'calendar', label: '预约日历', children: (
          <Row gutter={16}>
            <Col span={16}>
              <Card title="周排期视图" size="small">
                <div style={{display:'grid',gridTemplateColumns:'100px repeat(5,1fr)',gap:2,fontSize:12}}>
                  <div style={{fontWeight:600,padding:8,background:'#f5f5f5'}}>仪器\时间</div>
                  {['周一 05-19','周二 05-20','周三 05-21','周四 05-22','周五 05-23'].map(d => <div key={d} style={{fontWeight:600,padding:8,background:'#f5f5f5',textAlign:'center'}}>{d}</div>)}
                  {[
                    {inst:'ICP-MS', slots:[{day:0,time:'08:00-10:00',user:'张明',group:'环境分析',color:'#e6f4ff'},{day:3,time:'09:00-12:00',user:'郑丽',color:'#fff7e6'}]},
                    {inst:'气相色谱', slots:[{day:0,time:'08:30-11:00',user:'李华',group:'光谱分析',color:'#f6ffed'},{day:2,time:'14:00-17:00',user:'周敏',color:'#fff0f6'}]},
                    {inst:'紫外分光', slots:[{day:0,time:'13:30-15:00',user:'王芳',group:'环境分析',color:'#e6f4ff'}]},
                    {inst:'原子吸收', slots:[{day:1,time:'09:00-12:00',user:'赵岩',color:'#f6ffed'},{day:3,time:'10:00-12:00',user:'赵敏',color:'#fff7e6'}]},
                    {inst:'荧光分光', slots:[{day:2,time:'08:00-10:00',user:'陈静',color:'#f6ffed'}]},
                    {inst:'自动滴定', slots:[{day:4,time:'13:00-16:00',user:'张伟',color:'#f0f5ff'}]},
                  ].map(row => <React.Fragment key={row.inst}>
                    <div style={{padding:8,borderBottom:'1px solid #f0f0f0',fontWeight:500}}>{row.inst}</div>
                    {[0,1,2,3,4].map(d => {
                      const slot = row.slots.find(s => s.day === d);
                      return <div key={d} style={{padding:4,borderBottom:'1px solid #f0f0f0',minHeight:40}}>
                        {slot && <div style={{background:slot.color,padding:'2px 4px',borderRadius:4,border:'1px solid '+(slot.color.replace('ff','cc')),fontSize:11}}>
                          <div>{slot.time}</div>
                          <div>{slot.user} {slot.group && `(${slot.group})`}</div>
                        </div>}
                      </div>;
                    })}
                  </React.Fragment>)}
                </div>
              </Card>
            </Col>
            <Col span={8}>
              <Card title="预约列表" size="small" style={{marginBottom:16}}>
                <Table dataSource={reservations} rowKey="id" loading={loading} pagination={false} size="small" columns={[
                  {title:'仪器',dataIndex:'instrument',ellipsis:true},
                  {title:'预约人',dataIndex:'user'},
                  {title:'时间',dataIndex:'time'},
                  {title:'状态',dataIndex:'status',render:(s:string) => statusBadge(s)},
                ]} />
              </Card>
              <Button type="primary" icon={<PlusOutlined />} block onClick={() => setModalVisible(true)}>新建预约</Button>
            </Col>
          </Row>
        )},
        { key: 'rules', label: '计费规则', children: (
          <Card>
            <Table dataSource={rules} rowKey="instrument" pagination={false} columns={[
              { title: '仪器', dataIndex: 'instrument' },
              { title: '计费方式', dataIndex: 'method', render: (m: string) => <Tag>{m === 'hourly' ? '按时计费' : '按次计费'}</Tag> },
              { title: '常规费率', dataIndex: 'rate', render: (v: number, r: Rule) => `¥${v}/${r.method === 'hourly' ? '小时' : '次'}` },
              { title: '优先费率', dataIndex: 'priorityRate', render: (v: number, r: Rule) => `¥${v}/${r.method === 'hourly' ? '小时' : '次'}` },
              { title: '免费时段', dataIndex: 'freePeriod' },
              { title: '超时费率', dataIndex: 'overtimeRate', render: (v: number, r: Rule) => `¥${v}/${r.method === 'hourly' ? '小时' : '次'}` },
              { title: '未打卡处罚', dataIndex: 'penalty', render: (v: number) => `¥${v}` },
            ]} size="small" bordered />
          </Card>
        )},
        { key: 'stats', label: '使用统计', children: (
          <Card>
            <Row gutter={16}>
              <Col span={8}><Statistic title="仪器使用TOP1" value="色谱质谱课题组" suffix="120次" /></Col>
              <Col span={8}><Statistic title="平均利用率" value="63.2" suffix="%" /></Col>
              <Col span={8}><Statistic title="违规次数" value={3} suffix="次" valueStyle={{ color: '#ff4d4f' }} /></Col>
            </Row>
          </Card>
        )},
      ]} />

      <Modal title="新建预约" open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); form.resetFields(); setConflictMsg(null); }} width={520}>
        {conflictMsg && <Alert message={conflictMsg} type="warning" showIcon icon={<WarningOutlined />} style={{ marginBottom: 16 }} />}
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="instrument" label="选择仪器" rules={[{ required: true }]}>
            <Select onChange={() => { setConflictMsg(null); }}>
              <Select.Option value="ICP-MS质谱仪 ICP-001">ICP-MS质谱仪 ICP-001</Select.Option>
              <Select.Option value="气相色谱仪 GC-002">气相色谱仪 GC-002</Select.Option>
              <Select.Option value="紫外分光光度计 UV-001">紫外分光光度计 UV-001</Select.Option>
              <Select.Option value="原子吸收光谱仪 AAS-001">原子吸收光谱仪 AAS-001</Select.Option>
              <Select.Option value="液相色谱仪 LC-001">液相色谱仪 LC-001</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="user" label="预约人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="group" label="课题组"><Input /></Form.Item>
          <Form.Item name="project" label="关联项目"><Input /></Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}>
            <Input placeholder="YYYY-MM-DD" onBlur={(e) => {
              const inst = form.getFieldValue('instrument');
              if (inst && e.target.value) checkConflict(inst, e.target.value);
            }} />
          </Form.Item>
          <Form.Item name="time" label="时间段" rules={[{ required: true }]}><Input placeholder="如: 09:00-12:00" /></Form.Item>
          <Form.Item name="purpose" label="用途说明"><Input.TextArea rows={2} placeholder="简要说明实验目的..." /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
