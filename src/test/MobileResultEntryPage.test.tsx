/**
 * 移动端结果录入测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { MobileResultEntryPage } from '../pages/MobileResultEntryPage';

function mockFetch(data: any, code = 200) {
  return { ok: true, status: 200, json: async () => ({ code, data, message: 'success' }) } as Response;
}

describe('MobileResultEntryPage - 结果录入', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/mobile/tasks?status=testing')) {
        return mockFetch({
          list: [
            { id: 'tk2', taskNo: 'TK-2025-002', sampleName: '地表水样品-1', testItem: '化学需氧量(COD)', method: 'HJ 828-2017', status: 'testing', statusLabel: '检测中' },
          ],
          total: 1,
        });
      }
      if (url.includes('/mobile/tests/')) {
        return mockFetch({ taskId: 'tk2', resultValue: '15.2', unit: 'mg/L' });
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('显示结果录入标题', async () => {
    render(<BrowserRouter><ConfigProvider><MobileResultEntryPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('结果录入')).toBeInTheDocument());
  });

  it('加载并显示检测任务', async () => {
    render(<BrowserRouter><ConfigProvider><MobileResultEntryPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水样品-1')).toBeInTheDocument());
    expect(screen.getByText('化学需氧量(COD)')).toBeInTheDocument();
  });

  it('点击任务进入录入表单', async () => {
    render(<BrowserRouter><ConfigProvider><MobileResultEntryPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水样品-1')).toBeInTheDocument());
    fireEvent.click(screen.getByText('录入'));
    await waitFor(() => expect(screen.getByText('保存结果')).toBeInTheDocument());
  });
});
