import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { QualityPage } from '../pages/QualityPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('QualityPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/quality/qc-results')) return mockFetchResponse({ code: 200, data: { list: [{ id: 'q1', batch: 'B1', analyte: 'COD', level: '严重', target: 100, measured: 102, deviation: 2, westgardRule: '通过', analyst: '张伟', instrument: 'pH计', date: '2025-01-01', status: 'normal' }] } });
      if (url.includes('/api/v1/quality/deviations')) return mockFetchResponse({ code: 200, data: { list: [{ id: 'd1', no: 'DEV-001', source: '质控', level: '中等', status: 'open', desc: '偏差描述', foundDate: '2025-01-01', rootCause: '原因', capaStatus: 'pending' }] } });
      if (url.includes('/api/v1/quality/control-chart')) return mockFetchResponse({ code: 200, data: { mean: 100, sd: 2, points: [{ value: 101, date: '2025-01-01' }, { value: 99, date: '2025-01-02' }] } });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads data', async () => {
    render(<BrowserRouter><ConfigProvider><QualityPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('质量控制')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText('Levey-Jennings 控制图')).toBeInTheDocument());
  });

  it('switches tabs', async () => {
    render(<BrowserRouter><ConfigProvider><QualityPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('质量控制')).toBeInTheDocument());
    fireEvent.click(screen.getByText('质控样品'));
    await waitFor(() => expect(screen.getByText('质控样品管理')).toBeInTheDocument());
    fireEvent.click(screen.getByText('偏差与CAPA'));
    await waitFor(() => expect(screen.getByText('偏差列表')).toBeInTheDocument());
  });

  it('opens deviation drawer', async () => {
    render(<BrowserRouter><ConfigProvider><QualityPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('质量控制')).toBeInTheDocument());
    fireEvent.click(screen.getByText('偏差与CAPA'));
    await waitFor(() => expect(screen.getAllByText('查看').length).toBeGreaterThanOrEqual(1));
    fireEvent.click(screen.getAllByText('查看')[0]);
  });
});
