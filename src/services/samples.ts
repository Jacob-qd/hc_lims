/**
 * 样品管理 API
 */
import { get, post } from './api';
import type { PaginatedResult } from './api';

export interface Sample {
  id: string;
  sampleNo: string;
  name: string;
  typeLabel: string;
  customerName: string;
  projectName: string;
  status: string;
  statusLabel: string;
  location: string;
  receivingTime?: string;
  createdAt: string;
}

export const samplesApi = {
  list: (params?: Record<string, string>) =>
    get<PaginatedResult<Sample>>('/samples', params),

  getById: (id: string) => get<Sample>(`/samples/${id}`),

  create: (data: Partial<Sample>) => post<Sample>('/samples', data),
};
