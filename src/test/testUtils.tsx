/**
 * HC-LIMS 组件测试工具
 * 
 * == 使用方式 ==
 * 
 * 1. setupMockApi — 统一 Mock API 路由
 * ```ts
 * const fetchSpy = setupMockApi({
 *   '/reports': { code: 200, data: { list: [buildReport()] } },
 *   '/reports/stats': { code: 200, data: { draft: 1, issued: 0 } },
 * });
 * ```
 * 
 * 2. buildReport / buildSample / buildTask — 工厂函数
 * ```ts
 * const draftReport = buildReport({ status: 'draft' });
 * const issuedReport = buildReport({ status: 'issued', issuedAt: '2025-01-01' });
 * ```
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';

// ========== 渲染工具 ==========

export function renderWithProviders(ui: ReactNode) {
  return render(
    <BrowserRouter>
      <ConfigProvider>{ui}</ConfigProvider>
    </BrowserRouter>
  );
}

// ========== Mock API 工具 ==========

/**
 * 统一 Mock API：按 URL 前缀映射返回数据
 * 用法：
 *   const fetchSpy = setupMockApi({
 *     '/api/v1/reports': { code: 200, data: { list: [] } },
 *   });
 */
export function setupMockApi(routes: Record<string, unknown>) {
  return vi.spyOn(globalThis as unknown as { fetch: typeof globalThis.fetch }, 'fetch').mockImplementation(async (input: unknown) => {
    const url = String(input);
    for (const [prefix, data] of Object.entries(routes)) {
      if (url.includes(prefix)) {
        return { ok: true, status: 200, json: async () => data } as Response;
      }
    }
    return { ok: true, status: 200, json: async () => ({ code: 200, data: null }) } as Response;
  });
}

export function mockFetch(data: unknown, ok = true) {
  return vi.spyOn(globalThis as unknown as { fetch: typeof globalThis.fetch }, 'fetch').mockResolvedValue({
    ok, json: async () => ({ code: ok ? 200 : 500, data }),
    status: ok ? 200 : 500,
  } as Response);
}

// ========== 数据工厂 ==========

let _idCounter = 0;
function uid(prefix = 'id'): string {
  return `${prefix}-${++_idCounter}-${Date.now()}`;
}

export function buildReport(overrides?: Partial<Record<string, unknown>>): Record<string, unknown> {
  return {
    id: uid('r'),
    reportNo: `RPT-${String(Date.now()).slice(-6)}`,
    title: '检测报告',
    customerName: '测试客户',
    sampleNos: ['SMP001'],
    creatorName: '张伟',
    status: 'draft',
    statusLabel: '草稿',
    projectName: '监测项目',
    sampleTypeLabel: '水',
    samplingLocation: '东湖',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    issuedAt: '',
    signatures: [],
    annotations: [],
    attachments: [],
    changeHistory: [],
    testResults: [],
    cover: {
      companyName: '红创检测',
      entrustUnit: '测试客户',
      reportTitle: '检测报告',
      sampleType: '水',
      samplingLocation: '东湖',
      samplingDate: '2025-01-01',
      testDate: '2025-01-02',
      issueDate: '',
      pageCount: 5,
    },
    ...overrides,
  };
}

export function buildSample(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: uid('s'),
    sampleNo: `SMP-${String(Date.now()).slice(-6)}`,
    name: '检测样品',
    typeLabel: '水',
    customerName: '测试客户',
    status: 'registered',
    statusLabel: '已登记',
    location: '样品室A1',
    createdAt: '2025-01-01',
    ...overrides,
  };
}

export function buildTask(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: uid('t'),
    taskNo: `TK-${String(Date.now()).slice(-6)}`,
    sampleName: '检测样品',
    testItem: 'COD测定',
    analystName: '张三',
    status: 'pending',
    statusLabel: '待分配',
    progress: 0,
    createdAt: '2025-01-01',
    ...overrides,
  };
}

export function buildCOCChain(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: uid('coc'),
    cocNumber: `COC-${String(Date.now()).slice(-8)}`,
    sampleId: uid('smp'),
    sampleName: '检测样品',
    status: 'active',
    integrity: true,
    events: [
      { id: uid('ev'), chainId: '', eventType: 'SAMPLING', operatorName: '张三',
        occurredAt: '2025-01-01T09:00:00Z', location: '采样点A', notes: '' },
    ],
    createdAt: '2025-01-01T09:00:00Z',
    ...overrides,
  };
}

export function buildCertificate(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: uid('cert'),
    userName: '张三',
    certSubject: 'CN=张三, OU=实验室',
    serialNumber: `SM2-CERT-${Date.now()}`,
    algorithm: 'SM2',
    keyLength: 256,
    notBefore: '2025-01-01',
    notAfter: '2026-01-01',
    status: 'active',
    createdAt: '2025-01-01',
    certIssuer: '红创CA',
    ...overrides,
  };
}

export function buildBackup(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: uid('bkp'),
    name: `backup_${Date.now()}.sql`,
    size: '120MB',
    type: '自动',
    date: '2025-01-01 03:00',
    status: 'completed',
    ...overrides,
  };
}

export function buildMethod(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: uid('mtd'),
    code: `M-${String(Date.now()).slice(-3)}`,
    name: '检测方法',
    analyte: 'COD',
    version: 'v1.0',
    matrix: '水',
    instrument: '分光光度计',
    detectionLimit: '0.5mg/L',
    effectiveDate: '2025-01-01',
    responsible: '张伟',
    status: 'active',
    statusLabel: '生效',
    ...overrides,
  };
}

export function buildELNEntry(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: uid('eln'),
    title: '实验记录',
    author: '张三',
    createdAt: '2025-01-01',
    status: 'draft',
    tags: ['实验'],
    content: '实验内容...',
    updatedAt: '2025-01-01',
    ...overrides,
  };
}

export function buildWorkflowDef(overrides?: Record<string, unknown>): Record<string, unknown> {
  return {
    id: uid('wf'),
    name: '审批流程',
    type: '审批',
    description: '描述',
    nodes: [
      { id: 'n1', type: 'start', name: '开始', x: 100, y: 80, config: {} },
      { id: 'n2', type: 'end', name: '结束', x: 300, y: 80, config: {} },
    ],
    edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    status: 'draft',
    version: 1,
    usedCount: 0,
    createdBy: '张伟',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    ...overrides,
  };
}

// ========== 等待工具 ==========

export function waitForRender(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ========== 重新导出 ==========

export {
  describe, it, expect, vi, screen, waitFor, fireEvent,
};
