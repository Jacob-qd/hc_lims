import { create } from 'zustand';

type Locale = 'zh' | 'en';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const messages: Record<Locale, Record<string, string>> = {
  zh: {
    'app.name': '红创LIMS',
    'app.subtitle': '实验室信息管理系统',
    'nav.dashboard': '首页',
    'nav.samples': '样品管理',
    'nav.tasks': '检测管理',
    'nav.reports': '报告管理',
    'nav.quality': '质量控制',
    'nav.instruments': '仪器管理',
    'nav.inventory': '库存管理',
    'nav.methods': '方法管理',
    'nav.personnel': '人员与培训',
    'nav.clients': '客户管理',
    'nav.settings': '系统管理',
    'action.create': '新建',
    'action.edit': '编辑',
    'action.delete': '删除',
    'action.search': '搜索',
    'action.save': '保存',
    'action.cancel': '取消',
    'action.confirm': '确认',
    'status.active': '正常',
    'status.inactive': '停用',
    'status.pending': '待处理',
    'status.completed': '已完成',
    'common.total': '共 {count} 条',
    'common.loading': '加载中...',
    'common.empty': '暂无数据',
    'common.error': '操作失败',
    'common.success': '操作成功',
    'login.title': '登录',
    'login.username': '用户名',
    'login.password': '密码',
    'login.button': '登录',
    'login.test': '测试账号: admin / admin123',
  },
  en: {
    'app.name': 'HC-LIMS',
    'app.subtitle': 'Laboratory Information Management System',
    'nav.dashboard': 'Dashboard',
    'nav.samples': 'Samples',
    'nav.tasks': 'Tasks',
    'nav.reports': 'Reports',
    'nav.quality': 'Quality',
    'nav.instruments': 'Instruments',
    'nav.inventory': 'Inventory',
    'nav.methods': 'Methods',
    'nav.personnel': 'Personnel',
    'nav.clients': 'Clients',
    'nav.settings': 'Settings',
    'action.create': 'Create',
    'action.edit': 'Edit',
    'action.delete': 'Delete',
    'action.search': 'Search',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.pending': 'Pending',
    'status.completed': 'Completed',
    'common.total': 'Total {count}',
    'common.loading': 'Loading...',
    'common.empty': 'No data',
    'common.error': 'Operation failed',
    'common.success': 'Operation successful',
    'login.title': 'Sign In',
    'login.username': 'Username',
    'login.password': 'Password',
    'login.button': 'Sign In',
    'login.test': 'Test: admin / admin123',
  },
};

export const useI18nStore = create<I18nState>((set, get) => ({
  locale: (localStorage.getItem('hc_lims_locale') as Locale) || 'zh',
  setLocale: (locale) => {
    localStorage.setItem('hc_lims_locale', locale);
    set({ locale });
  },
  t: (key) => {
    const msg = messages[get().locale]?.[key];
    return msg || messages.zh[key] || key;
  },
}));
