import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Modal, Form, Input, Select, DatePicker, InputNumber, message, Badge, Descriptions, Progress } from 'antd';
import { ExperimentOutlined, TrophyOutlined, WarningOutlined, CheckCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockPlans = [
  { id: 'pt1', name: '2025年度水中重金属能力验证', organizer: '中国合格评定国家认可委员会(CNAS)', project: '重金属', startDate: '2025-03-01', endDate: '2025-06-30', status: 'in_progress', participants: 45 },
  { id: 'pt2', name: '2025食品微生物检测能力验证', organizer: '中国检验检疫科学研究院', project: '微生物', startDate: '2025-04-01', endDate: '2025-08-31', status: 'pending', participants: 0 },
  { id: 'pt3', name: '2024水质有机污染物能力验证', organizer: '环境保护部标准样品研究所', project: '有机物', startDate: '2024-10-01', endDate: '2024-12-31', status: 'completed', participants: 38, zScore: '|z|≤2' },
  { id: 'pt4', name: '2024药品含量测定能力验证', organizer: '中国食品药品检定研究院', project: '药品', startDate: '2024-07-01', endDate: '2024-09-30', status: 'completed', participants: 52, zScore: '|z|≤2' },
];

const mockResults = [
  { id: 'r1', planId: 'pt1', testItem: '铅(Pb)', ourResult: '0.052 mg/L', assignedValue: '0.051 mg/L', zScore: 0.38, evaluation: '满意' },
  { id: 'r2', planId: 'pt1', testItem: '镉(Cd)', ourResult: '0.018 mg/L', assignedValue: '0.020 mg/L', zScore: -0.95, evaluation: '满意' },
  { id: 'r3', planId: 'pt1', testItem: '汞(Hg)', ourResult: '0.008 mg/L', assignedValue: '0.006 mg/L', zScore: 1.82, evaluation: '满意' },
  { id: 'r4', planId: 'pt3', testItem: '苯', ourResult: '0.45 μg/L', assignedValue: '0.48 μg/L', zScore: -0.67, evaluation: '满意' },
  { id: 'r5', planId: 'pt3', testItem: '甲苯', ourResult: '0.82 μg/L', assignedValue: '0.80 μg/L', zScore: 0.25, evaluation: '满意' },
  { id: 'r6', planId: 'pt4', testItem: '含量测定', ourResult: '99.2%', assignedValue: '99.5%', zScore: -1.42, evaluation: '满意' },
];

const statusColors: Record<string, string> = { pending: 'default', in_progress: 'processing', completed: 'success' };
const statusLabels: Record<string, string> = { pending: '待参加', in_progress: '进行中', completed: '已完成' };
const evalColors: Record<string, string> = { '满意': 'green', '可疑': 'orange', '不满意': 'red' };

export const ProficiencyTestingPage: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);
  const [form] = Form.useForm();

  const zScoreRender = (z: number) => {
    const absZ = Math.abs(z);
    const color = absZ <= 2 ? '#52c41a' : absZ <= 3 ? '#faad14' : '#ff4d4f';
    return <Tag color={color}>{z.toFixed(2)}</Tag>;
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><TrophyOutlined /> 能力验证管理</Title></Col>
        <Col>
          <Space>
            <Button onClick={() => setResultVisible(true)}>录入结果</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>新建计划</Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="验证计划总数" value={mockPlans.length} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="进行中" value={mockPlans.filter(p => p.status === 'in_progress').length} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="已完成" value={mockPlans.filter(p => p.status === 'completed').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="满意率" value="100%" valueStyle={{ color: '#52c41a' }} suffix={<CheckCircleOutlined />} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="plans" items={[
        { key: 'plans', label: '验证计划', children: <Card>
          <Table dataSource={mockPlans} rowKey="id" columns={[
            { title: '计划名称', dataIndex: 'name', width: 280 },
            { title: '组织单位', dataIndex: 'organizer', width: 250, render: (t: string) => <Text ellipsis style={{ maxWidth: 240 }}>{t}</Text> },
            { title: '检测项目', dataIndex: 'project' },
            { title: '时间', render: (_: any, r: any) => <Text>{r.startDate} ~ {r.endDate}</Text> },
            { title: '参加实验室', dataIndex: 'participants' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={statusColors[s] as any} text={statusLabels[s]} /> },
            { title: 'Z比分数', dataIndex: 'zScore', render: (z: string) => z ? <Tag color="green">{z}</Tag> : '-' },
            { title: '操作', render: (_: any, r: any) => <Space size="small">
              <Button type="link" size="small">详情</Button>
              {r.status === 'in_progress' && <Button type="link" size="small" onClick={() => setResultVisible(true)}>录入结果</Button>}
              {r.status === 'completed' && <Button type="link" size="small">报告</Button>}
            </Space> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'results', label: '检测结果', children: <Card extra={
          <Space><Select defaultValue="all" style={{ width: 160 }} options={[{ value: 'all', label: '全部计划' }, ...mockPlans.map(p => ({ value: p.id, label: p.name }))]} /><Button icon={<UploadOutlined />}>导出</Button></Space>
        }>
          <Table dataSource={mockResults} rowKey="id" columns={[
            { title: '检测项目', dataIndex: 'testItem' },
            { title: '本实验室结果', dataIndex: 'ourResult' },
            { title: '指定值', dataIndex: 'assignedValue' },
            { title: 'Z比分数', dataIndex: 'zScore', render: (z: number) => zScoreRender(z), sorter: (a: any, b: any) => Math.abs(a.zScore) - Math.abs(b.zScore) },
            { title: '评价', dataIndex: 'evaluation', render: (e: string) => <Tag color={evalColors[e]}>{e}</Tag> },
            { title: '操作', render: () => <Space><Button type="link" size="small">详情</Button><Button type="link" size="small">CAPA</Button></Space> },
          ]} pagination={false} size="middle" />
          <Card size="small" style={{ marginTop: 16, background: '#f6ffed' }}>
            <Row gutter={16}>
              <Col span={12}><Text strong>Z比分数统计</Text><Progress percent={100} success={{ percent: 100 }} format={() => '6/6 |z|≤2'} /></Col>
              <Col span={12}><Descriptions size="small" column={2}>
                <Descriptions.Item label="|z|≤2 (满意)">6项</Descriptions.Item>
                <Descriptions.Item label="2<|z|<3 (可疑)">0项</Descriptions.Item>
                <Descriptions.Item label="|z|≥3 (不满意)">0项</Descriptions.Item>
                <Descriptions.Item label="En值"><Tag color="green">全部<1</Tag></Descriptions.Item>
              </Descriptions></Col>
            </Row>
          </Card>
        </Card>},
        { key: 'annual', label: '年度计划', children: <Card>
          <Table dataSource={mockPlans} rowKey="id" columns={[
            { title: '季度', render: (_: any, r: any) => <Tag>{r.startDate.includes('2025') ? '2025年度' : '2024年度'}</Tag> },
            { title: '计划名称', dataIndex: 'name' },
            { title: '组织单位', dataIndex: 'organizer', render: (t: string) => <Text ellipsis style={{ maxWidth: 200 }}>{t}</Text> },
            { title: '预算', render: () => '¥3,500' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={statusColors[s] as any} text={statusLabels[s]} /> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'cnas', label: 'CNAS覆盖', children: <Card>
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="认可参数总数">128项</Descriptions.Item>
            <Descriptions.Item label="已参加能力验证">62项 (48.4%)</Descriptions.Item>
            <Descriptions.Item label="本年度计划参加">15项</Descriptions.Item>
            <Descriptions.Item label="覆盖子领域">重金属、微生物、有机物、药品、食品添加剂</Descriptions.Item>
          </Descriptions>
          <Table style={{ marginTop: 16 }} dataSource={[
            { area: '重金属', params: 18, participated: 12, planned: 3, coverage: '83%' },
            { area: '微生物', params: 22, participated: 8, planned: 4, coverage: '55%' },
            { area: '有机物', params: 35, participated: 20, planned: 5, coverage: '71%' },
            { area: '药品', params: 15, participated: 10, planned: 2, coverage: '80%' },
            { area: '食品添加剂', params: 12, participated: 4, planned: 1, coverage: '42%' },
          ]} rowKey="area" columns={[
            { title: '子领域', dataIndex: 'area' },
            { title: '参数数', dataIndex: 'params' },
            { title: '已参加', dataIndex: 'participated' },
            { title: '计划参加', dataIndex: 'planned' },
            { title: '覆盖率', dataIndex: 'coverage', render: (c: string) => <Progress percent={parseInt(c)} size="small" /> },
          ]} pagination={false} size="small" />
        </Card>},
      ]} />

      <Modal title="新建能力验证计划" open={createVisible} onCancel={() => setCreateVisible(false)} onOk={() => { form.submit(); }}>
        <Form form={form} layout="vertical" onFinish={() => { message.success('计划创建成功'); setCreateVisible(false); form.resetFields(); }}>
          <Form.Item name="name" label="计划名称" required><Input placeholder="如: 2025年度水中重金属能力验证" /></Form.Item>
          <Form.Item name="organizer" label="组织单位" required><Input placeholder="如: CNAS" /></Form.Item>
          <Form.Item name="project" label="检测项目" required><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="startDate" label="开始日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
            <Col span={12}><Form.Item name="endDate" label="结束日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="budget" label="预算(元)"><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="录入检测结果" open={resultVisible} onCancel={() => setResultVisible(false)} width={600} footer={null}>
        <Form layout="vertical" onFinish={() => { message.success('结果录入成功'); setResultVisible(false); }}>
          <Form.Item name="planId" label="选择计划" required><Select options={mockPlans.filter(p => p.status !== 'completed').map(p => ({ value: p.id, label: p.name }))} /></Form.Item>
          <Form.Item name="testItem" label="检测项目" required><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="ourResult" label="本实验室结果" required><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="assignedValue" label="指定值"><Input /></Form.Item></Col>
          </Row>
          <Form.Item name="notes" label="备注"><Input.TextArea /></Form.Item>
          <Button type="primary" htmlType="submit" block>提交</Button>
        </Form>
      </Modal>
    </div>
  );
};
