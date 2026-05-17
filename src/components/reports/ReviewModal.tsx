import React, { useState, useEffect } from 'react';
import {
  Modal, Divider, List, Checkbox, Radio, Form, Input, Typography, message,
} from 'antd';
import { AuditOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { reviewChecklistDef } from '../../mocks/data';
import type { ReviewChecklistItem, Report } from '../../mocks/data';

const { Text } = Typography;
const { TextArea } = Input;

export interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { conclusion: string; opinion: string; checklist: ReviewChecklistItem[] }) => void;
  report: Report | null;
}

/** 审核确认 Modal */
export const ReviewModal: React.FC<ReviewModalProps> = ({ open, onClose, onSubmit, report }) => {
  const [conclusion, setConclusion] = useState<string>('pass');
  const [opinion, setOpinion] = useState('');
  const [checklist, setChecklist] = useState<ReviewChecklistItem[]>(
    reviewChecklistDef.map(c => ({ ...c }))
  );

  useEffect(() => {
    if (open) {
      setConclusion('pass');
      setOpinion('');
      setChecklist(reviewChecklistDef.map(c => ({ ...c })));
    }
  }, [open]);

  const handleSubmit = () => {
    const unchecked = checklist.filter(c => !c.passed);
    if (unchecked.length > 0) {
      message.warning(`尚有 ${unchecked.length} 项审核要点未通过`);
      return;
    }
    if (!opinion.trim()) { message.warning('请输入审核意见'); return; }
    onSubmit({ conclusion, opinion, checklist });
    onClose();
  };

  return (
    <Modal
      title={<span><AuditOutlined /> 审核确认</span>}
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      width={640}
      okText="确认审核"
      okButtonProps={{ icon: <CheckCircleOutlined /> }}
    >
      {report && (
        <div style={{ marginBottom: 16 }}>
          <Text strong>{report.reportNo}</Text> - <Text>{report.title}</Text>
        </div>
      )}
      <Divider>审核要点检查清单</Divider>
      <List
        dataSource={checklist}
        renderItem={(item, index) => (
          <List.Item>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
              <Checkbox
                checked={item.passed}
                onChange={e => {
                  const next = [...checklist];
                  next[index] = { ...next[index], passed: e.target.checked };
                  setChecklist(next);
                }}
              />
              <Text delete={item.passed} style={{ textDecoration: item.passed ? 'line-through' : 'none', flex: 1 }}>
                {index + 1}. {item.label}
              </Text>
            </div>
          </List.Item>
        )}
      />
      <Divider>审核结论</Divider>
      <Radio.Group value={conclusion} onChange={e => setConclusion(e.target.value)} style={{ marginBottom: 16 }}>
        <Radio.Button value="pass" style={{ borderColor: '#52c41a', color: conclusion === 'pass' ? '#52c41a' : undefined }}>
          <CheckCircleOutlined /> 通过
        </Radio.Button>
        <Radio.Button value="fail" style={{ borderColor: '#f5222d', color: conclusion === 'fail' ? '#f5222d' : undefined }}>
          <CloseCircleOutlined /> 不通过
        </Radio.Button>
      </Radio.Group>
      <Form.Item label="审核意见" required>
        <TextArea
          placeholder="请输入审核意见..."
          rows={4}
          value={opinion}
          onChange={e => setOpinion(e.target.value)}
        />
      </Form.Item>
    </Modal>
  );
};
