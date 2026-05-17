import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AIAlertPage } from './AIAlertPage';

describe('AIAlertPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/api/v1/ai/alerts/stats')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            code: 200,
            data: {
              total: 6,
              new: 3,
              acknowledged: 2,
              resolved: 1,
              critical: 2,
              warning: 3,
              info: 1,
              trend: [
                { date: '05-12', qc: 2, instrument: 1, sample: 0, data: 1 },
                { date: '05-13', qc: 1, instrument: 0, sample: 1, data: 0 },
              ],
            },
          }),
        } as Response);
      }
      if (url.includes('/api/v1/ai/alerts')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            code: 200,
            data: {
              list: [
                {
                  id: 'alt1',
                  type: 'qc',
                  level: 'critical',
                  title: 'COD 质控样失控',
                  description: '偏差 12.5%',
                  sourceId: 'qc4',
                  sourceType: '质控批次',
                  suggestion: '立即停用该批次试剂',
                  status: 'new',
                  createdAt: '2026-05-17 08:15:00',
                },
              ],
            },
          }),
        } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve({ code: 200 }) } as Response);
    });
  });

  it('renders AI alert page', async () => {
    render(<AIAlertPage />);
    await waitFor(() => {
      expect(screen.getByText('异常预警看板')).toBeInTheDocument();
    });
  });

  it('displays alert stats', async () => {
    render(<AIAlertPage />);
    await waitFor(() => {
      expect(screen.getByText('今日预警')).toBeInTheDocument();
      expect(screen.getByText('新预警')).toBeInTheDocument();
    });
  });

  it('displays alert list', async () => {
    render(<AIAlertPage />);
    await waitFor(() => {
      expect(screen.getByText('COD 质控样失控')).toBeInTheDocument();
    });
  });
});
