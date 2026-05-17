import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ResearchGroupPage } from '../pages/ResearchGroupPage';

describe('ResearchGroupPage', () => {
  it('渲染科研团队页面', async () => {
    render(<BrowserRouter><ConfigProvider><ResearchGroupPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('科研团队管理')).toBeInTheDocument());
  });
});
