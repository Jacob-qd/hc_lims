import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ELNPage } from '../pages/ELNPage';

describe('ELNPage', () => {
  it('渲染ELN页面', async () => {
    render(<ELNPage />);
    expect(screen.getByText('电子实验记录本 (ELN)')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('新建记录')).toBeInTheDocument());
  });
});
