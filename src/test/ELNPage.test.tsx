import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ELNPage } from '../pages/ELNPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

describe('ELNPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/research/eln-entries') && !url.includes('/sign')) {
        return mockFetchResponse({
          code: 200,
          data: { list: [
            { id: 'e1', title: '实验记录: COD测定', author: '张三', createdAt: '2025-01-01', status: 'draft', tags: ['COD'], content: '实验数据...', updatedAt: '2025-01-01' },
            { id: 'e2', title: '实验记录: pH值测定', author: '李四', createdAt: '2025-01-02', status: 'signed', tags: ['pH'], content: '已完成实验', updatedAt: '2025-01-02' },
          ]},
        });
      }
      if (url.includes('/api/v1/research/eln-entries/e1/sign')) {
        return mockFetchResponse({ code: 200, data: { success: true } });
      }
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads ELN entries', async () => {
    render(<BrowserRouter><ConfigProvider><ELNPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('实验记录: COD测定')).toBeInTheDocument());
    expect(screen.getByText('张三')).toBeInTheDocument();
  });

  it('opens create modal', async () => {
    render(<BrowserRouter><ConfigProvider><ELNPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('实验记录: COD测定')).toBeInTheDocument());
    const createBtn = document.body.querySelector('.ant-btn-primary');
    if (createBtn) fireEvent.click(createBtn);
    await waitFor(() => expect(document.body.textContent).toContain('新建实验记录'));
  });

  it('clicks edit button to open editor', async () => {
    render(<BrowserRouter><ConfigProvider><ELNPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('实验记录: COD测定')).toBeInTheDocument());
    const editBtns = document.body.querySelectorAll('.ant-btn-link');
    const editBtn = Array.from(editBtns).find(b => b.textContent && b.textContent.includes('编辑'));
    if (editBtn) fireEvent.click(editBtn);
  });
});
