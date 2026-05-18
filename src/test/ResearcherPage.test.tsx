import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResearcherPage } from '../pages/ResearcherPage';

describe('ResearcherPage', () => {
  it('renders researcher overview', () => {
    render(<ResearcherPage />);
    expect(document.body.textContent).toContain('科研人员管理');
    expect(document.body.textContent).toContain('总人数');
    expect(document.body.textContent).toContain('张三');
  });

  it('switches to training tab', () => {
    render(<ResearcherPage />);
    const trainingTab = screen.getByText('培训管理');
    fireEvent.click(trainingTab);
    expect(document.body.textContent).toContain('培训课程库');
  });

  it('switches to competency tab', () => {
    render(<ResearcherPage />);
    const competencyTab = screen.getByText('能力矩阵');
    fireEvent.click(competencyTab);
    expect(document.body.textContent).toContain('人员能力矩阵');
  });

  it('opens researcher detail modal', () => {
    render(<ResearcherPage />);
    const detailBtn = screen.getAllByText('详情')[0];
    fireEvent.click(detailBtn);
    expect(document.body.textContent).toContain('培训记录');
    expect(document.body.textContent).toContain('能力评估');
  });

  it('opens new researcher modal', () => {
    render(<ResearcherPage />);
    fireEvent.click(screen.getByText('新建人员'));
    expect(document.body.textContent).toContain('新建科研人员');
  });
});
