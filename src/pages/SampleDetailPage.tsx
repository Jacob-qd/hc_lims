import React from 'react';
import { Card, Descriptions, Tag, Tabs, Timeline, Table, Button, Row, Col, Typography, Steps } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const mockSample = {
  id: 's1', sampleNo: 'SMP20240520001', name: '地表水样品-1', type: '环境水',
  status: 'testing', statusLabel: '检测中', customer: '绿源环保科技有限公司',
  project: '地表水环境质量监测', location: '市政水务集团', samplingTime: '2024-05-20 09:30',
  receivingTime: '2024-05-20 10:45', receiver: '张伟', priority: '高',
  container: '玻璃瓶 500mL×3', storage: '4℃冷藏', lab: '理化实验室',
};

const testItems = [
  { item: 'pH值', method: 'HJ 1147-2020', status: 'completed', result: '7.32', unit: '无量纲' },
  { item: '化学需氧量(COD)', method: 'HJ 828-2017', status: 'testing', result: '-', unit: 'mg/L' },
  { item: '氨氮(NH₃-N)', method: 'HJ 535-2009', status: 'pending', result: '-', unit: 'mg/L' },
  { item: '总磷(TP)', method: 'GB/T 11893-1989', status: 'pending', result: '-', unit: 'mg/L' },
];

const flowRecords = [
  { time: '2024-05-20 09:30', action: '采样', user: '采样员 刘强', desc: '现场采样完成' },
  { time: '2024-05-20 10:45', action: '接收', user: '张伟', desc: '样品已接收，外观正常' },
  { time: '2024-05-20 14:00', action: '分配', user: '张伟', desc: '分配到理化实验室' },
  { time: '2024-05-21 09:00', action: '检测开始', user: '王明', desc: 'COD检测开始' },
];

export const SampleDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentStep = mockSample.status === 'testing' ? 3 : 0;

  return (
    <div>
      <Row align="middle" style={{ marginBottom: 16 }}>
        <Col><Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/samples')} style={{ marginRight: 12 }}>返回</Button></Col>
        <Col><Title level={4} style={{ margin: 0 }}>样品详情 - {mockSample.sampleNo}</Title></Col>
        <Col flex="auto" style={{ textAlign: 'right' }}>
          <Tag color="blue">{mockSample.statusLabel}</Tag>
          <Tag color="red" style={{ marginLeft: 8 }}>{mockSample.priority}优先级</Tag>
        </Col>
      </Row>

      <Steps current={currentStep} size="small" style={{ marginBottom: 16 }} items={[
        { title: '采样登记' }, { title: '样品接收' }, { title: '任务分配' },
        { title: '检测中' }, { title: '数据审核' }, { title: '报告生成' },
      ]} />

      <Card style={{ marginBottom: 16 }}>
        <Descriptions title="基本信息" column={3} size="small" bordered>
          <Descriptions.Item label="样品编号">{mockSample.sampleNo}</Descriptions.Item>
          <Descriptions.Item label="样品名称">{mockSample.name}</Descriptions.Item>
          <Descriptions.Item label="样品类型">{mockSample.type}</Descriptions.Item>
          <Descriptions.Item label="客户">{mockSample.customer}</Descriptions.Item>
          <Descriptions.Item label="来源项目">{mockSample.project}</Descriptions.Item>
          <Descriptions.Item label="采样地点">{mockSample.location}</Descriptions.Item>
          <Descriptions.Item label="采样时间">{mockSample.samplingTime}</Descriptions.Item>
          <Descriptions.Item label="接收时间">{mockSample.receivingTime}</Descriptions.Item>
          <Descriptions.Item label="接收人">{mockSample.receiver}</Descriptions.Item>
          <Descriptions.Item label="容器信息">{mockSample.container}</Descriptions.Item>
          <Descriptions.Item label="保存条件">{mockSample.storage}</Descriptions.Item>
          <Descriptions.Item label="分配实验室">{mockSample.lab}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Tabs defaultActiveKey="items" items={[
        { key: 'items', label: '检测项目', children: (
          <Table dataSource={testItems} rowKey="item" pagination={false} columns={[
            { title: '检测项目', dataIndex: 'item' },
            { title: '检测方法', dataIndex: 'method' },
            { title: '结果', dataIndex: 'result' },
            { title: '单位', dataIndex: 'unit' },
            { title: '状态', dataIndex: 'status', render: (s: string) => {
              const m: Record<string, [string, string]> = { completed: ['green', '已完成'], testing: ['blue', '检测中'], pending: ['default', '待检测'] };
              return <Tag color={m[s][0]}>{m[s][1]}</Tag>;
            }},
          ]} size="small" />
        )},
        { key: 'flow', label: '流转记录', children: (
          <Timeline items={flowRecords.map(r => ({ color: 'green', children: <><Text strong>{r.action}</Text><br /><Text>{r.user}</Text><br /><Text type="secondary">{r.time} {r.desc}</Text></> }))} />
        )},
        { key: 'attachments', label: '附件', children: <Text type="secondary">暂无附件</Text> },
      ]} />
    </div>
  );
};
