import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { RouteGuard } from '../components/RouteGuard';
import { BreadcrumbNav } from '../components/BreadcrumbNav';
import { BatchActions, RowSelectionPreset } from '../components/BatchActions';
import { BarcodePreview, generateSampleBarcode, BarcodePrintModal, BatchBarcodePrint } from '../components/BarcodeLabel';
import { CustomWorkspace } from '../components/CustomWorkspace';
import { SignaturePad, SignatureDisplay } from '../components/SignaturePad';
import { useAuthStore } from '../stores/authStore';

function renderWithRouter(ui: React.ReactNode, initialEntries = ['/dashboard']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <ConfigProvider>{ui}</ConfigProvider>
    </MemoryRouter>
  );
}

describe('RouteGuard', () => {
  beforeEach(() => {
    useAuthStore.setState({ isAuthenticated: false, isLoading: false, user: null });
  });

  it('未认证时返回null', () => {
    const { container } = renderWithRouter(
      <RouteGuard requireAuth={true}><div>protected</div></RouteGuard>
    );
    expect(container.textContent).not.toContain('protected');
  });

  it('加载中显示spin', () => {
    useAuthStore.setState({ isLoading: true });
    const { container } = renderWithRouter(
      <RouteGuard requireAuth={true}><div>protected</div></RouteGuard>
    );
    expect(container.querySelector('.ant-spin')).toBeTruthy();
  });

  it('已认证显示子元素', () => {
    useAuthStore.setState({ isAuthenticated: true, isLoading: false, user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['*'] } });
    renderWithRouter(
      <RouteGuard requireAuth={true}><div data-testid="protected">protected</div></RouteGuard>
    );
    expect(screen.getByTestId('protected')).toBeTruthy();
  });

  it('无需认证时直接显示', () => {
    renderWithRouter(
      <RouteGuard requireAuth={false}><div data-testid="public">public</div></RouteGuard>
    );
    expect(screen.getByTestId('public')).toBeTruthy();
  });

  it('权限不足显示403', () => {
    useAuthStore.setState({ isAuthenticated: true, isLoading: false, user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['sample:view'] } });
    renderWithRouter(
      <RouteGuard requireAuth={true} permissions={['report:approve']}><div>admin</div></RouteGuard>
    );
    expect(screen.getByText('403 - 无权限访问')).toBeTruthy();
  });

  it('拥有权限显示内容', () => {
    useAuthStore.setState({ isAuthenticated: true, isLoading: false, user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['sample:view', 'report:approve'] } });
    renderWithRouter(
      <RouteGuard requireAuth={true} permissions={['report:approve']}><div data-testid="content">content</div></RouteGuard>
    );
    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('通配符权限通过', () => {
    useAuthStore.setState({ isAuthenticated: true, isLoading: false, user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['*'] } });
    renderWithRouter(
      <RouteGuard requireAuth={true} permissions={['anything']}><div data-testid="content">content</div></RouteGuard>
    );
    expect(screen.getByTestId('content')).toBeTruthy();
  });
});

describe('BreadcrumbNav', () => {
  it('渲染首页面包屑', () => {
    renderWithRouter(<BreadcrumbNav />, ['/dashboard']);
    expect(screen.getByText('首页')).toBeTruthy();
  });

  it('渲染样品管理面包屑', () => {
    renderWithRouter(<BreadcrumbNav />, ['/samples']);
    expect(screen.getByText('样品管理')).toBeTruthy();
  });

  it('渲染嵌套路由面包屑', () => {
    renderWithRouter(<BreadcrumbNav />, ['/research/groups']);
    expect(screen.getByText('课题组管理')).toBeTruthy();
  });
});

describe('BatchActions', () => {
  it('未选择时显示导入导出', () => {
    renderWithRouter(<BatchActions selectedCount={0} onBatchExport={() => {}} onBatchImport={() => {}} />);
    expect(screen.getByText('导入')).toBeTruthy();
    expect(screen.getByText('导出')).toBeTruthy();
  });

  it('选择时显示批量操作', () => {
    renderWithRouter(
      <BatchActions
        selectedCount={3}
        onBatchStatus={() => {}}
        onBatchDelete={() => {}}
        onBatchExport={() => {}}
        statusOptions={[{ value: 'active', label: '启用', color: 'green' }]}
      />
    );
    expect(screen.getByText('已选 3 项')).toBeTruthy();
    expect(screen.getByText('批量状态')).toBeTruthy();
    expect(screen.getByText('删除')).toBeTruthy();
    expect(screen.getByText('导出选中')).toBeTruthy();
  });

  it('RowSelectionPreset有固定宽度', () => {
    expect(RowSelectionPreset.columnWidth).toBe(40);
    expect(RowSelectionPreset.fixed).toBe(true);
  });
});

describe('BarcodeLabel', () => {
  it('BarcodePreview渲染不崩溃', () => {
    const { container } = renderWithRouter(<BarcodePreview code="SMP202405210001" label="测试样品" />);
    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('生成样品条码', () => {
    const code = generateSampleBarcode(1);
    expect(code.startsWith('SMP')).toBe(true);
    expect(code.length).toBeGreaterThan(10);
  });

  it('BarcodePrintModal渲染', () => {
    renderWithRouter(<BarcodePrintModal visible={true} onClose={() => {}} code="SMP001" label="测试" type="sample" />);
    expect(screen.getByText('条码预览')).toBeTruthy();
    expect(screen.getByText('打印')).toBeTruthy();
    expect(screen.getByText('关闭')).toBeTruthy();
  });

  it('BatchBarcodePrint渲染', () => {
    renderWithRouter(
      <BatchBarcodePrint visible={true} onClose={() => {}} codes={[{ code: 'SMP001', label: '样品1' }, { code: 'SMP002', label: '样品2' }]} />
    );
    expect(screen.getByText('批量条码打印')).toBeTruthy();
    expect(screen.getByText('打印全部 (2张)')).toBeTruthy();
  });
});

describe('CustomWorkspace', () => {
  it('渲染自定义工作台', () => {
    renderWithRouter(
      <CustomWorkspace open={true} onClose={() => {}} onSave={() => {}} initialVisible={['kpi', 'recent_samples']} />
    );
    expect(screen.getByText('自定义工作台')).toBeTruthy();
    expect(screen.getByText('保存布局')).toBeTruthy();
    expect(screen.getByText('KPI 卡片')).toBeTruthy();
  });

  it('切换显示状态', () => {
    renderWithRouter(
      <CustomWorkspace open={true} onClose={() => {}} onSave={() => {}} initialVisible={['kpi']} />
    );
    const switches = document.querySelectorAll('.ant-switch');
    expect(switches.length).toBeGreaterThan(0);
  });
});

describe('SignaturePad', () => {
  it('渲染签名弹窗', () => {
    renderWithRouter(
      <SignaturePad visible={true} onClose={() => {}} onSign={() => {}} type="编制" userName="张伟" userRole="检测员" />
    );
    expect(screen.getByText('电子签名 — 编制')).toBeTruthy();
    expect(screen.getByText('张伟')).toBeTruthy();
    expect(screen.getByText('检测员')).toBeTruthy();
  });

  it('SignatureDisplay渲染', () => {
    const sig = { user: '张伟', role: '检测员', timestamp: '2026-05-15 10:00', ip: '192.168.1.1', type: '编制' as const };
    renderWithRouter(<SignatureDisplay signature={sig} />);
    expect(screen.getByText('编制')).toBeTruthy();
    expect(screen.getByText('张伟')).toBeTruthy();
  });
});
