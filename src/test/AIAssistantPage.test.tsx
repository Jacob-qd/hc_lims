import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIAssistantPage } from '../pages/AIAssistantPage';

describe('AIAssistantPage', () => {
  it('渲染AI助手页面', () => {
    render(<AIAssistantPage />);
    expect(screen.getByText('AI 智能助手')).toBeInTheDocument();
    expect(screen.getByText('HC-LIMS AI助手')).toBeInTheDocument();
  });

  it('显示快捷问题标签', () => {
    render(<AIAssistantPage />);
    expect(screen.getByText('本周有哪些不合格样品？')).toBeInTheDocument();
    expect(screen.getByText('生成上周报告统计')).toBeInTheDocument();
  });

  it('发送消息并显示回复', async () => {
    render(<AIAssistantPage />);
    const input = screen.getByPlaceholderText('输入您的问题，按Enter发送...');
    fireEvent.change(input, { target: { value: '测试消息' } });
    fireEvent.click(screen.getByText('发送'));
    await waitFor(() => {
      expect(screen.getByText('您')).toBeInTheDocument();
    });
  });
});
