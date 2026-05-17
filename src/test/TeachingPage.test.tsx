import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { TeachingPage } from '../pages/TeachingPage';

describe('TeachingPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/teaching/courses')) {
        return { ok: true, json: async () => ({ code: 200, data: { list: [
          { id: 'course1', code: 'CHEM201', name: '分析化学实验', semester: '2024-2025-1', credit: 2, hours: 32, teacherName: '张明', studentCount: 45, experimentCount: 8, status: 'active', statusLabel: '开课中' },
        ]}}) } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });
  afterEach(() => { fetchSpy.mockRestore(); });

  it('渲染教学管理页面', async () => {
    render(<BrowserRouter><ConfigProvider><TeachingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('教学管理')).toBeInTheDocument());
  });
});
