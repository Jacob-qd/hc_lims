import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ELNPage } from '../pages/ELNPage';

describe('ELNPage', () => {
  it('渲染ELN页面', async () => {
    render(<BrowserRouter><ConfigProvider><ELNPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('电子实验记录本 (ELN)')).toBeInTheDocument());
  });
});
