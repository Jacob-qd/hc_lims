import React, { Suspense, useState } from 'react';
import { Layout, Spin } from 'antd';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSider } from './AppSider';
import { BreadcrumbNav } from './BreadcrumbNav';
import { RightDrawer } from './RightDrawer';

const { Content } = Layout;

const AppLayout: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader onOpenDrawer={() => setDrawerOpen(true)} />
      <Layout>
        <AppSider />
        <Layout style={{ padding: '0 24px 24px' }}>
          <BreadcrumbNav />
          <Content
            style={{
              margin: 0,
              minHeight: 280,
              background: 'var(--bg-card)',
              borderRadius: 8,
              padding: 24,
            }}
          >
            <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '40px auto' }} />}>
              <Outlet />
            </Suspense>
          </Content>
        </Layout>
      </Layout>
      <RightDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </Layout>
  );
};

export default AppLayout;
