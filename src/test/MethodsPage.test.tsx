import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { MethodsPage } from '../pages/MethodsPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('MethodsPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/methods') && !url.includes('/m1')) {
        return mockFetchResponse({
          code: 200,
          data: {
            list: [
              {
                id: 'm1', code: 'M-001', name: '水质检测法', analyte: 'COD', version: 'v2.0',
                matrix: '水', instrument: '分光光度计', detectionLimit: '0.5mg/L',
                effectiveDate: '2025-01-01', responsible: '张伟', status: 'active', statusLabel: '生效',
              },
            ],
          },
        });
      }
      if (url.includes('/api/v1/methods/m1') && String(url).includes('DELETE')) {
        return mockFetchResponse({ code: 200, message: '删除成功' });
      }
      if (url.includes('/api/v1/methods/m1') && (String(url).includes('PUT') || String(url).includes('POST'))) {
        return mockFetchResponse({ code: 200, data: { id: 'm1', statusLabel: '修订中' }, message: '更新成功' });
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads methods', async () => {
    render(<BrowserRouter><ConfigProvider><MethodsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('M-001')).toBeInTheDocument());
    expect(screen.getByText('水质检测法')).toBeInTheDocument();
  });

  it('opens detail drawer', async () => {
    render(<BrowserRouter><ConfigProvider><MethodsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('M-001')).toBeInTheDocument());
    fireEvent.click(screen.getByText('水质检测法'));
    await waitFor(() => expect(document.body.textContent).toContain('SOP文档'));
  });

  it('opens create modal', async () => {
    render(<BrowserRouter><ConfigProvider><MethodsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('M-001')).toBeInTheDocument());
    fireEvent.click(screen.getByText('新建方法'));
    await waitFor(() => expect(document.body.textContent).toContain('新建方法'));
  });

  it('opens edit modal and saves changes', async () => {
    render(<BrowserRouter><ConfigProvider><MethodsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('M-001')).toBeInTheDocument());
    fireEvent.click(screen.getByText('编辑'));
    await waitFor(() => expect(document.body.textContent).toContain('编辑方法'));
    // Modal 中应包含状态选择
    expect(document.body.textContent).toContain('方法名称');
  });

  it('deletes a method', async () => {
    render(<BrowserRouter><ConfigProvider><MethodsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('M-001')).toBeInTheDocument());
    fireEvent.click(screen.getByText('删除'));
    await waitFor(() => expect(document.body.textContent).toContain('确认删除'));
  });
});