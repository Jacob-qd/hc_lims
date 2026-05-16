import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { SettingsPage } from '../pages/SettingsPage';

vi.mock('../stores/labTypeStore', () => ({
  useLabTypeStore: () => ({ labType: 'commercial', setLabType: vi.fn() }),
}));

describe('SettingsPage', () => {
  it('renders settings', () => {
    render(<BrowserRouter><ConfigProvider><SettingsPage /></ConfigProvider></BrowserRouter>);
    expect(screen.getByText('系统管理')).toBeInTheDocument();
    expect(screen.getByText('用户管理')).toBeInTheDocument();
  });

  it('switches tabs', async () => {
    render(<BrowserRouter><ConfigProvider><SettingsPage /></ConfigProvider></BrowserRouter>);
    fireEvent.click(screen.getByText('角色权限'));
    await waitFor(() => expect(screen.getByText('权限配置矩阵')).toBeInTheDocument());
    fireEvent.click(screen.getByText('系统配置'));
    await waitFor(() => expect(screen.getByText('实验室类型')).toBeInTheDocument());
  });
});
