import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AIAssistantPage } from '../pages/AIAssistantPage';

describe('AIAssistantPage', () => {
  it('渲染AI助手页面', async () => {
    render(<BrowserRouter><ConfigProvider><AIAssistantPage /></ConfigProvider></BrowserRouter>);
    expect(screen.getByText('AI 智能助手')).toBeInTheDocument();
  });

  it('显示快捷问题标签', () => {
    render(<BrowserRouter><ConfigProvider><AIAssistantPage /></ConfigProvider></BrowserRouter>);
    expect(screen.getByText('本周有哪些不合格样品？')).toBeInTheDocument();
  });
});
