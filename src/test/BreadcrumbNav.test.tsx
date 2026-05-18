import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { BreadcrumbNav } from '../components/layout/BreadcrumbNav';

describe('BreadcrumbNav', () => {
  it('renders home icon on dashboard', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ConfigProvider><BreadcrumbNav /></ConfigProvider>
      </MemoryRouter>
    );
    // HomeOutlined icon renders with aria-label="home"
    expect(container.innerHTML).toContain('anticon-home');
  });

  it('renders sample page label', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/samples']}>
        <ConfigProvider><BreadcrumbNav /></ConfigProvider>
      </MemoryRouter>
    );
    expect(container.textContent).toContain('样品管理');
  });

  it('renders task page label', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/tasks']}>
        <ConfigProvider><BreadcrumbNav /></ConfigProvider>
      </MemoryRouter>
    );
    expect(container.textContent).toContain('检测管理');
  });

  it('renders unknown nested path as URL', () => {
    render(
      <MemoryRouter initialEntries={['/research/groups']}>
        <ConfigProvider><BreadcrumbNav /></ConfigProvider>
      </MemoryRouter>
    );
    expect(document.body.textContent).toContain('/research/groups');
  });
});
