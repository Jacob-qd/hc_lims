/**
 * 移动端扫码签收测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { MobileScanReceiptPage } from '../pages/MobileScanReceiptPage';

function mockFetch(data: any, code = 200) {
  return { ok: true, status: 200, json: async () => ({ code, data, message: 'success' }) } as Response;
}

describe('MobileScanReceiptPage - 扫码签收', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.removeItem('mobile_scan_history');
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/mobile/samples/scan')) {
        return mockFetch({
          id: 's1', sampleNo: 'SMP20240521001', name: '地表水样品-1',
          typeLabel: '地表水', customerName: '绿源环保',
          statusLabel: '已接收', samplingLocation: '滨湖公园东侧',
          samplingTime: '2024-05-21 08:30',
        });
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('显示扫码签收标题', async () => {
    render(<BrowserRouter><ConfigProvider><MobileScanReceiptPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('扫码签收')).toBeInTheDocument());
  });

  it('显示条码输入框', async () => {
    render(<BrowserRouter><ConfigProvider><MobileScanReceiptPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByPlaceholderText('输入或扫描样品条码')).toBeInTheDocument());
  });

  it('输入条码并签收', async () => {
    render(<BrowserRouter><ConfigProvider><MobileScanReceiptPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByPlaceholderText('输入或扫描样品条码')).toBeInTheDocument());
    const input = screen.getByPlaceholderText('输入或扫描样品条码') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'SMP20240521001' } });
    fireEvent.click(screen.getByText('确认签收'));
    await waitFor(() => expect(screen.getByText('本次签收')).toBeInTheDocument());
  });

  it('显示最近签收记录', async () => {
    localStorage.setItem('mobile_scan_history', JSON.stringify([
      { id: 's1', sampleNo: 'SMP001', name: '测试样品' },
    ]));
    render(<BrowserRouter><ConfigProvider><MobileScanReceiptPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('最近签收')).toBeInTheDocument());
    expect(screen.getByText('测试样品')).toBeInTheDocument();
  });
});
