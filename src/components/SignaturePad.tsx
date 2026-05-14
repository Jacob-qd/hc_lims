import React, { useState } from 'react';
import { Modal, Input, Button, Typography, message, Space, Tag, Descriptions } from 'antd';
import { LockOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

export interface Signature {
  user: string;
  role: string;
  timestamp: string;
  ip: string;
  type: '编制' | '审核' | '批准' | '见证';
}

interface SignaturePadProps {
  visible: boolean;
  onClose: () => void;
  onSign: (signature: Signature) => void;
  type: Signature['type'];
  userName?: string;
  userRole?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ visible, onClose, onSign, type, userName = '当前用户', userRole = '检测员' }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSign = () => {
    if (!password) { message.warning('请输入密码'); return; }
    if (password.length < 3) { message.error('密码错误'); return; }
    setLoading(true);
    setTimeout(() => {
      const sig: Signature = {
        user: userName,
        role: userRole,
        timestamp: new Date().toLocaleString('zh-CN'),
        ip: '192.168.1.' + Math.floor(Math.random() * 255),
        type,
      };
      message.success(`${type}签名成功`);
      onSign(sig);
      setPassword('');
      setLoading(false);
      onClose();
    }, 800);
  };

  return (
    <Modal title={<span><LockOutlined /> 电子签名 — {type}</span>} open={visible} onCancel={() => { setPassword(''); onClose(); }} footer={null} width={400}>
      <div style={{ padding: '16px 0' }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="操作类型">{type}</Descriptions.Item>
          <Descriptions.Item label="签名人">{userName}</Descriptions.Item>
          <Descriptions.Item label="角色">{userRole}</Descriptions.Item>
        </Descriptions>
        <div style={{ marginTop: 16 }}>
          <Text strong>密码验证</Text>
          <Input.Password
            placeholder="请输入签名密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onPressEnter={handleSign}
            prefix={<LockOutlined />}
            style={{ marginTop: 4 }}
          />
          <Text type="secondary" style={{ display: 'block', fontSize: 12, marginTop: 4 }}>
            签名后将记录时间戳和IP地址，不可撤销
          </Text>
        </div>
        <Space style={{ marginTop: 16, width: '100%', justifyContent: 'flex-end' }}>
          <Button onClick={() => { setPassword(''); onClose(); }}>取消</Button>
          <Button type="primary" icon={<CheckCircleOutlined />} loading={loading} onClick={handleSign}>确认签名</Button>
        </Space>
        <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <ClockCircleOutlined /> 签名后数据将被锁定，修改需申请撤销
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export const SignatureDisplay: React.FC<{ signature: Signature }> = ({ signature }) => (
  <div style={{ padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fafafa', display: 'inline-block' }}>
    <Space direction="vertical" size={2}>
      <Space><Tag color="blue">{signature.type}</Tag><Text strong>{signature.user}</Text><Text type="secondary">({signature.role})</Text></Space>
      <Text type="secondary" style={{ fontSize: 12 }}>{signature.timestamp} | IP: {signature.ip}</Text>
    </Space>
  </div>
);
