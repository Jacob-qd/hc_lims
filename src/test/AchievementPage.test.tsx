import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AchievementPage } from '../pages/AchievementPage';

describe('AchievementPage', () => {
  it('渲染成果管理页面', async () => {
    render(<BrowserRouter><ConfigProvider><AchievementPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('成果管理')).toBeInTheDocument());
  });
});
