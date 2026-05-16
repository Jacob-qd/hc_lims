import React, { useState } from 'react';
import { useLabTypeStore } from '../stores/labTypeStore';
import { Card, Tabs, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Switch, Input, Form, message, Modal, Tree } from 'antd';
import { PlusOutlined, SettingOutlined, SafetyOutlined, UserOutlined, KeyOutlined } from '@ant-design/icons';

const { Title } = Typography;

const roles = [
  { key: 'admin', name: '系统管理员', type: '系统角色', users: 3, desc: '系统全部权限' },
  { key: 'qa', name: '质量主管', type: '系统角色', users: 2, desc: '质量控制、审核管理' },
  { key: 'analyst', name: '检测员', type: '业务角色', users: 12, desc: '检测任务执行、结果录入' },
  { key: 'instrument_mgr', name: '仪器管理员', type: '业务角色', users: 2, desc: '仪器台账、校准维护' },
  { key: 'report_reviewer', name: '报告审核员', type: '业务角色', users: 4, desc: '报告审核、批准签发' },
];

const users = [
  { id: 'u1', name: '张伟', dept: '检测一部', role: '检测员', lab: '理化实验室', lastLogin: '2024-05-21 09:15', mfa: true, status: 'active' },
  { id: 'u2', name: '李明', dept: '仪器管理部', role: '仪器管理员', lab: '仪器分析室', lastLogin: '2024-05-21 08:30', mfa: false, status: 'active' },
  { id: 'u3', name: '王强', dept: '质量管理部', role: '质量主管', lab: '中心实验室', lastLogin: '2024-05-20 17:00', mfa: true, status: 'active' },
  { id: 'u4', name: '李思', dept: '检测一部', role: '报告审核员', lab: '理化实验室', lastLogin: '2024-05-19 16:45', mfa: true, status: 'active' },
];

const permissions = ['样品管理', '检测管理', '报告管理', '质量控制', '仪器管理', '库存管理', '方法管理', '系统管理'];
const actions = ['查看', '新增', '编辑', '删除', '审批', '导出'];

export const SettingsPage: React.FC = () => {
  const { labType, setLabType } = useLabTypeStore();

  const permColumns = [
    { title: '模块', dataIndex: 'module', key: 'module', fixed: 'left' as const },
    ...actions.map(a => ({ title: a, dataIndex: a, key: a, width: 60, render: (v: boolean) => v ? <Tag color="green">✓</Tag> : <Tag color="red">✗</Tag> })),
  ];

  const permData = permissions.map(m => ({
    module: m, key: m, 查看: true, 新增: m !== '系统管理', 编辑: m !== '系统管理', 删除: m === '样品管理', 审批: ['报告管理', '质量控制'].includes(m), 导出: true,
  }));

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>系统管理</Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}><Card><Statistic title="用户总数" value={users.length + 4} prefix={<UserOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="启用角色" value={roles.length} prefix={<SafetyOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="流程模板" value={6} prefix={<SettingOutlined />} /></Card></Col>
        <Col xs={12} sm={6}><Card><Statistic title="集成接口" value={3} prefix={<KeyOutlined />} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="users" items={[
        { key: 'users', label: '用户管理', children: (
          <Row gutter={16}>
            <Col span={6}>
              <Card title="组织结构" size="small">
                <Tree
                  defaultExpandAll
                  treeData={[
                    { title: '红创科技', key: '0', children: [
                      { title: '检测一部', key: '0-1', children: [
                        { title: '理化实验室', key: '0-1-1' },
                        { title: '环境监测室', key: '0-1-2' },
                      ]},
                      { title: '检测二部', key: '0-2', children: [
                        { title: '无机分析室', key: '0-2-1' },
                        { title: '质谱分析室', key: '0-2-2' },
                      ]},
                      { title: '仪器管理部', key: '0-3', children: [
                        { title: '仪器分析室', key: '0-3-1' },
                      ]},
                      { title: '质量管理部', key: '0-4' },
                    ]},
                  ]}
                />
              </Card>
            </Col>
            <Col span={18}>
              <Card>
                <Space style={{ marginBottom: 16 }}><Button type="primary" icon={<PlusOutlined />}>新增用户</Button></Space>
                <Table dataSource={users} rowKey="id" size="middle" pagination={false} columns={[
                  { title: '用户名', dataIndex: 'name' },
                  { title: '所属部门', dataIndex: 'dept' },
                  { title: '角色', dataIndex: 'role', render: (r: string) => <Tag>{r}</Tag> },
                  { title: '实验室', dataIndex: 'lab' },
                  { title: '最后登录', dataIndex: 'lastLogin' },
                  { title: 'MFA', dataIndex: 'mfa', render: (v: boolean) => v ? <Tag color="green">已启用</Tag> : <Tag color="red">未启用</Tag> },
                  { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color="green">正常</Tag> },
                ]} />
              </Card>
            </Col>
          </Row>
        )},
        { key: 'roles', label: '角色权限', children: (
          <Card title="权限配置矩阵">
            <Table columns={permColumns as any} dataSource={permData} pagination={false} size="small" bordered />
          </Card>
        )},
        { key: 'config', label: '系统配置', children: (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Card title="实验室类型" size="small">
              <Space>
                <Button type={labType === 'commercial' ? 'primary' : 'default'} onClick={() => { if (labType !== 'commercial') setLabType('commercial'); }}>🏭 检测实验室版</Button>
                <Button type={labType === 'research' ? 'primary' : 'default'} onClick={() => { if (labType !== 'research') setLabType('research'); }}>🔬 高校科研版</Button>
                <Tag style={{ marginLeft: 16 }}>{labType === 'commercial' ? 'CNAS/CMA 检测流程' : '课题组管理 + ELN + 仪器共享'}</Tag>
              </Space>
            </Card>
            <Card title="编号规则" size="small">
              <Form layout="inline"><Form.Item label="样品编号"><Input value="SMP+日期+序号" /></Form.Item><Form.Item label="报告编号"><Input value="RPT+日期+序号" /></Form.Item><Form.Item label="任务编号"><Input value="T+日期+序号" /></Form.Item></Form>
            </Card>
            <Card title="电子签名设置" size="small">
              <Space direction="vertical"><Switch checkedChildren="启用" unCheckedChildren="关闭" defaultChecked /> <Text type="secondary">签名需密码验证，记录时间戳和IP地址</Text></Space>
            </Card>
          </Space>
        )},
      ]} />

      <Modal title="新增用户" open={userModal} onOk={() => userForm.submit()} onCancel={() => { setUserModal(false); userForm.resetFields(); }}>
        <Form form={userForm} layout="vertical" onFinish={(v) => {
          users.push({ id: 'u' + (users.length + 1), ...v, lastLogin: '-', mfa: false, status: 'active' });
          message.success('用户创建成功'); setUserModal(false); userForm.resetFields();
        }}>
          <Form.Item name="name" label="用户名" rules={[{ required: true }]}><Input /></Form.Item>
          <Row gutter={16}>
            <Col span={12}><Form.Item name="dept" label="部门"><Input /></Form.Item></Col>
            <Col span={12}><Form.Item name="role" label="角色"><Select>{['检测员','仪器管理员','质量主管','报告审核员','系统管理员'].map(r=><Select.Option key={r}>{r}</Select.Option>)}</Select></Form.Item></Col>
          </Row>
          <Form.Item name="lab" label="实验室"><Input /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
const Text = Typography.Text;
