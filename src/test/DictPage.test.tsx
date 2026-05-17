import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { DictPage } from '../pages/DictPage';

const mockTypes = [
  { id: 'dt1', code: 'sampleType', name: '样品类型', description: '样品分类', sort: 1, status: 'active' },
  { id: 'dt2', code: 'status', name: '状态', description: '状态字典', sort: 2, status: 'active' },
];

const mockItems = [
  { id: 'di1', typeId: 'dt1', typeCode: 'sampleType', code: 'water', name: '水质', sort: 1, status: 'active' },
  { id: 'di2', typeId: 'dt1', typeCode: 'sampleType', code: 'soil', name: '土壤', sort: 2, status: 'inactive' },
  { id: 'di3', typeId: 'dt2', typeCode: 'status', code: 'pending', name: '待处理', sort: 1, status: 'active' },
];

function mockFetchResponse(data: unknown) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('DictPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as unknown as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: unknown) => {
      if (url.includes('/dict-types')) {
        return mockFetchResponse({ code: 200, data: { list: mockTypes, total: mockTypes.length } });
      }
      if (url.includes('/dict-items')) {
        return mockFetchResponse({ code: 200, data: { list: mockItems, total: mockItems.length } });
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads data', async () => {
    render(<BrowserRouter><ConfigProvider><DictPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('样品类型')).toBeInTheDocument());
    expect(screen.getByText('水质')).toBeInTheDocument();
  });

  it('switches tabs', async () => {
    render(<BrowserRouter><ConfigProvider><DictPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('样品类型')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('tab', { name: '状态' }));
    await waitFor(() => expect(screen.getByText('待处理')).toBeInTheDocument());
  });

  it('opens type create modal', async () => {
    render(<BrowserRouter><ConfigProvider><DictPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('样品类型')).toBeInTheDocument());
    fireEvent.click(screen.getByText('新增类型'));
    await waitFor(() => expect(screen.getByText('新增字典类型')).toBeInTheDocument());
  });

  it('opens item edit modal', async () => {
    render(<BrowserRouter><ConfigProvider><DictPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('水质')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('编辑')[0]);
    await waitFor(() => expect(screen.getByText('编辑字典项')).toBeInTheDocument());
  });

  it('deletes an item', async () => {
    render(<BrowserRouter><ConfigProvider><DictPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('水质')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('删除')[0]);
  });
});
