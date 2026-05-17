import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { PersonnelPage } from '../pages/PersonnelPage';

function mockFetchResponse(data: LooseAny) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('PersonnelPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/personnel') && !url.includes('/training') && !url.includes('/certificates')) {
        return mockFetchResponse({ code: 200, data: { list: [
          { id: 'p1', name: '张三', empNo: 'EMP001', dept: '环境实验室', position: '检测员', role: '检测员', lab: 'A101', joinDate: '2023-01-01', certStatus: 'active' },
        ]}});
      }
      if (url.includes('/api/v1/personnel/training')) {
        return mockFetchResponse({ code: 200, data: { list: [
          { id: 't1', name: '安全培训', target: '全员', dept: '全部', planDate: '2025-01-01', actualDate: '2025-01-02', participants: 10, passRate: 95, status: 'completed' },
        ]}});
      }
      if (url.includes('/api/v1/personnel/certificates')) {
        return mockFetchResponse({ code: 200, data: { list: [
          { id: 'c1', no: 'CERT-001', holder: '张三', type: '上岗证', issuer: 'CMA', expiryDate: '2026-01-01', status: 'active' },
        ]}});
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads personnel data', async () => {
    render(<BrowserRouter><ConfigProvider><PersonnelPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('张三')).toBeInTheDocument());
    expect(screen.getByText('EMP001')).toBeInTheDocument();
  });

  it('opens detail drawer', async () => {
    render(<BrowserRouter><ConfigProvider><PersonnelPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('张三')).toBeInTheDocument());
    fireEvent.click(screen.getByText('张三'));
    await waitFor(() => expect(document.body.textContent).toContain('资质证书'));
  });
});
