import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ReportEnginePage } from '../pages/ReportEnginePage';

function mockFetchResponse(data: unknown) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('ReportEnginePage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as unknown as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: unknown) => {
      if (url.includes('/api/v1/reports/templates')) {
        return mockFetchResponse({
          code: 200,
          data: {
            list: [
              {
                id: 'tmpl1',
                name: '月度报表',
                type: 'scheduled',
                dataSource: 'samples',
                outputFormat: ['PDF'],
                status: 'active',
                fields: [],
                filters: [],
                outputSettings: { format: 'PDF' },
                createdAt: '2025-01-01',
                updatedAt: '2025-01-01',
              },
            ],
            total: 1,
          },
        });
      }
      if (url.includes('/api/v1/reports/charts')) {
        return mockFetchResponse({
          code: 200,
          data: {
            list: [
              {
                id: 'c1',
                name: '柱状图',
                type: 'bar',
                dataSource: 'samples',
                config: {},
                previewData: [
                  { month: '1月', count: 10 },
                  { month: '2月', count: 20 },
                ],
                createdAt: '2025-01-01',
              },
            ],
            total: 1,
          },
        });
      }
      if (url.includes('/api/v1/reports/schedules')) {
        return mockFetchResponse({
          code: 200,
          data: {
            list: [
              {
                id: 'sch1',
                reportId: 'tmpl1',
                reportName: '月度报表',
                cronExpression: '0 8 * * *',
                nextRunTime: '2025-01-02 08:00',
                enabled: true,
              },
            ],
            total: 1,
          },
        });
      }
      if (url.includes('/api/v1/reports/executions')) {
        return mockFetchResponse({
          code: 200,
          data: {
            list: [
              {
                id: 'ex1',
                reportId: 'tmpl1',
                reportName: '月度报表',
                scheduledTime: '2025-01-01 08:00',
                actualTime: '2025-01-01 08:05',
                status: 'success',
                outputFile: 'report.pdf',
                outputSize: '1.2MB',
                triggerType: 'scheduled',
              },
            ],
            total: 1,
          },
        });
      }
      if (url.includes('/api/v1/reports/data-sources')) {
        return mockFetchResponse({
          code: 200,
          data: {
            list: [
              { id: 'ds1', name: '样品数据', type: 'table', source: 'samples' },
              { id: 'ds2', name: '任务数据', type: 'table', source: 'tasks' },
            ],
          },
        });
      }
      if (url.includes('/api/v1/reports/executions/tmpl1')) {
        return mockFetchResponse({ code: 200, data: { executionId: 'ex2' } });
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads templates', async () => {
    render(<BrowserRouter><ConfigProvider><ReportEnginePage /></ConfigProvider></BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText('月度报表')).toBeInTheDocument());
  });

  it('switches to charts tab and previews', async () => {
    render(<BrowserRouter><ConfigProvider><ReportEnginePage /></ConfigProvider></BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText('月度报表')).toBeInTheDocument());
    fireEvent.click(screen.getByText('图表组件库'));
    await waitFor(() => expect(screen.getAllByText('柱状图').length).toBeGreaterThanOrEqual(1));
    fireEvent.click(screen.getAllByText('预览')[0]);
    await waitFor(() => expect(document.body.textContent).toContain('图表预览'));
  });

  it('switches to schedules tab and toggles', async () => {
    render(<BrowserRouter><ConfigProvider><ReportEnginePage /></ConfigProvider></BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText('月度报表')).toBeInTheDocument());
    fireEvent.click(screen.getByText('调度任务'));
    await waitFor(() => expect(screen.getByText('定时配置')).toBeInTheDocument());
    const enabledTag = screen.getByText('启用');
    fireEvent.click(enabledTag);
  });

  it('opens create modal and navigates steps', async () => {
    render(<BrowserRouter><ConfigProvider><ReportEnginePage /></ConfigProvider></BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText('月度报表')).toBeInTheDocument());
    fireEvent.click(screen.getByText('新建报表'));
    await waitFor(() => expect(document.body.textContent).toContain('基础信息'));
    fireEvent.click(screen.getByText('下一步'));
    await waitFor(() => expect(document.body.textContent).toContain('字段配置'));
    fireEvent.click(screen.getByText('下一步'));
    await waitFor(() => expect(document.body.textContent).toContain('筛选条件'));
    fireEvent.click(screen.getByText('下一步'));
    await waitFor(() => expect(document.body.textContent).toContain('图表配置'));
    fireEvent.click(screen.getByText('下一步'));
    await waitFor(() => expect(document.body.textContent).toContain('输出设置'));
  });

  it('clicks run template', async () => {
    render(<BrowserRouter><ConfigProvider><ReportEnginePage /></ConfigProvider></BrowserRouter>
    );
    await waitFor(() => expect(screen.getByText('月度报表')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('运行')[0]);
  });
});
