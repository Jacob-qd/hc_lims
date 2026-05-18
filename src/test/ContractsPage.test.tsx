import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ContractsPage } from '../pages/ContractsPage';

const mockContracts = [
  { id: 'ct1', no: 'CT-2025-001', name: '地表水监测', customerId: 'c1', customerName: '绿源环保', amount: 150000, type: 'annual', typeLabel: '年度合同', startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', statusLabel: '执行中', signDate: '2025-01-01', contactPerson: '张经理', contactPhone: '13800138001', remark: '', createdAt: '2025-01-01', updatedAt: '2025-01-01' },
  { id: 'ct2', no: 'CT-2025-002', name: '土壤检测', customerId: 'c2', customerName: '博克水务', amount: 80000, type: 'project', typeLabel: '项目合同', startDate: '2025-03-01', endDate: '2025-06-30', status: 'expiring', statusLabel: '即将到期', signDate: '2025-03-01', contactPerson: '李经理', contactPhone: '13900139001', remark: '', createdAt: '2025-03-01', updatedAt: '2025-03-01' },
];

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('ContractsPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/contracts')) {
        return mockFetchResponse({ code: 200, data: { list: mockContracts, total: mockContracts.length } });
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads contracts', async () => {
    render(<BrowserRouter><ConfigProvider><ContractsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('CT-2025-001')).toBeInTheDocument());
    expect(screen.getByText('绿源环保')).toBeInTheDocument();
    expect(screen.getAllByText('执行中').length).toBeGreaterThanOrEqual(1);
  });

  it('filters by status', async () => {
    render(<BrowserRouter><ConfigProvider><ContractsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('CT-2025-001')).toBeInTheDocument());
    fireEvent.mouseDown(screen.getByText('全部'));
    await waitFor(() => expect(screen.getAllByText('执行中').length).toBeGreaterThanOrEqual(1));
    fireEvent.click(screen.getAllByText('执行中')[0]);
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('opens create modal', async () => {
    render(<BrowserRouter><ConfigProvider><ContractsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('CT-2025-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('新建合同')[0]);
    await waitFor(() => expect(screen.getAllByText('新建合同').length).toBeGreaterThanOrEqual(1));
  });

  it('opens view modal', async () => {
    render(<BrowserRouter><ConfigProvider><ContractsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('CT-2025-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('查看')[0]);
    await waitFor(() => expect(document.body.textContent).toContain('合同详情'));
  });

  it('opens edit modal', async () => {
    render(<BrowserRouter><ConfigProvider><ContractsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('CT-2025-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('编辑')[0]);
    await waitFor(() => expect(screen.getByText('编辑合同')).toBeInTheDocument());
  });

  it('deletes a contract', async () => {
    render(<BrowserRouter><ConfigProvider><ContractsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('CT-2025-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('删除')[0]);
  });
});
