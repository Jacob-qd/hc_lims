import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuthStore } from '../stores/authStore';

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  permissions?: string[];
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = true,
  permissions = [],
}) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [isLoading, isAuthenticated, requireAuth, navigate, location]);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (permissions.length > 0 && user) {
    const hasPermission = permissions.some((p) =>
      user.permissions.includes(p) || user.permissions.includes('*')
    );
    if (!hasPermission) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <h2>403 - 无权限访问</h2>
          <p>您没有权限访问此页面</p>
        </div>
      );
    }
  }

  return <>{children}</>;
};
