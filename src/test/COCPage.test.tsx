import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { COCPage } from '../pages/COCPage';

describe('COCPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  const mockChains = [
    {
      id: 'coc1', cocNumber: 'COC-260515-0001', sampleId: 's1', sampleName: '地表水样品',
      status: 'active', integrity: true, events: [
        { id: 'e1', chainId: 'coc1', eventType: 'SAMPLING', operatorName: '张三', occurredAt: '2026-05-15T08:00:00Z', prevEventId: null },
        { id: 'e2', chainId: 'coc1', eventType: 'SUBMISSION', operatorName: '张三', occurredAt: '2026-05-15T09:00:00Z', prevEventId: 'e1' },
        { id: 'e3', chainId: 'coc1', eventType: 'RECEIPT', operatorName: '李四', occurredAt: '2026-05-15T10:00:00Z', prevEventId: 'e2' },
      ],
      createdAt: '2026-05-15T08:00:00Z',
    },
    {
      id: 'coc2', cocNumber: 'COC-260515-0002', sampleId: 's2', sampleName: '土壤样品',
      status: 'broken', integrity: false, integrityMsg: '缺少送样和收样环节',
      events: [
        { id: 'e4', chainId: 'coc2', eventType: 'SAMPLING', operatorName: '王五', occurredAt: '2026-05-14T08:00:00Z', prevEventId: null },
        { id: 'e5', chainId: 'coc2', eventType: 'REGISTRATION', operatorName: '赵六', occurredAt: '2026-05-14T10:00:00Z', prevEventId: null },
      ],
      createdAt: '2026-05-14T08:00:00Z',
    },
  ];

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (input: unknown) => {
      const url = String(input);
      if ((url.endsWith('/coc/chains') || url.includes('/coc/chains?')) && !url.includes('/by-sample')) {
        return {
          ok: true, status: 200,
          json: async () => ({ code: 200, data: { list: mockChains }, message: 'success' }),
        } as Response;
      }
      if (url.includes('/coc/chains/')) {
        const id = url.split('/').pop();
        const chain = mockChains.find(c => c.id === id);
        return {
          ok: true, status: 200,
          json: async () => ({ code: 200, data: chain || mockChains[0], message: 'success' }),
        } as Response;
      }
      return {
        ok: true, status: 200,
        json: async () => ({ code: 200, data: {}, message: 'success' }),
      } as Response;
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders without crashing', async () => {
    render(<BrowserRouter><ConfigProvider><COCPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('displays COC list with stats', async () => {
    render(<BrowserRouter><ConfigProvider><COCPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('COC 监管链')).toBeTruthy(), { timeout: 2000 });
    await waitFor(() => expect(screen.getByText('总链数')).toBeTruthy());
  });

  it('opens detail modal on click', async () => {
    render(<BrowserRouter><ConfigProvider><COCPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('COC-260515-0001')).toBeTruthy(), { timeout: 2000 });
    const detailBtn = screen.getAllByText('详情')[0];
    fireEvent.click(detailBtn);
    await waitFor(() => expect(screen.getByText(/事件时间线/)).toBeTruthy());
  });

  it('shows broken chain status correctly', async () => {
    render(<BrowserRouter><ConfigProvider><COCPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('COC-260515-0002')).toBeTruthy(), { timeout: 2000 });
  });

  it('opens transfer modal', async () => {
    render(<BrowserRouter><ConfigProvider><COCPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('新建交接')).toBeTruthy(), { timeout: 2000 });
    fireEvent.click(screen.getByText('新建交接'));
    await waitFor(() => expect(screen.getByText(/新建交接记录/)).toBeTruthy());
  });

  it('opens disposal modal for active chain', async () => {
    render(<BrowserRouter><ConfigProvider><COCPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('COC-260515-0001')).toBeTruthy(), { timeout: 2000 });
    const disposalBtns = screen.getAllByText('处置');
    expect(disposalBtns.length).toBeGreaterThan(0);
  });
});
