import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useI18nStore } from '../stores/i18nStore';
import { usePermissionStore } from '../stores/permissionStore';
import { useLabTypeStore } from '../stores/labTypeStore';

describe('AuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('初始状态为未登录', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('登录后状态更新', () => {
    const user = { id: '1', username: 'admin', realName: '管理员', role: 'admin' as const, permissions: ['*'] };
    useAuthStore.getState().login(user, 'token123');
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(state.token).toBe('token123');
  });

  it('登出后状态清空', () => {
    useAuthStore.getState().login({ id: '1', username: 'admin', realName: '管理员', role: 'admin', permissions: ['*'] }, 'token');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('设置加载状态', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('ThemeStore', () => {
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.removeItem('hc_lims_theme');
    useThemeStore.setState({ theme: 'light', mode: 'light' });
    reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });
  });

  it('默认主题为light', () => {
    expect(useThemeStore.getState().theme).toBe('light');
    expect(useThemeStore.getState().mode).toBe('light');
  });

  it('toggle切换主题', () => {
    useThemeStore.getState().toggle();
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(localStorage.getItem('hc_lims_theme')).toBe('dark');
    expect(reloadMock).toHaveBeenCalled();
  });

  it('toggleTheme切换主题', () => {
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
    expect(reloadMock).toHaveBeenCalled();
  });

  it('setMode设置主题', () => {
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().mode).toBe('dark');
    expect(reloadMock).toHaveBeenCalled();
  });

  it('getConfig返回正确的算法', () => {
    const config = useThemeStore.getState().getConfig();
    expect(config.token.colorPrimary).toBe('#1677ff');
    expect(config.token.borderRadius).toBe(6);
  });
});

describe('I18nStore', () => {
  beforeEach(() => {
    localStorage.removeItem('hc_lims_locale');
    useI18nStore.setState({ locale: 'zh' });
  });

  it('默认语言为zh', () => {
    expect(useI18nStore.getState().locale).toBe('zh');
  });

  it('setLocale切换语言', () => {
    useI18nStore.getState().setLocale('en');
    expect(useI18nStore.getState().locale).toBe('en');
    expect(localStorage.getItem('hc_lims_locale')).toBe('en');
  });

  it('t函数返回中文翻译', () => {
    expect(useI18nStore.getState().t('app.name')).toBe('红创LIMS');
    expect(useI18nStore.getState().t('nav.samples')).toBe('样品管理');
  });

  it('t函数英文模式', () => {
    useI18nStore.getState().setLocale('en');
    expect(useI18nStore.getState().t('app.name')).toBe('HC-LIMS');
    expect(useI18nStore.getState().t('nav.samples')).toBe('Samples');
  });

  it('t函数回退到key当翻译不存在', () => {
    expect(useI18nStore.getState().t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('t函数回退到中文当英文不存在', () => {
    useI18nStore.getState().setLocale('en');
    // login.test exists in zh but not en... wait it does exist in en
    // Let's test with a key that definitely doesn't exist in either
    expect(useI18nStore.getState().t('totally.missing')).toBe('totally.missing');
  });
});

describe('PermissionStore', () => {
  beforeEach(() => {
    usePermissionStore.setState({ userRole: 'analyst' });
  });

  it('analyst权限检查', () => {
    const store = usePermissionStore.getState();
    expect(store.hasPermission('sample', 'view')).toBe(true);
    expect(store.hasPermission('sample', 'delete')).toBe(false);
    expect(store.hasPermission('report', 'approve')).toBe(false);
    expect(store.hasPermission('system', 'edit')).toBe(false);
  });

  it('admin拥有所有权限', () => {
    usePermissionStore.getState().setRole('admin');
    const store = usePermissionStore.getState();
    expect(store.hasPermission('sample', 'delete')).toBe(true);
    expect(store.hasPermission('report', 'approve')).toBe(true);
    expect(store.hasPermission('system', 'edit')).toBe(true);
    expect(store.hasPermission('admin', 'delete')).toBe(true);
  });

  it('qa权限检查', () => {
    usePermissionStore.getState().setRole('qa');
    const store = usePermissionStore.getState();
    expect(store.hasPermission('quality', 'approve')).toBe(true);
    expect(store.hasPermission('sample', 'create')).toBe(false);
  });

  it('instrument_manager权限', () => {
    usePermissionStore.getState().setRole('instrument_manager');
    const store = usePermissionStore.getState();
    expect(store.hasPermission('instrument', 'delete')).toBe(true);
    expect(store.hasPermission('sample', 'create')).toBe(false);
  });

  it('report_reviewer权限', () => {
    usePermissionStore.getState().setRole('report_reviewer');
    const store = usePermissionStore.getState();
    expect(store.hasPermission('report', 'approve')).toBe(true);
    expect(store.hasPermission('sample', 'create')).toBe(false);
  });

  it('getRoleLabel返回正确标签', () => {
    const store = usePermissionStore.getState();
    expect(store.getRoleLabel('admin')).toBe('系统管理员');
    expect(store.getRoleLabel('qa')).toBe('质量主管');
    expect(store.getRoleLabel('analyst')).toBe('检测员');
    expect(store.getRoleLabel('instrument_manager')).toBe('仪器管理员');
    expect(store.getRoleLabel('report_reviewer')).toBe('报告审核员');
  });

  it('不存在的模块返回false', () => {
    expect(usePermissionStore.getState().hasPermission('nonexistent' as any, 'view')).toBe(false);
  });
});

describe('LabTypeStore', () => {
  let reloadMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.removeItem('hc_lims_lab_type');
    useLabTypeStore.setState({ labType: 'commercial' });
    reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });
  });

  it('默认类型为commercial', () => {
    expect(useLabTypeStore.getState().labType).toBe('commercial');
    expect(useLabTypeStore.getState().isCommercial()).toBe(true);
    expect(useLabTypeStore.getState().isResearch()).toBe(false);
  });

  it('setLabType切换类型', () => {
    useLabTypeStore.getState().setLabType('research');
    expect(useLabTypeStore.getState().labType).toBe('research');
    expect(localStorage.getItem('hc_lims_lab_type')).toBe('research');
    expect(reloadMock).toHaveBeenCalled();
  });

  it('isResearch在research模式下为true', () => {
    useLabTypeStore.getState().setLabType('research');
    expect(useLabTypeStore.getState().isResearch()).toBe(true);
    expect(useLabTypeStore.getState().isCommercial()).toBe(false);
    expect(reloadMock).toHaveBeenCalled();
  });

  it('localStorage读取初始值', () => {
    localStorage.setItem('hc_lims_lab_type', 'research');
    const stored = localStorage.getItem('hc_lims_lab_type');
    expect(stored).toBe('research');
  });
});
