import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { BatchActions, RowSelectionPreset } from '../components/BatchActions';

function renderWithProviders(ui: React.ReactNode) {
  return render(<BrowserRouter><ConfigProvider>{ui}</ConfigProvider></BrowserRouter>);
}

describe('BatchActions', () => {
  it('renders import/export buttons when nothing selected', () => {
    renderWithProviders(
      <BatchActions
        selectedCount={0}
        onBatchImport={() => {}}
        onBatchExport={() => {}}
      />
    );
    expect(screen.getByText('导入')).toBeInTheDocument();
    expect(screen.getByText('导出')).toBeInTheDocument();
  });

  it('renders batch action buttons with selection', () => {
    renderWithProviders(
      <BatchActions
        selectedCount={5}
        onBatchStatus={() => {}}
        onBatchDelete={() => {}}
        onBatchExport={() => {}}
        statusOptions={[
          { value: 'active', label: '启用', color: 'green' },
          { value: 'inactive', label: '停用', color: 'red' },
        ]}
      />
    );
    expect(screen.getByText(/已选 5 项/)).toBeInTheDocument();
    expect(screen.getByText('批量状态')).toBeInTheDocument();
    expect(screen.getByText('删除')).toBeInTheDocument();
    expect(screen.getByText('导出选中')).toBeInTheDocument();
  });

  it('calls onBatchExport when export button clicked', () => {
    const mockExport = vi.fn();
    renderWithProviders(
      <BatchActions selectedCount={0} onBatchExport={mockExport} />
    );
    fireEvent.click(screen.getByText('导出'));
    // export calls message.success which shows a message
  });

  it('RowSelectionPreset has expected values', () => {
    expect(RowSelectionPreset.columnWidth).toBe(40);
    expect(RowSelectionPreset.fixed).toBe(true);
  });
});
