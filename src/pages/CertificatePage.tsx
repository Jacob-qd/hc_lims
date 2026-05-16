import React, { useEffect, useState } from 'react';
import {
  Card, Table, Tag, Button, Input, Space, Typography, Modal, Form,
  Descriptions, message, DatePicker, Select, Tooltip, Statistic, Row, Col,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, SafetyCertificateOutlined,
  DeleteOutlined, KeyOutlined, ClockCircleOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { mockSm2Certificates } from '../mocks/data';
import type { Sm2Certificate } from '../mocks/data';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const getStatusColor = (status: string) => {
  const map: Record<string, string> = {
    active: 'success',
    revoked: 'error',
    expired: 'warning',
  };
  return map[status] || 'default';
};

const getStatusLabel = (status: string) => {
  const map: Record<string, string> = {
    active: '有效',
    revoked: '已吊销',
    expired: '已过期',
  };
  return map[status] || status;
};

export const CertificatePage: React.FC = () => {
  const [certificates, setCertificates] = useState<Sm2Certificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Sm2Certificate | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  const loadCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/certificates').then(r => r.json());
      if (res.code === 200) {
        setCertificates(res.data.list);
      } else {
        // Fallback to mock data
        setCertificates(mockSm2Certificates as Sm2Certificate[]);
      }
    } catch {
      setCertificates(mockSm2Certificates as Sm2Certificate[]);
    }
    setLoading(false);
  };

  useEffect(() => { loadCertificates(); }, []);

  const handleRevoke = (cert: Sm2Certificate) => {
    Modal.confirm({
      title: `确定吊销证书「${cert.userName}」？`,
      content: '吊销后，使用此证书的签名将标记为"证书已吊销"，且不可恢复。',
      okText: '确认吊销',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        const res = await fetch(`/api/v1/certificates/${cert.id}/revoke`, {
          method: 'POST',
        }).then(r => r.json());
        if (res.code === 200) {
          message.success('证书已吊销');
          loadCertificates();
        }
      },
    });
  };

  const handleImport = async (values: any) => {
    const payload = {
      userId: values.userId || '3',
      userName: values.userName,
      certSubject: `CN=${values.userName}, OU=实验室, O=红创检测认证有限公司`,
      serialNumber: `SM2-CERT-${Date.now()}`,
      notBefore: values.validity?.[0]?.format('YYYY-MM-DD') || new Date().toISOString().slice(0, 10),
      notAfter: values.validity?.[1]?.format('YYYY-MM-DD') || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    };
    const res = await fetch('/api/v1/certificates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(r => r.json());
    if (res.code === 200) {
      message.success('证书导入成功');
      setImportModalOpen(false);
      loadCertificates();
    }
  };

  const now = new Date();
  const activeCount = certificates.filter(c => c.status === 'active').length;
  const expiringCount = certificates.filter(c => {
    if (c.status !== 'active') return false;
    const expiry = new Date(c.notAfter);
    const daysLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft <= 30 && daysLeft > 0;
  }).length;
  const revokedCount = certificates.filter(c => c.status === 'revoked').length;

  const filtered = certificates.filter(c =>
    !searchText || c.userName.includes(searchText) || c.serialNumber.includes(searchText) || c.certSubject.includes(searchText)
  );

  const columns: ColumnsType<Sm2Certificate> = [
    {
      title: '持有人', dataIndex: 'userName', key: 'userName', width: 100,
    },
    {
      title: '证书主题', dataIndex: 'certSubject', key: 'certSubject', ellipsis: true,
    },
    {
      title: '序列号', dataIndex: 'serialNumber', key: 'serialNumber', width: 200,
      render: (v: string) => <Text copyable style={{ fontSize: 12, fontFamily: 'monospace' }}>{v}</Text>,
    },
    {
      title: '算法', key: 'algorithm', width: 100,
      render: (_: any, r: Sm2Certificate) => <Tag color="geekblue">{r.algorithm} {r.keyLength}bit</Tag>,
    },
    {
      title: '有效期', key: 'validity', width: 220,
      render: (_: any, r: Sm2Certificate) => (
        <Space size="small" style={{ fontSize: 12 }}>
          <ClockCircleOutlined />
          {r.notBefore} ~ {r.notAfter}
        </Space>
      ),
    },
    {
      title: '状态', dataIndex: 'status', key: 'status', width: 100,
      render: (v: string) => <Tag color={getStatusColor(v)}>{getStatusLabel(v)}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: any, record: Sm2Certificate) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => { setSelectedCert(record); setDetailVisible(true); }}>
            详情
          </Button>
          {record.status === 'active' && (
            <Button type="link" size="small" danger onClick={() => handleRevoke(record)}>
              吊销
            </Button>
          )}
          <Tooltip title="导出证书文件">
            <Button type="link" size="small" icon={<DownloadOutlined />} onClick={() => { const cert = JSON.stringify(record, null, 2); const blob = new Blob([cert], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `cert-${record.id}.json`; a.click(); }} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="有效证书"
              value={activeCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="即将到期 (≤30天)"
              value={expiringCount}
              valueStyle={{ color: expiringCount > 0 ? '#faad14' : '#52c41a' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已吊销"
              value={revokedCount}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已过期"
              value={certificates.filter(c => c.status === 'expired').length}
              valueStyle={{ color: '#faad14' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Input
              placeholder="搜索持有人/序列号/主题"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              style={{ width: 320 }}
            />
            <Button onClick={loadCertificates}>刷新</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setImportModalOpen(true)}>
            导入证书
          </Button>
        </Space>

        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={<span><SafetyCertificateOutlined /> 证书详情</span>}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={<Button onClick={() => setDetailVisible(false)}>关闭</Button>}
        width={640}
      >
        {selectedCert && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="持有人">{selectedCert.userName}</Descriptions.Item>
            <Descriptions.Item label="证书主题">{selectedCert.certSubject}</Descriptions.Item>
            <Descriptions.Item label="颁发者">{selectedCert.certIssuer}</Descriptions.Item>
            <Descriptions.Item label="序列号">
              <Text copyable style={{ fontFamily: 'monospace' }}>{selectedCert.serialNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="签名算法">
              <Tag color="geekblue">{selectedCert.algorithm}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="密钥长度">{selectedCert.keyLength} 位</Descriptions.Item>
            <Descriptions.Item label="生效日期">{selectedCert.notBefore}</Descriptions.Item>
            <Descriptions.Item label="失效日期">{selectedCert.notAfter}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={getStatusColor(selectedCert.status)}>{getStatusLabel(selectedCert.status)}</Tag>
            </Descriptions.Item>
            {selectedCert.revokedAt && (
              <Descriptions.Item label="吊销时间">{selectedCert.revokedAt}</Descriptions.Item>
            )}
            <Descriptions.Item label="创建时间">{selectedCert.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Import Modal */}
      <Modal
        title={<span><KeyOutlined /> 导入 SM2 国密证书</span>}
        open={importModalOpen}
        onCancel={() => setImportModalOpen(false)}
        footer={null}
        width={520}
      >
        <Form
          layout="vertical"
          onFinish={handleImport}
          initialValues={{ userId: '3' }}
        >
          <Form.Item label="证书持有人" name="userName" rules={[{ required: true, message: '请输入持有人姓名' }]}>
            <Input placeholder="如：张三" />
          </Form.Item>
          <Form.Item label="关联用户" name="userId">
            <Select>
              <Select.Option value="1">管理员</Select.Option>
              <Select.Option value="2">张伟</Select.Option>
              <Select.Option value="3">李思</Select.Option>
              <Select.Option value="4">王强</Select.Option>
              <Select.Option value="5">李明</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="证书有效期" name="validity" rules={[{ required: true, message: '请选择有效期' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block icon={<PlusOutlined />}>
              导入证书
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
