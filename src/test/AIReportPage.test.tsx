import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AIReportPage } from '../pages/AIReportPage';

describe('AIReportPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/ai/reports')) {
        return {
          json: () => Promise.resolve({
            code: 200,
            data: {
              list: [
                {
                  id: 'air1',
                  name: '2026年4月水质检测月报',
                  dataSource: 'samples',
                  timeRange: ['2026-04-01', '2026-04-30'],
                  reportType: 'summary',
                  generatedContent: '## 检测概况\n\n本月共完成水质检测样品 245 批次',
                  status: 'reviewed',
                  createdAt: '2026-05-05 10:00:00',
                },
              ],
            },
          }),
        } as Response;
      }
      return { json: () => Promise.resolve({ code: 200 }) } as Response;
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders AI report page', async () => {
    render(<AIReportPage />);
    await waitFor(() => {
      expect(screen.getByText('智能报告生成器')).toBeInTheDocument();
    });
  });

  it('displays report list', async () => {
    render(<AIReportPage />);
    await waitFor(() => {
      expect(screen.getByText('2026年4月水质检测月报')).toBeInTheDocument();
    });
  });

  it('shows alert for AI content verification', async () => {
    render(<AIReportPage />);
    await waitFor(() => {
      expect(screen.getByText('AI 辅助生成内容，请人工审核确认')).toBeInTheDocument();
    });
  });
});
