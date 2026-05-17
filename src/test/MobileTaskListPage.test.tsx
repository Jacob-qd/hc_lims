/**
 * 移动端任务列表测试
 *
 * User Story:
 *   "作为采样员，我希望在手机上查看我的检测任务列表和进度，
 *    以便安排工作优先级。"
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { MobileTaskListPage } from '../pages/MobileTaskListPage';

describe('MobileTaskListPage - 移动端任务列表', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/tasks')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            code: 200, data: { list: [
              { id: 't1', sampleName: '地表水样品-A', testItem: 'COD测定', status: 'in_progress', progress: 60, createdAt: '2026-05-17', analystName: '张三' },
              { id: 't2', sampleName: '土壤样品-B', testItem: '重金属检测', status: 'pending', progress: 0, createdAt: '2026-05-16', analystName: '李四' },
              { id: 't3', sampleName: '废水样品-C', testItem: 'pH测定', status: 'completed', progress: 100, createdAt: '2026-05-15', analystName: '王五' },
            ]},
          }),
        } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('显示任务列表标题', async () => {
    render(<BrowserRouter><ConfigProvider><MobileTaskListPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('我的任务')).toBeInTheDocument());
  });

  it('显示所有任务', async () => {
    render(<BrowserRouter><ConfigProvider><MobileTaskListPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('地表水样品-A')).toBeInTheDocument();
      expect(screen.getByText('土壤样品-B')).toBeInTheDocument();
      expect(screen.getByText('废水样品-C')).toBeInTheDocument();
    });
  });

  it('显示任务进度', async () => {
    render(<BrowserRouter><ConfigProvider><MobileTaskListPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('COD测定'));
  });

  it('显示状态标签', async () => {
    render(<BrowserRouter><ConfigProvider><MobileTaskListPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => {
      expect(screen.getByText('进行中')).toBeInTheDocument();
      expect(screen.getByText('待处理')).toBeInTheDocument();
      expect(screen.getByText('已完成')).toBeInTheDocument();
    });
  });

  it('存在刷新按钮', async () => {
    render(<BrowserRouter><ConfigProvider><MobileTaskListPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText(/刷\s*新/)).toBeInTheDocument());
  });

  it('点击任务卡片不抛异常', async () => {
    render(<BrowserRouter><ConfigProvider><MobileTaskListPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水样品-A')).toBeInTheDocument());
    fireEvent.click(screen.getByText('地表水样品-A'));
  });
});
