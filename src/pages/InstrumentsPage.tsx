import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Input, Select, Row, Col, Space, Typography, Drawer, Tabs, Descriptions, Timeline, Badge, Statistic, Modal, Form, message, Tooltip, Progress, Divider, Switch } from 'antd';
import { PlusOutlined, SearchOutlined, ExportOutlined, EditOutlined, EyeOutlined, ToolOutlined, CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, SyncOutlined, PrinterOutlined, DeleteOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { Pie } from '@ant-design/plots';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface Instrument { id: string; name: string; model: string; serialNo: string; manufacturer: string; location: string; responsiblePerson: string; purchaseDate: string; inUseDate: string; status: 'running'|'idle'|'maintenance'|'calibration_due'|'offline'; statusLabel: string; connectionStatus: 'online'|'offline'; utilization: number; calibrationDue: string; maintenanceDate: string; department: string; }
const statusColorMap: Record<string,string> = { running:'#52c41a',idle:'#1677ff',maintenance:'#faad14',calibration_due:'#ff4d4f',offline:'#d9d9d9' };
const statusLabels: Record<string,string> = { running:'运行中',idle:'空闲',maintenance:'维护中',calibration_due:'校准逾期',offline:'离线' };

// Compact detail drawer
const InstrumentDetail: React.FC<{ instrument: Instrument|null; visible: boolean; onClose: ()=>void }> = ({instrument,visible,onClose}) => {
  if(!instrument) return null;
  return (
    <Drawer title={`${instrument.name} — 详情`} open={visible} onClose={onClose} width={560}
      extra={<Space><Button icon={<EditOutlined/>} onClick={()=>message.success('编辑仪器')}>编辑</Button><Button icon={<PrinterOutlined/>} onClick={()=>{const w=window.open('','_blank');if(w){w.document.write(`<pre>${instrument.name}\n${instrument.model}\n${instrument.location}</pre>`);w.print();}}}>打印</Button><Button danger icon={<DeleteOutlined/>} onClick={()=>Modal.confirm({title:'删除',content:`确认删除${instrument.name}?`,onOk:()=>{onClose();message.success('已删除')}})}>删除</Button></Space>}>
      <Descriptions column={2} size="small" bordered style={{marginBottom:12}}>
        <Descriptions.Item label="名称" span={2}>{instrument.name}</Descriptions.Item>
        <Descriptions.Item label="型号">{instrument.model}</Descriptions.Item><Descriptions.Item label="编号">{instrument.serialNo}</Descriptions.Item>
        <Descriptions.Item label="厂家" span={2}>{instrument.manufacturer}</Descriptions.Item>
        <Descriptions.Item label="位置">{instrument.location}</Descriptions.Item><Descriptions.Item label="部门">{instrument.department}</Descriptions.Item>
        <Descriptions.Item label="负责人">{instrument.responsiblePerson}</Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color={statusColorMap[instrument.status]}>{instrument.statusLabel}</Tag></Descriptions.Item>
        <Descriptions.Item label="校准到期"><Text type={dayjs(instrument.calibrationDue).isBefore(dayjs())?'danger':undefined}>{instrument.calibrationDue}</Text></Descriptions.Item>
        <Descriptions.Item label="利用率"><Progress percent={instrument.utilization} size="small"/></Descriptions.Item>
        <Descriptions.Item label="连接"><Badge status={instrument.connectionStatus==='online'?'success':'default'} text={instrument.connectionStatus==='online'?'在线':'离线'}/></Descriptions.Item>
      </Descriptions>
      <Tabs size="small" items={[
        {key:'cal',label:'校准记录',children:<Table dataSource={[{d:'2023-08-15',item:'波长准确度',r:'合格',cert:'CAL20230815-001'},{d:'2022-08-15',item:'波长准确度',r:'合格',cert:'CAL20220815-001'}]} rowKey="cert" pagination={false} size="small" columns={[{title:'日期',dataIndex:'d'},{title:'项目',dataIndex:'item'},{title:'结果',dataIndex:'r',render:(r:string)=><Tag color={r==='合格'?'green':'red'}>{r}</Tag>},{title:'证书',dataIndex:'cert'}]}/>},
        {key:'mt',label:'维护记录',children:<Table dataSource={[{d:'2024-05-10',t:'定期',c:'更换密封垫',p:'张伟'},{d:'2024-04-10',t:'定期',c:'更换进样垫',p:'张伟'}]} rowKey="d" pagination={false} size="small" columns={[{title:'日期',dataIndex:'d'},{title:'类型',dataIndex:'t'},{title:'内容',dataIndex:'c'},{title:'人',dataIndex:'p'}]}/>},
        {key:'use',label:'使用记录',children:<Card size="small"><Text strong>近30天利用率</Text><Progress percent={instrument.utilization} style={{marginTop:8}}/><Text type="secondary" style={{fontSize:11}}>峰值: 工作日9-11时 · 空闲: 周末</Text></Card>},
      ]}/>
    </Drawer>
  );
};

export const InstrumentsPage: React.FC = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument|null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [tab, setTab] = useState('list');

  const fetchInstruments = async () => {
    setLoading(true);
    const res = await fetch('/api/v1/instruments').then(r=>r.json());
    setInstruments(res.data.list); setLoading(false);
  };
  useEffect(()=>{fetchInstruments();},[]);

  const filtered = instruments.filter(i => {
    if(searchText && !i.name.includes(searchText) && !i.model.includes(searchText)) return false;
    if(statusFilter!=='all' && i.status!==statusFilter) return false;
    return true;
  });

  const distributionData = [
    {type:'运行中',value:instruments.filter(i=>i.status==='running').length},
    {type:'空闲',value:instruments.filter(i=>i.status==='idle').length},
    {type:'维护中',value:instruments.filter(i=>i.status==='maintenance').length},
    {type:'校准逾期',value:instruments.filter(i=>i.status==='calibration_due').length},
    {type:'离线',value:instruments.filter(i=>i.status==='offline').length},
  ].filter(d=>d.value>0);

  const columns: ColumnsType<Instrument> = [
    {title:'仪器名称',dataIndex:'name',render:(name:string,r:Instrument)=><a onClick={()=>{setSelectedInstrument(r);setDrawerVisible(true);}}>{name}</a>},
    {title:'型号',dataIndex:'model'},
    {title:'位置',dataIndex:'location'},
    {title:'负责人',dataIndex:'responsiblePerson',width:80},
    {title:'状态',dataIndex:'status',width:80,render:(_:string,r:Instrument)=><Tag color={statusColorMap[r.status]}>{r.statusLabel}</Tag>},
    {title:'连接',dataIndex:'connectionStatus',width:60,render:(s:string)=><Badge status={s==='online'?'success':'default'}/>},
    {title:'校准到期',dataIndex:'calibrationDue',width:100,render:(d:string)=><Text type={dayjs(d).isBefore(dayjs())?'danger':undefined}>{d}</Text>},
    {title:'利用率',dataIndex:'utilization',width:100,render:(v:number)=><Progress percent={v} size="small"/>},
    {title:'操作',width:80,render:(_:any,r:Instrument)=><Space size="small"><Tooltip title="详情"><Button type="link" size="small" icon={<EyeOutlined/>} onClick={()=>{setSelectedInstrument(r);setDrawerVisible(true);}}/></Tooltip></Space>},
  ];

  const handleCreate = async () => {
    const v = form.getFieldsValue();
    const res = await fetch('/api/v1/instruments',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(v)});
    const json = await res.json();
    if(json.code===200){message.success('创建成功');setModalVisible(false);form.resetFields();fetchInstruments();}
  };

  const StatBar = () => (
    <Row gutter={[16,16]} style={{marginBottom:16}}>
      <Col xs={6}><Card size="small"><Statistic title="仪器总数" value={instruments.length} prefix={<ToolOutlined/>}/></Card></Col>
      <Col xs={6}><Card size="small"><Statistic title="运行中" value={instruments.filter(i=>i.status==='running').length} valueStyle={{color:'#52c41a'}}/></Card></Col>
      <Col xs={6}><Card size="small"><Statistic title="空闲" value={instruments.filter(i=>i.status==='idle').length} valueStyle={{color:'#1677ff'}}/></Card></Col>
      <Col xs={6}><Card size="small"><Statistic title="维护/逾期" value={instruments.filter(i=>i.status==='maintenance'||i.status==='calibration_due').length} valueStyle={{color:'#faad14'}}/></Card></Col>
    </Row>
  );

  return (
    <div>
      <Row justify="space-between" style={{marginBottom:16}}>
        <Col><Title level={4}>仪器管理</Title></Col>
        <Col><Space><Button icon={<ExportOutlined/>} onClick={()=>{const csv='名称,型号,位置,状态\n'+instruments.map(i=>[i.name,i.model,i.location,i.statusLabel].join(',')).join('\n');const b=new Blob([csv]);const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='instruments.csv';a.click();}}>导出</Button><Button type="primary" icon={<PlusOutlined/>} onClick={()=>setModalVisible(true)}>新建仪器</Button></Space></Col>
      </Row>

      <StatBar/>

      <Row gutter={16}>
        {/* Main Content: Tabs */}
        <Col xs={24} lg={16}>
          <Tabs activeKey={tab} onChange={setTab} items={[
            { key:'list', label:`仪器列表(${filtered.length})`, children:<Card>
              <Space style={{marginBottom:12}}>
                <Input placeholder="搜索名称/型号" prefix={<SearchOutlined/>} value={searchText} onChange={e=>setSearchText(e.target.value)} style={{width:200}} allowClear/>
                <Select value={statusFilter} onChange={setStatusFilter} style={{width:110}}>
                  <Select.Option value="all">全部</Select.Option>
                  {Object.entries(statusLabels).map(([k,v])=><Select.Option key={k} value={k}><Badge color={statusColorMap[k]} text={v}/></Select.Option>)}
                </Select>
              </Space>
              <Table columns={columns} dataSource={filtered} rowKey="id" loading={loading} pagination={{pageSize:8,showTotal:t=>`${t}台`}} size="middle"/>
            </Card>},
            { key:'monitor', label:'实时监控', children:<Row gutter={[12,12]}>
              {instruments.slice(0,6).map(inst=><Col span={8} key={inst.id}>
                <Card size="small" hoverable><Space><Badge status={inst.connectionStatus==='online'?'success':'error'}/><Text strong>{inst.name}</Text></Space>
                <Progress percent={inst.utilization} size="small" style={{marginTop:4}}/>
                <Text type="secondary" style={{fontSize:11}}>{statusLabels[inst.status]} · {inst.connectionStatus==='online'?'在线':'离线'}</Text>
                </Card></Col>)}
            </Row>},
            { key:'schedule', label:'校准排期', children:<Card extra={<Button size="small" onClick={()=>message.success('自动排期已启用')}>启用自动排期</Button>}>
              <Table dataSource={[
                {inst:'HPLC-安捷伦1260',next:'2024-08-15',cycle:'12月',s:'scheduled',a:'张伟'},
                {inst:'GC-MS-岛津QP2020',next:'2024-07-20',cycle:'12月',s:'scheduled',a:'李明'},
                {inst:'ICP-MS-7800',next:'2024-06-10',cycle:'12月',s:'warning',a:'郑丽'},
              ]} rowKey="inst" pagination={false} size="small" columns={[
                {title:'仪器',dataIndex:'inst'},{title:'下次校准',dataIndex:'next'},{title:'周期',dataIndex:'cycle'},
                {title:'状态',dataIndex:'s',render:(s:string)=><Tag color={s==='warning'?'orange':'blue'}>{s==='warning'?'即将到期':'已排期'}</Tag>},
                {title:'负责人',dataIndex:'a'},{title:'操作',render:()=><Space size="small"><Button type="link" size="small">校准</Button><Button type="link" size="small">推迟</Button></Space>},
              ]}/>
            </Card>},
            { key:'iqoq', label:'IQ/OQ/PQ', children:<Table dataSource={[
              {inst:'HPLC-1260',t:'IQ',d:'2023-06-15',v:'2027-06-15',c:'IQ-20230615-001'},
              {inst:'HPLC-1260',t:'OQ',d:'2023-06-20',v:'2026-06-20',c:'OQ-20230620-001'},
              {inst:'HPLC-1260',t:'PQ',d:'2023-06-25',v:'2025-06-25',c:'PQ-20230625-001'},
            ]} rowKey="c" pagination={false} size="small" columns={[
              {title:'仪器',dataIndex:'inst'},{title:'类型',dataIndex:'t',render:(t:string)=><Tag color={t==='IQ'?'blue':t==='OQ'?'green':'orange'}>{t}</Tag>},
              {title:'日期',dataIndex:'d'},{title:'有效期',dataIndex:'v'},{title:'证书',dataIndex:'c',render:(c:string)=><code>{c}</code>},
            ]}/>},
            { key:'check', label:'期间核查', children:<Table dataSource={[
              {inst:'HPLC-1260',item:'波长准确度',plan:'2026-06-15',s:'scheduled',last:'2025-12-15',r:'-'},
              {inst:'GC-MS-QP2020',item:'灵敏度',plan:'2026-05-20',s:'in_progress',last:'2025-11-20',r:'待判定'},
            ]} rowKey="inst" pagination={false} size="small" columns={[
              {title:'仪器',dataIndex:'inst'},{title:'核查项',dataIndex:'item'},{title:'计划',dataIndex:'plan'},
              {title:'上次',dataIndex:'last'},{title:'结果',dataIndex:'r',render:(r:string)=><Tag>{r||'待核查'}</Tag>},
              {title:'状态',dataIndex:'s',render:(s:string)=><Badge status={s==='in_progress'?'processing':'default'} text={s==='in_progress'?'核查中':'已计划'}/>},
            ]}/>},
          ]}/>
        </Col>

        {/* Right Sidebar */}
        <Col xs={24} lg={8}>
          <Card title="状态分布" size="small" style={{marginBottom:12}}>
            {distributionData.length>0 ? <Pie data={distributionData} angleField="value" colorField="type" radius={0.7} label={{type:'outer',content:'{name} {percentage}'}} color={['#52c41a','#1677ff','#faad14','#ff4d4f','#d9d9d9']} height={180}/> : <Text type="secondary">暂无</Text>}
          </Card>
          <Card title="⚠️ 告警" size="small" style={{marginBottom:12}}>
            <Timeline items={[
              {color:'red',children:<><Text strong>ICP-001 维护中</Text><br/><Text type="secondary">预计恢复: 5/22 14:00</Text></>},
              {color:'orange',children:<><Text strong>电子天平 校准逾期</Text><br/><Text type="secondary">5/1到期</Text></>},
            ]}/>
          </Card>
          <Card title="🔝 利用率排行" size="small">
            {instruments.sort((a,b)=>b.utilization-a.utilization).slice(0,5).map(i=>
              <div key={i.id} style={{marginBottom:4}}><Row justify="space-between"><Col><Text style={{fontSize:12}}>{i.name}</Text></Col><Col><Text style={{fontSize:12,color:i.utilization>70?'#52c41a':i.utilization>40?'#1677ff':'#999'}}>{i.utilization}%</Text></Col></Row><Progress percent={i.utilization} size="small" showInfo={false}/></div>
            )}
          </Card>
        </Col>
      </Row>

      <InstrumentDetail instrument={selectedInstrument} visible={drawerVisible} onClose={()=>{setDrawerVisible(false);setSelectedInstrument(null);}}/>

      <Modal title="新建仪器档案" open={modalVisible} onOk={()=>form.submit()} onCancel={()=>{setModalVisible(false);form.resetFields();}} width={560}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="仪器名称" required><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="model" label="型号" required><Input/></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="serialNo" label="编号"><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="manufacturer" label="厂商"><Input/></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="department" label="部门"><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="location" label="安装位置"><Input/></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="responsiblePerson" label="责任人"><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="status" label="状态" initialValue="idle"><Select>{Object.entries(statusLabels).map(([k,v])=><Select.Option key={k} value={k}>{v}</Select.Option>)}</Select></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
