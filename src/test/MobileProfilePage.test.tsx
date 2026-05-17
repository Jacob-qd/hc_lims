import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileProfilePage } from '../pages/MobileProfilePage';

describe('MobileProfilePage', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/api/v1/mobile/profile')) {
        return new Response(JSON.stringify({
          code: 200, data: { id: '1', username: 'admin', realName: '管理员', role: 'admin', roleLabel: '系统管理员', department: '技术部', phone: '13800138001', email: 'admin@hc-lims.com', status: 'active' }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.includes('/api/v1/mobile/messages')) {
        return new Response(JSON.stringify({ code: 200, data: { list: [] } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders profile page', async () => {
    render(<BrowserRouter><MobileProfilePage /></BrowserRouter>);
    expect(await screen.findByText('我的')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('消息通知')).toBeInTheDocument();
    });
  });

  it('shows menu items', async () => {
    render(<BrowserRouter><MobileProfilePage /></BrowserRouter>);
    await screen.findByText('我的');
    await waitFor(() => {
      expect(screen.getByText('消息通知')).toBeInTheDocument();
      expect(screen.getByText('我的资质')).toBeInTheDocument();
      expect(screen.getByText('培训记录')).toBeInTheDocument();
      expect(screen.getByText('设置')).toBeInTheDocument();
    });
  });
});
