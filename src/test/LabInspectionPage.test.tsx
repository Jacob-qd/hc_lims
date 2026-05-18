import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LabInspectionPage } from '../pages/LabInspectionPage';

describe('LabInspectionPage', () => {
  it('renders inspection overview', () => {
    render(<LabInspectionPage />);
    expect(document.body.textContent).toContain('实验室安全检查');
    expect(document.body.textContent).toContain('本月检查');
    expect(document.body.textContent).toContain('发现隐患');
  });

  it('switches to hazards tab', () => {
    render(<LabInspectionPage />);
    const hazardsTab = screen.getByText('隐患整改');
    fireEvent.click(hazardsTab);
    expect(document.body.textContent).toContain('隐患清单');
  });

  it('opens inspection modal', () => {
    render(<LabInspectionPage />);
    fireEvent.click(screen.getByText('执行检查'));
    expect(document.body.textContent).toContain('执行实验室安全检查');
    expect(document.body.textContent).toContain('检查清单');
  });
});
