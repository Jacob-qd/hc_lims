import React from 'react';
import { Card, Row, Col, Typography, Tag, Table, Timeline, Steps, Alert, Space, Button, message, Statistic } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, SafetyCertificateOutlined, FileSearchOutlined, AuditOutlined, LockOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const complianceItems = [
  { id: 'c1', requirement: '§11.10(a) 系统验证', status: 'partial', desc: '验证文档框架已建立，IQ/OQ/PQ 模板待完善', effort: '2周' },
  { id: 'c2', requirement: '§11.10(b) 审计追踪', status: 'pass', desc: 'AuditLogPage 已实现，覆盖所有 CUD 操作', effort: '—' },
  { id: 'c3', requirement: '§11.10(c) 权限控制', status: 'pass', desc: 'RBAC 权限系统已实现(permissionStore)', effort: '—' },
  { id: 'c4', requirement: '§11.10(d) 数据完整性', status: 'partial', desc: 'ALCOA+ 原则已设计，部分模块已实现', effort: '2周' },
  { id: 'c5', requirement: '§11.10(e) 电子签名', status: 'partial', desc: 'SignaturePad 已实现，SM2/SM3 国密集成中', effort: '1周' },
  { id: 'c6', requirement: '§11.10(f) 证书管理', status: 'partial', desc: 'CertificatePage 已实现，CA 对接待完成', effort: '1周' },
  { id: 'c7', requirement: '§11.50 签名要素', status: 'pass', desc: '签名含义声明(编制/审核/批准/复核)已实现', effort: '—' },
  { id: 'c8', requirement: '§11.70 签名绑定', status: 'pass', desc: '签名与记录永久绑定，签名后不可编辑', effort: '—' },
  { id: 'c9', requirement: '§11.300 密码控制', status: 'pass', desc: '密码策略(长度/复杂度/过期)已实现', effort: '—' },
  { id: 'c10', requirement: 'GxP 验证包', status: 'fail', desc: 'IQ/OQ/PQ 文档待编制', effort: '4周' },
  { id: 'c11', requirement: '数据归档', status: 'fail', desc: '数据归档策略和功能待实现', effort: '2周' },
  { id: 'c12', requirement: '灾难恢复', status: 'fail', desc: '备份/恢复已实现，异地容灾待完善', effort: '2周' },
];

const roadmap = [
  { date: '2026-06', title: 'Part 11 差距分析完成', status: 'finish' },
  { date: '2026-07', title: '审计追踪全面升级', status: 'finish' },
  { date: '2026-08', title: '电子签名国密合规', status: 'process' },
  { date: '2026-09', title: '验证文档(IQ/OQ/PQ)编制', status: 'wait' },
  { date: '2026-10', title: '内部审计+整改', status: 'wait' },
  { date: '2026-12', title: '合规验收', status: 'wait' },
];

export const CompliancePage: React.FC = () => {
  const stats = {
    pass: complianceItems.filter(i => i.status === 'pass').length,
    partial: complianceItems.filter(i => i.status === 'partial').length,
    fail: complianceItems.filter(i => i.status === 'fail').length,
    total: complianceItems.length,
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ margin: 0, marginBottom: 16 }}>
        <SafetyCertificateOutlined /> 21 CFR Part 11 合规管理
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        FDA 21 CFR Part 11 & EU GMP Annex 11 合规对标与跟踪
      </Text>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="已通过" value={stats.pass} suffix={`/ ${stats.total}`} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="部分完成" value={stats.partial} valueStyle={{ color: '#faad14' }} prefix={<WarningOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="待实现" value={stats.fail} valueStyle={{ color: '#ff4d4f' }} prefix={<CloseCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="合规进度" value={Math.round((stats.pass + stats.partial * 0.5) / stats.total * 100)} suffix="%" valueStyle={{ color: '#1677ff' }} prefix={<AuditOutlined />} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col span={16}>
          <Card title="法规要求逐项对照">
            <Table dataSource={complianceItems} rowKey="id" pagination={false} size="small" columns={[
              { title: '法规要求', dataIndex: 'requirement', width: 200 },
              { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => {
                const m: Record<string, {c:string;l:string}> = { pass: {c:'green',l:'通过'}, partial: {c:'orange',l:'部分'}, fail: {c:'red',l:'未通过'} };
                return <Tag color={m[s]?.c}>{m[s]?.l || s}</Tag>;
              }},
              { title: '说明', dataIndex: 'desc' },
              { title: '工作量', dataIndex: 'effort', width: 80 },
            ]} />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="合规路线图" style={{ marginBottom: 16 }}>
            <Steps direction="vertical" size="small" current={2} items={roadmap.map(r => ({
              title: r.date,
              description: r.title,
              status: r.status as any,
            }))} />
          </Card>
          <Card title="验证文档清单">
            <Timeline items={[
              { color: 'green', children: '✅ 差距分析报告 — 已完成' },
              { color: 'green', children: '✅ 审计追踪规范 — 已完成' },
              { color: 'blue', children: '⏳ IQ 安装确认模板 — 编制中' },
              { color: 'gray', children: '⏳ OQ 运行确认模板 — 待编制' },
              { color: 'gray', children: '⏳ PQ 性能确认模板 — 待编制' },
              { color: 'gray', children: '⏳ 验证总结报告 — 待编制' },
            ]} />
          </Card>
        </Col>
      </Row>

      <Alert
        type="info"
        message="合规建议"
        description="HC-LIMS 当前 21 CFR Part 11 合规进度约 54%。核心功能(审计追踪/权限控制/电子签名)已基本就绪，主要差距在验证文档(IQ/OQ/PQ)和数据归档。建议优先级: 完成国密签名集成 → 编制验证文档 → 内部审计 → 合规验收。"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );
};
