import React, { useState } from 'react';
import { Card, Row, Col, Typography, Descriptions, Table, Input, Select, Button, Tag, Upload, message, Timeline, Space, Form, Tabs, Progress, Alert, Modal } from 'antd';
import { SaveOutlined, CheckCircleOutlined, UploadOutlined, PlusOutlined, InboxOutlined, FileTextOutlined, DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

const mockTask = {
  id: 'tk2', taskNo: 'TK-2025-002', sampleNo: 'SMP20240520001',
  sampleName: '地表水样品-1', testItem: '化学需氧量(COD)', method: 'HJ 828-2017 重铬酸钾法',
  submitter: '李思', date: '2024-05-21', analyst: '王明', instrument: 'COD消解仪 HCA-100',
};

const initialResults = [
  { key: 'r1', item: '化学需氧量(COD)', result: '25.6', unit: 'mg/L', limit: '4', standard: '≤50', judgment: '符合', note: '' },
  { key: 'r2', item: '五日生化需氧量(BOD₅)', result: '7.8', unit: 'mg/L', limit: '0.5', standard: '≤10', judgment: '符合', note: '' },
  { key: 'r3', item: '氨氮(NH₃-N)', result: '0.215', unit: 'mg/L', limit: '0.025', standard: '≤1.0', judgment: '符合', note: '' },
];

const initialReadings = [
  { key: 'rd1', seq: 1, sample: '空白', reading: '0.001', dilution: '1', note: '' },
  { key: 'rd2', seq: 2, sample: '标准曲线1 (20mg/L)', reading: '0.152', dilution: '1', note: '' },
  { key: 'rd3', seq: 3, sample: '标准曲线2 (40mg/L)', reading: '0.287', dilution: '1', note: '' },
  { key: 'rd4', seq: 4, sample: '样品', reading: '0.321', dilution: '10', note: '' },
];

// Simulated raw data parsing result - pre-loaded demo
const mockParsedData = [
  { no: 1, sampleId: 'BLK', name: '空白', absorbance: '0.001', conc: '0.00', flag: '正常' },
  { no: 2, sampleId: 'STD1', name: '标准1 (20mg/L)', absorbance: '0.152', conc: '19.8', flag: '正常' },
  { no: 3, sampleId: 'STD2', name: '标准2 (40mg/L)', absorbance: '0.287', conc: '39.5', flag: '正常' },
  { no: 4, sampleId: 'SMP', name: '地表水样品-1', absorbance: '0.321', conc: '25.6', flag: '正常' },
  { no: 5, sampleId: 'QC', name: '质控样 (25.0±2.5 mg/L)', absorbance: '0.315', conc: '24.8', flag: '受控' },
];

// Sample CSV for demo
const sampleCSV = `ID,样品名称,吸光度(Abs),浓度(mg/L),标志
BLK,空白,0.001,0.00,正常
STD1,标准1 (20mg/L),0.152,19.8,正常
STD2,标准2 (40mg/L),0.287,39.5,正常
SMP,地表水样品-1,0.321,25.6,正常
QC,质控样 (25.0±2.5 mg/L),0.315,24.8,受控`;

export const TaskResultEntry: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(initialResults);
  const [readings, setReadings] = useState(initialReadings);
  const [rawNotes, setRawNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>('COD-20240521-HCA100.csv (示例数据)');
  const [parsedData, setParsedData] = useState<any[] | null>(mockParsedData);
  const [editingRow, setEditingRow] = useState<string | null>(null);

  const handleResultChange = (key: string, field: string, value: string) => {
    setResults(prev => prev.map(r => {
      if (r.key !== key) return r;
      const updated = { ...r, [field]: value };
      // Auto-judge if result and standard are filled
      if (field === 'result' && updated.standard && updated.result) {
        const limitMatch = updated.standard.match(/[\d.]+/);
        if (limitMatch) {
          const limit = parseFloat(limitMatch[0]);
          const resultVal = parseFloat(value);
          updated.judgment = !isNaN(limit) && !isNaN(resultVal) ? (resultVal <= limit ? '符合' : '超标') : updated.judgment;
        }
      }
      return updated;
    }));
  };

  const handleReadingChange = (key: string, field: string, value: string) => {
    setReadings(prev => prev.map(r => r.key === key ? { ...r, [field]: value } : r));
  };

  const handleAddResult = () => {
    setResults(prev => [...prev, { key: 'r' + (prev.length + 1), item: '', result: '', unit: 'mg/L', limit: '', standard: '', judgment: '待判定', note: '' }]);
  };

  const handleAddReading = () => {
    setReadings(prev => [...prev, { key: 'rd' + (prev.length + 1), seq: prev.length + 1, sample: '', reading: '', dilution: '1', note: '' }]);
  };

  const handleDeleteResult = (key: string) => {
    setResults(prev => prev.filter(r => r.key !== key));
  };

  const handleFileParse = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setUploadedFile(file.name);
      // Parse CSV/TSV lines
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length > 1) {
        const headers = lines[0].split(/[,\t]/);
        const data = lines.slice(1).map((line, i) => {
          const vals = line.split(/[,\t]/);
          return { no: i + 1, sampleId: vals[0] || '', name: vals[1] || '', absorbance: vals[2] || '', conc: vals[3] || '', flag: '正常' };
        });
        setParsedData(data);
        message.success(`解析成功: ${data.length} 条数据`);
      }
    };
    reader.readAsText(file);
    return false;
  };

  const handleApplyParsedData = () => {
    if (!parsedData) return;
    // Apply parsed data to readings
    const newReadings = parsedData.map((d, i) => ({
      key: 'rd' + (readings.length + i + 1),
      seq: readings.length + i + 1,
      sample: `${d.sampleId} ${d.name}`.trim(),
      reading: d.absorbance || d.conc || '',
      dilution: '1',
      note: '',
    }));
    setReadings(prev => [...prev, ...newReadings]);
    setParsedData(null);
    setUploadedFile(null);
    message.success(`已导入 ${newReadings.length} 条读数`);
  };

  const resultColumns = [
    { title: '#', width: 40, render: (_: any, __: any, i: number) => i + 1 },
    { title: '检测指标', dataIndex: 'item', width: 180, render: (v: string, r: any) => (
      <Input size="small" value={v} placeholder="指标名称" onChange={e => handleResultChange(r.key, 'item', e.target.value)} bordered={editingRow === r.key} />
    )},
    { title: '结果', dataIndex: 'result', width: 90, render: (v: string, r: any) => (
      <Input size="small" value={v} placeholder="0.00" onChange={e => handleResultChange(r.key, 'result', e.target.value)} style={{ width: 70 }} />
    )},
    { title: '单位', dataIndex: 'unit', width: 70, render: (v: string, r: any) => (
      <Input size="small" value={v} onChange={e => handleResultChange(r.key, 'unit', e.target.value)} style={{ width: 60 }} />
    )},
    { title: '检出限', dataIndex: 'limit', width: 70 },
    { title: '限值标准', dataIndex: 'standard', width: 90, render: (v: string, r: any) => (
      <Input size="small" value={v} placeholder="≤50" onChange={e => handleResultChange(r.key, 'standard', e.target.value)} style={{ width: 80 }} />
    )},
    { title: '判定', dataIndex: 'judgment', width: 80, render: (v: string) => (
      <Tag color={v === '符合' ? 'green' : v === '超标' ? 'red' : 'default'}>{v || '待判定'}</Tag>
    )},
    { title: '备注', dataIndex: 'note', width: 100, render: (v: string, r: any) => (
      <Input size="small" value={v} placeholder="备注" onChange={e => handleResultChange(r.key, 'note', e.target.value)} />
    )},
    { title: '', width: 40, render: (_: any, r: any) => (
      <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteResult(r.key)} />
    )},
  ];

  const readingColumns = [
    { title: '序号', dataIndex: 'seq', width: 50 },
    { title: '样品/标准', dataIndex: 'sample', render: (v: string, r: any) => (
      <Input size="small" value={v} placeholder="空白/标准/样品" onChange={e => handleReadingChange(r.key, 'sample', e.target.value)} />
    )},
    { title: '读数(Abs)', dataIndex: 'reading', width: 100, render: (v: string, r: any) => (
      <Input size="small" value={v} placeholder="0.000" onChange={e => handleReadingChange(r.key, 'reading', e.target.value)} style={{ width: 80 }} />
    )},
    { title: '稀释倍数', dataIndex: 'dilution', width: 80, render: (v: string, r: any) => (
      <Input size="small" value={v} onChange={e => handleReadingChange(r.key, 'dilution', e.target.value)} style={{ width: 60 }} />
    )},
    { title: '备注', dataIndex: 'note', width: 100, render: (v: string, r: any) => (
      <Input size="small" value={v} onChange={e => handleReadingChange(r.key, 'note', e.target.value)} />
    )},
    { title: '', width: 40, render: (_: any, r: any) => (
      <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => setReadings(prev => prev.filter(d => d.key !== r.key))} />
    )},
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Button onClick={() => navigate(-1)}>← 返回</Button></Col>
        <Col><Title level={4} style={{ margin: 0 }}>检测结果录入 — {mockTask.taskNo}</Title></Col>
        <Col>
          <Space>
            <Button icon={<SaveOutlined />} onClick={() => { 
              localStorage.setItem('task-results-' + id, JSON.stringify({ results, readings, rawNotes }));
              setSaved(true); message.success('结果已保存');
            }} disabled={saved}>{saved ? '已保存' : '保存草稿'}</Button>
            <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => { 
              if (!saved) { message.warning('请先保存结果'); return; }
              // P1-6: 超标自动复测
              const hasOOS = results.some(r => r.judgment === '超标');
              if (hasOOS) {
                Modal.confirm({title:'超标复测',content:`${results.filter(r=>r.judgment==='超标').map(r=>r.item+'='+r.result).join(', ')} 超标。是否创建复测任务？`,okText:'创建复测',onOk:()=>{message.success(`已创建 ${results.filter(r=>r.judgment==='超标').length} 个复测任务`);setSubmitted(true);},onCancel:()=>{setSubmitted(true);message.success('已提交复核');}});
              } else { setSubmitted(true); message.success('已提交复核'); }
            }} disabled={submitted}>{submitted ? '已提交复核' : '提交复核'}</Button>
          </Space>
        </Col>
      </Row>

      {submitted && <Alert message="✅ 结果已提交复核，等待审核人员审核" type="success" showIcon style={{ marginBottom: 16 }} />}

      {/* US4: 设备数据自动回填 Mock */}
      {!submitted && <Card size="small" style={{marginBottom:16}} extra={<Button size="small" type="primary" onClick={()=>{setReadings(prev=>[...prev,{key:'auto-'+Date.now(),seq:prev.length+1,sample:'样品(自动采集)',reading:'0.321',dilution:'1',note:'波长:254nm·温度:25°C'}]);message.success('设备数据已自动回填');}}>🔄 模拟设备采集</Button>}><Text type="secondary">点击模拟仪器自动采集数据并回填</Text></Card>}

      <Card size="small" style={{ marginBottom: 16 }}>
        <Descriptions size="small" column={4}>
          <Descriptions.Item label="样品编号">{mockTask.sampleNo}</Descriptions.Item>
          <Descriptions.Item label="样品名称">{mockTask.sampleName}</Descriptions.Item>
          <Descriptions.Item label="检测项目">{mockTask.testItem}</Descriptions.Item>
          <Descriptions.Item label="检测方法">{mockTask.method}</Descriptions.Item>
          <Descriptions.Item label="仪器">{mockTask.instrument}</Descriptions.Item>
          <Descriptions.Item label="送检人">{mockTask.submitter}</Descriptions.Item>
          <Descriptions.Item label="检测日期">{mockTask.date}</Descriptions.Item>
          <Descriptions.Item label="检测员">{mockTask.analyst}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16}>
        <Col xs={24} lg={18}>
          {/* 1. 检测指标 */}
          <Card 
            title={<Space><FileTextOutlined />检测指标</Space>} 
            size="small" style={{ marginBottom: 16 }}
            extra={<Button size="small" icon={<PlusOutlined />} onClick={handleAddResult}>添加指标</Button>}
          >
            <Table 
              columns={resultColumns} dataSource={results} pagination={false} size="small" bordered
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2}><Text strong>统计</Text></Table.Summary.Cell>
                  <Table.Summary.Cell index={2} colSpan={3}>
                    <Text>共 {results.length} 项 · 符合 {results.filter(r=>r.judgment==='符合').length} 项 · 超标 {results.filter(r=>r.judgment==='超标').length} 项</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} colSpan={3} />
                </Table.Summary.Row>
              )}
            />
          </Card>

          {/* 2. 原始数据文件上传 + 解析预览 */}
          <Card 
            title={<Space><UploadOutlined />原始数据文件</Space>} 
            size="small" style={{ marginBottom: 16 }}
          >
            <Tabs size="small" items={[
              { key: 'upload', label: '上传文件', children: (
                <div>
                  <Dragger 
                    accept=".csv,.txt,.xlsx,.pdf" 
                    beforeUpload={handleFileParse}
                    showUploadList={false}
                    multiple={false}
                  >
                    <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                    <p className="ant-upload-text">点击或拖拽仪器数据文件</p>
                    <p className="ant-upload-hint">支持 CSV / TXT / Excel / PDF (ASTM E1394)</p>
                  </Dragger>
                  {uploadedFile && (
                    <Alert 
                      message={`📁 已加载: ${uploadedFile}`} 
                      type="info" showIcon style={{ marginTop: 8 }}
                      action={<Space><Button size="small" onClick={() => { setParsedData(mockParsedData); setUploadedFile('COD-20240521-HCA100.csv (示例数据)'); message.success('已恢复示例数据'); }}>恢复示例</Button><Button size="small" danger onClick={() => { setUploadedFile(null); setParsedData(null); }}>清除</Button></Space>}
                    />
                  )}
                  <Card size="small" title="📋 示例 CSV 格式" style={{ marginTop: 12, background: '#fafafa' }}>
                    <pre style={{ fontSize: 11, margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{sampleCSV}</pre>
                  </Card>
                </div>
              )},
              { key: 'preview', label: <span>📊 数据预览 {parsedData ? <Tag color="green" style={{marginLeft:4}}>{parsedData.length}条</Tag> : <Tag style={{marginLeft:4}}>空</Tag>}</span>, children: (
                <div>
                  {parsedData ? (
                    <>
                      <Alert message={`解析成功: ${parsedData.length} 条记录 · 空白样 ${parsedData.filter(d=>d.sampleId==='BLK').length} · 标准 ${parsedData.filter(d=>d.sampleId?.startsWith('STD')).length} · 样品 ${parsedData.filter(d=>d.sampleId==='SMP').length} · 质控 ${parsedData.filter(d=>d.sampleId==='QC').length}`} type="success" showIcon style={{ marginBottom: 12 }} />
                      <Table 
                        dataSource={parsedData} rowKey="no" pagination={false} size="small" bordered
                        columns={[
                          { title: '#', dataIndex: 'no', width: 40 },
                          { title: '样品ID', dataIndex: 'sampleId', width: 70, render: (v:string) => <Tag color={v==='BLK'?'default':v==='QC'?'orange':v==='SMP'?'blue':'green'}>{v}</Tag> },
                          { title: '名称', dataIndex: 'name' },
                          { title: '吸光度', dataIndex: 'absorbance', width: 80 },
                          { title: '浓度(mg/L)', dataIndex: 'conc', width: 100, render: (v:string) => <Text strong>{v}</Text> },
                          { title: '标志', dataIndex: 'flag', width: 60, render: (f: string) => <Tag color={f==='正常'?'green':f==='受控'?'blue':'orange'}>{f}</Tag> },
                        ]}
                      />
                      <Space style={{ marginTop: 12 }}>
                        <Button type="primary" icon={<CheckCircleOutlined />} onClick={handleApplyParsedData}>导入读数到仪器读数表</Button>
                        <Button onClick={() => { setParsedData(mockParsedData); setUploadedFile('COD-20240521-HCA100.csv (示例数据)'); }}>重置示例</Button>
                        <Button danger onClick={() => { setParsedData(null); setUploadedFile(null); }}>清除数据</Button>
                      </Space>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: 24 }}>
                      <InboxOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
                      <p><Text type="secondary">请上传仪器数据文件或点击恢复示例</Text></p>
                      <Button onClick={() => { setParsedData(mockParsedData); setUploadedFile('COD-20240521-HCA100.csv (示例数据)'); }}>加载示例数据</Button>
                    </div>
                  )}
                </div>
              )},
            ]} />
          </Card>

          {/* 3. 仪器读数 */}
          <Card 
            title={<Space><EditOutlined />仪器读数</Space>} 
            size="small" style={{ marginBottom: 16 }}
            extra={<Button size="small" icon={<PlusOutlined />} onClick={handleAddReading}>添加读数</Button>}
          >
            <Table columns={readingColumns} dataSource={readings} pagination={false} size="small" bordered />
          </Card>

          {/* 4. 原始记录 */}
          <Card title="原始记录" size="small" style={{ marginBottom: 16 }}>
            <TextArea 
              rows={4} 
              value={rawNotes}
              onChange={e => setRawNotes(e.target.value)}
              placeholder={`描述检测过程...\n\n示例:\n1. 样品前处理: 取适量样品，加入重铬酸钾...\n2. 仪器条件: 消解温度 150°C，消解时间 2h\n3. 标准曲线: y = 0.0076x + 0.0032, R² = 0.9996\n4. 质控: 质控样测定值 24.8 mg/L (标准值 25.0±2.5)`}
            />
          </Card>

          {/* 5. 计算过程 */}
          <Card title="计算过程" size="small" style={{ marginBottom: 16 }}>
            <Table 
              dataSource={[
                { formula: 'COD (mg/L)', calc: '(A - A₀) × K × f', example: '(0.321 - 0.001) × 80.0 × 1 = 25.6', result: '25.6' },
                { formula: 'BOD₅ (mg/L)', calc: '(D₁ - D₂) / P', example: '(8.1 - 0.3) / 1.0 = 7.8', result: '7.8' },
              ]} 
              rowKey="formula" pagination={false} size="small" bordered
              columns={[
                { title: '公式', dataIndex: 'formula', width: 140 },
                { title: '计算式', dataIndex: 'calc' },
                { title: '结果', dataIndex: 'result', width: 80 },
              ]}
            />
          </Card>

          {/* 6. 附件 */}
          <Card title="附件上传" size="small" style={{ marginBottom: 16 }}>
            <Upload multiple showUploadList={{ showPreviewIcon: true }}>
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
            <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>支持 jpg / png / pdf / doc / xls，单文件 ≤ 20MB</Text>
          </Card>

          {/* 7. 审核信息 */}
          <Card title="审核信息" size="small">
            <Descriptions size="small" column={3}>
              <Descriptions.Item label="录入人">王明</Descriptions.Item>
              <Descriptions.Item label="录入时间">2024-05-21 10:25</Descriptions.Item>
              <Descriptions.Item label="复核人">—</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={6}>
          <Card title="样品概览" size="small" style={{ marginBottom: 16 }}>
            <Text strong>{mockTask.sampleName}</Text>
            <Descriptions size="small" column={1} style={{ marginTop: 8 }}>
              <Descriptions.Item label="状态"><Tag color="blue">检测中</Tag></Descriptions.Item>
              <Descriptions.Item label="检测项目">{mockTask.testItem}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="进度概览" size="small" style={{ marginBottom: 16 }}>
            <Progress percent={results.filter(r => r.judgment && r.judgment !== '待判定').length / Math.max(results.length, 1) * 100} format={p => `${Math.round(p)}%`} />
            <Descriptions size="small" column={1} style={{ marginTop: 8 }}>
              <Descriptions.Item label="指标总数">{results.length}</Descriptions.Item>
              <Descriptions.Item label="已填写">{results.filter(r => r.result).length}</Descriptions.Item>
              <Descriptions.Item label="符合">{results.filter(r => r.judgment === '符合').length}</Descriptions.Item>
              <Descriptions.Item label="超标"><Text type="danger">{results.filter(r => r.judgment === '超标').length}</Text></Descriptions.Item>
              <Descriptions.Item label="读数">{readings.length} 条</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="任务时间线" size="small">
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
