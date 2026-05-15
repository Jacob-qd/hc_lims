import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Row, Col,
  Space, Typography, Drawer, Tabs, Descriptions, Timeline, Badge, Statistic,
  Modal, Form, message, Tooltip, Progress, Divider,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, ExportOutlined, EditOutlined,
  EyeOutlined, ToolOutlined, CalendarOutlined,
  CheckCircleOutlined, CloseCircleOutlined, SyncOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Pie } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Instrument {
  id: string; name: string; model: string; serialNo: string;
  manufacturer: string; location: string; responsiblePerson: string;
  purchaseDate: string; inUseDate: string;
  status: 'running' | 'idle' | 'maintenance' | 'calibration_due' | 'offline';
  statusLabel: string; connectionStatus: 'online' | 'offline';
  utilization: number; calibrationDue: string; maintenanceDate: string;
  department: string; description?: string;
}

const statusColorMap: Record<string, string> = {
  running: '#52c41a', idle: '#1677ff', maintenance: '#faad14',
  calibration_due: '#ff4d4f', offline: '#d9d9d9',
};

const InstrumentDetail: React.FC<{ instrument: Instrument | null; visible: boolean; onClose: () => void }> = ({ instrument, visible, onClose }) => {
  if (!instrument) return null;
  return (
    <Drawer title={`${instrument.name} - 详情`} open={visible} onClose={onClose} width={560}>
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="仪器名称" span={2}>{instrument.name}</Descriptions.Item>
        <Descriptions.Item label="型号">{instrument.model}</Descriptions.Item>
        <Descriptions.Item label="序列号">{instrument.serialNo}</Descriptions.Item>
        <Descriptions.Item label="生产厂家" span={2}>{instrument.manufacturer}</Descriptions.Item>
        <Descriptions.Item label="所在位置">{instrument.location}</Descriptions.Item>
        <Descriptions.Item label="所属部门">{instrument.department}</Descriptions.Item>
        <Descriptions.Item label="负责人">{instrument.responsiblePerson}</Descriptions.Item>
        <Descriptions.Item label="连接状态">
          <Tag color={instrument.connectionStatus === 'online' ? 'green' : 'red'}>{instrument.connectionStatus === 'online' ? '在线' : '离线'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="购置日期">{instrument.purchaseDate}</Descriptions.Item>
        <Descriptions.Item label="启用日期">{instrument.inUseDate}</Descriptions.Item>
        <Descriptions.Item label="校准到期日">
          <Text type={dayjs(instrument.calibrationDue).isBefore(dayjs()) ? 'danger' : undefined}>{instrument.calibrationDue}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="最近维护">{instrument.maintenanceDate}</Descriptions.Item>
        <Descriptions.Item label="利用率">
          <Progress percent={instrument.utilization} size="small" />
        </Descriptions.Item>
      </Descriptions>
      <Divider />
      <Tabs items={[
        { key: 'calibrations', label: '校准记录', children: (
          <Table dataSource={[
            {date:'2023-08-15',item:'波长准确度',result:'合格',cert:'CAL20230815-001',valid:'2024-08-15',agency:'中国计量科学研究院'},
            {date:'2022-08-15',item:'波长准确度',result:'合格',cert:'CAL20220815-001',valid:'2023-08-15',agency:'中国计量科学研究院'},
          ]} rowKey="cert" pagination={false} size="small" columns={[
            {title:'校准日期',dataIndex:'date'},{title:'校准项目',dataIndex:'item'},{title:'结果',dataIndex:'result',render:(r:string) => <Tag color={r==='合格'?'green':'red'}>{r}</Tag>},
            {title:'证书编号',dataIndex:'cert'},{title:'有效期至',dataIndex:'valid'},{title:'校准机构',dataIndex:'agency'},
          ]} />
        )},
        { key: 'maintenances', label: '维护记录', children: (
          <Table dataSource={[
            {date:'2024-05-10',type:'定期维护',content:'更换密封垫、清洗进样口',person:'张伟',status:'completed'},
            {date:'2024-04-10',type:'定期维护',content:'更换进样垫',person:'张伟',status:'completed'},
          ]} rowKey="date" pagination={false} size="small" columns={[
            {title:'日期',dataIndex:'date'},{title:'类型',dataIndex:'type'},{title:'内容',dataIndex:'content'},
            {title:'负责人',dataIndex:'person'},{title:'状态',dataIndex:'status',render:(s:string) => <Tag color={s==='completed'?'green':'orange'}>{s==='completed'?'已完成':'进行中'}</Tag>},
          ]} />
        )},
        { key: 'verification', label: '期间核查', children: (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Button size="small" type="primary" onClick={() => {
                Modal.confirm({ title: '新增期间核查', content: (
                  <Form layout="vertical">
                    <Form.Item label="核查项目"><Select defaultValue="wavelength" style={{width:300}}>
                      <Option value="wavelength">波长准确度</Option>
                      <Option value="repeatability">重复性</Option>
                      <Option value="sensitivity">灵敏度</Option>
                      <Option value="resolution">分辨率</Option>
                    </Select></Form.Item>
                    <Form.Item label="核查结果"><Select defaultValue="pass" style={{width:300}}>
                      <Option value="pass">合格</Option>
                      <Option value="fail">不合格</Option>
                    </Select></Form.Item>
                    <Form.Item label="备注"><Input.TextArea rows={2} /></Form.Item>
                  </Form>
                ), onOk: () => message.success('期间核查记录已保存'), });
              }}>新增核查</Button>
              <Button size="small" onClick={() => message.info('核查计划: 每季度一次, 下次核查: 2026-08-15')}>核查计划</Button>
            </Space>
            <Table dataSource={[
              { date:'2026-05-15', item:'波长准确度', result:'合格', operator:'张伟', nextDate:'2026-08-15' },
              { date:'2026-02-15', item:'重复性', result:'合格', operator:'张伟', nextDate:'2026-05-15' },
              { date:'2025-11-15', item:'灵敏度', result:'合格', operator:'张伟', nextDate:'2026-02-15' },
            ]} rowKey="date" pagination={false} size="small" columns={[
              { title:'核查日期', dataIndex:'date' },
              { title:'核查项目', dataIndex:'item' },
              { title:'结果', dataIndex:'result', render:(r:string) => <Tag color={r==='合格'?'green':'red'}>{r}</Tag> },
              { title:'核查人', dataIndex:'operator' },
              { title:'下次核查', dataIndex:'nextDate' },
            ]} />
          </div>
        )},
        { key: 'monitoring', label: '实时监控', children: (
          <div>
            <Row gutter={[8,8]} style={{ marginBottom: 12 }}>
              <Col span={8}><Card size="small"><Statistic title="流速" value="1.2" suffix="mL/min" valueStyle={{fontSize:20}} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="柱温" value="35" suffix="°C" valueStyle={{fontSize:20}} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="压力" value="8.5" suffix="MPa" valueStyle={{fontSize:20,color:'#1677ff'}} /></Card></Col>
            </Row>
            <Row gutter={[8,8]}>
              <Col span={8}><Card size="small"><Statistic title="波长" value="254" suffix="nm" valueStyle={{fontSize:20}} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="运行时长" value="2h15m" valueStyle={{fontSize:20}} /></Card></Col>
              <Col span={8}><Card size="small"><Statistic title="当前样品" value="S-001" valueStyle={{fontSize:20}} /></Card></Col>
            </Row>
            <div style={{marginTop:12,padding:8,background:'#fafafa',borderRadius:4}}>
              <Text strong>压力趋势</Text>
              <svg viewBox="0 0 300 100" style={{width:'100%',height:100,marginTop:4}}>
                <rect x={0} y={0} width={300} height={100} fill="#f5f5f5" rx={4} />
                <path d={Array.from({length:30},(_,i)=>`${i===0?'M':'L'}${i*10},${80-Math.sin(i*0.5)*15-Math.random()*5}`).join('')} stroke="#1677ff" strokeWidth={2} fill="none" />
                <text x={0} y={95} fontSize={10} fill="#999">0</text>
                <text x={290} y={95} fontSize={10} fill="#999" textAnchor="end">30min</text>
                <line x1={0} y1={30} x2={300} y2={30} stroke="#ff4d4f" strokeWidth={1} strokeDasharray="4,2" />
                <text x={300} y={28} fontSize={9} fill="#ff4d4f" textAnchor="end">上限 10MPa</text>
              </svg>
              <Text type="secondary" style={{fontSize:11}}>数据模拟 · 每30秒更新一次</Text>
            </div>
          </div>
        )},
        { key: 'usage', label: '使用记录', children: <Card size="small"><Text strong>利用率趋势 (近30天)</Text><svg viewBox="0 0 400 180" style={{width:'100%',height:200,marginTop:8}}>
              <rect x={40} y={10} width={340} height={140} fill="#fafafa" rx={4} />
              {[50,95,140].map(y => <line key={y} x1={40} y1={y} x2={380} y2={y} stroke="#f0f0f0" />)}
              <path d={[65,55,75,60,80,70,85,65,78,72,82,68,88,75,92,78,85,80,90,76,86,70,82,74,88,72].map((v,i)=>`${i===0?'M':'L'}${40+i*14},${150-v}`).join('')} stroke="#1677ff" strokeWidth={2} fill="none" />
              <text x={50} y={165} textAnchor="middle" fontSize={10} fill="#999">05-01</text>
              <text x={200} y={165} textAnchor="middle" fontSize={10} fill="#999">05-15</text>
              <text x={350} y={165} textAnchor="middle" fontSize="10" fill="#999">05-30</text>
            </svg></Card> },
      ]} />
    </Drawer>
  );
};

export const InstrumentsPage: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchText) params.set('keyword', searchText);
      const res = await fetch(`/api/v1/instruments?${params}`);
      const json = await res.json();
      setInstruments(json.data.list);
    } catch { message.error('加载仪器列表失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInstruments(); }, [statusFilter, searchText]);

  const stats = {
    total: instruments.length,
    running: instruments.filter(i => i.status === 'running').length,
    maintenance: instruments.filter(i => i.status === 'maintenance' || i.status === 'calibration_due').length,
    idle: instruments.filter(i => i.status === 'idle').length,
  };

  const distributionData = [
    { type: '运行中', value: instruments.filter(i => i.status === 'running').length },
    { type: '空闲', value: instruments.filter(i => i.status === 'idle').length },
    { type: '维护中', value: instruments.filter(i => i.status === 'maintenance').length },
    { type: '校准逾期', value: instruments.filter(i => i.status === 'calibration_due').length },
    { type: '离线', value: instruments.filter(i => i.status === 'offline').length },
  ].filter(d => d.value > 0);

  const columns: ColumnsType<Instrument> = [
    { title: '仪器编号', dataIndex: 'id', key: 'id', width: 90, render: (id: string) => <Text code>{id.toUpperCase()}</Text> },
    { title: '仪器名称', dataIndex: 'name', key: 'name', render: (name: string, r: Instrument) => <a onClick={() => { setSelectedInstrument(r); setDrawerVisible(true); }}>{name}</a> },
    { title: '型号', dataIndex: 'model', key: 'model', responsive: ['lg' as const] },
    { title: '所在位置', dataIndex: 'location', key: 'location', responsive: ['lg' as const] },
    { title: '负责人', dataIndex: 'responsiblePerson', key: 'responsiblePerson', width: 80 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90, render: (_: string, r: Instrument) => <Tag color={statusColorMap[r.status]}>{r.statusLabel}</Tag> },
    { title: '连接状态', dataIndex: 'connectionStatus', key: 'connectionStatus', width: 80, responsive: ['md' as const], render: (s: string) => <Badge status={s === 'online' ? 'success' : 'default'} text={s === 'online' ? '在线' : '离线'} /> },
    { title: '校准到期', dataIndex: 'calibrationDue', key: 'calibrationDue', width: 100, render: (d: string) => <Text type={dayjs(d).isBefore(dayjs()) ? 'danger' : undefined}>{d}</Text> },
    { title: '利用率', dataIndex: 'utilization', key: 'utilization', width: 100, render: (v: number) => <Progress percent={v} size="small" /> },
    { title: '操作', key: 'action', width: 100, render: (_: any, r: Instrument) => (
      <Space>
        <Tooltip title="查看详情"><Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedInstrument(r); setDrawerVisible(true); }} /></Tooltip>
        <Tooltip title="编辑"><Button type="link" size="small" icon={<EditOutlined />} /></Tooltip>
      </Space>
    )},
  ];

  const handleCreate = async (values: any) => {
    try {
      const res = await fetch('/api/v1/instruments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const json = await res.json();
      if (json.code === 200) { message.success('创建成功'); setModalVisible(false); form.resetFields(); fetchInstruments(); }
      else message.error(json.message);
    } catch { message.error('创建失败'); }
  };

  return (
    <div>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>仪器管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建仪器</Button></Col>
      </Row>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="仪器总数" value={stats.total} suffix="台" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="运行中" value={stats.running} valueStyle={{ color: '#52c41a' }} suffix="台" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="维护/校准到期" value={stats.maintenance} valueStyle={{ color: '#faad14' }} suffix="台" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="空闲" value={stats.idle} valueStyle={{ color: '#1677ff' }} suffix="台" /></Card></Col>
      </Row>

      {/* Filter + Chart Row */}
      <Row gutter={16}>
        <Col xs={24} lg={16}>
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Input placeholder="搜索名称/型号/编号" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} allowClear style={{ width: 240 }} />
              <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130 }}>
                <Select.Option value="all">全部状态</Select.Option>
                {Object.entries(statusColorMap).map(([k, v]) => <Select.Option key={k} value={k}><Tag color={v}>{k === 'running' ? '运行中' : k === 'idle' ? '空闲' : k === 'maintenance' ? '维护中' : k === 'calibration_due' ? '校准逾期' : '离线'}</Tag></Select.Option>)}
              </Select>
            </Space>
            <Table columns={columns} dataSource={instruments} rowKey="id" loading={loading} pagination={{ pageSize: 10, showTotal: t => `共 ${t} 台` }} size="middle" />
          </Card>
          <Card title="维护日历 (近30天)" size="small" style={{marginTop:16}}>
            <Space direction="vertical" style={{width:'100%'}}>
              {[{date:'05-10',inst:'液相色谱仪',type:'定期维护',status:'completed'},{date:'05-15',inst:'原子吸收光谱仪',type:'定期维护',status:'completed'},{date:'05-20',inst:'ICP-MS质谱仪',type:'故障维修',status:'in_progress'},{date:'05-25',inst:'气相色谱仪',type:'校准',status:'scheduled'}].map(m =>
                <Card key={m.date+m.inst} size="small" style={{marginBottom:4}}>
                  <Row align="middle"><Col span={4}><Tag>{m.date}</Tag></Col><Col span={6}><Text strong>{m.inst}</Text></Col><Col span={6}><Tag color={m.status==='completed'?'green':m.status==='in_progress'?'orange':'blue'}>{m.type}</Tag></Col><Col span={4}><Badge status={m.status==='completed'?'success':m.status==='in_progress'?'processing':'default'} text={m.status==='completed'?'已完成':m.status==='in_progress'?'进行中':'已计划'} /></Col><Col span={4}><Button type="link" size="small">详情</Button></Col></Row>
                </Card>
              )}
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="仪器状态分布" style={{ marginBottom: 16 }}>
            {distributionData.length > 0 ? (
              <Pie
                data={distributionData}
                angleField="value" colorField="type"
                radius={0.8} label={{ type: 'outer', content: '{name} {percentage}' }}
                color={['#52c41a', '#1677ff', '#faad14', '#ff4d4f', '#d9d9d9']}
                height={220}
              />
            ) : <Text type="secondary">暂无数据</Text>}
          </Card>
          <Card title="最近告警与事件" size="small">
            <Timeline items={[
              { color: 'red', children: <><Text strong>ICP-001 维护中</Text><br /><Text type="secondary">预计恢复：2024-05-22 14:00</Text></> },
              { color: 'orange', children: <><Text strong>电子天平 校准逾期</Text><br /><Text type="secondary">校准到期：2024-05-01</Text></> },
              { color: 'green', children: <><Text strong>液相色谱仪 维护完成</Text><br /><Text type="secondary">2024-05-10 定期维护</Text></> },
            ]} />
          </Card>
        </Col>
      </Row>

      {/* Detail Drawer */}
      <InstrumentDetail instrument={selectedInstrument} visible={drawerVisible} onClose={() => { setDrawerVisible(false); setSelectedInstrument(null); }} />

      {/* Create Modal */}
      <Modal title="新建仪器档案" open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); form.resetFields(); }} width={600}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="仪器名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="model" label="型号" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="serialNo" label="编号"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="manufacturer" label="生产厂商"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="department" label="所属部门"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="安装位置"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="responsiblePerson" label="责任人"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态" initialValue="idle"><Select><Select.Option value="idle">空闲</Select.Option><Select.Option value="running">运行中</Select.Option></Select></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
