import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, message, Statistic, Row, Col, Popconfirm } from 'antd';
import { BookOutlined, PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, ExperimentOutlined } from '@ant-design/icons';

const { Option } = Select;

interface Course {
  id: string; code: string; name: string; semester: string;
  credit: number; hours: number; teacherName: string;
  studentCount: number; experimentCount: number;
  status: string; statusLabel: string;
}

export const TeachingPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [form] = Form.useForm();

  const fetchCourses = () => {
    setLoading(true);
    fetch('/api/v1/teaching/courses')
      .then(r => r.json())
      .then(res => { if (res.code === 200) setCourses(res.data.list); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleDelete = (id: string) => {
    fetch(`/api/v1/teaching/courses/${id}`, { method: 'DELETE' })
      .then(() => { message.success('删除成功'); fetchCourses(); });
  };

  const handleSubmit = async (values: any) => {
    const url = selectedCourse ? `/api/v1/teaching/courses/${selectedCourse.id}` : '/api/v1/teaching/courses';
    const method = selectedCourse ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
    const data = await res.json();
    if (data.code === 200) { message.success(selectedCourse ? '更新成功' : '创建成功'); setModalOpen(false); form.resetFields(); fetchCourses(); }
  };

  const columns = [
    { title: '课程代码', dataIndex: 'code', width: 100 },
    { title: '课程名称', dataIndex: 'name' },
    { title: '学期', dataIndex: 'semester', width: 130 },
    { title: '学分', dataIndex: 'credit', width: 70 },
    { title: '学时', dataIndex: 'hours', width: 70 },
    { title: '授课教师', dataIndex: 'teacherName', width: 100 },
    { title: '学生数', dataIndex: 'studentCount', width: 90, render: (v: number) => <Tag icon={<TeamOutlined />}>{v}</Tag> },
    { title: '实验数', dataIndex: 'experimentCount', width: 90, render: (v: number) => <Tag icon={<ExperimentOutlined />}>{v}</Tag> },
    { title: '状态', dataIndex: 'status', width: 90, render: (s: string, r: Course) => <Tag color={s === 'active' ? 'green' : 'default'}>{r.statusLabel}</Tag> },
    { title: '操作', width: 150, render: (_: any, r: Course) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => { setSelectedCourse(r); form.setFieldsValue(r); setModalOpen(true); }}>编辑</Button>
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(r.id)}><Button size="small" danger icon={<DeleteOutlined />}>删除</Button></Popconfirm>
      </Space>
    )},
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}><Card><Statistic title="课程总数" value={courses.length} prefix={<BookOutlined />} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="总学生数" value={courses.reduce((s, c) => s + c.studentCount, 0)} prefix={<TeamOutlined />} /></Card></Col>
        <Col xs={24} sm={8}><Card><Statistic title="实验项目" value={courses.reduce((s, c) => s + c.experimentCount, 0)} prefix={<ExperimentOutlined />} /></Card></Col>
      </Row>

      <Card title={<Space><BookOutlined />教学管理</Space>}
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setSelectedCourse(null); form.resetFields(); setModalOpen(true); }}>新建课程</Button>}>
        <Table dataSource={courses} rowKey="id" columns={columns} loading={loading} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal title={selectedCourse ? '编辑课程' : '新建课程'} open={modalOpen} onCancel={() => setModalOpen(false)} onOk={() => form.submit()} destroyOnClose width={600}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="code" label="课程代码" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="name" label="课程名称" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Form.Item name="semester" label="学期" rules={[{ required: true }]} >
            <Select placeholder="选择学期">
              <Option value="2025-2026-1">2025-2026-1</Option>
              <Option value="2025-2026-2">2025-2026-2</Option>
              <Option value="2024-2025-1">2024-2025-1</Option>
              <Option value="2024-2025-2">2024-2025-2</Option>
            </Select>
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="credit" label="学分" rules={[{ required: true }]} > <Input type="number" /> </Form.Item></Col>
            <Col span={12}><Form.Item name="hours" label="学时" rules={[{ required: true }]} > <Input type="number" /> </Form.Item></Col>
          </Row>
          <Form.Item name="teacherName" label="授课教师" rules={[{ required: true }]} > <Input /> </Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="studentCount" label="学生数" rules={[{ required: true }]} > <Input type="number" /> </Form.Item></Col>
            <Col span={12}><Form.Item name="experimentCount" label="实验数" rules={[{ required: true }]} > <Input type="number" /> </Form.Item></Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};
