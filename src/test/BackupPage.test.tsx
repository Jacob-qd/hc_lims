import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { BackupPage } from '../pages/BackupPage';

function mockFetchResponse(data: LooseAny) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('BackupPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/backups') && !url.includes('/restore') && !url.includes('/verify')) {
        return mockFetchResponse({ code: 200, data: { list: [
          { id: 'b1', name: 'backup_2025_01_01.sql', size: '120MB', type: '自动', date: '2025-01-01 03:00', status: 'completed' },
          { id: 'b2', name: 'backup_2025_01_02.sql', size: '125MB', type: '手动', date: '2025-01-02 10:00', status: 'completed' },
        ]}});
      }
      if (url.includes('/api/v1/backups') && url.includes('POST')) return mockFetchResponse({ code: 200, data: { id: 'b3' } });
      if (url.includes('/api/v1/backups/b1/restore')) return mockFetchResponse({ code: 200, data: { success: true } });
      if (url.includes('/api/v1/backups/b1/verify')) return mockFetchResponse({ code: 200, data: { valid: true } });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads backups', async () => {
    render(<BrowserRouter><ConfigProvider><BackupPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('backup_2025_01_01.sql')).toBeInTheDocument());
    expect(screen.getByText('120MB')).toBeInTheDocument();
  });

  it('clicks backup strategy modal', async () => {
    render(<BrowserRouter><ConfigProvider><BackupPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('backup_2025_01_01.sql')).toBeInTheDocument());
    fireEvent.click(screen.getByText('备份策略'));
    await waitFor(() => expect(document.body.textContent).toContain('备份策略配置'));
    fireEvent.click(screen.getByText('保存配置'));
  });

  it('clicks verify button', async () => {
    render(<BrowserRouter><ConfigProvider><BackupPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('backup_2025_01_01.sql')).toBeInTheDocument());
    const verifyBtns = screen.getAllByText('校验');
    fireEvent.click(verifyBtns[0]);
  });
});
