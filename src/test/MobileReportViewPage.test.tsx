import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileReportViewPage } from '../pages/MobileReportViewPage';

describe('MobileReportViewPage', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/api/v1/mobile/reports')) {
        return new Response(JSON.stringify({
          code: 200, data: { list: [
            { id: 'rpt1', reportNo: 'RPT20240521001', title: '地表水检测报告', sampleName: '地表水样品-1', issueDate: '2024-05-21', status: 'official', statusLabel: '正式报告', signed: false, customerName: '绿源环保', testItems: 'pH值、化学需氧量' }
          ] }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.includes('/api/v1/mobile/reports/')) {
        return new Response(JSON.stringify({ code: 200, data: {}, message: '签名确认成功' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders report list', async () => {
    render(<BrowserRouter><MobileReportViewPage /></BrowserRouter>);
    expect(await screen.findByText('报告查看')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('RPT20240521001')).toBeInTheDocument();
    });
  });

  it('opens report detail', async () => {
    render(<BrowserRouter><MobileReportViewPage /></BrowserRouter>);
    await screen.findByText('报告查看');
    await waitFor(() => {
      expect(screen.getByText('RPT20240521001')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('RPT20240521001'));
    await waitFor(() => {
      expect(screen.getByText('报告详情')).toBeInTheDocument();
    });
  });
});
