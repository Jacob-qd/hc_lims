import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ReservationPage } from '../pages/ReservationPage';

describe('ReservationPage', () => {
  it('渲染仪器预约页面', async () => {
    render(<ReservationPage />);
    expect(screen.getByText('仪器预约')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('新建预约')).toBeInTheDocument());
  });
});
