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
    <Drawer title={`${instrument.name} - 详情`} open={visible} onClose={onClose} width={560}
      extra={<Space><Button icon={<EditOutlined />} onClick={() => message.success('编辑仪器功能')}>编辑</Button><Button icon={<PrinterOutlined />} onClick={() => message.success('仪器档案已打印')}>打印</Button><Button danger icon={<DeleteOutlined />} onClick={() => Modal.confirm({title:'删除仪器',content:`确认删除 ${instrument.name}？`,onOk:()=>{onClose();message.success('已删除')}})}>删除</Button></Space>}>
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

      {/* Phase 2: Advanced Instrument Features */}
      <Card title="仪器管理 Phase 2 — 高级功能" style={{ marginTop: 16 }}>
        <Tabs items={[
          { key: 'realtime', label: '实时监控', children: <Row gutter={[16,16]}>
            {instruments.slice(0, 4).map(inst => (
              <Col span={6} key={inst.id}>
                <Card size="small" hoverable title={<Space><Badge status={inst.connectionStatus === 'online' ? 'success' : 'error'} /><Text>{inst.name}</Text></Space>} extra={<Tag color={statusColorMap[inst.status]}>{inst.statusLabel}</Tag>}>
                  <Statistic title="利用率" value={inst.utilization} suffix="%" valueStyle={{ fontSize: 20 }} />
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 11 }}>状态: {inst.status === 'running' ? '运行中' : inst.status === 'idle' ? '空闲' : inst.statusLabel}</Text>
                    <br /><Text type="secondary" style={{ fontSize: 11 }}>连接: {inst.connectionStatus === 'online' ? '在线' : '离线'}</Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>},
          { key: 'iqoqpq', label: 'IQ/OQ/PQ认证', children: <Table dataSource={[
            { id: 'iq1', instrument: 'HPLC-安捷伦1260', type: 'IQ', date: '2023-06-15', status: 'completed', validUntil: '2027-06-15', certNo: 'IQ-20230615-001' },
            { id: 'oq1', instrument: 'HPLC-安捷伦1260', type: 'OQ', date: '2023-06-20', status: 'completed', validUntil: '2026-06-20', certNo: 'OQ-20230620-001' },
            { id: 'pq1', instrument: 'HPLC-安捷伦1260', type: 'PQ', date: '2023-06-25', status: 'completed', validUntil: '2025-06-25', certNo: 'PQ-20230625-001' },
            { id: 'iq2', instrument: 'GC-MS-岛津QP2020', type: 'IQ', date: '2023-08-01', status: 'completed', validUntil: '2027-08-01', certNo: 'IQ-20230801-002' },
            { id: 'oq2', instrument: 'GC-MS-岛津QP2020', type: 'OQ', date: '2023-08-05', status: 'completed', validUntil: '2026-08-05', certNo: 'OQ-20230805-002' },
          ]} rowKey="id" pagination={false} size="small" columns={[
            { title: '仪器', dataIndex: 'instrument' },
            { title: '认证类型', dataIndex: 'type', render: (t: string) => <Tag color={t === 'IQ' ? 'blue' : t === 'OQ' ? 'green' : 'orange'}>{t}</Tag> },
            { title: '认证日期', dataIndex: 'date' },
            { title: '有效期至', dataIndex: 'validUntil' },
            { title: '证书编号', dataIndex: 'certNo', render: (c: string) => <code>{c}</code> },
            { title: '状态', dataIndex: 'status', render: () => <Badge status="success" text="有效" /> },
            { title: '操作', render: () => <Space><Button type="link" size="small">查看</Button><Button type="link" size="small">下载证书</Button></Space> },
          ]} />},
          { key: 'comparison', label: '仪器比对', children: <Card>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="比对项目">水中铅(Pb)含量</Descriptions.Item>
              <Descriptions.Item label="比对日期">2024-05-15</Descriptions.Item>
              <Descriptions.Item label="标准值">0.050 mg/L</Descriptions.Item>
              <Descriptions.Item label="允许偏差">≤ 5%</Descriptions.Item>
            </Descriptions>
            <Table dataSource={[
              { instrument: 'HPLC-安捷伦1260', result: '0.051', deviation: '2.0%', cv: '1.8%', status: 'pass' },
              { instrument: 'ICP-MS-Agilent 7800', result: '0.049', deviation: '-2.0%', cv: '1.5%', status: 'pass' },
              { instrument: 'UV-Vis-岛津UV2600', result: '0.052', deviation: '4.0%', cv: '2.1%', status: 'pass' },
            ]} rowKey="instrument" pagination={false} size="small" columns={[
              { title: '仪器', dataIndex: 'instrument' },
              { title: '检测结果', dataIndex: 'result' },
              { title: '偏差', dataIndex: 'deviation' },
              { title: 'CV%', dataIndex: 'cv' },
              { title: '判定', dataIndex: 'status', render: (s: string) => <Tag color={s === 'pass' ? 'green' : 'red'}>{s === 'pass' ? '通过' : '不通过'}</Tag> },
            ]} />
            <Button type="primary" size="small" style={{ marginTop: 12 }} onClick={() => message.success('比对报告已生成')}>生成比对报告</Button>
          </Card>},
          { key: 'utilization', label: '利用率分析', children: <Card>
            <Row gutter={16}>
              <Col span={12}>
                <Text strong>各仪器利用率 (本月)</Text>
                {instruments.slice(0, 5).map(i => (
                  <div key={i.id} style={{ margin: '8px 0' }}>
                    <Text style={{ fontSize: 12 }}>{i.name}</Text>
                    <Progress percent={i.utilization} size="small" format={p => `${p}%`} />
                  </div>
                ))}
              </Col>
              <Col span={12}>
                <Descriptions bordered size="small" column={1}>
                  <Descriptions.Item label="平均利用率">72.5%</Descriptions.Item>
                  <Descriptions.Item label="空闲时段"><Tag color="orange">周末 15:00-18:00</Tag></Descriptions.Item>
                  <Descriptions.Item label="峰值时段"><Tag color="blue">工作日 9:00-11:00</Tag></Descriptions.Item>
                  <Descriptions.Item label="优化建议">考虑在空闲时段安排批量检测</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </Card>},
          { key: 'auto-schedule', label: <span><CalendarOutlined /> 校准排期</span>, children: <Card>
            <Descriptions bordered size="small" column={2} style={{ marginBottom: 12 }}>
              <Descriptions.Item label="自动排期"><Switch defaultChecked /> <Text type="secondary">到期前30天自动生成校准任务</Text></Descriptions.Item>
              <Descriptions.Item label="预警提前量"><Select defaultValue="30" style={{width:100}}><Select.Option value="14">14天</Select.Option><Select.Option value="30">30天</Select.Option><Select.Option value="60">60天</Select.Option></Select></Descriptions.Item>
            </Descriptions>
            <Table dataSource={[
              { instrument: 'HPLC-安捷伦1260', nextCal: '2024-08-15', cycle: '12个月', status: 'scheduled', assignee: '张伟' },
              { instrument: 'GC-MS-岛津QP2020', nextCal: '2024-07-20', cycle: '12个月', status: 'scheduled', assignee: '李明' },
              { instrument: 'ICP-MS-Agilent 7800', nextCal: '2024-06-10', cycle: '12个月', status: 'warning', assignee: '郑丽' },
              { instrument: 'UV-Vis-岛津UV2600', nextCal: '2024-05-01', cycle: '12个月', status: 'overdue', assignee: '王明' },
            ]} rowKey="instrument" pagination={false} size="small" columns={[
              { title: '仪器', dataIndex: 'instrument' },
              { title: '下次校准', dataIndex: 'nextCal' },
              { title: '校准周期', dataIndex: 'cycle' },
              { title: '负责人', dataIndex: 'assignee' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s==='overdue'?'red':s==='warning'?'orange':'blue'}>{s==='overdue'?'已逾期':s==='warning'?'即将到期':'已排期'}</Tag> },
              { title: '操作', render: () => <Space><Button type="link" size="small">校准</Button><Button type="link" size="small">推迟</Button></Space> },
            ]} />
          </Card>},
        ]} />
      </Card>

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
