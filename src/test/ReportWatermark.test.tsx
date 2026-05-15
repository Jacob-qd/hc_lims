import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ReportWatermark, ReportVerificationQR, TamperIndicator } from '../components/ReportWatermark';

function renderWithProviders(ui: React.ReactNode) {
  return render(<BrowserRouter><ConfigProvider>{ui}</ConfigProvider></BrowserRouter>);
}

describe('ReportWatermark', () => {
  it('renders draft watermark', () => {
    const { container } = renderWithProviders(
      <div style={{ position: 'relative', width: 600, height: 400 }}>
        <ReportWatermark reportNo="RPT-001" signerName="张伟" signedAt="2024-05-15" status="draft" />
      </div>
    );
    expect(screen.getByText('草 稿')).toBeInTheDocument();
  });

  it('renders issued watermark with report info', () => {
    const { container } = renderWithProviders(
      <div style={{ position: 'relative', width: 600, height: 400 }}>
        <ReportWatermark reportNo="RPT-001" signerName="张伟" signedAt="2024-05-15" status="issued" />
      </div>
    );
    // Should have seal area
    expect(screen.getByText('红创检测')).toBeInTheDocument();
    expect(screen.getByText('检测专用章')).toBeInTheDocument();
    expect(screen.getByText('签发人: 张伟')).toBeInTheDocument();
  });

  it('renders nothing for reviewed status', () => {
    const { container } = renderWithProviders(
      <div style={{ position: 'relative', width: 600, height: 400 }}>
        <ReportWatermark reportNo="RPT-001" signerName="张伟" signedAt="2024-05-15" status="reviewed" />
      </div>
    );
    expect(screen.queryByText('草 稿')).not.toBeInTheDocument();
    expect(screen.queryByText('红创检测')).not.toBeInTheDocument();
  });
});

describe('ReportVerificationQR', () => {
  it('renders verification QR area', () => {
    renderWithProviders(
      <div style={{ position: 'relative', width: 400, height: 300 }}>
        <ReportVerificationQR reportId="rpt-123" reportNo="RPT-2024-001" />
      </div>
    );
    expect(screen.getByText('验真二维码')).toBeInTheDocument();
    expect(screen.getByText('扫码验证')).toBeInTheDocument();
  });
});

describe('TamperIndicator', () => {
  it('renders verified indicator', () => {
    renderWithProviders(<TamperIndicator verified={true} tampered={false} />);
    expect(screen.getByText(/签名验证通过/)).toBeInTheDocument();
  });

  it('renders tampered warning', () => {
    renderWithProviders(<TamperIndicator verified={false} tampered={true} />);
    expect(screen.getByText(/签名已失效/)).toBeInTheDocument();
  });

  it('renders nothing when not verified and not tampered', () => {
    const { container } = renderWithProviders(<TamperIndicator verified={false} tampered={false} />);
    expect(container.firstChild).toBeNull();
  });
});
