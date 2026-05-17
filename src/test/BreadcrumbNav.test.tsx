import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BreadcrumbNav } from '../components/layout/BreadcrumbNav';

describe('BreadcrumbNav', () => {
  it('renders breadcrumb for dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <BreadcrumbNav />
      </MemoryRouter>
    );
    expect(document.body.textContent).toContain('首页');
  });

  it('renders breadcrumb for nested path', () => {
    render(
      <MemoryRouter initialEntries={['/samples']}>
        <BreadcrumbNav />
      </MemoryRouter>
    );
    expect(document.body.textContent).toContain('样品管理');
  });
});
