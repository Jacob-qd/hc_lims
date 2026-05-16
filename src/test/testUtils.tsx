/**
 * HC-LIMS 组件测试工具
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';

export function renderWithProviders(ui: ReactNode) {
  return render(
    <BrowserRouter>
      <ConfigProvider>{ui}</ConfigProvider>
    </BrowserRouter>
  );
}

export function mockFetch(data: unknown, ok = true) {
  return vi.spyOn(globalThis as any, 'fetch').mockResolvedValue({
    ok, json: async () => ({ code: ok ? 200 : 500, data }),
    status: ok ? 200 : 500,
  } as Response);
}

export function waitForRender(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { describe, it, expect, vi, screen };
