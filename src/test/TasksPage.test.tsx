import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { TasksPage } from '../pages/TasksPage';

const mockTasks = [
  { id: 'tk1', taskNo: 'TK-001', sampleId: 's1', sampleNo: 'SMP001', sampleName: '地表水-1', testItem: 'pH值', method: 'GB/T 6920', analystName: '', instrumentName: '', plannedStart: '2025-01-01', plannedEnd: '2025-01-02', priority: 'high', priorityLabel: '高', status: 'unassigned', statusLabel: '待分配', progress: 0 },
  { id: 'tk2', taskNo: 'TK-002', sampleId: 's2', sampleNo: 'SMP002', sampleName: '土壤-1', testItem: 'COD', method: 'HJ 828', analystName: '张伟', instrumentName: 'COD消解仪', plannedStart: '2025-01-01', plannedEnd: '2025-01-03', priority: 'normal', priorityLabel: '常规', status: 'pending', statusLabel: '待检测', progress: 0 },
];

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('TasksPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/tasks?')) return mockFetchResponse({ code: 200, data: { list: mockTasks, total: mockTasks.length } });
      if (url.includes('/api/v1/tasks/stats')) return mockFetchResponse({ code: 200, data: { pendingTest: 5, pendingReview: 3, pendingApprove: 2, overdue: 1 } });
      if (url.includes('/api/v1/tasks/tk1/assign')) return mockFetchResponse({ code: 200, message: '分配成功' });
      if (url.includes('/api/v1/tasks/tk2/start')) return mockFetchResponse({ code: 200, message: '开始检测' });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads tasks', async () => {
    render(<BrowserRouter><ConfigProvider><TasksPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测管理')).toBeInTheDocument());
  });

  it('switches to list tab and shows actions', async () => {
    render(<BrowserRouter><ConfigProvider><TasksPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测管理')).toBeInTheDocument());
    fireEvent.click(screen.getByText('任务列表'));
    await waitFor(() => expect(screen.getAllByText('TK-001').length).toBeGreaterThanOrEqual(1));
    expect(screen.getAllByText('分配').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('开始').length).toBeGreaterThanOrEqual(1);
  });

  it('opens assign modal', async () => {
    render(<BrowserRouter><ConfigProvider><TasksPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测管理')).toBeInTheDocument());
    fireEvent.click(screen.getByText('任务列表'));
    await waitFor(() => expect(screen.getAllByText('分配').length).toBeGreaterThanOrEqual(1));
    fireEvent.click(screen.getAllByText('分配')[0]);
    await waitFor(() => expect(screen.getByText('任务分配')).toBeInTheDocument());
  });

  it('starts a task', async () => {
    render(<BrowserRouter><ConfigProvider><TasksPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测管理')).toBeInTheDocument());
    fireEvent.click(screen.getByText('任务列表'));
    await waitFor(() => expect(screen.getAllByText('开始').length).toBeGreaterThanOrEqual(1));
    fireEvent.click(screen.getAllByText('开始')[0]);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

});
