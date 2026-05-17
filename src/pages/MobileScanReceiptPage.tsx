import React, { useState, useEffect, useCallback } from 'react';
import {
  Card, Button, Typography, Space, message, List, Tag, Empty, Input, Modal,
} from 'antd';
import {
  ScanOutlined, CheckCircleOutlined, ArrowLeftOutlined,
  HistoryOutlined, QrcodeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface Sample {
  id: string; sampleNo: string; sampleName: string; sampleType: string;
  customerName: string; status: string; receivedAt?: string;
}

export const MobileScanReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const [samples, setSamples] = useState<Sample[]>([]);
  const [history, setHistory] = useState<Sample[]>([]);
  const [scanInput, setScanInput] = useState('');
  const [scannedSample, setScannedSample] = useState<Sample | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<'scan' | 'history'>('scan');

  const loadSamples = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/samples');
      const json = await res.json();
      if (json.code === 200) {
        setSamples(json.data?.list || []);
      }
    } catch { /* ignore */ }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/mobile/scan-receipts');
      const json = await res.json();
      if (json.code === 200) {
        setHistory(json.data?.list || []);
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadSamples(); loadHistory(); }, [loadSamples, loadHistory]);

  const handleScan = (code: string) => {
    if (!code.trim()) return;
    const found = samples.find(s => s.sampleNo === code || s.id === code);
    if (found) {
      setScannedSample(found);
      setModalOpen(true);
    } else {
      message.warning('未找到该样品，请检查条码');
    }
    setScanInput('');
  };

  const confirmReceipt = async () => {
    if (!scannedSample) return;
    try {
      const res = await fetch('/api/v1/mobile/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: scannedSample.id,
          sampleNo: scannedSample.sampleNo,
          receivedBy: '当前用户',
          receivedAt: new Date().toISOString(),
        }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success(`✅ ${scannedSample.sampleNo} 已签收`);
        setModalOpen(false);
        loadHistory();
        loadSamples();
      }
    } catch {
      message.error('签收失败');
    }
  };

  const simulateScan = () => {
    const pending = samples.filter(s => s.status === 'pending_receive');
    if (pending.length > 0) {
      const random = pending[Math.floor(Math.random() * pending.length)];
      setScannedSample(random);
      setModalOpen(true);
    } else {
      message.info('暂无可签收样品');
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', padding: '12px 12px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>扫码签收</Title>
        <Button size="small" icon={<HistoryOutlined />} onClick={() => setView(view === 'scan' ? 'history' : 'scan')}>
          {view === 'scan' ? '历史' : '扫码'}
        </Button>
      </div>

      {view === 'scan' ? (
        <>
          <Card size="small" style={{ borderRadius: 12, marginBottom: 16, textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#e6f4ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <ScanOutlined style={{ fontSize: 36, color: '#1677ff' }} />
            </div>
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>扫描样品条码进行签收</Text>
            <Input.Search
              placeholder="扫描或输入样品条码"
              enterButton={<><ScanOutlined /> 扫描</>}
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              onSearch={handleScan}
              size="large"
              style={{ marginBottom: 12 }}
            />
            <Button type="primary" block size="large" icon={<QrcodeOutlined />} onClick={simulateScan}>
              模拟扫描（测试）
            </Button>
          </Card>

          <Text strong style={{ display: 'block', marginBottom: 8 }}>待签收样品（{samples.filter(s => s.status === 'pending_receive').length}）</Text>
          <List
            dataSource={samples.filter(s => s.status === 'pending_receive')}
            renderItem={s => (
              <Card size="small" style={{ marginBottom: 8, borderRadius: 12 }} hoverable onClick={() => { setScannedSample(s); setModalOpen(true); }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Tag color="blue">{s.sampleNo}</Tag>
                    <Text strong>{s.sampleName}</Text>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>{s.sampleType} · {s.customerName}</Text>
                </Space>
              </Card>
            )}
            locale={{ emptyText: <Empty description="暂无待签收样品" /> }}
          />
        </>
      ) : (
        <>
          <Text strong style={{ display: 'block', marginBottom: 8 }}>今日签收记录（{history.length}）</Text>
          <List
            dataSource={history}
            renderItem={h => (
              <Card size="small" style={{ marginBottom: 8, borderRadius: 12 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text strong>{h.sampleNo}</Text>
                    <Tag color="green">已签收</Tag>
                  </Space>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {h.sampleName} · {h.receivedAt ? new Date(h.receivedAt).toLocaleString('zh-CN') : ''}
                  </Text>
                </Space>
              </Card>
            )}
            locale={{ emptyText: <Empty description="暂无签收记录" /> }}
          />
        </>
      )}

      <Modal
        title="确认签收"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>取消</Button>,
          <Button key="confirm" type="primary" icon={<CheckCircleOutlined />} onClick={confirmReceipt}>
            确认签收
          </Button>,
        ]}
      >
        {scannedSample && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text>样品编号：<Text strong>{scannedSample.sampleNo}</Text></Text>
            <Text>样品名称：{scannedSample.sampleName}</Text>
            <Text>样品类型：{scannedSample.sampleType}</Text>
            <Text>客户：{scannedSample.customerName}</Text>
            <Text type="secondary" style={{ fontSize: 12, marginTop: 8 }}>
              确认签收后将更新样品状态并记录到 COC 监管链
            </Text>
          </Space>
        )}
      </Modal>
    </div>
  );
};
