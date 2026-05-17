import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { DashboardPage } from '../pages/DashboardPage';

vi.mock('@ant-design/plots', () => ({
  Line: () => <div data-testid="line-chart">LineChart</div>,
  Pie: () => <div data-testid="pie-chart">PieChart</div>,
}));

describe('DashboardPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockResolvedValue({
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
          <DashboardPage />
        </ConfigProvider>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    }, { timeout: 2000 });
  });
});
