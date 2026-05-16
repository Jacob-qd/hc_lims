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
  mockCOCChains,
  mockBackupList,
  mockSm2Certificates,
  mockDigitalSignatures,
  mockSignatureAuditLog,
  computeDocumentHash,
  mockSm3Hash,
  mockSm2Sign,
  signatureMeanings,
  mockWorkflowDefinitions,
  mockWorkflowInstances,
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
  // ===== COC =====
  http.get(apiUrl('/coc/chains'), () => HttpResponse.json({ code: 200, data: { list: mockCOCChains } })),
  http.get(apiUrl('/coc/chains/:id'), ({ params }) => {
    const chain = mockCOCChains.find(c => c.id === params.id);
    return chain
      ? HttpResponse.json({ code: 200, data: chain })
      : HttpResponse.json({ code: 404, message: '链不存在' }, { status: 404 });
  }),
  http.post(apiUrl('/coc/chains/:id/events'), async ({ params, request }) => {
    const body = await request.json() as any;
    const chain = mockCOCChains.find(c => c.id === params.id);
    if (!chain) return HttpResponse.json({ code: 404, message: '链不存在' }, { status: 404 });
    const events = chain.events || [];
    const prevId = events.length > 0 ? events[events.length - 1].id : null;
    const evt = {
      id: 'evt' + Date.now(), chainId: params.id, eventType: body.eventType,
      operatorName: body.operatorName || '当前用户',
      occurredAt: body.occurredAt || new Date().toISOString(),
      location: body.location || '实验室', notes: body.notes,
      metadata: {}, prevEventId: prevId,
    };
    events.push(evt);
    return HttpResponse.json({ code: 200, data: evt, message: '事件添加成功' });
  }),
  http.post(apiUrl('/coc/transfer'), async ({ request }) => {
    const body = await request.json() as any;
    const chain = mockCOCChains.find(c => c.id === body.chainId);
    if (!chain) return HttpResponse.json({ code: 404 }, { status: 404 });
    const events = chain.events || [];
    const prevId = events.length > 0 ? events[events.length - 1].id : null;
    events.push({
      id: 'evt' + Date.now(), chainId: body.chainId,
      eventType: body.fromParty && body.toParty ? 'SUBMISSION' : 'RECEIPT',
      operatorName: body.fromParty || '当前用户',
      occurredAt: new Date().toISOString(), location: '交接台',
      notes: `从 ${body.fromParty || '?'} 到 ${body.toParty || '?'}`,
      metadata: { fromParty: body.fromParty, toParty: body.toParty, sampleCount: body.sampleCount,
        transportMode: body.transportMode, temperature: body.temperature },
      prevEventId: prevId,
    });
    return HttpResponse.json({ code: 200, data: {}, message: '交接记录创建成功' });
  }),

  // ===== Backup =====
  http.get(apiUrl('/backups'), () => HttpResponse.json({ code: 200, data: { list: mockBackupList } })),
  http.post(apiUrl('/backups'), async () => {
    const newBak = { id: 'b' + Date.now(), name: `hc_lims_full_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_120000.sql`, size: '256MB', type: '手动', date: new Date().toISOString().replace('T',' ').slice(0,16), status: 'completed' };
    mockBackupList.unshift(newBak);
    return HttpResponse.json({ code: 200, data: newBak, message: '备份创建成功' });
  }),
  http.post(apiUrl('/backups/:id/restore'), () => HttpResponse.json({ code: 200, message: '数据恢复成功' })),
  http.post(apiUrl('/backups/:id/verify'), () => HttpResponse.json({ code: 200, data: { valid: true }, message: '校验通过' })),

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

  // ============================================
  // Electronic Signature (SM2/SM3) Handlers
  // ============================================

  // POST /api/v1/signatures - Create a digital signature
  http.post(apiUrl('/signatures'), async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    const { documentId, documentType, meaning, password, meaningStatement } = body;

    if (!password || password !== '123456') {
      return HttpResponse.json({ code: 401, message: '签名密码错误', data: null }, { status: 401 });
    }

    const report = mockReports.find((r: any) => r.id === documentId);
    if (!report) {
      return HttpResponse.json({ code: 404, message: '文档不存在', data: null }, { status: 404 });
    }

    // Compute SM3 document hash
    const documentHash = computeDocumentHash(report);

    // Find user certificate
    const currentUserId = '3';
    const cert = mockSm2Certificates.find((c: any) => c.userId === currentUserId && c.status === 'active');

    // Build signature payload
    const sigContent = `${documentHash}|${currentUserId}|${meaning}|${new Date().toISOString()}`;
    const sigValue = mockSm2Sign(sigContent, 'mock-private-key');

    // Find previous signature for chain
    const existingSigs = mockDigitalSignatures.filter((s: any) => s.documentId === documentId);
    const lastSig = existingSigs[existingSigs.length - 1];

    const meaningDef = signatureMeanings.find((m: any) => m.value === meaning);

    const newSig: any = {
      id: `dsig-${Date.now()}`,
      documentId,
      documentType: documentType || 'REPORT',
      documentHash,
      signerId: currentUserId,
      signerName: '李思',
      signerCertId: cert?.id || 'cert-sm2-001',
      meaning,
      meaningStatement: meaningStatement || (meaningDef?.description || ''),
      signatureValue: sigValue,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      timeSource: 'NTP',
      previousSignatureId: lastSig?.id || null,
      clientInfo: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0', sessionId: 'sess-' + Date.now() },
      status: 'valid',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    mockDigitalSignatures.push(newSig);

    // Add audit log entry
    mockSignatureAuditLog.push({
      id: 'audit-' + Date.now(),
      signatureId: newSig.id,
      action: 'CREATED',
      operatorId: currentUserId,
      operatorName: '李思',
      details: `报告 ${report.reportNo} ${meaningDef?.label || meaning} 签名创建`,
      createdAt: newSig.createdAt,
    });

    // Update report status based on meaning
    let newStatus = '';
    if (meaning === 'PREPARED') newStatus = 'pending_tech_review';
    else if (meaning === 'REVIEWED') newStatus = 'pending_approval';
    else if (meaning === 'APPROVED') newStatus = 'issued';

    if (newStatus) {
      const statusLabels: Record<string, string> = {
        pending_tech_review: '待技术审核',
        pending_approval: '待批准签发',
        issued: '已签发',
      };
      report.status = newStatus;
      report.statusLabel = statusLabels[newStatus] || newStatus;
      report.updatedAt = newSig.createdAt;
      if (newStatus === 'issued') {
        report.issuedAt = newSig.createdAt;
        report.cover.issueDate = newSig.createdAt;
      }
    }

    // Also push signature to report.signatures
    report.signatures.push({
      id: newSig.id,
      role: meaning === 'PREPARED' ? 'compiler' : meaning === 'REVIEWED' ? 'reviewer' : 'approver',
      roleLabel: meaningDef?.label || meaning,
      userId: currentUserId,
      userName: '李思',
      signedAt: newSig.timestamp,
      ipAddress: '192.168.1.100',
      stampType: 'electronic',
      reason: meaningStatement || (meaningDef?.description || ''),
      passwordVerified: true,
    });

    return HttpResponse.json({ code: 200, message: '签名成功', data: newSig });
  }),

  // GET /api/v1/signatures/:id - Get signature details
  http.get(apiUrl('/signatures/:id'), ({ params }) => {
    const sig = mockDigitalSignatures.find((s: any) => s.id === params.id);
    if (!sig) {
      return HttpResponse.json({ code: 404, message: '签名记录不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json({ code: 200, message: 'success', data: sig });
  }),

  // GET /api/v1/signatures/document/:docId - Get document signatures
  http.get(apiUrl('/signatures/document/:docId'), ({ params }) => {
    const sigs = mockDigitalSignatures.filter((s: any) => s.documentId === params.docId);
    return HttpResponse.json({ code: 200, message: 'success', data: { list: sigs, total: sigs.length } });
  }),

  // POST /api/v1/signatures/verify - Verify signature
  http.post(apiUrl('/signatures/verify'), async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    const { documentId } = body;

    const report = mockReports.find((r: any) => r.id === documentId);
    if (!report) {
      return HttpResponse.json({ code: 404, message: '文档不存在', data: null }, { status: 404 });
    }

    const sigs = mockDigitalSignatures.filter((s: any) => s.documentId === documentId);
    const currentHash = computeDocumentHash(report);
    const allValidSigs = sigs.filter((s: any) => s.status === 'valid');
    const documentIntact = allValidSigs.length === 0 || allValidSigs.some((s: any) => s.documentHash === currentHash);
    const allCertsValid = allValidSigs.every((s: any) => {
      const cert = mockSm2Certificates.find((c: any) => c.id === s.signerCertId);
      return cert && cert.status === 'active';
    });

    const result: any = {
      valid: documentIntact && allCertsValid && allValidSigs.length > 0,
      documentIntact,
      signerVerified: allCertsValid,
      certValid: allCertsValid,
      timestampValid: true,
      signatures: allValidSigs.map((s: any) => {
        const meaningDef = signatureMeanings.find((m: any) => m.value === s.meaning);
        const cert = mockSm2Certificates.find((c: any) => c.id === s.signerCertId);
        return {
          signerName: s.signerName,
          meaning: s.meaning,
          meaningLabel: meaningDef?.label || s.meaning,
          time: s.timestamp,
          certSubject: cert?.certSubject || '',
          status: s.status,
        };
      }),
      details: documentIntact
        ? ['文档完整性验证通过', 'SM2 签名值验证通过', '签名证书状态有效']
        : ['⚠️ 文档已被篡改，签名验证失败'],
      verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    // Add audit log
    mockSignatureAuditLog.push({
      id: 'audit-' + Date.now(),
      signatureId: documentId,
      action: 'VERIFIED',
      operatorId: '',
      operatorName: '系统',
      details: `报告 ${report.reportNo} 签名验真: ${result.valid ? '有效' : '无效'}`,
      createdAt: result.verifiedAt,
    });

    return HttpResponse.json({ code: 200, message: 'success', data: result });
  }),

  // GET /api/v1/signatures/verify/qr/:docId - Public QR verification (no auth needed)
  http.get(apiUrl('/signatures/verify/qr/:docId'), ({ params }) => {
    const report = mockReports.find((r: any) => r.id === params.docId);
    if (!report) {
      return HttpResponse.json({ code: 404, message: '报告不存在', data: null }, { status: 404 });
    }

    const sigs = mockDigitalSignatures.filter((s: any) => s.documentId === params.docId);
    const currentHash = computeDocumentHash(report);
    const validSigs = sigs.filter((s: any) => s.status === 'valid' && s.documentHash === currentHash);

    const result: any = {
      reportNo: report.reportNo,
      title: report.title,
      customerName: report.customerName,
      issuedAt: report.issuedAt,
      signatures: validSigs.map((s: any) => {
        const meaningDef = signatureMeanings.find((m: any) => m.value === s.meaning);
        return {
          signerName: s.signerName,
          meaning: s.meaning,
          meaningLabel: meaningDef?.label || s.meaning,
          time: s.timestamp,
          status: s.status === 'valid' ? '有效' : '无效',
        };
      }),
      valid: validSigs.length > 0,
      verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    return HttpResponse.json({ code: 200, message: 'success', data: result });
  }),

  // ===== Certificate Management =====

  // POST /api/v1/certificates - Import certificate
  http.post(apiUrl('/certificates'), async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    const newCert: any = {
      id: 'cert-sm2-' + String(mockSm2Certificates.length + 1).padStart(3, '0'),
      userId: body.userId || '3',
      userName: body.userName || '新用户',
      certSubject: body.certSubject || 'CN=新用户, OU=实验室, O=红创检测认证有限公司',
      certIssuer: body.certIssuer || 'CN=红创CA, OU=CA, O=红创检测认证有限公司',
      serialNumber: body.serialNumber || `SM2-CERT-${Date.now()}`,
      algorithm: 'SM2',
      keyLength: 256,
      notBefore: body.notBefore || new Date().toISOString().slice(0, 10),
      notAfter: body.notAfter || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      status: 'active',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    mockSm2Certificates.push(newCert);
    return HttpResponse.json({ code: 200, message: '证书导入成功', data: newCert });
  }),

  // GET /api/v1/certificates - List certificates
  http.get(apiUrl('/certificates'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockSm2Certificates, total: mockSm2Certificates.length } });
  }),

  // GET /api/v1/certificates/:id - Certificate details
  http.get(apiUrl('/certificates/:id'), ({ params }) => {
    const cert = mockSm2Certificates.find((c: any) => c.id === params.id);
    if (!cert) {
      return HttpResponse.json({ code: 404, message: '证书不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json({ code: 200, message: 'success', data: cert });
  }),

  // POST /api/v1/certificates/:id/revoke - Revoke certificate
  http.post(apiUrl('/certificates/:id/revoke'), ({ params }) => {
    const cert = mockSm2Certificates.find((c: any) => c.id === params.id);
    if (!cert) {
      return HttpResponse.json({ code: 404, message: '证书不存在', data: null }, { status: 404 });
    }
    cert.status = 'revoked';
    cert.revokedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // Add audit log
    mockSignatureAuditLog.push({
      id: 'audit-' + Date.now(),
      signatureId: cert.id,
      action: 'REVOKED',
      operatorId: '2',
      operatorName: '张伟',
      details: `证书 ${cert.serialNumber} (${cert.userName}) 已被吊销`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });

    return HttpResponse.json({ code: 200, message: '证书已吊销', data: cert });
  }),

  // ===== Signature Audit Log =====

  // GET /api/v1/audit/signatures - Signature audit log
  http.get(apiUrl('/audit/signatures'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockSignatureAuditLog, total: mockSignatureAuditLog.length } });
  }),

  // ===== Workflow Engine =====
  http.get(apiUrl('/workflow/definitions'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockWorkflowDefinitions, total: mockWorkflowDefinitions.length } });
  }),

  http.post(apiUrl('/workflow/definitions'), async ({ request }) => {
    const body = (await request.json()) as Record<string, any>;
    const newDef = {
      id: 'wf' + Date.now(),
      ...body,
      version: 1,
      usedCount: 0,
      status: 'draft',
      createdBy: '当前用户',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    mockWorkflowDefinitions.push(newDef as any);
    return HttpResponse.json({ code: 200, message: 'success', data: newDef });
  }),

  http.put(apiUrl('/workflow/definitions/:id'), async ({ request, params }) => {
    const body = (await request.json()) as Record<string, any>;
    const idx = mockWorkflowDefinitions.findIndex((w) => w.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '流程不存在' }, { status: 404 });
    const updated = { ...mockWorkflowDefinitions[idx], ...body, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) };
    mockWorkflowDefinitions[idx] = updated as any;
    return HttpResponse.json({ code: 200, message: 'success', data: updated });
  }),

  http.delete(apiUrl('/workflow/definitions/:id'), ({ params }) => {
    const idx = mockWorkflowDefinitions.findIndex((w) => w.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '流程不存在' }, { status: 404 });
    mockWorkflowDefinitions.splice(idx, 1);
    return HttpResponse.json({ code: 200, message: '删除成功' });
  }),

  http.post(apiUrl('/workflow/definitions/:id/deploy'), ({ params }) => {
    const def = mockWorkflowDefinitions.find((w) => w.id === params.id);
    if (!def) return HttpResponse.json({ code: 404, message: '流程不存在' }, { status: 404 });
    def.status = 'deployed';
    def.version += 1;
    def.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    return HttpResponse.json({ code: 200, message: '部署成功', data: def });
  }),

  http.post(apiUrl('/workflow/definitions/:id/undeploy'), ({ params }) => {
    const def = mockWorkflowDefinitions.find((w) => w.id === params.id);
    if (!def) return HttpResponse.json({ code: 404, message: '流程不存在' }, { status: 404 });
    def.status = 'disabled';
    def.updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    return HttpResponse.json({ code: 200, message: '停用成功', data: def });
  }),

  http.get(apiUrl('/workflow/instances'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockWorkflowInstances, total: mockWorkflowInstances.length } });
  }),

  http.get(apiUrl('/workflow/instances/:id'), ({ params }) => {
    const inst = mockWorkflowInstances.find((w) => w.id === params.id);
    if (!inst) return HttpResponse.json({ code: 404, message: '实例不存在' }, { status: 404 });
    return HttpResponse.json({ code: 200, message: 'success', data: inst });
  }),

  http.post(apiUrl('/workflow/instances/:id/urge'), ({ params }) => {
    const inst = mockWorkflowInstances.find((w) => w.id === params.id);
    if (!inst) return HttpResponse.json({ code: 404, message: '实例不存在' }, { status: 404 });
    inst.history.push({
      id: 'h' + Date.now(),
      nodeId: inst.currentNodes[0] || '',
      nodeName: inst.currentNodeNames[0] || '',
      action: 'urge',
      operator: '当前用户',
      comment: '催办',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
    return HttpResponse.json({ code: 200, message: '催办通知已发送' });
  }),

  http.post(apiUrl('/workflow/instances/:id/transfer'), async ({ params, request }) => {
    const body = (await request.json()) as Record<string, any>;
    const inst = mockWorkflowInstances.find((w) => w.id === params.id);
    if (!inst) return HttpResponse.json({ code: 404, message: '实例不存在' }, { status: 404 });
    inst.assignees = [body.assignee as string];
    inst.history.push({
      id: 'h' + Date.now(),
      nodeId: inst.currentNodes[0] || '',
      nodeName: inst.currentNodeNames[0] || '',
      action: 'transfer',
      operator: '当前用户',
      comment: `转交给 ${body.assignee}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
    return HttpResponse.json({ code: 200, message: '转交成功' });
  }),

  http.post(apiUrl('/workflow/instances/:id/terminate'), async ({ params, request }) => {
    const body = (await request.json()) as Record<string, any>;
    const inst = mockWorkflowInstances.find((w) => w.id === params.id);
    if (!inst) return HttpResponse.json({ code: 404, message: '实例不存在' }, { status: 404 });
    inst.status = 'terminated';
    inst.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 16);
    inst.history.push({
      id: 'h' + Date.now(),
      nodeId: inst.currentNodes[0] || '',
      nodeName: inst.currentNodeNames[0] || '',
      action: 'terminated',
      operator: '当前用户',
      comment: body.reason as string || '手动终止',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
    return HttpResponse.json({ code: 200, message: '流程已终止' });
  }),
];
