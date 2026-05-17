import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ReviewModal } from '../components/reports/ReviewModal';

const mockReport = {
  id: 'r1',
  reportNo: 'RPT-001',
  title: '水质报告',
  status: 'pending_tech_review',
} as LooseAny;

function renderModal(props: Partial<Parameters<typeof ReviewModal>[0]> = {}) {
  return render(
    <BrowserRouter>
      <ConfigProvider>
        <ReviewModal
          open={true}
          onClose={vi.fn()}
          onSubmit={vi.fn()}
          report={mockReport}
          {...props}
        />
      </ConfigProvider>
    </BrowserRouter>
  );
}

describe('ReviewModal', () => {
  it('renders with title', () => {
    renderModal();
    expect(screen.getByText('审核确认')).toBeInTheDocument();
  });

  it('shows report info', () => {
    renderModal();
    expect(screen.getByText('RPT-001')).toBeInTheDocument();
  });

  it('shows checklist items', () => {
    renderModal();
    const checkboxes = document.querySelectorAll('.ant-checkbox-input');
    expect(checkboxes.length).toBeGreaterThan(0);
  });

  it('closes on cancel', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    const closeBtn = document.querySelector('.ant-modal-close');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('prevents submit with unchecked items', () => {
    const onSubmit = vi.fn();
    renderModal({ onSubmit });
    const okBtn = document.querySelector('.ant-modal-footer .ant-btn-primary');
    if (okBtn) fireEvent.click(okBtn);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('can check all checklist items and toggle pass/fail', () => {
    renderModal();
    const checkboxes = document.querySelectorAll('.ant-checkbox-input');
    checkboxes.forEach(cb => fireEvent.click(cb));
    // All checkboxes should now be checked
    const passRadio = document.querySelector('.ant-radio-button-input[value="pass"]');
    if (passRadio) fireEvent.click(passRadio);
    expect(document.body.textContent).toContain('通过');
  });
});
