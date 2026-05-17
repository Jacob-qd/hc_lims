import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ResearchGroupPage } from '../pages/ResearchGroupPage';

describe('ResearchGroupPage', () => {
  it('renders and shows groups', () => {
    const { container } = render(<BrowserRouter><ConfigProvider><ResearchGroupPage /></ConfigProvider></BrowserRouter>);
    expect(container.textContent).toContain('环境分析课题组');
  });

  it('renders stats', () => {
    const { container } = render(<BrowserRouter><ConfigProvider><ResearchGroupPage /></ConfigProvider></BrowserRouter>);
    expect(container.textContent).toContain('PI');
  });
});
