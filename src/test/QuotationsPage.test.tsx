/**
 * 报价管理测试
 * US-BM-05: "作为商务人员，我可以在报价单中选择检测项目和收费标准"
 * US-BM-06: "作为客户，我可以通过报价单确认并生成合同"
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QuotationsPage } from '../pages/QuotationsPage';

function mockFetchResponse(data: LooseAny) {
  return { ok: true, status: 200, json: async () => ({ code: 200, data }) } as Response;
}

describe('QuotationsPage - 报价管理', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/quotations')) return mockFetchResponse({ list: [] });
      if (url.includes('/clients')) return mockFetchResponse({ list: [{ id: 'c1', name: '测试客户' }] });
      return mockFetchResponse({});
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('US-BM-05: 显示报价管理标题', async () => {
    render(<BrowserRouter><ConfigProvider><QuotationsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('报价管理')).toBeInTheDocument());
  });

  it('US-BM-05: 存在"新建报价"按钮', async () => {
    render(<BrowserRouter><ConfigProvider><QuotationsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('新建报价')).toBeInTheDocument());
  });

  it('US-BM-05: 点击新建报价打开 Modal', async () => {
    render(<BrowserRouter><ConfigProvider><QuotationsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('新建报价')).toBeInTheDocument());
    fireEvent.click(screen.getByText('新建报价'));
    await waitFor(() => expect(document.body.textContent).toContain('检测项目'));
  });
});
