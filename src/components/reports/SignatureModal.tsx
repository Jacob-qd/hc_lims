import React, { useState, useEffect } from 'react';
import {
  Modal, Alert, Card, Descriptions, Tag, Form, Input, Checkbox, Typography, message,
} from 'antd';
import {
  SignatureOutlined, CheckCircleOutlined, ClockCircleOutlined, SafetyCertificateOutlined,
} from '@ant-design/icons';
import { computeDocumentHash, signatureMeanings } from '../../mocks/data';

const { Text } = Typography;
const { TextArea } = Input;

export interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  onSign: (data: { password: string; reason: string; role: string; meaning: string; meaningStatement: string }) => void;
  role: 'compiler' | 'reviewer' | 'approver';
  roleLabel: string;
  reportId?: string;
}

/** 电子签名确认 Modal（SM2/SM3 国密签名模拟） */
export const SignatureModal: React.FC<SignatureModalProps> = ({
  open, onClose, onSign, role, roleLabel, reportId,
}) => {
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [sm3Hash, setSm3Hash] = useState('');

  const roleToMeaning: Record<string, string> = {
    compiler: 'PREPARED',
    reviewer: 'REVIEWED',
    approver: 'APPROVED',
  };
  const currentMeaning = roleToMeaning[role] || 'PREPARED';
  const meaningDef = signatureMeanings.find(m => m.value === currentMeaning);

  useEffect(() => {
    if (open && reportId) {
      const docForHash = { id: reportId, reportNo: 'RPT...', title: '检测报告', customerName: '', testResults: [] };
      const hash = computeDocumentHash(docForHash);
      setSm3Hash(hash);
      setPassword('');
      setReason('');
      setConfirmed(false);
    }
  }, [open, reportId]);

  const handleSubmit = () => {
    if (!password) { message.warning('请输入签名密码'); return; }
    if (!reason) { message.warning('请输入签名理由'); return; }
    if (!confirmed) { message.warning('请确认签名内容真实有效'); return; }
    if (password !== '123456') { message.error('密码错误'); return; }
    onSign({ password, reason, role, meaning: currentMeaning, meaningStatement: reason });
    setPassword('');
    setReason('');
    setConfirmed(false);
  };

  return (
    <Modal
      title={<span><SignatureOutlined style={{ color: '#1677ff' }} /> 电子签名确认</span>}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      okText="确认签名"
      okButtonProps={{ icon: <CheckCircleOutlined />, disabled: !confirmed || !password || !reason }}
      width={560}
    >
      <Alert
        message={{
          PREPARED: '报告编制完成，将以「编制」身份进行电子签名',
          REVIEWED: '技术审核通过，将以「审核」身份进行电子签名',
          APPROVED: '报告批准签发，将以「批准」身份进行电子签名',
        }[currentMeaning] || `即将以「${roleLabel}」身份进行电子签名`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card size="small" style={{ marginBottom: 16, background: '#f6f8fa' }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="签名含义">
            <Tag color={role === 'compiler' ? 'blue' : role === 'reviewer' ? 'orange' : 'green'}>
              {meaningDef?.label || roleLabel}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>{meaningDef?.description}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="签名算法"><Tag color="geekblue">SM2</Tag> 椭圆曲线公钥密码算法</Descriptions.Item>
          <Descriptions.Item label="摘要算法"><Tag color="geekblue">SM3</Tag> 密码杂凑算法</Descriptions.Item>
          <Descriptions.Item label="文档摘要 (SM3)">
            <Text copyable style={{ fontFamily: 'monospace', fontSize: 11, wordBreak: 'break-all' }}>
              {sm3Hash}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Form layout="vertical">
        <Form.Item label="签名密码" required>
          <Input.Password
            placeholder="请输入签名密码（测试密码：123456）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            prefix={<SafetyCertificateOutlined />}
          />
        </Form.Item>
        <Form.Item label="签名含义声明" required>
          <TextArea
            placeholder={meaningDef?.description || '请说明签名理由...'}
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox checked={confirmed} onChange={e => setConfirmed(e.target.checked)}>
            <Text strong>我确认以上内容真实有效，并承担相应法律责任</Text>
          </Checkbox>
        </Form.Item>
      </Form>

      <div style={{ fontSize: 12, color: '#999', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
        <ClockCircleOutlined style={{ marginRight: 4 }} />
        签名后将记录时间戳 (NTP)、IP 地址、会话ID，形成不可篡改的签名审计链
      </div>
    </Modal>
  );
};
