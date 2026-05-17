import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Row, Col, Typography, Statistic, Select, Modal, Form, message, Tabs, Input, Badge, Segmented, Tooltip, Tag, Space, List } from 'antd';
import { PlusOutlined, CalendarOutlined, DollarOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, BarChartOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
  completed: { color: '#52c41a', text: '已完成', icon: <CheckCircleOutlined /> },
  active: { color: '#1677ff', text: '使用中', icon: <ClockCircleOutlined /> },
  pending: { color: '#faad14', text: '待确认', icon: <WarningOutlined /> },
  cancelled: { color: '#ff4d4f', text: '已取消', icon: <WarningOutlined /> },
};

const instrumentStatus: Record<string, { color: string; text: string }> = {
  idle: { color: '#52c41a', text: '空闲' },
  running: { color: '#1677ff', text: '运行中' },
  maintenance: { color: '#faad14', text: '维护中' },
  fault: { color: '#ff4d4f', text: '故障' },
};

const groupColors = ['#e6f4ff', '#f6ffed', '#fff7e6', '#fff0f6', '#f0f5ff', '#fff2e8', '#f6ffed', '#e6fffb'];

export const ReservationPage: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [calendarView, setCalendarView] = useState<'week' | 'day'>('week');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await window.fetch('/api/v1/research/reservations');
      const json = await res.json();
      setReservations(json.data?.list || []);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (values: any) => {
    const res = await window.fetch('/api/v1/research/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const json = await res.json();
    if (json.code === 200) { message.success('预约成功'); setModalVisible(false); form.resetFields(); fetchData(); }
  };

  const stats = {
    total: reservations.length,
    active: reservations.filter((r: any) => r.status === 'active').length,
    pending: reservations.filter((r: any) => r.status === 'pending').length,
    totalFee: reservations.reduce((s: number, r: any) => s + (r.fee || 0), 0)
  };

  const instruments = [
    { name: 'ICP-MS质谱仪 ICP-001', status: 'running', location: '质谱室301' },
    { name: '气相色谱仪 GC-002', status: 'idle', location: '色谱室202' },
    { name: '紫外分光光度计 UV-001', status: 'idle', location: '光谱室203' },
    { name: '原子吸收光谱仪 AAS-001', status: 'running', location: '光谱室201' },
    { name: '液相色谱仪 LC-001', status: 'maintenance', location: '色谱室101' },
    { name: '荧光分光光度计 FL-001', status: 'idle', location: '光谱室205' },
  ];

  const groupColorMap: Record<string, string> = {};
  reservations.forEach((r: any, i: number) => {
    if (!groupColorMap[r.group]) groupColorMap[r.group] = groupColors[i % groupColors.length];
  });

  const calendarData = [
    {inst:'ICP-MS质谱仪', slots:[{day:0,time:'08:00-10:00',user:'张明',group:'环境分析课题组',color:'#e6f4ff'},{day:3,time:'09:00-12:00',user:'郑丽',group:'分析化学课题组',color:'#fff7e6'}]},
    {inst:'气相色谱仪', slots:[{day:0,time:'08:30-11:00',user:'李华',group:'光谱分析课题组',color:'#f6ffed'},{day:2,time:'14:00-17:00',user:'周敏',group:'色谱质谱课题组',color:'#fff0f6'}]},
    {inst:'紫外分光光度计', slots:[{day:0,time:'13:30-15:00',user:'王芳',group:'环境分析课题组',color:'#e6f4ff'}]},
    {inst:'原子吸收光谱仪', slots:[{day:1,time:'09:00-12:00',user:'赵岩',group:'环境分析课题组',color:'#f6ffed'},{day:3,time:'10:00-12:00',user:'赵敏',group:'环境毒理课题组',color:'#fff7e6'}]},
    {inst:'荧光分光光度计', slots:[{day:2,time:'08:00-10:00',user:'陈静',group:'生物传感课题组',color:'#f6ffed'}]},
    {inst:'自动滴定仪', slots:[{day:4,time:'13:00-16:00',user:'张伟',group:'环境分析课题组',color:'#f0f5ff'}]},
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>仪器共享预约</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建预约</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="本月预约" value={stats.total} prefix={<CalendarOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="使用中" value={stats.active} valueStyle={{ color: '#52c41a' }} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="待确认" value={stats.pending} valueStyle={{ color: '#1677ff' }} prefix={<WarningOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="总费用" value={`¥${stats.totalFee}`} prefix={<DollarOutlined />} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="calendar" items={[
        { key: 'calendar', label: '预约日历', children: (
          <Row gutter={16}>
            <Col span={16}>
              <Card size="small" title={
                <Row justify="space-between" align="middle">
                  <Col>周排期视图</Col>
                  <Col>
                    <Segmented value={calendarView} onChange={v => setCalendarView(v as 'week' | 'day')} options={[
                      { label: '周视图', value: 'week' },
                      { label: '日视图', value: 'day' },
                    ]} />
                  </Col>
                </Row>
              }>
                {calendarView === 'week' ? (
                  <div style={{display:'grid',gridTemplateColumns:'120px repeat(5,1fr)',gap:2,fontSize:12}}>
                    <div style={{fontWeight:600,padding:8,background:'#f5f5f5'}}>仪器\时间</div>
                    {['周一 05-19','周二 05-20','周三 05-21','周四 05-22','周五 05-23'].map(d => <div key={d} style={{fontWeight:600,padding:8,background:'#f5f5f5',textAlign:'center'}}>{d}</div>)}
                    {calendarData.map(row => <React.Fragment key={row.inst}>
                      <div style={{padding:8,borderBottom:'1px solid #f0f0f0',fontWeight:500}}>{row.inst}</div>
                      {[0,1,2,3,4].map(d => {
                        const slot = row.slots.find(s => s.day === d);
                        return <div key={d} style={{padding:4,borderBottom:'1px solid #f0f0f0',minHeight:40}}>
                          {slot && <Tooltip title={`${slot.user} · ${slot.group}`}>
                            <div style={{background:slot.color,padding:'2px 4px',borderRadius:4,border:'1px solid '+(slot.color.replace('ff','cc')),fontSize:11,cursor:'pointer'}}>
                              <div>{slot.time}</div>
                              <div>{slot.user}</div>
                            </div>
                          </Tooltip>}
                        </div>;
                      })}
                    </React.Fragment>)}
                  </div>
                ) : (
                  <div>
                    <Select placeholder="选择仪器" style={{ width: 200, marginBottom: 16 }} value={selectedInstrument} onChange={v => setSelectedInstrument(v)}>
                      {instruments.map(i => <Select.Option key={i.name} value={i.name}>{i.name}</Select.Option>)}
                    </Select>
                    <div style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:2,fontSize:12}}>
                      <div style={{fontWeight:600,padding:8,background:'#f5f5f5'}}>时间</div>
                      <div style={{fontWeight:600,padding:8,background:'#f5f5f5',textAlign:'center'}}>预约情况</div>
                      {['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map(t => (
                        <React.Fragment key={t}>
                          <div style={{padding:8,borderBottom:'1px solid #f0f0f0'}}>{t}</div>
                          <div style={{padding:4,borderBottom:'1px solid #f0f0f0',minHeight:30}} />
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
              <div style={{ marginTop: 8 }}>
                <Space>
                  <Text type="secondary">图例:</Text>
                  {Object.entries(groupColorMap).map(([group, color]) => (
                    <Tag key={group} color={color} style={{ borderColor: color }}>{group}</Tag>
                  ))}
                </Space>
              </div>
            </Col>
            <Col span={8}>
              <Card title="仪器状态" size="small" style={{marginBottom:16}}>
                <List size="small" dataSource={instruments} renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      title={<Text strong style={{ fontSize: 12 }}>{item.name}</Text>}
                      description={<Text type="secondary" style={{ fontSize: 11 }}>{item.location}</Text>}
                    />
                    <Badge color={instrumentStatus[item.status]?.color} text={instrumentStatus[item.status]?.text} />
                  </List.Item>
                )} />
              </Card>
              <Card title="预约列表" size="small" style={{marginBottom:16}}>
                <Table dataSource={reservations} rowKey="id" loading={loading} pagination={false} size="small" columns={[
                  {title:'仪器',dataIndex:'instrument',ellipsis:true},
                  {title:'预约人',dataIndex:'user'},
                  {title:'时间',dataIndex:'time'},
                  {title:'状态',dataIndex:'status',render:(s:string) => <Badge status={s==='active'?'processing':s==='completed'?'success':'default'} text={statusMap[s]?.text} />},
                ]} />
              </Card>
              <Button type="primary" icon={<PlusOutlined />} block onClick={() => setModalVisible(true)}>新建预约</Button>
            </Col>
          </Row>
        )},
        { key: 'records', label: '使用记录', children: (
          <Card>
            <Table dataSource={reservations} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
              { title: '预约编号', dataIndex: 'id', render: (n: string) => <Text code>{n}</Text> },
              { title: '仪器', dataIndex: 'instrument' },
              { title: '预约人', dataIndex: 'user' },
              { title: '课题组', dataIndex: 'group' },
              { title: '日期', dataIndex: 'date' },
              { title: '时间段', dataIndex: 'time' },
              { title: '费用', dataIndex: 'fee', render: (v: number) => `¥${v}` },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusMap[s]?.color}>{statusMap[s]?.text}</Tag> },
            ]} size="small" bordered />
          </Card>
        )},
        { key: 'rules', label: '计费规则', children: (
          <Card>
            <Table dataSource={[
              { instrument: 'ICP-MS质谱仪 ICP-001', method: '按时计费', rate: '¥200/小时', priority: '¥300/小时', free: '00:00-08:00', overtime: '¥300/小时', penalty: '¥50/次' },
              { instrument: '液相色谱仪 LC-001', method: '按时计费', rate: '¥150/小时', priority: '¥200/小时', free: '00:00-08:00', overtime: '¥200/小时', penalty: '¥50/次' },
              { instrument: '紫外分光光度计 UV-001', method: '按次计费', rate: '¥50/次', priority: '¥80/次', free: '-', overtime: '¥30/次', penalty: '¥20/次' },
              { instrument: '气相色谱仪 GC-002', method: '按时计费', rate: '¥150/小时', priority: '¥200/小时', free: '00:00-08:00', overtime: '¥200/小时', penalty: '¥50/次' },
            ]} rowKey="instrument" pagination={false} columns={[
              { title: '仪器', dataIndex: 'instrument' },
              { title: '计费方式', dataIndex: 'method' },
              { title: '常规费率', dataIndex: 'rate' },
              { title: '优先费率', dataIndex: 'priority' },
              { title: '免费时段', dataIndex: 'free' },
              { title: '超时费率', dataIndex: 'overtime' },
              { title: '未打卡处罚', dataIndex: 'penalty' },
            ]} size="small" bordered />
          </Card>
        )},
        { key: 'stats', label: '使用统计', children: (
          <Card>
            <Row gutter={[16, 16]}>
              <Col span={8}><Card size="small"><Statistic title="仪器使用TOP1" value="色谱质谱课题组" suffix="120次" prefix={<BarChartOutlined />} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="平均利用率" value="63.2" suffix="%" prefix={<BarChartOutlined />} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="违规次数" value={3} suffix="次" valueStyle={{ color: '#ff4d4f' }} prefix={<WarningOutlined />} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="超时次数" value={2} suffix="次" valueStyle={{ color: '#faad14' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="未打卡次数" value={1} suffix="次" valueStyle={{ color: '#faad14' }} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="取消次数" value={0} suffix="次" valueStyle={{ color: '#52c41a' }} /></Card></Col>
            </Row>
          </Card>
        )},
      ]} />

      <Modal title="新建预约" open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); form.resetFields(); }} width={520}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="instrument" label="选择仪器" rules={[{ required: true }]}>
            <Select placeholder="请选择仪器">
              {instruments.map(i => (
                <Select.Option key={i.name} value={i.name}>
                  <Space>
                    {i.name}
                    <Badge color={instrumentStatus[i.status]?.color} text={instrumentStatus[i.status]?.text} />
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="user" label="预约人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="group" label="课题组"><Input /></Form.Item>
          <Form.Item name="project" label="关联项目"><Input /></Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true }]}><Input placeholder="YYYY-MM-DD" /></Form.Item>
          <Form.Item name="time" label="时间段" rules={[{ required: true }]}><Input placeholder="如: 09:00-12:00" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
