import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { CertificatePage } from '../pages/CertificatePage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('CertificatePage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/certificates') && !url.includes('/revoke')) {
        return mockFetchResponse({
          code: 200,
          data: {
            list: [
              {
                id: 'c1', userName: '张三', certSubject: 'CN=张三', serialNumber: 'SM2-001',
                algorithm: 'SM2', keyLength: 256, notBefore: '2025-01-01', notAfter: '2026-01-01',
                status: 'active', createdAt: '2025-01-01', certIssuer: '红创CA',
              },
            ],
          },
        });
      }
      if (url.includes('/api/v1/certificates/c1/revoke')) {
        return mockFetchResponse({ code: 200, data: { success: true } });
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads certificates', async () => {
    render(<BrowserRouter><ConfigProvider><CertificatePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('张三')).toBeInTheDocument());
    expect(screen.getByText('SM2-001')).toBeInTheDocument();
  });

  it('opens detail modal', async () => {
    render(<BrowserRouter><ConfigProvider><CertificatePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('张三')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('详情')[0]);
    await waitFor(() => expect(document.body.textContent).toContain('证书详情'));
  });

  it('opens import modal', async () => {
    render(<BrowserRouter><ConfigProvider><CertificatePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('张三')).toBeInTheDocument());
    fireEvent.click(screen.getByText('导入证书'));
    await waitFor(() => expect(document.body.textContent).toContain('导入 SM2 国密证书'));
  });
});
