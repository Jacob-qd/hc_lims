import React, { useState } from 'react';
import {Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Select, DatePicker, Modal, Form, Input} from 'antd';
import { PlusOutlined, BarChartOutlined, FileTextOutlined, ClockCircleOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockReports = [
  { id: 'rpt1', name: '月度检测统计报表', type: '定时', schedule: '每月1日', lastRun: '2024-05-01', status: 'active', format: 'PDF/Excel' },
  { id: 'rpt2', name: '仪器利用率报表', type: '定时', schedule: '每周一', lastRun: '2024-05-13', status: 'active', format: 'PDF' },
  { id: 'rpt3', name: '质量控制趋势报表', type: '手动', schedule: '-', lastRun: '2024-05-10', status: 'active', format: 'Excel' },
  { id: 'rpt4', name: '人员工作量统计', type: '手动', schedule: '-', lastRun: '2024-05-05', status: 'draft', format: 'Excel' },
];

const mockCharts = [
  { id: 'c1', name: '样品量月度趋势', type: '折线图', data: '样品数据', lastUpdate: '2024-05-14' },
  { id: 'c2', name: '检测项目分布', type: '饼图', data: '任务数据', lastUpdate: '2024-05-14' },
  { id: 'c3', name: '实验室工作量对比', type: '柱状图', data: '任务数据', lastUpdate: '2024-05-13' },
];

export const ReportEnginePage: React.FC = () => {
  const [createVisible, setCreateVisible] = useState(false);

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><BarChartOutlined /> 报表引擎</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateVisible(true)}>新建报表</Button></Col>
      </Row>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="报表模板" value={mockReports.length} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="定时报表" value={mockReports.filter(r => r.type === '定时').length} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="图表组件" value={mockCharts.length} prefix={<BarChartOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="数据源" value={6} prefix={<FileTextOutlined />} /></Card></Col>
      </Row>
      <Tabs defaultActiveKey="templates" items={[
        { key: 'templates', label: '报表模板', children: <Card>
          <Table dataSource={mockReports} rowKey="id" columns={[
            { title: '报表名称', dataIndex: 'name' },
            { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={t === '定时' ? 'blue' : 'orange'}>{t}</Tag> },
            { title: '调度计划', dataIndex: 'schedule' },
            { title: '最近运行', dataIndex: 'lastRun' },
            { title: '输出格式', dataIndex: 'format' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '已启用' : '草稿'}</Tag> },
            { title: '操作', render: () => <Space><Button type="link" size="small">运行</Button><Button type="link" size="small">编辑</Button><Button type="link" size="small">下载</Button></Space> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'charts', label: '图表组件库', children: <Card>
          <Table dataSource={mockCharts} rowKey="id" columns={[
            { title: '图表名称', dataIndex: 'name' },
            { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
            { title: '数据源', dataIndex: 'data' },
            { title: '最后更新', dataIndex: 'lastUpdate' },
            { title: '操作', render: () => <Space><Button type="link" size="small">预览</Button><Button type="link" size="small">配置</Button></Space> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'schedule', label: '调度任务', children: <Card><Text type="secondary">报表调度任务管理...</Text></Card> },
      ]} />
      <Modal title="新建报表" open={createVisible} onCancel={() => setCreateVisible(false)} footer={null}>
        <Form layout="vertical" onFinish={(v) => { message.success('报表创建成功'); setCreateVisible(false); }}>
          <Form.Item name="name" label="报表名称" required><Input /></Form.Item>
          <Form.Item name="type" label="类型"><Select><Select.Option value="定时">定时报表</Select.Option><Select.Option value="手动">手动报表</Select.Option></Select></Form.Item>
          <Form.Item name="format" label="输出格式"><Select mode="multiple"><Select.Option value="PDF">PDF</Select.Option><Select.Option value="Excel">Excel</Select.Option><Select.Option value="CSV">CSV</Select.Option></Select></Form.Item>
          <Button type="primary" block htmlType="submit">创建</Button>
        </Form>
      </Modal>
    </div>
  );
};
