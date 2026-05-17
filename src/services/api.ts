/**
 * HC-LIMS API 客户端
 * 
 * 统一管理请求/响应、错误处理、认证 Token 注入
 */

// ====== API 配置 ======

const API_BASE = '/api/v1';

interface ApiConfig {
  baseUrl: string;
  getToken?: () => string | null;
}

let config: ApiConfig = { baseUrl: API_BASE };

export function configureApi(cfg: Partial<ApiConfig>) {
  config = { ...config, ...cfg };
}

// ====== API 错误 ======

export class ApiError extends Error {
  status: number;
  code: number | undefined;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// ====== 请求工具 ======

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${config.baseUrl}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = config.getToken?.();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      body.message || `HTTP ${res.status}`,
      res.status,
      body.code || res.status,
    );
  }

  const json = await res.json();
  if (json.code !== 200) {
    throw new ApiError(json.message || '请求失败', res.status, json.code);
  }

  return json.data as T;
}

// ====== 公开方法 ======

export function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const searchParams = params ? '?' + new URLSearchParams(params).toString() : '';
  return request<T>(`${path}${searchParams}`);
}

export function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function del<T = void>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

// ====== 分页响应类型 ======

export interface PaginatedResult<T> {
  list: T[];
  total: number;
  page?: number;
  pageSize?: number;
}
