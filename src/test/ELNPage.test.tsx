import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ELNPage } from '../pages/ELNPage';

describe('ELNPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/research/eln-entries')) {
        return { ok: true, json: async () => ({ code: 200, data: { list: [
          { id: 'eln1', templateId: 't1', templateName: '水质检测原始记录', title: '土壤pH测定实验', authorName: '张伟', projectName: '地表水VOCs监测', fields: [], content: '', signatures: [], version: 1, status: 'signed', createdAt: '2024-05-21 08:30', updatedAt: '2024-05-21 16:00' },
        ]}}) } as Response;
      }
      if (u.includes('/eln/templates')) {
        return { ok: true, json: async () => ({ code: 200, data: { list: [
          { id: 't1', name: '水质检测原始记录', category: '环境检测', fields: [{ id: 'f1', label: '样品编号', type: 'text', required: true }] },
        ]}}) } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });
  afterEach(() => { fetchSpy.mockRestore(); });

  it('渲染ELN页面', async () => {
    render(<BrowserRouter><ConfigProvider><ELNPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('电子实验记录本 (ELN)')).toBeInTheDocument());
  });
});
