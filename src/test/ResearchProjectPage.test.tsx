import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ResearchProjectPage } from '../pages/ResearchProjectPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('ResearchProjectPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/research/projects')) {
        return mockFetchResponse({ code: 200, data: { list: [
          { id: 'r1', no: 'PROJ-001', name: '水质检测新方法研究', type: '纵向', pi: '王教授', group: '环境分析组', source: '国家自然基金', dept: '环境学院', budget: 500000, used: 100000, startDate: '2024-01', endDate: '2026-12', progress: 45, status: 'active', members: ['张三', '李四'] },
        ]}});
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads projects', async () => {
    render(<BrowserRouter><ConfigProvider><ResearchProjectPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('水质检测新方法研究'));
    expect(document.body.textContent).toContain('王教授');
  });

  it('opens detail drawer', async () => {
    render(<BrowserRouter><ConfigProvider><ResearchProjectPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('水质检测新方法研究'));
    const detailBtns = document.body.querySelectorAll('.ant-btn-link');
    if (detailBtns.length > 0) fireEvent.click(detailBtns[0]);
    await waitFor(() => expect(document.body.textContent).toContain('基本信息'));
  });

  it('opens create modal', async () => {
    render(<BrowserRouter><ConfigProvider><ResearchProjectPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('水质检测新方法研究'));
    // Click the create button
    const headerRow = document.querySelector('.ant-row-space-between');
    const buttons = headerRow ? headerRow.querySelectorAll('button') : document.querySelectorAll('button');
    const createBtn = Array.from(buttons).find(b => b.textContent && b.textContent.includes('新建'));
    if (createBtn) {
      fireEvent.mouseDown(createBtn);
      fireEvent.mouseUp(createBtn);
      fireEvent.click(createBtn);
    }
    await waitFor(() => expect(document.body.textContent).toContain('项目名称'));
  });
});
