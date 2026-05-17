import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AchievementPage } from '../pages/AchievementPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('AchievementPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/research/publications')) {
        return mockFetchResponse({ code: 200, data: { list: [
          { id: 'a1', title: '水质检测新方法研究', type: '论文', journal: '环境科学', authors: '张三, 李四', year: 2025, doi: '10.1234/env.2025.001', project: '国家自然基金', status: 'published' },
        ]}});
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads achievements', async () => {
    render(<BrowserRouter><ConfigProvider><AchievementPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('水质检测新方法研究')).toBeInTheDocument());
    expect(screen.getByText('张三, 李四')).toBeInTheDocument();
  });

  it('opens detail drawer by clicking title', async () => {
    render(<BrowserRouter><ConfigProvider><AchievementPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('水质检测新方法研究')).toBeInTheDocument());
    fireEvent.click(screen.getByText('水质检测新方法研究'));
    await waitFor(() => expect(document.body.textContent).toContain('关联实验数据'));
  });

  it('opens create modal', async () => {
    render(<BrowserRouter><ConfigProvider><AchievementPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('水质检测新方法研究')).toBeInTheDocument());
    fireEvent.click(screen.getByText('新增成果'));
    await waitFor(() => expect(document.body.textContent).toContain('新增成果'));
  });
});
