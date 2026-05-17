import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { TeachingPage } from '../pages/TeachingPage';

describe('TeachingPage', () => {
  it('渲染教学管理页面', async () => {
    render(<TeachingPage />);
    expect(screen.getByText('教学管理')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('新建课程')).toBeInTheDocument());
  });
});
