import React from 'react';
import { Tag, Space, Tooltip } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';

interface ALCOAStatus {
  attributable: boolean;   // 可归属 - 有操作人
  legible: boolean;         // 清晰 - 数据可读
  contemporaneous: boolean; // 同步 - 实时记录
  original: boolean;        // 原始 - 不可修改
  accurate: boolean;        // 准确 - 无错误
  complete: boolean;        // 完整 - 无遗漏
  consistent: boolean;      // 一致 - 数据同步
  enduring: boolean;        // 持久 - 永久保存
  available: boolean;       // 可用 - 可检索
}

const defaultStatus: ALCOAStatus = {
  attributable: true, legible: true, contemporaneous: true,
  original: true, accurate: true, complete: true,
  consistent: false, enduring: true, available: true,
};

export const ALCOABadge: React.FC<{ status?: Partial<ALCOAStatus> }> = ({ status }) => {
  const s = { ...defaultStatus, ...status };
  const allPassed = Object.values(s).every(Boolean);
  const passedCount = Object.values(s).filter(Boolean).length;

  return (
    <Tooltip title={
      <div>
        {Object.entries(s).map(([k, v]) => (
          <div key={k}>{v ? '✅' : '❌'} {k}: {k === 'attributable' ? '可归属' : k === 'legible' ? '清晰' : k === 'contemporaneous' ? '同步' : k === 'original' ? '原始' : k === 'accurate' ? '准确' : k === 'complete' ? '完整' : k === 'consistent' ? '一致' : k === 'enduring' ? '持久' : '可用'}</div>
        ))}
      </div>
    }>
      <Tag color={allPassed ? 'green' : passedCount >= 7 ? 'orange' : 'red'} icon={<SafetyCertificateOutlined />}>
        ALCOA+ {passedCount}/9
      </Tag>
    </Tooltip>
  );
};

export const DataIntegrityNotice: React.FC = () => (
  <div style={{ padding: '8px 12px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4, marginBottom: 16, fontSize: 12 }}>
    <Space>
      <SafetyCertificateOutlined style={{ color: '#faad14' }} />
      <span><strong>数据完整性声明</strong>: 所有检测数据遵循 ALCOA+ 原则。原始记录提交后不可修改，修改需创建修订版本并记录原因。所有操作均有审计追踪。</span>
    </Space>
  </div>
);
