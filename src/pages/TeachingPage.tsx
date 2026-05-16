import React, { useEffect, useState } from 'react';
import {Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tabs, Drawer, Descriptions, Progress, Rate, Modal, Form, Select} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, TeamOutlined, BookOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const TeachingPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [drawer, setDrawer] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetch('/api/v1/teaching/courses').then(r => r.json()).then(d => { setCourses(d.data.list); setLoading(false); });
  }, []);

  const filtered = courses.filter((c: any) => c.name.includes(search) || c.teacher.includes(search));
  const stats = { total: courses.length, students: courses.reduce((s: number, c: any) => s + c.students, 0), experiments: courses.reduce((s: number, c: any) => s + c.experiments, 0), active: courses.filter((c: any) => c.status === 'active').length };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}><Col><Title level={4}>教学实验管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true); }}>新建课程</Button></Col>
      </Row>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="本学期课程" value={stats.active} prefix={<BookOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="学生总人数" value={stats.students} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="实验项目" value={stats.experiments} prefix={<FileTextOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="进行中" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
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
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '进行中' : '已结束'}</Tag> },
          { title: '操作', render: (_: any, r: any) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawer(true); }} /> },
        ]} pagination={false} size="middle" />
      </Card>

      <Drawer title={selected?.name} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={520}>
        {selected && (
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
            { key: 'students', label: '学生管理', children: <Text type="secondary">学生名单加载中...</Text> },
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
                  {title:'操作',render:(_:any,r:any) => r.status === '待批阅' ? <Button size="small" type="primary" onClick={() => message.success('已批阅: '+r.name)}>批阅</Button> : <Button size="small" onClick={() => { setSelected(r); setDrawer(true); }}>查看</Button>},
                ]} />
                <Button type="primary" style={{marginTop:8}} onClick={() => message.success('批量评分完成')}>批量评分</Button>
              </div>
            )},
          ]} />
        )}
      </Drawer>

      <Modal title="新建课程" open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); form.resetFields(); }}>
        <Form form={form} layout="vertical" onFinish={(v) => {
          courses.push({ id: 'c'+(courses.length+1), ...v, students: 0, experiments: 0, status: 'active' });
          message.success('课程创建成功'); setModalVisible(false); form.resetFields();
        }}>
          <Form.Item name="name" label="课程名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="teacher" label="授课教师"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="semester" label="学期"><Select>{['2024-2025春','2024-2025秋','2025-2026春'].map(s=><Select.Option key={s}>{s}</Select.Option>)}</Select></Form.Item></Col>
          </Row>
          <Form.Item name="description" label="课程描述"><Input.TextArea /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
