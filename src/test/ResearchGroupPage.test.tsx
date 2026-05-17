import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ResearchGroupPage } from '../pages/ResearchGroupPage';

describe('ResearchGroupPage', () => {
  it('渲染科研团队页面', async () => {
    render(<ResearchGroupPage />);
    expect(screen.getByText('科研团队管理')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('新建团队')).toBeInTheDocument());
  });
});
