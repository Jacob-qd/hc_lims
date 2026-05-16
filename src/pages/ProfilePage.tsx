import React from 'react';
import { Card, Row, Col, Typography, Form, Input, Button, Avatar, Descriptions, Tabs, message, Space, Divider, Switch } from 'antd';
import { UserOutlined, LockOutlined, BellOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export const ProfilePage: React.FC = () => {
  const [pwdForm] = Form.useForm();

  return (
    <div>
      <Title level={4} style={{marginBottom:16}}>个人设置</Title>
      <Row gutter={16}>
        <Col span={8}>
          <Card style={{textAlign:'center'}}>
            <Avatar size={80} icon={<UserOutlined />} />
            <Title level={4} style={{marginTop:12}}>张伟</Title>
            <Text type="secondary">检测工程师 · 检测一部</Text>
            <Divider />
            <Descriptions column={1} size="small">
              <Descriptions.Item label="工号">EMP-2022001</Descriptions.Item>
              <Descriptions.Item label="邮箱">zhangwei@hongchuang.cn</Descriptions.Item>
              <Descriptions.Item label="手机">138-1234-5678</Descriptions.Item>
              <Descriptions.Item label="角色">检测员</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col span={16}>
          <Tabs items={[
            { key: 'profile', label: <><UserOutlined /> 基本信息</>, children: <Card>
              <Form layout="vertical" style={{maxWidth:400}}>
                <Form.Item label="真实姓名"><Input defaultValue="张伟" /></Form.Item>
                <Form.Item label="邮箱"><Input defaultValue="zhangwei@hongchuang.cn" /></Form.Item>
                <Form.Item label="手机"><Input defaultValue="138-1234-5678" /></Form.Item>
                <Button type="primary" onClick={() => message.success('个人信息已保存')}>保存</Button>
              </Form>
            </Card>},
            { key: 'password', label: <><LockOutlined /> 修改密码</>, children: <Card>
              <Form form={pwdForm} layout="vertical" style={{maxWidth:400}}>
                <Form.Item name="old" label="当前密码" rules={[{required:true}]}><Input.Password /></Form.Item>
                <Form.Item name="new" label="新密码" rules={[{required:true,min:6}]}><Input.Password /></Form.Item>
                <Form.Item name="confirm" label="确认新密码" rules={[{required:true},{validator:(_,v) => v === pwdForm.getFieldValue('new') ? Promise.resolve() : Promise.reject('密码不匹配')}]}><Input.Password /></Form.Item>
                <Button type="primary" htmlType="submit" onClick={() => message.success('密码已修改')}>修改密码</Button>
              </Form>
            </Card>},
            { key: 'preferences', label: <><BellOutlined /> 偏好设置</>, children: <Card>
              <Space direction="vertical" style={{width:'100%'}} size="middle">
                <Card size="small"><Row justify="space-between"><Col><Text strong>邮件通知</Text><br /><Text type="secondary">任务分配、审核提醒</Text></Col><Col><Switch defaultChecked /></Col></Row></Card>
                <Card size="small"><Row justify="space-between"><Col><Text strong>系统消息</Text><br /><Text type="secondary">版本更新、维护通知</Text></Col><Col><Switch defaultChecked /></Col></Row></Card>
                <Card size="small"><Row justify="space-between"><Col><Text strong>每日摘要</Text><br /><Text type="secondary">每日工作汇总邮件</Text></Col><Col><Switch /></Col></Row></Card>
              </Space>
            </Card>},
          ]} />
        </Col>
      </Row>
    </div>
  );
};
