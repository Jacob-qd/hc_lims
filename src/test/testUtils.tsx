/**
 * HC-LIMS 组件测试工具
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  return vi.spyOn(global, 'fetch').mockResolvedValue({
    ok, json: async () => ({ code: ok ? 200 : 500, data }),
    status: ok ? 200 : 500,
  } as Response);
}

export function waitForRender(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export { describe, it, expect, vi, screen, fireEvent, waitFor, userEvent };
