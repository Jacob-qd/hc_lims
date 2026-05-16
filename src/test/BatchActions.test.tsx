import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BatchActions } from '../components/BatchActions';

describe('BatchActions', () => {
  it('renders import/export when nothing selected', () => {
    render(<BatchActions selectedCount={0} onBatchExport={() => {}} onBatchImport={() => {}} />);
    expect(screen.getByText('导入')).toBeInTheDocument();
    expect(screen.getByText('导出')).toBeInTheDocument();
  });

  it('renders batch actions when items selected', () => {
    render(<BatchActions selectedCount={3} onBatchDelete={() => {}} onBatchExport={() => {}} statusOptions={[{ value: 'active', label: '激活', color: 'green' }]} onBatchStatus={() => {}} />);
    expect(screen.getByText('已选 3 项')).toBeInTheDocument();
    fireEvent.click(screen.getByText('批量状态'));
  });
});
