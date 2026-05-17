import React from 'react';
import { Typography, Divider, Descriptions } from 'antd';
import { WatermarkOverlay } from './WatermarkOverlay';
import type { Report } from '../../mocks/data';

const { Title, Text } = Typography;

export interface PdfPreviewPanelProps {
  report: Report;
}

/** PDF 预览面板（简化版报告封面预览） */
export const PdfPreviewPanel: React.FC<PdfPreviewPanelProps> = ({ report }) => {
  const { cover } = report;
  const issued = report.status === 'issued';
  const issuedDate = report.signatures.find(s => s.role === 'approver')?.signedAt;
  const watermarkText = issued ? `已签发 ${issuedDate ? new Date(issuedDate).toLocaleDateString() : ''}` : '';

  return (
    <div style={{ background: '#f5f5f5', borderRadius: 8, padding: 24, minHeight: 400, position: 'relative' }}>
      {issued && <WatermarkOverlay text={watermarkText} />}
      <div
        style={{
          background: '#fff',
          maxWidth: 420,
          margin: '0 auto',
          padding: 32,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={4} style={{ margin: 0 }}>{cover.companyName}</Title>
          <Divider />
          <Title level={3} style={{ margin: '8px 0', color: '#1677ff' }}>{cover.reportTitle}</Title>
          <Text type="secondary">{report.reportNo}</Text>
        </div>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="委托单位">{cover.entrustUnit}</Descriptions.Item>
          <Descriptions.Item label="项目名称">{cover.projectName}</Descriptions.Item>
          <Descriptions.Item label="样品类型">{cover.sampleType}</Descriptions.Item>
          <Descriptions.Item label="采样地点">{cover.samplingLocation}</Descriptions.Item>
          <Descriptions.Item label="采样日期">{cover.samplingDate}</Descriptions.Item>
          <Descriptions.Item label="检测日期">{cover.testDate}</Descriptions.Item>
          <Descriptions.Item label="签发日期">{cover.issueDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="页数">{cover.pageCount} 页</Descriptions.Item>
        </Descriptions>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Text type="secondary" style={{ fontSize: 11 }}>红创检测认证有限公司</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 11 }}>检测专用章</Text>
        </div>
      </div>
    </div>
  );
};
