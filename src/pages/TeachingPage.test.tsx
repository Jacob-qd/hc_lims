import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeachingPage } from './TeachingPage';

const mockCourses = [
  { id: 'course1', name: '分析化学实验', teacher: '张明', dept: '化学与分子工程学院', semester: '2024春季', students: 45, experiments: 8, status: 'active' },
];

describe('TeachingPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ code: 200, data: { list: mockCourses } }),
    });
  });

  it('renders page title and stats', async () => {
    render(<TeachingPage />);
    expect(await screen.findByText('教学实验管理')).toBeInTheDocument();
    expect(screen.getByText('本学期课程')).toBeInTheDocument();
    expect(screen.getByText('学生总人数')).toBeInTheDocument();
  });

  it('opens drawer when course clicked', async () => {
    render(<TeachingPage />);
    const row = await screen.findByText('分析化学实验');
    fireEvent.click(row);
    expect(await screen.findByText('基本信息')).toBeInTheDocument();
  });

  it('filters by search text', async () => {
    render(<TeachingPage />);
    await screen.findByText('分析化学实验');
    const input = screen.getByPlaceholderText('搜索课程名称/教师');
    fireEvent.change(input, { target: { value: '不存在' } });
    await waitFor(() => {
      expect(screen.queryByText('分析化学实验')).not.toBeInTheDocument();
    });
  });
});
