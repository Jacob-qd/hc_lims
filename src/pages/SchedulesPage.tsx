import React, { useState } from 'react';
import {Card, Table, Tag, Row, Col, Typography, Badge, Space, Tabs, Progress, Button, Modal, Form, Input, Select} from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const SchedulesPage: React.FC = () => {
  const [scheduleData, setScheduleData] = useState([
    { time: '08:00-10:00', instrument: '液相色谱仪', task: 'TK-2025-001 pH值检测', analyst: '张伟', lab: '色谱室101', progress: 100 },
    { time: '08:30-11:00', instrument: '气相色谱仪', task: 'TK-2025-003 氨氮检测', analyst: '李明', lab: '色谱室202', progress: 45 },
    { time: '09:00-12:00', instrument: '原子吸收光谱仪', task: 'TK-2025-004 重金属(Pb)检测', analyst: '郑丽', lab: '光谱室201', progress: 70 },
    { time: '10:00-12:30', instrument: '紫外分光光度计', task: 'TK-2025-002 COD检测', analyst: '王明', lab: '光谱室203', progress: 65 },
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}>排期管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalVisible(true); }}>新增排期</Button></Col>
      </Row>

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
              { title: '操作', render: (_: any, r: any) => <Space size="small"><Button type="link" size="small">编辑</Button><Button type="link" size="small" danger onClick={() => { setScheduleData(prev => prev.filter(s => s.time !== r.time)); message.success('已删除'); }}>删除</Button></Space> },
            ]} size="middle" />
          </Card>
        )},
        { key: 'weekly', label: '周视图', children: (
          <div>
            {/* P2-4: 预约冲突检测 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Space><Badge status="error" /><Text>冲突检测:</Text>
              <Tag color="red">GC-MS 周二下午 设备维护中，无法预约</Tag>
              <Button size="small" type="link">查看详情</Button></Space>
            </Card>
            <Row gutter={16}>
            {weeklyData.map(function(day) {
              var items = [];
              for (var i = 0; i < day.instruments.length; i++) {
                var inst = day.instruments[i];
                items.push(React.createElement(Card, {key:inst.name,size:'small',style:{marginBottom:8}},
                  React.createElement(Space,{direction:'vertical',style:{width:'100%'}},
                    React.createElement(Space,null,
                      React.createElement(Badge,{status:inst.status==='running'?'processing':inst.status==='maintenance'?'warning':'default'}),
                      React.createElement(Text,{strong:true},inst.name)
                    ),
                    React.createElement(Text,{type:'secondary'},'上午: '+inst.morning),
                    React.createElement(Text,{type:'secondary'},'下午: '+inst.afternoon)
                  )
                ));
              }
              return React.createElement(Col,{span:12,key:day.date,style:{marginBottom:16}},
                React.createElement(Card,{title:day.date,size:'small'},React.createElement(React.Fragment,null,...items))
              );
            })}
          </Row>
        )},
      ]} />

      <Modal title="新增排期" open={modalVisible} onOk={() => form.submit()} onCancel={() => { setModalVisible(false); form.resetFields(); }}>
        <Form form={form} layout="vertical" onFinish={(v) => {
          setScheduleData(prev => [...prev, { time: v.startTime + '-' + v.endTime, instrument: v.instrument, task: v.task, analyst: v.analyst, lab: v.lab, progress: 0 }]);
          message.success('排期创建成功'); setModalVisible(false); form.resetFields();
        }}>
          <Form.Item name="task" label="任务编号/描述" rules={[{ required: true }]}><Input placeholder="TK-2025-001 pH值检测" /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="instrument" label="仪器" required><Select>{['液相色谱仪','气相色谱仪','原子吸收光谱仪','紫外分光光度计','ICP-MS质谱仪'].map(i=><Select.Option key={i}>{i}</Select.Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="analyst" label="分析员"><Input /></Form.Item></Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="startTime" label="开始时间" required><Select>{['08:00','08:30','09:00','10:00','14:00','16:00'].map(t=><Select.Option key={t}>{t}</Select.Option>)}</Select></Form.Item></Col>
            <Col span={12}><Form.Item name="endTime" label="结束时间" required><Select>{['10:00','11:00','12:00','12:30','17:00','18:00'].map(t=><Select.Option key={t}>{t}</Select.Option>)}</Select></Form.Item></Col>
          </Row>
          <Form.Item name="lab" label="实验室"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
