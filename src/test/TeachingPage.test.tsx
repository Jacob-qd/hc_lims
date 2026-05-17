import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { TeachingPage } from '../pages/TeachingPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('TeachingPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/teaching/courses')) {
        return mockFetchResponse({
          code: 200,
          data: { list: [
            { id: 'c1', name: '环境监测实验', teacher: '张教授', dept: '环境学院', semester: '2025春', students: 45, experiments: 6, status: 'active' },
            { id: 'c2', name: '分析化学实验', teacher: '李教授', dept: '化学学院', semester: '2025春', students: 30, experiments: 8, status: 'ended' },
          ]},
        });
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads courses', async () => {
    render(<BrowserRouter><ConfigProvider><TeachingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('环境监测实验')).toBeInTheDocument());
    expect(screen.getByText('张教授')).toBeInTheDocument();
  });

  it('opens detail drawer and switches tabs', async () => {
    render(<BrowserRouter><ConfigProvider><TeachingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('环境监测实验')).toBeInTheDocument());
    fireEvent.click(screen.getByText('环境监测实验'));
    await waitFor(() => expect(screen.getByText('基本信息')).toBeInTheDocument());
    fireEvent.click(screen.getByText('教学大纲'));
    await waitFor(() => expect(document.body.textContent).toContain('实验一'));
    fireEvent.click(screen.getByText('学生管理'));
    fireEvent.click(screen.getByText('实验报告'));
  });
});
