/**
 * 移动端报告查看测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { MobileReportViewPage } from '../pages/MobileReportViewPage';

function mockFetch(data: any, code = 200) {
  return { ok: true, status: 200, json: async () => ({ code, data, message: 'success' }) } as Response;
}

describe('MobileReportViewPage - 报告查看', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/reports') && !url.includes('/mobile/')) {
        return mockFetch({
          list: [
            { id: 'r1', reportNo: 'RPT-2024-001', title: '地表水检测报告', customerName: '绿源环保', status: 'issued', statusLabel: '已签发', issueDate: '2024-05-21' },
          ],
          total: 1,
        });
      }
      if (url.includes('/mobile/reports/')) {
        return mockFetch({
          id: 'r1', reportNo: 'RPT-2024-001', title: '地表水检测报告', customerName: '绿源环保', status: 'pending_approval', statusLabel: '待批准签发', issueDate: '2024-05-21',
        });
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('显示报告查看标题', async () => {
    render(<BrowserRouter><ConfigProvider><MobileReportViewPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('报告查看')).toBeInTheDocument());
  });

  it('加载并显示报告列表', async () => {
    render(<BrowserRouter><ConfigProvider><MobileReportViewPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水检测报告')).toBeInTheDocument());
    expect(screen.getByText('RPT-2024-001')).toBeInTheDocument();
  });

  it('点击报告查看详情', async () => {
    render(<BrowserRouter><ConfigProvider><MobileReportViewPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水检测报告')).toBeInTheDocument());
    fireEvent.click(screen.getByText('查看'));
    await waitFor(() => expect(screen.getByText('报告详情')).toBeInTheDocument());
  });
});
