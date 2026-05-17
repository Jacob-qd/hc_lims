import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { SafetyPage } from '../pages/SafetyPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('SafetyPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/research/chemicals')) {
        return mockFetchResponse({ code: 200, data: { list: [
          { id: 'ch1', name: '硫酸', cas: '7664-93-9', storage: 'A101', quantity: '500mL', status: 'normal', danger: '腐蚀', expireDate: '2026-01-01', keeper: '张三' },
          { id: 'ch2', name: '丙酮', cas: '67-64-1', storage: 'A102', quantity: '200mL', status: 'warning', danger: '易燃', expireDate: '2025-06-01', keeper: '李四' },
        ]}});
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads chemicals', async () => {
    render(<BrowserRouter><ConfigProvider><SafetyPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('硫酸')).toBeInTheDocument());
    expect(screen.getByText('丙酮')).toBeInTheDocument();
  });

  it('switches to waste tab', async () => {
    render(<BrowserRouter><ConfigProvider><SafetyPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('硫酸')).toBeInTheDocument());
    const tabs = document.querySelectorAll('.ant-tabs-tab');
    const wasteTab = Array.from(tabs).find(t => t.textContent && t.textContent.includes('废弃物'));
    if (wasteTab) fireEvent.click(wasteTab);
  });
});
