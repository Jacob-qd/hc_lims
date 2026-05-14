import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignaturePad, SignatureDisplay } from '../components/SignaturePad';

describe('SignaturePad', () => {
  it('渲染签名弹窗', () => {
    render(<SignaturePad visible={true} onClose={() => {}} onSign={() => {}} type="审核" />);
    expect(screen.getByText(/电子签名/)).toBeTruthy();
    expect(screen.getByText(/密码验证/)).toBeTruthy();
  });

  it('空密码时提示警告', () => {
    const onSign = vi.fn();
    render(<SignaturePad visible={true} onClose={() => {}} onSign={onSign} type="审核" />);
    fireEvent.click(screen.getByText('确认签名'));
    expect(onSign).not.toHaveBeenCalled();
  });
});

describe('SignatureDisplay', () => {
  it('渲染签名信息', () => {
    const sig = { user: '张伟', role: '检测员', timestamp: '2024-05-21 10:00', ip: '192.168.1.1', type: '审核' as const };
    render(<SignatureDisplay signature={sig} />);
    expect(screen.getByText('张伟')).toBeTruthy();
    expect(screen.getByText('(检测员)')).toBeTruthy();
  });
});
