import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tabs, Drawer, Descriptions, message, Modal, Form, Select, Progress, Badge, Spin
} from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, TeamOutlined, BookOutlined, FileTextOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Course {
  id: string;
  name: string;
  teacher: string;
  dept: string;
  semester: string;
  students: number;
  experiments: number;
  status: string;
}

export const TeachingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Course | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    window.fetch('/api/v1/teaching/courses')
      .then(r => r.json())
      .then(d => { setCourses(d.data?.list || []); setLoading(false); })
      .catch(() => { message.error('加载失败'); setLoading(false); });
  }, []);

  const filtered = courses.filter((c: Course) => c.name.includes(search) || c.teacher.includes(search));
  const stats = {
    total: courses.length,
    students: courses.reduce((s: number, c: Course) => s + c.students, 0),
    experiments: courses.reduce((s: number, c: Course) => s + c.experiments, 0),
    active: courses.filter((c: Course) => c.status === 'active').length,
  };

  const handleCreate = (values: any) => {
    message.success('课程创建成功');
    setModalVisible(false);
    form.resetFields();
    setCourses(prev => [...prev, { ...values, id: `course${prev.length + 1}`, status: 'active' }]);
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}>教学实验管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>新建课程</Button></Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="本学期课程" value={stats.active} prefix={<BookOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="学生总人数" value={stats.students} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="实验项目" value={stats.experiments} prefix={<FileTextOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="进行中" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索课程名称/教师" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
        </Space>
        <Table
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          columns={[
            { title: '课程名称', dataIndex: 'name', render: (n: string, r: Course) => <a onClick={() => { setSelected(r); setDrawer(true); }}>{n}</a> },
            { title: '授课教师', dataIndex: 'teacher' },
            { title: '开课院系', dataIndex: 'dept' },
            { title: '学期', dataIndex: 'semester' },
            { title: '学生人数', dataIndex: 'students' },
            { title: '实验数', dataIndex: 'experiments' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '进行中' : '已结束'}</Tag> },
            { title: '操作', render: (_: any, r: Course) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawer(true); }} /> },
          ]}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      </Card>

      <Drawer title={selected?.name} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={560}>
        {selected && (
          <Tabs items={[
            {
              key: 'info', label: '基本信息', children: (
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="课程名称">{selected.name}</Descriptions.Item>
                  <Descriptions.Item label="授课教师">{selected.teacher}</Descriptions.Item>
                  <Descriptions.Item label="开课院系">{selected.dept}</Descriptions.Item>
                  <Descriptions.Item label="学期">{selected.semester}</Descriptions.Item>
                  <Descriptions.Item label="学生人数">{selected.students}人</Descriptions.Item>
                  <Descriptions.Item label="实验项目数">{selected.experiments}个</Descriptions.Item>
                  <Descriptions.Item label="状态"><Tag color="green">进行中</Tag></Descriptions.Item>
                </Descriptions>
              )
            },
            {
              key: 'outline', label: '教学大纲', children: (
                <Table
                  dataSource={[
                    { exp: '实验一: 水质pH值测定', hours: 3, batch: 3, status: 'completed' },
                    { exp: '实验二: COD测定', hours: 4, batch: 3, status: 'completed' },
                    { exp: '实验三: 氨氮测定', hours: 4, batch: 3, status: 'testing' },
                    { exp: '实验四: 重金属测定', hours: 4, batch: 2, status: 'pending' },
                  ]}
                  rowKey="exp"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '实验名称', dataIndex: 'exp' },
                    { title: '学时', dataIndex: 'hours' },
                    { title: '批次', dataIndex: 'batch' },
                    { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'completed' ? 'green' : s === 'testing' ? 'blue' : 'default'}>{s === 'completed' ? '已完成' : s === 'testing' ? '进行中' : '待开始'}</Tag> },
                    { title: '进度', render: (_: any, r: any) => <Progress percent={r.status === 'completed' ? 100 : r.status === 'testing' ? 50 : 0} size="small" /> },
                  ]}
                />
              )
            },
            {
              key: 'students', label: '学生管理', children: (
                <Table
                  dataSource={[
                    { id: 's1', name: '张三', no: '2021001', group: '第1组', status: 'active' },
                    { id: 's2', name: '李四', no: '2021002', group: '第1组', status: 'active' },
                    { id: 's3', name: '王五', no: '2021003', group: '第2组', status: 'active' },
                    { id: 's4', name: '赵六', no: '2021004', group: '第2组', status: 'absent' },
                  ]}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '姓名', dataIndex: 'name' },
                    { title: '学号', dataIndex: 'no' },
                    { title: '分组', dataIndex: 'group' },
                    { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'active' ? 'success' : 'error'} text={s === 'active' ? '正常' : '缺勤'} /> },
                  ]}
                />
              )
            },
            {
              key: 'reports', label: '实验报告', children: (
                <div>
                  <Table
                    dataSource={[
                      { id: 'r1', student: '张三', exp: '水质pH值测定', score: '', status: '待批阅', submitDate: '2024-05-20' },
                      { id: 'r2', student: '李四', exp: '水质pH值测定', score: '92', status: '已批阅', submitDate: '2024-05-19' },
                      { id: 'r3', student: '王五', exp: 'COD测定', score: '', status: '未提交', submitDate: '' },
                      { id: 'r4', student: '张三', exp: 'COD测定', score: '85', status: '已批阅', submitDate: '2024-05-21' },
                      { id: 'r5', student: '李四', exp: 'COD测定', score: '', status: '待批阅', submitDate: '2024-05-21' },
                    ]}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '学生', dataIndex: 'student' },
                      { title: '实验', dataIndex: 'exp' },
                      { title: '提交日期', dataIndex: 'submitDate', render: (d: string) => d || <Text type="secondary">—</Text> },
                      { title: '成绩', dataIndex: 'score', render: (s: string, r: any) => r.status === '待批阅' ? <Input size="small" style={{ width: 60 }} placeholder="评分" /> : s || <Text type="secondary">—</Text> },
                      { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === '已批阅' ? 'green' : s === '待批阅' ? 'orange' : 'default'}>{s}</Tag> },
                      { title: '操作', render: (_: any, r: any) => r.status === '待批阅' ? <Button size="small" type="primary" onClick={() => message.success('正在批阅: ' + r.student)}>批阅</Button> : <Button size="small" onClick={() => message.info('查看报告: ' + r.student)}>查看</Button> },
                    ]}
                  />
                  <Button type="primary" style={{ marginTop: 8 }} onClick={() => message.success('批量评分功能')}>批量评分</Button>
                </div>
              )
            },
          ]} />
        )}
      </Drawer>

      <Modal title="新建课程" open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); form.resetFields(); }} width={560}>
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="课程名称" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="teacher" label="授课教师" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="dept" label="开课院系"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="semester" label="学期"><Select><Select.Option value="2024春季">2024春季</Select.Option><Select.Option value="2024秋季">2024秋季</Select.Option></Select></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="students" label="学生人数"><Input type="number" /></Form.Item></Col>
            <Col span={12}><Form.Item name="experiments" label="实验项目数"><Input type="number" /></Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
