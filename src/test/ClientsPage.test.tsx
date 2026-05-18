/**
 * 商务管理 - 客户管理测试
 *
 * User Stories:
 *   US-BM-01: "作为商务人员，我希望新增客户并记录联系人/行业/信用等级"
 *   US-BM-02: "我希望编辑客户信息"
 *   US-BM-03: "我可以搜索和筛选客户列表"
 *   US-BM-04: "我可以删除不再合作的客户"
 *   US-BM-05: "查看客户详情时能看到关联的合同和委托单"
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { ClientsPage } from '../pages/ClientsPage';

function mockFetchResponse(data: any) {
  return { ok: true, status: 200, json: async () => ({ code: 200, data }) } as Response;
}

describe('ClientsPage - 客户管理', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis as any, 'fetch').mockImplementation(async (url: any) => {
      if (url.includes('/api/v1/clients') && url.endsWith('/clients')) {
        return mockFetchResponse({ list: [
          { id: 'c1', name: '绿源环保科技', type: '企业', industry: '环保', contact: '王经理', phone: '138-0001', credit: 'A', status: 'active', samples: 248, contracts: 3, source: '自行开发', createdAt: '2024-01-15', updatedAt: '2026-05-01' },
          { id: 'c6', name: '康源医药集团', type: '企业', industry: '医药', contact: '孙经理', phone: '133-0007', credit: 'C', status: 'suspended', samples: 54, contracts: 1, source: '线上', createdAt: '2025-03-12', updatedAt: '2026-02-01' },
        ]});
      }
      if (url.includes('/api/v1/contracts')) {
        return mockFetchResponse({ list: [
          { id: 'ct1', no: 'CT-001', name: '年度合同', customerId: 'c1', amount: 150000, startDate: '2025-01-01', endDate: '2025-12-31', status: 'active', statusLabel: '执行中' },
        ]});
      }
      if (url.includes('/api/v1/orders')) {
        return mockFetchResponse({ list: [
          { id: 'o1', no: 'ORD-001', customerId: 'c1', customerName: '绿源环保科技', projectName: '水质检测', sampleCount: 5, totalAmount: 5000, status: 'pending', paymentStatus: 'unpaid', createdAt: '2026-05-01' },
        ]});
      }
      return mockFetchResponse({});
    });
  });

  afterEach(() => { fetchSpy.mockRestore(); });

  it('US-BM-01: 显示客户列表', async () => {
    render(<BrowserRouter><ConfigProvider><ClientsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('绿源环保科技')).toBeInTheDocument());
  });

  it('US-BM-01: 存在"新增客户"按钮', async () => {
    render(<BrowserRouter><ConfigProvider><ClientsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('新增客户')).toBeInTheDocument());
  });

  it('US-BM-01: 点击"新增客户"打开 Modal', async () => {
    render(<BrowserRouter><ConfigProvider><ClientsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('新增客户')).toBeInTheDocument());
    fireEvent.click(screen.getByText('新增客户'));
    await waitFor(() => expect(document.body.textContent).toContain('客户名称'));
  });

  it('US-BM-02: 点击"查看"展开 Drawer', async () => {
    render(<BrowserRouter><ConfigProvider><ClientsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('绿源环保科技')).toBeInTheDocument());
    fireEvent.click(screen.getByText('绿源环保科技'));
    await waitFor(() => expect(document.body.textContent).toContain('联系人'));
  });

  it('US-BM-03: 搜索输入框存在', async () => {
    render(<BrowserRouter><ConfigProvider><ClientsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('绿源环保科技')).toBeInTheDocument());
    const searchInput = document.querySelector('input[placeholder*="搜索"]');
    expect(searchInput).toBeTruthy();
  });

  it('US-BM-04: 删除按钮存在', async () => {
    render(<BrowserRouter><ConfigProvider><ClientsPage /></ConfigProvider></BrowserRouter>);
    await waitFor(() => expect(screen.getByText('绿源环保科技')).toBeInTheDocument());
    const deleteBtns = document.querySelectorAll('.ant-btn-dangerous');
    expect(deleteBtns.length).toBeGreaterThan(0);
  });
});
