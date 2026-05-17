import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearchProjectPage } from './ResearchProjectPage';

const mockProjects = [
  {
    id: 'rp1',
    no: 'NSFC-2024-001',
    name: '新型二维材料的界面调控机制研究',
    type: '纵向',
    source: '国家自然科学基金面上项目',
    pi: '张明',
    group: '环境分析课题组',
    startDate: '2024-01-01',
    endDate: '2027-12-31',
    budget: 580000,
    used: 126000,
    status: 'active',
    progress: 22,
  },
];

describe('ResearchProjectPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ code: 200, data: { list: mockProjects } }),
    });
  });

  it('renders page title and stats', async () => {
    render(<ResearchProjectPage />);
    expect(await screen.findByText('研究项目管理')).toBeInTheDocument();
    expect(screen.getByText('在研项目')).toBeInTheDocument();
    expect(screen.getByText('经费总额')).toBeInTheDocument();
  });

  it('opens detail drawer when row clicked', async () => {
    render(<ResearchProjectPage />);
    const row = await screen.findByText('新型二维材料的界面调控机制研究');
    fireEvent.click(row);
    expect(await screen.findByText('基本信息')).toBeInTheDocument();
  });

  it('has type filter select', async () => {
    render(<ResearchProjectPage />);
    await screen.findByText('新型二维材料的界面调控机制研究');
    expect(screen.getByText('项目类型')).toBeInTheDocument();
  });
});
