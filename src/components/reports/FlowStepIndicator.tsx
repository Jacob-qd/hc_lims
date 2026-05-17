import React from 'react';
import { Steps, Space, Tag, Typography } from 'antd';
import type { Report, ReportSignature } from '../../mocks/data';

const { Text } = Typography;

const getRoleColor = (role: string) => {
  const map: Record<string, string> = { compiler: 'blue', reviewer: 'orange', approver: 'green' };
  return map[role] || 'default';
};

/** 流程步骤指示器 */
export const FlowStepIndicator: React.FC<{ report: Report }> = ({ report }) => {
  const steps = [
    { title: '报告编制', role: 'compiler', label: '编制人' },
    { title: '技术审核', role: 'reviewer', label: '审核人' },
    { title: '批准签发', role: 'approver', label: '批准人' },
  ];

  const sigMap = new Map<string, ReportSignature>(report.signatures.map(s => [s.role, s]));

  const stepStatus = (role: string): 'finish' | 'process' | 'wait' | 'error' => {
    const sig = sigMap.get(role);
    if (sig) return 'finish';
    const idx = steps.findIndex(s => s.role === role);
    const prevDone = idx === 0 || sigMap.has(steps[idx - 1].role);
    if (prevDone) return 'process';
    return 'wait';
  };

  return (
    <Steps
      direction="vertical"
      size="small"
      current={steps.findIndex(s => stepStatus(s.role) === 'process')}
      items={steps.map(s => {
        const sig = sigMap.get(s.role);
        const status = stepStatus(s.role);
        return {
          title: (
            <Space>
              <Text strong>{s.title}</Text>
              {sig && <Tag color={getRoleColor(s.role)}>{sig.userName}</Tag>}
            </Space>
          ),
          description: sig ? (
            <div style={{ fontSize: 12 }}>
              <div>{sig.signedAt}</div>
              <div>IP: {sig.ipAddress}</div>
              <div>理由: {sig.reason}</div>
            </div>
          ) : (
            status === 'process' && <Text type="secondary" style={{ fontSize: 12 }}>待签名</Text>
          ),
          status: status,
        };
      })}
    />
  );
};
