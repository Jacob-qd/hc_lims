import React, { useEffect, useState } from 'react';
import {
  Card, Button, Typography, Space, message, Tag, List, Empty,
  Input, Row, Col,
} from 'antd';
import {
  ScanOutlined, ArrowLeftOutlined, CheckCircleOutlined,
  QrcodeOutlined, InboxOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface ScannedSample {
  id: string;
  sampleNo: string;
  name: string;
  typeLabel: string;
  customerName: string;
  statusLabel: string;
  samplingLocation: string;
  samplingTime: string;
}

/** 移动端扫码签收 */
export const MobileScanReceiptPage: React.FC = () => {
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState('');
  const [scanned, setScanned] = useState<ScannedSample[]>([]);
  const [recent, setRecent] = useState<ScannedSample[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setScanModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mobile_scan_history');
    if (saved) {
      try { setRecent(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  const handleScan = async (code: string) => {
    if (!code.trim()) { message.warning('请输入条码'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/v1/mobile/samples/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: code, operatorName: '移动端用户', location: '现场签收' }),
      });
      const data = await res.json();
      if (data.code === 200) {
        message.success('签收成功');
        const sample: ScannedSample = data.data;
        setScanned(prev => [sample, ...prev]);
        setRecent(prev => {
          const next = [sample, ...prev.filter(s => s.id !== sample.id)].slice(0, 20);
          localStorage.setItem('mobile_scan_history', JSON.stringify(next));
          return next;
        });
        setBarcode('');
        setScanModal(false);
      } else {
        message.error(data.message || '签收失败');
      }
    } catch {
      message.error('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const startCameraScan = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      // Simulate barcode detection with random sample
      const mockCodes = ['SMP20240521001', 'SMP20240521002', 'SMP20240520045'];
      const code = mockCodes[Math.floor(Math.random() * mockCodes.length)];
      message.info('识别到条码: ' + code);
      await handleScan(code);
    };
    input.click();
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>扫码签收</Title>
      </div>

      {/* Scan Input */}
      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Row gutter={8}>
            <Col flex="auto">
              <Input
                size="large"
                placeholder="输入或扫描样品条码"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                onPressEnter={() => handleScan(barcode)}
                prefix={<ScanOutlined style={{ color: '#999' }} />}
              />
            </Col>
            <Col>
              <Button size="large" type="primary" icon={<QrcodeOutlined />} onClick={startCameraScan} />
            </Col>
          </Row>
          <Button type="primary" block loading={loading} onClick={() => handleScan(barcode)} icon={<CheckCircleOutlined />}>
            确认签收
          </Button>
        </Space>
      </Card>

      {/* Today's scanned */}
      {scanned.length > 0 && (
        <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }} title="本次签收">
          <List
            dataSource={scanned}
            renderItem={(s) => (
              <List.Item style={{ padding: '8px 0' }}>
                <List.Item.Meta
                  avatar={<InboxOutlined style={{ fontSize: 20, color: '#52c41a' }} />}
                  title={<Space><Text strong>{s.name}</Text><Tag color="green">已签收</Tag></Space>}
                  description={
                    <Space direction="vertical" size={0}>
                      <Text type="secondary" style={{ fontSize: 11 }}>{s.sampleNo}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>📍 {s.samplingLocation}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      {/* Recent history */}
      <Card size="small" style={{ borderRadius: 12 }} title="最近签收">
        {recent.length === 0 ? (
          <Empty description="暂无签收记录" />
        ) : (
          <List
            dataSource={recent.slice(0, 5)}
            renderItem={(s) => (
              <List.Item style={{ padding: '8px 0' }}>
                <List.Item.Meta
                  title={<Text style={{ fontSize: 13 }}>{s.name}</Text>}
                  description={<Text type="secondary" style={{ fontSize: 11 }}>{s.sampleNo}</Text>}
                />
                <Button size="small" onClick={() => handleScan(s.sampleNo)}>再次签收</Button>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};
