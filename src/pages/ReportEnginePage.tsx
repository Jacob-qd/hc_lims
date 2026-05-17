import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs,
  Select, message, Modal, Form, Input, Steps, Checkbox, Radio,
  Tooltip, Popconfirm, Empty, Divider, Alert
} from 'antd';
import {
  PlusOutlined, BarChartOutlined, FileTextOutlined, ClockCircleOutlined,
  SettingOutlined, PlayCircleOutlined, DownloadOutlined, EditOutlined,
  DeleteOutlined, EyeOutlined, AreaChartOutlined,
  PieChartOutlined, LineChartOutlined, TableOutlined, DashboardOutlined,
  FileExcelOutlined, FilePdfOutlined, FileTextTwoTone
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Step } = Steps;

interface ReportTemplate {
  id: string;
  name: string;
  type: 'scheduled' | 'manual';
  dataSource: string;
  outputFormat: string[];
  status: 'active' | 'draft';
  fields: any[];
  filters: any[];
  chartConfig?: any;
  outputSettings: any;
  cronExpression?: string;
  nextRunTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChartComponent {
  id: string;
  name: string;
  type: string;
  dataSource: string;
  config: any;
  previewData: any[];
  createdAt: string;
}

interface ReportSchedule {
  id: string;
  reportId: string;
  reportName: string;
  cronExpression: string;
  nextRunTime: string;
  lastRunTime?: string;
  lastRunStatus?: 'success' | 'failed' | 'running';
  outputFile?: string;
  enabled: boolean;
}

interface ReportExecution {
  id: string;
  reportId: string;
  reportName: string;
  scheduledTime: string;
  actualTime: string;
  status: 'success' | 'failed' | 'running';
  outputFile?: string;
  outputSize?: string;
  errorMessage?: string;
  triggerType: 'manual' | 'scheduled';
}

interface DataSource {
  key: string;
  name: string;
  fields: string[];
}

const chartTypeOptions = [
  { value: 'line', label: '折线图', icon: <LineChartOutlined /> },
  { value: 'bar', label: '柱状图', icon: <BarChartOutlined /> },
  { value: 'pie', label: '饼图', icon: <PieChartOutlined /> },
  { value: 'area', label: '面积图', icon: <AreaChartOutlined /> },
  { value: 'kpi', label: 'KPI卡片', icon: <DashboardOutlined /> },
  { value: 'table', label: '数据表格', icon: <TableOutlined /> },
];

export const ReportEnginePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [charts, setCharts] = useState<ChartComponent[]>([]);
  const [schedules, setSchedules] = useState<ReportSchedule[]>([]);
  const [executions, setExecutions] = useState<ReportExecution[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [chartForm] = Form.useForm();
  const [outputForm] = Form.useForm();

  const [selectedFields, setSelectedFields] = useState<any[]>([]);
  const [filters, setFilters] = useState<any[]>([]);

  const [previewChart, setPreviewChart] = useState<ChartComponent | null>(null);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [logContent, setLogContent] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes, eRes, dRes] = await Promise.all([
        fetch('/api/v1/reports/templates').then(r => r.json()),
        fetch('/api/v1/reports/charts').then(r => r.json()),
        fetch('/api/v1/reports/schedules').then(r => r.json()),
        fetch('/api/v1/reports/executions').then(r => r.json()),
        fetch('/api/v1/reports/data-sources').then(r => r.json()),
      ]);
      if (tRes.code === 200) setTemplates(tRes.data.list);
      if (cRes.code === 200) setCharts(cRes.data.list);
      if (sRes.code === 200) setSchedules(sRes.data.list);
      if (eRes.code === 200) setExecutions(eRes.data.list);
      if (dRes.code === 200) setDataSources(dRes.data.list || []);
    } catch (e) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setCurrentStep(0);
    setSelectedFields([]);
    setFilters([]);
    form.resetFields();
    fieldForm.resetFields();
    filterForm.resetFields();
    chartForm.resetFields();
    outputForm.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (record: ReportTemplate) => {
    setModalMode('edit');
    setEditingId(record.id);
    setCurrentStep(0);
    setSelectedFields(record.fields || []);
    setFilters(record.filters || []);
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      dataSource: record.dataSource,
    });
    chartForm.setFieldsValue(record.chartConfig || {});
    outputForm.setFieldsValue(record.outputSettings || {});
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const base = await form.validateFields();
      const chart = await chartForm.validateFields().catch(() => ({}));
      const output = await outputForm.validateFields();
      const payload = {
        ...base,
        fields: selectedFields,
        filters,
        chartConfig: chart,
        outputSettings: output,
        outputFormat: [output.format],
      };
      const url = modalMode === 'create' ? '/api/v1/reports/templates' : `/api/v1/reports/templates/${editingId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (data.code === 200) {
        message.success(modalMode === 'create' ? '创建成功' : '更新成功');
        setModalVisible(false);
        fetchData();
      } else {
        message.error(data.message || '操作失败');
      }
    } catch (e) {
      message.error('请完善表单信息');
    }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/v1/reports/templates/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.code === 200) {
      message.success('删除成功');
      fetchData();
    }
  };

  const handleRun = async (record: ReportTemplate) => {
    const res = await fetch('/api/v1/reports/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId: record.id }),
    });
    const data = await res.json();
    if (data.code === 200) {
      message.success('报表生成成功');
      fetchData();
    }
  };

  const handleToggleSchedule = async (sch: ReportSchedule) => {
    const res = await fetch(`/api/v1/reports/schedules/${sch.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !sch.enabled }),
    });
    const data = await res.json();
    if (data.code === 200) {
      message.success('状态更新成功');
      fetchData();
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    const res = await fetch(`/api/v1/reports/schedules/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.code === 200) {
      message.success('删除成功');
      fetchData();
    }
  };

  const getDataSourceOptions = () => dataSources.map(ds => ({ value: ds.key, label: ds.name }));
  const getFieldOptions = (dsKey?: string) => {
    const ds = dataSources.find(d => d.key === dsKey);
    if (!ds) return [];
    return ds.fields.map((f: string) => ({ value: f, label: f }));
  };
  const getDataSourceLabel = (key: string) => dataSources.find(ds => ds.key === key)?.name || key;

  const handleDownload = (fileName?: string) => {
    if (!fileName) return;
    message.success(`开始下载: ${fileName}`);
  };

  const addField = () => {
    const values = fieldForm.getFieldsValue();
    if (!values.fieldKey) return;
    const ds = form.getFieldValue('dataSource');
    const opts = getFieldOptions(ds);
    const opt = opts.find((o: any) => o.value === values.fieldKey);
    setSelectedFields(prev => [...prev, {
      fieldKey: values.fieldKey,
      label: opt?.label || values.fieldKey,
      alias: values.alias || opt?.label || values.fieldKey,
      aggregation: values.aggregation || 'none',
    }]);
    fieldForm.resetFields();
  };

  const removeField = (index: number) => {
    setSelectedFields(prev => prev.filter((_, i) => i !== index));
  };

  const addFilter = () => {
    const values = filterForm.getFieldsValue();
    if (!values.field || !values.operator) return;
    setFilters(prev => [...prev, { ...values, logic: values.logic || 'AND' }]);
    filterForm.resetFields();
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const renderSimpleChart = (chart: ChartComponent) => {
    if (!chart.previewData || chart.previewData.length === 0) return <Empty description="暂无数据" />;
    if (chart.type === 'kpi') {
      return (
        <Row gutter={[8, 8]}>
          {chart.previewData.map((d: any, i: number) => (
            <Col span={12} key={i}>
              <Card size="small">
                <Statistic title={d.label} value={d.value} suffix={d.unit} />
                <Text type="secondary" style={{ fontSize: 12 }}>{d.trend}</Text>
              </Card>
            </Col>
          ))}
        </Row>
      );
    }
    if (chart.type === 'pie') {
      const total = chart.previewData.reduce((s: number, d: any) => s + (d.count || 0), 0);
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {chart.previewData.map((d: any, i: number) => {
            const pct = total ? Math.round((d.count / total) * 100) : 0;
            const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: colors[i % colors.length] }} />
                <Text style={{ fontSize: 12 }}>{d[Object.keys(d)[0]]}: {pct}%</Text>
              </div>
            );
          })}
        </div>
      );
    }
    const maxVal = Math.max(...chart.previewData.map((d: any) => d[Object.keys(d).find(k => k !== 'month' && k !== 'date') || 'count'] || 0));
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100, paddingTop: 8 }}>
        {chart.previewData.map((d: any, i: number) => {
          const valKey = Object.keys(d).find(k => k !== 'month' && k !== 'date') || 'count';
          const val = d[valKey] || 0;
          const height = maxVal ? (val / maxVal) * 80 : 0;
          const colors = ['#1890ff', '#52c41a', '#faad14'];
          return (
            <Tooltip key={i} title={`${d.month || d.date || d.labName || d.testItem || ''}: ${val}`}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{ width: '80%', height, background: colors[i % colors.length], borderRadius: 2, minHeight: 4 }} />
                <Text style={{ fontSize: 10, marginTop: 2 }}>{(d.month || d.date || d.labName || d.testItem || '').toString().slice(-2)}</Text>
              </div>
            </Tooltip>
          );
        })}
      </div>
    );
  };

  const templateColumns = [
    { title: '报表名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (t: string) => <Tag color={t === 'scheduled' ? 'blue' : 'orange'}>{t === 'scheduled' ? '定时' : '手动'}</Tag> },
    { title: '数据源', dataIndex: 'dataSource', key: 'dataSource', render: (v: string) => getDataSourceLabel(v) },
    { title: '输出格式', dataIndex: 'outputFormat', key: 'outputFormat', render: (v: string[]) => <Space>{v.map(f => <Tag key={f}>{f}</Tag>)}</Space> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'active' ? 'green' : 'default'}>{s === 'active' ? '已启用' : '草稿'}</Tag> },
    { title: '下次执行', dataIndex: 'nextRunTime', key: 'nextRunTime', render: (v: string) => v || '-' },
    {
      title: '操作', key: 'action', render: (_: any, record: ReportTemplate) => (
        <Space size="small">
          <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleRun(record)}>运行</Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => openEditModal(record)}>编辑</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => message.info('请先生成报表')}>下载</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const executionColumns = [
    { title: '报表名称', dataIndex: 'reportName', key: 'reportName' },
    { title: '触发方式', dataIndex: 'triggerType', key: 'triggerType', render: (t: string) => <Tag>{t === 'manual' ? '手动' : '定时'}</Tag> },
    { title: '计划时间', dataIndex: 'scheduledTime', key: 'scheduledTime' },
    { title: '实际执行', dataIndex: 'actualTime', key: 'actualTime' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (s: string) => <Tag color={s === 'success' ? 'green' : s === 'failed' ? 'red' : 'blue'}>{s === 'success' ? '成功' : s === 'failed' ? '失败' : '执行中'}</Tag> },
    { title: '输出文件', dataIndex: 'outputFile', key: 'outputFile', render: (v: string) => v || '-' },
    { title: '大小', dataIndex: 'outputSize', key: 'outputSize', render: (v: string) => v || '-' },
    {
      title: '操作', key: 'action', render: (_: any, record: ReportExecution) => (
        <Space size="small">
          {record.outputFile && <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(record.outputFile)}>下载</Button>}
          {record.status === 'failed' && (
            <Button type="link" size="small" onClick={() => { setLogContent(record.errorMessage || '未知错误'); setLogModalVisible(true); }}>查看日志</Button>
          )}
        </Space>
      ),
    },
  ];

  const scheduleColumns = [
    { title: '报表名称', dataIndex: 'reportName', key: 'reportName' },
    { title: 'Cron表达式', dataIndex: 'cronExpression', key: 'cronExpression', render: (v: string) => <Tag color="purple">{v}</Tag> },
    { title: '下次执行', dataIndex: 'nextRunTime', key: 'nextRunTime' },
    { title: '上次执行', dataIndex: 'lastRunTime', key: 'lastRunTime', render: (v: string) => v || '-' },
    { title: '上次状态', dataIndex: 'lastRunStatus', key: 'lastRunStatus', render: (s: string) => s ? <Tag color={s === 'success' ? 'green' : 'red'}>{s === 'success' ? '成功' : '失败'}</Tag> : '-' },
    {
      title: '状态', dataIndex: 'enabled', key: 'enabled', render: (v: boolean, record: ReportSchedule) => (
        <Button type="link" size="small" onClick={() => handleToggleSchedule(record)}>
          <Tag color={v ? 'green' : 'default'}>{v ? '启用' : '禁用'}</Tag>
        </Button>
      ),
    },
    {
      title: '操作', key: 'action', render: (_: any, record: ReportSchedule) => (
        <Space size="small">
          <Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleRun(templates.find(t => t.id === record.reportId) || { id: record.reportId, name: record.reportName } as any)}>立即执行</Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDeleteSchedule(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const steps = ['基础信息', '字段配置', '筛选条件', '图表配置', '输出设置'];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="报表名称" rules={[{ required: true }]}>
              <Input placeholder="请输入报表名称" />
            </Form.Item>
            <Form.Item name="type" label="报表类型" rules={[{ required: true }]}>
              <Radio.Group>
                <Radio.Button value="scheduled">定时报表</Radio.Button>
                <Radio.Button value="manual">手动报表</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="dataSource" label="数据源" rules={[{ required: true }]}>
              <Select placeholder="选择数据源" options={getDataSourceOptions()} />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
              {({ getFieldValue }) =>
                getFieldValue('type') === 'scheduled' ? (
                  <>
                    <Form.Item name="cronExpression" label="Cron表达式">
                      <Input placeholder="0 0 1 * *" />
                    </Form.Item>
                    <Alert message="示例: 0 0 1 * * = 每月1日0点; 0 8 * * 1 = 每周一8点" type="info" showIcon style={{ marginBottom: 16 }} />
                  </>
                ) : null
              }
            </Form.Item>
          </Form>
        );
      case 1:
        return (
          <div>
            <Form form={fieldForm} layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item name="fieldKey" label="字段" style={{ minWidth: 160 }}>
                <Select
                  placeholder="选择字段"
                  options={getFieldOptions(form.getFieldValue('dataSource'))}
                />
              </Form.Item>
              <Form.Item name="alias" label="别名" style={{ minWidth: 120 }}>
                <Input placeholder="显示名称" />
              </Form.Item>
              <Form.Item name="aggregation" label="聚合" style={{ minWidth: 100 }}>
                <Select placeholder="无" allowClear options={[
                  { value: 'none', label: '无' },
                  { value: 'sum', label: '求和' },
                  { value: 'avg', label: '平均' },
                  { value: 'count', label: '计数' },
                  { value: 'min', label: '最小' },
                  { value: 'max', label: '最大' },
                ]} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={addField}>添加</Button>
              </Form.Item>
            </Form>
            <Table
              dataSource={selectedFields}
              rowKey={(_r, i) => String(i)}
              size="small"
              pagination={false}
              columns={[
                { title: '字段', dataIndex: 'fieldKey' },
                { title: '别名', dataIndex: 'alias' },
                { title: '聚合', dataIndex: 'aggregation', render: (v: string) => v === 'none' ? '-' : v },
                { title: '操作', render: (_, __, index) => <Button type="link" danger size="small" onClick={() => removeField(index)}>删除</Button> },
              ]}
            />
          </div>
        );
      case 2:
        return (
          <div>
            <Form form={filterForm} layout="inline" style={{ marginBottom: 16 }}>
              <Form.Item name="field" label="字段" style={{ minWidth: 140 }}>
                <Select placeholder="选择字段" options={getFieldOptions(form.getFieldValue('dataSource'))} />
              </Form.Item>
              <Form.Item name="operator" label="操作符" style={{ minWidth: 100 }}>
                <Select placeholder="选择" options={[
                  { value: 'eq', label: '等于' },
                  { value: 'ne', label: '不等于' },
                  { value: 'gt', label: '大于' },
                  { value: 'gte', label: '大于等于' },
                  { value: 'lt', label: '小于' },
                  { value: 'lte', label: '小于等于' },
                  { value: 'contains', label: '包含' },
                  { value: 'in', label: '在列表中' },
                  { value: 'between', label: '介于' },
                ]} />
              </Form.Item>
              <Form.Item name="value" label="值" style={{ minWidth: 120 }}>
                <Input placeholder="输入值" />
              </Form.Item>
              <Form.Item name="logic" label="逻辑" style={{ minWidth: 80 }}>
                <Select options={[{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }]} />
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={addFilter}>添加</Button>
              </Form.Item>
            </Form>
            <Table
              dataSource={filters}
              rowKey={(_r, i) => String(i)}
              size="small"
              pagination={false}
              columns={[
                { title: '字段', dataIndex: 'field' },
                { title: '操作符', dataIndex: 'operator' },
                { title: '值', dataIndex: 'value', render: (v: any) => String(v) },
                { title: '逻辑', dataIndex: 'logic' },
                { title: '操作', render: (_, __, index) => <Button type="link" danger size="small" onClick={() => removeFilter(index)}>删除</Button> },
              ]}
            />
          </div>
        );
      case 3:
        return (
          <Form form={chartForm} layout="vertical">
            <Form.Item name="chartType" label="图表类型">
              <Radio.Group>
                {chartTypeOptions.map(o => (
                  <Radio.Button key={o.value} value={o.value}>{o.icon} {o.label}</Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item name="xAxis" label="X轴字段">
              <Select placeholder="选择X轴字段" allowClear options={getFieldOptions(form.getFieldValue('dataSource'))} />
            </Form.Item>
            <Form.Item name="yAxis" label="Y轴字段">
              <Select placeholder="选择Y轴字段" allowClear options={getFieldOptions(form.getFieldValue('dataSource'))} />
            </Form.Item>
            <Form.Item name="colorField" label="颜色字段">
              <Select placeholder="选择颜色字段" allowClear options={getFieldOptions(form.getFieldValue('dataSource'))} />
            </Form.Item>
            <Form.Item name="legend" valuePropName="checked" initialValue={true}>
              <Checkbox>显示图例</Checkbox>
            </Form.Item>
          </Form>
        );
      case 4:
        return (
          <Form form={outputForm} layout="vertical">
            <Form.Item name="format" label="输出格式" rules={[{ required: true }]} initialValue="PDF">
              <Radio.Group>
                <Radio.Button value="PDF"><FilePdfOutlined /> PDF</Radio.Button>
                <Radio.Button value="Excel"><FileExcelOutlined /> Excel</Radio.Button>
                <Radio.Button value="CSV"><FileTextOutlined /> CSV</Radio.Button>
                <Radio.Button value="HTML"><FileTextTwoTone /> HTML</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="pageSize" label="页面大小" initialValue="A4">
              <Radio.Group>
                <Radio.Button value="A4">A4</Radio.Button>
                <Radio.Button value="A3">A3</Radio.Button>
                <Radio.Button value="Letter">Letter</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="orientation" label="方向" initialValue="portrait">
              <Radio.Group>
                <Radio.Button value="portrait">纵向</Radio.Button>
                <Radio.Button value="landscape">横向</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item name="headerText" label="页眉文字">
              <Input placeholder="红创检测认证有限公司" />
            </Form.Item>
            <Form.Item name="footerText" label="页脚文字">
              <Input placeholder="机密文件" />
            </Form.Item>
          </Form>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><BarChartOutlined /> 报表引擎</Title></Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>新建报表</Button>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="报表模板" value={templates.length} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="定时报表" value={templates.filter(r => r.type === 'scheduled').length} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="图表组件" value={charts.length} prefix={<BarChartOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="数据源" value={dataSources.length} prefix={<FileTextOutlined />} /></Card></Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
        {
          key: 'templates', label: '报表模板',
          children: (
            <Card>
              <Table dataSource={templates} rowKey="id" columns={templateColumns} loading={loading} size="middle" />
            </Card>
          ),
        },
        {
          key: 'charts', label: '图表组件库',
          children: (
            <Card>
              <Row gutter={[16, 16]}>
                {charts.map(chart => (
                  <Col xs={24} sm={12} lg={8} key={chart.id}>
                    <Card
                      title={chart.name}
                      size="small"
                      extra={<Tag>{chartTypeOptions.find(o => o.value === chart.type)?.label || chart.type}</Tag>}
                      actions={[
                        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setPreviewChart(chart)}>预览</Button>,
                        <Button type="link" size="small" icon={<SettingOutlined />}>配置</Button>,
                      ]}
                    >
                      <Text type="secondary" style={{ fontSize: 12 }}>数据源: {getDataSourceLabel(chart.dataSource)}</Text>
                      <Divider style={{ margin: '8px 0' }} />
                      {renderSimpleChart(chart)}
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          ),
        },
        {
          key: 'schedules', label: '调度任务',
          children: (
            <Card>
              <Tabs items={[
                {
                  key: 'schedule-list', label: '定时配置',
                  children: <Table dataSource={schedules} rowKey="id" columns={scheduleColumns} loading={loading} size="middle" />,
                },
                {
                  key: 'history', label: '执行历史',
                  children: <Table dataSource={executions} rowKey="id" columns={executionColumns} loading={loading} size="middle" />,
                },
              ]} />
            </Card>
          ),
        },
      ]} />

      <Modal
        title={modalMode === 'create' ? '新建报表' : '编辑报表'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={(
          <Space>
            {currentStep > 0 && <Button onClick={() => setCurrentStep(currentStep - 1)}>上一步</Button>}
            {currentStep < steps.length - 1 && <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>下一步</Button>}
            {currentStep === steps.length - 1 && <Button type="primary" onClick={handleSave}>保存</Button>}
          </Space>
        )}
      >
        <Steps current={currentStep} size="small" style={{ marginBottom: 24 }}>
          {steps.map(s => <Step key={s} title={s} />)}
        </Steps>
        {renderStepContent()}
      </Modal>

      <Modal title="图表预览" open={!!previewChart} onCancel={() => setPreviewChart(null)} footer={null} width={600}>
        {previewChart && (
          <div>
            <Title level={5}>{previewChart.name}</Title>
            <Text type="secondary">类型: {chartTypeOptions.find(o => o.value === previewChart.type)?.label}</Text>
            <Divider />
            {renderSimpleChart(previewChart)}
          </div>
        )}
      </Modal>

      <Modal title="执行日志" open={logModalVisible} onCancel={() => setLogModalVisible(false)} footer={null}>
        <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, maxHeight: 300, overflow: 'auto' }}>{logContent}</pre>
      </Modal>
    </div>
  );
};
