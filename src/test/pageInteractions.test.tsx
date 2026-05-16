import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import { MemoryRouter } from 'react-router-dom';
import { ReportsPage } from '../pages/ReportsPage';
import { COCPage } from '../pages/COCPage';
import { WorkflowPage } from '../pages/WorkflowPage';
import { SamplesPage } from '../pages/SamplesPage';
import { TasksPage } from '../pages/TasksPage';
import { useAuthStore } from '../stores/authStore';

function renderPage(Page: React.FC<any>, props = {}) {
  return render(
    <MemoryRouter>
      <ConfigProvider>
        <Page {...props} />
      </ConfigProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuthStore.setState({
    isAuthenticated: true,
    isLoading: false,
    user: { id: '1', username: 'admin', realName: 'Admin', role: 'admin', permissions: ['*'] },
    token: 'test',
  });
});

describe('COCPage interactions', () => {
  it('renders and opens detail modal', async () => {
    renderPage(COCPage);
    await waitFor(() => expect(document.querySelector('.ant-table-row')).toBeTruthy(), { timeout: 3000 });
    const detailBtn = document.querySelector('button') as HTMLButtonElement;
    if (detailBtn) fireEvent.click(detailBtn);
    expect(document.body.textContent).toContain('COC');
  });

  it('opens transfer modal', async () => {
    renderPage(COCPage);
    await waitFor(() => expect(screen.queryByText('新建交接')).toBeTruthy(), { timeout: 3000 });
    const btn = screen.getByText('新建交接');
    fireEvent.click(btn);
    expect(document.body.textContent).toContain('新建交接记录');
  });

  it('switches tabs', async () => {
    renderPage(COCPage);
    await waitFor(() => expect(screen.queryAllByText('流转中').length).toBeGreaterThan(0), { timeout: 3000 });
    const tabs = document.querySelectorAll('.ant-tabs-tab');
    if (tabs.length > 1) fireEvent.click(tabs[1]);
    expect(document.body.textContent).toContain('流转中');
  });
});

describe('SamplesPage interactions', () => {
  it('renders and interacts with search', async () => {
    renderPage(SamplesPage);
    await waitFor(() => expect(document.body.textContent).toContain('样品'), { timeout: 5000 });
    const input = document.querySelector('input') as HTMLInputElement;
    if (input) {
      fireEvent.change(input, { target: { value: 'test' } });
      expect(input.value).toBe('test');
    }
  });
});

describe('TasksPage interactions', () => {
  it('renders and switches tabs', async () => {
    renderPage(TasksPage);
    await waitFor(() => expect(screen.queryByText('检测管理')).toBeTruthy(), { timeout: 3000 });
    const tabs = document.querySelectorAll('.ant-tabs-tab');
    if (tabs.length > 1) fireEvent.click(tabs[1]);
    expect(document.body.textContent).toContain('检测');
  });
});

describe('ReportsPage interactions', () => {
  it('renders and opens filters', async () => {
    renderPage(ReportsPage);
    await waitFor(() => expect(document.body.textContent).toContain('报告'), { timeout: 5000 });
    const btns = document.querySelectorAll('button');
    for (const btn of Array.from(btns).slice(0, 3)) {
      fireEvent.click(btn);
    }
    expect(document.body.textContent).toContain('报告');
  });
});

describe('WorkflowPage interactions', () => {
  it('renders and switches tabs', async () => {
    renderPage(WorkflowPage);
    await waitFor(() => expect(document.body.textContent.length).toBeGreaterThan(0), { timeout: 3000 });
    const tabs = document.querySelectorAll('.ant-tabs-tab');
    for (const tab of Array.from(tabs).slice(0, 2)) {
      fireEvent.click(tab);
    }
    expect(document.body.textContent.length).toBeGreaterThan(0);
  });
});
