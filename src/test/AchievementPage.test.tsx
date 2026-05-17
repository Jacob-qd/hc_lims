import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';

vi.mock('@ant-design/plots', () => ({
  Column: () => <div data-testid="column-chart">Column Chart</div>,
}));

import { AchievementPage } from '../pages/AchievementPage';

describe('AchievementPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/research/publications')) {
        return { ok: true, json: async () => ({ code: 200, data: { list: [
          { id: 'pub1', title: '新型二维材料研究', type: 'paper', typeLabel: '论文', authors: ['张明', '李华'], date: '2025-03-15', metadata: { journal: 'Nature Materials', impactFactor: 41.2 } },
        ]}}) } as Response;
      }
      if (u.includes('/achievements/statistics')) {
        return { ok: true, json: async () => ({ code: 200, data: { total: 6, paperCount: 4, patentCount: 1, awardCount: 1, completionCount: 0, totalCitations: 186 } }) } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });
  afterEach(() => { fetchSpy.mockRestore(); });

  it('渲染成果管理页面', async () => {
    render(<BrowserRouter><ConfigProvider><AchievementPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('成果管理')).toBeInTheDocument());
  });
});
