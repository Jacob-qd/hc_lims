import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { InstrumentsPage } from '../pages/InstrumentsPage';

vi.mock('@ant-design/plots', () => ({
  Pie: () => <div data-testid="pie-chart">PieChart</div>,
}));

const mockInstruments = [
  { id: 'i1', name: 'pH计', model: 'PHS-3E', serialNo: 'SN001', manufacturer: '上海雷磁', location: '理化实验室', responsiblePerson: '张伟', purchaseDate: '2023-01-01', inUseDate: '2023-02-01', status: 'running', statusLabel: '运行中', connectionStatus: 'online', utilization: 85, calibrationDue: '2025-12-31', maintenanceDate: '2025-05-01', department: '检测一部', description: '' },
];

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('InstrumentsPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/instruments')) return mockFetchResponse({ code: 200, data: { list: mockInstruments, total: mockInstruments.length } });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads instruments', async () => {
    render(<BrowserRouter><ConfigProvider><InstrumentsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('仪器管理')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('pH计')).toBeInTheDocument());
  });

  it('opens create modal', async () => {
    render(<BrowserRouter><ConfigProvider><InstrumentsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('仪器管理')).toBeInTheDocument());
    fireEvent.click(screen.getByText('新建仪器'));
    await waitFor(() => expect(screen.getByText('新建仪器档案')).toBeInTheDocument());
  });

  it('opens detail drawer', async () => {
    render(<BrowserRouter><ConfigProvider><InstrumentsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('pH计')).toBeInTheDocument());
    fireEvent.click(screen.getByText('pH计'));
    await waitFor(() => expect(screen.getByText('pH计 - 详情')).toBeInTheDocument());
  });
});
