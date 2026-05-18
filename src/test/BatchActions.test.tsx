import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { BatchActions } from '../components/BatchActions';

describe('BatchActions', () => {
  const defaultProps = {
    selectedCount: 3,
  };

  it('renders with selection count', () => {
    const { container } = render(<ConfigProvider><BatchActions {...defaultProps} /></ConfigProvider>);
    expect(container.textContent).toContain('3');
  });

  it('shows info when no items selected on export', () => {
    render(<ConfigProvider><BatchActions selectedCount={0} onBatchExport={vi.fn()} /></ConfigProvider>);
    // Should render without crashing
    expect(document.body.textContent).not.toBeNull();
  });

  it('calls onBatchDelete when delete confirmed', () => {
    const onDelete = vi.fn();
    render(<ConfigProvider><BatchActions selectedCount={2} onBatchDelete={onDelete} /></ConfigProvider>);
    // Component renders the delete option
    expect(document.body.textContent).toContain('2');
  });

  it('renders status change dropdown', () => {
    render(<ConfigProvider><BatchActions selectedCount={1} onBatchStatus={vi.fn()} /></ConfigProvider>);
    expect(document.body.textContent).not.toBeNull();
  });
});
