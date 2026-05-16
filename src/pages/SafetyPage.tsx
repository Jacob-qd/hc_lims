import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tabs, message, Modal, Form, Badge } from 'antd';
import { PlusOutlined, SearchOutlined, WarningOutlined, SafetyOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const dangerColors: Record<string, string> = { 剧毒: '#ff4d4f', 易燃: '#fa8c16', 腐蚀: '#1677ff', 氧化: '#faad14', 一般: '#d9d9d9' };

export const SafetyPage: React.FC = () => {
  const [chemicals, setChemicals] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [inModal, setInModal] = useState(false);

  useEffect(() => {
    fetch('/api/v1/research/chemicals').then(r => r.json()).then(d => { setChemicals(d.data.list); setLoading(false); });
  }, []);

  const filtered = chemicals.filter((c: any) => c.name.includes(search) || c.cas?.includes(search));
  const stats = { total: chemicals.length, warning: chemicals.filter((c: any) => c.status === 'warning').length, normal: chemicals.filter((c: any) => c.status === 'normal').length };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>安全与废弃物管理</Title>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={8}><Card size="small"><Statistic title="化学品总数" value={stats.total} prefix={<WarningOutlined />} /></Card></Col>
        <Col xs={8}><Card size="small"><Statistic title="存量预警" value={stats.warning} valueStyle={{ color: '#faad14' }} prefix={<WarningOutlined />} /></Card></Col>
        <Col xs={8}><Card size="small"><Statistic title="待处理废弃物" value={2} valueStyle={{ color: '#ff4d4f' }} prefix={<DeleteOutlined />} /></Card></Col>
      </Row>
      <Tabs defaultActiveKey="chemicals" items={[
        { key: 'chemicals', label: '危化品台账', children: (
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Input placeholder="搜索名称/CAS号" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setInModal(true)}>新增化学品</Button>
            </Space>
            <Table dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
              { title: '名称', dataIndex: 'name' },
              { title: 'CAS号', dataIndex: 'cas' },
              { title: '分类', dataIndex: 'category', render: (c: string) => <Tag color={dangerColors[c]}>{c}</Tag> },
              { title: '存量', dataIndex: 'stock' },
              { title: '存放位置', dataIndex: 'location' },
              { title: '责任人', dataIndex: 'responsible' },
              { title: 'MSDS', dataIndex: 'msds', render: (m: string) => m === '有' ? <Tag color="green">有</Tag> : <Tag color="red">无</Tag> },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'normal' ? 'success' : 'warning'} text={s === 'normal' ? '正常' : '预警'} /> },
            ]} size="middle" />
          </Card>
        )},
        { key: 'safety', label: '安全检查', children: (
          <Card title="日检清单 (2024-05-21)">
            {['通风系统运行正常', '危化品柜双人双锁', '紧急喷淋装置正常', '灭火器压力正常', '废弃物暂存区标识清晰', '气体钢瓶固定牢固'].map((item, i) => (
              <Card key={i} size="small" style={{ marginBottom: 4 }}>
                <Row justify="space-between"><Col><SafetyOutlined style={{ color: '#52c41a', marginRight: 8 }} />{item}</Col><Col><Tag color="green">✅ 符合</Tag></Col></Row>
              </Card>
            ))}
          </Card>
        )},
        { key: 'waste', label: '废弃物管理', children: (
          <Card>
            <Table dataSource={[
              { id: 'w1', type: '有机废液', source: 'COD检测', amount: '5L', location: '废液桶A', status: 'temporary', date: '2024-05-20' },
              { id: 'w2', type: '重金属废液', source: '原子吸收检测', amount: '3L', location: '废液桶B', status: 'temporary', date: '2024-05-19' },
              { id: 'w3', type: '废弃试剂瓶', source: '日常消耗', amount: '2箱', location: '固废暂存区', status: 'pending', date: '2024-05-18' },
            ]} rowKey="id" pagination={false} columns={[
              { title: '废弃物类型', dataIndex: 'type' },
              { title: '来源实验', dataIndex: 'source' },
              { title: '数量', dataIndex: 'amount' },
              { title: '暂存位置', dataIndex: 'location' },
              { title: '产生日期', dataIndex: 'date' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'temporary' ? 'orange' : 'default'}>{s === 'temporary' ? '暂存中' : '待转运'}</Tag> },
            ]} size="middle" />
          </Card>
        )},
      ]} />

      <Modal title="新增化学品" open={inModal} onCancel={() => setInModal(false)} footer={null}>
        <Form layout="vertical" onFinish={(v) => { message.success('添加成功'); setInModal(false); }}>
          <Form.Item name="name" label="化学品名称" required><Input /></Form.Item>
          <Form.Item name="cas" label="CAS号"><Input /></Form.Item>
          <Form.Item name="category" label="危险分类"><Input /></Form.Item>
          <Form.Item name="stock" label="存量"><Input /></Form.Item>
          <Form.Item name="location" label="存放位置"><Input /></Form.Item>
          <Button type="primary" block htmlType="submit">确认添加</Button>
        </Form>
      </Modal>
    </div>
  );
};
