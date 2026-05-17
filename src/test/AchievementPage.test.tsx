import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AchievementPage } from '../pages/AchievementPage';

describe('AchievementPage', () => {
  it('渲染成果管理页面', async () => {
    render(<AchievementPage />);
    expect(screen.getByText('成果管理')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('添加成果')).toBeInTheDocument());
  });
});
