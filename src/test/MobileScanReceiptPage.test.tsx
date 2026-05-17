import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileScanReceiptPage } from '../pages/MobileScanReceiptPage';

describe('MobileScanReceiptPage', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/api/v1/samples')) {
        return new Response(JSON.stringify({
          code: 200, data: { list: [
            { id: 's1', sampleNo: 'SMP20240521001', sampleName: '地表水样品-1', sampleType: '地表水', customerName: '绿源环保', status: 'pending_receive' }
          ] }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.includes('/api/v1/mobile/scan-receipts')) {
        return new Response(JSON.stringify({ code: 200, data: { list: [] } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders scan receipt page', async () => {
    render(<BrowserRouter><MobileScanReceiptPage /></BrowserRouter>);
    expect(await screen.findByText('扫码签收')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('扫描或输入样品条码')).toBeInTheDocument();
  });

  it('shows pending samples and allows scan', async () => {
    render(<BrowserRouter><MobileScanReceiptPage /></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('SMP20240521001')).toBeInTheDocument();
    });
  });

  it('switches to history view', async () => {
    render(<BrowserRouter><MobileScanReceiptPage /></BrowserRouter>);
    await screen.findByText('扫码签收');
    fireEvent.click(screen.getByText('历史'));
    await waitFor(() => {
      expect(screen.getByText(/今日签收记录/)).toBeInTheDocument();
    });
  });
});
