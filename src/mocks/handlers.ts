import { http, HttpResponse } from 'msw';
import {
  mockUsers,
  mockDashboardStats,
  mockDashboardTaskQueue,
  mockDashboardInstruments,
  mockDashboardAlerts,
  mockTurnaroundTrend,
  mockSampleTypeDistribution,
  mockSamples,
  mockSampleFlowHistory,
  mockSampleDetail,
  mockTestItemOptions,
} from './data';

const apiUrl = (path: string) => `/api/v1${path}`;

export const handlers = [
  // Auth
  http.post(apiUrl('/auth/login'), async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string; role?: string };
    const user = mockUsers.find(
      (u) => u.username === body.username && u.password === body.password
    );

    if (!user) {
      return HttpResponse.json(
        { code: 401, message: '用户名或密码错误', data: null },
        { status: 401 }
      );
    }

    if (body.role && body.role !== user.role) {
      return HttpResponse.json(
        { code: 403, message: '角色不匹配', data: null },
        { status: 403 }
      );
    }

    const { password, ...userWithoutPassword } = user;
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        user: userWithoutPassword,
        token: `mock-jwt-token-${user.id}-${Date.now()}`,
      },
    });
  }),

  http.post(apiUrl('/auth/logout'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: null });
  }),

  http.get(apiUrl('/auth/me'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockUsers[0],
    });
  }),

  // Dashboard
  http.get(apiUrl('/dashboard/stats'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockDashboardStats,
    });
  }),

  http.get(apiUrl('/dashboard/task-queue'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockDashboardTaskQueue,
    });
  }),

  http.get(apiUrl('/dashboard/instruments'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockDashboardInstruments,
    });
  }),

  http.get(apiUrl('/dashboard/alerts'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockDashboardAlerts,
    });
  }),

  http.get(apiUrl('/dashboard/turnaround-trend'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockTurnaroundTrend,
    });
  }),

  http.get(apiUrl('/dashboard/sample-distribution'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockSampleTypeDistribution,
    });
  }),

  http.get(apiUrl('/dashboard/recent-samples'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockSamples.slice(0, 5),
    });
  }),

  // Samples
  http.get(apiUrl('/samples'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        list: mockSamples,
        total: mockSamples.length,
      },
    });
  }),

  http.get(apiUrl('/samples/:id'), ({ params }) => {
    const sample = mockSamples.find((s) => s.id === params.id);
    if (!sample) {
      return HttpResponse.json({ code: 404, message: '样品不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json({ code: 200, message: 'success', data: sample });
  }),

  http.get(apiUrl('/samples/:id/flow-history'), ({ params }) => {
    const history = mockSampleFlowHistory[params.id as string] || [];
    return HttpResponse.json({ code: 200, message: 'success', data: history });
  }),

  http.get(apiUrl('/samples/:id/detail'), ({ params }) => {
    const detail = mockSampleDetail[params.id as string];
    if (!detail) {
      return HttpResponse.json({ code: 404, message: '样品详情不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json({ code: 200, message: 'success', data: detail });
  }),

  http.post(apiUrl('/samples'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newSample = {
      id: `s${mockSamples.length + 1}`,
      sampleNo: `SMP${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(mockSamples.length + 1).padStart(3, '0')}`,
      ...body,
      status: 'pending_receive',
      statusLabel: '待接收',
      flowStatus: 'pending_receive',
      flowStatusLabel: '待接收',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ code: 200, message: 'success', data: newSample });
  }),

  // Test items
  http.get(apiUrl('/test-items'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: mockTestItemOptions,
    });
  }),

  // Tasks
  http.get(apiUrl('/tasks'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        list: [],
        total: 0,
      },
    });
  }),

  // Reports
  http.get(apiUrl('/reports'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        list: [],
        total: 0,
      },
    });
  }),

  // Customers
  http.get(apiUrl('/customers'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        list: [
          { id: 'c1', name: '绿源环保科技有限公司' },
          { id: 'c2', name: '市政水务集团' },
          { id: 'c3', name: '华测检测认证集团' },
          { id: 'c4', name: '清源化工有限公司' },
          { id: 'c5', name: '蓝天环境监测站' },
        ],
        total: 5,
      },
    });
  }),

  // Projects
  http.get(apiUrl('/projects'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        list: [
          { id: 'p1', name: '地表水监测项目' },
          { id: 'p2', name: '市政供水检测' },
          { id: 'p3', name: '华测检测项目' },
          { id: 'p4', name: '清源化工项目' },
          { id: 'p5', name: '蓝天环境监测' },
        ],
        total: 5,
      },
    });
  }),

  // Labs
  http.get(apiUrl('/labs'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        list: [
          { id: 'l1', name: '环境实验室' },
          { id: 'l2', name: '理化实验室' },
          { id: 'l3', name: '无机实验室' },
          { id: 'l4', name: '微生物实验室' },
          { id: 'l5', name: '声学实验室' },
          { id: 'l6', name: '生物实验室' },
        ],
        total: 6,
      },
    });
  }),
];
