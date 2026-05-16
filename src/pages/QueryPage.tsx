import React from 'react';
import { Card, Input, Table, Tag, Typography, Space, Select, Row, Col, Statistic, message } from 'antd';

const { Title, Text } = Typography;

const mockResults = [
  { id: '1', type: '样品', code: 'SMP20240520001', name: '地表水样品-1', customer: '绿源环保', status: '检测中', date: '2024-05-20' },
  { id: '2', type: '样品', code: 'SMP20240520002', name: '饮用水样品-2', customer: '博克水务', status: '已接收', date: '2024-05-20' },
  { id: '3', type: '任务', code: 'TK-2025-001', name: 'pH值检测', customer: '绿源环保', status: '已完成', date: '2024-05-21' },
  { id: '4', type: '任务', code: 'TK-2025-004', name: '重金属(Pb)检测', customer: '红创检测', status: '检测中', date: '2024-05-21' },
  { id: '5', type: '报告', code: 'RPT20240521001', name: '地表水检测报告', customer: '绿源环保', status: '已签发', date: '2024-05-21' },
  { id: '6', type: '报告', code: 'RPT20240520022', name: '土壤检测报告', customer: '红创检测', status: '待审核', date: '2024-05-20' },
];

const typeColors: Record<string, string> = { 样品: '#1677ff', 任务: '#52c41a', 报告: '#722ed1' };

export const QueryPage: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>综合查询</Title>

      <Card style={{ marginBottom: 16 }}>
        <Space style={{ width: '100%' }} size="large">
          <Input.Search placeholder="输入样品编号/任务编号/报告编号/客户名称" enterButton="查询" size="large" style={{ width: 500 }} onSearch={v => message.success('查询: '+v)} />
          <Select placeholder="查询类型" style={{ width: 120 }} allowClear>
            <Select.Option value="all">全部</Select.Option>
            <Select.Option value="sample">样品</Select.Option>
            <Select.Option value="task">任务</Select.Option>
            <Select.Option value="report">报告</Select.Option>
          </Select>
          <Select placeholder="状态" style={{ width: 120 }} allowClear>
            <Select.Option value="all">全部状态</Select.Option>
          </Select>
        </Space>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="样品" value={2} suffix="条" /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="任务" value={2} suffix="条" /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="报告" value={2} suffix="条" /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="共" value={6} suffix="条结果" /></Card></Col>
      </Row>

      <Table dataSource={mockResults} rowKey="id" columns={[
        { title: '类型', dataIndex: 'type', render: (t: string) => <Tag color={typeColors[t]}>{t}</Tag> },
        { title: '编号', dataIndex: 'code', render: (c: string) => <Text code>{c}</Text> },
        { title: '名称', dataIndex: 'name' },
        { title: '客户', dataIndex: 'customer' },
        { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
        { title: '日期', dataIndex: 'date' },
      ]} pagination={false} size="middle" />
    </div>
  );
};
