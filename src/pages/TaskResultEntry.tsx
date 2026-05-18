import React, { useState } from 'react';
import { Card, Row, Col, Typography, Descriptions, Table, Input, Select, Button, Tag, Upload, message, Timeline, Space, Form, Alert } from 'antd';
import { SaveOutlined, CheckCircleOutlined, UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const mockTask = {
  id: 'tk2', taskNo: 'TK-2025-002', sampleNo: 'SMP20240520001',
  sampleName: '地表水样品-1', testItem: '化学需氧量(COD)', method: 'HJ 828-2017 重铬酸钾法',
  submitter: '李思', date: '2024-05-21', analyst: '王明', instrument: 'COD消解仪 HCA-100',
};

const initialResults = [
  { key: '1', index: '化学需氧量(COD)', result: '25.6', unit: 'mg/L', limit: '4', standard: '≤50', judgment: '符合', note: '' },
  { key: '2', index: '五日生化需氧量(BOD₅)', result: '7.8', unit: 'mg/L', limit: '0.5', standard: '≤10', judgment: '符合', note: '' },
  { key: '3', index: '氨氮(NH₃-N)', result: '0.215', unit: 'mg/L', limit: '0.025', standard: '≤1.0', judgment: '符合', note: '' },
];

interface ParallelSample {
  key: string;
  index: string;
  originalResult: string;
  parallel1Result: string;
  parallel2Result: string;
  rpdLimit: number;
}

interface SpikeRecovery {
  key: string;
  index: string;
  backgroundResult: string;
  spikeAmount: string;
  measuredResult: string;
  recoveryMin: number;
  recoveryMax: number;
}

export const TaskResultEntry: React.FC = () => {
  const { id: _id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(initialResults);
  const [readings, setReadings] = useState([
    { key: '1', seq: 1, sample: '空白', reading: '0.001' },
    { key: '2', seq: 2, sample: '标准曲线1 (20mg/L)', reading: '0.152' },
    { key: '3', seq: 3, sample: '标准曲线2 (40mg/L)', reading: '0.287' },
    { key: '4', seq: 4, sample: '样品', reading: '0.321' },
  ]);
  const [taskStatus, setTaskStatus] = useState('testing');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // 平行样
  const [parallels, setParallels] = useState<ParallelSample[]>([
    { key: 'p1', index: 'COD平行样', originalResult: '25.6', parallel1Result: '26.1', parallel2Result: '25.2', rpdLimit: 15 },
  ]);

  // 加标回收
  const [spikes, setSpikes] = useState<SpikeRecovery[]>([
    { key: 's1', index: 'COD加标回收', backgroundResult: '25.6', spikeAmount: '10.0', measuredResult: '35.2', recoveryMin: 80, recoveryMax: 120 },
  ]);

  const handleResultChange = (key: string, field: string, value: string) => {
    setResults(prev => prev.map(r => r.key === key ? { ...r, [field]: value } : r));
  };

  const handleParallelChange = (key: string, field: keyof ParallelSample, value: string) => {
    setParallels(prev => prev.map(p => p.key === key ? { ...p, [field]: value } : p));
  };

  const handleSpikeChange = (key: string, field: keyof SpikeRecovery, value: string) => {
    setSpikes(prev => prev.map(s => s.key === key ? { ...s, [field]: value } : s));
  };

  const calcRPD = (a: number, b: number) => {
    if (a === 0 && b === 0) return 0;
    const avg = (a + b) / 2;
    if (avg === 0) return 0;
    return (Math.abs(a - b) / avg) * 100;
  };

  const calcRecovery = (bg: number, spike: number, measured: number) => {
    if (spike === 0) return 0;
    return ((measured - bg) / spike) * 100;
  };

  const columns = [
    { title: '检测指标', dataIndex: 'index', key: 'index', width: 180 },
    { title: '检测结果', dataIndex: 'result', key: 'result', width: 100, render: (v: string, r: any) => (
      <Input size="small" value={v} onChange={e => handleResultChange(r.key, 'result', e.target.value)} style={{ width: 80 }} />
    )},
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 60 },
    { title: '检出限', dataIndex: 'limit', key: 'limit', width: 60 },
    { title: '限值要求', dataIndex: 'standard', key: 'standard', width: 80 },
    { title: '判定', dataIndex: 'judgment', key: 'judgment', width: 80, render: (v: string) => (
      <Tag color={v === '符合' ? 'green' : 'red'}>{v}</Tag>
    )},
    { title: '备注', dataIndex: 'note', key: 'note', width: 120, render: (v: string, r: any) => (
      <Input size="small" value={v} onChange={e => handleResultChange(r.key, 'note', e.target.value)} />
    )},
  ];

  const parallelColumns = [
    { title: '检测指标', dataIndex: 'index', width: 140 },
    { title: '原样结果', dataIndex: 'originalResult', width: 90, render: (v: string, r: ParallelSample) => (
      <Input size="small" value={v} onChange={e => handleParallelChange(r.key, 'originalResult', e.target.value)} style={{ width: 70 }} />
    )},
    { title: '平行样1', dataIndex: 'parallel1Result', width: 90, render: (v: string, r: ParallelSample) => (
      <Input size="small" value={v} onChange={e => handleParallelChange(r.key, 'parallel1Result', e.target.value)} style={{ width: 70 }} />
    )},
    { title: '平行样2', dataIndex: 'parallel2Result', width: 90, render: (v: string, r: ParallelSample) => (
      <Input size="small" value={v} onChange={e => handleParallelChange(r.key, 'parallel2Result', e.target.value)} style={{ width: 70 }} />
    )},
    { title: 'RPD(%)', key: 'rpd', width: 90, render: (_: any, r: ParallelSample) => {
      const v1 = parseFloat(r.parallel1Result) || 0;
      const v2 = parseFloat(r.parallel2Result) || 0;
      const rpd = calcRPD(v1, v2);
      const isOver = rpd > r.rpdLimit;
      return <Text style={{ color: isOver ? '#ff4d4f' : '#52c41a', fontWeight: isOver ? 700 : 400 }}>{rpd.toFixed(2)}%</Text>;
    }},
    { title: '限值', dataIndex: 'rpdLimit', width: 70, render: (v: number) => `≤${v}%` },
    { title: '状态', key: 'status', width: 80, render: (_: any, r: ParallelSample) => {
      const v1 = parseFloat(r.parallel1Result) || 0;
      const v2 = parseFloat(r.parallel2Result) || 0;
      const rpd = calcRPD(v1, v2);
      const isOver = rpd > r.rpdLimit;
      return <Tag color={isOver ? 'red' : 'green'}>{isOver ? '超限' : '合格'}</Tag>;
    }},
    { title: '操作', key: 'action', width: 60, render: (_: any, r: ParallelSample) => (
      <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => setParallels(parallels.filter(p => p.key !== r.key))} />
    )},
  ];

  const spikeColumns = [
    { title: '检测指标', dataIndex: 'index', width: 140 },
    { title: '本底结果', dataIndex: 'backgroundResult', width: 90, render: (v: string, r: SpikeRecovery) => (
      <Input size="small" value={v} onChange={e => handleSpikeChange(r.key, 'backgroundResult', e.target.value)} style={{ width: 70 }} />
    )},
    { title: '加标量', dataIndex: 'spikeAmount', width: 90, render: (v: string, r: SpikeRecovery) => (
      <Input size="small" value={v} onChange={e => handleSpikeChange(r.key, 'spikeAmount', e.target.value)} style={{ width: 70 }} />
    )},
    { title: '实测量', dataIndex: 'measuredResult', width: 90, render: (v: string, r: SpikeRecovery) => (
      <Input size="small" value={v} onChange={e => handleSpikeChange(r.key, 'measuredResult', e.target.value)} style={{ width: 70 }} />
    )},
    { title: '回收率(%)', key: 'recovery', width: 100, render: (_: any, r: SpikeRecovery) => {
      const bg = parseFloat(r.backgroundResult) || 0;
      const spike = parseFloat(r.spikeAmount) || 0;
      const measured = parseFloat(r.measuredResult) || 0;
      const recovery = calcRecovery(bg, spike, measured);
      const isUnder = recovery < r.recoveryMin;
      const isOver = recovery > r.recoveryMax;
      return <Text style={{ color: (isUnder || isOver) ? '#ff4d4f' : '#52c41a', fontWeight: (isUnder || isOver) ? 700 : 400 }}>{recovery.toFixed(1)}%</Text>;
    }},
    { title: '范围', key: 'range', width: 100, render: (_: any, r: SpikeRecovery) => `${r.recoveryMin}% ~ ${r.recoveryMax}%` },
    { title: '状态', key: 'status', width: 80, render: (_: any, r: SpikeRecovery) => {
      const bg = parseFloat(r.backgroundResult) || 0;
      const spike = parseFloat(r.spikeAmount) || 0;
      const measured = parseFloat(r.measuredResult) || 0;
      const recovery = calcRecovery(bg, spike, measured);
      const isValid = recovery >= r.recoveryMin && recovery <= r.recoveryMax;
      return <Tag color={isValid ? 'green' : 'red'}>{isValid ? '合格' : '超限'}</Tag>;
    }},
    { title: '操作', key: 'action', width: 60, render: (_: any, r: SpikeRecovery) => (
      <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => setSpikes(spikes.filter(s => s.key !== r.key))} />
    )},
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Button onClick={() => navigate(-1)}>← 返回</Button></Col>
        <Col><Title level={4} style={{ margin: 0 }}>检测结果录入</Title></Col>
        <Col>
          <Space>
            <Button icon={<SaveOutlined />} onClick={() => { setSavedAt(new Date().toLocaleString('zh-CN')); message.success('结果已保存'); }}>保存</Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { setTaskStatus('pending_review'); message.success('已提交复核'); }}>提交复核</Button>
          </Space>
        </Col>
      </Row>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions size="small" column={4}>
          <Descriptions.Item label="样品编号">{mockTask.sampleNo}</Descriptions.Item>
          <Descriptions.Item label="样品名称">{mockTask.sampleName}</Descriptions.Item>
          <Descriptions.Item label="检测项目">{mockTask.testItem}</Descriptions.Item>
          <Descriptions.Item label="检测方法">{mockTask.method}</Descriptions.Item>
          <Descriptions.Item label="送检人">{mockTask.submitter}</Descriptions.Item>
          <Descriptions.Item label="检测日期">{mockTask.date}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={18}>
          <Card title="检测指标" size="small" style={{ marginBottom: 16 }}>
            <Table columns={columns} dataSource={results} pagination={false} size="small" bordered />
            <Button type="dashed" icon={<PlusOutlined />} style={{ width: '100%', marginTop: 8 }} onClick={() => {
              const newKey = String(results.length + 1);
              setResults([...results, { key: newKey, index: `新增指标-${newKey}`, result: '', unit: 'mg/L', limit: '0.01', standard: '≤10', judgment: '-', note: '' }]);
              message.success('已添加新检测指标');
            }}>添加指标</Button>
          </Card>

          {/* 平行样验证 */}
          <Card title="平行样验证" size="small" style={{ marginBottom: 16 }} extra={
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => {
              const newKey = `p-${Date.now()}`;
              setParallels([...parallels, { key: newKey, index: `平行样-${parallels.length + 1}`, originalResult: '', parallel1Result: '', parallel2Result: '', rpdLimit: 15 }]);
            }}>添加平行样</Button>
          }>
            {parallels.length === 0 && <Text type="secondary">暂无平行样记录，请点击「添加平行样」</Text>}
            <Table columns={parallelColumns} dataSource={parallels} pagination={false} size="small" bordered />
            {parallels.map(p => {
              const v1 = parseFloat(p.parallel1Result) || 0;
              const v2 = parseFloat(p.parallel2Result) || 0;
              const rpd = calcRPD(v1, v2);
              if (rpd > p.rpdLimit) {
                return <Alert key={p.key} message={`${p.index}: RPD ${rpd.toFixed(2)}% 超出限值 ${p.rpdLimit}%`} type="error" showIcon style={{ marginTop: 8 }} />;
              }
              return null;
            })}
          </Card>

          {/* 加标回收 */}
          <Card title="加标回收" size="small" style={{ marginBottom: 16 }} extra={
            <Button size="small" type="primary" icon={<PlusOutlined />} onClick={() => {
              const newKey = `s-${Date.now()}`;
              setSpikes([...spikes, { key: newKey, index: `加标回收-${spikes.length + 1}`, backgroundResult: '', spikeAmount: '', measuredResult: '', recoveryMin: 80, recoveryMax: 120 }]);
            }}>添加加标回收</Button>
          }>
            {spikes.length === 0 && <Text type="secondary">暂无加标回收记录，请点击「添加加标回收」</Text>}
            <Table columns={spikeColumns} dataSource={spikes} pagination={false} size="small" bordered />
            {spikes.map(s => {
              const bg = parseFloat(s.backgroundResult) || 0;
              const spike = parseFloat(s.spikeAmount) || 0;
              const measured = parseFloat(s.measuredResult) || 0;
              const recovery = calcRecovery(bg, spike, measured);
              if (recovery !== 0 && (recovery < s.recoveryMin || recovery > s.recoveryMax)) {
                return <Alert key={s.key} message={`${s.index}: 回收率 ${recovery.toFixed(1)}% 超出范围 ${s.recoveryMin}% ~ ${s.recoveryMax}%`} type="error" showIcon style={{ marginTop: 8 }} />;
              }
              return null;
            })}
          </Card>

          <Card title="原始记录" size="small" style={{ marginBottom: 16 }} extra={
            <Select defaultValue="" style={{width:160}} size="small" onChange={(v) => v && message.info('已加载模板: ' + v)}>
              <Option value="">选择模板...</Option>
              <Option value="spectrophotometry">分光光度法模板</Option>
              <Option value="chromatography">色谱法模板</Option>
              <Option value="titration">滴定法模板</Option>
              <Option value="gravimetric">重量法模板</Option>
            </Select>
          }>
            <Form layout="vertical">
              <Row gutter={16}>
                <Col span={12}><Form.Item label="检测标准"><Input defaultValue="HJ 828-2017" /></Form.Item></Col>
                <Col span={6}><Form.Item label="环境温度(°C)"><Input defaultValue="25" /></Form.Item></Col>
                <Col span={6}><Form.Item label="湿度(%)"><Input defaultValue="60" /></Form.Item></Col>
              </Row>
              <Form.Item label="样品前处理过程"><TextArea rows={2} placeholder="描述样品前处理步骤..." defaultValue="取 50mL 水样, 加入 10mL 重铬酸钾溶液" /></Form.Item>
              <Form.Item label="检测过程记录"><TextArea rows={3} placeholder="记录检测过程中的关键参数和观察..." defaultValue="消解温度 165°C, 时间 15min" /></Form.Item>
              <Form.Item label="备注"><TextArea rows={1} placeholder="异常情况或其他说明..." /></Form.Item>
            </Form>
          </Card>

          <Card title="仪器读数" size="small" style={{ marginBottom: 16 }}>
            <Table dataSource={readings} columns={[
              { title: '序号', dataIndex: 'seq', width: 60 },
              { title: '样品/标准', dataIndex: 'sample' },
              { title: '读数', dataIndex: 'reading' },
            ]} pagination={false} size="small" bordered />
            <Button type="dashed" icon={<PlusOutlined />} style={{ width: '100%', marginTop: 8 }} onClick={() => {
              const newKey = String(readings.length + 1);
              setReadings([...readings, { key: newKey, seq: readings.length + 1, sample: '新样品', reading: '' }]);
              message.success('已添加仪器读数');
            }}>添加读数</Button>
          </Card>

          <Card title="计算过程" size="small" style={{ marginBottom: 16 }}>
            <Text type="secondary">ρ = (A - A₀) × K = (0.321 - 0.001) × 80.0 = 25.6 mg/L</Text>
          </Card>

          <Card title="附件上传" size="small" style={{ marginBottom: 16 }}>
            <Upload.Dragger multiple showUploadList={{ showPreviewIcon: true }}>
              <p><UploadOutlined style={{ fontSize: 24 }} /></p>
              <p>支持 jpg/png/pdf/doc/xls，单文件≤20MB</p>
            </Upload.Dragger>
          </Card>

          <Card title="审核信息" size="small">
            <Descriptions size="small" column={3}>
              <Descriptions.Item label="录入人">王明</Descriptions.Item>
              <Descriptions.Item label="录入时间">{savedAt || '—'}</Descriptions.Item>
              <Descriptions.Item label="状态"><Tag color={taskStatus === 'testing' ? 'blue' : taskStatus === 'pending_review' ? 'orange' : 'green'}>{taskStatus === 'testing' ? '检测中' : taskStatus === 'pending_review' ? '待复核' : '已完成'}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="样品概览" size="small" style={{ marginBottom: 16 }}>
            <Text strong>{mockTask.sampleName}</Text>
            <Descriptions size="small" column={1}>
              <Descriptions.Item label="状态"><Tag color={taskStatus === 'testing' ? 'blue' : taskStatus === 'pending_review' ? 'orange' : 'green'}>{taskStatus === 'testing' ? '检测中' : taskStatus === 'pending_review' ? '待复核' : '已完成'}</Tag></Descriptions.Item>
              <Descriptions.Item label="检测项目">{mockTask.testItem}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="任务进度" size="small">
            <Timeline items={[
              { color: 'green', children: <><Text strong>任务接收</Text><br /><Text type="secondary">2024-05-20 15:22</Text></> },
              { color: 'green', children: <><Text strong>样品登记</Text><br /><Text type="secondary">2024-05-20 15:35</Text></> },
              { color: 'green', children: <><Text strong>样品分配</Text><br /><Text type="secondary">2024-05-21 09:00</Text></> },
              { color: 'blue', children: <><Text strong>检测中（当前）</Text><br /><Text type="secondary">结果录入</Text></> },
              { color: 'gray', children: <><Text strong>复核</Text><br /><Text type="secondary">待开始</Text></> },
              { color: 'gray', children: <><Text strong>审核</Text><br /><Text type="secondary">待开始</Text></> },
            ]} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
