import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RightDrawer } from '../components/layout/RightDrawer';

describe('RightDrawer', () => {
  it('renders notifications when open', () => {
    render(<RightDrawer open={true} onClose={() => {}} />);
    expect(screen.getByText('通知中心')).toBeInTheDocument();
    expect(screen.getByText('样品 SP-2025-001 已入库')).toBeInTheDocument();
  });
});
