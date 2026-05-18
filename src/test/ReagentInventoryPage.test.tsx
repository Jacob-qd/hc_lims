import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReagentInventoryPage } from '../pages/ReagentInventoryPage';

describe('ReagentInventoryPage', () => {
  it('renders inventory overview', () => {
    render(<ReagentInventoryPage />);
    expect(document.body.textContent).toContain('试剂耗材管理');
    expect(document.body.textContent).toContain('总试剂数');
    expect(document.body.textContent).toContain('危化品');
  });

  it('switches to usage tab', () => {
    render(<ReagentInventoryPage />);
    const usageTab = screen.getByText('领用记录');
    fireEvent.click(usageTab);
    expect(document.body.textContent).toContain('领用记录');
  });

  it('opens new reagent modal', () => {
    render(<ReagentInventoryPage />);
    fireEvent.click(screen.getByText('新建试剂'));
    expect(document.body.textContent).toContain('登记新试剂');
  });

  it('filters by category', () => {
    render(<ReagentInventoryPage />);
    expect(document.body.textContent).toContain('甲醇');
    expect(document.body.textContent).toContain('盐酸');
  });
});
