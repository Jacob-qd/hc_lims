import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ResearchProjectPage } from '../pages/ResearchProjectPage';

describe('ResearchProjectPage', () => {
  it('渲染科研项目页面', async () => {
    render(<ResearchProjectPage />);
    expect(screen.getByText('科研项目管理')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('新建项目')).toBeInTheDocument());
  });
});
