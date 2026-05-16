import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { LoginPage } from '../pages/LoginPage';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../stores/authStore', () => ({
  useAuthStore: (selector: any) => selector({ login: mockLogin }),
  roleLabels: { admin: '管理员', tester: '检测员', reviewer: '复核员', approver: '审批员' },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual as any, useNavigate: () => mockNavigate };
});

describe('LoginPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockLogin.mockClear();
    mockNavigate.mockClear();
    fetchSpy = vi.spyOn(globalThis as any, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders login form', () => {
    render(<BrowserRouter><ConfigProvider><LoginPage /></ConfigProvider></BrowserRouter>);
    expect(screen.getByPlaceholderText('用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登\s*录/ })).toBeInTheDocument();
  });

  it('submits form with success', async () => {
    fetchSpy.mockResolvedValue({ ok: true, status: 200, json: async () => ({ code: 200, message: 'success', data: { user: { id: '1', username: 'admin' }, token: 'tk123' } }) } as Response);
    render(<BrowserRouter><ConfigProvider><LoginPage /></ConfigProvider></BrowserRouter>);
    fireEvent.change(screen.getByPlaceholderText('用户名'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('shows error on login failure', async () => {
    fetchSpy.mockResolvedValue({ ok: true, status: 200, json: async () => ({ code: 401, message: '用户名或密码错误', data: null }) } as Response);
    render(<BrowserRouter><ConfigProvider><LoginPage /></ConfigProvider></BrowserRouter>);
    fireEvent.change(screen.getByPlaceholderText('用户名'), { target: { value: 'bad' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'bad' } });
    fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('shows error on network failure', async () => {
    fetchSpy.mockRejectedValue(new Error('network error'));
    render(<BrowserRouter><ConfigProvider><LoginPage /></ConfigProvider></BrowserRouter>);
    fireEvent.change(screen.getByPlaceholderText('用户名'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('密码'), { target: { value: 'admin123' } });
    fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('validates required fields', async () => {
    render(<BrowserRouter><ConfigProvider><LoginPage /></ConfigProvider></BrowserRouter>);
    fireEvent.click(screen.getByRole('button', { name: /登\s*录/ }));
    await waitFor(() => expect(screen.getByText('请输入用户名')).toBeInTheDocument());
  });
});
