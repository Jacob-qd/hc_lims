import '@testing-library/jest-dom';
import { beforeEach } from 'vitest';
import i18n from '../i18n';

beforeEach(() => {
  i18n.changeLanguage('zh');
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
