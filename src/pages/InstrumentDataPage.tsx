import React, { useState } from 'react';
import {Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, Tabs, Badge, Modal, Form, Input, Select, InputNumber, Upload, Descriptions, Switch, List} from 'antd';
import { ApiOutlined, WifiOutlined, LinkOutlined, UploadOutlined, PlayCircleOutlined, SettingOutlined, UsbOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const mockInstruments = [
  { id: 'ins1', name: 'HPLC-安捷伦1260', type: '液相色谱', connection: 'TCP/IP', ip: '192.168.1.101', port: 8001, status: 'connected', lastData: '2024-05-15 14:28', driver: 'agilent-hplc' },
  { id: 'ins2', name: 'GC-MS-岛津QP2020', type: '气相色谱质谱', connection: 'RS232', ip: 'COM3', port: 9600, status: 'disconnected', lastData: '2024-05-15 10:00', driver: 'shimadzu-gcms' },
  { id: 'ins3', name: 'ICP-MS-Agilent 7800', type: '电感耦合', connection: 'TCP/IP', ip: '192.168.1.103', port: 8002, status: 'connected', lastData: '2024-05-15 14:30', driver: 'agilent-icpms' },
  { id: 'ins4', name: 'UV-Vis-岛津UV2600', type: '紫外分光', connection: 'RS232', ip: 'COM5', port: 9600, status: 'connected', lastData: '2024-05-15 14:15', driver: 'shimadzu-uv' },
  { id: 'ins5', name: 'HPLC-Waters e2695', type: '液相色谱', connection: '文件监听', ip: '/data/instruments/waters', port: 0, status: 'connected', lastData: '2024-05-15 14:20', driver: 'waters-hplc' },
];

const mockImportHistory = [
  { id: 'h1', instrument: 'HPLC-安捷伦1260', file: '20240515_1428.csv', records: 24, status: 'success', time: '2024-05-15 14:28' },
  { id: 'h2', instrument: 'GC-MS-岛津QP2020', file: '20240514_batch3.csv', records: 12, status: 'error', time: '2024-05-14 16:00', error: '峰面积未识别' },
  { id: 'h3', instrument: 'UV-Vis-岛津UV2600', file: '20240515_wavelength.csv', records: 36, status: 'success', time: '2024-05-15 14:15' },
];

const statusIcons: Record<string, React.ReactNode> = {
  connected: <Badge status="success" text="已连接" />,
  disconnected: <Badge status="error" text="未连接" />,
  error: <Badge status="warning" text="异常" />,
};

export const InstrumentDataPage: React.FC = () => {
  const [configVisible, setConfigVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [configForm] = Form.useForm();

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col><Title level={4}><ApiOutlined /> 仪器数据直连</Title></Col>
        <Col><Space><Button icon={<UploadOutlined />} onClick={() => setImportVisible(true)}>导入数据文件</Button><Button type="primary" icon={<SettingOutlined />} onClick={() => setConfigVisible(true)}>添加仪器连接</Button></Space></Col>
      </Row>

      <Row gutter={[16,16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="已连接仪器" value={mockInstruments.filter(i => i.status === 'connected').length} suffix={`/ ${mockInstruments.length}`} prefix={<WifiOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="今日采集数据" value="72条" prefix={<FileTextOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="支持驱动" value="15个" prefix={<UsbOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="文件导入成功率" value="94%" prefix={<UploadOutlined />} valueStyle={{ color: '#52c41a' }} /></Card></Col>
      </Row>

      <Tabs defaultActiveKey="instruments" items={[
        { key: 'instruments', label: '仪器连接管理', children: <Card>
          <Table dataSource={mockInstruments} rowKey="id" columns={[
            { title: '仪器名称', dataIndex: 'name', render: (n: string) => <a>{n}</a> },
            { title: '类型', dataIndex: 'type', render: (t: string) => <Tag>{t}</Tag> },
            { title: '连接方式', dataIndex: 'connection', render: (c: string) => <Tag color={c === 'TCP/IP' ? 'blue' : c === 'RS232' ? 'green' : 'orange'}>{c}</Tag> },
            { title: '地址', dataIndex: 'ip' },
            { title: '状态', dataIndex: 'status', render: (s: string) => statusIcons[s] },
            { title: '最后数据', dataIndex: 'lastData', width: 150 },
            { title: '操作', render: (_: any, r: any) => <Space size="small">
              <Button type="link" size="small" onClick={() => message.success(`测试连接 ${r.name} 成功`)}>测试</Button>
              <Button type="link" size="small">{r.status === 'connected' ? '断开' : '连接'}</Button>
              <Button type="link" size="small" onClick={() => { configForm.setFieldsValue(r); setConfigVisible(true); }}>配置</Button>
            </Space> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'drivers', label: '仪器驱动库', children: <Card>
          <Table dataSource={[
            { driver: 'agilent-hplc', vendor: '安捷伦', models: '1260/1290 Infinity II', protocol: 'TCP/IP + ASTM', status: 'active', instruments: 2 },
            { driver: 'shimadzu-gcms', vendor: '岛津', models: 'QP2020/2030', protocol: 'RS232', status: 'active', instruments: 1 },
            { driver: 'agilent-icpms', vendor: '安捷伦', models: '7800/7900', protocol: 'TCP/IP', status: 'active', instruments: 1 },
            { driver: 'shimadzu-uv', vendor: '岛津', models: 'UV2600/2700', protocol: 'RS232', status: 'active', instruments: 1 },
            { driver: 'waters-hplc', vendor: 'Waters', models: 'e2695/ACQUITY', protocol: '文件监听', status: 'active', instruments: 1 },
            { driver: 'thermo-icp', vendor: 'Thermo Fisher', models: 'iCAP Q/RQ', protocol: 'TCP/IP', status: 'inactive', instruments: 0 },
            { driver: 'empower-cds', vendor: 'Waters', models: 'Empower 3', protocol: 'API', status: 'inactive', instruments: 0 },
            { driver: 'chromeleon-cds', vendor: 'Thermo Fisher', models: 'Chromeleon 7', protocol: '文件监听', status: 'inactive', instruments: 0 },
          ]} rowKey="driver" columns={[
            { title: '驱动ID', dataIndex: 'driver' },
            { title: '厂商', dataIndex: 'vendor', render: (v: string) => <Tag color="blue">{v}</Tag> },
            { title: '适用型号', dataIndex: 'models' },
            { title: '协议', dataIndex: 'protocol' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Badge status={s === 'active' ? 'success' : 'default'} text={s === 'active' ? '已激活' : '未激活'} /> },
            { title: '连接数', dataIndex: 'instruments' },
            { title: '操作', render: () => <Space><Button type="link" size="small">详情</Button><Button type="link" size="small">启用</Button></Space> },
          ]} pagination={false} size="middle" />
        </Card>},
        { key: 'import', label: '文件导入记录', children: <Card extra={<Button icon={<UploadOutlined />} onClick={() => setImportVisible(true)}>导入文件</Button>}>
          <Table dataSource={mockImportHistory} rowKey="id" columns={[
            { title: '仪器', dataIndex: 'instrument' },
            { title: '文件名', dataIndex: 'file' },
            { title: '记录数', dataIndex: 'records' },
            { title: '状态', dataIndex: 'status', render: (s: string) => <Tag color={s === 'success' ? 'green' : 'red'}>{s === 'success' ? '成功' : '失败'}</Tag> },
            { title: '时间', dataIndex: 'time' },
            { title: '详情', dataIndex: 'error', render: (e: string) => e ? <Text type="danger">{e}</Text> : '-' },
          ]} pagination={false} size="middle" />
        </Card>},
      ]} />

      <Modal title="添加仪器连接" open={configVisible} onCancel={() => setConfigVisible(false)} onOk={() => { configForm.submit(); }}>
        <Form form={configForm} layout="vertical" onFinish={() => { message.success('仪器连接配置成功'); setConfigVisible(false); configForm.resetFields(); }}>
          <Form.Item name="name" label="仪器名称" required><Input /></Form.Item>
          <Form.Item name="type" label="仪器类型"><Select options={[
            { value: 'hplc', label: '液相色谱(HPLC)' }, { value: 'gc', label: '气相色谱(GC)' },
            { value: 'gcms', label: 'GC-MS' }, { value: 'icp', label: 'ICP/ICP-MS' },
            { value: 'uv', label: 'UV-Vis' }, { value: 'other', label: '其他' },
          ]} /></Form.Item>
          <Form.Item name="connection" label="连接方式"><Select options={[
            { value: 'tcp', label: 'TCP/IP' }, { value: 'rs232', label: 'RS232串口' },
            { value: 'file', label: '文件监听' }, { value: 'api', label: 'REST API' },
          ]} /></Form.Item>
          <Row gutter={16}>
            <Col span={14}><Form.Item name="ip" label="地址"><Input placeholder="IP地址或COM口" /></Form.Item></Col>
            <Col span={10}><Form.Item name="port" label="端口"><InputNumber style={{ width: '100%' }} /></Form.Item></Col>
          </Row>
          <Form.Item name="driver" label="驱动"><Select options={[
            { value: 'agilent-hplc', label: '安捷伦 HPLC' }, { value: 'shimadzu-gcms', label: '岛津 GC-MS' },
            { value: 'generic-csv', label: '通用 CSV 解析' }, { value: 'astm-e1381', label: 'ASTM E1381 协议' },
          ]} /></Form.Item>
        </Form>
      </Modal>

      <Modal title="导入仪器数据文件" open={importVisible} onCancel={() => setImportVisible(false)} footer={null}>
        <Form layout="vertical" onFinish={() => { message.success('数据导入成功'); setImportVisible(false); }}>
          <Form.Item name="instrument" label="目标仪器"><Select options={mockInstruments.map(i => ({ value: i.id, label: i.name }))} /></Form.Item>
          <Form.Item label="上传文件">
            <Upload.Dragger accept=".csv,.xlsx,.txt,.pdf" beforeUpload={() => false}>
              <UploadOutlined style={{ fontSize: 32 }} />
              <p>点击或拖拽文件到此区域上传</p>
              <Text type="secondary">支持 CSV / Excel / TXT / PDF (ASTM E1394格式)</Text>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="mapping" label="列映射模板"><Select options={[
            { value: 'agilent-csv', label: '安捷伦CSV标准模板' },
            { value: 'generic', label: '通用模板(样品号/检测项/结果/单位)' },
          ]} /></Form.Item>
          <Button type="primary" htmlType="submit" block>开始导入</Button>
        </Form>
      </Modal>
    </div>
  );
};
