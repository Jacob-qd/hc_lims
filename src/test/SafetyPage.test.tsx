import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { SafetyPage } from '../pages/SafetyPage';

describe('SafetyPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/research/chemicals')) {
        return { ok: true, json: async () => ({ code: 200, data: { list: [
          { id: 'ch1', name: '浓硫酸 (98%)', cas: '7664-93-9', category: '腐蚀品', stock: '5L', location: '危化品柜A1', responsible: '张明', msds: '有', status: 'normal' },
        ]}}) } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });
  afterEach(() => { fetchSpy.mockRestore(); });

  it('渲染安全与废弃物页面', async () => {
    render(<BrowserRouter><ConfigProvider><SafetyPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('安全与废弃物管理')).toBeInTheDocument());
  });
});
