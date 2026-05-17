import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { TeachingPage } from '../pages/TeachingPage';

describe('TeachingPage', () => {
  it('渲染教学管理页面', async () => {
    render(<BrowserRouter><ConfigProvider><TeachingPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('教学管理')).toBeInTheDocument());
  });
});
