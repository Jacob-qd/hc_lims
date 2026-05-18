import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Row, Col, Typography, Tabs, Timeline, Descriptions,
  Statistic, Space, message, Button, Drawer, Badge, Modal, Form, Input, Select,
  Popconfirm, InputNumber,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, PlusOutlined, EditOutlined,
  SaveOutlined, FileAddOutlined,
} from '@ant-design/icons';
import { WestgardAnalyzer } from '../components/WestgardAnalyzer';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface QCResult {
  id: string; batch: string; analyte: string; level: string;
  target: number; measured: number; deviation: number;
  westgardRule: string; analyst: string; instrument: string;
  date: string; status: string;
}

interface Deviation {
  id: string; no: string; source: string; level: string; status: string;
  desc: string; foundDate: string; rootCause: string; capaStatus: string;
  responsible?: string;
  impact?: string;
}

interface QCSample {
  id: string; name: string; batch: string; target: string; unit: string;
  expiry: string; matrix: string; tests: number;
}

interface CapaRecord {
  id: string; devId: string; type: 'corrective' | 'preventive';
  content: string; person: string; deadline: string; status: string;
}

interface WhyRecord {
  id: string; devId: string; step: number; question: string; answer: string;
}

const LJChart: React.FC<{data: any}> = ({data}) => {
  const pts = data?.points || [];
  if (!pts.length) return <Text type="secondary">暂无数据</Text>;
  const mean = data?.mean || 0, sd = data?.sd || 1;
  const w = 600, h = 220, pl = 50, pr = 20, pt = 20, pb = 40;
  const pw = w - pl - pr, ph = h - pt - pb;
  const vals = pts.map((p:any) => p.value);
  const yMin = Math.min(...vals, mean - 3.5*sd), yMax = Math.max(...vals, mean + 3.5*sd);
  const sx = (i:number) => pl + (i / Math.max(pts.length-1,1)) * pw;
  const sy = (v:number) => pt + ph - ((v - yMin) / (yMax - yMin)) * ph;
  const hline = (v:number) => `M${pl},${sy(v)}L${w-pr},${sy(v)}`;
  const pd = pts.map((p:any,i:number) => `${i===0?'M':'L'}${sx(i)},${sy(p.value)}`).join('');
  return <svg viewBox={"0 0 "+w+" "+h} style={{width:'100%',height:280}}>
    <rect x={pl-5} y={pt-5} width={pw+10} height={ph+10} fill="#fafafa" rx={4} />
    <path d={hline(mean+3*sd)} stroke="#ff4d4f" strokeWidth={1} strokeDasharray="4,4" fill="none" />
    <path d={hline(mean+2*sd)} stroke="#faad14" strokeWidth={1} strokeDasharray="4,4" fill="none" />
    <path d={hline(mean)} stroke="#1677ff" strokeWidth={2} fill="none" />
    <path d={hline(mean-2*sd)} stroke="#faad14" strokeWidth={1} strokeDasharray="4,4" fill="none" />
    <path d={hline(mean-3*sd)} stroke="#ff4d4f" strokeWidth={1} strokeDasharray="4,4" fill="none" />
    <path d={pd} stroke="#333" strokeWidth={2} fill="none" />
    {pts.map((p:any,i:number) => {
      const d = Math.abs(p.value - mean);
      const c = d > 3*sd ? '#ff4d4f' : d > 2*sd ? '#faad14' : '#1677ff';
      return <circle key={i} cx={sx(i)} cy={sy(p.value)} r={4} fill={c} stroke="#fff" strokeWidth={1.5} />;
    })}
    {pts.filter((_:any,i:number) => i%3===0||i===pts.length-1).map((p:any) => {
      const idx = pts.indexOf(p);
      return <text key={idx} x={sx(idx)} y={h-8} textAnchor="middle" fontSize={10} fill="#999">{p.date}</text>;
    })}
    <text x={pl-8} y={sy(mean+3*sd)+4} textAnchor="end" fontSize={10} fill="#ff4d4f">+3SD</text>
    <text x={pl-8} y={sy(mean+2*sd)+4} textAnchor="end" fontSize={10} fill="#faad14">+2SD</text>
    <text x={pl-8} y={sy(mean)+4} textAnchor="end" fontSize={10} fill="#1677ff">均值</text>
    <text x={pl-8} y={sy(mean-2*sd)+4} textAnchor="end" fontSize={10} fill="#faad14">-2SD</text>
    <text x={pl-8} y={sy(mean-3*sd)+4} textAnchor="end" fontSize={10} fill="#ff4d4f">-3SD</text>
  </svg>;
};

export const QualityPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [qcResults, setQcResults] = useState<QCResult[]>([]);
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [selectedDev, setSelectedDev] = useState<Deviation | null>(null);
  const [devDrawer, setDevDrawer] = useState(false);

  const [qcSamples, setQcSamples] = useState<QCSample[]>([
    { id:'qc1', name:'COD质控样-高浓度', batch:'QC-2026-001', target:'100.0', unit:'mg/L', expiry:'2026-12-31', matrix:'水质', tests:45 },
    { id:'qc2', name:'COD质控样-低浓度', batch:'QC-2026-002', target:'20.0', unit:'mg/L', expiry:'2026-12-31', matrix:'水质', tests:38 },
    { id:'qc3', name:'pH质控样', batch:'QC-2026-003', target:'7.00', unit:'pH', expiry:'2026-09-30', matrix:'水质', tests:52 },
    { id:'qc4', name:'重金属混标', batch:'QC-2026-004', target:'1.00', unit:'mg/L', expiry:'2026-08-15', matrix:'水质', tests:12 },
  ]);

  const [capaRecords, setCapaRecords] = useState<CapaRecord[]>([
    { id:'c1', devId:'dev-001', type:'corrective', content:'立即停用该批次试剂，重新检测', person:'郑丽', deadline:'2024-05-25', status:'completed' },
    { id:'c2', devId:'dev-001', type:'preventive', content:'修订SOP，增加质控频率', person:'张伟', deadline:'2024-06-01', status:'completed' },
    { id:'c3', devId:'dev-002', type:'corrective', content:'更换老化光源', person:'王强', deadline:'2024-06-10', status:'in_progress' },
  ]);

  const [whyRecords, setWhyRecords] = useState<WhyRecord[]>([
    { id:'w1', devId:'dev-001', step:1, question:'Why1: 为什么会出现偏差？', answer:'质控样测定值超出靶值±5%' },
    { id:'w2', devId:'dev-001', step:2, question:'Why2: 为什么会出现这个直接原因？', answer:'试剂批次储存温度超标导致降解' },
    { id:'w3', devId:'dev-002', step:1, question:'Why1: 为什么会出现偏差？', answer:'检出限升高' },
  ]);

  const [qcSampleModal, setQcSampleModal] = useState(false);
  const [qcForm] = Form.useForm();
  const [capaModal, setCapaModal] = useState(false);
  const [capaForm] = Form.useForm();
  const [whyModal, setWhyModal] = useState(false);
  const [whyForm] = Form.useForm();
  const [devEditModal, setDevEditModal] = useState(false);
  const [devForm] = Form.useForm();
  const [createDevModal, setCreateDevModal] = useState(false);
  const [createDevForm] = Form.useForm();

  useEffect(() => {
    Promise.all([
      fetch('/api/v1/quality/qc-results').then(r => r.json()),
      fetch('/api/v1/quality/deviations').then(r => r.json()),
      fetch('/api/v1/quality/control-chart').then(r => r.json()),
    ]).then(([qcRes, devRes, chartRes]) => {
      setQcResults(qcRes.data.list);
      setDeviations(devRes.data.list);
      setChartData(chartRes.data);
    }).catch(() => message.error('加载数据失败'))
    .finally(() => setLoading(false));
  }, []);

  const kpi = {
    qcBatches: new Set(qcResults.map(r => r.batch)).size,
    errors: qcResults.filter(r => r.status === 'error').length,
    openDeviations: deviations.filter(d => d.status !== 'closed').length,
    capaPending: deviations.filter(d => d.capaStatus === 'pending').length,
  };

  const levelColor: Record<string, string> = { 严重: '#ff4d4f', 中等: '#faad14', 轻微: '#1677ff' };
  const devStatusColor: Record<string, string> = { open: '#1677ff', investigating: '#faad14', closed: '#52c41a' };

  const qcColumns: ColumnsType<QCResult> = [
    { title: 'QC批次', dataIndex: 'batch', key: 'batch' },
    { title: '分析物', dataIndex: 'analyte', key: 'analyte' },
    { title: '水平', dataIndex: 'level', key: 'level' },
    { title: '靶值', dataIndex: 'target', key: 'target' },
    { title: '测定值', dataIndex: 'measured', key: 'measured', render: (v: number, r: QCResult) => <Text type={Math.abs(r.deviation) > 5 ? 'danger' : undefined}>{v}</Text> },
    { title: '偏差%', dataIndex: 'deviation', key: 'deviation', render: (v: number) => <Text type={Math.abs(v) > 5 ? 'danger' : undefined}>{v.toFixed(1)}%</Text> },
    { title: 'Westgard规则', dataIndex: 'westgardRule', key: 'westgardRule', render: (r: string) => <Tag color={r === '通过' ? 'green' : r.includes('警告') ? 'orange' : 'red'}>{r}</Tag> },
    { title: '分析员', dataIndex: 'analyst', key: 'analyst' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Badge status={s === 'normal' ? 'success' : s === 'warning' ? 'warning' : 'error'} text={s === 'normal' ? '正常' : s === 'warning' ? '警告' : '失控'} /> },
  ];

  const devColumns: ColumnsType<Deviation> = [
    { title: '编号', dataIndex: 'no', key: 'no' },
    { title: '来源', dataIndex: 'source', key: 'source' },
    { title: '级别', dataIndex: 'level', key: 'level', render: (l: string) => <Tag color={levelColor[l]}>{l}</Tag> },
    { title: '描述', dataIndex: 'desc', key: 'desc', ellipsis: true },
    { title: '发现日期', dataIndex: 'foundDate', key: 'foundDate' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={devStatusColor[s]}>{s === 'open' ? '开放' : s === 'investigating' ? '调查中' : '已关闭'}</Tag> },
    { title: 'CAPA状态', dataIndex: 'capaStatus', key: 'capaStatus', render: (s: string) => <Tag>{s === 'pending' ? '待执行' : s === 'verified' ? '已验证' : '执行中'}</Tag> },
    { title: '操作', key: 'action', render: (_: any, r: Deviation) => (
      <Space>
        <Button type="link" size="small" onClick={() => { setSelectedDev(r); setDevDrawer(true); }}>查看</Button>
        <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelectedDev(r); devForm.setFieldsValue({...r}); setDevEditModal(true); }}>编辑</Button>
      </Space>
    )},
  ];

  const handleCreateQcSample = () => {
    const values = qcForm.getFieldsValue();
    const newSample: QCSample = {
      id: `qc-${Date.now()}`,
      name: values.name,
      batch: values.batch,
      target: values.target,
      unit: values.unit || 'mg/L',
      expiry: values.expiry,
      matrix: values.matrix === 'water' ? '水质' : values.matrix === 'soil' ? '土壤' : '空气',
      tests: 0,
    };
    setQcSamples([newSample, ...qcSamples]);
    message.success('质控样品已创建');
    setQcSampleModal(false);
    qcForm.resetFields();
  };

  const handleUpdateDeviation = () => {
    if (!selectedDev) return;
    const values = devForm.getFieldsValue();
    setDeviations(deviations.map(d => d.id === selectedDev.id ? { ...d, ...values } : d));
    setSelectedDev({ ...selectedDev, ...values });
    message.success('偏差信息已更新');
    setDevEditModal(false);
  };

  const handleCreateDeviation = () => {
    const values = createDevForm.getFieldsValue();
    const newDev: Deviation = {
      id: `dev-${Date.now()}`,
      no: `DEV-${String(deviations.length + 1).padStart(3, '0')}`,
      source: values.source,
      level: values.level,
      status: 'open',
      desc: values.desc,
      foundDate: new Date().toISOString().split('T')[0],
      rootCause: '',
      capaStatus: 'pending',
      responsible: values.responsible,
    };
    setDeviations([newDev, ...deviations]);
    message.success(`偏差 ${newDev.no} 已创建`);
    setCreateDevModal(false);
    createDevForm.resetFields();
  };

  const handleCreateCapa = () => {
    if (!selectedDev) return;
    const values = capaForm.getFieldsValue();
    const newCapa: CapaRecord = {
      id: `capa-${Date.now()}`,
      devId: selectedDev.id,
      type: values.type,
      content: values.content,
      person: values.person,
      deadline: values.deadline,
      status: 'in_progress',
    };
    setCapaRecords([...capaRecords, newCapa]);
    message.success('CAPA措施已添加');
    setCapaModal(false);
    capaForm.resetFields();
  };

  const handleCreateWhy = () => {
    if (!selectedDev) return;
    const values = whyForm.getFieldsValue();
    const step = whyRecords.filter(w => w.devId === selectedDev.id).length + 1;
    const newWhy: WhyRecord = {
      id: `why-${Date.now()}`,
      devId: selectedDev.id,
      step,
      question: `Why${step}: ${values.question}`,
      answer: values.answer,
    };
    setWhyRecords([...whyRecords, newWhy]);
    message.success(`Why${step} 分析已添加`);
    setWhyModal(false);
    whyForm.resetFields();
  };

  const handleCloseDeviation = () => {
    if (!selectedDev) return;
    setDeviations(deviations.map(d => d.id === selectedDev.id ? { ...d, status: 'closed', capaStatus: 'verified' } : d));
    setSelectedDev({ ...selectedDev, status: 'closed', capaStatus: 'verified' });
    message.success('偏差已关闭');
  };

  const handleVerifyCapa = (capaId: string) => {
    setCapaRecords(capaRecords.map(c => c.id === capaId ? { ...c, status: 'completed' } : c));
    message.success('CAPA已标记为完成');
  };

  const currentWhys = selectedDev ? whyRecords.filter(w => w.devId === selectedDev.id) : [];
  const currentCapas = selectedDev ? capaRecords.filter(c => c.devId === selectedDev.id) : [];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>质量控制</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="活动质控批次" value={kpi.qcBatches} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="失控事件" value={kpi.errors} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="开放偏差" value={kpi.openDeviations} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="CAPA任务" value={kpi.capaPending} valueStyle={{ color: '#1677ff' }} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="overview" items={[
        { key: 'overview', label: '质量概览', children: (
          <Row gutter={16}>
            <Col span={24} style={{ marginBottom: 16 }}>
              <Card title="Levey-Jennings 控制图">
                {chartData && (chartData as any).points ? <LJChart data={chartData} /> : <Text type="secondary">加载中...</Text>}
              </Card>
            </Col>
            <Col span={24}>
              <Card title="质控样品结果表" extra={<Text type="secondary">共 {qcResults.length} 条</Text>}>
                <Table columns={qcColumns} dataSource={qcResults} rowKey="id" loading={loading} pagination={false} size="small" />
              </Card>
            </Col>
          </Row>
        )},
        { key: 'westgard', label: 'Westgard规则分析', children: (
          <WestgardAnalyzer
            data={(chartData as any)?.points?.map((p: any) => ({ value: p.value, date: p.date, batch: p.batch || '' })) || []}
            mean={(chartData as any)?.mean || 0}
            sd={(chartData as any)?.sd || 1}
            analyte="COD"
          />
        )},
        { key: 'qcsamples', label: '质控样品', children: (
          <Card title="质控样品管理" extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setQcSampleModal(true)}>新增质控样</Button>}>
            <Table dataSource={qcSamples} rowKey="id" pagination={false} columns={[
              { title:'名称', dataIndex:'name' }, { title:'批号', dataIndex:'batch' },
              { title:'标准值', dataIndex:'target' }, { title:'单位', dataIndex:'unit' },
              { title:'有效期', dataIndex:'expiry', render:(v:string) => <Text type={new Date(v) < new Date() ? 'danger':undefined}>{v}</Text> },
              { title:'基体', dataIndex:'matrix' }, { title:'测试次数', dataIndex:'tests' },
              { title:'操作', render: (_: any, r: QCSample) => (
                <Space>
                  <Button type="link" size="small" onClick={() => { setQcSamples(qcSamples.map(s => s.id === r.id ? { ...s, tests: s.tests + 1 } : s)); message.success('测试次数+1'); }}>记录测试</Button>
                  <Popconfirm title="确认删除?" onConfirm={() => { setQcSamples(qcSamples.filter(s => s.id !== r.id)); message.success('已删除'); }}>
                    <Button type="link" size="small" danger>删除</Button>
                  </Popconfirm>
                </Space>
              )},
            ]} size="small" />
          </Card>
        )},
        { key: 'deviations', label: '偏差与CAPA', children: (
          <Card title="偏差列表" extra={<Button type="primary" size="small" icon={<FileAddOutlined />} onClick={() => setCreateDevModal(true)}>新增偏差</Button>}>
            <Table columns={devColumns} dataSource={deviations} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
          </Card>
        )},
        { key: 'audit', label: '审计就绪', children: (
          <Card>
            <Space direction="vertical" style={{ width: '100%' }}>
              {['质控方案', '质控记录', 'Westgard规则', '仪器质控', '人员资质', '偏差管理', 'CAPA管理'].map(item => (
                <Card key={item} size="small">
                  <Row justify="space-between" align="middle">
                    <Col><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />{item}</Col>
                    <Col><Tag color="green">就绪</Tag></Col>
                  </Row>
                </Card>
              ))}
            </Space>
          </Card>
        )},
      ]} />

      {/* Deviation Detail Drawer */}
      <Drawer title={selectedDev?.no + ' ' + selectedDev?.desc?.substring(0,30)} open={devDrawer} onClose={() => { setDevDrawer(false); setSelectedDev(null); }} width={600}>
        {selectedDev && (
          <>
            <Row gutter={16} style={{marginBottom:16}}>
              <Col span={6}><Card size="small"><Statistic title="来源" value={selectedDev.source} valueStyle={{fontSize:14}} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="级别" value={selectedDev.level} valueStyle={{fontSize:14,color:levelColor[selectedDev.level]}} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="状态" value={selectedDev.status === 'open' ? '开放' : selectedDev.status === 'investigating' ? '调查中' : '已关闭'} valueStyle={{fontSize:14}} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="CAPA" value={selectedDev.capaStatus === 'pending' ? '待执行' : selectedDev.capaStatus === 'verified' ? '已验证' : '执行中'} valueStyle={{fontSize:14}} /></Card></Col>
            </Row>
            <Space style={{ marginBottom: 12 }}>
              {selectedDev.status !== 'closed' && (
                <>
                  <Button size="small" type="primary" onClick={() => setCapaModal(true)} icon={<PlusOutlined />}>添加CAPA</Button>
                  <Button size="small" onClick={() => setWhyModal(true)} icon={<PlusOutlined />}>添加5Why</Button>
                  <Popconfirm title="确认关闭偏差?" onConfirm={handleCloseDeviation}>
                    <Button size="small" icon={<CheckCircleOutlined />}>关闭偏差</Button>
                  </Popconfirm>
                </>
              )}
            </Space>
            <Tabs items={[
              {key:'detail', label:'偏差详情', children:<>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="偏差编号">{selectedDev.no}</Descriptions.Item>
                  <Descriptions.Item label="来源">{selectedDev.source}</Descriptions.Item>
                  <Descriptions.Item label="级别"><Tag color={levelColor[selectedDev.level]}>{selectedDev.level}</Tag></Descriptions.Item>
                  <Descriptions.Item label="状态"><Tag color={devStatusColor[selectedDev.status]}>{selectedDev.status === 'open' ? '开放' : selectedDev.status === 'investigating' ? '调查中' : '已关闭'}</Tag></Descriptions.Item>
                  <Descriptions.Item label="事件描述">{selectedDev.desc}</Descriptions.Item>
                  <Descriptions.Item label="发现日期">{selectedDev.foundDate}</Descriptions.Item>
                  <Descriptions.Item label="责任人">{selectedDev.responsible || '-'}</Descriptions.Item>
                  <Descriptions.Item label="影响评估">{selectedDev.impact || '待评估'}</Descriptions.Item>
                </Descriptions>
                <div style={{marginTop:16}}><Text strong>处理流程</Text></div>
                <Timeline style={{marginTop:8}} items={[
                  {color:'green', children:'发现偏差'},
                  {color:selectedDev.status==='closed'?'green':'blue', children:'调查中'},
                  {color:selectedDev.capaStatus==='verified'?'green':selectedDev.capaStatus==='executing'?'blue':'gray', children:'CAPA执行'},
                  {color:selectedDev.status==='closed'?'green':'gray', children:'验证关闭'},
                ]} />
              </>},
              {key:'5why', label:'根因分析(5Why)', children:<>
                <div style={{padding:'12px',background:'#fafafa',borderRadius:8}}>
                  {currentWhys.length === 0 && <Text type="secondary">暂无5Why分析，请点击上方「添加5Why」</Text>}
                  {currentWhys.sort((a,b) => a.step - b.step).map((w) => (
                    <div key={w.id} style={{padding:'8px 0',borderBottom:'1px solid #f0f0f0'}}>
                      <Text style={{color:'#1677ff',fontWeight:600,fontSize:14}}>{w.question}</Text>
                      <div style={{marginTop:4}}><Text style={{fontSize:13}}>{w.answer}</Text></div>
                    </div>
                  ))}
                  {currentWhys.length < 5 && selectedDev.status !== 'closed' && (
                    <div style={{marginTop:8}}>
                      <Button type="dashed" size="small" block onClick={() => setWhyModal(true)} icon={<PlusOutlined />}>添加 Why{currentWhys.length + 1}</Button>
                    </div>
                  )}
                </div>
              </>},
              {key:'capa', label:'CAPA流程', children:<Card size="small">
                {currentCapas.length === 0 && <Text type="secondary">暂无CAPA记录，请点击上方「添加CAPA」</Text>}
                <Timeline items={currentCapas.map(c => ({
                  color: c.status === 'completed' ? 'green' : 'blue',
                  children: <>
                    <Text strong>{c.type === 'corrective' ? '纠正措施' : '预防措施'}</Text><br />
                    <Text>{c.content}</Text>
                    <Text type="secondary" style={{display:'block'}}>负责人: {c.person} | 期限: {c.deadline}</Text>
                    {c.status !== 'completed' && selectedDev?.status !== 'closed' && (
                      <Button size="small" style={{marginTop:4}} onClick={() => handleVerifyCapa(c.id)} icon={<CheckCircleOutlined />}>标记完成</Button>
                    )}
                  </>,
                }))} />
              </Card>},
              {key:'attachments', label:'附件', children:<Text type="secondary">暂无附件</Text>},
              {key:'audit', label:'审计追踪', children:<Table dataSource={[
                {time:selectedDev.foundDate+' 09:15',user:selectedDev.responsible||'-',action:'创建偏差',detail:'偏差编号 '+selectedDev.no},
                {time:selectedDev.foundDate+' 10:30',user:'系统',action:'自动通知',detail:'通知质量主管'},
              ]} rowKey="time" pagination={false} size="small" columns={[
                {title:'时间',dataIndex:'time'},{title:'操作人',dataIndex:'user'},{title:'操作',dataIndex:'action'},{title:'详情',dataIndex:'detail'},
              ]} />},
            ]} />
          </>
        )}
      </Drawer>

      {/* QC Sample Modal */}
      <Modal title="新增质控样品" open={qcSampleModal} onOk={handleCreateQcSample} onCancel={() => { setQcSampleModal(false); qcForm.resetFields(); }} width={500}>
        <Form form={qcForm} layout="vertical">
          <Form.Item name="name" label="样品名称" rules={[{ required: true }]}><Input placeholder="如: COD质控样-1" /></Form.Item>
          <Form.Item name="batch" label="批号" rules={[{ required: true }]}><Input placeholder="如: QC-BATCH-001" /></Form.Item>
          <Form.Item name="target" label="标准值" rules={[{ required: true }]}><Input placeholder="目标浓度" /></Form.Item>
          <Form.Item name="unit" label="单位" initialValue="mg/L"><Input /></Form.Item>
          <Form.Item name="expiry" label="有效期" rules={[{ required: true }]}><Input type="date" /></Form.Item>
          <Form.Item name="matrix" label="基体" initialValue="water">
            <Select style={{width:'100%'}}>
              <Select.Option value="water">水质</Select.Option>
              <Select.Option value="soil">土壤</Select.Option>
              <Select.Option value="air">空气</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Create Deviation Modal */}
      <Modal title="新增偏差" open={createDevModal} onOk={() => createDevForm.submit()} onCancel={() => { setCreateDevModal(false); createDevForm.resetFields(); }} width={500}>
        <Form form={createDevForm} layout="vertical" onFinish={handleCreateDeviation}>
          <Form.Item name="source" label="来源" rules={[{ required: true }]}><Input placeholder="如: 仪器QC-001" /></Form.Item>
          <Form.Item name="level" label="级别" rules={[{ required: true }]} initialValue="中等">
            <Select><Select.Option value="严重">严重</Select.Option><Select.Option value="中等">中等</Select.Option><Select.Option value="轻微">轻微</Select.Option></Select>
          </Form.Item>
          <Form.Item name="desc" label="事件描述" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="responsible" label="责任人"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Edit Deviation Modal */}
      <Modal title="编辑偏差" open={devEditModal} onOk={handleUpdateDeviation} onCancel={() => { setDevEditModal(false); devForm.resetFields(); }} width={500}>
        <Form form={devForm} layout="vertical">
          <Form.Item name="source" label="来源"><Input /></Form.Item>
          <Form.Item name="level" label="级别">
            <Select><Select.Option value="严重">严重</Select.Option><Select.Option value="中等">中等</Select.Option><Select.Option value="轻微">轻微</Select.Option></Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select><Select.Option value="open">开放</Select.Option><Select.Option value="investigating">调查中</Select.Option><Select.Option value="closed">已关闭</Select.Option></Select>
          </Form.Item>
          <Form.Item name="capaStatus" label="CAPA状态">
            <Select><Select.Option value="pending">待执行</Select.Option><Select.Option value="executing">执行中</Select.Option><Select.Option value="verified">已验证</Select.Option></Select>
          </Form.Item>
          <Form.Item name="desc" label="事件描述"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="responsible" label="责任人"><Input /></Form.Item>
          <Form.Item name="impact" label="影响评估"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* CAPA Modal */}
      <Modal title="添加CAPA措施" open={capaModal} onOk={handleCreateCapa} onCancel={() => { setCapaModal(false); capaForm.resetFields(); }} width={500}>
        <Form form={capaForm} layout="vertical">
          <Form.Item name="type" label="措施类型" rules={[{ required: true }]} initialValue="corrective">
            <Select><Select.Option value="corrective">纠正措施</Select.Option><Select.Option value="preventive">预防措施</Select.Option></Select>
          </Form.Item>
          <Form.Item name="content" label="措施内容" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
          <Form.Item name="person" label="负责人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="deadline" label="完成期限" rules={[{ required: true }]}><Input type="date" /></Form.Item>
        </Form>
      </Modal>

      {/* 5Why Modal */}
      <Modal title="添加5Why分析" open={whyModal} onOk={handleCreateWhy} onCancel={() => { setWhyModal(false); whyForm.resetFields(); }} width={500}>
        <Form form={whyForm} layout="vertical">
          <Form.Item name="question" label="问题描述" rules={[{ required: true }]} initialValue="为什么会出现这个偏差？"><Input /></Form.Item>
          <Form.Item name="answer" label="根因答案" rules={[{ required: true }]}><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
