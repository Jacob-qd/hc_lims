import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReservationPage } from './ReservationPage';

const mockReservations = [
  { id: 'res1', instrument: 'ICP-MS质谱仪 ICP-001', user: '张明', group: '环境分析课题组', project: '二维材料界面调控', date: '2025-05-16', time: '08:00-10:00', fee: 200, status: 'completed' },
];

describe('ReservationPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ code: 200, data: { list: mockReservations } }),
    });
  });

  it('renders page title and stats', async () => {
    render(<ReservationPage />);
    expect(await screen.findByText('仪器共享预约')).toBeInTheDocument();
    expect(screen.getByText('本月预约')).toBeInTheDocument();
    expect(screen.getByText('使用中')).toBeInTheDocument();
  });

  it('opens create modal', async () => {
    render(<ReservationPage />);
    await screen.findByText('新建预约');
    fireEvent.click(screen.getAllByText('新建预约')[0]);
    expect(await screen.findByText('选择仪器')).toBeInTheDocument();
  });
});
