import { describe, it, expect } from 'vitest';
import { router } from '../router';

describe('Router configuration', () => {
  it('has login route', () => {
    const loginRoute = router.routes.find((r: any) => r.path === '/login');
    expect(loginRoute).toBeDefined();
  });

  it('has root route with children', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.children?.length).toBeGreaterThan(10);
  });

  it('has dashboard route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const dashboard = rootRoute.children.find((c: any) => c.path === 'dashboard');
    expect(dashboard).toBeDefined();
  });

  it('has wildcard fallback', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const wildcard = rootRoute.children.find((c: any) => c.path === '*');
    expect(wildcard).toBeDefined();
  });

  it('has samples route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'samples');
    expect(route).toBeDefined();
  });

  it('has tasks route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'tasks');
    expect(route).toBeDefined();
  });

  it('has reports route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'reports');
    expect(route).toBeDefined();
  });

  it('has quality route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'quality');
    expect(route).toBeDefined();
  });

  it('has instruments route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'instruments');
    expect(route).toBeDefined();
  });

  it('has inventory route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'inventory');
    expect(route).toBeDefined();
  });

  it('has methods route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'methods');
    expect(route).toBeDefined();
  });

  it('has personnel route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'personnel');
    expect(route).toBeDefined();
  });

  it('has settings route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'settings');
    expect(route).toBeDefined();
  });

  it('has coc route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'coc');
    expect(route).toBeDefined();
  });

  it('has workflow route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'workflow');
    expect(route).toBeDefined();
  });

  it('has report engine route', () => {
    const rootRoute = router.routes.find((r: any) => r.path === '/') as any;
    const route = rootRoute.children.find((c: any) => c.path === 'reports/engine');
    expect(route).toBeDefined();
  });
});
