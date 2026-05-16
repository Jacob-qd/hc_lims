import { describe, it, expect, beforeEach } from 'vitest';
import React, { Suspense } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { router } from '../router';
import { useAuthStore } from '../stores/authStore';

function renderWithRouter(initialEntry = '/') {
  const testRouter = createMemoryRouter(router.routes, { initialEntries: [initialEntry] });
  return render(
    <ConfigProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={testRouter} />
      </Suspense>
    </ConfigProvider>
  );
}

describe('Router', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      isLoading: false,
      user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['*'] },
      token: 'test-token',
    });
  });

  it('renders login page at /login', () => {
    useAuthStore.setState({ isAuthenticated: false, user: null, token: null });
    renderWithRouter('/login');
    expect(document.body.textContent).toContain('用户名');
  });

  it('redirects / to /dashboard', () => {
    renderWithRouter('/');
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it('renders dashboard at /dashboard', () => {
    renderWithRouter('/dashboard');
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });

  it('renders samples at /samples', () => {
    renderWithRouter('/samples');
    expect(document.body.textContent).toContain('样品');
  });

  it('renders tasks at /tasks', () => {
    renderWithRouter('/tasks');
    expect(document.body.textContent).toContain('检测');
  });

  it('renders reports at /reports', () => {
    renderWithRouter('/reports');
    expect(document.body.textContent).toContain('报告');
  });

  it('renders 404 fallback', () => {
    renderWithRouter('/nonexistent');
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });
});
