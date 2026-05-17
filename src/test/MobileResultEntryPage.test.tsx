import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MobileResultEntryPage } from '../pages/MobileResultEntryPage';

describe('MobileResultEntryPage', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any) => {
      const u = typeof url === 'string' ? url : url.toString();
      if (u.includes('/api/v1/mobile/my-tasks')) {
        return new Response(JSON.stringify({
          code: 200, data: { list: [
            { id: 'tk2', taskNo: 'TK-2025-002', sampleName: '地表水样品-1', testItem: '化学需氧量(COD)', method: 'HJ 828-2017', status: 'testing', progress: 65 }
          ] }
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      if (u.includes('/api/v1/mobile/tasks/')) {
        return new Response(JSON.stringify({ code: 200, data: {}, message: '结果已提交' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    });
  });
  afterEach(() => { vi.restoreAllMocks(); });

  it('renders result entry page with tasks', async () => {
    render(<BrowserRouter><MobileResultEntryPage /></BrowserRouter>);
    expect(await screen.findByText('结果录入')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('TK-2025-002')).toBeInTheDocument();
    });
  });

  it('opens result entry modal', async () => {
    render(<BrowserRouter><MobileResultEntryPage /></BrowserRouter>);
    await screen.findByText('结果录入');
    await waitFor(() => {
      expect(screen.getByText('录入结果')).toBeInTheDocument();
    });
    const btn = screen.getByText('录入结果');
    fireEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText('检测结果')).toBeInTheDocument();
    });
  });
});
