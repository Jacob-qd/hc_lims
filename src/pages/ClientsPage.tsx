import React from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Select, Drawer, Descriptions, Tabs } from 'antd';
import { PlusOutlined, SearchOutlined, EyeOutlined, FileTextOutlined, ExperimentOutlined, TeamOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Title, Text } = Typography;

const clients = [
  { id: 'c1', name: '绿源环保科技有限公司', type: '企业', industry: '环保', contact: '王经理', phone: '138-0001-1234', status: 'active', samples: 248, credit: 'A' },
  { id: 'c2', name: '博克水务集团', type: '企业', industry: '水务', contact: '李主任', phone: '139-0002-5678', status: 'active', samples: 196, credit: 'A' },
  { id: 'c3', name: '清源化工有限公司', type: '企业', industry: '化工', contact: '赵总', phone: '137-0003-9012', status: 'active', samples: 128, credit: 'B' },
  { id: 'c4', name: '蓝天环境监测站', type: '政府', industry: '环保', contact: '刘站长', phone: '136-0004-3456', status: 'active', samples: 96, credit: 'A' },
  { id: 'c5', name: '宏达食品有限公司', type: '企业', industry: '食品', contact: '陈经理', phone: '135-0005-7890', status: 'pending', samples: 78, credit: 'B' },
  { id: 'c6', name: '新能科技有限公司', type: '企业', industry: '能源', contact: '周主管', phone: '134-0006-2345', status: 'active', samples: 65, credit: 'A' },
  { id: 'c7', name: '康源医药集团', type: '企业', industry: '医药', contact: '孙经理', phone: '133-0007-6789', status: 'suspended', samples: 54, credit: 'C' },
];

const typeColor: Record<string, string> = { 企业: '#1677ff', 政府: '#52c41a', 个人: '#d9d9d9' };
const statusColor: Record<string, string> = { active: '#52c41a', pending: '#faad14', suspended: '#ff4d4f' };
const statusLabel: Record<string, string> = { active: '合作中', pending: '暂停', suspended: '终止' };
const creditColor: Record<string, string> = { A: '#52c41a', B: '#faad14', C: '#ff4d4f' };

export const ClientsPage: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}>客户管理</Title></Col>
        <Col><Button type="primary" icon={<PlusOutlined />}>新增客户</Button></Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="客户总数" value={clients.length} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="活跃客户" value={clients.filter(c => c.status === 'active').length} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="本月新增" value={2} valueStyle={{ color: '#1677ff' }} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="即将到期合同" value={3} valueStyle={{ color: '#faad14' }} /></Card></Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索客户名称" prefix={<SearchOutlined />} style={{ width: 200 }} allowClear />
          <Select placeholder="客户类型" style={{ width: 120 }} allowClear>
            {['企业', '政府', '个人'].map(t => <Select.Option key={t}>{t}</Select.Option>)}
          </Select>
          <Select placeholder="合作状态" style={{ width: 120 }} allowClear>
            {['active', 'pending', 'suspended'].map(s => <Select.Option key={s}>{statusLabel[s]}</Select.Option>)}
          </Select>
        </Space>
        <Table dataSource={clients} rowKey="id" columns={[
          { title: '客户编号', dataIndex: 'id', key: 'id', render: (id: string) => <Text code>{id.toUpperCase()}</Text> },
          { title: '客户名称', dataIndex: 'name', key: 'name', render: (name: string, r: any) => <a onClick={() => { setSelected(r); setDrawerVisible(true); }}>{name}</a> },
          { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={typeColor[t]}>{t}</Tag> },
          { title: '行业', dataIndex: 'industry', key: 'industry' },
          { title: '联系人', dataIndex: 'contact', key: 'contact' },
          { title: '联系电话', dataIndex: 'phone', key: 'phone' },
          { title: '合作状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={statusColor[s]}>{statusLabel[s]}</Tag> },
          { title: '累计样品', dataIndex: 'samples', key: 'samples' },
          { title: '信用等级', dataIndex: 'credit', key: 'credit', render: (c: string) => <Tag color={creditColor[c]}>{c}</Tag> },
          { title: '操作', key: 'action', render: (_: any, r: any) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelected(r); setDrawerVisible(true); }}>查看</Button> },
        ]} pagination={{ pageSize: 10 }} size="middle" />
      </Card>

      <Drawer title={selected?.name} open={drawerVisible} onClose={() => { setDrawerVisible(false); setSelected(null); }} width={400}>
        {selected && (
          <>
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="客户名称">{selected.name}</Descriptions.Item>
            <Descriptions.Item label="类型"><Tag color={typeColor[selected.type]}>{selected.type}</Tag></Descriptions.Item>
            <Descriptions.Item label="行业">{selected.industry}</Descriptions.Item>
            <Descriptions.Item label="联系人">{selected.contact}</Descriptions.Item>
            <Descriptions.Item label="电话">{selected.phone}</Descriptions.Item>
            <Descriptions.Item label="合作状态"><Tag color={statusColor[selected.status]}>{statusLabel[selected.status]}</Tag></Descriptions.Item>
            <Descriptions.Item label="信用等级"><Tag color={creditColor[selected.credit]}>{selected.credit}</Tag></Descriptions.Item>
            <Descriptions.Item label="累计样品">{selected.samples}</Descriptions.Item>
          </Descriptions>
          <Tabs style={{marginTop:16}} items={[
            {key:'projects', label:<span><ExperimentOutlined /> 委托项目</span>, children:<Table dataSource={[{no:'PROJ-2025-001',name:'地表水监测',amount:'¥150,000',status:'进行中'}]} rowKey="no" pagination={false} size="small" columns={[{title:'项目编号',dataIndex:'no'},{title:'名称',dataIndex:'name'},{title:'金额',dataIndex:'amount'},{title:'状态',dataIndex:'status',render:(s:string)=> <Tag color="green">{s}</Tag>}]} />},
            {key:'samples', label:<span><FileTextOutlined /> 历史样品</span>, children:<Table dataSource={[{no:'SMP20240521001',name:'地表水样品',date:'2024-05-21',status:'检测中'}]} rowKey="no" pagination={false} size="small" columns={[{title:'编号',dataIndex:'no'},{title:'名称',dataIndex:'name'},{title:'日期',dataIndex:'date'},{title:'状态',dataIndex:'status'}]} />},
            {key:'reports', label:<span><TeamOutlined /> 历史报告</span>, children:<Text type="secondary">暂无报告记录</Text>},
          ]} />
          </>
        )}
      </Drawer>
    </div>
  );
};
