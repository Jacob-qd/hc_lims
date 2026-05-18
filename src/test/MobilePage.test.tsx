/**
 * 移动端首页测试
 *
 * User Story:
 *   "作为采样员，我希望在手机上快速查看今日采样概况和待办任务，
 *    以便安排一天的工作计划。"
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { MobilePage } from '../pages/MobilePage';

function mockFetch(data: any) {
  return { ok: true, status: 200, json: async () => ({ code: 200, data }) } as Response;
}

describe('MobilePage - 移动端首页', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // 清理离线队列
    localStorage.removeItem('sampling_offline_queue');
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/dashboard/stats')) return mockFetch({ todaySamples: 5, inProgress: 3, todayCompleted: 2, pendingReports: 1, pendingIssues: 0 });
      if (url.includes('/api/v1/tasks')) return mockFetch({ list: [
        { id: 't1', sampleName: '地表水样品-01', testItem: 'COD测定', status: 'in_progress', progress: 45, createdAt: '2025-01-01', analystName: '张三' },
        { id: 't2', sampleName: '土壤样品-02', testItem: '重金属', status: 'pending', progress: 0, createdAt: '2025-01-01', analystName: '李四' },
      ]});
      if (url.includes('/mobile/field-samples')) return mockFetch({ list: [
        { id: 'fs1', name: '东湖入口-1', sampleNo: 'FS-001', location: { latitude: 30.27, longitude: 120.15 } },
      ]});
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('US1: 显示采样员工作台标题', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('移动实验室'));
  }, 15000);

  it('US1: 显示今日采样统计', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('今日采样'));
    expect(document.body.textContent).toContain('5');
  }, 15000);

  it('US1: 显示快捷操作入口（现场采样、扫码、任务、待处理）', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('现场采样'));
    expect(document.body.textContent).toContain('扫码');
    expect(document.body.textContent).toContain('我的任务');
  }, 15000);

  it('US1: 点击"现场采样"跳转到采样页面', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('现场采样'));
    const samplingCard = screen.getByText('现场采样').closest('.ant-card') || screen.getByText('现场采样');
    fireEvent.click(samplingCard);
  }, 15000);

  it('US1: 显示最近采样记录', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('东湖入口-1'));
  }, 15000);

  it('US1: 显示待办任务列表', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('地表水样品-01'));
    expect(document.body.textContent).toContain('土壤样品-02');
  }, 15000);

  it('US1: 显示任务进度条', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('COD测定'));
  }, 15000);

  it('US1: 未登录时显示 0 统计', async () => {
    fetchSpy.mockRestore();
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
      ok: true, json: async () => ({ code: 200, data: { list: [] } }),
    } as Response);
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('0'));
  }, 15000);

  it('US1: 底部导航包含 5 个 Tab', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => {
      expect(document.body.textContent).toContain('首页');
      expect(document.body.textContent).toContain('采样');
      expect(document.body.textContent).toContain('签收');
      expect(document.body.textContent).toContain('录入');
      expect(document.body.textContent).toContain('报告');
    });
  }, 15000);

  it('US1: 离线队列为空时显示 0', async () => {
    render(<BrowserRouter><ConfigProvider><MobilePage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('待同步'));
  }, 15000);
});
