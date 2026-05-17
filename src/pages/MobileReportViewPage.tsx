import React, { useState, useEffect } from 'react';
import {
  Card, Button, Typography, Space, message, List, Tag, Empty, Modal, Input,
} from 'antd';
import {
  FileTextOutlined, DownloadOutlined, EyeOutlined, EditOutlined,
  ArrowLeftOutlined, CheckCircleOutlined, ShareAltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface Report {
  id: string; reportNo: string; title: string; sampleName: string;
  issueDate: string; status: string; statusLabel: string; signed: boolean;
  customerName: string; testItems: string;
}

export const MobileReportViewPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [signName, setSignName] = useState('');

  useEffect(() => {
    fetch('/api/v1/mobile/reports')
      .then(r => r.json())
      .then(d => {
        if (d.code === 200) setReports(d.data?.list || []);
        setLoading(false);
      })
      .catch(() => { message.error('加载失败'); setLoading(false); });
  }, []);

  const openDetail = (r: Report) => {
    setSelectedReport(r);
    setDetailOpen(true);
  };

  const handleSign = async () => {
    if (!signName.trim()) { message.warning('请输入签名人姓名'); return; }
    if (!selectedReport) return;
    try {
      const res = await fetch(`/api/v1/mobile/reports/${selectedReport.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signerName: signName, signedAt: new Date().toISOString() }),
      });
      const json = await res.json();
      if (json.code === 200) {
        message.success('✅ 签名确认成功');
        setSignOpen(false);
        setDetailOpen(false);
        setReports(prev => prev.map(r => r.id === selectedReport.id ? { ...r, signed: true, status: 'signed', statusLabel: '已签收' } : r));
      }
    } catch { message.error('签名失败'); }
  };

  const statusColors: Record<string, string> = {
    official: 'green', revised: 'orange', pending_sign: 'blue', signed: 'purple',
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', padding: '12px 12px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>报告查看</Title>
      </div>

      <List
        dataSource={reports}
        loading={loading}
        renderItem={r => (
          <Card
            size="small" hoverable
            style={{ marginBottom: 8, borderRadius: 12 }}
            onClick={() => openDetail(r)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Tag color={statusColors[r.status] || 'default'}>{r.statusLabel}</Tag>
                  <Text strong style={{ fontSize: 14 }}>{r.reportNo}</Text>
                </Space>
                {r.signed && <CheckCircleOutlined style={{ color: '#52c41a' }} />}
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.sampleName}</Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {r.issueDate} · {r.customerName}
              </Text>
            </Space>
          </Card>
        )}
        locale={{ emptyText: <Empty description="暂无报告" /> }}
      />

      <Modal
        title={<Space><FileTextOutlined />报告详情</Space>}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
      >
        {selectedReport && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Card size="small" style={{ background: '#f6f8fa', borderRadius: 8 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>报告编号：<Text strong>{selectedReport.reportNo}</Text></Text>
                <Text>样品名称：{selectedReport.sampleName}</Text>
                <Text>客户：{selectedReport.customerName}</Text>
                <Text>出具日期：{selectedReport.issueDate}</Text>
                <Text>检测项目：{selectedReport.testItems}</Text>
                <Space>
                  <Tag color={statusColors[selectedReport.status]}>{selectedReport.statusLabel}</Tag>
                  {selectedReport.signed && <Tag color="green">已签名</Tag>}
                </Space>
              </Space>
            </Card>

            <div style={{ border: '1px solid #eee', borderRadius: 8, padding: 16, background: '#fafafa' }}>
              <div style={{ textAlign: 'center', marginBottom: 12 }}>
                <Text strong style={{ fontSize: 16 }}>检 测 报 告</Text>
                <div style={{ fontSize: 12, color: '#999' }}>TEST REPORT</div>
              </div>
              <div style={{ fontSize: 12, lineHeight: 2 }}>
                <div>报告编号：{selectedReport.reportNo}</div>
                <div>样品名称：{selectedReport.sampleName}</div>
                <div>委托单位：{selectedReport.customerName}</div>
                <div>检测类别：委托检测</div>
              </div>
            </div>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button icon={<EyeOutlined />}>在线预览</Button>
              <Button type="primary" icon={<DownloadOutlined />}>下载PDF</Button>
              <Button icon={<ShareAltOutlined />}>分享</Button>
            </Space>

            {!selectedReport.signed && selectedReport.status === 'pending_sign' && (
              <Button type="primary" block icon={<EditOutlined />} onClick={() => setSignOpen(true)}>
                电子签名确认
              </Button>
            )}
          </Space>
        )}
      </Modal>

      <Modal
        title="电子签名确认"
        open={signOpen}
        onCancel={() => setSignOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setSignOpen(false)}>取消</Button>,
          <Button key="confirm" type="primary" icon={<CheckCircleOutlined />} onClick={handleSign}>确认签名</Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text>请在下方输入您的姓名进行电子签名确认：</Text>
          <Input
            placeholder="请输入签名人姓名"
            value={signName}
            onChange={e => setSignName(e.target.value)}
            size="large"
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            签名即表示确认本报告内容真实有效，具有法律效力。
          </Text>
        </Space>
      </Modal>
    </div>
  );
};
