import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Typography, Space, Tabs, Row, Col, Statistic,
  Modal, Descriptions, Badge, Input, Form, message, Divider, Timeline, Alert, Select,
} from 'antd';
import {
  ExperimentOutlined, SafetyOutlined, AlertOutlined, InboxOutlined,
  ShoppingCartOutlined, WarningOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const categoryColor: Record<string, string> = {
  regular: 'green', toxic_precursor: 'red', explosive_precursor: 'volcano',
  highly_toxic: 'magenta', flammable: 'orange', corrosive: 'purple', oxidizer: 'blue',
};
const categoryLabel: Record<string, string> = {
  regular: '常规', toxic_precursor: '易制毒', explosive_precursor: '易制爆',
  highly_toxic: '剧毒', flammable: '易燃', corrosive: '腐蚀', oxidizer: '氧化剂',
};

const mockReagents = [
  { id: 'rg1', name: '甲醇', casNo: '67-56-1', specification: 'AR, 500mL', purity: '99.9%', manufacturer: '国药集团', category: 'flammable', isHazardous: true, ghsSymbols: ['GHS02', 'GHS08'], storageLocation: 'A-01-01', storageConditions: '阴凉通风', quantity: 5, unit: 'L', threshold: 2, expiryDate: '2027-06-30', batchNo: '20250601A', status: 'in_stock', statusLabel: '在库' },
  { id: 'rg2', name: '乙腈', casNo: '75-05-8', specification: 'HPLC, 4L', purity: '99.9%', manufacturer: 'Sigma-Aldrich', category: 'flammable', isHazardous: true, ghsSymbols: ['GHS02', 'GHS07'], storageLocation: 'A-01-02', storageConditions: '阴凉通风', quantity: 2, unit: 'L', threshold: 2, expiryDate: '2027-03-15', batchNo: '20250310B', status: 'low_stock', statusLabel: '库存不足' },
  { id: 'rg3', name: '盐酸', casNo: '7647-01-0', specification: 'AR, 500mL', purity: '36-38%', manufacturer: '西陇科学', category: 'corrosive', isHazardous: true, ghsSymbols: ['GHS05'], storageLocation: 'B-02-01', storageConditions: '通风柜', quantity: 10, unit: 'L', threshold: 3, expiryDate: '2026-06-20', batchNo: '20240620C', status: 'expiring', statusLabel: '即将过期' },
  { id: 'rg4', name: '硝酸', casNo: '7697-37-2', specification: 'AR, 500mL', purity: '65-68%', manufacturer: '国药集团', category: 'oxidizer', isHazardous: true, ghsSymbols: ['GHS03', 'GHS05'], storageLocation: 'B-02-02', storageConditions: '通风柜', quantity: 3, unit: 'L', threshold: 2, expiryDate: '2027-01-10', batchNo: '20250110D', status: 'in_stock', statusLabel: '在库' },
  { id: 'rg5', name: '硫酸', casNo: '7664-93-9', specification: 'AR, 500mL', purity: '95-98%', manufacturer: '西陇科学', category: 'corrosive', isHazardous: true, ghsSymbols: ['GHS05'], storageLocation: 'B-02-03', storageConditions: '通风柜', quantity: 8, unit: 'L', threshold: 3, expiryDate: '2027-12-31', batchNo: '20251231E', status: 'in_stock', statusLabel: '在库' },
  { id: 'rg6', name: '丙酮', casNo: '67-64-1', specification: 'AR, 500mL', purity: '99.5%', manufacturer: '国药集团', category: 'flammable', isHazardous: true, ghsSymbols: ['GHS02'], storageLocation: 'A-01-03', storageConditions: '阴凉通风', quantity: 0, unit: 'L', threshold: 2, expiryDate: '2027-08-15', batchNo: '20250815F', status: 'empty', statusLabel: '已用完' },
  { id: 'rg7', name: '磷酸二氢钾', casNo: '7778-77-0', specification: 'GR, 500g', purity: '99.5%', manufacturer: '阿拉丁', category: 'regular', isHazardous: false, storageLocation: 'C-01-01', storageConditions: '常温干燥', quantity: 2, unit: 'kg', threshold: 1, expiryDate: '2028-01-01', batchNo: '20280101G', status: 'in_stock', statusLabel: '在库' },
  { id: 'rg8', name: '乙酸铅', casNo: '301-04-2', specification: 'AR, 500g', purity: '99.0%', manufacturer: '国药集团', category: 'toxic_precursor', isHazardous: true, ghsSymbols: ['GHS06', 'GHS08'], storageLocation: 'D-01-01', storageConditions: '双人双锁', quantity: 0.5, unit: 'kg', threshold: 0.2, expiryDate: '2027-09-30', batchNo: '20250930H', status: 'in_stock', statusLabel: '在库' },
];

const mockUsages = [
  { id: 'u1', reagentName: '甲醇', quantity: 0.5, unit: 'L', purpose: '水质COD检测', projectName: '水体污染物研究', applicantName: '张三', usedAt: '2026-05-15', status: 'approved' },
  { id: 'u2', reagentName: '乙酸铅', quantity: 0.05, unit: 'kg', purpose: '重金属检测', projectName: '土壤修复技术', applicantName: '李四', usedAt: '2026-05-14', status: 'approved' },
  { id: 'u3', reagentName: '盐酸', quantity: 0.2, unit: 'L', purpose: 'pH调节', projectName: '水质COD检测', applicantName: '张三', usedAt: '2026-05-13', status: 'pending' },
];

export const ReagentInventoryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedReagent, setSelectedReagent] = useState<any>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filteredReagents = mockReagents.filter(r => {
    const matchText = !searchText || r.name.includes(searchText) || r.casNo?.includes(searchText);
    const matchCat = catFilter === 'all' || r.category === catFilter;
    return matchText && matchCat;
  });

  const stats = {
    total: mockReagents.length,
    hazardous: mockReagents.filter(r => r.isHazardous).length,
    expiring: mockReagents.filter(r => r.status === 'expiring').length,
    lowStock: mockReagents.filter(r => r.status === 'low_stock').length,
    empty: mockReagents.filter(r => r.status === 'empty').length,
  };

  const alerts = mockReagents.filter(r => r.status === 'expiring' || r.status === 'low_stock');

  const columns = [
    { title: '名称', dataIndex: 'name', render: (v: string, r: any) => (
      <Space>
        {r.isHazardous && <WarningOutlined style={{ color: '#ff4d4f' }} />}
        <Text strong>{v}</Text>
      </Space>
    )},
    { title: 'CAS号', dataIndex: 'casNo', width: 120 },
    { title: '分类', dataIndex: 'category', render: (v: string) => <Tag color={categoryColor[v]}>{categoryLabel[v]}</Tag> },
    { title: '规格', dataIndex: 'specification', width: 140 },
    { title: '数量', render: (_: any, r: any) => `${r.quantity} ${r.unit}`, width: 80 },
    { title: '储存位置', dataIndex: 'storageLocation', width: 100 },
    { title: '有效期', dataIndex: 'expiryDate', width: 110, render: (v: string, r: any) => (
      <Text style={{ color: r.status === 'expiring' ? '#faad14' : undefined }}>{v}</Text>
    )},
    { title: '状态', dataIndex: 'status', render: (v: string) => (
      <Badge status={v === 'in_stock' ? 'success' : v === 'low_stock' ? 'warning' : v === 'expiring' ? 'warning' : 'error'} text={v === 'in_stock' ? '在库' : v === 'low_stock' ? '库存不足' : v === 'expiring' ? '即将过期' : '已用完'} />
    ), width: 100 },
    { title: '操作', width: 100, render: (_: any, r: any) => (
      <Button type="link" size="small" onClick={() => { setSelectedReagent(r); setDetailOpen(true); }}>详情</Button>
    )},
  ];

  const handleNew = () => {
    newForm.validateFields().then(values => {
      message.success(`试剂 ${values.name} 已登记入库`);
      setNewOpen(false);
      newForm.resetFields();
    });
  };

  const tabItems = [
    {
      key: 'overview',
      label: '库存总览',
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={4}><Card><Statistic title="总试剂数" value={stats.total} prefix={<ExperimentOutlined />} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Statistic title="危化品" value={stats.hazardous} valueStyle={{ color: '#ff4d4f' }} prefix={<SafetyOutlined />} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Statistic title="临期预警" value={stats.expiring} valueStyle={{ color: '#faad14' }} prefix={<AlertOutlined />} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Statistic title="低库存" value={stats.lowStock} valueStyle={{ color: '#faad14' }} prefix={<InboxOutlined />} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Statistic title="已用完" value={stats.empty} valueStyle={{ color: '#999' }} prefix={<ExperimentOutlined />} /></Card></Col>
            <Col xs={12} sm={8} md={4}><Card><Statistic title="本月领用" value={mockUsages.length} prefix={<ShoppingCartOutlined />} /></Card></Col>
          </Row>

          {alerts.length > 0 && (
            <Card title={<Space><AlertOutlined />库存预警</Space>} style={{ marginBottom: 24, borderLeft: '4px solid #faad14' }}>
              <Timeline items={alerts.map(r => ({
                color: r.status === 'expiring' ? 'orange' : 'red',
                children: (
                  <Text>
                    {r.status === 'expiring' ? `⏰ ${r.name} 即将过期（${r.expiryDate}）` : `📦 ${r.name} 库存不足（剩余${r.quantity}${r.unit}）`}
                  </Text>
                ),
              }))} />
            </Card>
          )}

          <Card title="试剂台账" extra={<Button type="primary" onClick={() => setNewOpen(true)}>新建试剂</Button>}>
            <Space style={{ marginBottom: 16 }}>
              <Input.Search placeholder="搜索名称/CAS号" value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 250 }} />
              <Select value={catFilter} onChange={setCatFilter} style={{ width: 120 }} options={[
                { value: 'all', label: '全部分类' },
                ...Object.keys(categoryLabel).map(k => ({ value: k, label: categoryLabel[k] })),
              ]} />
            </Space>
            <Table dataSource={filteredReagents} rowKey="id" columns={columns} pagination={false} size="middle" />
          </Card>
        </>
      ),
    },
    {
      key: 'usage',
      label: '领用记录',
      children: (
        <Card title="领用记录">
          <Table
            dataSource={mockUsages}
            rowKey="id"
            columns={[
              { title: '试剂名称', dataIndex: 'reagentName' },
              { title: '领用量', render: (_: any, r: any) => `${r.quantity} ${r.unit}`, width: 100 },
              { title: '用途', dataIndex: 'purpose' },
              { title: '关联项目', dataIndex: 'projectName' },
              { title: '领用人', dataIndex: 'applicantName', width: 100 },
              { title: '领用日期', dataIndex: 'usedAt', width: 110 },
              { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === 'approved' ? 'green' : 'orange'}>{v === 'approved' ? '已审批' : '待审批'}</Tag> },
            ]}
            pagination={false}
            size="middle"
          />
        </Card>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}><ExperimentOutlined /> 试剂耗材管理</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      {/* 试剂详情 */}
      <Modal title={selectedReagent?.name} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={560}>
        {selectedReagent && (
          <>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="名称" span={2}>{selectedReagent.name}</Descriptions.Item>
              <Descriptions.Item label="CAS号">{selectedReagent.casNo}</Descriptions.Item>
              <Descriptions.Item label="分类"><Tag color={categoryColor[selectedReagent.category]}>{categoryLabel[selectedReagent.category]}</Tag></Descriptions.Item>
              <Descriptions.Item label="规格">{selectedReagent.specification}</Descriptions.Item>
              <Descriptions.Item label="纯度">{selectedReagent.purity}</Descriptions.Item>
              <Descriptions.Item label="生产商">{selectedReagent.manufacturer}</Descriptions.Item>
              <Descriptions.Item label="储存位置">{selectedReagent.storageLocation}</Descriptions.Item>
              <Descriptions.Item label="储存条件">{selectedReagent.storageConditions}</Descriptions.Item>
              <Descriptions.Item label="数量">{selectedReagent.quantity} {selectedReagent.unit}</Descriptions.Item>
              <Descriptions.Item label="低库存阈值">{selectedReagent.threshold} {selectedReagent.unit}</Descriptions.Item>
              <Descriptions.Item label="有效期">{selectedReagent.expiryDate}</Descriptions.Item>
              <Descriptions.Item label="批次号">{selectedReagent.batchNo}</Descriptions.Item>
              <Descriptions.Item label="状态" span={2}>
                <Badge status={selectedReagent.status === 'in_stock' ? 'success' : selectedReagent.status === 'low_stock' ? 'warning' : 'error'} text={selectedReagent.statusLabel} />
              </Descriptions.Item>
            </Descriptions>
            {selectedReagent.isHazardous && (
              <>
                <Divider />
                <Alert type="warning" showIcon message="危险化学品" description={`该试剂属于${categoryLabel[selectedReagent.category]}，请严格按照安全规范操作。`} />
              </>
            )}
          </>
        )}
      </Modal>

      {/* 新建试剂 */}
      <Modal title="登记新试剂" open={newOpen} onCancel={() => setNewOpen(false)} onOk={handleNew} width={520}>
        <Form form={newForm} layout="vertical">
          <Form.Item name="name" label="试剂名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="casNo" label="CAS号"><Input /></Form.Item>
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select options={Object.keys(categoryLabel).map(k => ({ value: k, label: categoryLabel[k] }))} />
          </Form.Item>
          <Form.Item name="specification" label="规格"><Input placeholder="如：AR, 500mL" /></Form.Item>
          <Form.Item name="quantity" label="数量" rules={[{ required: true }]}><Input type="number" /></Form.Item>
          <Form.Item name="unit" label="单位"><Input placeholder="L / kg / g / mL" /></Form.Item>
          <Form.Item name="storageLocation" label="储存位置"><Input placeholder="如：A-01-01" /></Form.Item>
          <Form.Item name="expiryDate" label="有效期"><Input type="date" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
