import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Input, InputNumber, Select, Row, Col,
  Space, Typography, Drawer, Tabs, Descriptions, Timeline, Badge, Statistic,
  Modal, Form, message, Tooltip, Progress, Divider, Popconfirm,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined,
  EyeOutlined, ToolOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Pie } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

interface Instrument {
  id: string; name: string; model: string; serialNo: string;
  manufacturer: string; location: string; responsiblePerson: string;
  purchaseDate: string; inUseDate: string;
  status: 'running' | 'idle' | 'maintenance' | 'calibration_due' | 'offline';
  statusLabel: string; connectionStatus: 'online' | 'offline';
  utilization: number; calibrationDue: string; maintenanceDate: string;
  department: string; description?: string;
}

interface CalibrationRecord {
  id: string; instId: string; date: string; item: string; result: string;
  cert: string; valid: string; agency: string;
}

interface MaintenanceRecord {
  id: string; instId: string; date: string; type: string; content: string;
  person: string; status: 'completed' | 'in_progress';
}

interface VerificationRecord {
  id: string; instId: string; date: string; item: string; result: string;
  operator: string; nextDate: string;
}

interface CertificationRecord {
  id: string; instId: string; stage: 'IQ' | 'OQ' | 'PQ';
  date: string; result: string; certNo: string; agency: string;
}

interface MaintenancePlan {
  id: string; date: string; instName: string; type: string;
  status: 'completed' | 'in_progress' | 'scheduled';
}

const InstrumentDetail: React.FC<{ instrument: Instrument | null; visible: boolean; onClose: () => void;
  calibrations: CalibrationRecord[]; maintenances: MaintenanceRecord[]; verifications: VerificationRecord[];
  certifications: CertificationRecord[]; onAddCalibration: (instId: string, values: any) => void;
  onAddMaintenance: (instId: string, values: any) => void;
  onAddVerification: (instId: string, values: any) => void;
  onAddCertification: (instId: string, stage: string) => void;
}> = ({ instrument, visible, onClose, calibrations, maintenances, verifications, certifications,
  onAddCalibration, onAddMaintenance, onAddVerification, onAddCertification }) => {
  const [calModal, setCalModal] = useState(false);
  const [maintModal, setMaintModal] = useState(false);
  const [verModal, setVerModal] = useState(false);
  const [calForm] = Form.useForm();
  const [maintForm] = Form.useForm();
  const [verForm] = Form.useForm();
  if (!instrument) return null;

  const instCals = calibrations.filter(c => c.instId === instrument.id);
  const instMaints = maintenances.filter(m => m.instId === instrument.id);
  const instVers = verifications.filter(v => v.instId === instrument.id);
  const instCerts = certifications.filter(c => c.instId === instrument.id);

  return (
    <Drawer title={`${instrument.name} - 详情`} open={visible} onClose={onClose} width={600}>
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
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setCalModal(true)}>新增校准</Button>
            </Space>
            <Table dataSource={instCals} rowKey="id" pagination={false} size="small" columns={[
              {title:'校准日期',dataIndex:'date'},{title:'校准项目',dataIndex:'item'},{title:'结果',dataIndex:'result',render:(r:string) => <Tag color={r==='合格'?'green':'red'}>{r}</Tag>},
              {title:'证书编号',dataIndex:'cert'},{title:'有效期至',dataIndex:'valid'},{title:'校准机构',dataIndex:'agency'},
            ]} />
          </div>
        )},
        { key: 'maintenances', label: '维护记录', children: (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setMaintModal(true)}>新增维护</Button>
            </Space>
            <Table dataSource={instMaints} rowKey="id" pagination={false} size="small" columns={[
              {title:'日期',dataIndex:'date'},{title:'类型',dataIndex:'type'},{title:'内容',dataIndex:'content'},
              {title:'负责人',dataIndex:'person'},{title:'状态',dataIndex:'status',render:(s:string) => <Tag color={s==='completed'?'green':'orange'}>{s==='completed'?'已完成':'进行中'}</Tag>},
            ]} />
          </div>
        )},
        { key: 'verification', label: '期间核查', children: (
          <div>
            <Space style={{ marginBottom: 12 }}>
              <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => setVerModal(true)}>新增核查</Button>
              <Button size="small" onClick={() => message.info('核查计划: 每季度一次, 下次核查: 2026-08-15')}>核查计划</Button>
            </Space>
            <Table dataSource={instVers} rowKey="id" pagination={false} size="small" columns={[
              { title:'核查日期', dataIndex:'date' }, { title:'核查项目', dataIndex:'item' },
              { title:'结果', dataIndex:'result', render:(r:string) => <Tag color={r==='合格'?'green':'red'}>{r}</Tag> },
              { title:'核查人', dataIndex:'operator' }, { title:'下次核查', dataIndex:'nextDate' },
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
        { key: 'methods', label: '关联方法', children: (
          <Table dataSource={[
            {method:'COD测定法',standard:'HJ 828-2017',type:'化学法',version:'V2.1',status:'已批准'},
            {method:'BOD5测定法',standard:'HJ 505-2009',type:'化学法',version:'V1.3',status:'已批准'},
          ]} rowKey="method" pagination={false} size="small" columns={[
            {title:'方法名称',dataIndex:'method'},{title:'标准编号',dataIndex:'standard'},
            {title:'方法类型',dataIndex:'type'},{title:'版本',dataIndex:'version'},
            {title:'状态',dataIndex:'status',render:(s:string)=><Tag color={s==='已批准'?'green':'orange'}>{s}</Tag>},
          ]} />
        )},
        { key: 'certification', label: '仪器认证', children: (
          <div>
            <Space style={{marginBottom:12}}>
              {(['IQ','OQ','PQ'] as const).map(stage => (
                <Button key={stage} size="small" type={stage==='IQ'?'primary':'default'} icon={<CheckCircleOutlined />} onClick={() => onAddCertification(instrument.id, stage)}>
                  {stage} {stage==='IQ'?'安装确认':stage==='OQ'?'运行确认':'性能确认'}
                </Button>
              ))}
            </Space>
            <Table dataSource={instCerts} rowKey="id" pagination={false} size="small" columns={[
              {title:'阶段',dataIndex:'stage',render:(s:string)=>{
                const m:{[k:string]:{c:string;l:string}}={IQ:{c:'blue',l:'安装确认'},OQ:{c:'orange',l:'运行确认'},PQ:{c:'green',l:'性能确认'}};
                return <Tag color={m[s]?.c}>{m[s]?.l||s}</Tag>;
              }},{title:'日期',dataIndex:'date'},{title:'结果',dataIndex:'result',render:(r:string)=><Tag color={r==='通过'?'green':'red'}>{r}</Tag>},
              {title:'证书编号',dataIndex:'certNo'},{title:'执行方',dataIndex:'agency'},
            ]} />
          </div>
        )},
      ]} />

      {/* Calibration Modal */}
      <Modal title="新增校准记录" open={calModal} onOk={() => { const v = calForm.getFieldsValue(); onAddCalibration(instrument.id, v); setCalModal(false); calForm.resetFields(); }} onCancel={() => { setCalModal(false); calForm.resetFields(); }}>
        <Form form={calForm} layout="vertical">
          <Form.Item name="date" label="校准日期" rules={[{required:true}]}><Input type="date" /></Form.Item>
          <Form.Item name="item" label="校准项目" rules={[{required:true}]} initialValue="波长准确度"><Input /></Form.Item>
          <Form.Item name="result" label="结果" rules={[{required:true}]} initialValue="合格"><Select><Option value="合格">合格</Option><Option value="不合格">不合格</Option></Select></Form.Item>
          <Form.Item name="cert" label="证书编号" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="valid" label="有效期至" rules={[{required:true}]}><Input type="date" /></Form.Item>
          <Form.Item name="agency" label="校准机构" rules={[{required:true}]}><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Maintenance Modal */}
      <Modal title="新增维护记录" open={maintModal} onOk={() => { const v = maintForm.getFieldsValue(); onAddMaintenance(instrument.id, v); setMaintModal(false); maintForm.resetFields(); }} onCancel={() => { setMaintModal(false); maintForm.resetFields(); }}>
        <Form form={maintForm} layout="vertical">
          <Form.Item name="date" label="日期" rules={[{required:true}]}><Input type="date" /></Form.Item>
          <Form.Item name="type" label="类型" rules={[{required:true}]} initialValue="定期维护"><Input /></Form.Item>
          <Form.Item name="content" label="内容" rules={[{required:true}]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="person" label="负责人" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="completed"><Select><Option value="completed">已完成</Option><Option value="in_progress">进行中</Option></Select></Form.Item>
        </Form>
      </Modal>

      {/* Verification Modal */}
      <Modal title="新增期间核查" open={verModal} onOk={() => { const v = verForm.getFieldsValue(); onAddVerification(instrument.id, v); setVerModal(false); verForm.resetFields(); }} onCancel={() => { setVerModal(false); verForm.resetFields(); }}>
        <Form form={verForm} layout="vertical">
          <Form.Item name="date" label="核查日期" rules={[{required:true}]}><Input type="date" /></Form.Item>
          <Form.Item name="item" label="核查项目" rules={[{required:true}]}><Select style={{width:'100%'}}><Option value="波长准确度">波长准确度</Option><Option value="重复性">重复性</Option><Option value="灵敏度">灵敏度</Option><Option value="分辨率">分辨率</Option></Select></Form.Item>
          <Form.Item name="result" label="结果" rules={[{required:true}]} initialValue="合格"><Select><Option value="合格">合格</Option><Option value="不合格">不合格</Option></Select></Form.Item>
          <Form.Item name="operator" label="核查人" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="nextDate" label="下次核查" rules={[{required:true}]}><Input type="date" /></Form.Item>
        </Form>
      </Modal>
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
  const [editModal, setEditModal] = useState(false);
  const [editForm] = Form.useForm();
  const [form] = Form.useForm();

  const [calibrations, setCalibrations] = useState<CalibrationRecord[]>([
    {id:'cal1',instId:'inst-001',date:'2023-08-15',item:'波长准确度',result:'合格',cert:'CAL20230815-001',valid:'2024-08-15',agency:'中国计量科学研究院'},
    {id:'cal2',instId:'inst-001',date:'2022-08-15',item:'波长准确度',result:'合格',cert:'CAL20220815-001',valid:'2023-08-15',agency:'中国计量科学研究院'},
  ]);
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[]>([
    {id:'m1',instId:'inst-001',date:'2024-05-10',type:'定期维护',content:'更换密封垫、清洗进样口',person:'张伟',status:'completed'},
    {id:'m2',instId:'inst-001',date:'2024-04-10',type:'定期维护',content:'更换进样垫',person:'张伟',status:'completed'},
  ]);
  const [verifications, setVerifications] = useState<VerificationRecord[]>([
    {id:'v1',instId:'inst-001',date:'2026-05-15',item:'波长准确度',result:'合格',operator:'张伟',nextDate:'2026-08-15'},
    {id:'v2',instId:'inst-001',date:'2026-02-15',item:'重复性',result:'合格',operator:'张伟',nextDate:'2026-05-15'},
    {id:'v3',instId:'inst-001',date:'2025-11-15',item:'灵敏度',result:'合格',operator:'张伟',nextDate:'2026-02-15'},
  ]);
  const [certifications, setCertifications] = useState<CertificationRecord[]>([
    {id:'cert1',instId:'inst-001',stage:'IQ',date:'2024-01-15',result:'通过',certNo:'IQ-2024-001',agency:'厂家工程师'},
    {id:'cert2',instId:'inst-001',stage:'OQ',date:'2024-01-20',result:'通过',certNo:'OQ-2024-001',agency:'厂家工程师'},
    {id:'cert3',instId:'inst-001',stage:'PQ',date:'2024-02-01',result:'通过',certNo:'PQ-2024-001',agency:'质量部'},
  ]);
  const [maintPlans, setMaintPlans] = useState<MaintenancePlan[]>([
    {id:'p1',date:'05-10',instName:'液相色谱仪',type:'定期维护',status:'completed'},
    {id:'p2',date:'05-15',instName:'原子吸收光谱仪',type:'定期维护',status:'completed'},
    {id:'p3',date:'05-20',instName:'ICP-MS质谱仪',type:'故障维修',status:'in_progress'},
    {id:'p4',date:'05-25',instName:'气相色谱仪',type:'校准',status:'scheduled'},
  ]);

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

  const statusColorMap: Record<string, string> = {
    running: '#52c41a', idle: '#1677ff', maintenance: '#faad14',
    calibration_due: '#ff4d4f', offline: '#d9d9d9',
  };

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
    { title: '操作', key: 'action', width: 120, render: (_: any, r: Instrument) => (
      <Space>
        <Tooltip title="查看详情"><Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedInstrument(r); setDrawerVisible(true); }} /></Tooltip>
        <Tooltip title="编辑"><Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelectedInstrument(r); editForm.setFieldsValue({...r}); setEditModal(true); }} /></Tooltip>
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

  const handleUpdate = () => {
    if (!selectedInstrument) return;
    const values = editForm.getFieldsValue();
    setInstruments(instruments.map(i => i.id === selectedInstrument.id ? { ...i, ...values } : i));
    setSelectedInstrument({ ...selectedInstrument, ...values });
    message.success('仪器信息已更新');
    setEditModal(false);
  };

  const handleAddCalibration = (instId: string, values: any) => {
    const newRec: CalibrationRecord = { id: `cal-${Date.now()}`, instId, ...values };
    setCalibrations([newRec, ...calibrations]);
    message.success('校准记录已添加');
  };

  const handleAddMaintenance = (instId: string, values: any) => {
    const newRec: MaintenanceRecord = { id: `m-${Date.now()}`, instId, ...values };
    setMaintenances([newRec, ...maintenances]);
    message.success('维护记录已添加');
  };

  const handleAddVerification = (instId: string, values: any) => {
    const newRec: VerificationRecord = { id: `v-${Date.now()}`, instId, ...values };
    setVerifications([newRec, ...verifications]);
    message.success('期间核查记录已添加');
  };

  const handleAddCertification = (instId: string, stage: string) => {
    const newRec: CertificationRecord = {
      id: `cert-${Date.now()}`, instId, stage: stage as any,
      date: new Date().toISOString().split('T')[0], result: '通过',
      certNo: `${stage}-${Date.now()}`, agency: '质量部',
    };
    setCertifications([...certifications, newRec]);
    message.success(`${stage} 确认流程已启动并记录`);
  };

  const handlePlanStatusChange = (planId: string) => {
    setMaintPlans(maintPlans.map(p => p.id === planId ? { ...p, status: p.status === 'scheduled' ? 'in_progress' : p.status === 'in_progress' ? 'completed' : 'scheduled' } : p));
    message.success('状态已更新');
  };

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>仪器管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建仪器</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="仪器总数" value={stats.total} suffix="台" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="运行中" value={stats.running} valueStyle={{ color: '#52c41a' }} suffix="台" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="维护/校准到期" value={stats.maintenance} valueStyle={{ color: '#faad14' }} suffix="台" /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="空闲" value={stats.idle} valueStyle={{ color: '#1677ff' }} suffix="台" /></Card></Col>
      </Row>

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
              {maintPlans.map(m =>
                <Card key={m.id} size="small" style={{marginBottom:4}}>
                  <Row align="middle"><Col span={4}><Tag>{m.date}</Tag></Col><Col span={6}><Text strong>{m.instName}</Text></Col><Col span={6}><Tag color={m.status==='completed'?'green':m.status==='in_progress'?'orange':'blue'}>{m.type}</Tag></Col><Col span={4}><Badge status={m.status==='completed'?'success':m.status==='in_progress'?'processing':'default'} text={m.status==='completed'?'已完成':m.status==='in_progress'?'进行中':'已计划'} /></Col><Col span={4}>
                    <Button type="link" size="small" onClick={() => handlePlanStatusChange(m.id)}>更新状态</Button>
                  </Col></Row>
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

      <InstrumentDetail
        instrument={selectedInstrument}
        visible={drawerVisible}
        onClose={() => { setDrawerVisible(false); setSelectedInstrument(null); }}
        calibrations={calibrations}
        maintenances={maintenances}
        verifications={verifications}
        certifications={certifications}
        onAddCalibration={handleAddCalibration}
        onAddMaintenance={handleAddMaintenance}
        onAddVerification={handleAddVerification}
        onAddCertification={handleAddCertification}
      />

      {/* Edit Modal */}
      <Modal title="编辑仪器档案" open={editModal} onOk={handleUpdate} onCancel={() => { setEditModal(false); editForm.resetFields(); }} width={600}>
        <Form form={editForm} layout="vertical">
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
            <Col span={12}><Form.Item name="status" label="状态"><Select>
              <Select.Option value="idle">空闲</Select.Option>
              <Select.Option value="running">运行中</Select.Option>
              <Select.Option value="maintenance">维护中</Select.Option>
              <Select.Option value="calibration_due">校准逾期</Select.Option>
              <Select.Option value="offline">离线</Select.Option>
            </Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="calibrationDue" label="校准到期日"><Input type="date" /></Form.Item></Col>
            <Col span={12}><Form.Item name="utilization" label="利用率"><InputNumber min={0} max={100} style={{width:'100%'}} /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>

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
