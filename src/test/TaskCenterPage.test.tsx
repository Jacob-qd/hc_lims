import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { TaskCenterPage } from '../pages/TaskCenterPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

const mockTasks = [
  {
    id: 'wi1_n2',
    instanceId: 'wi1',
    defName: '样品检测流程',
    nodeId: 'n2',
    nodeName: '样品接收',
    businessSummary: '地表水 COD 检测',
    assignee: '张伟',
    status: 'pending',
    createdAt: '2024-05-21 09:00',
    deadline: '2024-05-21 17:00',
    type: 'pending',
  },
  {
    id: 'wi1_n7',
    instanceId: 'wi1',
    defName: '样品检测流程',
    nodeId: 'n7',
    nodeName: '通知客户',
    businessSummary: '地表水 COD 检测',
    assignee: '客户',
    status: 'pending',
    createdAt: '2024-05-21 09:00',
    type: 'cc',
  },
];

describe('TaskCenterPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/workflow/tasks?type=pending')) return mockFetchResponse({ code: 200, data: { list: mockTasks.filter(t => t.type === 'pending') } });
      if (url.includes('/api/v1/workflow/tasks?type=done')) return mockFetchResponse({ code: 200, data: { list: [] } });
      if (url.includes('/api/v1/workflow/tasks?type=cc')) return mockFetchResponse({ code: 200, data: { list: mockTasks.filter(t => t.type === 'cc') } });
      if (url.includes('/api/v1/workflow/tasks/wi1_n2/approve')) return mockFetchResponse({ code: 200, message: '审批通过' });
      if (url.includes('/api/v1/workflow/tasks/wi1_n2/reject')) return mockFetchResponse({ code: 200, message: '已驳回' });
      if (url.includes('/api/v1/workflow/tasks/wi1_n2/transfer')) return mockFetchResponse({ code: 200, message: '转交成功' });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders task center', async () => {
    render(<BrowserRouter><ConfigProvider><TaskCenterPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('任务中心')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('地表水 COD 检测')).toBeInTheDocument());
  });

  it('switches tabs', async () => {
    render(<BrowserRouter><ConfigProvider><TaskCenterPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水 COD 检测')).toBeInTheDocument());
    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
  });

  it('opens approve modal', async () => {
    render(<BrowserRouter><ConfigProvider><TaskCenterPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水 COD 检测')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('通过')[0]);
    await waitFor(() => expect(screen.getByText('审批通过')).toBeInTheDocument());
  });

  it('opens reject modal', async () => {
    render(<BrowserRouter><ConfigProvider><TaskCenterPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水 COD 检测')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('驳回')[0]);
    await waitFor(() => expect(screen.getByText('驳回原因')).toBeInTheDocument());
  });

  it('opens transfer modal', async () => {
    render(<BrowserRouter><ConfigProvider><TaskCenterPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水 COD 检测')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('转交')[0]);
    await waitFor(() => expect(screen.getByText('新处理人')).toBeInTheDocument());
  });

  it('opens task detail', async () => {
    render(<BrowserRouter><ConfigProvider><TaskCenterPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('地表水 COD 检测')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('详情')[0]);
    await waitFor(() => expect(screen.getByText('任务详情')).toBeInTheDocument());
  });
});
