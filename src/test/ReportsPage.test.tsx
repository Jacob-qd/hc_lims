import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ReportsPage } from '../pages/ReportsPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('ReportsPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/reports')) return mockFetchResponse({ code: 200, data: { list: [{ id: 'r1', reportNo: 'RPT-001', title: '水质报告', customerName: '绿源环保', sampleNos: ['SMP001'], creatorName: '张伟', status: 'draft', statusLabel: '草稿', createdAt: '2025-01-01', updatedAt: '2025-01-01', issuedAt: '', signatures: [], annotations: [], attachments: [], changeHistory: [], testResults: [], cover: { companyName: '红创', entrustUnit: '绿源', reportTitle: '水质', sampleType: '水', samplingLocation: '东湖', samplingDate: '2025-01-01', testDate: '2025-01-02', issueDate: '', pageCount: 5 }, projectName: '监测', sampleTypeLabel: '水', samplingLocation: '东湖' }], total: 1 } });
      if (url.includes('/api/v1/reports/stats')) return mockFetchResponse({ code: 200, data: { draft: 1, pendingTechReview: 0, pendingApproval: 0, issued: 0, total: 1 } });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads reports', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    expect(screen.getByText('水质报告')).toBeInTheDocument();
  });

  it('clicks new report button', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('新建报告')[0]);
  });

  it('opens detail drawer', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('详情')[0]);
    await waitFor(() => expect(screen.getByText('报告信息')).toBeInTheDocument());
  });
});
