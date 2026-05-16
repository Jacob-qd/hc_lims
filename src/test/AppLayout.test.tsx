import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import AppLayout from '../components/layout/AppLayout';

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { realName: '测试用户', avatar: '' },
    logout: vi.fn(),
  }),
}));

vi.mock('../stores/themeStore', () => ({
  useThemeStore: () => ({
    theme: 'light',
    toggleTheme: vi.fn(),
  }),
}));

vi.mock('../stores/i18nStore', () => ({
  useI18nStore: Object.assign(
    () => ({ locale: 'zh', setLocale: vi.fn() }),
    { getState: () => ({ locale: 'zh', setLocale: vi.fn() }) }
  ),
}));

describe('AppLayout', () => {
  it('renders layout with header and sider', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ConfigProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route path="dashboard" element={<div>Dashboard</div>} />
            </Route>
          </Routes>
        </ConfigProvider>
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('红创 LIMS')).toBeInTheDocument());
    expect(screen.getByText('测试用户')).toBeInTheDocument();
  });
});
