import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tabs, Drawer, Descriptions, message, Badge, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, TeamOutlined, BookOutlined, FileTextOutlined, EditOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const studentList = [
  { id: '20210101', name: '张三', group: '第1组', completed: 3, total: 4, score: 88 },
  { id: '20210102', name: '李四', group: '第1组', completed: 3, total: 4, score: 92 },
  { id: '20210103', name: '王五', group: '第2组', completed: 2, total: 4, score: 76 },
  { id: '20210104', name: '赵六', group: '第2组', completed: 3, total: 4, score: 85 },
  { id: '20210105', name: '孙七', group: '第3组', completed: 3, total: 4, score: 90 },
  { id: '20210106', name: '周八', group: '第3组', completed: 1, total: 4, score: 60 },
];

export const TeachingPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    fetch('/api/v1/teaching/courses').then(r => r.json()).then(d => { setCourses(d.data.list); setLoading(false); });
  }, []);

  const filtered = courses.filter((c: any) => c.name.includes(search) || c.teacher.includes(search));
  const stats = { total: courses.length, students: courses.reduce((s: number, c: any) => s + c.students, 0), experiments: courses.reduce((s: number, c: any) => s + c.experiments, 0), active: courses.filter((c: any) => c.status === 'active').length, pending: 2 };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}><Col><Title level={4}>教学实验管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => message.success('新建课程功能开发中')}>新建课程</Button></Col>
      </Row>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="本学期课程" value={stats.active} prefix={<BookOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="学生总人数" value={stats.students} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="实验项目" value={stats.experiments} prefix={<FileTextOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card size="small"><Statistic title="待批报告" value={stats.pending} valueStyle={{ color: '#faad14' }} prefix={<EditOutlined />} /></Card></Col>
      </Row>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索课程名称/教师" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
        </Space>
        <Table dataSource={filtered} rowKey="id" loading={loading} columns={[
          { title: '课程名称', dataIndex: 'name', render: (n: string, r: any) => <a onClick={() => { setSelected(r); setDrawer(true); }}>{n}</a> },
          { title: '授课教师', dataIndex: 'teacher' },
          { title: '开课院系', dataIndex: 'dept' },
          { title: '学期', dataIndex: 'semester' },
          { title: '学生人数', dataIndex: 'students' },
          { title: '实验数', dataIndex: 'experiments' },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'active' ? 'processing' : 'default'} text={s === 'active' ? '进行中' : '已结束'} /> },
          { title: '操作', render: (_: any, r: any) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawer(true); }} /> },
        ]} pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      <Drawer title={selected?.name} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={640}>
        {selected && (
          <>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={6}><Card size="small"><Statistic title="学生人数" value={selected.students} prefix={<UserOutlined />} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="实验项目" value={selected.experiments} prefix={<FileTextOutlined />} /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="已完成" value={3} suffix="个" /></Card></Col>
              <Col span={6}><Card size="small"><Statistic title="平均成绩" value={85.2} suffix="分" valueStyle={{ color: '#52c41a' }} /></Card></Col>
            </Row>
            <Tabs items={[
              { key: 'info', label: '基本信息', children: (
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="课程名称">{selected.name}</Descriptions.Item>
                  <Descriptions.Item label="授课教师">{selected.teacher}</Descriptions.Item>
                  <Descriptions.Item label="开课院系">{selected.dept}</Descriptions.Item>
                  <Descriptions.Item label="学期">{selected.semester}</Descriptions.Item>
                  <Descriptions.Item label="学生人数">{selected.students}人</Descriptions.Item>
                  <Descriptions.Item label="实验项目数">{selected.experiments}个</Descriptions.Item>
                  <Descriptions.Item label="状态"><Tag color="green">进行中</Tag></Descriptions.Item>
                </Descriptions>
              )},
              { key: 'outline', label: '教学大纲', children: (
                <Table dataSource={[
                  { exp: '实验一: 水质pH值测定', hours: 3, batch: 3, status: 'completed' },
                  { exp: '实验二: COD测定', hours: 4, batch: 3, status: 'completed' },
                  { exp: '实验三: 氨氮测定', hours: 4, batch: 3, status: 'testing' },
                  { exp: '实验四: 重金属测定', hours: 4, batch: 2, status: 'pending' },
                ]} rowKey="exp" pagination={false} size="small" columns={[
                  { title: '实验名称', dataIndex: 'exp' },
                  { title: '学时', dataIndex: 'hours' },
                  { title: '批次', dataIndex: 'batch' },
                  { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'completed' ? 'green' : s === 'testing' ? 'blue' : 'default'}>{s === 'completed' ? '已完成' : s === 'testing' ? '进行中' : '待开始'}</Tag> },
                ]} />
              )},
              { key: 'students', label: '学生管理', children: (
                <Table dataSource={studentList} rowKey="id" pagination={false} size="small" columns={[
                  { title: '学号', dataIndex: 'id' },
                  { title: '姓名', dataIndex: 'name' },
                  { title: '分组', dataIndex: 'group' },
                  { title: '完成进度', dataIndex: 'completed', render: (c: number, r: any) => <Progress percent={Math.round(c/r.total*100)} size="small" /> },
                  { title: '当前成绩', dataIndex: 'score', render: (s: number) => <Text strong style={{ color: s >= 90 ? '#52c41a' : s >= 60 ? '#1677ff' : '#ff4d4f' }}>{s}</Text> },
                ]} />
              )},
              { key: 'reports', label: '实验报告', children: (
                <div>
                  <Table dataSource={[
                    {id:'r1',student:'张三',exp:'水质pH值测定',score:'',status:'待批阅',submitDate:'2024-05-20'},
                    {id:'r2',student:'李四',exp:'水质pH值测定',score:'92',status:'已批阅',submitDate:'2024-05-19'},
                    {id:'r3',student:'王五',exp:'COD测定',score:'',status:'未提交',submitDate:''},
                    {id:'r4',student:'张三',exp:'COD测定',score:'85',status:'已批阅',submitDate:'2024-05-21'},
                    {id:'r5',student:'李四',exp:'COD测定',score:'',status:'待批阅',submitDate:'2024-05-21'},
                  ]} rowKey="id" pagination={false} size="small" columns={[
                    {title:'学生',dataIndex:'student'},
                    {title:'实验',dataIndex:'exp'},
                    {title:'提交日期',dataIndex:'submitDate',render:(d:string) => d || <Text type="secondary">—</Text>},
                    {title:'成绩',dataIndex:'score',render:(s:string,r:any) => r.status === '待批阅' ? <Input size="small" style={{width:60}} placeholder="评分" /> : s || <Text type="secondary">—</Text>},
                    {title:'状态',dataIndex:'status',render:(s:string) => <Tag color={s==='已批阅'?'green':s==='待批阅'?'orange':'default'}>{s}</Tag>},
                    {title:'操作',render:(_:any,r:any) => r.status === '待批阅' ? <Button size="small" type="primary" onClick={() => message.success('正在批阅: ' + r.student)}>批阅</Button> : <Button size="small" onClick={() => message.info('查看报告: ' + r.student)}>查看</Button>},
                  ]} />
                  <Button type="primary" style={{marginTop:8}} onClick={() => message.success('批量评分功能')}>批量评分</Button>
                </div>
              )},
            ]} />
          </>
        )}
      </Drawer>
    </div>
  );
};
