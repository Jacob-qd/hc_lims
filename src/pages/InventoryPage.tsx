import React, { useEffect, useState } from 'react';
import {Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Drawer, Descriptions, Modal, Form, Tabs, Progress} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, ShoppingCartOutlined, InboxOutlined, BarChartOutlined, StockOutlined, BarcodeOutlined, PrinterOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const categoryColors: Record<string, string> = { 试剂: '#1677ff', 耗材: '#52c41a', 标准品: '#722ed1' };
const statusColors: Record<string, string> = { normal: '#52c41a', low: '#faad14', expiring: '#ff4d4f', out: '#d9d9d9' };
const urgencyColors: Record<string, string> = { 紧急: '#ff4d4f', 普通: '#1677ff' };

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);
  const [prDrawer, setPrDrawer] = useState(false);
  const [inModal, setInModal] = useState(false);
  const [prModal, setPrModal] = useState(false);
  const [outModal, setOutModal] = useState(false);
  const [checkModal, setCheckModal] = useState(false);
  const [form] = Form.useForm();
  const [stockForm] = Form.useForm();
  const [outForm] = Form.useForm();
  const [checkForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    const [ir, pr] = await Promise.all([fetch('/api/v1/inventory').then(r => r.json()), fetch('/api/v1/inventory/purchase-requests').then(r => r.json())]);
    setItems(ir.data.list); setPrs(pr.data.list); setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const filtered = items.filter((i: any) => i.name.includes(search) || i.code.includes(search) || i.supplier.includes(search));
  const stats = { total: items.length, low: items.filter((i: any) => i.status === 'low' || i.status === 'out').length, expiring: items.filter((i: any) => i.status === 'expiring').length, pendingPr: prs.filter((p: any) => p.status === 'pending_approval').length };

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
            <Button size="small" icon={<InboxOutlined />} onClick={() => { stockForm.resetFields(); setInModal(true); }}>入库</Button>
            <Button size="small" icon={<StockOutlined />} onClick={() => { outForm.resetFields(); setOutModal(true); }}>出库</Button>
            <Button size="small" icon={<BarcodeOutlined />} onClick={() => { checkForm.resetFields(); setCheckModal(true); }}>盘点</Button>
          </Space></div>
          <Table dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
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
                {[{v:65,c:'#1677ff',l:'试剂'},{v:25,c:'#52c41a',l:'耗材'},{v:10,c:'#722ed1',l:'标准品'}].map((item,i,arr) => {
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
        { key: 'purchase', label: '采购申请', children: (
          <Card><Table dataSource={prs} rowKey="id" columns={[
            { title: '申请单号', dataIndex: 'no', render: (n: string) => <Text code>{n}</Text> },
            { title: '申请人', dataIndex: 'applicant' },
            { title: '部门/课题组', dataIndex: 'dept' },
            { title: '日期', dataIndex: 'date' },
            { title: '紧急程度', dataIndex: 'urgency', render: (u: string) => <Tag color={urgencyColors[u]}>{u}</Tag> },
            { title: '总金额', dataIndex: 'total', render: (t: number) => `¥${t}` },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s==='pending_approval'?'orange':s==='approved'?'green':'blue'}>{s==='pending_approval'?'待审批':s==='approved'?'已审批':'已采购'}</Tag> },
            { title: '操作', render: (_: any, r: any) => <Button type="link" size="small" onClick={() => { setSelected(r); setPrDrawer(true); }}>查看</Button> },
          ]} pagination={false} size="middle" /></Card>
        )},
        { key: 'suppliers', label: '供应商管理', children: (
          <Card extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => message.success('供应商添加成功')}>添加供应商</Button>}>
            <Table dataSource={[
              { id: 's1', name: '国药集团化学试剂有限公司', contact: '赵经理', phone: '021-12345678', type: '试剂', rating: 'A', products: 45, lastOrder: '2024-05-15' },
              { id: 's2', name: '赛默飞世尔科技', contact: '刘总监', phone: '010-87654321', type: '仪器配件', rating: 'A', products: 23, lastOrder: '2024-05-10' },
              { id: 's3', name: '安捷伦科技', contact: '陈经理', phone: '021-23456789', type: '耗材', rating: 'B', products: 18, lastOrder: '2024-04-28' },
              { id: 's4', name: '西格玛奥德里奇', contact: '周销售', phone: '010-34567890', type: '标准品', rating: 'A', products: 32, lastOrder: '2024-05-12' },
            ]} rowKey="id" pagination={false} size="small" columns={[
              { title: '供应商名称', dataIndex: 'name', ellipsis: true },
              { title: '联系人', dataIndex: 'contact' },
              { title: '电话', dataIndex: 'phone' },
              { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
              { title: '评级', dataIndex: 'rating', render: (r: string) => <Tag color={r==='A'?'green':r==='B'?'orange':'default'}>{r}</Tag> },
              { title: '供应产品', dataIndex: 'products' },
              { title: '最近采购', dataIndex: 'lastOrder' },
              { title: '操作', render: () => <Space size="small"><Button type="link" size="small">详情</Button><Button type="link" size="small">评估</Button></Space> },
            ]} />
          </Card>
        )},
      ]} />

      <Drawer title={selected?.name} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={420} extra={<Space><Button icon={<EditOutlined />} onClick={() => { setSelected(selected); setInModal(true); }}>编辑</Button><Button icon={<PrinterOutlined />} onClick={() => { const w=window.open('','_blank');if(w&&selected){w.document.write(`<pre>物料: ${selected.name}\n编号: ${selected.code}\n库存: ${selected.stock}${selected.unit}\n位置: ${selected.location}</pre>`);w.print();} }}>打印标签</Button></Space>}>
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

      <Modal title="试剂出库" open={outModal} onCancel={() => setOutModal(false)} footer={null}>
        <Form form={outForm} layout="vertical" onFinish={(v) => { message.success(`出库成功: ${v.name} x${v.quantity}`); setOutModal(false); }}>
          <Form.Item name="itemId" label="选择物料" required><Select showSearch>{items.map((i:any) => <Select.Option key={i.id} value={i.id}>{i.code} - {i.name} ({i.stock}{i.unit})</Select.Option>)}</Select></Form.Item>
          <Form.Item name="name" label="物料名称"><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="quantity" label="出库数量" required><Input type="number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="purpose" label="用途"><Select>{['检测使用','借用','报废','调拨'].map(p=><Select.Option key={p}>{p}</Select.Option>)}</Select></Form.Item></Col>
          </Row>
          <Form.Item name="recipient" label="领用人"><Input /></Form.Item>
          <Button type="primary" block htmlType="submit">确认出库</Button>
        </Form>
      </Modal>

      <Modal title="库存盘点" open={checkModal} onCancel={() => setCheckModal(false)} footer={null}>
        <Form form={checkForm} layout="vertical" onFinish={(v) => { message.success('盘点完成'); setCheckModal(false); }}>
          <Form.Item name="checkType" label="盘点类型"><Select>{['全盘','抽盘','定期盘点'].map(t=><Select.Option key={t}>{t}</Select.Option>)}</Select></Form.Item>
          <Form.Item name="category" label="盘点分类"><Select allowClear>{['试剂','耗材','标准品','全部'].map(c=><Select.Option key={c}>{c}</Select.Option>)}</Select></Form.Item>
          <Form.Item name="checker" label="盘点人" required><Input /></Form.Item>
          <Form.Item name="date" label="盘点日期"><Input placeholder="2024-05-21" /></Form.Item>
          <Form.Item name="notes" label="备注"><Input.TextArea /></Form.Item>
          <Button type="primary" block htmlType="submit">开始盘点</Button>
        </Form>
      </Modal>

      <Modal title="试剂入库" open={inModal} onCancel={() => setInModal(false)} footer={null}>
        <Form layout="vertical" onFinish={(v) => { message.success('入库成功: '+v.name); setInModal(false); fetch(); }}>
          <Form.Item label="试剂名称" required><Input /></Form.Item>
          <Form.Item label="规格型号"><Input /></Form.Item>
          <Form.Item label="批次号"><Input /></Form.Item>
          <Form.Item label="供应商"><Input /></Form.Item>
          <Form.Item label="数量"><Input type="number" /></Form.Item>
          <Form.Item label="有效期"><Input placeholder="YYYY-MM-DD" /></Form.Item>
          <Form.Item label="库位"><Input /></Form.Item>
          <Button type="primary" block htmlType="submit">确认入库</Button>
        </Form>
      </Modal>

      <Modal title="采购申请" open={prModal} onCancel={() => setPrModal(false)} footer={null}>
        <Form layout="vertical" onFinish={(v) => { message.success('采购申请已提交: '+v.name); setPrModal(false); }}>
          <Form.Item name="name" label="物料名称" required><Input /></Form.Item>
          <Form.Item name="spec" label="规格"><Input /></Form.Item>
          <Form.Item name="quantity" label="数量"><Input type="number" /></Form.Item>
          <Form.Item name="urgency" label="紧急程度"><Select><Select.Option value="紧急">紧急</Select.Option><Select.Option value="普通">普通</Select.Option></Select></Form.Item>
          <Button type="primary" block htmlType="submit">提交申请</Button>
        </Form>
      </Modal>
    </div>
  );
};
