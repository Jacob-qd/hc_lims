import { describe, it, expect, beforeEach } from 'vitest';
import { useI18nStore } from '../stores/i18nStore';
import i18n from '../i18n';

describe('i18nStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useI18nStore.getState().setLocale('zh');
  });

  it('默认语言为中文', () => {
    expect(useI18nStore.getState().locale).toBe('zh');
    expect(i18n.language).toBe('zh');
  });

  it('中文翻译正确', () => {
    expect(useI18nStore.getState().t('app.name')).toBe('红创 LIMS');
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
    useI18nStore.getState().setLocale('en');
    useI18nStore.getState().setLocale('zh');
    expect(useI18nStore.getState().locale).toBe('zh');
    expect(useI18nStore.getState().t('app.name')).toBe('红创 LIMS');
  });

  it('支持插值', () => {
    expect(useI18nStore.getState().t('common.total', { count: 5 })).toBe('共 5 条');
    useI18nStore.getState().setLocale('en');
    expect(useI18nStore.getState().t('common.total', { count: 5 })).toBe('Total 5 items');
  });
});
