import React from 'react';
import { Card, Table, Tag, Row, Col, Typography, Badge, Space, Tabs, Progress } from 'antd';
// import { CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const scheduleData = [
  { time: '08:00-10:00', instrument: '液相色谱仪', task: 'TK-2025-001 pH值检测', analyst: '张伟', lab: '色谱室101', progress: 100 },
  { time: '08:30-11:00', instrument: '气相色谱仪', task: 'TK-2025-003 氨氮检测', analyst: '李明', lab: '色谱室202', progress: 45 },
  { time: '09:00-12:00', instrument: '原子吸收光谱仪', task: 'TK-2025-004 重金属(Pb)检测', analyst: '郑丽', lab: '光谱室201', progress: 70 },
  { time: '10:00-12:30', instrument: '紫外分光光度计', task: 'TK-2025-002 COD检测', analyst: '王明', lab: '光谱室203', progress: 65 },
  { time: '14:00-17:00', instrument: 'ICP-MS质谱仪', task: '维护中', analyst: '-', lab: '质谱室301', progress: 0 },
];

const weeklyData = [
  { date: '05-19(一)', instruments: [
    { name: '液相色谱仪', morning: 'TK-001 pH值', afternoon: 'TK-002 COD', status: 'running' },
    { name: '气相色谱仪', morning: '空闲', afternoon: 'TK-003 氨氮', status: 'idle' },
    { name: '原子吸收', morning: 'TK-004 重金属', afternoon: 'TK-006 Cd', status: 'running' },
  ]},
  { date: '05-20(二)', instruments: [
    { name: '液相色谱仪', morning: 'TK-002 COD', afternoon: '空闲', status: 'idle' },
    { name: '气相色谱仪', morning: 'TK-003 氨氮', afternoon: '维护', status: 'maintenance' },
    { name: '原子吸收', morning: 'TK-004 重金属', afternoon: 'TK-006 Cd', status: 'running' },
  ]},
];

export const SchedulesPage: React.FC = () => {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>排期管理</Title>

      <Tabs defaultActiveKey="daily" items={[
        { key: 'daily', label: '今日排期', children: (
          <Card>
            <Table dataSource={scheduleData} rowKey="time" pagination={false} columns={[
              { title: '时间', dataIndex: 'time' },
              { title: '仪器', dataIndex: 'instrument', render: (v: string) => <Text strong>{v}</Text> },
              { title: '任务', dataIndex: 'task' },
              { title: '分析员', dataIndex: 'analyst' },
              { title: '实验室', dataIndex: 'lab' },
              { title: '进度', dataIndex: 'progress', render: (p: number) => p > 0 ? <Progress percent={p} size="small" /> : <Tag color="orange">维护中</Tag> },
            ]} size="middle" />
          </Card>
        )},
        { key: 'weekly', label: '周视图', children: (
          <Row gutter={16}>
            {weeklyData.map(day => (
              <Col span={12} key={day.date} style={{ marginBottom: 16 }}>
                <Card title={day.date} size="small">
                  {day.instruments.map(inst => (
                    <Card key={inst.name} size="small" style={{ marginBottom: 8 }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space><Badge status={inst.status === 'running' ? 'processing' : inst.status === 'maintenance' ? 'warning' : 'default'} /><Text strong>{inst.name}</Text></Space>
                        <Text type="secondary">上午: {inst.morning}</Text>
                        <Text type="secondary">下午: {inst.afternoon}</Text>
                      </Space>
                    </Card>
                  ))}
                </Card>
              </Col>
            ))}
          </Row>
        )},
      ]} />
    </div>
  );
};
