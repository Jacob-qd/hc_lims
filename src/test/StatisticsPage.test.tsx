import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { StatisticsPage } from '../pages/StatisticsPage';

vi.mock('@ant-design/plots', () => ({
  Line: () => <div data-testid="line-chart">LineChart</div>,
  Pie: () => <div data-testid="pie-chart">PieChart</div>,
  Bar: () => <div data-testid="bar-chart">BarChart</div>,
}));

describe('StatisticsPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ code: 200, data: [], message: 'success' }),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders without crashing', async () => {
    render(
      <BrowserRouter>
        <ConfigProvider>
          <StatisticsPage />
        </ConfigProvider>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    }, { timeout: 2000 });
  });
});
