/**
 * 报告管理 API
 */
import { get, post, configureApi } from './api';
import type { PaginatedResult } from './api';

export interface ReportCover {
  companyName: string;
  entrustUnit: string;
  reportTitle: string;
  sampleType: string;
  samplingLocation: string;
  samplingDate: string;
  testDate: string;
  issueDate: string;
  pageCount: number;
  projectName?: string;
}

export interface ReportSignature {
  id: string;
  role: 'compiler' | 'reviewer' | 'approver';
  roleLabel: string;
  userId: string;
  userName: string;
  signedAt: string;
  ipAddress: string;
  stampType: string;
  reason: string;
  passwordVerified: boolean;
}

export interface ReportTestResult {
  id: string;
  seq: number;
  itemName: string;
  unit: string;
  result: string;
  detectionLimit: string;
  limitValue: string;
  method: string;
  judgment: string;
}

export interface ReportAnnotation {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  status: 'open' | 'resolved';
  mentions: string[];
  replies: LooseAny[];
}

export interface Report {
  id: string;
  reportNo: string;
  title: string;
  customerName: string;
  sampleNos: string[];
  creatorName: string;
  status: string;
  statusLabel: string;
  projectName: string;
  sampleTypeLabel: string;
  samplingLocation: string;
  createdAt: string;
  updatedAt: string;
  issuedAt: string;
  signatures: ReportSignature[];
  annotations: ReportAnnotation[];
  attachments: LooseAny[];
  changeHistory: LooseAny[];
  testResults: ReportTestResult[];
  cover: ReportCover;
  customerId?: string;
  projectId?: string;
  sampleType?: string;
  samplingDate?: string;
}

export interface ReportStats {
  draft: number;
  pendingTechReview: number;
  pendingApproval: number;
  issued: number;
  total: number;
}

export interface ReportFilters {
  keyword?: string;
  status?: string;
  customer?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const reportsApi = {
  /** 获取报告列表 */
  list: (filters?: ReportFilters) => {
    const params: Record<string, string> = {};
    if (filters?.keyword) params.keyword = filters.keyword;
    if (filters?.status) params.status = filters.status;
    if (filters?.customer) params.customer = filters.customer;
    return get<PaginatedResult<Report>>('/reports', params);
  },

  /** 获取报告统计 */
  stats: () => get<ReportStats>('/reports/stats'),

  /** 获取单个报告 */
  getById: (id: string) => get<Report>(`/reports/${id}`),

  /** 提交审核 */
  submitReview: (id: string) => post(`/reports/${id}/submit-review`),

  /** 审核报告 */
  review: (id: string, data: { conclusion: string; opinion: string }) =>
    post(`/reports/${id}/review`, data),

  /** 签发报告 */
  sign: (id: string, data: { password: string; reason: string; role: string }) =>
    post(`/reports/${id}/sign`, data),

  /** 验真 */
  verify: (id: string) => post(`/reports/${id}/verify`),
};

// 初始化时注入 auth token
configureApi({
  getToken: () => {
    try {
      const auth = localStorage.getItem('auth-storage');
      if (auth) {
        const parsed = JSON.parse(auth);
        return parsed.state?.token || null;
      }
    } catch {
      // ignore
    }
    return null;
  },
});
