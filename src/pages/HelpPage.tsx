import React from 'react';
import {Card, Row, Col, Typography, Tag, Space, Divider, Button} from 'antd';
import { GithubOutlined, QuestionCircleOutlined, FileTextOutlined, TeamOutlined, BookOutlined, MailOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export const HelpPage: React.FC = () => (
  <div>
    <Title level={4}>关于红创LIMS</Title>
    <Row gutter={[16,16]}>
      <Col span={16}>
        <Card>
          <Title level={4}>HC-LIMS v2.0</Title>
          <Text type="secondary">版本号: 2.0.0 (Build 20260514)</Text>
          <Divider />
          <Paragraph>
            <Text strong>产品名称: </Text>红创科技实验室信息管理系统 (Hongchuang Laboratory Information Management System)
          </Paragraph>
          <Paragraph>
            <Text strong>适用场景: </Text>第三方检测实验室 / 高校科研实验室 / 环境监测站 / 食品药品检测机构
          </Paragraph>
          <Paragraph>
            <Text strong>技术栈: </Text>
            <Tag>React 19</Tag> <Tag>TypeScript</Tag> <Tag>Ant Design 5</Tag> <Tag>Vite 8</Tag> <Tag>Zustand</Tag> <Tag>MSW</Tag>
          </Paragraph>
          <Paragraph>
            <Text strong>功能模块: </Text>25个页面, 19个功能模块, 55张设计图
          </Paragraph>
          <Divider />
          <Title level={5}>快捷键</Title>
          <Card size="small" style={{marginBottom:8}}><Row justify="space-between"><Col><Text keyboard>Ctrl+K</Text> 全局搜索</Col><Col><Text keyboard>Ctrl+B</Text> 侧边栏折叠</Col></Row></Card>
          <Card size="small"><Row justify="space-between"><Col><Text keyboard>Ctrl+E</Text> 快速导航</Col><Col><Text keyboard>Esc</Text> 关闭弹窗</Col></Row></Card>
          <Divider />
          <Title level={5}>常用链接</Title>
          <Space wrap>
            <Button icon={<FileTextOutlined />} href="/FRONTEND_DESIGN_SPEC.md" target="_blank">前端设计规范</Button>
            <Button icon={<BookOutlined />} href="/SYSTEM_DESIGN.md" target="_blank">系统设计文档</Button>
            <Button icon={<QuestionCircleOutlined />}>常见问题</Button>
            <Button icon={<MailOutlined />}>联系支持</Button>
          </Space>
        </Card>
      </Col>
      <Col span={8}>
        <Card title="系统状态">
          <Space direction="vertical" style={{width:'100%'}}>
            <Card size="small"><Row justify="space-between"><Col><TeamOutlined /> 页面总数</Col><Col><Tag>26</Tag></Col></Row></Card>
            <Card size="small"><Row justify="space-between"><Col><FileTextOutlined /> 代码行数</Col><Col><Tag>~9,000</Tag></Col></Row></Card>
            <Card size="small"><Row justify="space-between"><Col><GithubOutlined /> 测试通过</Col><Col><Tag color="green">45/45</Tag></Col></Row></Card>
          </Space>
        </Card>
        <Card title="开发团队" style={{marginTop:16}}>
          <Text>红创科技 开发团队</Text><br />
          <Text type="secondary">© 2026 Hongchuang Technology</Text>
        </Card>
      </Col>
    </Row>
  </div>
);
