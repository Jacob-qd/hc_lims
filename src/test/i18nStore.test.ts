import { describe, it, expect } from 'vitest';
import { useI18nStore } from '../stores/i18nStore';

describe('i18nStore', () => {
  it('默认语言为中文', () => {
    expect(useI18nStore.getState().locale).toBe('zh');
  });

  it('中文翻译正确', () => {
    expect(useI18nStore.getState().t('app.name')).toBe('红创LIMS');
    expect(useI18nStore.getState().t('nav.dashboard')).toBe('首页');
    expect(useI18nStore.getState().t('action.create')).toBe('新建');
    expect(useI18nStore.getState().t('login.title')).toBe('登录');
  });

  it('切换英文后翻译正确', () => {
    useI18nStore.getState().setLocale('en');
    expect(useI18nStore.getState().locale).toBe('en');
    expect(useI18nStore.getState().t('app.name')).toBe('HC-LIMS');
    expect(useI18nStore.getState().t('nav.dashboard')).toBe('Dashboard');
    expect(useI18nStore.getState().t('action.create')).toBe('Create');
    expect(useI18nStore.getState().t('login.title')).toBe('Sign In');
  });

  it('不存在的key返回key本身', () => {
    expect(useI18nStore.getState().t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('切换回中文', () => {
    useI18nStore.getState().setLocale('zh');
    expect(useI18nStore.getState().locale).toBe('zh');
  });
});
