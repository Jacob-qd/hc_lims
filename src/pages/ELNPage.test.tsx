import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ELNPage } from './ELNPage';

const mockEntries = [
  {
    id: 'eln1',
    no: 'ELN20240521-001',
    title: '土壤pH测定实验',
    author: '张伟',
    project: '地表水VOCs监测',
    group: '环境分析课题组',
    date: '2024-05-21',
    protocol: '土壤pH测定SOP v1.2',
    status: 'signed',
    tags: ['土壤', 'pH', '水质'],
  },
];

describe('ELNPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ code: 200, data: { list: mockEntries } }),
    });
  });

  it('renders page title and stats', async () => {
    render(<ELNPage />);
    expect(await screen.findByText('电子实验记录 (ELN)')).toBeInTheDocument();
    expect(screen.getByText('总记录')).toBeInTheDocument();
    expect(screen.getAllByText('已签名').length).toBeGreaterThanOrEqual(1);
  });

  it('opens editor when title clicked', async () => {
    render(<ELNPage />);
    const row = await screen.findByText('土壤pH测定实验');
    fireEvent.click(row);
    expect(await screen.findByPlaceholderText('实验标题')).toBeInTheDocument();
  });

  it('has status filter select', async () => {
    render(<ELNPage />);
    await screen.findByText('土壤pH测定实验');
    expect(screen.getAllByText('状态').length).toBeGreaterThanOrEqual(1);
  });
});
