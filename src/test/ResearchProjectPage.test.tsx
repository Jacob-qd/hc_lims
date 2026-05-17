import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ResearchProjectPage } from '../pages/ResearchProjectPage';

describe('ResearchProjectPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/research/projects')) {
        return { ok: true, json: async () => ({ code: 200, data: { list: [
          { id: 'rp1', code: 'NSFC-2024-001', name: '新型二维材料研究', type: 'national', typeLabel: '国家级', leaderName: '张明', groupName: '环境分析课题组', startDate: '2024-01-01', endDate: '2027-12-31', budget: 580000, spent: 126000, status: 'running', statusLabel: '进行中', milestones: [], members: [] },
        ]}}) } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });
  afterEach(() => { fetchSpy.mockRestore(); });

  it('渲染科研项目页面', async () => {
    render(<BrowserRouter><ConfigProvider><ResearchProjectPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('科研项目管理')).toBeInTheDocument());
  });
});
