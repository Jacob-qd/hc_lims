import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Row, Col, Typography, Tabs, Timeline, Descriptions,
  Statistic, Space, message, Progress, Button, Drawer, Badge,
} from 'antd';
import {
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
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
    <text x={pl-8} y={sy(mean)+4} textAnchor="end" fontSize={10} fill="#1677ff">&#x5747;&#x503C;</text>
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

  const statusColor: Record<string, string> = { normal: '#52c41a', warning: '#faad14', error: '#ff4d4f' };
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
    { title: 'CAPA状态', dataIndex: 'capaStatus', key: 'capaStatus', render: (s: string) => <Tag>{s === 'pending' ? '待执行' : s === 'verified' ? '已验证' : '待验证'}</Tag> },
    { title: '操作', key: 'action', render: (_: any, r: Deviation) => <Button type="link" size="small" onClick={() => { setSelectedDev(r); setDevDrawer(true); }}>查看</Button> },
  ];

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
        { key: 'deviations', label: '偏差与CAPA', children: (
          <div>
            <Card title="偏差列表" style={{ marginBottom: 16 }}>
              <Table columns={devColumns} dataSource={deviations} rowKey="id" loading={loading} pagination={{ pageSize: 5 }} />
            </Card>
            {/* P1-7: CAPA闭环 */}
            <Card title="📋 CAPA 跟踪" size="small" extra={<Button size="small" icon={<PlusOutlined />} onClick={() => message.success('CAPA任务已创建')}>新建CAPA</Button>}>
              <Table dataSource={[
                { id:'c1', sourceId:'DEV-202405-001', title:'COD检测结果复验', assignee:'王明', dueAt:'2026-06-01', status:'in_progress', progress:60 },
                { id:'c2', sourceId:'DEV-202405-002', title:'重新校准pH计', assignee:'张伟', dueAt:'2026-05-30', status:'completed', progress:100 },
                { id:'c3', sourceId:'QC-BATCH-030', title:'2₂s失控根因分析', assignee:'王强(QA)', dueAt:'2026-06-05', status:'open', progress:0 },
              ]} rowKey="id" pagination={false} size="small" columns={[
                { title:'来源', dataIndex:'sourceId', render:(s:string)=><Tag>{s}</Tag> },
                { title:'CAPA标题', dataIndex:'title' },
                { title:'负责人', dataIndex:'assignee' },
                { title:'截止', dataIndex:'dueAt', width:100 },
                { title:'进度', dataIndex:'progress', width:100, render:(p:number)=><Progress percent={p} size="small" /> },
                { title:'状态', dataIndex:'status', width:80, render:(s:string)=><Badge status={s==='completed'?'success':s==='in_progress'?'processing':'default'} text={s==='completed'?'已完成':s==='in_progress'?'进行中':'待开始'} /> },
                { title:'操作', render:(_:any, r:any)=><Space size="small">
                  {r.status==='in_progress' && <Button type="link" size="small" onClick={()=>Modal.confirm({title:'关闭CAPA',content:'确认关闭并签名',onOk:()=>message.success('CAPA已关闭, 签名完成')})}>关闭验证</Button>}
                  <Button type="link" size="small">详情</Button>
                </Space> },
              ]} />
            </Card>
          </div>
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
        { key: 'qc-plans', label: '📋 质控方案', children: (
          <div>
            <Card extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.success('质控方案已创建')}>新建方案</Button>} style={{ marginBottom: 16 }}>
              <Table dataSource={[
                { id: 'qp1', name: '水质检测标准QC方案', methods: 'HJ 828-2017', types: '空白+平行+加标+质控样', freq: '20样/次', rules: '1₂s,1₃s,2₂s,R₄s,4₁s,10x', eval: '2024-05-15', result: '受控' },
                { id: 'qp2', name: '重金属QC方案', methods: 'GB/T 17141-1997', types: '空白+质控样', freq: '10样/次', rules: '1₂s,1₃s,2₂s', eval: '2024-05-14', result: '受控' },
              ]} rowKey="id" pagination={false} size="small" columns={[
                { title: '方案名称', dataIndex: 'name' },
                { title: 'QC类型', dataIndex: 'types', render: (t:string) => t.split('+').map((x:string)=> <Tag key={x} color="blue" style={{marginRight:2}}>{x}</Tag>) },
                { title: '频率', dataIndex: 'freq' },
                { title: 'Westgard', dataIndex: 'rules', render: (w:string) => w.split(',').map((r:string)=> <Tag key={r} color={r.includes('₃')?'orange':'green'}>{r}</Tag>) },
                { title: '最近评估', dataIndex: 'eval' },
                { title: '状态', dataIndex: 'result', render: (r:string) => <Tag color={r==='受控'?'green':'red'}>{r}</Tag> },
                { title: '操作', render: () => <Space size="small"><Button type="link" size="small">评估</Button><Button type="link" size="small">质控图</Button><Button type="link" size="small">编辑</Button></Space> },
              ]} />
            </Card>

            <Card title="📈 Westgard 违例记录" size="small">
              <Table dataSource={[
                { id: 'w1', batch: 'BATCH-038', rule: '1₂s', level: 'warning', detail: 'QC1=26.1 (>+2s)', time: '2024-05-15 10:30', action: '通知QA' },
                { id: 'w2', batch: 'BATCH-035', rule: '7T', level: 'warning', detail: '连续7点均值同侧', time: '2024-05-14', action: '建议排查' },
                { id: 'w3', batch: 'BATCH-030', rule: '2₂s', level: 'reject', detail: 'QC1=32.5, QC2=33.1', time: '2024-05-12', action: '冻结结果' },
              ]} rowKey="id" pagination={false} size="small" columns={[
                { title: '批次', dataIndex: 'batch' },
                { title: '规则', dataIndex: 'rule', render: (r:string) => <Tag color={r==='2₂s'?'red':'orange'}>{r}</Tag> },
                { title: '级别', dataIndex: 'level', render: (l:string) => <Badge status={l==='reject'?'error':'warning'} text={l==='reject'?'🔴 失控':'⚠️ 警告'} /> },
                { title: '详情', dataIndex: 'detail' },
                { title: '时间', dataIndex: 'time' },
                { title: '处置', dataIndex: 'action' },
              ]} />
            </Card>
          </div>
        )},
      ]} />

      <Drawer title={selectedDev?.no + ' ' + selectedDev?.desc?.substring(0,30)} open={devDrawer} onClose={() => { setDevDrawer(false); setSelectedDev(null); }} width={560} extra={<Space><Button icon={<PrinterOutlined />} onClick={() => { const rpt = `偏差报告\n编号: ${selectedDev?.no}\n描述: ${selectedDev?.desc}\n类型: ${selectedDev?.type}`; const blob = new Blob([rpt],{type:'text/plain'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `deviation-${selectedDev?.no}.txt`; a.click(); }}>导出报告</Button><Button type="primary" onClick={() => { message.success('CAPA任务已创建'); setDevDrawer(false); }}>创建CAPA</Button></Space>}>
        {selectedDev && (
          <>
            <Row gutter={16} style={{marginBottom:16}}>
              <Col span={6}><Card size="small"><Statistic title="来源" value={selectedDev.source} valueStyle={{fontSize:14}} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="级别" value={selectedDev.level} valueStyle={{fontSize:14,color:levelColor[selectedDev.level]}} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="状态" value={selectedDev.status === 'open' ? '开放' : selectedDev.status === 'investigating' ? '调查中' : '已关闭'} valueStyle={{fontSize:14}} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="CAPA" value={selectedDev.capaStatus === 'pending' ? '待执行' : selectedDev.capaStatus === 'verified' ? '已验证' : '执行中'} valueStyle={{fontSize:14}} /></Card></Col>
            </Row>
            <Tabs items={[
              {key:'detail', label:'偏差详情', children:<>
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="偏差编号">{selectedDev.no}</Descriptions.Item>
                  <Descriptions.Item label="来源">{selectedDev.source}</Descriptions.Item>
                  <Descriptions.Item label="级别"><Tag color={levelColor[selectedDev.level]}>{selectedDev.level}</Tag></Descriptions.Item>
                  <Descriptions.Item label="状态"><Tag color={devStatusColor[selectedDev.status]}>{selectedDev.status === 'open' ? '开放' : selectedDev.status === 'investigating' ? '调查中' : '已关闭'}</Tag></Descriptions.Item>
                  <Descriptions.Item label="事件描述">{selectedDev.desc}</Descriptions.Item>
                  <Descriptions.Item label="发现日期">{selectedDev.foundDate}</Descriptions.Item>
                  <Descriptions.Item label="责任人">{selectedDev['责任人'] || '-'}</Descriptions.Item>
                  <Descriptions.Item label="影响评估">待评估</Descriptions.Item>
                </Descriptions>
                <div style={{marginTop:16}}><Text strong>处理流程</Text></div>
                <Timeline style={{marginTop:8}} items={[
                  {color:'green', children:'发现偏差'},
                  {color:selectedDev.status==='closed'?'green':'blue', children:'调查中'},
                  {color:selectedDev.capaStatus==='verified'?'green':selectedDev.capaStatus==='executing'?'blue':'gray', children:'CAPA执行'},
                  {color:selectedDev.status==='closed'?'green':'gray', children:'验证关闭'},
                ]} />
              </>},
              {key:'5why', label:'根因分析(5Why)', children:<div style={{padding:'12px',background:'#fafafa',borderRadius:8}}>
                {['Why1: 为什么会出现偏差？',selectedDev.desc||'待填写',
                  'Why2: 为什么会出现这个直接原因？',selectedDev.rootCause||'待填写',
                  'Why3: 为什么没有提前发现？','待深入调查',
                  'Why4: 系统层面存在哪些漏洞？','待深入调查',
                  'Why5: 如何防止再次发生？','待深入调查',
                ].map((line,i) => <div key={i} style={{padding:'8px 0',borderBottom:i%2===0?'2px solid #1677ff':'1px solid #f0f0f0'}}>
                  <Text style={{color:i%2===0?'#1677ff':'#333',fontWeight:i%2===0?600:400,fontSize:i%2===0?14:13}}>{line}</Text>
                </div>)}
              </div>},
              {key:'capa', label:'CAPA流程', children:<Card size="small">
                <Timeline items={[
                  {color:'green', children:<><Text strong>纠正措施</Text><br /><Text>立即停用该批次试剂，重新检测</Text><Text type="secondary" style={{display:'block'}}>负责人: 郑丽 | 期限: 2024-05-25</Text></>},
                  {color:'blue', children:<><Text strong>预防措施</Text><br /><Text>修订SOP，增加质控频率</Text><Text type="secondary" style={{display:'block'}}>负责人: 张伟 | 期限: 2024-06-01</Text></>},
                  {color:selectedDev.capaStatus==='verified'?'green':'gray', children:<><Text strong>有效性验证</Text><br /><Text>{selectedDev.capaStatus==='verified'?'已验证通过':'待验证'}</Text></>},
                ]} />
              </Card>},
              {key:'attachments', label:'附件', children:<Text type="secondary">暂无附件</Text>},
              {key:'audit', label:'审计追踪', children:<Table dataSource={[
                {time:selectedDev.foundDate+' 09:15',user:selectedDev['责任人']||'-',action:'创建偏差',detail:'偏差编号 '+selectedDev.no},
                {time:selectedDev.foundDate+' 10:30',user:'系统',action:'自动通知',detail:'通知质量主管'},
              ]} rowKey="time" pagination={false} size="small" columns={[
                {title:'时间',dataIndex:'time'},{title:'操作人',dataIndex:'user'},{title:'操作',dataIndex:'action'},{title:'详情',dataIndex:'detail'},
              ]} />},
            ]} />
          </>
        )}
      </Drawer>
    </div>
  );
};

const Divider: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <div style={{ borderTop: '1px solid #f0f0f0', margin: '16px 0' }}>{children}</div>
);
