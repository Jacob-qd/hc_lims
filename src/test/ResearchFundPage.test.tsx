import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearchFundPage } from '../pages/ResearchFundPage';

describe('ResearchFundPage', () => {
  it('renders fund overview', () => {
    render(<ResearchFundPage />);
    expect(document.body.textContent).toContain('科研经费管理');
    expect(document.body.textContent).toContain('总经费');
    expect(document.body.textContent).toContain('已执行');
  });

  it('shows budget alerts', () => {
    render(<ResearchFundPage />);
    expect(document.body.textContent).toContain('预算预警');
  });

  it('switches to expenditures tab', () => {
    render(<ResearchFundPage />);
    const expTab = screen.getByText('经费支出');
    fireEvent.click(expTab);
    expect(document.body.textContent).toContain('支出记录');
  });

  it('opens fund detail modal', () => {
    render(<ResearchFundPage />);
    const detailBtn = screen.getAllByText('详情')[0];
    fireEvent.click(detailBtn);
    expect(document.body.textContent).toContain('预算科目执行情况');
  });

  it('opens new expenditure modal', () => {
    render(<ResearchFundPage />);
    const expTab = screen.getByText('经费支出');
    fireEvent.click(expTab);
    fireEvent.click(screen.getByText('新建支出'));
    expect(document.body.textContent).toContain('新建支出申请');
  });
});
