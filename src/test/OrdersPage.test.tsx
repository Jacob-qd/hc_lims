/**
 * 委托单管理测试
 * US-BM-09: "作为商务人员，我可以在系统中录入客户委托单"
 * US-BM-10: "作为检测员，我可以在移动端查看客户委托信息"
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { OrdersPage } from '../pages/OrdersPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => ({ code: 200, data }) } as Response;
}

describe('OrdersPage - 委托单管理', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/orders')) return mockFetchResponse({ list: [] });
      if (url.includes('/clients')) return mockFetchResponse({ list: [{ id: 'c1', name: '测试客户' }] });
      return mockFetchResponse({});
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('US-BM-09: 显示委托单管理标题', async () => {
    render(<BrowserRouter><ConfigProvider><OrdersPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('委托单管理'), { timeout: 10000 });
  }, 15000);

  it('US-BM-09: 存在"新建委托单"按钮', async () => {
    render(<BrowserRouter><ConfigProvider><OrdersPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('新建委托单'), { timeout: 10000 });
  }, 15000);

  it('US-BM-09: 点击新建委托单打开 Modal', async () => {
    render(<BrowserRouter><ConfigProvider><OrdersPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('新建委托单'), { timeout: 10000 });
    fireEvent.click(screen.getByText('新建委托单'));
    await waitFor(() => expect(document.body.textContent).toContain('项目名称'));
  }, 15000);
});
