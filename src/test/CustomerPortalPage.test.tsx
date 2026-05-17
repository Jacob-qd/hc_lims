import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { CustomerPortalPage } from '../pages/CustomerPortalPage';

describe('CustomerPortalPage', () => {
  it('renders and shows orders', () => {
    const { container } = render(<BrowserRouter><ConfigProvider><CustomerPortalPage /></ConfigProvider></BrowserRouter>);
    expect(container.textContent).toContain('在线委托');
  });

  it('shows orders table', () => {
    const { container } = render(<BrowserRouter><ConfigProvider><CustomerPortalPage /></ConfigProvider></BrowserRouter>);
    expect(container.textContent).toContain('WT-2025-001');
  });
});
