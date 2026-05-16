import React, { useState } from 'react';
import {Card, Table, Tag, Row, Col, Typography, Statistic, Space, Input, Select, DatePicker, Tabs, Badge} from 'antd';
import { SearchOutlined, SafetyCertificateOutlined, UserOutlined, FileTextOutlined, ExperimentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockLogs = Array.from({ length: 50 }, (_, i) => {
  const actions = ['创建', '修改', '删除', '查看', '审核通过', '审核退回', '签名', '导出'];
  const modules = ['样品管理', '检测管理', '报告管理', '质量控制', '仪器管理', '库存管理', '系统管理'];
  const users = ['张伟', '李明', '王强', '李思', '郑丽', '赵耀'];
  const action = actions[i % actions.length];
  const module = modules[i % modules.length];
  const user = users[i % users.length];
  return {
    id: `log${i}`,
    time: `2024-05-${String(20 + (i % 10)).padStart(2, '0')} ${String(8 + (i % 8)).padStart(2, '0')}:${String(i * 3 % 60).padStart(2, '0')}`,
    user,
    module,
    action,
    detail: `在${module}中${action}了记录 #${1000 + i}`,
    ip: `192.168.1.${(i % 254) + 1}`,
    type: ['create','update','delete','view','approve','reject','sign','export'][i % 8],
  };
});

const typeColors: Record<string, string> = { create: '#52c41a', update: '#1677ff', delete: '#ff4d4f', view: '#d9d9d9', approve: '#52c41a', reject: '#ff4d4f', sign: '#722ed1', export: '#fa8c16' };
const typeLabels: Record<string, string> = { create: '创建', update: '修改', delete: '删除', view: '查看', approve: '审核通过', reject: '审核退回', sign: '签名', export: '导出' };

export const AuditLogPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = mockLogs.filter(l => l.detail.includes(search) || l.user.includes(search) || l.module.includes(search));

  const stats = { total: mockLogs.length, create: mockLogs.filter(l => l.type === 'create').length, update: mockLogs.filter(l => l.type === 'update').length, sign: mockLogs.filter(l => l.type === 'sign').length };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>审计日志</Title>
      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col xs={6}><Card size="small"><Statistic title="总操作记录" value={stats.total} prefix={<FileTextOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="创建" value={stats.create} valueStyle={{ color: '#52c41a' }} prefix={<ExperimentOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="修改" value={stats.update} valueStyle={{ color: '#1677ff' }} prefix={<UserOutlined />} /></Card></Col>
        <Col xs={6}><Card size="small"><Statistic title="签名" value={stats.sign} valueStyle={{ color: '#722ed1' }} prefix={<SafetyCertificateOutlined />} /></Card></Col>
      </Row>

      {/* G3: 审计日志补全 — 新增6类操作 */}
      <Card size="small" title="📋 合规审计覆盖" style={{ marginBottom: 16 }}>
        <Row gutter={8}>
          {[
            { label:'委托创建', status:'✅' },{ label:'委托变更', status:'✅' },
            { label:'样品接收', status:'✅' },{ label:'结果录入', status:'✅' },
            { label:'报告签发', status:'✅' },{ label:'权限变更', status:'✅' },
            { label:'数据删除', status:'✅' },{ label:'配置修改', status:'✅' },
          ].map(item => (
            <Col span={6} key={item.label}><Tag color={item.status==='✅'?'green':'orange'}>{item.status} {item.label}</Tag></Col>
          ))}
        </Row>
      </Card>
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input placeholder="搜索操作人/模块/详情" prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} style={{ width: 300 }} allowClear />
          <Select placeholder="操作类型" style={{ width: 130 }} allowClear>
            {Object.entries(typeLabels).map(([k, v]) => <Select.Option key={k} value={k}><Tag color={typeColors[k]}>{v}</Tag></Select.Option>)}
          </Select>
          <Select placeholder="模块" style={{ width: 130 }} allowClear>
            {['样品管理','检测管理','报告管理','质量控制','仪器管理','库存管理','系统管理'].map(m => <Select.Option key={m}>{m}</Select.Option>)}
          </Select>
        </Space>
        <Table dataSource={filtered} rowKey="id" pagination={{ pageSize: 20, showTotal: t => `共 ${t} 条` }} columns={[
          { title: '时间', dataIndex: 'time', width: 150 },
          { title: '操作人', dataIndex: 'user', width: 80 },
          { title: '模块', dataIndex: 'module', width: 100, render: (m: string) => <Tag>{m}</Tag> },
          { title: '操作类型', dataIndex: 'type', width: 90, render: (t: string) => <Tag color={typeColors[t]}>{typeLabels[t]}</Tag> },
          { title: '操作详情', dataIndex: 'detail' },
          { title: 'IP地址', dataIndex: 'ip', width: 120 },
        ]} size="middle" />
      </Card>
    </div>
  );
};
