import React, { useState } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Space, Input, Select, Modal, Form, message, Tabs, Descriptions, Drawer, Steps, Tooltip, Badge, List, Divider, Alert } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, EyeOutlined, CopyOutlined, PlayCircleOutlined, CheckCircleOutlined, FileTextOutlined, ExperimentOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;

// ===== Mock Templates =====
const mockTemplates = [
  { id: 'tpl1', name: 'COD检测模板', methodId: 'm1', methodName: 'HJ 828-2017', version: 'v2.1', status: 'published', fieldCount: 8, usedCount: 156, createdAt: '2024-05-01', updatedAt: '2024-05-15',
    sections: [
      { id: 'sec1', title: '样品信息', order: 1, fields: [
        { id: 'f1', label: '样品编号', type: 'auto', autoSource: 'sampleNo' },
        { id: 'f2', label: '样品名称', type: 'auto', autoSource: 'sampleName' },
        { id: 'f3', label: '检测方法', type: 'auto', autoSource: 'method' },
      ]},
      { id: 'sec2', title: '前处理记录', order: 2, fields: [
        { id: 'f4', label: '消解温度(℃)', type: 'number', required: true, defaultValue: '150' },
        { id: 'f5', label: '消解时间(min)', type: 'number', required: true, defaultValue: '120' },
        { id: 'f6', label: '加入试剂', type: 'select', options: ['重铬酸钾', '硫酸汞', '硫酸银'], required: true },
      ]},
      { id: 'sec3', title: '仪器读数', order: 3, fields: [
        { id: 'f7', label: '空白吸光度', type: 'number', defaultValue: '0.001' },
        { id: 'f8', label: '样品吸光度', type: 'number', required: true },
        { id: 'f9', label: '稀释倍数', type: 'number', defaultValue: '1' },
      ]},
      { id: 'sec4', title: '结果计算', order: 4, fields: [
        { id: 'f10', label: 'COD (mg/L)', type: 'calculation', formula: '(absorbance - blank) * K * dilution', formulaVars: { absorbance: 'f8', blank: 'f7', K: 80, dilution: 'f9' }, rounding: 'decimal_places', roundingValue: 1 },
      ]},
      { id: 'sec5', title: '结果判定', order: 5, fields: [
        { id: 'f11', label: '判定结果', type: 'judgment', standardValue: '≤50', unit: 'mg/L', judgmentRule: 'lte' },
      ]},
    ]},
  { id: 'tpl2', name: 'pH值检测模板', methodId: 'm2', methodName: 'HJ 1147-2020', version: 'v1.0', status: 'published', fieldCount: 4, usedCount: 89, createdAt: '2024-04-15', updatedAt: '2024-04-15',
    sections: [
      { id: 's1', title: '基本信息', order: 1, fields: [
        { id: 'p1', label: '样品编号', type: 'auto', autoSource: 'sampleNo' },
        { id: 'p2', label: '温度补偿(℃)', type: 'number', defaultValue: '25' },
        { id: 'p3', label: 'pH读数', type: 'number', required: true },
      ]},
      { id: 's2', title: '判定', order: 2, fields: [
        { id: 'p4', label: '判定', type: 'judgment', standardValue: '6.0-9.0', unit: '', judgmentRule: 'range' },
      ]},
    ]},
  { id: 'tpl3', name: '重金属检测模板', methodId: 'm3', methodName: 'GB/T 17141-1997', version: 'v1.2', status: 'draft', fieldCount: 6, usedCount: 0, createdAt: '2024-05-10', updatedAt: '2024-05-14',
    sections: [
      { id: 's1', title: '前处理', order: 1, fields: [
        { id: 'h1', label: '消解方式', type: 'select', options: ['微波消解', '电热板消解'], required: true },
        { id: 'h2', label: '称样量(g)', type: 'number', required: true },
        { id: 'h3', label: '定容体积(mL)', type: 'number', defaultValue: '50' },
      ]},
      { id: 's2', title: '测定', order: 2, fields: [
        { id: 'h4', label: 'Pb浓度(mg/L)', type: 'number', required: true },
        { id: 'h5', label: 'Cd浓度(mg/L)', type: 'number', required: true },
      ]},
      { id: 's3', title: '计算', order: 3, fields: [
        { id: 'h6', label: 'Pb (mg/kg)', type: 'calculation', formula: 'concentration * volume / weight', formulaVars: { concentration: 'h4', volume: 'h3', weight: 'h2' }, rounding: 'decimal_places', roundingValue: 1 },
      ]},
    ]},
];

// ===== Mock Records =====
const mockRecords = [
  { id: 'r1', templateId: 'tpl1', templateName: 'COD检测模板', templateVersion: 'v2.1', taskNo: 'TK-2025-002', sampleName: '地表水样品-1', analyst: '王明', status: 'submitted', createdAt: '2024-05-21 10:25', submittedAt: '2024-05-21 11:00' },
  { id: 'r2', templateId: 'tpl2', templateName: 'pH值检测模板', templateVersion: 'v1.0', taskNo: 'TK-2025-001', sampleName: '地表水样品-1', analyst: '张伟', status: 'reviewed', createdAt: '2024-05-21 09:30', submittedAt: '2024-05-21 09:45' },
  { id: 'r3', templateId: 'tpl1', templateName: 'COD检测模板', templateVersion: 'v2.1', taskNo: 'TK-2025-008', sampleName: '废水-纺织厂出口', analyst: '王明', status: 'draft', createdAt: '2024-05-15 14:00' },
];

// ===== GB/T 8170 Rounding =====
export function gb8170Round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  const scaled = value * factor;
  const floor = Math.floor(scaled);
  const remainder = scaled - floor;
  if (remainder < 0.5) return floor / factor;
  if (remainder > 0.5) return (floor + 1) / factor;
  return (floor % 2 === 0 ? floor : floor + 1) / factor;
}

export function evaluateFormula(formula: string, vars: Record<string, number>): number {
  // Simple formula evaluator for demo purposes
  // In production, use math.js safe sandbox
  const expr = formula.replace(/([a-zA-Z_]\w*)/g, (match) => {
    if (match in vars) return String(vars[match]);
    return match;
  });
  try {
    return Function('"use strict"; return (' + expr + ')')();
  } catch {
    return NaN;
  }
}

export function judgeResult(value: number, standard: string, rule: string): string {
  if (rule === 'lte') {
    const limit = parseFloat(standard.replace(/[≤<]/g, ''));
    return value <= limit ? '符合' : '超标';
  }
  if (rule === 'range') {
    const [min, max] = standard.split('-').map(parseFloat);
    return value >= min && value <= max ? '符合' : '超标';
  }
  return '待判定';
}

// US7: 合理性校验
export function checkReasonability(value: number, methodId: string): { reasonable: boolean; range: string; message: string } {
  const historyRanges: Record<string, { min: number; max: number; mean: number }> = {
    'COD': { min: 18, max: 35, mean: 25.1 },
    'pH': { min: 6.5, max: 8.5, mean: 7.3 },
    'NH3': { min: 0.1, max: 0.5, mean: 0.25 },
  };
  const range = historyRanges[methodId] || { min: 0, max: Infinity, mean: 0 };
  const reasonable = value >= range.min * 0.5 && value <= range.max * 1.5;
  return {
    reasonable,
    range: `${range.min}-${range.max}`,
    message: reasonable ? '✅ 结果在历史正常范围内' : `⚠️ 结果异常！历史范围: ${range.min}-${range.max}, 均值: ${range.mean}`,
  };
}

export const ELNPage: React.FC = () => {
  const [templates] = useState(mockTemplates);
  const [records] = useState(mockRecords);
  const [searchText, setSearchText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [recordOpen, setRecordOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [executionOpen, setExecutionOpen] = useState(false);
  const [execTemplate, setExecTemplate] = useState<any>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [calcResults, setCalcResults] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [execForm] = Form.useForm();

  const handleCalculate = (template: any) => {
    const results: Record<string, any> = {};
    for (const section of template.sections) {
      for (const field of section.fields) {
        if (field.type === 'calculation') {
          const vars: Record<string, number> = {};
          for (const [varName, fieldId] of Object.entries(field.formulaVars || {})) {
            if (typeof fieldId === 'string' && fieldId.startsWith('f') || fieldId.startsWith('h') || fieldId.startsWith('p')) {
              vars[varName] = parseFloat(fieldValues[fieldId as string] || '0');
            } else {
              vars[varName] = fieldId as number;
            }
          }
          const raw = evaluateFormula(field.formula, vars);
          const rounded = gb8170Round(raw, field.roundingValue || 1);
          results[field.id] = rounded;
        }
        if (field.type === 'judgment') {
          const calcField = template.sections.flatMap((s: any) => s.fields).find((f: any) => f.type === 'calculation');
          const value = calcField ? (results[calcField.id] || parseFloat(fieldValues[calcField.id] || '0')) : 0;
          results[field.id] = judgeResult(value, field.standardValue, field.judgmentRule);
        }
      }
    }
    setCalcResults(results);
    message.success('计算完成');
  };

  const handleLoadTemplateForExec = (template: any) => {
    setExecTemplate(template);
    const defaults: Record<string, any> = {};
    for (const section of template.sections) {
      for (const field of section.fields) {
        if (field.type === 'auto') {
          defaults[field.id] = field.autoSource === 'sampleNo' ? 'SMP20240520001' : field.autoSource === 'sampleName' ? '地表水样品-1' : 'HJ 828-2017';
        } else if (field.defaultValue) {
          defaults[field.id] = field.defaultValue;
        }
      }
    }
    setFieldValues(defaults);
    setCalcResults({});
    setCurrentStep(0);
    setExecutionOpen(true);
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><ExperimentOutlined /> 电子实验记录本 (ELN)</Title></Col>
        <Col><Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setCreateTemplateOpen(true); }}>新建模板</Button>
        </Space></Col>
      </Row>

      <Tabs defaultActiveKey="templates" items={[
        {
          key: 'templates', label: `模板库 (${templates.length})`, children: <Card>
            <Space style={{ marginBottom: 16 }}>
              <Input placeholder="搜索模板名称/方法" prefix={<SearchOutlined />} value={searchText} onChange={e => setSearchText(e.target.value)} style={{ width: 280 }} allowClear />
            </Space>
            <Table dataSource={templates.filter(t => t.name.includes(searchText) || t.methodName.includes(searchText))} rowKey="id" pagination={false} size="middle" columns={[
              { title: '模板名称', dataIndex: 'name', render: (n: string, r: any) => <a onClick={() => { setSelectedTemplate(r); setDesignerOpen(true); }}>{n}</a> },
              { title: '方法', dataIndex: 'methodName' },
              { title: '版本', dataIndex: 'version', render: (v: string) => <Tag>{v}</Tag> },
              { title: '字段数', dataIndex: 'fieldCount' },
              { title: '使用次数', dataIndex: 'usedCount' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'published' ? 'success' : 'default'} text={s === 'published' ? '已发布' : '草稿'} /> },
              { title: '更新时间', dataIndex: 'updatedAt' },
              { title: '操作', render: (_: any, r: any) => <Space size="small">
                <Tooltip title="查看/编辑"><Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedTemplate(r); setDesignerOpen(true); }} /></Tooltip>
                <Tooltip title="试运行"><Button type="link" size="small" icon={<PlayCircleOutlined />} onClick={() => handleLoadTemplateForExec(r)}>试运行</Button></Tooltip>
                <Tooltip title="复制"><Button type="link" size="small" icon={<CopyOutlined />} onClick={() => message.success(`已复制模板: ${r.name} (副本)`)} /></Tooltip>
              </Space> },
            ]} />
          </Card>
        },
        {
          key: 'records', label: `实验记录 (${records.length})`, children: <Card>
            <Table dataSource={records} rowKey="id" pagination={false} size="middle" columns={[
              { title: '模板', dataIndex: 'templateName' },
              { title: '版本', dataIndex: 'templateVersion', render: (v: string) => <Tag>{v}</Tag> },
              { title: '任务', dataIndex: 'taskNo', render: (n: string) => <code>{n}</code> },
              { title: '样品', dataIndex: 'sampleName' },
              { title: '实验员', dataIndex: 'analyst' },
              { title: '创建时间', dataIndex: 'createdAt' },
              { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'reviewed' ? 'success' : s === 'submitted' ? 'processing' : 'default'} text={s === 'reviewed' ? '已复核' : s === 'submitted' ? '已提交' : '草稿'} /> },
              { title: '操作', render: (_: any, r: any) => <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => { setSelectedRecord(r); setRecordOpen(true); }}>查看</Button> },
            ]} />
          </Card>
        },
      ]} />

      {/* Template Designer Drawer */}
      <Drawer title={`模板: ${selectedTemplate?.name || ''}`} open={designerOpen} onClose={() => setDesignerOpen(false)} width={700}
        extra={<Space><Button onClick={() => message.success('模板已保存')}>保存</Button><Button type="primary" onClick={() => message.success('模板已发布')}>发布</Button></Space>}
      >
        {selectedTemplate && (
          <>
            <Descriptions size="small" column={2} bordered style={{ marginBottom: 16 }}>
              <Descriptions.Item label="模板名称">{selectedTemplate.name}</Descriptions.Item>
              <Descriptions.Item label="版本">{selectedTemplate.version}</Descriptions.Item>
              <Descriptions.Item label="方法">{selectedTemplate.methodName}</Descriptions.Item>
              <Descriptions.Item label="状态">{selectedTemplate.status === 'published' ? <Tag color="green">已发布</Tag> : <Tag>草稿</Tag>}</Descriptions.Item>
            </Descriptions>

            {selectedTemplate.sections.map((section: any, si: number) => (
              <Card key={section.id} size="small" title={`${si + 1}. ${section.title}`} style={{ marginBottom: 12 }}>
                {section.fields.map((field: any) => (
                  <div key={field.id} style={{ marginBottom: 8, padding: '8px 12px', background: '#fafafa', borderRadius: 4 }}>
                    <Row justify="space-between" align="middle">
                      <Col>
                        <Text strong>{field.label}</Text>
                        <Tag style={{ marginLeft: 8 }} color={field.type === 'calculation' ? 'purple' : field.type === 'judgment' ? 'orange' : field.type === 'auto' ? 'blue' : 'green'}>
                          {field.type === 'calculation' ? '计算' : field.type === 'judgment' ? '判定' : field.type === 'auto' ? '自动' : field.type === 'select' ? '下拉' : '数字'}
                        </Tag>
                        {field.required && <Tag color="red">必填</Tag>}
                      </Col>
                      <Col>
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {field.type === 'calculation' ? `公式: ${field.formula}` :
                           field.type === 'judgment' ? `标准: ${field.standardValue}` :
                           field.defaultValue ? `默认: ${field.defaultValue}` : ''}
                        </Text>
                      </Col>
                    </Row>
                  </div>
                ))}
              </Card>
            ))}

            <Divider />
            <Alert message="提示: 点击「试运行」可在不保存数据的情况下模拟填写模板，验证计算和判定逻辑" type="info" showIcon />
            <Button type="primary" icon={<PlayCircleOutlined />} block style={{ marginTop: 12 }} onClick={() => { handleLoadTemplateForExec(selectedTemplate); setDesignerOpen(false); }}>试运行此模板</Button>
          </>
        )}
      </Drawer>

      {/* Template Execution Modal (试运行) */}
      <Modal title={`试运行: ${execTemplate?.name || ''} (v${execTemplate?.version || ''})`} open={executionOpen} onCancel={() => setExecutionOpen(false)} width={700}
        footer={<Space>
          {currentStep > 0 && <Button onClick={() => setCurrentStep(currentStep - 1)}>上一步</Button>}
          {currentStep < (execTemplate?.sections?.length || 0) - 1 && <Button type="primary" onClick={() => setCurrentStep(currentStep + 1)}>下一步</Button>}
          {currentStep === (execTemplate?.sections?.length || 0) - 1 && <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { handleCalculate(execTemplate); message.success('计算完成，试运行结束'); }}>执行计算</Button>}
          <Button onClick={() => setExecutionOpen(false)}>关闭</Button>
        </Space>}
      >
        {execTemplate && (
          <>
            <Steps current={currentStep} size="small" style={{ marginBottom: 16 }}>
              {execTemplate.sections.map((s: any) => <Steps.Step key={s.id} title={s.title} />)}
            </Steps>

            {execTemplate.sections.map((section: any, si: number) => (
              <div key={section.id} style={{ display: si === currentStep ? 'block' : 'none' }}>
                <Card title={section.title} size="small">
                  {section.fields.map((field: any) => {
                    const value = fieldValues[field.id];
                    const calcResult = calcResults[field.id];

                    if (field.type === 'calculation') {
                      return (
                        <div key={field.id} style={{ marginBottom: 12 }}>
                          <Text strong>{field.label}</Text>
                          <div style={{ padding: '8px 12px', background: '#f6ffed', borderRadius: 4, marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: 12 }}>公式: {field.formula}</Text>
                            <br />
                            {calcResult !== undefined ? (
                              <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{calcResult} ({field.rounding === 'decimal_places' ? `保留${field.roundingValue}位小数` : ''})</Text>
                            ) : (
                              <Text type="secondary">点击"执行计算"后显示结果</Text>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (field.type === 'judgment') {
                      return (
                        <div key={field.id} style={{ marginBottom: 12 }}>
                          <Text strong>{field.label}</Text>
                          <div style={{ padding: '8px 12px', borderRadius: 4, marginTop: 4, background: calcResult === '符合' ? '#f6ffed' : calcResult === '超标' ? '#fff2f0' : '#fafafa' }}>
                            <Text>标准: {field.standardValue} {field.unit}</Text>
                            <br />
                            {calcResult ? (
                              <Tag color={calcResult === '符合' ? 'green' : 'red'} style={{ marginTop: 4 }}>{calcResult}</Tag>
                            ) : (
                              <Text type="secondary">点击"执行计算"后显示</Text>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (field.type === 'auto') {
                      return (
                        <Form.Item key={field.id} label={field.label}>
                          <Input value={value || ''} disabled style={{ background: '#f5f5f5' }} />
                          <Text type="secondary" style={{ fontSize: 11 }}>自动带入</Text>
                        </Form.Item>
                      );
                    }

                    if (field.type === 'select') {
                      return (
                        <Form.Item key={field.id} label={field.label} required={field.required}>
                          <Select value={value} onChange={v => setFieldValues(prev => ({ ...prev, [field.id]: v }))} placeholder="请选择">
                            {(field.options || []).map((o: string) => <Select.Option key={o} value={o}>{o}</Select.Option>)}
                          </Select>
                        </Form.Item>
                      );
                    }

                    return (
                      <Form.Item key={field.id} label={field.label} required={field.required}>
                        <Input value={value} onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))} placeholder={field.placeholder || field.label} />
                      </Form.Item>
                    );
                  })}
                </Card>
              </div>
            ))}
          </>
        )}
      </Modal>

      {/* Record Detail Modal */}
      <Modal title="实验记录详情" open={recordOpen} onCancel={() => setRecordOpen(false)} footer={null} width={500}>
        {selectedRecord && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="模板">{selectedRecord.templateName} ({selectedRecord.templateVersion})</Descriptions.Item>
            <Descriptions.Item label="任务">{selectedRecord.taskNo}</Descriptions.Item>
            <Descriptions.Item label="样品">{selectedRecord.sampleName}</Descriptions.Item>
            <Descriptions.Item label="实验员">{selectedRecord.analyst}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedRecord.createdAt}</Descriptions.Item>
            <Descriptions.Item label="状态"><Badge status={selectedRecord.status === 'reviewed' ? 'success' : 'processing'} text={selectedRecord.status === 'reviewed' ? '已复核' : '已提交'} /></Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create Template Modal */}
      <Modal title="新建模板" open={createTemplateOpen} onOk={() => form.submit()} onCancel={() => { setCreateTemplateOpen(false); form.resetFields(); }}>
        <Form form={form} layout="vertical" onFinish={(v) => { message.success(`模板 ${v.name} 创建成功`); setCreateTemplateOpen(false); form.resetFields(); }}>
          <Form.Item name="name" label="模板名称" rules={[{ required: true }]}><Input placeholder="如: COD检测模板" /></Form.Item>
          <Form.Item name="methodName" label="关联方法"><Input placeholder="如: HJ 828-2017" /></Form.Item>
          <Form.Item name="version" label="版本号"><Input defaultValue="v1.0" /></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
