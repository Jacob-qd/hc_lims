import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ReservationPage } from '../pages/ReservationPage';

describe('ReservationPage', () => {
  it('渲染仪器预约页面', async () => {
    render(<BrowserRouter><ConfigProvider><ReservationPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('仪器预约')).toBeInTheDocument());
  });
});
