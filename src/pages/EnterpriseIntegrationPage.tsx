import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Badge, Descriptions, Modal, Form, Input, Select, message, Switch } from 'antd';
import { ApiOutlined, LinkOutlined, SettingOutlined, CheckCircleOutlined, SyncOutlined, CloudServerOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockIntegrations = [
  { id: 'int1', name: '企业微信', type: '即时通讯', status: 'connected', lastSync: '2024-05-15 14:30', direction: '双向', description: '消息推送、审批通知、待办提醒' },
  { id: 'int2', name: '用友 U8+', type: 'ERP', status: 'connected', lastSync: '2024-05-15 12:00', direction: '单向(出)', description: '检测费用同步、客户信息同步' },
  { id: 'int3', name: '金蝶 K/3', type: 'ERP', status: 'disconnected', lastSync: '2024-05-10 08:00', direction: '双向', description: '库存物料同步、采购订单同步' },
  { id: 'int4', name: '钉钉', type: 'OA', status: 'connected', lastSync: '2024-05-15 14:00', direction: '双向', description: '审批流程、考勤数据、公告同步' },
  { id: 'int5', name: 'LIMSConnect MQ', type: '消息队列', status: 'connected', lastSync: '实时', direction: '双向', description: '企业服务总线(ESB)核心消息路由' },
  { id: 'int6', name: 'Azure AD', type: '身份认证', status: 'inactive', lastSync: '-', direction: '单向(入)', description: '单点登录(SSO)、用户同步' },
];

const mockAPIs = [
  { id: 'api1', name: '样品信息查询', method: 'GET', path: '/api/v1/samples/:id', auth: 'API Key', rateLimit: '1000/min', status: 'active' },
  { id: 'api2', name: '报告结果推送', method: 'POST', path: '/api/v1/reports/webhook', auth: 'HMAC-SHA256', rateLimit: '100/min', status: 'active' },
  { id: 'api3', name: '检测任务创建', method: 'POST', path: '/api/v1/tasks', auth: 'OAuth 2.0', rateLimit: '500/min', status: 'active' },
  { id: 'api4', name: '实时数据推送', method: 'WebSocket', path: 'ws://lims/data/stream', auth: 'Token', rateLimit: '无限制', status: 'active' },
];

const methodColors: Record<string, string> = { GET: 'green', POST: 'blue', PUT: 'orange', DELETE: 'red', WebSocket: 'purple' };

export const EnterpriseIntegrationPage: React.FC = () => {
  const [integrationVisible, setIntegrationVisible] = useState(false);
  const [apiVisible, setApiVisible] = useState(false);
  const [form] = Form.useForm();

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><ApiOutlined /> 企业集成总线</Title></Col>
        <Col><Space><Button onClick={() => setApiVisible(true)}>注册API</Button><Button type="primary" icon={<LinkOutlined />} onClick={() => setIntegrationVisible(true)}>添加集成</Button></Space></Col>
      </Row>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="集成系统" value={mockIntegrations.filter(i => i.status === 'connected').length} suffix={`/ ${mockIntegrations.length}`} prefix={<LinkOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="开放API" value={mockAPIs.length} prefix={<ApiOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="消息路由/天" value="12,450" prefix={<SyncOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="正常运行" value="99.9%" prefix={<CloudServerOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="integrations" items={[
        { key: 'integrations', label: '系统集成', children: <Card>
          <Table dataSource={mockIntegrations} rowKey="id" columns={[
            { title: '系统名称', dataIndex: 'name', render: (n: string) => <a>{n}</a> },
            { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
            { title: '状态', dataIndex: 'status', render: (s: string) => {
              const map: Record<string, { status: any; text: string }> = { connected: { status: 'success', text: '已连接' }, disconnected: { status: 'error', text: '已断开' }, inactive: { status: 'default', text: '未启用' } };
              return <Badge status={map[s]?.status} text={map[s]?.text} />;
            }},
            { title: '数据方向', dataIndex: 'direction', render: (d: string) => <Tag color={d === '双向' ? 'blue' : 'orange'}>{d}</Tag> },
            { title: '最近同步', dataIndex: 'lastSync' },
            { title: '说明', dataIndex: 'description', ellipsis: true },
            { title: '操作', render: (_: any, r: any) => <Space size="small">
              <Button type="link" size="small" onClick={() => { const idx = mockIntegrations.findIndex((i:any) => i.id === r.id); if(idx >= 0) { mockIntegrations[idx].lastSync = new Date().toISOString().replace('T',' ').slice(0,16); message.success(`同步 ${r.name} 成功`); } }}>同步</Button>
              <Button type="link" size="small">配置</Button>
              <Button type="link" size="small" danger={r.status === 'connected'}>{r.status === 'connected' ? '断开' : '连接'}</Button>
            </Space> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'apis', label: '开放API管理', children: <Card extra={<Button size="small" onClick={() => setApiVisible(true)}>注册API</Button>}>
          <Table dataSource={mockAPIs} rowKey="id" columns={[
            { title: 'API名称', dataIndex: 'name' },
            { title: '方法', dataIndex: 'method', render: (m: string) => <Tag color={methodColors[m]}>{m}</Tag> },
            { title: '路径', dataIndex: 'path', render: (p: string) => <code style={{ fontSize: 12 }}>{p}</code> },
            { title: '认证方式', dataIndex: 'auth' },
            { title: '频率限制', dataIndex: 'rateLimit' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status="success" text="已发布" /> },
            { title: '操作', render: () => <Space size="small"><Button type="link" size="small">文档</Button><Button type="link" size="small">测试</Button><Button type="link" size="small">密钥</Button></Space> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'esb', label: '消息路由', children: <Card>
          <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
            <Descriptions.Item label="ESB状态"><Badge status="success" text="运行中" /></Descriptions.Item>
            <Descriptions.Item label="消息队列"><Tag color="blue">RabbitMQ 3.12</Tag></Descriptions.Item>
            <Descriptions.Item label="今日消息量">12,450</Descriptions.Item>
            <Descriptions.Item label="失败重试">23 (0.18%)</Descriptions.Item>
            <Descriptions.Item label="平均延迟">45ms</Descriptions.Item>
            <Descriptions.Item label="活跃消费者">8个</Descriptions.Item>
          </Descriptions>
          <Table dataSource={[
            { queue: 'lims.order.created', messages: 3250, consumers: 2, rate: '45/s' },
            { queue: 'lims.report.issued', messages: 1180, consumers: 1, rate: '20/s' },
            { queue: 'lims.sample.registered', messages: 2450, consumers: 2, rate: '35/s' },
            { queue: 'lims.task.assigned', messages: 1890, consumers: 1, rate: '28/s' },
            { queue: 'lims.instrument.data', messages: 3680, consumers: 2, rate: '52/s' },
          ]} rowKey="queue" pagination={false} size="small" columns={[
            { title: '队列名称', dataIndex: 'queue', render: (q: string) => <code style={{ fontSize: 12 }}>{q}</code> },
            { title: '今日消息', dataIndex: 'messages' },
            { title: '消费者', dataIndex: 'consumers' },
            { title: '速率', dataIndex: 'rate' },
            { title: '操作', render: () => <Space><Button type="link" size="small">查看</Button><Button type="link" size="small">清空</Button></Space> },
          ]} />
        </Card>},
        { key: 'ldap', label: 'LDAP/SSO', children: <Card>
          <Form layout="vertical" style={{ maxWidth: 600 }} onFinish={(v) => message.success('LDAP配置已保存')}>
            <Form.Item label="启用LDAP认证"><Switch defaultChecked={false} /></Form.Item>
            <Form.Item name="server" label="LDAP服务器地址"><Input placeholder="ldap://ad.company.com:389" /></Form.Item>
            <Form.Item name="baseDN" label="Base DN"><Input placeholder="DC=company,DC=com" /></Form.Item>
            <Form.Item name="bindDN" label="Bind DN"><Input placeholder="CN=ldap-bind,CN=Users,DC=company,DC=com" /></Form.Item>
            <Form.Item name="bindPassword" label="Bind密码"><Input.Password /></Form.Item>
            <Form.Item name="userFilter" label="用户过滤"><Input placeholder="(&(objectClass=user)(sAMAccountName={0}))" /></Form.Item>
            <Form.Item label="启用OAuth 2.0/OIDC SSO"><Switch defaultChecked={false} /></Form.Item>
            <Form.Item name="oidcIssuer" label="OIDC Issuer URL"><Input placeholder="https://login.microsoftonline.com/{tenant}/v2.0" /></Form.Item>
            <Form.Item name="oidcClientId" label="Client ID"><Input /></Form.Item>
            <Form.Item name="oidcClientSecret" label="Client Secret"><Input.Password /></Form.Item>
            <Button type="primary" htmlType="submit">保存配置</Button>
            <Button style={{ marginLeft: 8 }} onClick={() => message.success('连接测试成功')}>测试连接</Button>
          </Form>
        </Card>},
      ]} />

      <Modal title="添加集成" open={integrationVisible} onCancel={() => setIntegrationVisible(false)} onOk={() => { form.submit(); }}>
        <Form form={form} layout="vertical" onFinish={() => { message.success('集成添加成功'); setIntegrationVisible(false); form.resetFields(); }}>
          <Form.Item name="name" label="系统名称" required><Input /></Form.Item>
          <Form.Item name="type" label="类型">
            <Select options={[{ value: 'erp', label: 'ERP' }, { value: 'oa', label: 'OA' }, { value: 'im', label: '即时通讯' }, { value: 'auth', label: '身份认证' }, { value: 'mq', label: '消息队列' }]} />
          </Form.Item>
          <Form.Item name="endpoint" label="连接地址"><Input placeholder="https://api.example.com" /></Form.Item>
          <Form.Item name="authType" label="认证方式"><Select options={[{ value: 'apikey', label: 'API Key' }, { value: 'oauth2', label: 'OAuth 2.0' }, { value: 'basic', label: 'Basic Auth' }]} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="注册API" open={apiVisible} onCancel={() => setApiVisible(false)} footer={null}>
        <Form layout="vertical" onFinish={() => { message.success('API注册成功'); setApiVisible(false); }}>
          <Form.Item name="name" label="API名称" required><Input /></Form.Item>
          <Form.Item name="method" label="HTTP方法"><Select options={[{ value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }, { value: 'PUT', label: 'PUT' }, { value: 'DELETE', label: 'DELETE' }]} /></Form.Item>
          <Form.Item name="path" label="路径"><Input placeholder="/api/v1/custom/endpoint" /></Form.Item>
          <Form.Item name="auth" label="认证方式"><Select options={[{ value: 'apikey', label: 'API Key' }, { value: 'oauth2', label: 'OAuth 2.0' }, { value: 'hmac', label: 'HMAC-SHA256' }]} /></Form.Item>
          <Button type="primary" block htmlType="submit">注册</Button>
        </Form>
      </Modal>
    </div>
  );
};
