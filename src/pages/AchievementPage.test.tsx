import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AchievementPage } from './AchievementPage';

const mockPublications = [
  { id: 'pub1', title: '新型二维材料在高效催化中的结构调控与性能优化研究', type: '论文', journal: 'Nature Materials', authors: '张明, 李华, 王芳', year: 2025, doi: '10.1038/s41563-025-xxxxx', project: '二维材料界面调控', status: 'published' },
];

describe('AchievementPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ code: 200, data: { list: mockPublications } }),
    });
  });

  it('renders page title and stats', async () => {
    render(<AchievementPage />);
    expect(await screen.findByText('成果管理')).toBeInTheDocument();
    expect(screen.getByText('成果总数')).toBeInTheDocument();
    expect(screen.getByText('论文')).toBeInTheDocument();
  });

  it('opens drawer when title clicked', async () => {
    render(<AchievementPage />);
    const row = await screen.findByText('新型二维材料在高效催化中的结构调控与性能优化研究');
    fireEvent.click(row);
    expect(await screen.findByText('关联实验数据')).toBeInTheDocument();
  });

  it('filters by type', async () => {
    render(<AchievementPage />);
    await screen.findByText('新型二维材料在高效催化中的结构调控与性能优化研究');
    fireEvent.mouseDown(screen.getByText('类型'));
    fireEvent.click(await screen.findByText('专利'));
    await waitFor(() => {
      expect(screen.queryByText('新型二维材料在高效催化中的结构调控与性能优化研究')).not.toBeInTheDocument();
    });
  });
});
