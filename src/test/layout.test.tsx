import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { AppSider } from '../components/layout/AppSider';
import { RightDrawer } from '../components/layout/RightDrawer';
import AppLayout from '../components/layout/AppLayout';
import { useAuthStore } from '../stores/authStore';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as any),
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/dashboard' }),
    Outlet: () => <div data-testid="outlet">Outlet</div>,
  };
});

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <MemoryRouter>
      <ConfigProvider>{ui}</ConfigProvider>
    </MemoryRouter>
  );
}

describe('Layout Components', () => {
  it('AppHeader renders', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['*'] },
    });
    const { container } = renderWithProviders(<AppHeader collapsed={false} setCollapsed={() => {}} />);
    expect(container.textContent).toContain('红创');
  });

  it('AppSider renders', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['*'] },
    });
    const { container } = renderWithProviders(<AppSider collapsed={false} />);
    expect(container.textContent).toContain('首页');
  });

  it('RightDrawer renders', () => {
    const { baseElement } = renderWithProviders(<RightDrawer open={true} onClose={() => {}} />);
    expect(baseElement.textContent.length).toBeGreaterThan(0);
  });

  it('AppLayout renders', () => {
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['*'] },
    });
    const { container } = renderWithProviders(<AppLayout />);
    expect(container.querySelector('.ant-layout')).toBeTruthy();
  });
});
