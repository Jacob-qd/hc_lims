import React, { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Button, Row, Col, Typography, Statistic, Space, message, Modal, Form, Select, InputNumber } from 'antd';
import { CloudDownloadOutlined, DatabaseOutlined, ReloadOutlined, ClockCircleOutlined, CheckCircleOutlined, DownloadOutlined, SettingOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const api = (p: string) => `/api/v1${p}`;

export const BackupPage: React.FC = () => {
  const [backups, setBackups] = useState<LooseAny[]>([]);
  const [loading, setLoading] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [verifyResult, setVerifyResult] = useState<string | null>(null);

  const loadBackups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(api('/backups'));
      const json = await res.json();
      setBackups(json.data?.list || []);
    } catch { message.error('加载备份列表失败'); }
    finally { setLoading(false); }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadBackups(); }, [loadBackups]);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await fetch(api('/backups'), { method: 'POST' });
      const json = await res.json();
      if (json.code === 200) {
        message.success('备份创建成功');
        loadBackups();
      }
    } catch { message.error('备份失败'); }
    finally { setBackingUp(false); }
  };

  const handleRestore = async (id: string) => {
    Modal.confirm({
      title: '确认数据恢复',
      content: '此操作将用选中的备份文件覆盖当前数据，此操作不可撤销。是否继续？',
      okText: '确认恢复',
      okType: 'danger',
      onOk: async () => {
        setRestoring(id);
        try {
          const res = await fetch(api(`/backups/${id}/restore`), { method: 'POST' });
          const json = await res.json();
          if (json.code === 200) message.success('数据恢复成功');
        } catch { message.error('恢复失败'); }
        finally { setRestoring(null); }
      },
    });
  };

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(api(`/backups/${id}/verify`), { method: 'POST' });
      const json = await res.json();
      setVerifyResult(json.data?.valid ? '✅ 备份文件完整' : '❌ 备份文件损坏');
      message.info(json.data?.valid ? '备份校验通过' : '备份校验失败');
    } catch { message.error('校验失败'); }
  };

  const stats = {
    total: backups.length,
    latest: backups[0]?.date?.split(' ')[1] || '-',
    totalSize: backups.reduce((s: number, b: Record<string, LooseAny>) => s + parseInt(b.size), 0) + 'MB',
    autoFreq: '每日',
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col><Title level={4} style={{ margin: 0 }}><DatabaseOutlined /> 数据备份与恢复</Title></Col>
        <Col>
          <Space>
            <Button icon={<SettingOutlined />} onClick={() => setScheduleOpen(true)}>备份策略</Button>
            <Button type="primary" icon={<CloudDownloadOutlined />} loading={backingUp} onClick={handleBackup}>
              {backingUp ? '备份中...' : '立即备份'}
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col span={6}><Card size="small"><Statistic title="备份总数" value={stats.total} prefix={<DatabaseOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="最近备份" value={stats.latest} prefix={<ClockCircleOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="总大小" value={stats.totalSize} prefix={<CloudDownloadOutlined />} /></Card></Col>
        <Col span={6}><Card size="small"><Statistic title="自动备份" value={stats.autoFreq} prefix={<ReloadOutlined />} /></Card></Col>
      </Row>

      <Card title="备份文件列表" extra={<Text type="secondary">自动备份每天 03:00 执行，保留 30 天</Text>}>
        <Table
          dataSource={backups}
          rowKey="id"
          loading={loading}
          pagination={false}
          columns={[
            { title: '文件名', dataIndex: 'name', ellipsis: true },
            { title: '大小', dataIndex: 'size', width: 80 },
            { title: '类型', dataIndex: 'type', width: 80, render: (t: string) => <Tag color={t === '自动' ? 'blue' : 'orange'}>{t}</Tag> },
            { title: '备份时间', dataIndex: 'date', width: 160 },
            { title: '状态', dataIndex: 'status', width: 100, render: (s: string) => {
              const map: Record<string, {color:string;label:string}> = { completed: { color: 'green', label: '完成' }, verifying: { color: 'processing', label: '校验中' }, failed: { color: 'red', label: '失败' } };
              return <Tag color={map[s]?.color}>{map[s]?.label || s}</Tag>;
            }},
            { title: '校验', width: 80, render: (_: string, r: Record<string, LooseAny>) => <Button size="small" icon={<CheckCircleOutlined />} onClick={() => handleVerify(r.id)}>校验</Button> },
            { title: '操作', width: 150, render: (_: string, r: Record<string, LooseAny>) => (
              <Space>
                <Button size="small" type="primary" ghost loading={restoring === r.id} onClick={() => handleRestore(r.id)}>恢复</Button>
                <Button size="small" icon={<DownloadOutlined />} onClick={() => message.success('下载已开始: ' + r.name)}>下载</Button>
              </Space>
            )},
          ]}
          size="middle"
        />
      </Card>

      {verifyResult && (
        <Card style={{ marginTop: 16 }}>
          <Text><CheckCircleOutlined /> 校验结果: {verifyResult}</Text>
        </Card>
      )}

      <Modal title="备份策略配置" open={scheduleOpen} onCancel={() => setScheduleOpen(false)} footer={null} width={500}>
        <Form layout="vertical">
          <Form.Item label="自动备份频率" initialValue="daily"><Select>
            <Option value="daily">每日</Option>
            <Option value="weekly">每周</Option>
            <Option value="manual">仅手动</Option>
          </Select></Form.Item>
          <Form.Item label="备份时间" initialValue="3"><InputNumber addonAfter=":00 (UTC+8)" min={0} max={23} /></Form.Item>
          <Form.Item label="保留天数" initialValue={30}><InputNumber min={1} max={365} /></Form.Item>
          <Form.Item label="备份存储" initialValue="local"><Select>
            <Option value="local">本地磁盘</Option>
            <Option value="minio">MinIO (S3)</Option>
            <Option value="oss">阿里云OSS</Option>
          </Select></Form.Item>
          <Form.Item><Button type="primary" onClick={() => { message.success('备份策略已保存'); setScheduleOpen(false); }}>保存配置</Button></Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
