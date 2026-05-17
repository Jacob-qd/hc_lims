import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ResearchProjectPage } from '../pages/ResearchProjectPage';

describe('ResearchProjectPage', () => {
  it('渲染科研项目页面', async () => {
    render(<BrowserRouter><ConfigProvider><ResearchProjectPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('科研项目管理')).toBeInTheDocument());
  });
});
