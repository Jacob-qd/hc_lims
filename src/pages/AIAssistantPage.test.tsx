import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIAssistantPage } from './AIAssistantPage';

describe('AIAssistantPage', () => {
  beforeEach(() => {
    global.fetch = vi.fn((url: string) => {
      if (url.includes('/api/v1/ai/conversations')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            code: 200,
            data: {
              list: [
                {
                  id: 'conv1',
                  title: '测试对话',
                  messages: [
                    { id: 'm1', role: 'user', content: '你好', type: 'text', timestamp: '2026-05-17 10:00:00' },
                    { id: 'm2', role: 'assistant', content: '你好！有什么可以帮您的？', type: 'text', timestamp: '2026-05-17 10:00:01' },
                  ],
                  createdAt: '2026-05-17 10:00:00',
                  updatedAt: '2026-05-17 10:00:01',
                },
              ],
            },
          }),
        } as Response);
      }
      if (url.includes('/api/v1/ai/chat')) {
        return Promise.resolve({
          json: () => Promise.resolve({
            code: 200,
            data: {
              messageId: 'm3',
              role: 'assistant',
              content: '本月检测合格率为97.1%',
              type: 'text',
              suggestedQuestions: ['不合格样品有哪些？'],
            },
          }),
        } as Response);
      }
      return Promise.resolve({ json: () => Promise.resolve({ code: 200 }) } as Response);
    });
  });

  it('renders AI assistant page', async () => {
    render(<AIAssistantPage />);
    await waitFor(() => {
      expect(screen.getByText('AI 数据分析助手')).toBeInTheDocument();
    });
  });

  it('displays conversation list', async () => {
    render(<AIAssistantPage />);
    await waitFor(() => {
      expect(screen.getByText('测试对话')).toBeInTheDocument();
    });
  });

  it('sends message and receives reply', async () => {
    render(<AIAssistantPage />);
    await waitFor(() => screen.getByPlaceholderText('输入您的问题'));

    const input = screen.getByPlaceholderText('输入您的问题');
    fireEvent.change(input, { target: { value: '合格率' } });

    const sendBtn = screen.getByText('发送');
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText('合格率')).toBeInTheDocument();
    });
  });

  it('shows quick question tags', async () => {
    render(<AIAssistantPage />);
    await waitFor(() => {
      expect(screen.getByText('本月样品检测量统计')).toBeInTheDocument();
    });
  });
});
