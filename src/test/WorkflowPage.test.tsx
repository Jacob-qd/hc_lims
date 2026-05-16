import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { WorkflowPage } from '../pages/WorkflowPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('WorkflowPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/workflow/definitions')) return mockFetchResponse({ code: 200, data: { list: [{ id: 'wf1', name: '检测流程', type: '检测', description: '样品检测', nodes: [], edges: [], status: 'draft', version: 1, usedCount: 0, createdBy: '张伟', createdAt: '2025-01-01', updatedAt: '2025-01-01' }] } });
      if (url.includes('/api/v1/workflow/instances')) return mockFetchResponse({ code: 200, data: { list: [{ id: 'wi1', defId: 'wf1', defName: '检测流程', defVersion: 1, businessType: 'sample', businessId: 's1', businessSummary: '地表水检测', status: 'running', currentNodes: ['n1'], currentNodeNames: ['审批'], assignees: ['张伟'], variables: {}, startedBy: '张伟', startedAt: '2025-01-01', history: [] }] } });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads workflow data', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('工作流引擎')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
  });

  it('switches to instances tab', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('运行中实例')[1]);
    await waitFor(() => expect(screen.getByText('地表水检测')).toBeInTheDocument());
  });

  it('opens create modal', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
    fireEvent.click(screen.getByText('新建流程'));
    await waitFor(() => expect(screen.getByText('新建流程模板')).toBeInTheDocument());
  });
});
