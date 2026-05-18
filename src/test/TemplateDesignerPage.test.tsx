import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateDesignerPage } from '../pages/TemplateDesignerPage';

describe('TemplateDesignerPage', () => {
  it('renders template list', () => {
    render(<TemplateDesignerPage />);
    expect(screen.getByText('水质检测原始记录')).toBeInTheDocument();
    expect(screen.getByText('土壤重金属检测记录')).toBeInTheDocument();
  });

  it('clones template', () => {
    render(<TemplateDesignerPage />);
    const cloneBtns = screen.getAllByText('克隆');
    fireEvent.click(cloneBtns[0]);
    expect(screen.getByText(/水质检测原始记录 \(副本\)/)).toBeInTheDocument();
  });

  it('enters edit mode', () => {
    render(<TemplateDesignerPage />);
    const editBtns = screen.getAllByText('编辑');
    fireEvent.click(editBtns[0]);
    expect(screen.getByText(/编辑模板：/)).toBeInTheDocument();
    expect(screen.getByText('字段工具箱')).toBeInTheDocument();
  });

  it('opens preview modal', () => {
    render(<TemplateDesignerPage />);
    fireEvent.click(screen.getAllByText('预览')[0]);
    expect(screen.getByText('模板预览')).toBeInTheDocument();
  });
});
