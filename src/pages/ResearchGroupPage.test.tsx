import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResearchGroupPage } from './ResearchGroupPage';

const mockGroups = [
  {
    id: 'rg1',
    name: '环境分析课题组',
    dept: '化学与分子工程学院',
    pi: '张明',
    members: 12,
    budget: '¥1,280,000',
    projects: 4,
    instrumentUsage: 86,
    status: 'active',
    detail: {
      piTitle: '教授',
      founded: '2021-09-01',
      field: '环境水质 / VOCs / 重金属',
      balance: '¥1,280,000',
      activeProjects: 4,
      peopleCount: 12,
      monthlyUsage: 86,
    },
    membersList: [
      { id: 'm1', name: '张明', role: 'PI', education: '教授/博导', field: '环境污染物高灵敏检测', joinDate: '2021-09-01', status: 'active' },
    ],
    fundingList: [
      { source: '国自然基金', type: '纵向', amount: '¥500,000', used: '¥180,000', remain: '¥320,000', rate: 36 },
    ],
    usageList: [
      { inst: '液相色谱仪', count: 28, hours: 56, fee: '¥2,800' },
    ],
  },
];

describe('ResearchGroupPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ code: 200, data: { list: mockGroups } }),
    });
  });

  it('renders page title and stats', async () => {
    render(<ResearchGroupPage />);
    expect(await screen.findByText('课题组管理')).toBeInTheDocument();
    expect(screen.getByText('课题组总数')).toBeInTheDocument();
    expect(screen.getByText('在组总人数')).toBeInTheDocument();
  });

  it('opens detail drawer when row clicked', async () => {
    render(<ResearchGroupPage />);
    const row = await screen.findByText('环境分析课题组');
    fireEvent.click(row);
    expect(await screen.findByText('成员管理')).toBeInTheDocument();
  });

  it('filters by search text', async () => {
    render(<ResearchGroupPage />);
    await screen.findByText('环境分析课题组');
    const input = screen.getByPlaceholderText('搜索课题组/PI/院系');
    fireEvent.change(input, { target: { value: '不存在' } });
    await waitFor(() => {
      expect(screen.queryByText('环境分析课题组')).not.toBeInTheDocument();
    });
  });

  it('opens create modal', async () => {
    render(<ResearchGroupPage />);
    await screen.findByText('新建课题组');
    fireEvent.click(screen.getAllByText('新建课题组')[0]);
    expect(await screen.findByText('课题组名称')).toBeInTheDocument();
  });
});
