import React, { useEffect, useState } from 'react';
import {
  Card, Steps, Button, Form, Select, DatePicker, Input, Space,
  Typography, Spin, message, Tag, Table, Row, Col, Statistic, Empty,
  Tooltip, Alert, Divider,
} from 'antd';
import {
  FileTextOutlined, CopyOutlined, DownloadOutlined, RobotOutlined,
  EyeOutlined, EditOutlined, CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface AIReport {
  id: string;
  name: string;
  dataSource: string;
  timeRange: [string, string];
  reportType: 'summary' | 'analytical' | 'compliance';
  generatedContent: string;
  status: 'draft' | 'reviewed' | 'approved';
  createdAt: string;
}

const dataSourceOptions = [
  { value: 'samples', label: '样品数据' },
  { value: 'tasks', label: '检测任务' },
  { value: 'quality', label: '质量控制' },
  { value: 'instruments', label: '仪器设备' },
];

const reportTypeOptions = [
  { value: 'summary', label: '汇总报告' },
  { value: 'analytical', label: '分析报告' },
  { value: 'compliance', label: '合规报告' },
];

export const AIReportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [reports, setReports] = useState<AIReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewReport, setPreviewReport] = useState<AIReport | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = () => {
    setLoading(true);
    fetch('/api/v1/ai/reports')
      .then(r => r.json())
      .then(res => {
        if (res.code === 200) setReports(res.data.list);
      })
      .catch(() => message.error('加载报告失败'))
      .finally(() => setLoading(false));
  };

  const handleGenerate = async () => {
    const values = await form.validateFields();
    setGenerating(true);
    try {
      const res = await fetch('/api/v1/ai/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataSource: values.dataSource,
          timeRange: values.timeRange.map((d: any) => d.format('YYYY-MM-DD')),
          reportType: values.reportType,
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        setPreviewReport(data.data);
        setEditContent(data.data.generatedContent);
        setReports(prev => [data.data, ...prev]);
        setCurrentStep(2);
        message.success('报告生成成功');
      }
    } catch {
      message.error('生成失败');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (previewReport) {
      navigator.clipboard.writeText(previewReport.generatedContent);
      message.success('已复制到剪贴板');
    }
  };

  const handleExport = () => {
    if (!previewReport) return;
    const blob = new Blob([previewReport.generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${previewReport.name}.md`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('导出成功');
  };

  const steps = [
    { title: '选择数据源', description: '确定报告数据来源' },
    { title: '配置参数', description: '设置时间与类型' },
    { title: '预览报告', description: '查看与编辑内容' },
  ];

  const statusColor: Record<string, string> = {
    draft: 'default',
    reviewed: 'processing',
    approved: 'success',
  };
  const statusLabel: Record<string, string> = {
    draft: '草稿',
    reviewed: '已审核',
    approved: '已批准',
  };

  const columns: ColumnsType<AIReport> = [
    { title: '报告名称', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: '数据源', dataIndex: 'dataSource', key: 'dataSource', render: (v: string) => dataSourceOptions.find(o => o.value === v)?.label || v },
    { title: '类型', dataIndex: 'reportType', key: 'reportType', render: (v: string) => reportTypeOptions.find(o => o.value === v)?.label || v },
    { title: '时间范围', key: 'timeRange', render: (_: any, r: AIReport) => `${r.timeRange[0]} ~ ${r.timeRange[1]}` },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => <Tag color={statusColor[v]}>{statusLabel[v]}</Tag> },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, r: AIReport) => (
        <Space>
          <Tooltip title="预览">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => { setPreviewReport(r); setEditContent(r.generatedContent); setCurrentStep(2); }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        智能报告生成器
      </Title>

      <Alert
        message="AI 辅助生成内容，请人工审核确认"
        description="本功能生成的报告结论仅供参考，所有内容需经授权签字人审核确认后方可用于正式场合。"
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

      {currentStep === 0 && (
        <Card title="选择数据源">
          <Row gutter={16}>
            {dataSourceOptions.map(opt => (
              <Col span={6} key={opt.value}>
                <Card
                  hoverable
                  onClick={() => { form.setFieldsValue({ dataSource: opt.value }); setCurrentStep(1); }}
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                >
                  <FileTextOutlined style={{ fontSize: 32, color: '#1677ff', marginBottom: 8 }} />
                  <div><Text strong>{opt.label}</Text></div>
                </Card>
              </Col>
            ))}
          </Row>
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button type="primary" onClick={() => setCurrentStep(1)}>下一步</Button>
          </div>
        </Card>
      )}

      {currentStep === 1 && (
        <Card title="配置生成参数">
          <Form form={form} layout="vertical" style={{ maxWidth: 600 }}>
            <Form.Item name="dataSource" label="数据源" rules={[{ required: true }]} initialValue="samples">
              <Select options={dataSourceOptions} placeholder="选择数据源" />
            </Form.Item>
            <Form.Item name="timeRange" label="时间范围" rules={[{ required: true }]}>
              <RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
            </Form.Item>
            <Form.Item name="reportType" label="报告类型" rules={[{ required: true }]} initialValue="summary">
              <Select options={reportTypeOptions} placeholder="选择报告类型" />
            </Form.Item>
            <Space>
              <Button onClick={() => setCurrentStep(0)}>上一步</Button>
              <Button type="primary" onClick={handleGenerate} loading={generating}>
                <RobotOutlined /> {generating ? '生成中...' : '生成报告'}
              </Button>
            </Space>
          </Form>
        </Card>
      )}

      {currentStep === 2 && previewReport && (
        <Row gutter={16}>
          <Col span={16}>
            <Card
              title={`预览: ${previewReport.name}`}
              extra={
                <Space>
                  {!editing ? (
                    <Button size="small" icon={<EditOutlined />} onClick={() => setEditing(true)}>编辑</Button>
                  ) : (
                    <Button size="small" type="primary" icon={<CheckCircleOutlined />} onClick={() => { setEditing(false); message.success('已保存'); }}>完成</Button>
                  )}
                  <Button size="small" icon={<CopyOutlined />} onClick={handleCopy}>复制</Button>
                  <Button size="small" icon={<DownloadOutlined />} onClick={handleExport}>导出</Button>
                </Space>
              }
            >
              {editing ? (
                <TextArea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  autoSize={{ minRows: 20 }}
                />
              ) : (
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: 14 }}>
                  {previewReport.generatedContent}
                </div>
              )}
            </Card>
          </Col>
          <Col span={8}>
            <Card title="报告信息" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div><Text type="secondary">数据源</Text><br /><Text strong>{dataSourceOptions.find(o => o.value === previewReport.dataSource)?.label}</Text></div>
                <div><Text type="secondary">报告类型</Text><br /><Text strong>{reportTypeOptions.find(o => o.value === previewReport.reportType)?.label}</Text></div>
                <div><Text type="secondary">时间范围</Text><br /><Text strong>{previewReport.timeRange[0]} ~ {previewReport.timeRange[1]}</Text></div>
                <div><Text type="secondary">状态</Text><br /><Tag color={statusColor[previewReport.status]}>{statusLabel[previewReport.status]}</Tag></div>
                <Divider />
                <Button block onClick={() => { setCurrentStep(0); setPreviewReport(null); }}>生成新报告</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {currentStep !== 2 && (
        <>
          <Divider orientation="left">历史报告</Divider>
          <Table
            columns={columns}
            dataSource={reports}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 5 }}
            size="small"
          />
        </>
      )}
    </div>
  );
};

export default AIReportPage;
