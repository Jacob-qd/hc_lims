import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AIAssistantPage } from '../pages/AIAssistantPage';

describe('AIAssistantPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/ai/chat')) {
        return { ok: true, json: async () => ({ code: 200, data: { reply: '测试回复', suggestions: ['建议1'] } }) } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });
  afterEach(() => { fetchSpy.mockRestore(); });

  it('渲染AI助手页面', () => {
    render(<BrowserRouter><ConfigProvider><AIAssistantPage /></ConfigProvider></BrowserRouter>);
    expect(screen.getByText('AI 智能助手')).toBeInTheDocument();
  });

  it('发送消息并显示回复', async () => {
    render(<BrowserRouter><ConfigProvider><AIAssistantPage /></ConfigProvider></BrowserRouter>);
    const input = screen.getByPlaceholderText('输入您的问题，按Enter发送...');
    fireEvent.change(input, { target: { value: '测试' } });
    fireEvent.click(screen.getByText('发送'));
    await waitFor(() => expect(screen.getByText('测试回复')).toBeInTheDocument());
  });
});
