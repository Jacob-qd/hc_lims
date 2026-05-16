import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Input, Select, Row, Col, Space, Typography,
  Drawer, Tabs, Descriptions, Timeline, Statistic, Modal, Form, message,
  Tooltip, Progress, Badge,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EditOutlined, EyeOutlined,
  PlayCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

interface TaskItem {
  id: string; taskNo: string; sampleId: string; sampleNo: string;
  sampleName: string; testItem: string; method: string;
  analystName: string; instrumentName: string;
  plannedStart: string; plannedEnd: string;
  priority: string; priorityLabel: string;
  status: string; statusLabel: string; progress: number;
  customerName?: string;
}

const statusColor: Record<string, string> = {
  unassigned: '#d9d9d9', pending: '#1677ff', testing: '#52c41a',
  pending_review: '#faad14', completed: '#52c41a', overdue: '#ff4d4f',
};
const priorityColor: Record<string, string> = {
  high: '#ff4d4f', medium: '#faad14', low: '#52c41a',
};

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [assignVisible, setAssignVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('board');
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchText) params.set('keyword', searchText);
      const [tasksRes, statsRes] = await Promise.all([
        fetch(`/api/v1/tasks?${params}`).then(r => r.json()),
        fetch('/api/v1/tasks/stats').then(r => r.json()),
      ]);
      setTasks(tasksRes.data.list);
      setStats(statsRes.data);
    } catch { message.error('加载失败'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [statusFilter, searchText]);

  const statusGroups = {
    unassigned: tasks.filter(t => t.status === 'unassigned'),
    pending: tasks.filter(t => t.status === 'pending'),
    testing: tasks.filter(t => t.status === 'testing'),
    pending_review: tasks.filter(t => t.status === 'pending_review'),
    completed: tasks.filter(t => t.status === 'completed' || t.status === 'overdue'),
  };

  const handleAssign = async (values: any) => {
    if (!selectedTask) return;
    try {
      const res = await fetch(`/api/v1/tasks/${selectedTask.id}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const json = await res.json();
      if (json.code === 200) { message.success('分配成功'); setAssignVisible(false); form.resetFields(); fetchData(); }
    } catch { message.error('分配失败'); }
  };

  const handleStart = async (task: TaskItem) => {
    await fetch(`/api/v1/tasks/${task.id}/start`, { method: 'POST' });
    message.success('已开始检测'); fetchData();
  };

  const handleComplete = async (task: TaskItem) => {
    await fetch(`/api/v1/tasks/${task.id}/complete`, { method: 'POST' });
    message.success('已提交复核'); fetchData();
  };

  const columns: ColumnsType<TaskItem> = [
    { title: '任务编号', dataIndex: 'taskNo', key: 'taskNo', width: 120, render: (t: string) => <Text code>{t}</Text> },
    { title: '样品', dataIndex: 'sampleName', key: 'sampleName' },
    { title: '检测项目', dataIndex: 'testItem', key: 'testItem' },
    { title: '分析员', dataIndex: 'analystName', key: 'analystName', width: 80 },
    { title: '优先级', dataIndex: 'priority', key: 'priority', width: 70, render: (_: string, r: TaskItem) => <Tag color={priorityColor[r.priority]}>{r.priorityLabel}</Tag> },
    { title: '计划完成', dataIndex: 'plannedEnd', key: 'plannedEnd', width: 100 },
    { title: '进度', dataIndex: 'progress', key: 'progress', width: 100, render: (p: number) => <Progress percent={p} size="small" /> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 80, render: (_: string, r: TaskItem) => <Tag color={statusColor[r.status]}>{r.statusLabel}</Tag> },
    { title: '操作', key: 'action', width: 160, render: (_: any, r: TaskItem) => (
      <Space>
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedTask(r); setDrawerVisible(true); }} />
        {r.status === 'unassigned' && <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setSelectedTask(r); setAssignVisible(true); }}>分配</Button>}
        {r.status === 'pending' && <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleStart(r)}>开始</Button>}
        {r.status === 'testing' && <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleComplete(r)}>完成</Button>}
      </Space>
    )},
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>检测管理</Title></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="待检测" value={stats.pendingTest || 0} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="检测中" value={stats.pendingReview || 0} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="待审核" value={stats.pendingApprove || 0} valueStyle={{ color: '#faad14' }} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="已逾期" value={stats.overdue || 0} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索样品/任务/项目" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} allowClear style={{ width: 240 }} />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 130 }}>
            <Select.Option value="all">全部状态</Select.Option>
            <Select.Option value="unassigned">待分配</Select.Option>
            <Select.Option value="pending">待检测</Select.Option>
            <Select.Option value="testing">检测中</Select.Option>
            <Select.Option value="pending_review">待审核</Select.Option>
            <Select.Option value="completed">已完成</Select.Option>
            <Select.Option value="overdue">已逾期</Select.Option>
          </Select>
        </Space>

        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          { key: 'schedule', label: '排期视图', children: (
          <Row gutter={16}>
            <Col span={6}><Card size="small" title="仪器"><Space direction="vertical" style={{width:'100%'}}>
              {[{inst:'pH计 PHS-3E', tasks:[{t:'TK-001 pH值',time:'08:00-10:00',p:'high',c:'#ff4d4f'},{t:'TK-005 pH值',time:'14:00-15:30',p:'low',c:'#52c41a'}]},{inst:'COD消解仪 HCA-100', tasks:[{t:'TK-002 COD',time:'10:00-14:00',p:'high',c:'#ff4d4f'}]},{inst:'紫外分光光度计', tasks:[{t:'TK-003 氨氮',time:'08:30-11:00',p:'medium',c:'#faad14'}]},{inst:'原子吸收光谱仪', tasks:[{t:'TK-004 重金属',time:'09:00-12:00',p:'medium',c:'#faad14'}]},{inst:'ICP-MS质谱仪', tasks:[{t:'维护中',time:'全天',p:'',c:'#d9d9d9'}]}].map(inst => (
                <Card key={inst.inst} size="small" style={{marginBottom:4}}>
                  <Text strong style={{fontSize:12}}>{inst.inst}</Text>
                  {inst.tasks.map((tk:any) => <div key={tk.t} style={{fontSize:11,marginTop:2,padding:'2px 4px',background:tk.c+'20',borderLeft:'3px solid '+tk.c,borderRadius:2}}><Tag color={tk.p==='high'?'red':tk.p==='medium'?'orange':'green'} style={{fontSize:10,lineHeight:'16px',padding:'0 4px',marginRight:4}}>{tk.time}</Tag>{tk.t}</div>)}
                </Card>
              ))}
            </Space></Card></Col>
            <Col span={18}>
              <Card size="small" title="周排期">
                <Table dataSource={[
                  {inst:'pH计',mon:'TK-001 pH值',tue:'TK-005 pH值',wed:'',thu:'',fri:''},
                  {inst:'COD消解仪',mon:'TK-002 COD',tue:'TK-002 COD',wed:'',thu:'TK-008 COD',fri:''},
                  {inst:'紫外分光',mon:'TK-003 氨氮',tue:'',wed:'TK-009 氨氮',thu:'',fri:'TK-010 总磷'},
                  {inst:'原子吸收',mon:'TK-004 重金属',tue:'TK-006 Cd',wed:'',thu:'',fri:''},
                  {inst:'ICP-MS',mon:'维护',tue:'维护',wed:'',thu:'TK-011 重金属',fri:''},
                ]} rowKey="inst" pagination={false} size="small" columns={[
                  {title:'仪器/分析员',dataIndex:'inst',fixed:'left',width:100},
                  ...[{key:'mon',label:'周一 05-19'},{key:'tue',label:'周二 05-20'},{key:'wed',label:'周三 05-21'},{key:'thu',label:'周四 05-22'},{key:'fri',label:'周五 05-23'}].map(d => ({title:d.label,dataIndex:d.key,render:(v:string) => v ? <Tag style={{cursor:'pointer'}}>{v}</Tag> : <Text type="secondary">—</Text>})),
                ]} />
              </Card>
              <Card size="small" title="任务分配" style={{marginTop:16}}>
                <Button type="primary" size="small">+ 分配任务</Button>
              </Card>
            </Col>
          </Row>
        )},
        { key: 'board', label: '任务看板', children: (
            <Row gutter={16}>
              {Object.entries(statusGroups).map(([key, items]) => (
                <Col xs={24} sm={12} md={8} lg={4} key={key} style={{ marginBottom: 16 }}>
                  <Card size="small" title={
                    <Space><Badge color={statusColor[key]} />{key === 'unassigned' ? '待分配' : key === 'pending' ? '待检测' : key === 'testing' ? '检测中' : key === 'pending_review' ? '待审核' : '已完成'}<Tag>{items.length}</Tag></Space>
                  }>
                    {items.map(t => (
                      <Card key={t.id} size="small" style={{ marginBottom: 8, cursor: 'pointer' }} onClick={() => { setSelectedTask(t); setDrawerVisible(true); }}>
                        <Text style={{ fontSize: 12 }}>{t.taskNo}</Text><br />
                        <Text ellipsis style={{ fontSize: 12 }}>{t.sampleName} - {t.testItem}</Text><br />
                        <Tag color={priorityColor[t.priority]} style={{ fontSize: 10 }}>{t.priorityLabel}</Tag>
                      </Card>
                    ))}
                  </Card>
                </Col>
              ))}
            </Row>
          )},
          { key: 'list', label: '任务列表', children: (
            <Table columns={columns} dataSource={tasks} rowKey="id" loading={loading} pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }} size="middle" />
          )},
        ]} />
      </Card>

      <Drawer title={selectedTask?.taskNo} open={drawerVisible} onClose={() => { setDrawerVisible(false); setSelectedTask(null); }} width={480} extra={<Space><Button icon={<EditOutlined />} onClick={() => navigate(`/tasks/${selectedTask?.id}/result`)}>录入结果</Button><Button icon={<PrinterOutlined />} onClick={() => message.success('任务单已打印')}>打印</Button></Space>}>
        {selectedTask && (
          <>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="任务编号">{selectedTask.taskNo}</Descriptions.Item>
              <Descriptions.Item label="样品编号">{selectedTask.sampleNo}</Descriptions.Item>
              <Descriptions.Item label="样品名称" span={2}>{selectedTask.sampleName}</Descriptions.Item>
              <Descriptions.Item label="检测项目">{selectedTask.testItem}</Descriptions.Item>
              <Descriptions.Item label="检测方法">{selectedTask.method}</Descriptions.Item>
              <Descriptions.Item label="分析员">{selectedTask.analystName || '未分配'}</Descriptions.Item>
              <Descriptions.Item label="仪器">{selectedTask.instrumentName || '未分配'}</Descriptions.Item>
              <Descriptions.Item label="优先级"><Tag color={priorityColor[selectedTask.priority]}>{selectedTask.priorityLabel}</Tag></Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={statusColor[selectedTask.status]}>{selectedTask.statusLabel}</Tag></Descriptions.Item>
              <Descriptions.Item label="计划时间" span={2}>{selectedTask.plannedStart} ~ {selectedTask.plannedEnd}</Descriptions.Item>
              <Descriptions.Item label="进度" span={2}><Progress percent={selectedTask.progress} /></Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 16 }}><Text strong>任务流程</Text></div>
            <Timeline style={{ marginTop: 8 }} items={[
              { color: selectedTask.status !== 'unassigned' ? 'green' : 'gray', children: '任务分配' },
              { color: ['testing', 'pending_review', 'completed'].includes(selectedTask.status) ? 'green' : selectedTask.status === 'pending' ? 'blue' : 'gray', children: '检测中' },
              { color: ['pending_review', 'completed'].includes(selectedTask.status) ? 'green' : selectedTask.status === 'pending_review' ? 'blue' : 'gray', children: '数据审核' },
              { color: selectedTask.status === 'completed' ? 'green' : 'gray', children: '报告生成' },
            ]} />
          </>
        )}
      </Drawer>

      <Modal title="任务分配" open={assignVisible} onOk={() => form.submit()} onCancel={() => { setAssignVisible(false); form.resetFields(); }} width={500}>
        <Form form={form} layout="vertical" onFinish={handleAssign}>
          <Form.Item name="analystName" label="检测人员" rules={[{ required: true }]}><Input placeholder="选择分析员" /></Form.Item>
          <Form.Item name="instrumentName" label="关联仪器"><Select placeholder="选择仪器" allowClear>
            <Select.Option value="pH计 PHS-3E">pH计 PHS-3E</Select.Option>
            <Select.Option value="COD消解仪 HCA-100">COD消解仪 HCA-100</Select.Option>
            <Select.Option value="紫外分光光度计 UV-001">紫外分光光度计 UV-001</Select.Option>
            <Select.Option value="原子吸收光谱仪 AAS-001">原子吸收光谱仪 AAS-001</Select.Option>
            <Select.Option value="ICP-MS质谱仪 ICP-001">ICP-MS质谱仪 ICP-001</Select.Option>
          </Select></Form.Item>
          <Form.Item name="priority" label="优先级"><Select>
            <Select.Option value="high"><Tag color="red">高</Tag></Select.Option>
            <Select.Option value="medium"><Tag color="orange">中</Tag></Select.Option>
            <Select.Option value="low"><Tag color="green">低</Tag></Select.Option>
          </Select></Form.Item>
          <Form.Item name="plannedStart" label="计划开始时间"><Input placeholder="YYYY-MM-DD" /></Form.Item>
          <Form.Item name="plannedEnd" label="计划完成时间"><Input placeholder="YYYY-MM-DD" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
