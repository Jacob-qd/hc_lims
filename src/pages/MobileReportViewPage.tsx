import React, { useEffect, useState } from 'react';
import {
  Card, Button, Typography, Space, message, Tag, List, Empty,
  Input, Skeleton, Modal,
} from 'antd';
import {
  FileTextOutlined, ArrowLeftOutlined, DownloadOutlined,
  EyeOutlined, CheckCircleOutlined, SignatureOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text, Title } = Typography;

interface MobileReport {
  id: string;
  reportNo: string;
  title: string;
  customerName: string;
  status: string;
  statusLabel: string;
  issueDate?: string;
  sampleCount?: number;
}

/** 移动端报告查看 */
export const MobileReportViewPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<MobileReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [signModal, setSignModal] = useState(false);
  const [signing, setSigning] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/reports');
      const data = await res.json();
      if (data.code === 200) {
        const list = (data.data?.list || []).map((r: any) => ({
          id: r.id,
          reportNo: r.reportNo,
          title: r.title,
          customerName: r.customerName,
          status: r.status,
          statusLabel: r.statusLabel,
          issueDate: r.issueDate,
          sampleCount: r.sampleCount || 1,
        }));
        setReports(list);
      }
    } catch {
      message.error('加载报告失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/v1/mobile/reports/${id}`);
      const data = await res.json();
      if (data.code === 200) {
        setSelectedReport(data.data);
      }
    } catch {
      message.error('加载报告详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSign = async () => {
    if (!selectedReport) return;
    setSigning(true);
    try {
      const res = await fetch('/api/v1/mobile/signatures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: selectedReport.id,
          documentType: 'REPORT',
          meaning: 'APPROVED',
          signerName: '移动端用户',
          signatureData: 'mobile-signature-data',
          device: 'mobile-h5',
        }),
      });
      const data = await res.json();
      if (data.code === 200) {
        message.success('签名确认成功');
        setSignModal(false);
        setSelectedReport(null);
        fetchReports();
      } else {
        message.error(data.message || '签名失败');
      }
    } catch {
      message.error('网络错误');
    } finally {
      setSigning(false);
    }
  };

  const filtered = keyword
    ? reports.filter(r =>
        r.title.includes(keyword) ||
        r.reportNo.includes(keyword) ||
        r.customerName.includes(keyword)
      )
    : reports;

  const statusColor: Record<string, string> = {
    draft: 'default',
    pending_tech_review: 'orange',
    pending_approval: 'blue',
    issued: 'green',
  };

  // Detail view
  if (selectedReport) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => setSelectedReport(null)} />
          <Title level={5} style={{ margin: 0, flex: 1 }}>报告详情</Title>
          {selectedReport.status === 'pending_approval' && (
            <Button size="small" type="primary" icon={<SignatureOutlined />} onClick={() => setSignModal(true)}>
              签名确认
            </Button>
          )}
        </div>

        {detailLoading ? (
          <Skeleton active />
        ) : (
          <>
            <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong style={{ fontSize: 16 }}>{selectedReport.title}</Text>
                <Tag color={statusColor[selectedReport.status] || 'default'}>{selectedReport.statusLabel}</Tag>
                <div><Text type="secondary" style={{ fontSize: 12 }}>报告编号: {selectedReport.reportNo}</Text></div>
                <div><Text type="secondary" style={{ fontSize: 12 }}>客户: {selectedReport.customerName}</Text></div>
                {selectedReport.issueDate && (
                  <div><Text type="secondary" style={{ fontSize: 12 }}>签发日期: {selectedReport.issueDate}</Text></div>
                )}
              </Space>
            </Card>

            {/* Preview placeholder */}
            <Card size="small" style={{ borderRadius: 12, minHeight: 300 }} title="报告预览">
              <div style={{ textAlign: 'center', padding: 40 }}>
                <FileTextOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">报告内容预览</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Button icon={<DownloadOutlined />}>下载 PDF</Button>
                </div>
              </div>
            </Card>
          </>
        )}

        <Modal
          title="签名确认"
          open={signModal}
          onCancel={() => setSignModal(false)}
          footer={[
            <Button key="cancel" onClick={() => setSignModal(false)}>取消</Button>,
            <Button key="sign" type="primary" loading={signing} onClick={handleSign} icon={<CheckCircleOutlined />}>
              确认签名
            </Button>,
          ]}
        >
          <Text>您确认对报告 <Text strong>{selectedReport.title}</Text> 进行电子签名吗？</Text>
          <div style={{ marginTop: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              签名后报告状态将变更为"已签发"，此操作不可撤销。
            </Text>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: 12, background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 8 }}>
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/mobile')} />
        <Title level={5} style={{ margin: 0, flex: 1 }}>报告查看</Title>
      </div>

      <Card size="small" style={{ marginBottom: 12, borderRadius: 12 }}>
        <Input
          size="small"
          placeholder="搜索报告编号/标题/客户"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          allowClear
        />
      </Card>

      <List
        dataSource={filtered}
        loading={loading}
        renderItem={(r) => (
          <Card
            size="small"
            hoverable
            style={{ marginBottom: 8, borderRadius: 12 }}
            onClick={() => fetchDetail(r.id)}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong style={{ fontSize: 14 }}>{r.title}</Text>
                <Tag color={statusColor[r.status] || 'default'} style={{ fontSize: 10 }}>{r.statusLabel}</Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>{r.reportNo}</Text>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>{r.customerName}</Text>
                <Button size="small" type="link" icon={<EyeOutlined />}>查看</Button>
              </div>
            </Space>
          </Card>
        )}
        locale={{ emptyText: <Empty description="暂无报告" /> }}
      />
    </div>
  );
};
