import React from 'react';
import { Typography } from 'antd';

const { Text } = Typography;

interface WatermarkProps {
  reportNo: string;
  signerName: string;
  signedAt: string;
  status: 'draft' | 'issued' | 'reviewed' | 'approved';
}

/**
 * Report watermark overlay component.
 * Shows different watermarks based on report status:
 * - draft: "草稿" watermark
 * - issued: official seal-style watermark with report info
 */
export const ReportWatermark: React.FC<WatermarkProps> = ({ reportNo, signerName, signedAt, status }) => {
  if (status === 'draft') {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 10, overflow: 'hidden',
      }}>
        <Text style={{
          fontSize: 120, color: 'rgba(0,0,0,0.06)', fontWeight: 700,
          transform: 'rotate(-30deg)', userSelect: 'none',
        }}>
          草 稿
        </Text>
      </div>
    );
  }

  if (status === 'issued') {
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: 'none', zIndex: 10, overflow: 'hidden',
      }}>
        {/* Diagonal repeating watermark */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Text key={i} style={{
            position: 'absolute',
            top: `${(i * 120) % 800}px`,
            left: `${(i * 200) % 1000}px`,
            fontSize: 14,
            color: 'rgba(0,102,204,0.08)',
            transform: 'rotate(-25deg)',
            userSelect: 'none',
            whiteSpace: 'nowrap',
          }}>
            已签发 · {reportNo} · {signedAt}
          </Text>
        ))}
        {/* Bottom seal area */}
        <div style={{
          position: 'absolute', bottom: 60, right: 80,
          textAlign: 'center',
        }}>
          <div style={{
            width: 100, height: 100, borderRadius: '50%',
            border: '3px solid rgba(255,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: 'rotate(-15deg)',
          }}>
            <div style={{ textAlign: 'center', lineHeight: 1.2 }}>
              <Text style={{ fontSize: 14, color: 'rgba(255,0,0,0.3)', fontWeight: 700, display: 'block' }}>红创检测</Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,0,0,0.25)', display: 'block' }}>检测专用章</Text>
            </div>
          </div>
          <Text style={{ fontSize: 10, color: 'rgba(0,0,0,0.15)', display: 'block', marginTop: 4 }}>
            签发人: {signerName}
          </Text>
        </div>
      </div>
    );
  }

  return null;
};

/**
 * Anti-counterfeiting QR code component for report verification.
 * Generates a verification link that can be embedded as a QR code.
 */
export const ReportVerificationQR: React.FC<{ reportId: string; reportNo: string }> = ({ reportId, reportNo }) => {
  const verifyUrl = `https://lims.hongchuang.com/verify/${reportId}`;

  return (
    <div style={{
      position: 'absolute', bottom: 20, left: 20,
      padding: '8px 12px', background: '#fff',
      border: '1px solid #e8e8e8', borderRadius: 4,
      fontSize: 11, color: '#999',
    }}>
      <div style={{ marginBottom: 4, fontWeight: 500 }}>验真二维码</div>
      <div style={{
        width: 64, height: 64, background: '#f5f5f5',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1px solid #d9d9d9',
      }}>
        <Text style={{ fontSize: 8, color: '#bbb', textAlign: 'center' }}>
          QR<br/>{reportNo.slice(-6)}
        </Text>
      </div>
      <Text style={{ fontSize: 9, color: '#bbb', display: 'block', marginTop: 2 }} copyable={{ text: verifyUrl }}>
        扫码验证
      </Text>
    </div>
  );
};

/**
 * Report anti-tampering indicator.
 * Shows a green checkmark if verified, or a red warning if tampered.
 */
export const TamperIndicator: React.FC<{ verified: boolean; tampered: boolean }> = ({ verified, tampered }) => {
  if (tampered) {
    return (
      <div style={{
        padding: '8px 16px', background: '#fff2f0', border: '1px solid #ffccc7',
        borderRadius: 4, marginBottom: 8,
      }}>
        <Text type="danger" strong>⚠️ 签名已失效 — 报告内容已被篡改</Text>
      </div>
    );
  }
  if (verified) {
    return (
      <div style={{
        padding: '8px 16px', background: '#f6ffed', border: '1px solid #b7eb8f',
        borderRadius: 4, marginBottom: 8,
      }}>
        <Text type="success" strong>✅ 签名验证通过 — 报告内容完整</Text>
      </div>
    );
  }
  return null;
};
