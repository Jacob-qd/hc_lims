import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Typography, Space, Tabs, Row, Col, Statistic,
  Modal, Descriptions, Badge, Timeline, Progress, Avatar, Input,
  Form, message, Divider, Radio,
} from 'antd';
import {
  TeamOutlined, UserOutlined, MedicineBoxOutlined,
  ManOutlined, WomanOutlined, ExperimentOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const typeColor: Record<string, string> = {
  faculty: 'blue', postdoc: 'purple', phd: 'cyan',
  master: 'geekblue', undergrad: 'lime', technician: 'orange', admin: 'default',
};
const typeLabel: Record<string, string> = {
  faculty: '教师', postdoc: '博士后', phd: '博士生',
  master: '硕士生', undergrad: '本科生', technician: '技术员', admin: '管理员',
};

const competencyLevel: Record<string, { color: string; label: string }> = {
  proficient: { color: 'green', label: '熟练' },
  qualified: { color: 'blue', label: '合格' },
  needs_training: { color: 'orange', label: '需培训' },
  unassessed: { color: 'default', label: '未评估' },
};

const mockResearchers = [
  { id: 'r1', employeeNo: '202301001', name: '张三', gender: 'male', type: 'phd', department: '环境学院', groupId: 'g1', groupName: '环境课题组', advisorId: 'r10', advisorName: '王教授', email: 'zhangsan@edu.cn', phone: '13800001111', entryDate: '2023-09-01', expectedGraduationDate: '2027-06-30', status: 'active', statusLabel: '在职' },
  { id: 'r2', employeeNo: '202301002', name: '李四', gender: 'female', type: 'master', department: '食品学院', groupId: 'g2', groupName: '食品课题组', advisorId: 'r10', advisorName: '王教授', email: 'lisi@edu.cn', phone: '13800002222', entryDate: '2023-09-01', expectedGraduationDate: '2026-06-30', status: 'active', statusLabel: '在职' },
  { id: 'r3', employeeNo: 'T001', name: '赵五', gender: 'male', type: 'technician', title: '高级实验师', department: '环境学院', groupId: 'g1', groupName: '环境课题组', email: 'zhaowu@edu.cn', phone: '13800003333', entryDate: '2020-03-01', status: 'active', statusLabel: '在职' },
  { id: 'r4', employeeNo: 'F001', name: '王教授', gender: 'male', type: 'faculty', title: '教授', department: '环境学院', groupId: 'g1', groupName: '环境课题组', email: 'wang@edu.cn', phone: '13800004444', entryDate: '2015-09-01', status: 'active', statusLabel: '在职' },
  { id: 'r5', employeeNo: '202201003', name: '孙六', gender: 'male', type: 'phd', department: '化学学院', groupId: 'g3', groupName: '化学课题组', advisorId: 'r11', advisorName: '李教授', email: 'sunliu@edu.cn', phone: '13800005555', entryDate: '2022-09-01', expectedGraduationDate: '2026-06-30', status: 'active', statusLabel: '在职' },
];

const mockTrainings = [
  { id: 't1', courseId: 'c1', courseName: '危化品操作培训', courseType: 'safety', attendedAt: '2024-01-15', score: 95, certificateNo: 'SAF202401001', validUntil: '2027-01-15', status: 'valid' },
  { id: 't2', courseId: 'c2', courseName: '液相色谱仪操作', courseType: 'instrument', attendedAt: '2024-03-10', score: 88, certificateNo: 'INST202403002', validUntil: '2027-03-10', status: 'valid' },
  { id: 't3', courseId: 'c3', courseName: '生物安全培训', courseType: 'safety', attendedAt: '2023-09-01', score: 90, certificateNo: 'SAF202309003', validUntil: '2026-09-01', status: 'expiring' },
];

const mockCompetencies = [
  { dimension: 'instrument', dimensionLabel: '仪器操作', level: 'proficient', assessedAt: '2024-03-10', assessedBy: '赵五' },
  { dimension: 'method', dimensionLabel: '检测方法', level: 'qualified', assessedAt: '2024-03-10', assessedBy: '赵五' },
  { dimension: 'safety', dimensionLabel: '安全规范', level: 'proficient', assessedAt: '2024-01-15', assessedBy: '赵五' },
  { dimension: 'data_analysis', dimensionLabel: '数据分析', level: 'qualified', assessedAt: '2024-03-10', assessedBy: '赵五' },
  { dimension: 'quality_control', dimensionLabel: '质量控制', level: 'needs_training', assessedAt: '2024-03-10', assessedBy: '赵五' },
];

const mockCourses = [
  { id: 'c1', name: '危化品操作培训', type: 'safety', typeLabel: '安全', validityMonths: 36, mandatory: true },
  { id: 'c2', name: '液相色谱仪操作', type: 'instrument', typeLabel: '仪器', validityMonths: 36, mandatory: true },
  { id: 'c3', name: '生物安全培训', type: 'safety', typeLabel: '安全', validityMonths: 36, mandatory: true },
];

const alertTrainings = mockTrainings.filter(t => t.status === 'expiring');

export const ResearcherPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedResearcher, setSelectedResearcher] = useState<any>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  const filteredResearchers = mockResearchers.filter(r => {
    const matchText = !searchText || r.name.includes(searchText) || r.employeeNo.includes(searchText);
    return matchText;
  });

  const stats = {
    total: mockResearchers.length,
    faculty: mockResearchers.filter(r => r.type === 'faculty').length,
    postdoc: mockResearchers.filter(r => r.type === 'postdoc').length,
    phd: mockResearchers.filter(r => r.type === 'phd').length,
    master: mockResearchers.filter(r => r.type === 'master').length,
    undergrad: mockResearchers.filter(r => r.type === 'undergrad').length,
    technician: mockResearchers.filter(r => r.type === 'technician').length,
    needsTraining: alertTrainings.length,
  };

  const columns = [
    { title: '工号/学号', dataIndex: 'employeeNo', width: 120 },
    { title: '姓名', dataIndex: 'name', render: (v: string, r: any) => (
      <Space>
        <Avatar icon={r.gender === 'male' ? <ManOutlined /> : <WomanOutlined />} size="small" style={{ background: r.gender === 'male' ? '#1677ff' : '#eb2f96' }} />
        <Text strong>{v}</Text>
      </Space>
    )},
    { title: '类型', dataIndex: 'type', render: (v: string) => <Tag color={typeColor[v]}>{typeLabel[v]}</Tag> },
    { title: '课题组', dataIndex: 'groupName', ellipsis: true },
    { title: '导师', dataIndex: 'advisorName', render: (v: string) => v || '-' },
    { title: '状态', dataIndex: 'status', render: (v: string) => <Badge status={v === 'active' ? 'success' : 'default'} text={v === 'active' ? '在职' : '已离岗'} /> },
    { title: '操作', width: 120, render: (_: any, r: any) => (
      <Button type="link" size="small" onClick={() => { setSelectedResearcher(r); setDetailOpen(true); }}>详情</Button>
    )},
  ];

  const handleNew = () => {
    newForm.validateFields().then(values => {
      message.success(`科研人员 ${values.name} 已创建`);
      setNewOpen(false);
      newForm.resetFields();
    });
  };

  const tabItems = [
    {
      key: 'overview',
      label: '人员总览',
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6} md={3}><Card><Statistic title="总人数" value={stats.total} prefix={<TeamOutlined />} /></Card></Col>
            <Col xs={12} sm={6} md={3}><Card><Statistic title="教师" value={stats.faculty} prefix={<UserOutlined />} /></Card></Col>
            <Col xs={12} sm={6} md={3}><Card><Statistic title="博士后" value={stats.postdoc} prefix={<UserOutlined />} /></Card></Col>
            <Col xs={12} sm={6} md={3}><Card><Statistic title="博士生" value={stats.phd} prefix={<ExperimentOutlined />} /></Card></Col>
            <Col xs={12} sm={6} md={3}><Card><Statistic title="硕士生" value={stats.master} prefix={<ExperimentOutlined />} /></Card></Col>
            <Col xs={12} sm={6} md={3}><Card><Statistic title="技术员" value={stats.technician} prefix={<MedicineBoxOutlined />} /></Card></Col>
            <Col xs={12} sm={6} md={3}><Card><Statistic title="待培训" value={stats.needsTraining} valueStyle={{ color: '#ff4d4f' }} prefix={<MedicineBoxOutlined />} /></Card></Col>
            <Col xs={12} sm={6} md={3}><Card><Statistic title="本科生" value={stats.undergrad} prefix={<ExperimentOutlined />} /></Card></Col>
          </Row>
          {alertTrainings.length > 0 && (
            <Card title="⚠️ 培训到期预警" style={{ marginBottom: 24, borderLeft: '4px solid #faad14' }}>
              <Timeline items={alertTrainings.map(t => ({
                color: 'orange',
                children: <Text>{t.courseName} — 有效期至 {t.validUntil}</Text>,
              }))} />
            </Card>
          )}
          <Card title="人员列表" extra={<Button type="primary" onClick={() => setNewOpen(true)}>新建人员</Button>}>
            <Space style={{ marginBottom: 16 }}>
              <Input.Search placeholder="搜索姓名/工号" value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 250 }} />
            </Space>
            <Table dataSource={filteredResearchers} rowKey="id" columns={columns} pagination={false} size="middle" />
          </Card>
        </>
      ),
    },
    {
      key: 'training',
      label: '培训管理',
      children: (
        <Card title="培训课程库">
          <Table
            dataSource={mockCourses}
            rowKey="id"
            columns={[
              { title: '课程名称', dataIndex: 'name' },
              { title: '类型', dataIndex: 'typeLabel', render: (v: string) => <Tag>{v}</Tag> },
              { title: '有效期', dataIndex: 'validityMonths', render: (v: number) => v ? `${v}个月` : '永久' },
              { title: '必修', dataIndex: 'mandatory', render: (v: boolean) => v ? <Tag color="red">必修</Tag> : <Tag>选修</Tag> },
              { title: '操作', render: () => <Button type="link" size="small">编辑</Button> },
            ]}
            pagination={false}
            size="middle"
          />
        </Card>
      ),
    },
    {
      key: 'competency',
      label: '能力矩阵',
      children: (
        <Card title="人员能力矩阵">
          <Table
            dataSource={mockResearchers.filter(r => r.type !== 'faculty')}
            rowKey="id"
            columns={[
              { title: '姓名', dataIndex: 'name' },
              { title: '仪器操作', render: () => <Tag color={competencyLevel.proficient.color}>{competencyLevel.proficient.label}</Tag> },
              { title: '检测方法', render: () => <Tag color={competencyLevel.qualified.color}>{competencyLevel.qualified.label}</Tag> },
              { title: '安全规范', render: () => <Tag color={competencyLevel.proficient.color}>{competencyLevel.proficient.label}</Tag> },
              { title: '数据分析', render: () => <Tag color={competencyLevel.qualified.color}>{competencyLevel.qualified.label}</Tag> },
              { title: '质量控制', render: () => <Tag color={competencyLevel.needs_training.color}>{competencyLevel.needs_training.label}</Tag> },
            ]}
            pagination={false}
            size="middle"
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}><TeamOutlined /> 科研人员管理</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal title={selectedResearcher?.name} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={640}>
        {selectedResearcher && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="工号/学号">{selectedResearcher.employeeNo}</Descriptions.Item>
              <Descriptions.Item label="类型"><Tag color={typeColor[selectedResearcher.type]}>{typeLabel[selectedResearcher.type]}</Tag></Descriptions.Item>
              <Descriptions.Item label="院系">{selectedResearcher.department}</Descriptions.Item>
              <Descriptions.Item label="课题组">{selectedResearcher.groupName}</Descriptions.Item>
              {selectedResearcher.advisorName && <Descriptions.Item label="导师">{selectedResearcher.advisorName}</Descriptions.Item>}
              {selectedResearcher.expectedGraduationDate && <Descriptions.Item label="预计毕业">{selectedResearcher.expectedGraduationDate}</Descriptions.Item>}
              <Descriptions.Item label="邮箱">{selectedResearcher.email}</Descriptions.Item>
              <Descriptions.Item label="电话">{selectedResearcher.phone}</Descriptions.Item>
              <Descriptions.Item label="入职日期">{selectedResearcher.entryDate}</Descriptions.Item>
              <Descriptions.Item label="状态"><Badge status={selectedResearcher.status === 'active' ? 'success' : 'default'} text={selectedResearcher.statusLabel} /></Descriptions.Item>
            </Descriptions>
            <Divider />
            <Title level={5}>培训记录</Title>
            <Table
              dataSource={mockTrainings}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: '课程', dataIndex: 'courseName' },
                { title: '类型', dataIndex: 'courseType', render: (v: string) => <Tag>{v === 'safety' ? '安全' : '仪器'}</Tag> },
                { title: '日期', dataIndex: 'attendedAt' },
                { title: '成绩', dataIndex: 'score' },
                { title: '有效期至', dataIndex: 'validUntil', render: (v: string, r: any) => (
                  <Text style={{ color: r.status === 'expiring' ? '#faad14' : '#52c41a' }}>{v} {r.status === 'expiring' && '⚠️'}</Text>
                )},
              ]}
            />
            <Divider />
            <Title level={5}>能力评估</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              {mockCompetencies.map(c => (
                <Row key={c.dimension} align="middle" style={{ marginBottom: 8 }}>
                  <Col span={6}><Text>{c.dimensionLabel}</Text></Col>
                  <Col span={12}><Progress percent={c.level === 'proficient' ? 100 : c.level === 'qualified' ? 75 : c.level === 'needs_training' ? 40 : 0} size="small" status={c.level === 'needs_training' ? 'exception' : 'success'} /></Col>
                  <Col span={6} style={{ textAlign: 'right' }}><Tag color={competencyLevel[c.level].color}>{competencyLevel[c.level].label}</Tag></Col>
                </Row>
              ))}
            </Space>
          </>
        )}
      </Modal>

      <Modal title="新建科研人员" open={newOpen} onCancel={() => setNewOpen(false)} onOk={handleNew} width={520}>
        <Form form={newForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}><Form.Item name="name" label="姓名" rules={[{ required: true }]}><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="employeeNo" label="工号/学号" rules={[{ required: true }]}><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="type" label="人员类型" rules={[{ required: true }]}>
              <Radio.Group>
                {Object.keys(typeLabel).map(k => <Radio key={k} value={k}>{typeLabel[k]}</Radio>)}
              </Radio.Group>
            </Form.Item></Col>
            <Col span={12}><Form.Item name="gender" label="性别" rules={[{ required: true }]}>
              <Radio.Group><Radio value="male">男</Radio><Radio value="female">女</Radio></Radio.Group>
            </Form.Item></Col>
          </Row>
          <Form.Item name="department" label="院系" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="phone" label="电话"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
