import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RouteGuard } from '../components/RouteGuard';

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { permissions: ['*'] },
  }),
}));

describe('RouteGuard', () => {
  it('renders children when authenticated', () => {
    render(
      <MemoryRouter>
        <RouteGuard>
          <div>Protected Content</div>
        </RouteGuard>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
