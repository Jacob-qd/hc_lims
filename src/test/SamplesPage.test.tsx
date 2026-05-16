import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { SamplesPage } from '../pages/SamplesPage';

const mockSamples = [
  { id: 's1', sampleNo: 'SMP20240521001', name: '地表水样品-1', type: 'surface_water', typeLabel: '地表水', customerName: '绿源环保', projectName: '地表水监测', samplingLocation: '滨湖公园', samplingTime: '2024-05-21 08:30', receivingTime: '2024-05-21 09:15', receiverName: '张伟', containerInfo: 'PE瓶 1L', storageCondition: '4℃冷藏', priority: 'normal', priorityLabel: '常规', status: 'received', statusLabel: '已接收', flowStatus: 'in_stock', flowStatusLabel: '在库', assignedLabName: '环境实验室' },
];

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('SamplesPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: string) => {
      if (url.includes('/api/v1/samples')) return mockFetchResponse({ code: 200, data: { list: mockSamples, total: mockSamples.length } });
      if (url.includes('/api/v1/test-items')) return mockFetchResponse({ code: 200, data: [] });
      if (url.includes('/api/v1/field-configs')) return mockFetchResponse({ code: 200, data: { list: [] } });
      if (url.includes('/api/v1/samples/s1/detail')) return mockFetchResponse({ code: 200, data: { testTotal: 5, tested: 2, testing: 1, completed: 2, testItems: [] } });
      if (url.includes('/api/v1/samples/s1/flow-history')) return mockFetchResponse({ code: 200, data: [] });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads samples', async () => {
    render(<BrowserRouter><ConfigProvider><SamplesPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('SMP20240521001')).toBeInTheDocument());
    expect(screen.getByText('地表水样品-1')).toBeInTheDocument();
  });

  it('opens detail drawer', async () => {
    render(<BrowserRouter><ConfigProvider><SamplesPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('SMP20240521001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('详情')[0]);
    await waitFor(() => expect(screen.getByText('样品详情')).toBeInTheDocument());
  });

  it('opens wizard modal', async () => {
    render(<BrowserRouter><ConfigProvider><SamplesPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('SMP20240521001')).toBeInTheDocument());
    fireEvent.click(screen.getByText('样品登记'));
    await waitFor(() => expect(screen.getByText('新建样品登记')).toBeInTheDocument());
  });

  it('opens import modal', async () => {
    render(<BrowserRouter><ConfigProvider><SamplesPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('SMP20240521001')).toBeInTheDocument());
    fireEvent.click(screen.getByText('批量导入'));
    await waitFor(() => expect(screen.getByText('批量导入样品')).toBeInTheDocument());
  });

  it('clicks barcode button', async () => {
    render(<BrowserRouter><ConfigProvider><SamplesPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('SMP20240521001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('条码')[0]);
  });
});
