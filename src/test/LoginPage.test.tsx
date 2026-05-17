import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { LoginPage } from '../pages/LoginPage';

describe('LoginPage - 重新设计的登录页', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as unknown as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: unknown) => {
      if (url.includes('/api/v1/auth/login')) {
        return {
          ok: true, status: 200,
          json: async () => ({
            code: 200,
            data: {
              user: { id: '1', username: 'admin', realName: '管理员', role: 'admin', permissions: ['*'] },
              token: 'mock-token',
            },
          }),
        } as Response;
      }
      return { ok: true, json: async () => ({ code: 200, data: null }) } as Response;
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('显示系统名称', async () => {
    render(<ConfigProvider><MemoryRouter><LoginPage /></MemoryRouter></ConfigProvider>);
    await waitFor(() => expect(screen.getByText('红创检测认证')).toBeInTheDocument());
  });

  it('显示副标题', async () => {
    render(<ConfigProvider><MemoryRouter><LoginPage /></MemoryRouter></ConfigProvider>);
    await waitFor(() => expect(screen.getByText('实验室信息管理系统 HC-LIMS')).toBeInTheDocument());
  });

  it('显示所有5个角色选项', async () => {
    render(<ConfigProvider><MemoryRouter><LoginPage /></MemoryRouter></ConfigProvider>);
    await waitFor(() => {
      expect(screen.getByText('系统管理员')).toBeInTheDocument();
      expect(screen.getByText('检测技术员')).toBeInTheDocument();
      expect(screen.getByText('报告审核员')).toBeInTheDocument();
      expect(screen.getByText('采样人员')).toBeInTheDocument();
      expect(screen.getByText('客户代表')).toBeInTheDocument();
    });
  });

  it('显示用户名输入框', async () => {
    render(<ConfigProvider><MemoryRouter><LoginPage /></MemoryRouter></ConfigProvider>);
    await waitFor(() => {
      const input = document.querySelector('input[placeholder="用户名"]');
      expect(input).toBeTruthy();
    });
  });

  it('显示密码输入框', async () => {
    render(<ConfigProvider><MemoryRouter><LoginPage /></MemoryRouter></ConfigProvider>);
    await waitFor(() => {
      const input = document.querySelector('input[placeholder="密码"]');
      expect(input).toBeTruthy();
    });
  });

  it('显示"进入系统"按钮', async () => {
    render(<ConfigProvider><MemoryRouter><LoginPage /></MemoryRouter></ConfigProvider>);
    await waitFor(() => expect(screen.getByText('进入系统')).toBeInTheDocument());
  });

  it('显示测试账号提示', async () => {
    render(<ConfigProvider><MemoryRouter><LoginPage /></MemoryRouter></ConfigProvider>);
    await waitFor(() => expect(document.body.textContent).toContain('admin / admin123'));
  });
});
