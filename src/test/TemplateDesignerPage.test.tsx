import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TemplateDesignerPage } from '../pages/TemplateDesignerPage';

describe('TemplateDesignerPage', () => {
  it('renders template list', () => {
    render(<TemplateDesignerPage />);
    expect(document.body.textContent).toContain('水质检测原始记录');
    expect(document.body.textContent).toContain('土壤重金属检测记录');
  });

  it('clones template', () => {
    render(<TemplateDesignerPage />);
    const cloneBtns = screen.getAllByText('克隆');
    fireEvent.click(cloneBtns[0]);
    expect(document.body.textContent).toContain('水质检测原始记录 (副本)');
  });

  it('enters edit mode', () => {
    render(<TemplateDesignerPage />);
    const editBtns = screen.getAllByText('编辑');
    fireEvent.click(editBtns[0]);
    expect(document.body.textContent).toContain('编辑模板：水质检测原始记录');
    expect(document.body.textContent).toContain('字段工具箱');
  });

  it('opens preview modal', () => {
    render(<TemplateDesignerPage />);
    fireEvent.click(screen.getAllByText('预览')[0]);
    expect(document.body.textContent).toContain('模板预览');
    expect(document.body.textContent).toContain('样品编号');
  });
});
