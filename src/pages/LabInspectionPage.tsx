import React, { useState } from 'react';
import {
  Card, Table, Tag, Button, Typography, Space, Tabs, Row, Col, Statistic,
  Modal, Badge, Progress, Input, Form, message, Divider,
  Radio,
} from 'antd';
import {
  SafetyOutlined, CheckCircleOutlined, WarningOutlined, FileTextOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const severityColor: Record<string, string> = {
  low: 'blue', medium: 'orange', high: 'red', critical: 'magenta',
};
const severityLabel: Record<string, string> = {
  low: '一般', medium: '中等', high: '重大', critical: '紧急',
};

const hazardStatusColor: Record<string, string> = {
  open: 'red', assigned: 'orange', in_progress: 'blue', pending_review: 'purple', closed: 'green', reopened: 'volcano',
};
const hazardStatusLabel: Record<string, string> = {
  open: '待整改', assigned: '已分配', in_progress: '整改中', pending_review: '待复查', closed: '已关闭', reopened: '重新打开',
};

const checklistItems = [
  { id: 'i1', content: '实验室通风系统运行正常，换气次数符合要求', category: '通风', standard: '每小时换气≥6次' },
  { id: 'i2', content: '消防器材完好有效，灭火器压力正常', category: '消防', standard: '压力指针在绿区' },
  { id: 'i3', content: '危化品储存符合规范，易制毒/易制爆双人双锁', category: '危化品', standard: '双人双锁、专用台账' },
  { id: 'i4', content: '电气线路无老化破损，无私拉乱接', category: '用电', standard: '线缆无裸露、无焦痕' },
  { id: 'i5', content: '紧急喷淋和洗眼装置功能正常', category: '应急', standard: '出水通畅、水质清洁' },
  { id: 'i6', content: '实验室废弃物分类存放，标识清晰', category: '环保', standard: '分类标签、不混放' },
  { id: 'i7', content: '气瓶固定牢靠，安全帽完好，标识清晰', category: '气瓶', standard: '防倾倒链、空满分区' },
  { id: 'i8', content: '实验人员按规定佩戴防护用品', category: '防护', standard: '实验服、手套、护目镜' },
];

const mockInspections = [
  { id: 'in1', name: '化学楼实验室定期检查', type: 'routine', typeLabel: '定期检查', scopeLabel: '化学楼', inspectorName: '张三', scheduledDate: '2026-05-15', score: 85, status: 'completed' },
  { id: 'in2', name: '危化品存储室专项检查', type: 'special', typeLabel: '专项检查', subtype: '危化品', scopeLabel: '危化品存储室', inspectorName: '李四', scheduledDate: '2026-05-10', score: 72, status: 'completed' },
  { id: 'in3', name: '生物实验室安全检查', type: 'special', typeLabel: '专项检查', subtype: '生物', scopeLabel: '生物实验室', inspectorName: '王五', scheduledDate: '2026-05-20', score: 0, status: 'scheduled' },
];

const mockHazards = [
  { id: 'h1', recordId: 'in2', description: '易制毒试剂柜未上锁', severity: 'high', severityLabel: '重大', category: '危化品', assigneeName: '赵六', deadline: '2026-05-17', status: 'in_progress', statusLabel: '整改中', rectification: { description: '已更换新锁，双人钥匙已分发', photos: [], completedAt: '2026-05-12', completedBy: '赵六' } },
  { id: 'h2', recordId: 'in2', description: '危化品台账记录不完整', severity: 'medium', severityLabel: '中等', category: '危化品', assigneeName: '赵六', deadline: '2026-05-20', status: 'pending_review', statusLabel: '待复查', rectification: { description: '已补充近3个月台账记录', photos: [], completedAt: '2026-05-14', completedBy: '赵六' } },
  { id: 'h3', recordId: 'in1', description: '灭火器压力不足', severity: 'medium', severityLabel: '中等', category: '消防', assigneeName: '孙七', deadline: '2026-05-18', status: 'open', statusLabel: '待整改' },
  { id: 'h4', recordId: 'in1', description: '通风橱风速低于标准', severity: 'high', severityLabel: '重大', category: '通风', assigneeName: '孙七', deadline: '2026-05-20', status: 'in_progress', statusLabel: '整改中', rectification: { description: '已联系维保单位检修', photos: [], completedAt: '2026-05-13', completedBy: '孙七' } },
];

export const LabInspectionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [inspectOpen, setInspectOpen] = useState(false);
  const [inspectForm] = Form.useForm();
  const [results, setResults] = useState<Record<string, string>>({});

  const totalChecks = mockInspections.filter(i => i.status === 'completed').length;
  const totalHazards = mockHazards.length;
  const closedHazards = mockHazards.filter(h => h.status === 'closed').length;
  const rectificationRate = totalHazards > 0 ? Math.round((closedHazards / totalHazards) * 100) : 0;
  const avgScore = mockInspections.filter(i => i.score > 0).reduce((s, i) => s + i.score, 0) / mockInspections.filter(i => i.score > 0).length || 0;

  const tabItems = [
    {
      key: 'overview',
      label: '检查总览',
      children: (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={6}><Card><Statistic title="本月检查" value={totalChecks} prefix={<FileTextOutlined />} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="发现隐患" value={totalHazards} valueStyle={{ color: '#ff4d4f' }} prefix={<WarningOutlined />} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="整改率" value={`${rectificationRate}%`} valueStyle={{ color: rectificationRate >= 90 ? '#52c41a' : '#faad14' }} prefix={<CheckCircleOutlined />} /></Card></Col>
            <Col xs={12} sm={6}><Card><Statistic title="平均得分" value={avgScore.toFixed(1)} valueStyle={{ color: avgScore >= 80 ? '#52c41a' : '#faad14' }} prefix={<SafetyOutlined />} /></Card></Col>
          </Row>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card title="隐患整改进度">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {['待整改', '整改中', '待复查', '已关闭'].map((label) => {
                    const count = mockHazards.filter(h => h.statusLabel === label).length;
                    return (
                      <Row key={label} align="middle">
                        <Col span={6}><Text>{label}</Text></Col>
                        <Col span={12}><Progress percent={totalHazards > 0 ? Math.round((count / totalHazards) * 100) : 0} size="small" /></Col>
                        <Col span={6} style={{ textAlign: 'right' }}><Text strong>{count}项</Text></Col>
                      </Row>
                    );
                  })}
                </Space>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="隐患类型分布">
                {Array.from(new Set(mockHazards.map(h => h.category))).map(cat => {
                  const count = mockHazards.filter(h => h.category === cat).length;
                  return (
                    <Row key={cat} align="middle" style={{ marginBottom: 8 }}>
                      <Col span={8}><Tag>{cat}</Tag></Col>
                      <Col span={12}><Progress percent={Math.round((count / totalHazards) * 100)} size="small" /></Col>
                      <Col span={4} style={{ textAlign: 'right' }}><Text>{count}</Text></Col>
                    </Row>
                  );
                })}
              </Card>
            </Col>
          </Row>

          <Card title="检查活动列表" extra={<Button type="primary" onClick={() => setInspectOpen(true)}>执行检查</Button>}>
            <Table
              dataSource={mockInspections}
              rowKey="id"
              columns={[
                { title: '检查名称', dataIndex: 'name', ellipsis: true },
                { title: '类型', dataIndex: 'typeLabel', render: (v: string, r: any) => <Tag color={r.type === 'routine' ? 'blue' : 'purple'}>{v}{r.subtype ? `-${r.subtype}` : ''}</Tag> },
                { title: '范围', dataIndex: 'scopeLabel' },
                { title: '检查人', dataIndex: 'inspectorName', width: 100 },
                { title: '得分', dataIndex: 'score', render: (v: number) => v > 0 ? <Text style={{ color: v >= 80 ? '#52c41a' : '#faad14' }} strong>{v}</Text> : '-' },
                { title: '状态', dataIndex: 'status', render: (v: string) => <Badge status={v === 'completed' ? 'success' : v === 'in_progress' ? 'processing' : 'default'} text={v === 'completed' ? '已完成' : v === 'scheduled' ? '待执行' : '进行中'} /> },
              ]}
              pagination={false}
              size="middle"
            />
          </Card>
        </>
      ),
    },
    {
      key: 'hazards',
      label: '隐患整改',
      children: (
        <Card title="隐患清单">
          <Table
            dataSource={mockHazards}
            rowKey="id"
            columns={[
              { title: '隐患描述', dataIndex: 'description', ellipsis: true },
              { title: '类型', dataIndex: 'category', render: (v: string) => <Tag>{v}</Tag> },
              { title: '等级', dataIndex: 'severity', render: (v: string) => <Tag color={severityColor[v]}>{severityLabel[v]}</Tag> },
              { title: '责任人', dataIndex: 'assigneeName' },
              { title: '期限', dataIndex: 'deadline', width: 110 },
              { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={hazardStatusColor[v]}>{hazardStatusLabel[v]}</Tag> },
              { title: '操作', width: 200, render: (_: any, r: any) => (
                <Space>
                  {r.status === 'open' && <Button type="link" size="small" onClick={() => message.success('已下发整改任务')}>下发整改</Button>}
                  {r.status === 'in_progress' && <Button type="link" size="small" onClick={() => message.success('已提交整改')}>提交整改</Button>}
                  {r.status === 'pending_review' && (
                    <>
                      <Button type="link" size="small" onClick={() => message.success('复查通过')}>通过</Button>
                      <Button type="link" size="small" danger onClick={() => message.warning('退回重新整改')}>不通过</Button>
                    </>
                  )}
                </Space>
              )},
            ]}
            pagination={false}
            size="middle"
          />
        </Card>
      ),
    },
  ];

  const handleInspectComplete = () => {
    const failCount = Object.values(results).filter(v => v === 'fail').length;
    const score = Math.round(((checklistItems.length - failCount) / checklistItems.length) * 100);
    message.success(`检查完成！得分：${score}分，发现 ${failCount} 项不合格`);
    setInspectOpen(false);
    setResults({});
  };

  return (
    <div>
      <Title level={3}><SafetyOutlined /> 实验室安全检查</Title>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal title="执行实验室安全检查" open={inspectOpen} onCancel={() => { setInspectOpen(false); setResults({}); }} footer={[
        <Button key="cancel" onClick={() => { setInspectOpen(false); setResults({}); }}>取消</Button>,
        <Button key="save" type="primary" onClick={handleInspectComplete}>完成检查</Button>,
      ]} width={700}>
        <Form form={inspectForm} layout="vertical">
          <Form.Item name="name" label="检查名称" rules={[{ required: true }]}>
            <Input placeholder="如：化学楼实验室定期检查" />
          </Form.Item>
          <Form.Item name="inspector" label="检查人" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Divider />
          <Title level={5}>检查清单</Title>
          {checklistItems.map(item => (
            <div key={item.id} style={{ marginBottom: 16, padding: 12, background: '#f6f8fa', borderRadius: 8 }}>
              <Text strong>{item.content}</Text>
              <br /><Text type="secondary" style={{ fontSize: 12 }}>标准：{item.standard}</Text>
              <div style={{ marginTop: 8 }}>
                <Radio.Group
                  value={results[item.id]}
                  onChange={e => setResults(prev => ({ ...prev, [item.id]: e.target.value }))}
                >
                  <Radio.Button value="pass">✅ 合格</Radio.Button>
                  <Radio.Button value="fail">❌ 不合格</Radio.Button>
                  <Radio.Button value="na">➖ 不适用</Radio.Button>
                </Radio.Group>
              </div>
              {results[item.id] === 'fail' && (
                <div style={{ marginTop: 8 }}>
                  <Input.TextArea rows={2} placeholder="记录隐患详情..." />
                </div>
              )}
            </div>
          ))}
        </Form>
      </Modal>
    </div>
  );
};
