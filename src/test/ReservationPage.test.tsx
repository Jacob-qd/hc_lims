import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ReservationPage } from '../pages/ReservationPage';

describe('ReservationPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/research/reservations')) {
        return { ok: true, json: async () => ({ code: 200, data: { list: [
          { id: 'res1', instrumentId: 'i1', instrumentName: 'ICP-MS', userName: '张明', startTime: '2025-05-16 08:00:00', endTime: '2025-05-16 10:00:00', purpose: '元素分析', status: 'completed', statusLabel: '已完成', cost: 200 },
        ]}}) } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });
  afterEach(() => { fetchSpy.mockRestore(); });

  it('渲染仪器预约页面', async () => {
    render(<BrowserRouter><ConfigProvider><ReservationPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('仪器预约')).toBeInTheDocument());
  });
});
