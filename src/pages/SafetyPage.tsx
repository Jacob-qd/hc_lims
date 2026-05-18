import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Input, Tabs, message, Modal, Form, Badge, Popconfirm, DatePicker, Select } from 'antd';
import { PlusOutlined, SearchOutlined, WarningOutlined, SafetyOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;
const dangerColors: Record<string, string> = { 剧毒: '#ff4d4f', 易燃: '#fa8c16', 腐蚀: '#1677ff', 氧化: '#faad14', 一般: '#d9d9d9' };

interface Chemical { id: string; name: string; cas: string; category: string; stock: string; location: string; responsible: string; msds: string; status: string; }
interface CheckItem { id: string; item: string; status: 'pass' | 'fail' | 'pending'; date: string; inspector: string; }
interface WasteItem { id: string; type: string; source: string; amount: string; location: string; status: string; date: string; }

export const SafetyPage: React.FC = () => {
  const [chemicals, setChemicals] = useState<Chemical[]>([]);
  const [checkItems, setCheckItems] = useState<CheckItem[]>([
    { id: 'c1', item: '通风系统运行正常', status: 'pass', date: '2024-05-21', inspector: '张伟' },
    { id: 'c2', item: '危化品柜双人双锁', status: 'pass', date: '2024-05-21', inspector: '张伟' },
    { id: 'c3', item: '紧急喷淋装置正常', status: 'pass', date: '2024-05-21', inspector: '张伟' },
    { id: 'c4', item: '灭火器压力正常', status: 'pass', date: '2024-05-21', inspector: '张伟' },
    { id: 'c5', item: '废弃物暂存区标识清晰', status: 'pass', date: '2024-05-21', inspector: '张伟' },
    { id: 'c6', item: '气体钢瓶固定牢固', status: 'fail', date: '2024-05-21', inspector: '张伟' },
  ]);
  const [wasteItems, setWasteItems] = useState<WasteItem[]>([
    { id: 'w1', type: '有机废液', source: 'COD检测', amount: '5L', location: '废液桶A', status: 'temporary', date: '2024-05-20' },
    { id: 'w2', type: '重金属废液', source: '原子吸收检测', amount: '3L', location: '废液桶B', status: 'temporary', date: '2024-05-19' },
    { id: 'w3', type: '废弃试剂瓶', source: '日常消耗', amount: '2箱', location: '固废暂存区', status: 'pending', date: '2024-05-18' },
  ]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [chemModalOpen, setChemModalOpen] = useState(false);
  const [checkModalOpen, setCheckModalOpen] = useState(false);
  const [wasteModalOpen, setWasteModalOpen] = useState(false);
  const [chemForm] = Form.useForm();
  const [checkForm] = Form.useForm();
  const [wasteForm] = Form.useForm();

  useEffect(() => {
    fetch('/api/v1/research/chemicals').then(r => r.json()).then(d => { setChemicals(d.data.list); setLoading(false); });
  }, []);

  const filtered = chemicals.filter((c: Chemical) => c.name.includes(search) || c.cas?.includes(search));
  const stats = { total: chemicals.length, warning: chemicals.filter((c: Chemical) => c.status === 'warning').length, normal: chemicals.filter((c: Chemical) => c.status === 'normal').length };

  const addChemical = (values: any) => {
    const newC: Chemical = { id: `ch-${Date.now()}`, ...values, status: 'normal' };
    setChemicals([...chemicals, newC]);
    message.success('化学品已添加');
    setChemModalOpen(false);
    chemForm.resetFields();
  };

  const deleteChemical = (id: string) => {
    setChemicals(chemicals.filter(c => c.id !== id));
    message.success('已删除');
  };

  const addCheckItem = (values: any) => {
    const newItem: CheckItem = { id: `ck-${Date.now()}`, ...values };
    setCheckItems([...checkItems, newItem]);
    message.success('检查项已添加');
    setCheckModalOpen(false);
    checkForm.resetFields();
  };

  const toggleCheckStatus = (id: string) => {
    setCheckItems(prev => prev.map(c => {
      if (c.id !== id) return c;
      const next = c.status === 'pass' ? 'fail' : c.status === 'fail' ? 'pending' : 'pass';
      return { ...c, status: next };
    }));
  };

  const deleteCheckItem = (id: string) => {
    setCheckItems(checkItems.filter(c => c.id !== id));
    message.success('已删除');
  };

  const addWaste = (values: any) => {
    const newW: WasteItem = { id: `w-${Date.now()}`, ...values };
    setWasteItems([...wasteItems, newW]);
    message.success('废弃物记录已添加');
    setWasteModalOpen(false);
    wasteForm.resetFields();
  };

  const deleteWaste = (id: string) => {
    setWasteItems(wasteItems.filter(w => w.id !== id));
    message.success('已删除');
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>安全与废弃物管理</Title>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={8}><Card size="small"><Statistic title="化学品总数" value={stats.total} prefix={<WarningOutlined />} /></Card></Col>
        <Col xs={8}><Card size="small"><Statistic title="存量预警" value={stats.warning} valueStyle={{ color: '#faad14' }} prefix={<WarningOutlined />} /></Card></Col>
        <Col xs={8}><Card size="small"><Statistic title="待处理废弃物" value={wasteItems.filter(w => w.status === 'temporary' || w.status === 'pending').length} valueStyle={{ color: '#ff4d4f' }} prefix={<DeleteOutlined />} /></Card></Col>
      </Row>
      <Tabs defaultActiveKey="chemicals" items={[
        { key: 'chemicals', label: '危化品台账', children: (
          <Card>
            <Space style={{ marginBottom: 16 }}>
              <Input placeholder="搜索名称/CAS号" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 260 }} allowClear />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setChemModalOpen(true)}>新增化学品</Button>
            </Space>
            <Table dataSource={filtered} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} columns={[
              { title: '名称', dataIndex: 'name' },
              { title: 'CAS号', dataIndex: 'cas' },
              { title: '分类', dataIndex: 'category', render: (c: string) => <Tag color={dangerColors[c] || '#d9d9d9'}>{c}</Tag> },
              { title: '存量', dataIndex: 'stock' },
              { title: '存放位置', dataIndex: 'location' },
              { title: '责任人', dataIndex: 'responsible' },
              { title: 'MSDS', dataIndex: 'msds', render: (m: string) => m === '有' ? <Tag color="green">有</Tag> : <Tag color="red">无</Tag> },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'normal' ? 'success' : 'warning'} text={s === 'normal' ? '正常' : '预警'} /> },
              { title: '操作', render: (_: any, r: Chemical) => (
                <Popconfirm title="确认删除？" onConfirm={() => deleteChemical(r.id)}>
                  <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              )},
            ]} size="middle" />
          </Card>
        )},
        { key: 'safety', label: '安全检查', children: (
          <Card title={`日检清单 (${new Date().toISOString().slice(0,10)})`} extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setCheckModalOpen(true)}>新增检查项</Button>}>
            <Table dataSource={checkItems} rowKey="id" pagination={false} size="middle" columns={[
              { title: '检查项', dataIndex: 'item', render: (v: string, r: CheckItem) => (
                <span><SafetyOutlined style={{ color: r.status === 'pass' ? '#52c41a' : r.status === 'fail' ? '#ff4d4f' : '#faad14', marginRight: 8 }} />{v}</span>
              )},
              { title: '检查人', dataIndex: 'inspector', width: 100 },
              { title: '日期', dataIndex: 'date', width: 120 },
              { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => (
                <Tag color={s === 'pass' ? 'green' : s === 'fail' ? 'red' : 'orange'}>{s === 'pass' ? '✅ 符合' : s === 'fail' ? '❌ 不符合' : '⏳ 待检'}</Tag>
              )},
              { title: '操作', width: 120, render: (_: any, r: CheckItem) => (
                <Space>
                  <Button type="link" size="small" onClick={() => toggleCheckStatus(r.id)}>切换状态</Button>
                  <Popconfirm title="确认删除？" onConfirm={() => deleteCheckItem(r.id)}>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )},
            ]} />
          </Card>
        )},
        { key: 'waste', label: '废弃物管理', children: (
          <Card extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setWasteModalOpen(true)}>新增废弃物</Button>}>
            <Table dataSource={wasteItems} rowKey="id" pagination={false} columns={[
              { title: '废弃物类型', dataIndex: 'type' },
              { title: '来源实验', dataIndex: 'source' },
              { title: '数量', dataIndex: 'amount' },
              { title: '暂存位置', dataIndex: 'location' },
              { title: '产生日期', dataIndex: 'date' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'temporary' ? 'orange' : s === 'pending' ? 'blue' : 'green'}>{s === 'temporary' ? '暂存中' : s === 'pending' ? '待转运' : '已处置'}</Tag> },
              { title: '操作', render: (_: any, r: WasteItem) => (
                <Space>
                  <Button type="link" size="small" onClick={() => { setWasteItems(wasteItems.map(w => w.id === r.id ? { ...w, status: w.status === 'temporary' ? 'pending' : w.status === 'pending' ? 'disposed' : 'temporary' } : w)); }}>推进状态</Button>
                  <Popconfirm title="确认删除？" onConfirm={() => deleteWaste(r.id)}>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              )},
            ]} size="middle" />
          </Card>
        )},
      ]} />

      {/* 新增化学品 Modal */}
      <Modal title="新增化学品" open={chemModalOpen} onCancel={() => setChemModalOpen(false)} onOk={() => chemForm.submit()} destroyOnClose>
        <Form form={chemForm} layout="vertical" onFinish={addChemical}>
          <Form.Item name="name" label="化学品名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="cas" label="CAS号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="category" label="危险分类" rules={[{ required: true }]}><Input placeholder="如：腐蚀品/易燃品/氧化剂/剧毒" /></Form.Item>
          <Form.Item name="stock" label="存量" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="location" label="存放位置" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="responsible" label="责任人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="msds" label="MSDS" initialValue="有">
            <Select><Select.Option value="有">有</Select.Option><Select.Option value="无">无</Select.Option></Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增检查项 Modal */}
      <Modal title="新增安全检查项" open={checkModalOpen} onCancel={() => setCheckModalOpen(false)} onOk={() => checkForm.submit()} destroyOnClose>
        <Form form={checkForm} layout="vertical" onFinish={addCheckItem}>
          <Form.Item name="item" label="检查项内容" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="inspector" label="检查人" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="date" label="检查日期" rules={[{ required: true }]}><Input placeholder="YYYY-MM-DD" /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="pending">
            <Select><Select.Option value="pass">符合</Select.Option><Select.Option value="fail">不符合</Select.Option><Select.Option value="pending">待检</Select.Option></Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 新增废弃物 Modal */}
      <Modal title="新增废弃物记录" open={wasteModalOpen} onCancel={() => setWasteModalOpen(false)} onOk={() => wasteForm.submit()} destroyOnClose>
        <Form form={wasteForm} layout="vertical" onFinish={addWaste}>
          <Form.Item name="type" label="废弃物类型" rules={[{ required: true }]}><Input placeholder="如：有机废液/重金属废液/废弃试剂瓶" /></Form.Item>
          <Form.Item name="source" label="来源实验" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="amount" label="数量" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="location" label="暂存位置" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="date" label="产生日期" rules={[{ required: true }]}><Input placeholder="YYYY-MM-DD" /></Form.Item>
          <Form.Item name="status" label="状态" initialValue="temporary">
            <Select><Select.Option value="temporary">暂存中</Select.Option><Select.Option value="pending">待转运</Select.Option><Select.Option value="disposed">已处置</Select.Option></Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
