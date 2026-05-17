import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AIPredictionPage } from '../pages/AIPredictionPage';

describe('AIPredictionPage', () => {
  it('渲染AI预测页面', async () => {
    render(<AIPredictionPage />);
    await waitFor(() => expect(screen.getByText('综合风险评分')).toBeInTheDocument());
  });
});
