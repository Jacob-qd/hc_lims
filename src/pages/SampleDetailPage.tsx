import React from 'react';
import { Card, Descriptions, Tag, Tabs, Timeline, Table, Button, Row, Col, Typography, Steps, Modal, message, Form, Input, Select, InputNumber } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, InboxOutlined } from '@ant-design/icons';
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
  useParams();
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
        { key: 'subsamples', label: '子样品', children: (
          <div>
            <Button size="small" type="primary" icon={<PlusOutlined />} style={{ marginBottom: 12 }} onClick={() => {
              Modal.confirm({
                title: '创建子样品',
                content: '从当前样品中分出部分样品量，创建独立子样品？',
                onOk: () => message.success('子样品 S-SUB-001 创建成功'),
              });
            }}>新建子样品</Button>
            <Table dataSource={[
              { id: 'sub1', name: '子样品-1', amount: '200mL', status: '检测中', createdDate: '2026-05-15' },
              { id: 'sub2', name: '子样品-2', amount: '150mL', status: '待检测', createdDate: '2026-05-15' },
            ]} rowKey="id" pagination={false} size="small" columns={[
              { title: '子样品编号', dataIndex: 'id' },
              { title: '名称', dataIndex: 'name' },
              { title: '分样量', dataIndex: 'amount' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag>{s}</Tag> },
              { title: '创建时间', dataIndex: 'createdDate' },
              { title: '操作', render: () => <Button type="link" size="small">查看</Button> },
            ]} />
          </div>
        )},
        { key: 'retention', label: '留样管理', children: (
          <div>
            <Button size="small" type="primary" icon={<InboxOutlined />} style={{ marginBottom: 12 }} onClick={() => Modal.confirm({
              title: '登记留样', content: (
                <Form layout="vertical">
                  <Form.Item label="留样量"><Input placeholder="如 200mL" /></Form.Item>
                  <Form.Item label="保存条件"><Select style={{width:'100%'}}><Select.Option value="4C">4°C冷藏</Select.Option><Select.Option value="-20C">-20°C冷冻</Select.Option><Select.Option value="ambient">常温</Select.Option></Select></Form.Item>
                  <Form.Item label="保留期限(天)"><InputNumber min={1} max={365} defaultValue={30} style={{width:'100%'}} /></Form.Item>
                </Form>
              ), onOk: () => message.success('留样登记成功'),
            })}>登记留样</Button>
            <Table dataSource={[
              { batch:'RY-2026-001', amount:'200mL', condition:'4°C冷藏', expiry:'2026-06-15', daysLeft:31, status:'正常' },
              { batch:'RY-2026-002', amount:'150mL', condition:'-20°C冷冻', expiry:'2026-05-20', daysLeft:5, status:'即将到期' },
            ]} rowKey="batch" pagination={false} size="small" columns={[
              {title:'留样批号',dataIndex:'batch'},{title:'留样量',dataIndex:'amount'},{title:'保存条件',dataIndex:'condition'},
              {title:'到期日期',dataIndex:'expiry'},{title:'剩余天数',dataIndex:'daysLeft',render:(v:number)=>{
                const c = v <= 7 ? '#ff4d4f' : v <= 14 ? '#faad14' : '#52c41a';
                return <span style={{color:c,fontWeight:600}}>{v}天</span>;
              }},{title:'状态',dataIndex:'status',render:(s:string)=><Tag color={s==='正常'?'green':'orange'}>{s}</Tag>},
              {title:'操作',render:()=><Button size="small" onClick={()=>message.success('留样已处置')}>处置</Button>},
            ]} />
          </div>
        )},
        { key: 'attachments', label: '附件', children: <Text type="secondary">暂无附件</Text> },
        { key: 'coc', label: 'COC监管链', children: (
          <div>
            <Button size="small" type="primary" style={{ marginBottom: 12 }} onClick={() => navigate('/coc')}>
              查看完整COC
            </Button>
            <Card title="COC 事件时间线" size="small">
              <Timeline items={[
                { color: 'blue', children: <><Text strong>采样</Text><br /><Text>采样员 刘强</Text><br /><Text type="secondary">2024-05-20 09:30 现场采样完成</Text></> },
                { color: 'purple', children: <><Text strong>送样</Text><br /><Text>采样员 刘强</Text><br /><Text type="secondary">2024-05-20 10:00 冷链专送</Text></> },
                { color: 'cyan', children: <><Text strong>收样</Text><br /><Text>张伟</Text><br /><Text type="secondary">2024-05-20 10:45 样品完好,温度4°C</Text></> },
                { color: 'green', children: <><Text strong>登记</Text><br /><Text>张伟</Text><br /><Text type="secondary">2024-05-20 11:00 编号SMP20240520001</Text></> },
                { color: 'orange', children: <><Text strong>检测</Text><br /><Text>王明</Text><br /><Text type="secondary">2024-05-21 09:00 COD检测中</Text></> },
              ]} />
            </Card>
            <Card title="COC 完整性" size="small" style={{ marginTop: 12 }}>
              <Tag color="green">✅ 链完整</Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>当前状态: 流转中</Text>
            </Card>
          </div>
        )},
      ]} />
    </div>
  );
};
