import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ResearchGroupPage } from '../pages/ResearchGroupPage';

describe('ResearchGroupPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/research/groups/expanded')) {
        return { ok: true, json: async () => ({ code: 200, data: { list: [
          { id: '1', name: '环境检测团队', leaderName: '张三', researchArea: '环境化学', memberCount: 5, projectCount: 3, totalBudget: 500000, spentBudget: 120000, status: 'active', createdAt: '2025-01-01' },
        ]}}) } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });
  afterEach(() => { fetchSpy.mockRestore(); });

  it('渲染科研团队页面', async () => {
    render(<BrowserRouter><ConfigProvider><ResearchGroupPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('科研团队管理')).toBeInTheDocument());
  });
});
