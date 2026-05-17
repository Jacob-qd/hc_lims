import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { TaskResultEntry } from '../pages/TaskResultEntry';

describe('TaskResultEntry', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as unknown as { fetch: typeof globalThis.fetch }, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ code: 200, data: [], message: 'success' }),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders without crashing', async () => {
    render(
      <BrowserRouter>
        <ConfigProvider>
          <TaskResultEntry />
        </ConfigProvider>
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    }, { timeout: 2000 });
  });
});
