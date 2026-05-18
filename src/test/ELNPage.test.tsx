import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ELNPage } from '../pages/ELNPage';

describe('ELNPage v2.0', () => {
  it('renders page title', () => {
    render(<ELNPage />);
    expect(screen.getByText(/电子实验记录/)).toBeInTheDocument();
  });

  it('renders ELN entry list', () => {
    render(<ELNPage />);
    expect(screen.getByText('2026-05-15 水质COD检测')).toBeInTheDocument();
    expect(screen.getByText('2026-05-10 土壤Pb检测')).toBeInTheDocument();
    expect(screen.getByText('2026-05-17 水质pH检测')).toBeInTheDocument();
  });

  it('opens detail modal', () => {
    render(<ELNPage />);
    fireEvent.click(screen.getAllByText('详情')[0]);
    expect(document.querySelector('.ant-modal')).toBeTruthy();
  });

  it('opens create modal', () => {
    render(<ELNPage />);
    fireEvent.click(screen.getByText('新建记录'));
    expect(screen.getByPlaceholderText('如：2026-05-15 水质COD检测')).toBeInTheDocument();
  });
});
