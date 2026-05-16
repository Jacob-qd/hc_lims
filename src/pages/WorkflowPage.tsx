import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Badge, Modal, Form, Input, Select, message, Timeline, Descriptions, List, Avatar, Dropdown, Tooltip, Popconfirm } from 'antd';
import { PlusOutlined, ApartmentOutlined, CheckCircleOutlined, ClockCircleOutlined, BranchesOutlined, PlayCircleOutlined, PauseCircleOutlined, StopOutlined, UserOutlined, SwapOutlined, DeleteOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockDefinitions = [
  { id: 'wf1', name: '样品检测流程', version: 'v3.2', nodes: 6, type: '检测', status: 'active', used: 128, desc: '样品接收→分配→检测→审核→报告' },
  { id: 'wf2', name: '报告审核签发流程', version: 'v2.1', nodes: 4, type: '报告', status: 'active', used: 95, desc: '编制→技术审核→批准→签发' },
  { id: 'wf3', name: '采购审批流程', version: 'v1.5', nodes: 5, type: '采购', status: 'active', used: 32, desc: '申请→部门审批→质量确认→财务审批→采购' },
  { id: 'wf4', name: '偏差/OOS处理流程', version: 'v1.0', nodes: 6, type: '质量', status: 'draft', used: 0, desc: '发现→评估→调查→CAPA→验证→关闭' },
  { id: 'wf5', name: '仪器校准流程', version: 'v2.0', nodes: 4, type: '设备', status: 'active', used: 18, desc: '申请→外部校准→验证→确认' },
];

const mockInstances = [
  { id: 'i1', workflow: '样品检测流程', businessId: 'SMP20240521001', currentNode: '检测中', assignee: '张伟', startTime: '2024-05-21 09:00', deadline: '2024-05-25 18:00', status: 'running', priority: 'normal' },
  { id: 'i2', workflow: '报告审核签发流程', businessId: 'RPT20240521001', currentNode: '技术审核', assignee: '王强', startTime: '2024-05-21 10:00', deadline: '2024-05-23 18:00', status: 'running', priority: 'high' },
  { id: 'i3', workflow: '采购审批流程', businessId: 'PR-2025-001', currentNode: '部门审批', assignee: '李明', startTime: '2024-05-20', deadline: '2024-05-27', status: 'running', priority: 'normal' },
  { id: 'i4', workflow: '报告审核签发流程', businessId: 'RPT20240520005', currentNode: '已签发', assignee: '-', startTime: '2024-05-20 14:00', completedAt: '2024-05-21 16:00', status: 'completed', priority: 'normal' },
  { id: 'i5', workflow: '偏差/OOS处理流程', businessId: 'DEV-2024-012', currentNode: '调查中', assignee: '赵丽', startTime: '2024-05-19', deadline: '2024-06-02', status: 'running', priority: 'urgent' },
];

const mockTasks = [
  { id: 't1', type: '待办', instanceId: 'i2', title: '技术审核: RPT20240521001', workflow: '报告审核签发流程', from: '李思(编制人)', deadline: '2024-05-23 18:00', priority: 'high' },
  { id: 't2', type: '待办', instanceId: 'i3', title: '部门审批: PR-2025-001', workflow: '采购审批流程', from: '张伟(申请人)', deadline: '2024-05-27', priority: 'normal' },
  { id: 't3', type: '已办', instanceId: 'i4', title: '批准: RPT20240520005', workflow: '报告审核签发流程', action: '通过', time: '2024-05-21 16:00' },
  { id: 't4', type: '抄送', instanceId: 'i5', title: '偏差处理: DEV-2024-012 进入调查阶段', workflow: '偏差/OOS处理流程', time: '2024-05-19 14:00' },
];

const nodeTypes = [
  { type:'start', label:'开始', color:'#52c41a', shape:'circle' },
  { type:'approval', label:'审批', color:'#1677ff', shape:'rect' },
  { type:'countersign', label:'会签', color:'#722ed1', shape:'rect' },
  { type:'condition', label:'条件', color:'#faad14', shape:'diamond' },
  { type:'notification', label:'通知', color:'#13c2c2', shape:'rect' },
  { type:'end', label:'结束', color:'#ff4d4f', shape:'circle' },
];

interface DesignerNode { id: string; label: string; type: string; x: number; y: number; assignee?: string; deadline?: number; }
interface DesignerEdge { from: string; to: string; label?: string; }

const WorkflowDesigner: React.FC<{ onSave?: () => void; onClose?: () => void }> = ({ onSave, onClose }) => {
  const [nodes, setNodes] = useState<DesignerNode[]>([
    { id:'start', label:'开始', type:'start', x:250, y:30 },
    { id:'n1', label:'样品接收', type:'approval', x:250, y:110, assignee:'张伟' },
    { id:'n2', label:'任务分配', type:'approval', x:250, y:190, assignee:'主管' },
    { id:'cond1', label:'需要复检?', type:'condition', x:250, y:270 },
    { id:'n3a', label:'复检', type:'approval', x:400, y:270, assignee:'检测员' },
    { id:'n3b', label:'数据审核', type:'approval', x:250, y:350, assignee:'王强' },
    { id:'end', label:'结束', type:'end', x:250, y:430 },
  ]);
  const [edges, setEdges] = useState<DesignerEdge[]>([
    {from:'start',to:'n1'},{from:'n1',to:'n2'},{from:'n2',to:'cond1'},
    {from:'cond1',to:'n3a',label:'是'},{from:'n3a',to:'n3b'},
    {from:'cond1',to:'n3b',label:'否'},{from:'n3b',to:'end'},
  ]);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [dragging, setDragging] = useState<string|null>(null);
  const [addNodeType, setAddNodeType] = useState('approval');
  const [connecting, setConnecting] = useState<string|null>(null);

  const selected = nodes.find(n => n.id === selectedId);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setSelectedId(null);
  };

  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setSelectedId(id);
    setDragging(id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 60;
    const y = e.clientY - rect.top - 24;
    setNodes(prev => prev.map(n => n.id === dragging ? {...n, x:Math.max(10,x), y:Math.max(10,y)} : n));
  };

  const handleMouseUp = () => { setDragging(null); };

  const handleAddNode = () => {
    const id = 'n' + Date.now();
    setNodes(prev => [...prev, {id, label:'新节点', type:addNodeType, x:400, y:200}]);
    message.success('节点已添加，可拖拽调整位置');
  };

  const handleDeleteNode = (id: string) => {
    if (id === 'start' || id === 'end') { message.warning('开始/结束节点不可删除'); return; }
    setNodes(prev => prev.filter(n => n.id !== id));
    setEdges(prev => prev.filter(e => e.from !== id && e.to !== id));
    setSelectedId(null);
  };

  const handleConnect = (fromId: string) => {
    if (connecting === fromId) { setConnecting(null); return; }
    if (connecting) {
      setEdges(prev => [...prev, {from:connecting, to:fromId}]);
      setConnecting(null);
      message.success('连线已创建');
    } else {
      setConnecting(fromId);
      message.info('请点击目标节点完成连线');
    }
  };

  const nodeColors: Record<string,string> = {start:'#52c41a',approval:'#1677ff',countersign:'#722ed1',condition:'#faad14',notification:'#13c2c2',end:'#ff4d4f'};

  return (
    <div>
      {/* Toolbar */}
      <Card size="small" style={{marginBottom:8}}>
        <Space wrap>
          <Text strong>添加节点:</Text>
          {nodeTypes.filter(t=>t.type!=='start'&&t.type!=='end').map(t => (
            <Button key={t.type} size="small" type={addNodeType===t.type?'primary':'default'}
              onClick={()=>setAddNodeType(t.type)} icon={<Tag color={t.color} style={{margin:0}}>{t.label}</Tag>} />
          ))}
          <Button size="small" type="primary" icon={<PlusOutlined/>} onClick={handleAddNode}>添加</Button>
          <Text type="secondary" style={{marginLeft:8}}>
            {connecting ? `🔗 连线中，点击目标节点完成` : '💡 拖拽节点 · 点击节点连线 · 选中编辑属性'}
          </Text>
        </Space>
      </Card>

      <Row gutter={16}>
        {/* Canvas */}
        <Col span={selected ? 16 : 24}>
          <div
            style={{background:'#fff',border:'1px solid #e8e8e8',borderRadius:8,height:520,position:'relative',overflow:'hidden',cursor:dragging?'grabbing':'default'}}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Grid */}
            <svg style={{position:'absolute',top:0,left:0,width:'100%',height:'100%',pointerEvents:'none'}}>
              <defs><pattern id="g" width={20} height={20} patternUnits="userSpaceOnUse"><path d="M20 0L0 0 0 20" fill="none" stroke="#f5f5f5" strokeWidth={0.5}/></pattern></defs>
              <rect width="100%" height="100%" fill="url(#g)"/>
              {/* Edges */}
              {edges.map((e,i) => {
                const from = nodes.find(n=>n.id===e.from);
                const to = nodes.find(n=>n.id===e.to);
                if(!from||!to) return null;
                const midX = (from.x+60+to.x+60)/2;
                const midY = (from.y+24+to.y+24)/2;
                return <g key={i}>
                  <path d={`M${from.x+60} ${from.y+48} Q${midX} ${from.y+48} ${midX} ${midY} Q${midX} ${to.y} ${to.x+60} ${to.y}`}
                    fill="none" stroke={connecting===e.from?'#1677ff':'#bbb'} strokeWidth={connecting===e.from?3:1.5}
                    markerEnd="url(#arrow)"/>
                  {e.label && <text x={midX+10} y={midY-5} fontSize={10} fill="#999">{e.label}</text>}
                </g>;
              })}
              <defs><marker id="arrow" viewBox="0 0 10 10" refX={9} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse"><path d="M0 0L10 5 0 10z" fill="#bbb"/></marker></defs>
            </svg>
            {/* Nodes */}
            {nodes.map(n => {
              const isSelected = selectedId === n.id;
              const isConnecting = connecting === n.id;
              const color = nodeColors[n.type]||'#1677ff';
              return (
                <div key={n.id}
                  onMouseDown={e => handleNodeMouseDown(n.id, e)}
                  onClick={e => { e.stopPropagation(); handleConnect(n.id); }}
                  style={{
                    position:'absolute',left:n.x,top:n.y,width:120,cursor:'pointer',
                    background:isSelected?color:isConnecting?'#e6f4ff':'#fff',
                    border:`2px solid ${color}`,borderRadius:n.type==='start'||n.type==='end'?24:8,
                    padding:'10px 8px',textAlign:'center',zIndex:isSelected?2:1,
                    boxShadow:isSelected?'0 0 0 2px '+color+'40':'0 1px 4px rgba(0,0,0,0.08)',
                  }}
                >
                  <Text strong style={{fontSize:12,color:isSelected?'#fff':color}}>{n.label}</Text>
                  {n.assignee && <div><Text style={{fontSize:10,color:isSelected?'rgba(255,255,255,0.8)':'#999'}}>{n.assignee}</Text></div>}
                  {isSelected && <div style={{position:'absolute',top:-10,right:-10}}>
                    <Button size="small" danger shape="circle" icon={<DeleteOutlined/>} onClick={e=>{e.stopPropagation();handleDeleteNode(n.id);}}/>
                  </div>}
                </div>
              );
            })}
          </div>
        </Col>

        {/* Properties Panel */}
        {selected && (
          <Col span={8}>
            <Card size="small" title={`节点属性: ${selected.label}`}
              extra={<Button size="small" icon={<CloseOutlined/>} onClick={()=>setSelectedId(null)}/>}>
              <Form layout="vertical" size="small" onFinish={(v)=>{
                setNodes(prev=>prev.map(n=>n.id===selected.id?{...n,...v}:n));
                message.success('属性已更新');
              }}>
                <Form.Item label="节点名称" name="label" initialValue={selected.label}>
                  <Input onChange={e=>setNodes(prev=>prev.map(n=>n.id===selected.id?{...n,label:e.target.value}:n))}/>
                </Form.Item>
                <Form.Item label="节点类型" name="type" initialValue={selected.type}>
                  <Select onChange={v=>setNodes(prev=>prev.map(n=>n.id===selected.id?{...n,type:v}:n))}>
                    {nodeTypes.map(t=><Select.Option key={t.type} value={t.type}><Tag color={t.color}>{t.label}</Tag></Select.Option>)}
                  </Select>
                </Form.Item>
                {selected.type === 'approval' && <>
                  <Form.Item label="审批人" name="assignee" initialValue={selected.assignee}>
                    <Select onChange={v=>setNodes(prev=>prev.map(n=>n.id===selected.id?{...n,assignee:v}:n))}>
                      {['张伟','王强','李明','李思','主管','自动'].map(u=><Select.Option key={u}>{u}</Select.Option>)}
                    </Select>
                  </Form.Item>
                  <Form.Item label="超时(h)" name="deadline" initialValue={selected.deadline||24}>
                    <Input type="number" onChange={e=>setNodes(prev=>prev.map(n=>n.id===selected.id?{...n,deadline:parseInt(e.target.value)}:n))}/>
                  </Form.Item>
                </>}
                <Button type="primary" htmlType="submit" block size="small">保存属性</Button>
              </Form>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export const WorkflowPage: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [designerVisible, setDesignerVisible] = useState(false);
  const [wfForm] = Form.useForm();

  const taskActions = (task: any) => {
    if (task.type === '待办') return (
      <Space size="small">
        <Popconfirm title="确认通过？" onConfirm={()=>message.success('已通过')}><Button size="small" type="primary">通过</Button></Popconfirm>
        <Popconfirm title={<Input.TextArea placeholder="驳回理由" rows={2} style={{width:200}}/>} onConfirm={()=>message.success('已驳回')}><Button size="small" danger>驳回</Button></Popconfirm>
        <Button size="small" onClick={()=>message.success('已转办')}>转办</Button>
      </Space>
    );
    if (task.type === '抄送') return <Button size="small" type="link">已读</Button>;
    return <Tag color="green">{task.action}</Tag>;
  };

  return (
    <div>
      <Row justify="space-between" style={{marginBottom:16}}>
        <Col><Title level={4}><ApartmentOutlined/> 工作流引擎</Title></Col>
        <Col><Space>
          <Button type="primary" icon={<PlusOutlined/>} onClick={()=>setDesignerVisible(true)}>可视化设计</Button>
          <Button icon={<PlusOutlined/>} onClick={()=>setCreateVisible(true)}>新建流程</Button>
        </Space></Col>
      </Row>

      <Row gutter={[16,16]} style={{marginBottom:16}}>
        <Col span={6}><Card size="small"><Statistic title="流程模板" value={mockDefinitions.length} prefix={<BranchesOutlined/>}/></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="运行中" value={mockInstances.filter(i=>i.status==='running').length} valueStyle={{color:'#1677ff'}} prefix={<PlayCircleOutlined/>}/></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已完成" value={256} valueStyle={{color:'#52c41a'}} prefix={<CheckCircleOutlined/>}/></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="待处理" value={mockTasks.filter(t=>t.type==='待办').length} valueStyle={{color:'#faad14'}} prefix={<ClockCircleOutlined/>}/></Card></Col>
      </Row>

      <Tabs defaultActiveKey="tasks" items={[
        { key:'tasks', label:<span><ClockCircleOutlined/> 待办/已办</span>, children:<Card>
          <Tabs size="small" items={[
            { key:'todo', label:`待办(${mockTasks.filter(t=>t.type==='待办').length})`, children:<List dataSource={mockTasks.filter(t=>t.type==='待办')} renderItem={t=>(
              <List.Item extra={taskActions(t)}>
                <List.Item.Meta avatar={<Avatar icon={<UserOutlined/>} style={{background:t.priority==='high'?'#ff4d4f':t.priority==='urgent'?'#faad14':'#1677ff'}}/>}
                  title={<Space>{t.title}{t.priority==='urgent'&&<Tag color="red">紧急</Tag>}{t.priority==='high'&&<Tag color="orange">高优</Tag>}</Space>}
                  description={<Text type="secondary">来自: {t.from} | 流程: {t.workflow} | 截止: {t.deadline}</Text>}/>
              </List.Item>
            )}/>},
            { key:'done', label:`已办(${mockTasks.filter(t=>t.type==='已办').length})`, children:<List dataSource={mockTasks.filter(t=>t.type==='已办')} renderItem={t=>(
              <List.Item><List.Item.Meta title={t.title} description={`${t.action} · ${t.time}`}/></List.Item>
            )}/>},
            { key:'cc', label:`抄送(${mockTasks.filter(t=>t.type==='抄送').length})`, children:<List dataSource={mockTasks.filter(t=>t.type==='抄送')} renderItem={t=>(
              <List.Item extra={taskActions(t)}><List.Item.Meta title={t.title} description={t.time}/></List.Item>
            )}/>},
          ]}/>
        </Card>},
        { key:'definitions', label:'流程模板', children:<Card extra={
          <Space><Button icon={<PlusOutlined/>} onClick={()=>setDesignerVisible(true)}>可视化设计</Button><Button type="primary" icon={<PlusOutlined/>} onClick={()=>setCreateVisible(true)}>新建流程</Button></Space>
        }>
          <Table dataSource={mockDefinitions} rowKey="id" columns={[
            {title:'流程名称',dataIndex:'name',render:(n:string)=><a onClick={()=>setDesignerVisible(true)}>{n}</a>},
            {title:'版本',dataIndex:'version',render:(v:string)=><Tag>{v}</Tag>},
            {title:'节点数',dataIndex:'nodes',render:(n:number)=><Tag color="blue">{n}个节点</Tag>},
            {title:'类型',dataIndex:'type',render:(t:string)=><Tag>{t}</Tag>},
            {title:'使用次数',dataIndex:'used'},
            {title:'描述',dataIndex:'desc',ellipsis:true},
            {title:'状态',dataIndex:'status',render:(s:string)=><Badge status={s==='active'?'success':'default'} text={s==='active'?'已发布':'草稿'}/>},
            {title:'操作',render:()=><Space size="small">
              <Button type="link" size="small" onClick={()=>setDesignerVisible(true)}>设计</Button>
              <Dropdown menu={{items:[{key:'publish',label:'发布'},{key:'clone',label:'克隆'},{key:'history',label:'版本历史'},{key:'delete',label:'删除',danger:true}]}}><Button type="link" size="small">更多</Button></Dropdown>
            </Space>},
          ]} pagination={false} size="middle"/>
        </Card>},
        { key:'instances', label:'流程实例', children:<Card>
          <Table dataSource={mockInstances} rowKey="id" columns={[
            {title:'流程',dataIndex:'workflow'},{title:'业务ID',dataIndex:'businessId',render:(id:string)=><code>{id}</code>},
            {title:'当前节点',dataIndex:'currentNode',render:(n:string)=><Tag color={n==='已签发'?'green':'blue'}>{n}</Tag>},
            {title:'处理人',dataIndex:'assignee'},{title:'开始',dataIndex:'startTime',width:130},
            {title:'截止',dataIndex:'deadline',render:(d:string)=>d||'-',width:110},
            {title:'状态',dataIndex:'status',render:(s:string)=><Badge status={s==='running'?'processing':'success'} text={s==='running'?'运行中':'已完成'}/>},
            {title:'操作',render:(_:any,r:any)=>r.status==='running'?<Space size="small"><Button type="link" size="small">查看</Button><Button type="link" size="small" danger onClick={()=>message.warning('已终止')}>终止</Button></Space>:<Button type="link" size="small">查看详情</Button>},
          ]} pagination={false} size="middle"/>
        </Card>},
        { key:'monitor', label:'流程监控', children:<Card>
          <Descriptions bordered size="small" column={3} style={{marginBottom:16}}>
            <Descriptions.Item label="总实例数">380</Descriptions.Item>
            <Descriptions.Item label="平均完成时间">18.5小时</Descriptions.Item>
            <Descriptions.Item label="超时率">3.2%</Descriptions.Item>
            <Descriptions.Item label="驳回率">8.1%</Descriptions.Item>
            <Descriptions.Item label="转办率">2.4%</Descriptions.Item>
            <Descriptions.Item label="自动通过率">1.2%</Descriptions.Item>
          </Descriptions>
          <Timeline items={[
            {color:'green',children:'报告审核签发流程 — 平均耗时 6.5h (目标<8h) ✅'},
            {color:'green',children:'样品检测流程 — 平均耗时 22.3h (目标<48h) ✅'},
            {color:'orange',children:'偏差处理流程 — 平均耗时 96h (目标<72h) ⚠️ 需优化'},
            {color:'red',children:'采购审批流程 — 平均耗时 58h (目标<24h) 🔴 严重超时'},
          ]}/>
        </Card>},
      ]}/>

      <Modal title="新建流程模板" open={createVisible} onOk={()=>wfForm.submit()} onCancel={()=>{setCreateVisible(false);wfForm.resetFields();}}>
        <Form form={wfForm} layout="vertical" onFinish={()=>{message.success('流程模板创建成功');setCreateVisible(false);}}>
          <Form.Item name="name" label="流程名称" required><Input placeholder="如: 样品检测流程"/></Form.Item>
          <Form.Item name="type" label="流程类型"><Select>{['检测','报告','采购','质量','设备'].map(t=><Select.Option key={t}>{t}流程</Select.Option>)}</Select></Form.Item>
          <Form.Item name="desc" label="描述"><Input.TextArea/></Form.Item>
        </Form>
      </Modal>

      <Modal title="可视化流程设计器" open={designerVisible} onCancel={()=>setDesignerVisible(false)} width={900}
        footer={<Space><Button onClick={()=>setDesignerVisible(false)}>取消</Button><Button type="primary" icon={<SaveOutlined/>} onClick={()=>{message.success('流程设计已保存');setDesignerVisible(false);}}>保存设计</Button></Space>}>
        <WorkflowDesigner onSave={()=>{message.success('已保存');setDesignerVisible(false);}} onClose={()=>setDesignerVisible(false)}/>
      </Modal>
    </div>
  );
};
