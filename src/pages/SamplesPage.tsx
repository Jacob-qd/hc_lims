import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card, Table, Tag, Button, Input, Select, DatePicker, Row, Col,
  Space, Typography, Drawer, Timeline, Steps, Form,
  Modal, message, Radio, Upload, Alert, Divider,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, PrinterOutlined, ExportOutlined,
  DeleteOutlined, InboxOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Sample } from '../mocks/data';
import { sampleTypes, sampleStatuses, customers, projects } from '../mocks/data';
// import type { Dayjs } from 'dayjs';
import { DynamicFieldRenderer } from '../components/DynamicFieldRenderer';
import type { FieldConfig } from '../types/dynamicForm';
import { BarcodePrintModal, generateSampleBarcode, BatchBarcodePrint } from '../components/BarcodeLabel';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

export const SamplesPage: React.FC = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [detailData, setDetailData] = useState<any>(null);
  const [flowHistory, setFlowHistory] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [barcodeVisible, setBarcodeVisible] = useState(false);
  const [barcodeCode, setBarcodeCode] = useState('');
  const [barcodeLabel, setBarcodeLabel] = useState('');
  const [batchBarcodeVisible, setBatchBarcodeVisible] = useState(false);
  const [batchBarcodeCodes, setBatchBarcodeCodes] = useState<{code:string;label:string}[]>([]);
  const [form] = Form.useForm();
  const [selectedTestItems, setSelectedTestItems] = useState<string[]>([]);
  const [testItemOptions, setTestItemOptions] = useState<any[]>([]);
  const [stats] = useState({ todayReceive: 42, pendingReceive: 18, inStock: 1248, urgent: 7 });
  const [dynamicConfigs, setDynamicConfigs] = useState<FieldConfig[]>([]);
  const [dynamicValues, setDynamicValues] = useState<Record<string, unknown>>({});
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);

  const loadDynamicConfigs = async (module: string) => {
    try {
      const res = await fetch('/api/v1/field-configs?module=' + module);
      const json = await res.json();
      setDynamicConfigs(json.data?.list?.filter((f: FieldConfig) => f.active !== false) || []);
    } catch { setDynamicConfigs([]); }
  };

  useEffect(() => {
    if (wizardOpen) loadDynamicConfigs('sample');
  }, [wizardOpen]);

  useEffect(() => {
    loadSamples();
    fetch('/api/v1/test-items').then(r => r.json()).then(res => {
      if (res.code === 200) setTestItemOptions(res.data);
    });
  }, []);

  const loadSamples = () => {
    setLoading(true);
    fetch('/api/v1/samples').then(r => r.json()).then(res => {
      if (res.code === 200) {
        setSamples(res.data.list);
      }
      setLoading(false);
    });
  };

  const showDetail = (sample: Sample) => {
    setSelectedSample(sample);
    setDetailOpen(true);
    Promise.all([
      fetch(`/api/v1/samples/${sample.id}/detail`).then(r => r.json()),
      fetch(`/api/v1/samples/${sample.id}/flow-history`).then(r => r.json()),
    ]).then(([detailRes, flowRes]) => {
      if (detailRes.code === 200) setDetailData(detailRes.data);
      if (flowRes.code === 200) setFlowHistory(flowRes.data);
    });
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      '待接收': 'blue', '已接收': 'cyan', '待分配': 'blue',
      '已分配': 'processing', '检测中': 'warning',
      '待审核': 'purple', '审核中': 'processing', '已完成': 'success',
    };
    return map[status] || 'default';
  };

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = { urgent: 'red', high: 'orange', normal: 'blue', low: 'green' };
    return map[priority] || 'default';
  };

  const columns: ColumnsType<Sample> = [
    { title: '样品编号', dataIndex: 'sampleNo', key: 'sampleNo', width: 140 },
    { title: '样品名称', dataIndex: 'name', key: 'name' },
    { title: '样品类型', dataIndex: 'typeLabel', key: 'typeLabel', width: 100 },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    { title: '接收日期', dataIndex: 'receivingTime', key: 'receivingTime', width: 160 },
    { title: '容器/规格', dataIndex: 'containerInfo', key: 'containerInfo', width: 120 },
    { title: '存储条件', dataIndex: 'storageCondition', key: 'storageCondition', width: 100 },
    {
      title: '优先级', dataIndex: 'priorityLabel', key: 'priority', width: 80,
      render: (v, record) => <Tag color={getPriorityColor(record.priority)}>{v}</Tag>,
    },
    {
      title: '状态', dataIndex: 'statusLabel', key: 'status', width: 90,
      render: (v) => <Tag color={getStatusColor(v)}>{v}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 140, fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => showDetail(record)}>详情</Button>
          <Button type="link" size="small" onClick={() => navigate('/tasks?sample='+record.sampleNo)}>任务</Button>
          <Button type="link" size="small" onClick={() => { setBarcodeCode(generateSampleBarcode(parseInt(record.id.replace('s',''))||1)); setBarcodeLabel(record.sampleNo+' '+record.name); setBarcodeVisible(true); }}>条码</Button>
        </Space>
      ),
    },
  ];

  const handleWizardNext = async () => {
    try {
      await form.validateFields();
      if (currentStep === 3 && selectedTestItems.length === 0) {
        message.warning('请至少选择1个检测项目');
        return;
      }
      setCurrentStep(currentStep + 1);
    } catch { /* validation failed */ }
  };

  const handleWizardSubmit = async () => {
    const values = form.getFieldsValue();
    const payload = {
      ...values,
      testItemIds: selectedTestItems,
      status: 'pending_receive',
    };
    const res = await fetch('/api/v1/samples', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());
    if (res.code === 200) {
      message.success('样品登记成功');
      setWizardOpen(false);
      setCurrentStep(0);
      form.resetFields();
      setSelectedTestItems([]);
      loadSamples();
    }
  };

  const renderWizardStep = () => {
    switch (currentStep) {
      case 0: return (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="样品编号" name="sampleNo">
                <Input disabled placeholder="系统自动生成" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="样品名称" name="name" rules={[{ required: true }]}>
                <Input placeholder="请输入样品名称，如：地表水样品-1" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="样品类型" name="type" rules={[{ required: true }]}>
                <Select placeholder="请选择样品类型">
                  {sampleTypes.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="客户名称" name="customerId" rules={[{ required: true }]}>
                <Select placeholder="请选择客户" showSearch>
                  {customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="来源项目" name="projectId">
                <Select placeholder="请选择来源项目" allowClear>
                  {projects.map(p => <Option key={p.id} value={p.id}>{p.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="采样地点" name="samplingLocation" rules={[{ required: true }]}>
                <Input placeholder="请输入采样地点" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="采样时间" name="samplingTime" rules={[{ required: true }]}>
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="优先级" name="priority" initialValue="normal">
                <Radio.Group>
                  <Radio value="normal">常规</Radio>
                  <Radio value="high">高</Radio>
                  <Radio value="urgent">紧急</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          {/* 动态表单: 根据样品类型显示自定义字段 */}
          <Divider>扩展信息</Divider>
          <DynamicFieldRenderer
            configs={dynamicConfigs}
            values={dynamicValues}
            onChange={setDynamicValues}
          />
        </>
      );
      case 1: return (
        <>
          <Alert message="请填写容器与保存信息" type="info" showIcon style={{ marginBottom: 16 }} />
          <Form.List name="containers" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <Card key={field.key} size="small" title={`容器 ${index + 1}`} extra={
                    fields.length > 1 && <Button type="link" danger size="small" onClick={() => remove(field.name)}>删除</Button>
                  } style={{ marginBottom: 8 }}>
                    <Row gutter={16}>
                      <Col span={6}>
                        <Form.Item {...field} name={[field.name, 'type']} label="容器类型" rules={[{ required: true }]}>
                          <Select placeholder="请选择"><Option value="PE瓶">PE瓶</Option><Option value="玻璃瓶">玻璃瓶</Option><Option value="自封袋">自封袋</Option></Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...field} name={[field.name, 'spec']} label="规格" rules={[{ required: true }]}>
                          <Select placeholder="请选择"><Option value="500mL">500mL</Option><Option value="1L">1L</Option><Option value="250mL">250mL</Option></Select>
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...field} name={[field.name, 'quantity']} label="数量" rules={[{ required: true }]}>
                          <Input type="number" />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...field} name={[field.name, 'storage']} label="保存条件" rules={[{ required: true }]}>
                          <Select placeholder="请选择"><Option value="4℃冷藏">4℃冷藏</Option><Option value="常温">常温</Option><Option value="-20℃冷冻">-20℃冷冻</Option></Select>
                        </Form.Item>
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block>+ 添加容器</Button>
              </>
            )}
          </Form.List>
        </>
      );
      case 2: return (
        <>
          <Alert message="请至少选择1个检测项目" type="info" showIcon style={{ marginBottom: 16 }} />
          <Table
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedTestItems,
              onChange: (keys) => setSelectedTestItems(keys as string[]),
            }}
            dataSource={testItemOptions}
            rowKey="id"
            columns={[
              { title: '项目名称', dataIndex: 'name', key: 'name' },
              { title: '检测方法', dataIndex: 'method', key: 'method' },
              { title: '预计完成', dataIndex: 'plannedDate', key: 'plannedDate' },
              { title: '分配实验室', dataIndex: 'labName', key: 'labName' },
              { title: '优先级', dataIndex: 'priority', key: 'priority', render: (v) => <Tag color={v === 'urgent' ? 'red' : 'blue'}>{v === 'urgent' ? '加急' : '常规'}</Tag> },
            ]}
            pagination={false}
          />
        </>
      );
      case 3: return (
        <>
          <Alert message="请确认样品信息" type="info" showIcon style={{ marginBottom: 16 }} />
          <Card title="基本信息预览" size="small">
            <Row gutter={16}>
              <Col span={12}><Text type="secondary">样品名称：</Text><Text strong>{form.getFieldValue('name') || '-'}</Text></Col>
              <Col span={12}><Text type="secondary">样品类型：</Text><Text strong>{sampleTypes.find(t => t.value === form.getFieldValue('type'))?.label || '-'}</Text></Col>
              <Col span={12}><Text type="secondary">客户：</Text><Text strong>{customers.find(c => c.id === form.getFieldValue('customerId'))?.name || '-'}</Text></Col>
              <Col span={12}><Text type="secondary">优先级：</Text><Text strong>{form.getFieldValue('priority') === 'urgent' ? '紧急' : form.getFieldValue('priority') === 'high' ? '高' : '常规'}</Text></Col>
            </Row>
          </Card>
          <Card title="检测项目预览" size="small" style={{ marginTop: 16 }}>
            {selectedTestItems.length} 项已选择
          </Card>
        </>
      );
      default: return null;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { title: '今日接收样品', value: stats.todayReceive, change: '+12', color: '#1677ff', icon: <InboxOutlined /> },
          { title: '待接收样品', value: stats.pendingReceive, change: '-3', color: '#52c41a', icon: <InboxOutlined /> },
          { title: '在库样品', value: stats.inStock, change: '+96', color: '#faad14', icon: <InboxOutlined /> },
          { title: '紧急样品', value: stats.urgent, change: '+2', color: '#f5222d', icon: <ExclamationCircleOutlined /> },
        ].map((s, i) => (
          <Col span={6} key={i}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.color + '15', color: s.color, fontSize: 24 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ color: '#666', fontSize: 14 }}>{s.title}</div>
                  <div style={{ fontSize: 32, fontWeight: 'bold' }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: s.change.startsWith('+') ? '#52c41a' : '#f5222d' }}>较昨日 {s.change}</div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={4}>
            <Input placeholder="样品编号" prefix={<SearchOutlined />} />
          </Col>
          <Col span={4}>
            <Select placeholder="客户名称" style={{ width: '100%' }} allowClear>
              {customers.map(c => <Option key={c.id} value={c.id}>{c.name}</Option>)}
            </Select>
          </Col>
          <Col span={4}>
            <Select placeholder="样品类型" style={{ width: '100%' }} allowClear>
              {sampleTypes.map(t => <Option key={t.value} value={t.value}>{t.label}</Option>)}
            </Select>
          </Col>
          <Col span={4}>
            <DatePicker.RangePicker style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} />
          </Col>
          <Col span={4}>
            <Select placeholder="状态" style={{ width: '100%' }} allowClear>
              {sampleStatuses.map(s => <Option key={s.value} value={s.value}>{s.label}</Option>)}
            </Select>
          </Col>
          <Col span={4}>
            <Space>
              <Button onClick={loadSamples}>重置</Button>
              <Button type="primary" onClick={loadSamples}>查询</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Action Bar */}
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setWizardOpen(true)}>样品登记</Button>
        <Button icon={<InboxOutlined />} onClick={() => setImportOpen(true)}>批量导入</Button>
        <Button icon={<PrinterOutlined />} onClick={() => {
          const codes = samples.slice(0, 20).map(s => ({
            code: generateSampleBarcode(parseInt(s.id.replace('s','')) || 1),
            label: s.sampleNo + ' ' + s.name,
          }));
          setBatchBarcodeCodes(codes);
          setBatchBarcodeVisible(true);
        }}>打印条码</Button>
        <Button icon={<ExportOutlined />} onClick={() => message.success('数据已导出为Excel')}>导出</Button>
        <Button icon={<DeleteOutlined />} danger onClick={() => Modal.confirm({title:'确认删除',content:'确定删除选中的样品？',onOk:()=>message.success('已删除')})}>删除</Button>
      </Space>

      {/* Table */}
      <Card>
        <Table
          dataSource={samples}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Detail Drawer */}
      <Drawer
        title="样品详情"
        width={480}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
      >
        {selectedSample && (
          <>
            <div style={{ marginBottom: 24 }}>
              <Title level={5}>{selectedSample.sampleNo}</Title>
              <Tag color={getStatusColor(selectedSample.statusLabel)}>{selectedSample.statusLabel}</Tag>
              <Button type="link" style={{ float: 'right' }} onClick={() => { setDetailOpen(false); setSelectedSample(null); loadSamples(); }}>查看全部</Button>
            </div>

            <Card title="基本信息" size="small" style={{ marginBottom: 16 }}>
              <Row gutter={[8, 8]}>
                <Col span={12}><Text type="secondary">样品名称：</Text><Text>{selectedSample.name}</Text></Col>
                <Col span={12}><Text type="secondary">样品类型：</Text><Text>{selectedSample.typeLabel}</Text></Col>
                <Col span={12}><Text type="secondary">客户名称：</Text><Text>{selectedSample.customerName}</Text></Col>
                <Col span={12}><Text type="secondary">来源/项目：</Text><Text>{selectedSample.projectName}</Text></Col>
                <Col span={12}><Text type="secondary">接收时间：</Text><Text>{selectedSample.receivingTime}</Text></Col>
                <Col span={12}><Text type="secondary">接收人：</Text><Text>{selectedSample.receiverName}</Text></Col>
                <Col span={12}><Text type="secondary">容器/规格：</Text><Text>{selectedSample.containerInfo}</Text></Col>
                <Col span={12}><Text type="secondary">存储条件：</Text><Text>{selectedSample.storageCondition}</Text></Col>
                <Col span={12}><Text type="secondary">优先级：</Text><Tag color={getPriorityColor(selectedSample.priority)}>{selectedSample.priorityLabel}</Tag></Col>
                <Col span={12}><Text type="secondary">流转状态：</Text><Text>{selectedSample.flowStatusLabel}</Text></Col>
                <Col span={12}><Text type="secondary">分配实验室：</Text><Text>{selectedSample.assignedLabName || '-'}</Text></Col>
              </Row>
            </Card>

            {detailData && (
              <Card title="检测概览" size="small" style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold' }}>{detailData.testTotal}</div><div style={{ fontSize: 12, color: '#999' }}>检测项目</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>{detailData.tested}</div><div style={{ fontSize: 12, color: '#999' }}>已检测</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold', color: '#faad14' }}>{detailData.testing}</div><div style={{ fontSize: 12, color: '#999' }}>进行中</div></div>
                  <div><div style={{ fontSize: 24, fontWeight: 'bold', color: '#1677ff' }}>{detailData.completed}</div><div style={{ fontSize: 12, color: '#999' }}>已完成</div></div>
                </div>
                {detailData.testItems && (
                  <Table
                    dataSource={detailData.testItems}
                    columns={[{ title: '检测项目', dataIndex: 'name' }, { title: '方法标准', dataIndex: 'method' }, { title: '状态', dataIndex: 'status', render: (v: string) => <Tag color={v === '待检测' ? 'blue' : v === '检测中' ? 'warning' : 'success'}>{v}</Tag> }]}
                    size="small"
                    pagination={false}
                    style={{ marginTop: 16 }}
                  />
                )}
              </Card>
            )}

            <Card title="样品流转记录" size="small">
              <Timeline
                items={flowHistory.map(h => ({
                  color: h.action === '样品接收' ? 'green' : 'blue',
                  children: (
                    <div>
                      <Text strong>{h.action}</Text>
                      <div style={{ fontSize: 12, color: '#999' }}>{h.user} {h.time}</div>
                      <div style={{ fontSize: 12 }}>{h.desc}</div>
                    </div>
                  ),
                }))}
              />
            </Card>
          </>
        )}
      </Drawer>

      {/* New Sample Wizard */}
      <Modal
        title="新建样品登记"
        open={wizardOpen}
        onCancel={() => { setWizardOpen(false); setCurrentStep(0); form.resetFields(); setSelectedTestItems([]); }}
        width={800}
        footer={null}
      >
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          <Step title="基本信息" />
          <Step title="容器与保存" />
          <Step title="检测项目" />
          <Step title="确认提交" />
        </Steps>
        <Form form={form} layout="vertical">
          {renderWizardStep()}
        </Form>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 24 }}>
          {currentStep > 0 && <Button onClick={() => setCurrentStep(currentStep - 1)}>上一步</Button>}
          {currentStep < 3 && <Button type="primary" onClick={handleWizardNext}>下一步</Button>}
          {currentStep === 3 && <Button type="primary" onClick={handleWizardSubmit}>提交样品</Button>}
        </div>
      </Modal>
      <BarcodePrintModal visible={barcodeVisible} onClose={() => setBarcodeVisible(false)} code={barcodeCode} label={barcodeLabel} type="sample" />
      <BatchBarcodePrint visible={batchBarcodeVisible} onClose={() => setBatchBarcodeVisible(false)} codes={batchBarcodeCodes} />

      {/* 批量导入弹窗 */}
      <Modal title="批量导入样品" open={importOpen} onCancel={() => { setImportOpen(false); setImportFile(null); setImportPreview(null); }} footer={null} width={600}>
        {!importPreview ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <Upload.Dragger
              accept=".xlsx,.xls,.csv"
              showUploadList={false}
              beforeUpload={(file) => { setImportFile(file); return false; }}
            >
              <p className="ant-upload-drag-icon"><InboxOutlined /></p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持 .xlsx, .xls, .csv 格式，请先下载模板填写数据</p>
            </Upload.Dragger>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <Button onClick={() => message.info('模板下载中...')}>下载导入模板</Button>
              {importFile && <Button type="primary" onClick={() => {
                setImportPreview([
                  { row: 1, sampleNo: 'SMP-AUTO-001', name: '地表水样-1', type: '水质', location: '东湖', samplingDate: '2026-05-15', status: '校验通过' },
                  { row: 2, sampleNo: 'SMP-AUTO-002', name: '地表水样-2', type: '水质', location: '西湖', samplingDate: '2026-05-15', status: '校验通过' },
                  { row: 3, sampleNo: 'SMP-AUTO-003', name: '土壤样-1', type: '土壤', location: '厂区北门', samplingDate: '2026-05-14', status: '校验通过' },
                  { row: 4, name: '(空)', type: '水质', location: '南湖', samplingDate: '2026-05-15', status: '❌ 样品名称为空', _error: true },
                  { row: 5, sampleNo: 'SMP-AUTO-005', name: '空气样-1', type: '空气', location: '三楼平台', samplingDate: '2026-05-15', status: '校验通过' },
                ]);
              }}>解析文件</Button>}
            </div>
          </div>
        ) : (
          <div>
            <Alert message={`解析完成: ${importPreview.filter(i => !i._error).length} 条通过, ${importPreview.filter(i => i._error).length} 条有误`} type={importPreview.some(i => i._error) ? 'warning' : 'success'} showIcon style={{ marginBottom: 16 }} />
            <Table dataSource={importPreview} rowKey="row" pagination={false} size="small" columns={[
              { title: '行号', dataIndex: 'row', width: 50 },
              { title: '样品编号', dataIndex: 'sampleNo', width: 130 },
              { title: '名称', dataIndex: 'name', width: 120 },
              { title: '类型', dataIndex: 'type', width: 80 },
              { title: '采样地点', dataIndex: 'location', width: 100 },
              { title: '采样日期', dataIndex: 'samplingDate', width: 100 },
              { title: '校验结果', dataIndex: 'status', width: 150, render: (s: string, r: any) => <Text style={{ color: r._error ? '#ff4d4f' : '#52c41a' }}>{s}</Text> },
            ]} />
            <div style={{ marginTop: 16, textAlign: 'right' }}>
              <Button onClick={() => { setImportPreview(null); setImportFile(null); }}>返回修改</Button>
              <Button type="primary" style={{ marginLeft: 8 }} onClick={async () => {
                const valid = importPreview.filter(i => !i._error);
                message.success(`已导入 ${valid.length} 条样品`);
                setImportOpen(false); setImportPreview(null); setImportFile(null);
                loadSamples();
              }}>确认导入 ({importPreview.filter(i => !i._error).length}条)</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SamplesPage;
