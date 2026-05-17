import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tabs, Drawer, Descriptions, message, Modal, Form, Select, Progress } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, TeamOutlined, BookOutlined, FileTextOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Course {
  id: string; name: string; teacher: string; dept: string; semester: string;
  students: number; experiments: number; status: string;
}

interface Student {
  id: string; name: string; studentNo: string; class: string; status: string;
}

interface Experiment {
  id: string; name: string; hours: number; batch: number; status: string; schedule?: string;
}

interface Report {
  id: string; student: string; exp: string; score: string; status: string; submitDate: string;
}

export const TeachingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Course | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [gradeForm] = Form.useForm();

  useEffect(() => {
    fetch('/api/v1/teaching/courses').then(r => r.json()).then(d => { setCourses(d.data.list || []); setLoading(false); });
  }, []);

  const fetchDetail = async (course: Course) => {
    setDetailLoading(true);
    try {
      const [stuRes, expRes, repRes] = await Promise.all([
        fetch(`/api/v1/teaching/courses/${course.id}/students`),
        fetch(`/api/v1/teaching/courses/${course.id}/experiments`),
        fetch(`/api/v1/teaching/courses/${course.id}/reports`),
      ]);
      const [stuJson, expJson, repJson] = await Promise.all([stuRes.json(), expRes.json(), repRes.json()]);
      setStudents(stuJson.data?.list || []);
      setExperiments(expJson.data?.list || []);
      setReports(repJson.data?.list || []);
    } catch { /* ignore */ }
    finally { setDetailLoading(false); }
  };

  const openDetail = (course: Course) => {
    setSelected(course);
    setDrawer(true);
    fetchDetail(course);
  };

  const filtered = courses.filter((c: any) => c.name.includes(search) || c.teacher.includes(search));
  const stats = { total: courses.length, students: courses.reduce((s, c) => s + (c.students || 0), 0), experiments: courses.reduce((s, c) => s + (c.experiments || 0), 0), active: courses.filter((c) => c.status === 'active').length };

  const handleGrade = (report: Report) => {
    setCurrentReport(report);
    gradeForm.setFieldsValue({ score: report.score });
    setGradeModal(true);
  };

  const submitGrade = (values: any) => {
    message.success(`已评分: ${currentReport?.student} - ${values.score}分`);
    setGradeModal(false);
    if (selected) fetchDetail(selected);
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}>教学实验管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => message.success('新建课程功能开发中')}>新建课程</Button></Col>
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
          { title: '课程名称', dataIndex: 'name', render: (n: string, r: Course) => <a onClick={() => openDetail(r)}>{n}</a> },
          { title: '授课教师', dataIndex: 'teacher' },
          { title: '开课院系', dataIndex: 'dept' },
          { title: '学期', dataIndex: 'semester' },
          { title: '学生人数', dataIndex: 'students' },
          { title: '实验数', dataIndex: 'experiments' },
          { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '进行中' : '已结束'}</Tag> },
          { title: '操作', render: (_: any, r: Course) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => openDetail(r)} /> },
        ]} pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      <Drawer title={selected?.name} open={drawer} onClose={() => { setDrawer(false); setSelected(null); }} width={560}>
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
              <Table dataSource={experiments} rowKey="id" loading={detailLoading} pagination={false} size="small" columns={[
                { title: '实验名称', dataIndex: 'name' },
                { title: '学时', dataIndex: 'hours' },
                { title: '批次', dataIndex: 'batch' },
                { title: '排期', dataIndex: 'schedule' },
                { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'completed' ? 'green' : s === 'testing' ? 'blue' : 'default'}>{s === 'completed' ? '已完成' : s === 'testing' ? '进行中' : '待开始'}</Tag> },
                { title: '进度', dataIndex: 'status', render: (s: string) => <Progress percent={s === 'completed' ? 100 : s === 'testing' ? 50 : 0} size="small" /> },
              ]} />
            )},
            { key: 'students', label: '学生管理', children: (
              <Table dataSource={students} rowKey="id" loading={detailLoading} pagination={false} size="small" columns={[
                { title: '学号', dataIndex: 'studentNo' },
                { title: '姓名', dataIndex: 'name' },
                { title: '班级', dataIndex: 'class' },
                { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'red'}>{s === 'active' ? '在读' : '退课'}</Tag> },
              ]} />
            )},
            { key: 'reports', label: '实验报告', children: (
              <div>
                <Table dataSource={reports} rowKey="id" loading={detailLoading} pagination={false} size="small" columns={[
                  { title: '学生', dataIndex: 'student' },
                  { title: '实验', dataIndex: 'exp' },
                  { title: '提交日期', dataIndex: 'submitDate', render: (d: string) => d || <Text type="secondary">—</Text> },
                  { title: '成绩', dataIndex: 'score', render: (s: string) => s || <Text type="secondary">—</Text> },
                  { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s==='已批阅'?'green':s==='待批阅'?'orange':'default'}>{s}</Tag> },
                  { title: '操作', render: (_: any, r: Report) => r.status === '待批阅' ? <Button size="small" type="primary" onClick={() => handleGrade(r)}>批阅</Button> : <Button size="small" onClick={() => handleGrade(r)}>查看</Button> },
                ]} />
                <Button type="primary" style={{ marginTop: 8 }} onClick={() => message.success('批量评分功能')}>批量评分</Button>
              </div>
            )},
          ]} />
        )}
      </Drawer>

      <Modal title={`批阅: ${currentReport?.student} - ${currentReport?.exp}`} open={gradeModal} onOk={() => gradeForm.submit()} onCancel={() => setGradeModal(false)}>
        <Form form={gradeForm} layout="vertical" onFinish={submitGrade}>
          <Form.Item name="score" label="成绩" rules={[{ required: true }]}>
            <Input type="number" placeholder="输入0-100的分数" />
          </Form.Item>
          <Form.Item name="comment" label="评语">
            <Input.TextArea rows={3} placeholder="输入评语..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
