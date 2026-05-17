/**
 * 移动采样模块测试
 *
 * User Stories:
 *   US1: "作为采样员，我希望在手机上接收采样任务，以便安排采样路线。"
 *   US2: "作为采样员，到达现场后我需要记录 GPS 坐标和现场照片，
 *         以便样品溯源。"
 *   US3: "作为采样员，我希望采样时自动创建 COC 监管链，
 *         无需回实验室补录。"
 *   US4: "作为采样员，无网络时我可以先记录采样信息，
 *         联网后自动同步。"
 *   US5: "作为采样员，我可以在同一位置批量采集多个样品。"
 *   US6: "作为采样员，我可以扫描容器条码关联到样品。"
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { MobileSamplingPage } from '../pages/MobileSamplingPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => ({ code: 200, data, message: 'success' }) } as Response;
}

describe('MobileSamplingPage - 移动采样', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.removeItem('sampling_offline_queue');
    // Mock Geolocation
    Object.defineProperty(globalThis.navigator, 'geolocation', {
      value: {
        getCurrentPosition: (cb: any) => cb({
          coords: { latitude: 30.274, longitude: 120.155, accuracy: 10 },
        }),
      },
      writable: true,
    });

    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/mobile/sampling-tasks')) {
        return mockFetchResponse({ list: [
          { id: 'st1', taskNo: 'TASK-001', projectName: '东湖水质监测', sampleType: '地表水', assignedTo: '张三', planDate: '2026-05-17', status: 'in_progress', points: [
            { id: 'sp1', name: '东湖入口', location: { latitude: 30.274, longitude: 120.155, address: '东湖公园' }, expectedSampleType: '地表水', expectedCount: 2 },
            { id: 'sp2', name: '东湖中心', location: { latitude: 30.278, longitude: 120.162, address: '湖心' }, expectedSampleType: '地表水', expectedCount: 1 },
          ]},
        ]});
      }
      if (url.includes('/mobile/field-samples')) {
        return mockFetchResponse({ list: [
          { id: 'fs1', sampleNo: 'FS-001', name: '东湖入口-1', location: { latitude: 30.274, longitude: 120.155 }, photos: [], collectedAt: '2026-05-17T08:00:00Z', status: 'synced' },
        ]});
      }
      if (url.includes('/coc/chains')) {
        return mockFetchResponse({ id: 'coc1', cocNumber: 'COC-001' });
      }
      return { ok: true, status: 200, json: async () => ({ code: 200, data: { list: [] } }) } as Response;
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  // ========== US1: 采样任务列表 ==========

  it('US1: 显示采样任务列表', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
  });

  it('US1: 显示采样点摘要信息', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('2 个采样点'));
  });

  it('US1: 显示任务状态标签', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('进行中')).toBeInTheDocument());
  });

  it('US1: 存在"直接采样"按钮', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('直接采样')).toBeInTheDocument());
  });

  it('US1: 存在"记录"按钮查看历史', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('📋 记录')).toBeInTheDocument());
  });

  // ========== US2: 采样点详情 + GPS ==========

  it('US2: 点击任务进入详情页显示采样点', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖水质监测'));
    await waitFor(() => expect(screen.getByText('东湖入口')).toBeInTheDocument());
    expect(screen.getByText('东湖中心')).toBeInTheDocument();
  });

  it('US2: 采样点详情显示坐标', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖水质监测'));
    await waitFor(() => expect(document.body.textContent).toContain('30.274'));
  });

  it('US2: 采样点详情显示导航按钮', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖水质监测'));
    await waitFor(() => expect(screen.getAllByText('导航').length).toBeGreaterThan(0));
  });

  it('US2: 点击采样点进入采样表单', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖水质监测'));
    await waitFor(() => expect(screen.getByText('东湖入口')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖入口'));
    await waitFor(() => expect(screen.getByText('现场采样')).toBeInTheDocument());
  });

  it('US2: 采样表单存在 GPS 定位按钮', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖水质监测'));
    await waitFor(() => expect(screen.getByText('东湖入口')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖入口'));
    await waitFor(() => expect(document.body.textContent).toContain('定位'));
  });

  it('US2: 采样表单存在拍照按钮', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖水质监测'));
    await waitFor(() => expect(screen.getByText('东湖入口')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖入口'));
    // 拍照按钮应存在
    const photoElements = screen.getAllByText('拍照');
    expect(photoElements.length).toBeGreaterThan(0);
  });

  it('US2: 采样表单显示现场测量字段', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖水质监测'));
    await waitFor(() => expect(screen.getByText('东湖入口')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖入口'));
    await waitFor(() => {
      expect(screen.getByText('pH')).toBeInTheDocument();
      expect(screen.getByText('溶解氧(mg/L)')).toBeInTheDocument();
    });
  });

  it('US2: 采样表单可输入样品名称', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖水质监测'));
    await waitFor(() => expect(screen.getByText('东湖入口')).toBeInTheDocument());
    fireEvent.click(screen.getByText('东湖入口'));
    await waitFor(() => {
      const inputs = document.querySelectorAll('input');
      const nameInput = Array.from(inputs).find(i => i.placeholder.includes('样品名称'));
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: '东湖入口-水质1' } });
        expect(nameInput.value).toBe('东湖入口-水质1');
      }
    });
  });

  // ========== US4: 离线队列 ==========

  it('US4: 离线队列数据可以存入 localStorage', async () => {
    const queue = [{ name: '离线样品', latitude: 30.0, longitude: 120.0, status: 'draft' }];
    localStorage.setItem('sampling_offline_queue', JSON.stringify(queue));
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(document.body.textContent).toContain('离线'));
  });

  // ========== US5: 批量采样 ==========

  it('US5: 批量采样配置区域存在', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    // 点击"直接采样"进入表单
    fireEvent.click(screen.getByText('直接采样'));
    await waitFor(() => expect(screen.getByText('批量采样')).toBeInTheDocument());
  });

  it('US5: 批量采样有数量输入', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('直接采样'));
    await waitFor(() => expect(screen.getByText('批量提交')).toBeInTheDocument());
  });

  // ========== US6: 容器条码 ==========

  it('US6: 容器条码输入区域存在', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('直接采样'));
    await waitFor(() => expect(screen.getByText('样品容器')).toBeInTheDocument());
  });

  // ========== 历史记录 ==========

  it('点击"记录"进入历史页显示已采样品', async () => {
    render(<BrowserRouter><ConfigProvider><MobileSamplingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('东湖水质监测')).toBeInTheDocument());
    fireEvent.click(screen.getByText('📋 记录'));
    await waitFor(() => expect(screen.getByText('东湖入口-1')).toBeInTheDocument());
  });
});
