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
      if (url.includes('/api/v1/methods')) {
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
});
