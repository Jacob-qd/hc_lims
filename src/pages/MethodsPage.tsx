import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Drawer, Descriptions, Tabs, Modal, Form, Timeline, Progress, InputNumber, Badge, Alert } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, EditOutlined, HistoryOutlined, PrinterOutlined, ExperimentOutlined, SafetyCertificateOutlined, BarChartOutlined, SwapOutlined, CalculatorOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const statusColors: Record<string, string> = { active: '#52c41a', revision: '#faad14', archived: '#d9d9d9', draft: '#1677ff' };

export const MethodsPage: React.FC = () => {
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [versionModal, setVersionModal] = useState(false);
  const [sopModal, setSopModal] = useState(false);
  const [comparisonModal, setComparisonModal] = useState(false);
  const [uncertaintyModal, setUncertaintyModal] = useState(false);
  const [versionForm] = Form.useForm();
  const [sopForm] = Form.useForm();
  const [createModal, setCreateModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => { fetch('/api/v1/methods').then(r=>r.json()).then(d=>{setMethods(d.data.list);setLoading(false);}); }, []);

  const filtered = methods.filter((m: any) => m.name.includes(search) || m.code.includes(search) || m.analyte.includes(search));
  const stats = { active: methods.filter((m: any) => m.status === 'active').length, revision: methods.filter((m: any) => m.status === 'revision').length, archived: methods.filter((m: any) => m.status === 'archived').length, validating: 3 };

  // Uncertainty calculator
  const [ucType, setUcType] = useState('A');
  const [ucValues, setUcValues] = useState('');
  const [ucResult, setUcResult] = useState<number|null>(null);
  const calcUncertainty = () => {
    const vals = ucValues.split(',').map(Number).filter(v=>!isNaN(v));
    if(vals.length<2){message.warning('至少输入2个数值');return;}
    const mean = vals.reduce((a,b)=>a+b,0)/vals.length;
    const stdev = Math.sqrt(vals.reduce((a,b)=>a+Math.pow(b-mean,2),0)/(vals.length-1));
    const u = ucType==='A' ? stdev/Math.sqrt(vals.length) : stdev;
    setUcResult(Math.round(u*10000)/10000);
    message.success(`标准不确定度: ${u.toFixed(4)}`);
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><ExperimentOutlined/> 方法管理</Title></Col>
        <Col><Space>
          <Button icon={<SwapOutlined/>} onClick={()=>setComparisonModal(true)}>方法比对</Button>
          <Button icon={<CalculatorOutlined/>} onClick={()=>setUncertaintyModal(true)}>不确定度</Button>
          <Button onClick={()=>setVersionModal(true)}>版本发布</Button>
          <Button onClick={()=>setSopModal(true)}>关联SOP</Button>
          <Button type="primary" icon={<PlusOutlined/>} onClick={()=>setCreateModal(true)}>新建方法</Button>
        </Space></Col>
      </Row>

      <Row gutter={[16,16]} style={{marginBottom:16}}>
        <Col xs={6}><Card size="small"><Statistic title="生效方法" value={stats.active} valueStyle={{color:'#52c41a'}}/></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="修订中" value={stats.revision} valueStyle={{color:'#faad14'}}/></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="验证中" value={stats.validating} valueStyle={{color:'#1677ff'}}/></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="归档版本" value={stats.archived}/></Card></Col>
      </Row>

      <Tabs defaultActiveKey="list" items={[
        { key:'list', label:'方法列表', children:<Card>
          <Space style={{marginBottom:16}}>
            <Input placeholder="搜索" prefix={<SearchOutlined/>} value={search} onChange={e=>setSearch(e.target.value)} style={{width:280}} allowClear/>
            <Select placeholder="状态" style={{width:120}} allowClear>
              {Object.entries(statusColors).map(([k,v])=><Select.Option key={k}><Tag color={v}>{k==='active'?'生效':k==='revision'?'修订中':k==='archived'?'已归档':'草稿'}</Tag></Select.Option>)}
            </Select>
          </Space>
          <Table dataSource={filtered} rowKey="id" loading={loading} pagination={{pageSize:10}} size="middle" columns={[
            {title:'方法编号',dataIndex:'code',render:(c:string)=><Text code>{c}</Text>},
            {title:'方法名称',dataIndex:'name',render:(n:string,r:any)=><a onClick={()=>{setSelected(r);setDrawer(true);}}>{n}</a>},
            {title:'分析项目',dataIndex:'analyte'},{title:'版本',dataIndex:'version'},
            {title:'基质',dataIndex:'matrix'},{title:'仪器',dataIndex:'instrument'},
            {title:'检出限',dataIndex:'detectionLimit'},{title:'定量限',dataIndex:'quantificationLimit',render:(v:string)=>v||'-'},
            {title:'测量范围',dataIndex:'measurementRange',ellipsis:true,render:(v:string)=>v||'-'},
            {title:'不确定度',dataIndex:'uncertainty',render:(v:string)=>v||'-'},
            {title:'生效日期',dataIndex:'effectiveDate'},{title:'负责人',dataIndex:'responsible'},
            {title:'状态',dataIndex:'status',render:(s:string)=><Badge status={s==='active'?'success':s==='revision'?'warning':'default'} text={s==='active'?'生效':s==='revision'?'修订中':s==='archived'?'已归档':'草稿'}/>},
            {title:'操作',render:(_:any,r:any)=><Space size="small">
              <Button type="link" size="small" icon={<EyeOutlined/>} onClick={()=>{setSelected(r);setDrawer(true);}}/>
              <Button type="link" size="small" icon={<EditOutlined/>} onClick={()=>{setEditingMethod(r);form.setFieldsValue(r);setEditModal(true);}}/>
              <Button type="link" size="small" onClick={()=>{methods.push({...r,id:'m'+(methods.length+1),code:r.code+'-CPY',version:'v1.0(draft)',name:r.name+' (副本)'});message.success('已复制');}}>复制</Button>
            </Space>},
          ]}/>
        </Card>},
        { key:'validation', label:'📋 方法验证矩阵', children:<Card>
          <Table dataSource={['HJ 828-2017 COD','HJ 1147-2020 pH','HJ 535-2009 氨氮','GB/T 17141 Pb/Cd'].map((m,i)=>({
            key:i, method:m,
            accuracy:i<3?'✅':i===3?'🟡':'⬜', precision:i<2?'✅':i===2?'🟡':'⬜',
            linearity:i<3?'✅':'⬜', lod:i<3?'✅':'⬜', loq:i<2?'✅':'⬜',
            robustness:i<2?'✅':i===2?'🟡':'⬜', recovery:i<3?'✅':'⬜',
            status:i<2?'已验证':i===2?'验证中':'待验证'
          }))} rowKey="key" pagination={false} size="small" columns={[
            {title:'方法',dataIndex:'method'},
            {title:'准确度',dataIndex:'accuracy'},{title:'精密度',dataIndex:'precision'},
            {title:'线性',dataIndex:'linearity'},{title:'LOD',dataIndex:'lod'},
            {title:'LOQ',dataIndex:'loq'},{title:'稳健性',dataIndex:'robustness'},
            {title:'回收率',dataIndex:'recovery'},
            {title:'状态',dataIndex:'status',render:(s:string)=><Tag color={s==='已验证'?'green':s==='验证中'?'orange':'default'}>{s}</Tag>},
          ]}/>
        </Card>},
        { key:'lodloq', label:'🔬 LOD/LOQ 验证', children:<Card>
          <Descriptions bordered size="small" column={2} style={{marginBottom:12}}>
            <Descriptions.Item label="LOD 计算方法"><Tag color="blue">3倍信噪比 (S/N=3)</Tag></Descriptions.Item>
            <Descriptions.Item label="LOQ 计算方法"><Tag color="blue">10倍信噪比 (S/N=10)</Tag></Descriptions.Item>
          </Descriptions>
          <Table dataSource={[
            {method:'HJ 828-2017',analyte:'COD',blankSD:0.15,slope:0.0076,lod:'0.6 mg/L',loq:'2.0 mg/L',status:'通过'},
            {method:'HJ 535-2009',analyte:'氨氮',blankSD:0.012,slope:0.0082,lod:'0.025 mg/L',loq:'0.08 mg/L',status:'通过'},
            {method:'GB/T 17141',analyte:'Pb',blankSD:0.008,slope:0.0051,lod:'0.005 mg/L',loq:'0.015 mg/L',status:'通过'},
          ]} rowKey="method" pagination={false} size="small" columns={[
            {title:'方法',dataIndex:'method'},{title:'分析物',dataIndex:'analyte'},
            {title:'空白SD',dataIndex:'blankSD'},{title:'斜率',dataIndex:'slope'},
            {title:'LOD',dataIndex:'lod',render:(v:string)=><Text strong style={{color:'#1677ff'}}>{v}</Text>},
            {title:'LOQ',dataIndex:'loq',render:(v:string)=><Text strong style={{color:'#52c41a'}}>{v}</Text>},
            {title:'状态',dataIndex:'status',render:(s:string)=><Tag color="green">{s}</Tag>},
          ]}/>
        </Card>},
      ]}/>

      {/* Detail Drawer */}
      <Drawer title={`${selected?.code} ${selected?.name}`} open={drawer} onClose={()=>{setDrawer(false);setSelected(null);}} width={560}
        extra={<Space><Button icon={<EditOutlined/>} onClick={()=>{setEditingMethod(selected);form.setFieldsValue(selected);setEditModal(true);}}>编辑</Button><Button icon={<PrinterOutlined/>} onClick={()=>{const t=`方法: ${selected?.code}\n名称: ${selected?.name}\n检出限: ${selected?.detectionLimit}\n定量限: ${selected?.quantificationLimit||'-'}\n不确定度: ${selected?.uncertainty||'-'}`;const b=new Blob([t],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`${selected?.code}.txt`;a.click();}}>导出</Button></Space>}>
        {selected && <>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="方法编号" span={2}>{selected.code}</Descriptions.Item>
            <Descriptions.Item label="名称" span={2}>{selected.name}</Descriptions.Item>
            <Descriptions.Item label="版本">{selected.version}</Descriptions.Item>
            <Descriptions.Item label="状态"><Tag color={statusColors[selected.status]}>{selected.statusLabel}</Tag></Descriptions.Item>
            <Descriptions.Item label="分析项目">{selected.analyte}</Descriptions.Item>
            <Descriptions.Item label="样品基质">{selected.matrix}</Descriptions.Item>
            <Descriptions.Item label="适用仪器">{selected.instrument}</Descriptions.Item>
            <Descriptions.Item label="检出限(LOD)">{selected.detectionLimit}</Descriptions.Item>
            <Descriptions.Item label="定量限(LOQ)">{selected.quantificationLimit||'-'}</Descriptions.Item>
            <Descriptions.Item label="测量范围">{selected.measurementRange||'-'}</Descriptions.Item>
            <Descriptions.Item label="不确定度">{selected.uncertainty||'-'}</Descriptions.Item>
            <Descriptions.Item label="生效日期">{selected.effectiveDate}</Descriptions.Item>
            <Descriptions.Item label="负责人">{selected.responsible}</Descriptions.Item>
          </Descriptions>
          <Tabs style={{marginTop:16}} items={[
            {key:'sop',label:'SOP文档',children:<div>
              <Descriptions size="small" bordered style={{marginBottom:8}}>
                <Descriptions.Item label="SOP编号">SOP-{selected.code}-v2</Descriptions.Item>
                <Descriptions.Item label="版本">v2.0</Descriptions.Item>
              </Descriptions>
              <Button type="primary" size="small" onClick={()=>{const s=`SOP: ${selected.code}\nv2.0\n---\n1.范围\n2.原理\n3.试剂\n4.步骤\n5.QC`;const b=new Blob([s]);const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`SOP-${selected.code}.txt`;a.click();}}>下载SOP</Button>
            </div>},
            {key:'versions',label:'版本历史',children:<Timeline items={[
              {color:'green',children:<>{selected.version} 当前<br/>{selected.effectiveDate}</>},
              {color:'blue',children:<>v1.0 初版<br/>2023-01-01</>},
            ]}/>},
          ]}/>
        </>}
      </Drawer>

      {/* Edit Modal */}
      <Modal title="编辑方法" open={editModal} onOk={()=>form.submit()} onCancel={()=>{setEditModal(false);setEditingMethod(null);form.resetFields();}}>
        <Form form={form} layout="vertical" onFinish={(v)=>{if(editingMethod)Object.assign(editingMethod,v);message.success('已更新');setEditModal(false);setEditingMethod(null);form.resetFields();}}>
          <Form.Item name="code" label="方法编号"><Input disabled/></Form.Item>
          <Form.Item name="name" label="方法名称" required><Input/></Form.Item>
          <Form.Item name="analyte" label="分析项目"><Input/></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="matrix" label="基质"><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="instrument" label="仪器"><Input/></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}><Form.Item name="detectionLimit" label="LOD"><Input/></Form.Item></Col>
            <Col span={8}><Form.Item name="quantificationLimit" label="LOQ"><Input/></Form.Item></Col>
            <Col span={8}><Form.Item name="uncertainty" label="不确定度"><Input placeholder="±0.5 mg/L"/></Form.Item></Col>
          </Row>
          <Form.Item name="measurementRange" label="测量范围"><Input placeholder="0.5-100 mg/L"/></Form.Item>
        </Form>
      </Modal>

      {/* Comparison Modal */}
      <Modal title="方法比对" open={comparisonModal} onCancel={()=>setComparisonModal(false)} width={700} footer={null}>
        <Table dataSource={[
          {method:'HJ 828-2017',analyte:'COD',lod:'0.6',loq:'2.0',range:'4-700',time:'2h',cost:'¥120',status:'现行'},
          {method:'ISO 6060:1989',analyte:'COD',lod:'0.5',loq:'1.5',range:'5-1000',time:'2h',cost:'¥200',status:'国际'},
          {method:'EPA 410.4',analyte:'COD',lod:'1.0',loq:'4.0',range:'5-500',time:'2h',cost:'¥250',status:'美国EPA'},
        ]} rowKey="method" pagination={false} size="small" columns={[
          {title:'方法',dataIndex:'method'},{title:'LOD(mg/L)',dataIndex:'lod'},
          {title:'LOQ(mg/L)',dataIndex:'loq'},{title:'范围(mg/L)',dataIndex:'range'},
          {title:'耗时',dataIndex:'time'},{title:'成本',dataIndex:'cost'},
          {title:'状态',dataIndex:'status',render:(s:string)=><Tag color={s==='现行'?'green':s==='国际'?'blue':'orange'}>{s}</Tag>},
        ]}/>
        <Alert message="当前使用: HJ 828-2017 (行业标准, 成本最优)" type="info" showIcon style={{marginTop:12}}/>
      </Modal>

      {/* Uncertainty Modal */}
      <Modal title="测量不确定度计算" open={uncertaintyModal} onCancel={()=>{setUncertaintyModal(false);setUcResult(null);}} footer={null}>
        <Form layout="vertical">
          <Form.Item label="评定类型"><Select value={ucType} onChange={setUcType}>
            <Select.Option value="A">A类 (统计法 — 重复测量)</Select.Option>
            <Select.Option value="B">B类 (非统计法 — 证书/经验)</Select.Option>
          </Select></Form.Item>
          <Form.Item label={ucType==='A'?'输入重复测量值(逗号分隔)':'输入标准偏差'}>
            <Input.TextArea value={ucValues} onChange={e=>setUcValues(e.target.value)} placeholder={ucType==='A'?'25.4,25.6,25.3,25.7,25.5':'0.15'} rows={3}/>
          </Form.Item>
          <Button type="primary" onClick={calcUncertainty} block>计算不确定度</Button>
          {ucResult!==null && <Alert message={`标准不确定度: ${ucResult}${ucType==='A'?' (A类)':' (B类)'}`} type="success" showIcon style={{marginTop:12}}/>}
        </Form>
      </Modal>

      {/* Create/Version/SOP modals — simplified inline */}
      <Modal title="新建方法" open={createModal} onOk={()=>form.submit()} onCancel={()=>{setCreateModal(false);form.resetFields();}}>
        <Form form={form} layout="vertical" onFinish={(v)=>{message.success('创建成功');setCreateModal(false);form.resetFields();}}>
          <Form.Item name="code" label="方法编号"><Input/></Form.Item>
          <Form.Item name="name" label="方法名称" required><Input/></Form.Item>
          <Form.Item name="analyte" label="分析项目"><Input/></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="matrix" label="基质"><Input/></Form.Item></Col>
            <Col span={12}><Form.Item name="instrument" label="仪器"><Input/></Form.Item></Col>
          </Row>
          <Form.Item name="detectionLimit" label="检出限"><Input/></Form.Item>
        </Form>
      </Modal>

      <Modal title="版本发布" open={versionModal} onOk={()=>versionForm.submit()} onCancel={()=>{setVersionModal(false);versionForm.resetFields();}}>
        <Form form={versionForm} layout="vertical" onFinish={(v)=>{message.success(`版本${v.newVersion}已发布`);setVersionModal(false);versionForm.resetFields();}}>
          <Form.Item name="methodCode" label="方法" required><Select>{methods.filter(m=>m.status==='revision').map(m=><Select.Option key={m.code}>{m.code}</Select.Option>)}</Select></Form.Item>
          <Row gutter={16}><Col span={12}><Form.Item name="newVersion" label="版本号" required><Input placeholder="v2.1"/></Form.Item></Col><Col span={12}><Form.Item name="effectiveDate" label="生效日期"><Input/></Form.Item></Col></Row>
          <Form.Item name="changeLog" label="变更说明"><Input.TextArea rows={2}/></Form.Item>
        </Form>
      </Modal>

      <Modal title="关联SOP" open={sopModal} onOk={()=>sopForm.submit()} onCancel={()=>{setSopModal(false);sopForm.resetFields();}}>
        <Form form={sopForm} layout="vertical" onFinish={(v)=>{message.success('SOP已关联');setSopModal(false);sopForm.resetFields();}}>
          <Form.Item name="methodCode" label="方法" required><Select>{methods.map(m=><Select.Option key={m.code}>{m.code}</Select.Option>)}</Select></Form.Item>
          <Form.Item name="sopTitle" label="SOP标题" required><Input/></Form.Item>
          <Form.Item name="sopFile" label="文件路径"><Input/></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
