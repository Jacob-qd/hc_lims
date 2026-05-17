import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ReportsPage } from '../pages/ReportsPage';

function mockFetchResponse(data: LooseAny) {
  return { ok: true, status: 200, json: async () => data } as Response;
}

const baseReport = {
  id: 'r1', reportNo: 'RPT-001', title: '水质报告', customerName: '绿源环保', sampleNos: ['SMP001'], creatorName: '张伟',
  createdAt: '2025-01-01', updatedAt: '2025-01-01', issuedAt: '', signatures: [], annotations: [], attachments: [], changeHistory: [], testResults: [],
  cover: { companyName: '红创', entrustUnit: '绿源', reportTitle: '水质', sampleType: '水', samplingLocation: '东湖', samplingDate: '2025-01-01', testDate: '2025-01-02', issueDate: '', pageCount: 5 },
  projectName: '监测', sampleTypeLabel: '水', samplingLocation: '东湖'
};

describe('ReportsPage', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/reports') && !url.includes('/flow-history') && !url.includes('/review') && !url.includes('/signatures')) {
        return mockFetchResponse({ code: 200, data: { list: [{ ...baseReport, status: 'draft', statusLabel: '草稿' }], total: 1 } });
      }
      if (url.includes('/api/v1/reports/stats')) return mockFetchResponse({ code: 200, data: { draft: 1, pendingTechReview: 0, pendingApproval: 0, issued: 0, total: 1 } });
      if (url.includes('/api/v1/reports/r1/flow-history')) return mockFetchResponse({ code: 200, data: [{ action: '创建', user: '张伟', time: '2025-01-01', desc: '创建报告' }] });
      if (url.includes('/api/v1/signatures')) return mockFetchResponse({ code: 200, data: { valid: true, documentIntact: true, signerVerified: true, signatures: [] } });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('renders and loads reports', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    expect(screen.getByText('水质报告')).toBeInTheDocument();
  });

  it('clicks new report button', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('新建报告')[0]);
  });

  it('opens detail drawer and switches tabs', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('详情')[0]);
    await waitFor(() => expect(screen.getByText('报告信息')).toBeInTheDocument());
    fireEvent.click(screen.getByText('PDF预览'));
    await waitFor(() => expect(document.body.textContent).toContain('红创'));
    fireEvent.click(screen.getByText('批注 (0)'));
    fireEvent.click(screen.getByText('变更历史'));
  });

  it('opens flow tab and clicks submit', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('详情')[0]);
    await waitFor(() => expect(screen.getByText('报告信息')).toBeInTheDocument());
    fireEvent.click(screen.getByText('流程步骤'));
    await waitFor(() => expect(document.body.textContent).toContain('提交审核'));
  });

  it('opens submit modal for draft report and fills form', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('提交')[0]);
    await waitFor(() => expect(document.body.textContent).toContain('电子签名确认'));
    // Fill sign modal form
    const pwInputs = document.querySelectorAll('input[type="password"]');
    if (pwInputs.length > 0) {
      fireEvent.change(pwInputs[0], { target: { value: '123456' } });
    }
    const textareas = document.querySelectorAll('textarea');
    if (textareas.length > 0) {
      fireEvent.change(textareas[0], { target: { value: '报告编制完成' } });
    }
    const checkboxes = document.querySelectorAll('.ant-checkbox-input');
    if (checkboxes.length > 0) {
      fireEvent.click(checkboxes[checkboxes.length - 1]);
    }
  });

  it('filters by status via KPI card', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    fireEvent.click(screen.getByText('待撰写'));
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
  });

  it('selects rows and shows batch actions', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-001')).toBeInTheDocument());
    const checkbox = document.querySelector('.ant-table-selection-column input[type="checkbox"]');
    if (checkbox) fireEvent.click(checkbox);
    await waitFor(() => expect(document.body.textContent).toContain('删除'));
  });
});

describe('ReportsPage with pending review report', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/reports') && !url.includes('/flow-history') && !url.includes('/review')) {
        return mockFetchResponse({ code: 200, data: { list: [{ ...baseReport, id: 'r2', reportNo: 'RPT-002', status: 'pending_tech_review', statusLabel: '待技术审核' }], total: 1 } });
      }
      if (url.includes('/api/v1/reports/stats')) return mockFetchResponse({ code: 200, data: { draft: 0, pendingTechReview: 1, pendingApproval: 0, issued: 0, total: 1 } });
      if (url.includes('/api/v1/reports/r2/flow-history')) return mockFetchResponse({ code: 200, data: [] });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('opens review modal and fills checklist', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-002')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('审核')[0]);
    await waitFor(() => expect(document.body.textContent).toContain('审核要点检查清单'));
    // Check all checklist items
    const checkboxes = document.querySelectorAll('.ant-checkbox-input');
    checkboxes.forEach(cb => fireEvent.click(cb));
    // Fill opinion
    const textareas = document.querySelectorAll('textarea');
    if (textareas.length > 0) {
      fireEvent.change(textareas[0], { target: { value: '审核通过，数据完整' } });
    }
  });
});

describe('ReportsPage with pending approval report', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/reports') && !url.includes('/flow-history')) {
        return mockFetchResponse({ code: 200, data: { list: [{ ...baseReport, id: 'r3', reportNo: 'RPT-003', status: 'pending_approval', statusLabel: '待批准签发' }], total: 1 } });
      }
      if (url.includes('/api/v1/reports/stats')) return mockFetchResponse({ code: 200, data: { draft: 0, pendingTechReview: 0, pendingApproval: 1, issued: 0, total: 1 } });
      if (url.includes('/api/v1/reports/r3/flow-history')) return mockFetchResponse({ code: 200, data: [] });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('opens sign modal for approval', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-003')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('签发')[0]);
    await waitFor(() => expect(document.body.textContent).toContain('签名'));
  });
});

describe('ReportsPage with issued report', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as LooseAny as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (url: LooseAny) => {
      if (url.includes('/api/v1/reports') && !url.includes('/flow-history')) {
        return mockFetchResponse({ code: 200, data: { list: [{ ...baseReport, id: 'r4', reportNo: 'RPT-004', status: 'issued', statusLabel: '已签发', signatures: [{ id: 's1', role: 'compiler', roleLabel: '编制人', userId: '1', userName: '张伟', signedAt: '2025-01-01', ipAddress: '127.0.0.1', stampType: 'electronic', reason: '编制完成', passwordVerified: true }] }], total: 1 } });
      }
      if (url.includes('/api/v1/reports/stats')) return mockFetchResponse({ code: 200, data: { draft: 0, pendingTechReview: 0, pendingApproval: 0, issued: 1, total: 1 } });
      if (url.includes('/api/v1/reports/r4/flow-history')) return mockFetchResponse({ code: 200, data: [] });
      if (url.includes('/api/v1/signatures/verify')) return mockFetchResponse({ code: 200, data: { valid: true, documentIntact: true, signerVerified: true, signatures: [{ signerName: '张伟', meaning: 'PREPARED', meaningLabel: '编制', time: '2025-01-01', status: '有效' }], details: ['验证通过'] } });
      return mockFetchResponse({ code: 200, data: null });
    });
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('opens verify tab for issued report', async () => {
    render(<BrowserRouter><ConfigProvider><ReportsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('RPT-004')).toBeInTheDocument());
    fireEvent.click(screen.getAllByText('验真')[0]);
    await waitFor(() => expect(screen.getByText('报告信息')).toBeInTheDocument());
    // verify tab opened via setTimeout
    await waitFor(() => expect(document.body.textContent).toContain('签名验真'));
  });
});
