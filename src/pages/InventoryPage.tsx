import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Drawer, Descriptions, Modal, Form, message, Tabs, Popconfirm, InputNumber } from 'antd';
import { SearchOutlined, ShoppingCartOutlined, InboxOutlined, ExportOutlined, AuditOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const categoryColors: Record<string, string> = { 试剂: '#1677ff', 耗材: '#52c41a', 标准品: '#722ed1' };
const statusColors: Record<string, string> = { normal: '#52c41a', low: '#faad14', expiring: '#ff4d4f', out: '#d9d9d9' };
const urgencyColors: Record<string, string> = { 紧急: '#ff4d4f', 普通: '#1677ff' };

interface StockMovement {
  id: string; itemId: string; type: 'in' | 'out' | 'check'; qty: number; date: string; operator: string; note?: string;
}

interface Supplier {
  id: string; name: string; contact: string; phone: string; email: string; rating: string; status: string;
}

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);
  const [prDrawer, setPrDrawer] = useState(false);
  const [inModal, setInModal] = useState(false);
  const [outModal, setOutModal] = useState(false);
  const [checkModal, setCheckModal] = useState(false);
  const [prModal, setPrModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);
  const [supplierEdit, setSupplierEdit] = useState<Supplier | null>(null);
  const [inForm] = Form.useForm();
  const [outForm] = Form.useForm();
  const [checkForm] = Form.useForm();
  const [prForm] = Form.useForm();
  const [supplierForm] = Form.useForm();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {id:'s1',name:'国药集团化学试剂',contact:'张经理',phone:'021-12345678',email:'sales@sinopharm.com',rating:'A',status:'active'},
    {id:'s2',name:'默克化工',contact:'李经理',phone:'021-87654321',email:'info@merck.cn',rating:'A',status:'active'},
    {id:'s3',name:'赛默飞世尔',contact:'王经理',phone:'010-12345678',email:'info@thermofisher.cn',rating:'B',status:'active'},
    {id:'s4',name:'阿拉丁试剂',contact:'赵经理',phone:'021-11223344',email:'sales@aladdin.cn',rating:'B',status:'inactive'},
  ]);

  const fetchData = async () => {
    setLoading(true);
    const [ir, pr] = await Promise.all([fetch('/api/v1/inventory').then(r => r.json()), fetch('/api/v1/inventory/purchase-requests').then(r => r.json())]);
    setItems(ir.data.list); setPrs(pr.data.list); setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter((i: any) => i.name.includes(search) || i.code.includes(search) || i.supplier.includes(search));
  const stats = { total: items.length, low: items.filter((i: any) => i.status === 'low' || i.status === 'out').length, expiring: items.filter((i: any) => i.status === 'expiring').length, pendingPr: prs.filter((p: any) => p.status === 'pending_approval').length };

  const handleStockIn = () => {
    const values = inForm.getFieldsValue();
    const newItem = {
      id: `inv-${Date.now()}`,
      code: values.code || `RE-${String(items.length + 1).padStart(3, '0')}`,
      name: values.name,
      category: values.category || '试剂',
      spec: values.spec || '-',
      batchNo: values.batchNo || '-',
      supplier: values.supplier || '-',
      location: values.location || 'A-01',
      stock: Number(values.qty) || 1,
      unit: values.unit || '瓶',
      safetyStock: values.safetyStock || 5,
      expiryDate: values.expiry,
      price: values.price || 0,
      status: 'normal',
      statusLabel: '正常',
    };
    setItems([newItem, ...items]);
    setMovements([...movements, { id: `mv-${Date.now()}`, itemId: newItem.id, type: 'in', qty: newItem.stock, date: new Date().toISOString().split('T')[0], operator: values.operator || '当前用户', note: values.note }]);
    message.success('入库成功');
    setInModal(false);
    inForm.resetFields();
  };

  const handleStockOut = () => {
    if (!selected) return;
    const values = outForm.getFieldsValue();
    const qty = Number(values.qty);
    if (qty > selected.stock) { message.error('出库数量大于库存'); return; }
    setItems(items.map(i => i.id === selected.id ? { ...i, stock: i.stock - qty, status: i.stock - qty <= i.safetyStock ? (i.stock - qty <= 0 ? 'out' : 'low') : i.status } : i));
    setMovements([...movements, { id: `mv-${Date.now()}`, itemId: selected.id, type: 'out', qty, date: new Date().toISOString().split('T')[0], operator: values.operator || '当前用户', note: values.note }]);
    message.success('出库成功');
    setOutModal(false);
    outForm.resetFields();
    setSelected(null);
  };

  const handleStockCheck = () => {
    if (!selected) return;
    const values = checkForm.getFieldsValue();
    const actual = Number(values.actual);
    const diff = actual - selected.stock;
    setItems(items.map(i => i.id === selected.id ? { ...i, stock: actual, status: actual <= i.safetyStock ? (actual <= 0 ? 'out' : 'low') : i.status } : i));
    setMovements([...movements, { id: `mv-${Date.now()}`, itemId: selected.id, type: 'check', qty: diff, date: new Date().toISOString().split('T')[0], operator: values.operator || '当前用户', note: `盘点调整: ${diff > 0 ? '+' : ''}${diff}` }]);
    message.success(`盘点完成，差异: ${diff > 0 ? '+' : ''}${diff}`);
    setCheckModal(false);
    checkForm.resetFields();
  };

  const handleCreatePr = () => {
    const values = prForm.getFieldsValue();
    const newPr = {
      id: `pr-${Date.now()}`,
      no: `PR-${String(prs.length + 1).padStart(4, '0')}`,
      applicant: values.applicant || '当前用户',
      dept: values.dept || '实验室',
      date: new Date().toISOString().split('T')[0],
      urgency: values.urgency || '普通',
      total: Number(values.total) || 0,
      status: 'pending_approval',
      items: [{ name: values.name, spec: values.spec || '-', qty: values.qty || 1, price: values.price || 0 }],
    };
    setPrs([newPr, ...prs]);
    message.success('采购申请已提交');
    setPrModal(false);
    prForm.resetFields();
  };

  const handleSaveSupplier = () => {
    const values = supplierForm.getFieldsValue();
    if (supplierEdit) {
      setSuppliers(suppliers.map(s => s.id === supplierEdit.id ? { ...s, ...values } : s));
      message.success('供应商已更新');
    } else {
      const newS: Supplier = { id: `s-${Date.now()}`, ...values };
      setSuppliers([newS, ...suppliers]);
      message.success('供应商已创建');
    }
    setSupplierModal(false);
    setSupplierEdit(null);
    supplierForm.resetFields();
  };

  const handleDeleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    message.success('供应商已删除');
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}><Col><Title level={4}>库存管理</Title></Col>
        <Col><Space><Button icon={<ShoppingCartOutlined />} onClick={() => setPrModal(true)}>采购申请</Button><Button type="primary" icon={<InboxOutlined />} onClick={() => setInModal(true)}>试剂入库</Button></Space></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="物料总数(SKU)" value={stats.total} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="低库存" value={stats.low} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="即将过期" value={stats.expiring} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="待采购申请" value={stats.pendingPr} valueStyle={{ color: '#1677ff' }} /></Card></Col>
      </Row>
      <Tabs defaultActiveKey="inventory" items={[
        { key: 'inventory', label: '库存列表', children: (
          <Card><Space style={{ marginBottom: 16 }}>
            <Input placeholder="搜索名称/编号/供应商" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
            <Select placeholder="分类" style={{ width: 120 }} allowClear>{['试剂','耗材','标准品'].map(t => <Select.Option key={t}>{t}</Select.Option>)}</Select>
            <Select placeholder="状态" style={{ width: 120 }} allowClear>{Object.entries(statusColors).map(([k,v]) => <Select.Option key={k} value={k}><Tag color={v}>{k==='normal'?'正常':k==='low'?'低库存':k==='expiring'?'即将过期':'缺货'}</Tag></Select.Option>)}</Select>
          </Space>
          <div style={{marginBottom:8}}><Space>
            <Button size="small" icon={<InboxOutlined />} onClick={() => setInModal(true)}>入库</Button>
            <Button size="small" icon={<ExportOutlined />} onClick={() => { if (!selected) { message.info('请先选择一行库存'); return; } setOutModal(true); }}>出库</Button>
            <Button size="small" icon={<AuditOutlined />} onClick={() => { if (!selected) { message.info('请先选择一行库存'); return; } setCheckModal(true); }}>盘点</Button>
          </Space></div>
          <Table rowSelection={{ type: 'radio', onChange: (_: any, rows: any[]) => setSelected(rows[0] || null) }} dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
            { title: '编码', dataIndex: 'code', render: (c: string) => <Text code>{c}</Text> },
            { title: '名称', dataIndex: 'name', render: (n: string, r: any) => <a onClick={() => { setSelected(r); setDrawer(true); }}>{n}</a> },
            { title: '分类', dataIndex: 'category', render: (c: string) => <Tag color={categoryColors[c]}>{c}</Tag> },
            { title: '批号', dataIndex: 'batchNo' },
            { title: '库存', dataIndex: 'stock', render: (s: number, r: any) => <Text type={s <= r.safetyStock ? 'danger' : undefined}>{s}{r.unit}</Text> },
            { title: '安全库存', dataIndex: 'safetyStock', render: (s: number, r: any) => <Text type={r.stock <= s ? 'danger' : undefined}>{s}{r.unit}</Text> },
            { title: '有效期', dataIndex: 'expiryDate', render: (d: string) => <Text type={new Date(d) < new Date(Date.now() + 30*86400000) ? 'danger' : undefined}>{d}</Text> },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={statusColors[s]}>{s==='normal'?'正常':s==='low'?'低库存':s==='expiring'?'即将过期':'缺货'}</Tag> },
          ]} size="middle" />
          <Card title="到期预警 (30天内)" size="small" style={{marginTop:16}}>
            <Row gutter={16}>
              {filtered.filter((i:any) => i.status === 'expiring' || i.status === 'low' || i.status === 'out').slice(0,4).map((i:any) => (
                <Col span={6} key={i.id}>
                  <Card size="small" style={{borderLeft:'3px solid '+(i.status==='out'?'#ff4d4f':i.status==='expiring'?'#faad14':'#fa8c16')}}>
                    <Text strong style={{fontSize:13}}>{i.name}</Text><br />
                    <Text type="secondary" style={{fontSize:12}}>{i.category} | {i.location}</Text><br />
                    <Tag color={statusColors[i.status]}>{i.statusLabel}</Tag>
                    {i.expiryDate && <Text type="danger" style={{fontSize:12,marginLeft:4}}>到期: {i.expiryDate}</Text>}
                  </Card>
                </Col>
              ))}
              {filtered.filter((i:any) => i.status === 'expiring' || i.status === 'low').length === 0 && <Col span={24}><Text type="secondary">暂无到期预警</Text></Col>}
            </Row>
          </Card>
        </Card>
        )},
        { key: 'movements', label: '出入库记录', children: (
          <Card title="库存变动记录">
            <Table dataSource={movements} rowKey="id" pagination={{ pageSize: 10 }} columns={[
              { title: '日期', dataIndex: 'date' },
              { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={t==='in'?'green':t==='out'?'orange':'blue'}>{t==='in'?'入库':t==='out'?'出库':'盘点'}</Tag> },
              { title: '数量', dataIndex: 'qty', render: (v: number, r: any) => <Text type={r.type==='out'?'danger':undefined}>{r.type==='out'?-v:v}</Text> },
              { title: '操作人', dataIndex: 'operator' },
              { title: '备注', dataIndex: 'note' },
            ]} size="small" />
          </Card>
        )},
        { key: 'overview', label: '库存总览', children: (
          <Row gutter={16}>
            <Col span={12}><Card title="库存变动趋势" size="small">
              <svg viewBox="0 0 400 200" style={{width:'100%',height:220}}>
                <rect x={40} y={10} width={340} height={160} fill="#fafafa" rx={4} />
                {[60,100,140].map(y => <line key={y} x1={40} y1={y} x2={380} y2={y} stroke="#f0f0f0" />)}
                {[{d:'M50,150L90,120L130,140L170,100L210,110L250,80L290,90L330,60',c:'#1677ff',l:'入库'},{d:'M50,160L90,140L130,150L170,130L210,135L250,110L290,120L330,100',c:'#faad14',l:'出库'}].map(line => <path key={line.l} d={line.d} stroke={line.c} strokeWidth={2} fill="none" />)}
                {[{x:50,l:'05-01'},{x:170,l:'05-10'},{x:290,l:'05-20'}].map(t => <text key={t.l} x={t.x} y={185} textAnchor="middle" fontSize={10} fill="#999">{t.l}</text>)}
                <rect x={280} y={15} width={12} height={12} fill="#1677ff" rx={2} /><text x={296} y={25} fontSize={10} fill="#666">入库</text>
                <rect x={330} y={15} width={12} height={12} fill="#faad14" rx={2} /><text x={346} y={25} fontSize={10} fill="#666">出库</text>
              </svg>
            </Card></Col>
            <Col span={12}><Card title="库存结构分布" size="small">
              <svg viewBox="0 0 300 200" style={{width:'100%',height:220}}>
                {[{v:65,c:'#1677ff',l:'试剂'},{v:25,c:'#52c41a',l:'耗材'},{v:10,c:'#722ed1',l:'标准品'}].map((_item,_i,arr) => {
                  const total = arr.reduce((s,x) => s+x.v, 0);
                  let offset = 0;
                  const slices = arr.map(x => { const o = offset; offset += x.v/total*360; return {...x, start:o, end:offset}; });
                  const cx=150, cy=100, r=70;
                  const rad = (deg:number) => deg*Math.PI/180;
                  return slices.map((s,j) => {
                    const x1 = cx + r*Math.cos(rad(s.start-90));
                    const y1 = cy + r*Math.sin(rad(s.start-90));
                    const x2 = cx + r*Math.cos(rad(s.end-90));
                    const y2 = cy + r*Math.sin(rad(s.end-90));
                    const large = s.end - s.start > 180 ? 1 : 0;
                    return <g key={j}><path d={'M'+cx+','+cy+' L'+x1+','+y1+' A'+r+','+r+' 0 '+large+',1 '+x2+','+y2+' Z'} fill={s.c} stroke="#fff" strokeWidth={2} /></g>;
                  });
                })}
                <circle cx={150} cy={100} r={35} fill="#fff" />
                <text x={150} y={96} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#333">8</text>
                <text x={150} y={112} textAnchor="middle" fontSize={10} fill="#999">SKU</text>
                <rect x={10} y={185} width={10} height={10} fill="#1677ff" rx={2} /><text x={24} y={194} fontSize={10} fill="#666">试剂 65%</text>
                <rect x={110} y={185} width={10} height={10} fill="#52c41a" rx={2} /><text x={124} y={194} fontSize={10} fill="#666">耗材 25%</text>
                <rect x={210} y={185} width={10} height={10} fill="#722ed1" rx={2} /><text x={224} y={194} fontSize={10} fill="#666">标准品 10%</text>
              </svg>
            </Card></Col>
          </Row>
        )},
        { key: 'suppliers', label: '供应商管理', children: (
          <Card extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => { setSupplierEdit(null); supplierForm.resetFields(); setSupplierModal(true); }}>新增供应商</Button>}>
            <Table dataSource={suppliers} rowKey="id" pagination={false} size="small" columns={[
              {title:'供应商名称',dataIndex:'name'},{title:'联系人',dataIndex:'contact'},{title:'电话',dataIndex:'phone'},
              {title:'邮箱',dataIndex:'email'},{title:'评级',dataIndex:'rating',render:(r:string)=><Tag color={r==='A'?'green':'blue'}>{r}</Tag>},
              {title:'状态',dataIndex:'status',render:(s:string)=><Tag color={s==='active'?'green':'default'}>{s==='active'?'合作中':'暂停'}</Tag>},
              {title:'操作', render: (_: any, r: Supplier) => (
                <Space>
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSupplierEdit(r); supplierForm.setFieldsValue({...r}); setSupplierModal(true); }}>编辑</Button>
                  <Popconfirm title="确认删除?" onConfirm={() => handleDeleteSupplier(r.id)}><Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
                </Space>
              )},
            ]} />
          </Card>
        )},
        { key: 'purchase', label: '采购申请', children: (
          <Card extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setPrModal(true)}>新建采购申请</Button>}>
            <Table dataSource={prs} rowKey="id" columns={[
              { title: '申请单号', dataIndex: 'no', render: (n: string) => <Text code>{n}</Text> },
              { title: '申请人', dataIndex: 'applicant' },
              { title: '部门/课题组', dataIndex: 'dept' },
              { title: '日期', dataIndex: 'date' },
              { title: '紧急程度', dataIndex: 'urgency', render: (u: string) => <Tag color={urgencyColors[u]}>{u}</Tag> },
              { title: '总金额', dataIndex: 'total', render: (t: number) => `¥${t}` },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s==='pending_approval'?'orange':s==='approved'?'green':'blue'}>{s==='pending_approval'?'待审批':s==='approved'?'已审批':'已采购'}</Tag> },
              { title: '操作', render: (_: any, r: any) => <Button type="link" size="small" onClick={() => { setSelected(r); setPrDrawer(true); }}>查看</Button> },
            ]} pagination={false} size="middle" />
          </Card>
        )},
      ]} />

      <Drawer title={selected?.name} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={420}>
        {selected && <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="名称">{selected.name}</Descriptions.Item>
          <Descriptions.Item label="编码">{selected.code}</Descriptions.Item>
          <Descriptions.Item label="分类"><Tag color={categoryColors[selected.category]}>{selected.category}</Tag></Descriptions.Item>
          <Descriptions.Item label="规格">{selected.spec}</Descriptions.Item>
          <Descriptions.Item label="批号">{selected.batchNo}</Descriptions.Item>
          <Descriptions.Item label="供应商">{selected.supplier}</Descriptions.Item>
          <Descriptions.Item label="库位">{selected.location}</Descriptions.Item>
          <Descriptions.Item label="库存">{selected.stock}{selected.unit}</Descriptions.Item>
          <Descriptions.Item label="安全库存">{selected.safetyStock}{selected.unit}</Descriptions.Item>
          <Descriptions.Item label="有效期">{selected.expiryDate}</Descriptions.Item>
          <Descriptions.Item label="单价">¥{selected.price}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={statusColors[selected.status]}>{selected.statusLabel}</Tag></Descriptions.Item>
        </Descriptions>}
      </Drawer>

      <Modal title="采购申请详情" open={prDrawer} onCancel={() => { setPrDrawer(false); setSelected(null); }} footer={null} width={500}>
        {selected && <><Descriptions column={1} bordered size="small">
          <Descriptions.Item label="单号">{selected.no}</Descriptions.Item>
          <Descriptions.Item label="申请人">{selected.applicant}</Descriptions.Item>
          <Descriptions.Item label="部门">{selected.dept}</Descriptions.Item>
          <Descriptions.Item label="日期">{selected.date}</Descriptions.Item>
          <Descriptions.Item label="紧急程度"><Tag color={urgencyColors[selected.urgency]}>{selected.urgency}</Tag></Descriptions.Item>
          <Descriptions.Item label="总金额">¥{selected.total}</Descriptions.Item>
        </Descriptions>
        <Table dataSource={selected.items} rowKey="name" pagination={false} size="small" style={{ marginTop: 16 }} columns={[
          { title: '物料名称', dataIndex: 'name' }, { title: '规格', dataIndex: 'spec' },
          { title: '数量', dataIndex: 'qty' }, { title: '单价', dataIndex: 'price', render: (p: number) => `¥${p}` },
        ]} /></>}
      </Modal>

      {/* Stock In Modal */}
      <Modal title="试剂入库" open={inModal} onOk={() => inForm.submit()} onCancel={() => { setInModal(false); inForm.resetFields(); }}>
        <Form form={inForm} layout="vertical" onFinish={handleStockIn}>
          <Form.Item name="name" label="试剂名称" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="code" label="物料编码"><Input placeholder="留空自动生成" /></Form.Item>
          <Form.Item name="spec" label="规格型号"><Input /></Form.Item>
          <Form.Item name="batchNo" label="批次号"><Input /></Form.Item>
          <Form.Item name="category" label="分类" initialValue="试剂"><Select><Select.Option value="试剂">试剂</Select.Option><Select.Option value="耗材">耗材</Select.Option><Select.Option value="标准品">标准品</Select.Option></Select></Form.Item>
          <Form.Item name="supplier" label="供应商"><Input /></Form.Item>
          <Form.Item name="qty" label="数量" rules={[{required:true}]}><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="unit" label="单位" initialValue="瓶"><Input /></Form.Item>
          <Form.Item name="safetyStock" label="安全库存" initialValue={5}><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="expiry" label="有效期" rules={[{required:true}]}><Input type="date" /></Form.Item>
          <Form.Item name="location" label="库位" initialValue="A-01"><Input /></Form.Item>
          <Form.Item name="price" label="单价"><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="operator" label="入库人"><Input /></Form.Item>
          <Form.Item name="note" label="备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Stock Out Modal */}
      <Modal title="出库" open={outModal} onOk={() => outForm.submit()} onCancel={() => { setOutModal(false); outForm.resetFields(); }}>
        <Form form={outForm} layout="vertical" onFinish={handleStockOut}>
          <Form.Item label="物料"><Text strong>{selected?.name}</Text></Form.Item>
          <Form.Item label="当前库存"><Text>{selected?.stock}{selected?.unit}</Text></Form.Item>
          <Form.Item name="qty" label="出库数量" rules={[{required:true}]}><InputNumber min={1} max={selected?.stock} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="operator" label="出库人"><Input /></Form.Item>
          <Form.Item name="note" label="用途/备注"><Input.TextArea rows={2} /></Form.Item>
        </Form>
      </Modal>

      {/* Stock Check Modal */}
      <Modal title="盘点" open={checkModal} onOk={() => checkForm.submit()} onCancel={() => { setCheckModal(false); checkForm.resetFields(); }}>
        <Form form={checkForm} layout="vertical" onFinish={handleStockCheck}>
          <Form.Item label="物料"><Text strong>{selected?.name}</Text></Form.Item>
          <Form.Item label="系统库存"><Text>{selected?.stock}{selected?.unit}</Text></Form.Item>
          <Form.Item name="actual" label="实盘数量" rules={[{required:true}]}><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="operator" label="盘点人"><Input /></Form.Item>
        </Form>
      </Modal>

      {/* Purchase Request Modal */}
      <Modal title="采购申请" open={prModal} onOk={() => prForm.submit()} onCancel={() => { setPrModal(false); prForm.resetFields(); }}>
        <Form form={prForm} layout="vertical" onFinish={handleCreatePr}>
          <Form.Item name="name" label="物料名称" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="spec" label="规格"><Input /></Form.Item>
          <Form.Item name="qty" label="数量" rules={[{required:true}]}><InputNumber min={1} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="price" label="预估单价"><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
          <Form.Item name="urgency" label="紧急程度" initialValue="普通"><Select><Select.Option value="紧急">紧急</Select.Option><Select.Option value="普通">普通</Select.Option></Select></Form.Item>
          <Form.Item name="dept" label="申请部门"><Input /></Form.Item>
          <Form.Item name="total" label="预估总金额"><InputNumber min={0} style={{width:'100%'}} /></Form.Item>
        </Form>
      </Modal>

      {/* Supplier Modal */}
      <Modal title={supplierEdit ? '编辑供应商' : '新增供应商'} open={supplierModal} onOk={() => supplierForm.submit()} onCancel={() => { setSupplierModal(false); setSupplierEdit(null); supplierForm.resetFields(); }}>
        <Form form={supplierForm} layout="vertical" onFinish={handleSaveSupplier}>
          <Form.Item name="name" label="供应商名称" rules={[{required:true}]}><Input /></Form.Item>
          <Form.Item name="contact" label="联系人"><Input /></Form.Item>
          <Form.Item name="phone" label="电话"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="rating" label="评级" initialValue="B"><Select><Select.Option value="A">A</Select.Option><Select.Option value="B">B</Select.Option><Select.Option value="C">C</Select.Option></Select></Form.Item>
          <Form.Item name="status" label="状态" initialValue="active"><Select><Select.Option value="active">合作中</Select.Option><Select.Option value="inactive">暂停</Select.Option></Select></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
