import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { InventoryPage } from '../pages/InventoryPage';

function mockFetchResponse(data: LooseAny) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('InventoryPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/inventory') && url.includes('purchase')) {
        return mockFetchResponse({ code: 200, data: { list: [] }});
      }
      if (url.includes('/api/v1/inventory')) {
        return mockFetchResponse({ code: 200, data: { list: [
          { id: 'i1', code: 'INV-001', name: '甲醇标准液', category: '标准品', quantity: 5, unit: '瓶', minQuantity: 3, supplier: '国药', status: 'normal', expireDate: '2026-01-01', location: 'A1-01' },
        ]}});
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads inventory', async () => {
    render(<BrowserRouter><ConfigProvider><InventoryPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('INV-001')).toBeInTheDocument());
    expect(screen.getByText('甲醇标准液')).toBeInTheDocument();
  });

  it('opens detail drawer by clicking name', async () => {
    render(<BrowserRouter><ConfigProvider><InventoryPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('甲醇标准液')).toBeInTheDocument());
    fireEvent.click(screen.getByText('甲醇标准液'));
  });
});
