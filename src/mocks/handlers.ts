import { http, HttpResponse } from 'msw';
import {
  mockUsers,
  mockDashboardStats,
  mockDashboardTaskQueue,
  mockTasks,
  mockDashboardInstruments,
  mockDashboardAlerts,
  mockTurnaroundTrend,
  mockSampleTypeDistribution,
  mockSamples,
  mockSampleFlowHistory,
  mockSampleDetail,
  mockTestItemOptions,
  mockReports,
  mockReportStats,
  mockReportFlowHistory,
  mockSamplesExpanded,
  mockTasksExpanded,
  mockResearchGroupsExpanded,
  mockInstruments,
  mockInstrumentsExpanded,
  mockQualityDataExpanded,
  mockDeviationsExpanded,
  mockControlChartDataExpanded,
  mockELNExpanded,
  mockReservationExpanded,
  mockChemicals,
  mockChemicalExpanded,
  mockCourses,
  mockAnalysts,
  mockQCResults,
  mockDeviations,
  mockControlChartData,
  mockPublications,
  mockResearchProjects,
  mockELNEntries,
  mockReservations,
  mockInventory,
  mockPurchaseRequests,
  mockMethods,
  mockPersonnel,
  mockTrainingRecords,
  mockCertificates,
  mockFieldConfigs,
  mockFieldTemplates,
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
  http.get(apiUrl('/tasks'), ({ request }) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    let filtered = [...mockTasks];
    if (status && status !== 'all') filtered = filtered.filter(t => t.status === status);
    if (keyword) filtered = filtered.filter(t => t.sampleName.includes(keyword) || t.taskNo.includes(keyword) || t.testItem.includes(keyword));
    return HttpResponse.json({ code: 200, data: { list: filtered, total: filtered.length } });
  }),

  http.get(apiUrl('/tasks/stats'), () => {
    return HttpResponse.json({ code: 200, data: { ...mockDashboardTaskQueue } });
  }),

  http.post(apiUrl('/tasks'), async ({ request }) => {
    const body = await request.json();
    const task: any = { id: 'tk' + Date.now(), taskNo: 'TK-2025-' + String(mockTasks.length + 1).padStart(3, '0'), ...body, createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) };
    mockTasks.push(task);
    return HttpResponse.json({ code: 200, data: task, message: '创建成功' });
  }),

  http.post(apiUrl('/tasks/:id/assign'), async ({ params, request }) => {
    const body = await request.json();
    const task = mockTasks.find(t => t.id === params.id);
    if (task) { task.analystId = body.analystId; task.analystName = body.analystName; task.instrumentId = body.instrumentId; task.instrumentName = body.instrumentName; task.plannedStart = body.plannedStart; task.plannedEnd = body.plannedEnd; task.status = 'pending'; task.statusLabel = '待检测'; }
    return HttpResponse.json({ code: 200, message: '分配成功' });
  }),

  http.post(apiUrl('/tasks/:id/start'), ({ params }) => {
    const task = mockTasks.find(t => t.id === params.id);
    if (task) { task.status = 'testing'; task.statusLabel = '检测中'; task.actualStart = new Date().toISOString().slice(0, 10); }
    return HttpResponse.json({ code: 200, message: '开始检测' });
  }),

  http.post(apiUrl('/tasks/:id/complete'), ({ params }) => {
    const task = mockTasks.find(t => t.id === params.id);
    if (task) { task.status = 'pending_review'; task.statusLabel = '待审核'; task.progress = 100; task.actualEnd = new Date().toISOString().slice(0, 10); }
    return HttpResponse.json({ code: 200, message: '提交复核' });
  }),

  http.get(apiUrl('/tasks/schedule'), () => {
    return HttpResponse.json({ code: 200, data: { list: mockTasks.map(t => ({ ...t, title: t.testItem, start: t.plannedStart, end: t.plannedEnd })) } });
  }),

  // Reports
  http.get(apiUrl('/reports/stats'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: mockReportStats });
  }),

  http.get(apiUrl('/reports'), () => {
    return HttpResponse.json({
      code: 200,
      message: 'success',
      data: {
        list: mockReports,
        total: mockReports.length,
      },
    });
  }),

  http.get(apiUrl('/reports/:id'), ({ params }) => {
    const report = mockReports.find((r) => r.id === params.id);
    if (!report) {
      return HttpResponse.json({ code: 404, message: '报告不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json({ code: 200, message: 'success', data: report });
  }),

  http.put(apiUrl('/reports/:id'), async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const idx = mockReports.findIndex((r) => r.id === params.id);
    if (idx === -1) {
      return HttpResponse.json({ code: 404, message: '报告不存在', data: null }, { status: 404 });
    }
    const updated = { ...mockReports[idx], ...body, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) };
    mockReports[idx] = updated as any;
    return HttpResponse.json({ code: 200, message: 'success', data: updated });
  }),

  http.get(apiUrl('/reports/:id/flow-history'), ({ params }) => {
    const history = mockReportFlowHistory[params.id as string] || [];
    return HttpResponse.json({ code: 200, message: 'success', data: history });
  }),

  http.post(apiUrl('/reports/:id/review'), async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const report = mockReports.find((r) => r.id === params.id);
    if (!report) {
      return HttpResponse.json({ code: 404, message: '报告不存在', data: null }, { status: 404 });
    }
    const newReview = {
      id: `rv-${Date.now()}`,
      ...body,
      reviewedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    report.reviews.push(newReview as any);
    return HttpResponse.json({ code: 200, message: 'success', data: newReview });
  }),

  http.post(apiUrl('/reports/:id/sign'), async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const report = mockReports.find((r) => r.id === params.id);
    if (!report) {
      return HttpResponse.json({ code: 404, message: '报告不存在', data: null }, { status: 404 });
    }
    const newSig = {
      id: `sig-${Date.now()}`,
      ...body,
      signedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    report.signatures.push(newSig as any);
    return HttpResponse.json({ code: 200, message: 'success', data: newSig });
  }),

  http.post(apiUrl('/reports/:id/annotations'), async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const report = mockReports.find((r) => r.id === params.id);
    if (!report) {
      return HttpResponse.json({ code: 404, message: '报告不存在', data: null }, { status: 404 });
    }
    const newAnn = {
      id: `ann-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'open',
      replies: [],
    };
    report.annotations.push(newAnn as any);
    return HttpResponse.json({ code: 200, message: 'success', data: newAnn });
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
          { id: 'c3', name: '红创检测认证集团' },
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
          { id: 'p3', name: '红创检测项目' },
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

  // ===== Instruments =====
  http.get(apiUrl('/instruments'), ({ request }) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    let filtered = [...mockInstruments];
    if (status && status !== 'all') {
      filtered = filtered.filter(i => i.status === status);
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(kw) || i.model.toLowerCase().includes(kw) || i.serialNo.toLowerCase().includes(kw));
    }
    return HttpResponse.json({ code: 200, data: { list: filtered, total: filtered.length } });
  }),

  http.get(apiUrl('/instruments/:id'), ({ params }) => {
    const instrument = mockInstruments.find(i => i.id === params.id);
    if (!instrument) return HttpResponse.json({ code: 404, message: '仪器不存在' });
    const calibrations = mockCalibrationRecords.filter(c => c.instrumentId === params.id);
    const maintenances = mockMaintenanceRecords.filter(m => m.instrumentId === params.id);
    return HttpResponse.json({ code: 200, data: { ...instrument, calibrations, maintenances } });
  }),

  http.post(apiUrl('/instruments'), async ({ request }) => {
    const body = await request.json();
    const newInstrument = { id: `i${mockInstruments.length + 1}`, ...body, connectionStatus: 'online', utilization: 0 };
    mockInstruments.push(newInstrument);
    return HttpResponse.json({ code: 200, data: newInstrument, message: '创建成功' });
  }),

  http.get(apiUrl('/instruments/:id/calibrations'), ({ params }) => {
    return HttpResponse.json({ code: 200, data: { list: mockCalibrationRecords.filter(c => c.instrumentId === params.id) } });
  }),

  http.get(apiUrl('/instruments/:id/maintenances'), ({ params }) => {
    return HttpResponse.json({ code: 200, data: { list: mockMaintenanceRecords.filter(m => m.instrumentId === params.id) } });
  }),

  // ===== Quality Control =====
  http.get(apiUrl('/quality/control-chart'), () => {
    return HttpResponse.json({ code: 200, data: mockControlChartData });
  }),

  http.get(apiUrl('/quality/qc-results'), () => {
    return HttpResponse.json({ code: 200, data: { list: mockQCResults } });
  }),

  http.get(apiUrl('/quality/deviations'), () => {
    return HttpResponse.json({ code: 200, data: { list: mockDeviations } });
  }),

  // ===== Research Module Handlers =====
  http.get(apiUrl('/research/projects'), () => HttpResponse.json({ code: 200, data: { list: mockResearchProjects } })),
  http.post(apiUrl('/research/projects'), async ({ request }) => {
    const body = await request.json();
    const item = { id: 'rp' + Date.now(), ...body };
    mockResearchProjects.push(item);
    return HttpResponse.json({ code: 200, data: item, message: '创建成功' });
  }),

  http.get(apiUrl('/research/eln-entries'), () => HttpResponse.json({ code: 200, data: { list: mockELNEntries } })),
  http.post(apiUrl('/research/eln-entries'), async ({ request }) => {
    const body = await request.json();
    const item = { id: 'eln' + Date.now(), no: 'ELN' + new Date().toISOString().slice(0,10).replace(/-/g,''), status: 'draft', tags: [], ...body };
    mockELNEntries.push(item);
    return HttpResponse.json({ code: 200, data: item, message: '创建成功' });
  }),
  http.post(apiUrl('/research/eln-entries/:id/sign'), ({ params }) => {
    const entry = mockELNEntries.find(e => e.id === params.id);
    if (entry) { entry.status = entry.status === 'draft' ? 'signed' : 'locked'; }
    return HttpResponse.json({ code: 200, message: '签名成功' });
  }),

  http.get(apiUrl('/research/reservations'), () => HttpResponse.json({ code: 200, data: { list: mockReservations } })),
  http.post(apiUrl('/research/reservations'), async ({ request }) => {
    const body = await request.json();
    const item = { id: 'res' + Date.now(), status: 'pending', fee: 0, ...body };
    mockReservations.push(item);
    return HttpResponse.json({ code: 200, data: item, message: '预约成功' });
  }),

  http.get(apiUrl('/research/chemicals'), () => HttpResponse.json({ code: 200, data: { list: [...mockChemicals, ...mockChemicalExpanded] } })),
  http.get(apiUrl('/research/publications'), () => HttpResponse.json({ code: 200, data: { list: mockPublications } })),

  // ===== Expanded Data Handlers =====
  http.get(apiUrl('/samples/expanded'), () => HttpResponse.json({ code: 200, data: { list: mockSamplesExpanded, total: mockSamplesExpanded.length } })),
  http.get(apiUrl('/tasks/expanded'), () => HttpResponse.json({ code: 200, data: { list: mockTasksExpanded, total: mockTasksExpanded.length } })),
  http.get(apiUrl('/instruments/expanded'), () => HttpResponse.json({ code: 200, data: { list: mockInstrumentsExpanded, total: mockInstrumentsExpanded.length } })),
  http.get(apiUrl('/research/groups/expanded'), () => HttpResponse.json({ code: 200, data: { list: mockResearchGroupsExpanded, total: mockResearchGroupsExpanded.length } })),
  http.get(apiUrl('/quality/expanded'), () => HttpResponse.json({ code: 200, data: { list: [...mockQualityDataExpanded], chart: mockControlChartDataExpanded } })),
  http.get(apiUrl('/quality/deviations/expanded'), () => HttpResponse.json({ code: 200, data: { list: [...mockDeviations, ...mockDeviationsExpanded] } })),
  http.get(apiUrl('/research/eln/expanded'), () => HttpResponse.json({ code: 200, data: { list: [...mockELNEntries, ...mockELNExpanded], total: mockELNEntries.length + mockELNExpanded.length } })),
  http.get(apiUrl('/research/reservations/expanded'), () => HttpResponse.json({ code: 200, data: { list: [...mockReservations, ...mockReservationExpanded], total: mockReservations.length + mockReservationExpanded.length } })),
  http.get(apiUrl('/analysts'), () => HttpResponse.json({ code: 200, data: { list: mockAnalysts } })),
  http.get(apiUrl('/dashboard/trend'), () => HttpResponse.json({ code: 200, data: { list: mockTurnaroundTrendReal } })),

  // ===== Inventory =====
  http.get(apiUrl('/inventory'), () => HttpResponse.json({ code: 200, data: { list: mockInventory } })),
  http.get(apiUrl('/inventory/purchase-requests'), () => HttpResponse.json({ code: 200, data: { list: mockPurchaseRequests } })),

  // ===== Methods =====
  http.get(apiUrl('/methods'), () => HttpResponse.json({ code: 200, data: { list: mockMethods } })),

  // ===== Personnel =====
  http.get(apiUrl('/personnel'), () => HttpResponse.json({ code: 200, data: { list: mockPersonnel } })),
  http.get(apiUrl('/personnel/training'), () => HttpResponse.json({ code: 200, data: { list: mockTrainingRecords } })),
  http.get(apiUrl('/personnel/certificates'), () => HttpResponse.json({ code: 200, data: { list: mockCertificates } })),

  // ===== Teaching =====
  http.get(apiUrl('/teaching/courses'), () => HttpResponse.json({ code: 200, data: { list: mockCourses } })),

  // ===== Dynamic Form =====
  http.get(apiUrl('/field-configs'), ({ request }) => {
    const url = new URL(request.url);
    const module = url.searchParams.get('module') || 'sample';
    const data = (mockFieldConfigs as any)[module] || [];
    return HttpResponse.json({ code: 200, data: { list: data } });
  }),
  http.post(apiUrl('/field-configs'), async ({ request }) => {
    const body = await request.json() as any;
    const module = body.module || 'sample';
    if (!(mockFieldConfigs as any)[module]) (mockFieldConfigs as any)[module] = [];
    const item = { id: 'fc' + Date.now(), sortOrder: ((mockFieldConfigs as any)[module]?.length || 0) + 1, active: true, ...body };
    (mockFieldConfigs as any)[module].push(item);
    return HttpResponse.json({ code: 200, data: item, message: '字段创建成功' });
  }),
  http.put(apiUrl('/field-configs/:id'), async ({ params, request }) => {
    const body = await request.json() as any;
    for (const mod of Object.keys(mockFieldConfigs)) {
      const idx = (mockFieldConfigs as any)[mod].findIndex((f: any) => f.id === params.id);
      if (idx >= 0) { (mockFieldConfigs as any)[mod][idx] = { ...(mockFieldConfigs as any)[mod][idx], ...body }; break; }
    }
    return HttpResponse.json({ code: 200, message: '字段更新成功' });
  }),
  http.delete(apiUrl('/field-configs/:id'), ({ params }) => {
    for (const mod of Object.keys(mockFieldConfigs)) {
      const idx = (mockFieldConfigs as any)[mod].findIndex((f: any) => f.id === params.id);
      if (idx >= 0) { (mockFieldConfigs as any)[mod].splice(idx, 1); break; }
    }
    return HttpResponse.json({ code: 200, message: '字段删除成功' });
  }),
  http.put(apiUrl('/field-configs/reorder'), async ({ request }) => {
    const { module, orderedIds } = await request.json() as any;
    const configs = (mockFieldConfigs as any)[module] || [];
    orderedIds.forEach((id: string, index: number) => {
      const f = configs.find((c: any) => c.id === id);
      if (f) f.sortOrder = index + 1;
    });
    return HttpResponse.json({ code: 200, message: '排序更新成功' });
  }),
  http.get(apiUrl('/field-templates'), ({ request }) => {
    const url = new URL(request.url);
    const module = url.searchParams.get('module') || 'sample';
    return HttpResponse.json({ code: 200, data: { list: mockFieldTemplates.filter((t: any) => t.module === module) } });
  }),
  http.post(apiUrl('/field-templates'), async ({ request }) => {
    const body = await request.json() as any;
    const item = { id: 'tmpl' + Date.now(), version: 1, isSnapshot: false, createdAt: new Date().toISOString(), ...body };
    mockFieldTemplates.push(item);
    return HttpResponse.json({ code: 200, data: item, message: '模板创建成功' });
  }),
  http.put(apiUrl('/field-templates/:id'), async ({ params, request }) => {
    const body = await request.json() as any;
    const idx = mockFieldTemplates.findIndex((t: any) => t.id === params.id);
    if (idx >= 0) mockFieldTemplates[idx] = { ...mockFieldTemplates[idx], ...body, version: mockFieldTemplates[idx].version + 1 };
    return HttpResponse.json({ code: 200, message: '模板更新成功' });
  }),
  http.post(apiUrl('/field-templates/:id/clone'), ({ params }) => {
    const src = mockFieldTemplates.find((t: any) => t.id === params.id);
    if (!src) return HttpResponse.json({ code: 404, message: '模板不存在' }, { status: 404 });
    const clone = { ...src, id: 'tmpl' + Date.now(), name: src.name + '(副本)', version: 1, isSnapshot: false, parentId: src.id, createdAt: new Date().toISOString() };
    mockFieldTemplates.push(clone);
    return HttpResponse.json({ code: 200, data: clone, message: '模板克隆成功' });
  }),
  http.post(apiUrl('/field-templates/:id/snapshot'), ({ params }) => {
    const src = mockFieldTemplates.find((t: any) => t.id === params.id);
    if (!src) return HttpResponse.json({ code: 404, message: '模板不存在' }, { status: 404 });
    const snapshot = { ...src, id: 'snap' + Date.now(), name: src.name + '(v' + src.version + ' 快照)', version: src.version, isSnapshot: true, createdAt: new Date().toISOString() };
    mockFieldTemplates.push(snapshot);
    return HttpResponse.json({ code: 200, data: snapshot, message: '快照创建成功' });
  }),
  http.get(apiUrl('/dynamic-render/:module/:templateId'), ({ params }) => {
    const { module, templateId } = params;
    const tmpl = mockFieldTemplates.find((t: any) => t.id === templateId);
    const configs = tmpl?.fieldConfigs || (mockFieldConfigs as any)[module] || [];
    const groups: Record<string, any[]> = {};
    configs.filter((f: any) => f.active !== false).sort((a: any, b: any) => a.sortOrder - b.sortOrder).forEach((f: any) => {
      const g = f.groupName || '默认分组';
      if (!groups[g]) groups[g] = [];
      groups[g].push({
        key: f.fieldKey, label: f.label, type: f.fieldType, required: f.required,
        defaultValue: f.defaultValue, placeholder: f.placeholder,
        validation: f.validation, options: f.options,
        showIf: f.conditionRules, cascading: f.cascading,
      });
    });
    return HttpResponse.json({ code: 200, data: { module, templateId, groups: Object.entries(groups).map(([name, fields]) => ({ name, fields })) } });
  }),
];
