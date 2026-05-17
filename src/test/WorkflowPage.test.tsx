import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { WorkflowPage } from '../pages/WorkflowPage';

function mockFetchResponse(data: LooseAny) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

const mockDef = {
  id: 'wf1', name: '检测流程', type: '检测', description: '样品检测',
  nodes: [
    { id: 'n1', type: 'start', name: '开始', x: 100, y: 80, config: {} },
    { id: 'n2', type: 'approval', name: '审批', x: 300, y: 80, config: { approverType: 'role', approverRole: 'lab_manager' } },
    { id: 'n3', type: 'end', name: '结束', x: 500, y: 80, config: {} },
  ],
  edges: [{ id: 'e1', source: 'n1', target: 'n2' }, { id: 'e2', source: 'n2', target: 'n3' }],
  status: 'draft', version: 1, usedCount: 0, createdBy: '张伟', createdAt: '2025-01-01', updatedAt: '2025-01-01'
};

const mockInstance = {
  id: 'wi1', defId: 'wf1', defName: '检测流程', defVersion: 1,
  businessType: 'sample', businessId: 's1', businessSummary: '地表水检测',
  status: 'running', currentNodes: ['n2'], currentNodeNames: ['审批'], assignees: ['张伟'],
  variables: {}, startedBy: '张伟', startedAt: '2025-01-01',
  history: [
    { id: 'h1', nodeId: 'n1', nodeName: '开始', action: 'approved', operator: '张伟', comment: '自动通过', timestamp: '2025-01-01 09:00' },
    { id: 'h2', nodeId: 'n2', nodeName: '审批', action: 'urge', operator: '系统', timestamp: '2025-01-01 10:00' },
  ]
};

describe('WorkflowPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/workflow/definitions')) return mockFetchResponse({ code: 200, data: { list: [mockDef] } });
      if (url.includes('/api/v1/workflow/instances')) return mockFetchResponse({ code: 200, data: { list: [mockInstance] } });
      if (url.includes('/api/v1/workflow/instances/wi1/urge')) return mockFetchResponse({ code: 200, message: '催办成功' });
      if (url.includes('/api/v1/workflow/instances/wi1/transfer')) return mockFetchResponse({ code: 200, message: '转交成功' });
      if (url.includes('/api/v1/workflow/instances/wi1/terminate')) return mockFetchResponse({ code: 200, message: '终止成功' });
      if (url.includes('/api/v1/workflow/definitions/wf1/deploy')) return mockFetchResponse({ code: 200, message: '部署成功' });
      if (url.includes('/api/v1/workflow/definitions/wf1/undeploy')) return mockFetchResponse({ code: 200, message: '停用成功' });
      if (url.includes('/api/v1/workflow/definitions/wf1') && url.endsWith('/wf1')) return mockFetchResponse({ code: 200, message: '删除成功' });
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

  it('opens designer from edit button', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('编辑')[0]);
    await waitFor(() => expect(screen.getByText('流程设计器 - 检测流程')).toBeInTheDocument());
  });

  it('opens instance detail drawer', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('运行中实例')[1]);
    await waitFor(() => expect(screen.getByText('地表水检测')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('详情')[0]);
    await waitFor(() => expect(screen.getByText('流程实例详情')).toBeInTheDocument());
  });

  it('clicks urge on running instance', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('运行中实例')[1]);
    await waitFor(() => expect(screen.getByText('地表水检测')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('催办')[0]);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('deploys a definition', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('部署')[0]);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('opens transfer modal', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('运行中实例')[1]);
    await waitFor(() => expect(screen.getByText('地表水检测')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('转交')[0]);
    await waitFor(() => expect(screen.getByText('转交处理人')).toBeInTheDocument());
  });

  it('opens terminate modal', async () => {
    render(<BrowserRouter><ConfigProvider><WorkflowPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('检测流程')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('运行中实例')[1]);
    await waitFor(() => expect(screen.getByText('地表水检测')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('终止')[0]);
    await waitFor(() => expect(screen.getByText('终止流程')).toBeInTheDocument());
  });
});
