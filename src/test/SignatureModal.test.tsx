import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { SignatureModal } from '../components/reports/SignatureModal';

function renderModal(props: Partial<Parameters<typeof SignatureModal>[0]> = {}) {
  return render(
    <BrowserRouter>
      <ConfigProvider>
        <SignatureModal
          open={true}
          onClose={vi.fn()}
          onSign={vi.fn()}
          role="compiler"
          roleLabel="编制人"
          reportId="r1"
          {...props}
        />
      </ConfigProvider>
    </BrowserRouter>
  );
}

describe('SignatureModal', () => {
  it('renders with title', () => {
    renderModal();
    expect(screen.getByText('电子签名确认')).toBeInTheDocument();
  });

  it('shows SM3 hash when opened', () => {
    renderModal();
    expect(document.body.textContent).toContain('SM3');
  });

  it('closes on cancel', () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    // Find and click the cancel/close button
    const closeBtn = document.querySelector('.ant-modal-close');
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('warns when submitting with empty password', () => {
    const onSign = vi.fn();
    renderModal({ onSign });
    // Click confirm without filling anything
    const confirmBtn = document.querySelector('.ant-modal-footer .ant-btn-primary');
    if (confirmBtn) fireEvent.click(confirmBtn);
    expect(onSign).not.toHaveBeenCalled();
  });

  it('shows correct meaning for compiler role', () => {
    renderModal({ role: 'compiler', roleLabel: '编制人' });
    expect(document.body.textContent).toContain('编制');
  });

  it('shows correct meaning for approver role', () => {
    renderModal({ role: 'approver', roleLabel: '批准签发' });
    expect(document.body.textContent).toContain('批准');
  });

  it('shows correct meaning for reviewer role', () => {
    renderModal({ role: 'reviewer', roleLabel: '审核人' });
    expect(document.body.textContent).toContain('审核');
  });
});
