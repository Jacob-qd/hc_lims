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
  generateCOCNumber,
  verifyChainIntegrity,
  type COCEvent,
  mockBackupList,
  mockSm2Certificates,
  mockDigitalSignatures,
  mockSignatureAuditLog,
  computeDocumentHash,
  mockSm2Sign,
  signatureMeanings,
  mockReportTemplates,
  mockChartComponents,
  mockReportSchedules,
  mockReportExecutions,
  mockDictTypes,
  mockDictItems,
  mockContracts,
  mockDataSources,
  mockCalibrationRecords,
  mockMaintenanceRecords,
  mockTurnaroundTrendReal,
} from './data';

const apiUrl = (path: string) => `/api/v1${path}`;

// ===================== Mobile Sampling =====================
const mockSamplingTasks = [
  {
    id: 'st1', taskNo: 'SMP-TASK-001', projectName: '东湖水质监测项目',
    sampleType: '地表水', assignedTo: '张三', planDate: '2026-05-17',
    status: 'in_progress',
    points: [
      { id: 'sp1', name: '东湖入口', location: { latitude: 30.274, longitude: 120.155, address: '东湖公园南门' }, expectedSampleType: '地表水', expectedCount: 2 },
      { id: 'sp2', name: '东湖中心', location: { latitude: 30.278, longitude: 120.162, address: '东湖湖心' }, expectedSampleType: '地表水', expectedCount: 1 },
    ],
  },
  {
    id: 'st2', taskNo: 'SMP-TASK-002', projectName: '工业园区土壤监测',
    sampleType: '土壤', assignedTo: '李四', planDate: '2026-05-18',
    status: 'pending',
    points: [
      { id: 'sp3', name: '园区A区', location: { latitude: 30.265, longitude: 120.145, address: '科技园区A栋' }, expectedSampleType: '土壤', expectedCount: 3 },
    ],
  },
];

const mockFieldSamples: any[] = [
  {
    id: 'fs1', sampleNo: 'FS-20260517-001', taskId: 'st1', pointId: 'sp1',
    name: '东湖入口-1', sampleType: '地表水',
    location: { latitude: 30.2741, longitude: 120.1552, accuracy: 8 },
    photos: [], fieldData: { pH: 7.2, temperature: 22.5, dissolvedOxygen: 6.8 },
    description: '东湖公园南门右侧采样', collectedAt: '2026-05-17T08:30:00Z',
    collectedBy: '张三', cocEventId: 'coc-ev-001', status: 'synced',
  },
];

const mobileSamplingHandlers = [
  http.get(apiUrl('/mobile/sampling-tasks'), ({ request }) => {
    const userId = new URL(request.url).searchParams.get('userId') || '';
    const tasks = userId
      ? mockSamplingTasks.filter(t => t.assignedTo === userId)
      : mockSamplingTasks;
    return HttpResponse.json({ code: 200, data: { list: tasks, total: tasks.length } });
  }),
  http.get(apiUrl('/mobile/sampling-tasks/:id'), ({ params }) => {
    const task = mockSamplingTasks.find(t => t.id === params.id);
    if (!task) return HttpResponse.json({ code: 404, message: '任务不存在' }, { status: 404 });
    return HttpResponse.json({ code: 200, data: task });
  }),
  http.get(apiUrl('/mobile/field-samples'), () => {
    return HttpResponse.json({ code: 200, data: { list: mockFieldSamples, total: mockFieldSamples.length } });
  }),
  http.post(apiUrl('/mobile/field-samples'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newSample = {
      id: `fs-${Date.now()}`,
      sampleNo: `FS-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(mockFieldSamples.length + 1).padStart(3,'0')}`,
      ...body,
      collectedAt: new Date().toISOString(),
      status: 'synced',
    };
    mockFieldSamples.push(newSample);
    return HttpResponse.json({ code: 200, data: newSample, message: '采样记录已保存' });
  }),
  http.post(apiUrl('/mobile/field-samples/:id/sync'), () => {
    return HttpResponse.json({ code: 200, message: '同步成功' });
  }),
];
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
    const detail = (mockSampleDetail as any)[params.id as string];
    if (!detail) {
      return HttpResponse.json({ code: 404, message: '样品详情不存在', data: null }, { status: 404 });
    }
    return HttpResponse.json({ code: 200, message: 'success', data: detail });
  }),

  http.post(apiUrl('/samples'), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const sampleNo = `SMP${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(mockSamples.length + 1).padStart(3, '0')}`;
    const newSample = {
      id: `s${mockSamples.length + 1}`,
      sampleNo,
      ...body,
      status: 'pending_receive',
      statusLabel: '待接收',
      flowStatus: 'pending_receive',
      flowStatusLabel: '待接收',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSamples.push(newSample as any);
    // Auto-create COC chain
    const cocId = `coc${Date.now()}`;
    const samplingTime = (body.samplingTime as string) || new Date().toISOString();
    const samplingLocation = (body.samplingLocation as string) || '未知地点';
    const cocChain = {
      id: cocId,
      cocNumber: generateCOCNumber(),
      sampleId: newSample.id,
      sampleName: (body.name as string) || sampleNo,
      status: 'active' as const,
      integrity: true,
      events: [{
        id: `evt${Date.now()}`,
        chainId: cocId,
        eventType: 'SAMPLING' as const,
        operatorName: (body.sampler as string) || '采样员',
        occurredAt: samplingTime,
        location: samplingLocation,
        notes: '样品创建时自动记录采样事件',
        prevEventId: null,
        metadata: { sampleNo, samplingMethod: (body.samplingMethod as string) || '常规采样' },
      }],
      createdAt: new Date().toISOString(),
    };
    mockCOCChains.push(cocChain as any);
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
    const body = (await request.json()) as any;
    const task: any = { id: 'tk' + Date.now(), taskNo: 'TK-2025-' + String(mockTasks.length + 1).padStart(3, '0'), ...body, createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) };
    mockTasks.push(task);
    return HttpResponse.json({ code: 200, data: task, message: '创建成功' });
  }),

  http.post(apiUrl('/tasks/:id/assign'), async ({ params, request }) => {
    const body = (await request.json()) as any;
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
    return HttpResponse.json({ code: 200, data: { ...(instrument as any), calibrations, maintenances } });
  }),

  http.post(apiUrl('/instruments'), async ({ request }) => {
    const body = (await request.json()) as any;
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
    const body = (await request.json()) as any;
    const item = { id: 'rp' + Date.now(), ...body };
    mockResearchProjects.push(item);
    return HttpResponse.json({ code: 200, data: item, message: '创建成功' });
  }),

  http.get(apiUrl('/research/eln-entries'), () => HttpResponse.json({ code: 200, data: { list: mockELNEntries } })),
  http.post(apiUrl('/research/eln-entries'), async ({ request }) => {
    const body = (await request.json()) as any;
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
    const body = (await request.json()) as any;
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
  http.get(apiUrl('/coc/chains/by-sample/:sid'), ({ params }) => {
    const chain = mockCOCChains.find(c => c.sampleId === params.sid);
    return chain
      ? HttpResponse.json({ code: 200, data: chain })
      : HttpResponse.json({ code: 404, message: '该样品暂无COC记录' }, { status: 404 });
  }),
  http.post(apiUrl('/coc/chains/:id/events'), async ({ params, request }) => {
    const body = await request.json() as any;
    const chain = mockCOCChains.find(c => c.id === params.id);
    if (!chain) return HttpResponse.json({ code: 404, message: '链不存在' }, { status: 404 });
    if (chain.status === 'disposed') return HttpResponse.json({ code: 400, message: '样品已处置，不可添加事件' }, { status: 400 });
    const events = chain.events || [];
    const prevId = events.length > 0 ? events[events.length - 1].id : null;
    const evt: COCEvent = {
      id: 'evt' + Date.now(), chainId: params.id as string, eventType: body.eventType,
      operatorName: body.operatorName || '当前用户',
      occurredAt: body.occurredAt || new Date().toISOString(),
      location: body.location || '实验室', notes: body.notes,
      metadata: body.metadata || {}, prevEventId: prevId,
      signature: body.signature,
    };
    events.push(evt as any);
    // Auto verify integrity
    const check = verifyChainIntegrity(events as COCEvent[]);
    Object.assign(chain, { integrity: check.valid, integrityMsg: check.valid ? undefined : check.msg });
    if (!check.valid) chain.status = 'broken';
    if (body.eventType === 'DISPOSAL') {
      chain.status = 'disposed';
      chain.completedAt = new Date().toISOString();
    }
    return HttpResponse.json({ code: 200, data: evt, message: '事件添加成功' });
  }),
  http.post(apiUrl('/coc/chains/:id/verify'), ({ params }) => {
    const chain = mockCOCChains.find(c => c.id === params.id);
    if (!chain) return HttpResponse.json({ code: 404, message: '链不存在' }, { status: 404 });
    const check = verifyChainIntegrity(chain.events as COCEvent[]);
    chain.integrity = check.valid;
    chain.integrityMsg = check.valid ? undefined : check.msg;
    if (!check.valid) chain.status = 'broken';
    return HttpResponse.json({ code: 200, data: { valid: check.valid, msg: check.msg }, message: check.valid ? '校验通过' : '链完整性异常' });
  }),
  http.post(apiUrl('/coc/transfer'), async ({ request }) => {
    const body = await request.json() as any;
    const chain = mockCOCChains.find(c => c.id === body.chainId);
    if (!chain) return HttpResponse.json({ code: 404, message: '链不存在' }, { status: 404 });
    const events = chain.events || [];
    const prevId = events.length > 0 ? events[events.length - 1].id : null;
    const now = new Date().toISOString();
    // Submission event (fromParty)
    events.push({
      id: 'evt' + Date.now(), chainId: body.chainId,
      eventType: 'SUBMISSION',
      operatorName: body.fromParty || '送样人',
      occurredAt: now, location: body.fromLocation || '交接点',
      notes: `送样: ${body.sampleCount}件, ${body.transportMode || '未知运输方式'}`,
      metadata: { fromParty: body.fromParty, sampleCount: body.sampleCount, transportMode: body.transportMode, temperature: body.temperature },
      prevEventId: prevId,
      signature: body.fromSignature,
    });
    // Receipt event (toParty)
    events.push({
      id: 'evt' + (Date.now() + 1), chainId: body.chainId,
      eventType: 'RECEIPT',
      operatorName: body.toParty || '收样人',
      occurredAt: now, location: body.toLocation || '收样室',
      notes: `收样确认: 完好${body.intactCount || body.sampleCount}件${body.damagedCount ? `,破损${body.damagedCount}件` : ''}${body.temperature ? `,温度${body.temperature}°C` : ''}`,
      metadata: { toParty: body.toParty, sampleCount: body.sampleCount, intactCount: body.intactCount, damagedCount: body.damagedCount, temperature: body.temperature },
      prevEventId: 'evt' + Date.now(),
      signature: body.toSignature,
    });
    // Auto verify
    const check = verifyChainIntegrity(events as COCEvent[]);
    Object.assign(chain, { integrity: check.valid, integrityMsg: check.valid ? undefined : check.msg });
    if (!check.valid) chain.status = 'broken';
    return HttpResponse.json({ code: 200, data: {}, message: '交接记录创建成功' });
  }),
  http.post(apiUrl('/coc/disposal'), async ({ request }) => {
    const body = await request.json() as any;
    const chain = mockCOCChains.find(c => c.id === body.chainId);
    if (!chain) return HttpResponse.json({ code: 404, message: '链不存在' }, { status: 404 });
    const events = chain.events || [];
    const prevId = events.length > 0 ? events[events.length - 1].id : null;
    events.push({
      id: 'evt' + Date.now(), chainId: body.chainId,
      eventType: 'DISPOSAL',
      operatorName: body.operatorName || '当前用户',
      occurredAt: body.disposalDate || new Date().toISOString(),
      location: body.location || '处置室',
      notes: `处置方式: ${body.disposalMethod}${body.reason ? `,原因: ${body.reason}` : ''}`,
      metadata: { disposalMethod: body.disposalMethod, reason: body.reason, approvedBy: body.approvedBy },
      prevEventId: prevId,
    });
    chain.status = 'disposed';
    chain.completedAt = new Date().toISOString();
    const check = verifyChainIntegrity(events as COCEvent[]);
    chain.integrity = check.valid;
    chain.integrityMsg = check.valid ? undefined : check.msg;
    return HttpResponse.json({ code: 200, data: {}, message: '样品处置记录成功' });
  }),
  http.get(apiUrl('/coc/print/:id'), ({ params }) => {
    const chain = mockCOCChains.find(c => c.id === params.id);
    if (!chain) return HttpResponse.json({ code: 404, message: '链不存在' }, { status: 404 });
    return HttpResponse.json({ code: 200, data: chain, message: 'COC表单数据已生成' });
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
    const configs = tmpl?.fieldConfigs || (mockFieldConfigs as any)[module as string] || [];
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

  // ============================================
  // Report Engine Handlers
  // ============================================
  http.get(apiUrl('/reports/templates'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockReportTemplates, total: mockReportTemplates.length } });
  }),
  http.post(apiUrl('/reports/templates'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newTemplate = { id: 'tmpl' + Date.now(), ...body, createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19), updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) };
    mockReportTemplates.push(newTemplate);
    return HttpResponse.json({ code: 200, message: 'success', data: newTemplate });
  }),
  http.put(apiUrl('/reports/templates/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockReportTemplates.findIndex(t => t.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '模板不存在' }, { status: 404 });
    mockReportTemplates[idx] = { ...mockReportTemplates[idx], ...body, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) };
    return HttpResponse.json({ code: 200, message: 'success', data: mockReportTemplates[idx] });
  }),
  http.delete(apiUrl('/reports/templates/:id'), ({ params }) => {
    const idx = mockReportTemplates.findIndex(t => t.id === params.id);
    if (idx >= 0) mockReportTemplates.splice(idx, 1);
    return HttpResponse.json({ code: 200, message: 'success' });
  }),
  http.get(apiUrl('/reports/templates/:id'), ({ params }) => {
    const tmpl = mockReportTemplates.find(t => t.id === params.id);
    if (!tmpl) return HttpResponse.json({ code: 404, message: '模板不存在' }, { status: 404 });
    return HttpResponse.json({ code: 200, message: 'success', data: tmpl });
  }),
  http.get(apiUrl('/reports/charts'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockChartComponents, total: mockChartComponents.length } });
  }),
  http.get(apiUrl('/reports/schedules'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockReportSchedules, total: mockReportSchedules.length } });
  }),
  http.post(apiUrl('/reports/schedules'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newSchedule = { id: 'sch' + Date.now(), ...body, enabled: true };
    mockReportSchedules.push(newSchedule);
    return HttpResponse.json({ code: 200, message: 'success', data: newSchedule });
  }),
  http.put(apiUrl('/reports/schedules/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockReportSchedules.findIndex(s => s.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '调度不存在' }, { status: 404 });
    mockReportSchedules[idx] = { ...mockReportSchedules[idx], ...body };
    return HttpResponse.json({ code: 200, message: 'success', data: mockReportSchedules[idx] });
  }),
  http.delete(apiUrl('/reports/schedules/:id'), ({ params }) => {
    const idx = mockReportSchedules.findIndex(s => s.id === params.id);
    if (idx >= 0) mockReportSchedules.splice(idx, 1);
    return HttpResponse.json({ code: 200, message: 'success' });
  }),
  http.get(apiUrl('/reports/executions'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockReportExecutions, total: mockReportExecutions.length } });
  }),
  http.post(apiUrl('/reports/executions'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newExec = { id: 'exec' + Date.now(), actualTime: new Date().toISOString().replace('T', ' ').slice(0, 19), ...body };
    mockReportExecutions.unshift(newExec);
    return HttpResponse.json({ code: 200, message: 'success', data: newExec });
  }),
  http.post(apiUrl('/reports/generate'), async ({ request }) => {
    const body = (await request.json()) as any;
    const reportId = body.reportId || body.templateId;
    const report = mockReportTemplates.find(t => t.id === reportId);
    const newExec = {
      id: 'exec' + Date.now(),
      reportId: reportId,
      reportName: report?.name || '未命名报表',
      scheduledTime: '-',
      actualTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: 'success',
      outputFile: `${report?.name || '报表'}_${new Date().toISOString().slice(0,10).replace(/-/g,'')}.${(report?.outputSettings?.format || 'PDF').toLowerCase()}`,
      outputSize: (Math.random() * 3 + 0.5).toFixed(1) + 'MB',
      triggerType: 'manual',
    };
    mockReportExecutions.unshift(newExec as any);
    return HttpResponse.json({ code: 200, message: 'success', data: newExec });
  }),
  http.get(apiUrl('/reports/data-sources'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockDataSources } });
  }),

  // ============================================
  // Dictionary Handlers
  // ============================================
  http.get(apiUrl('/dict-types'), () => {
    return HttpResponse.json({ code: 200, message: 'success', data: { list: mockDictTypes, total: mockDictTypes.length } });
  }),
  http.post(apiUrl('/dict-types'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newType = { id: 'dt' + Date.now(), ...body };
    mockDictTypes.push(newType);
    return HttpResponse.json({ code: 200, message: 'success', data: newType });
  }),
  http.put(apiUrl('/dict-types/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockDictTypes.findIndex(t => t.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '字典类型不存在' }, { status: 404 });
    mockDictTypes[idx] = { ...mockDictTypes[idx], ...body };
    return HttpResponse.json({ code: 200, message: 'success', data: mockDictTypes[idx] });
  }),
  http.delete(apiUrl('/dict-types/:id'), ({ params }) => {
    const idx = mockDictTypes.findIndex(t => t.id === params.id);
    if (idx >= 0) mockDictTypes.splice(idx, 1);
    mockDictItems.filter(i => i.typeId === params.id).forEach(i => {
      const ii = mockDictItems.findIndex(x => x.id === i.id);
      if (ii >= 0) mockDictItems.splice(ii, 1);
    });
    return HttpResponse.json({ code: 200, message: 'success' });
  }),
  http.get(apiUrl('/dict-items'), ({ request }) => {
    const url = new URL(request.url);
    const typeId = url.searchParams.get('typeId');
    let list = [...mockDictItems];
    if (typeId) list = list.filter(i => i.typeId === typeId);
    return HttpResponse.json({ code: 200, message: 'success', data: { list, total: list.length } });
  }),
  http.post(apiUrl('/dict-items'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newItem = { id: 'di' + Date.now(), ...body };
    mockDictItems.push(newItem);
    return HttpResponse.json({ code: 200, message: 'success', data: newItem });
  }),
  http.put(apiUrl('/dict-items/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockDictItems.findIndex(i => i.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '字典项不存在' }, { status: 404 });
    mockDictItems[idx] = { ...mockDictItems[idx], ...body };
    return HttpResponse.json({ code: 200, message: 'success', data: mockDictItems[idx] });
  }),
  http.delete(apiUrl('/dict-items/:id'), ({ params }) => {
    const idx = mockDictItems.findIndex(i => i.id === params.id);
    if (idx >= 0) mockDictItems.splice(idx, 1);
    return HttpResponse.json({ code: 200, message: 'success' });
  }),

  // ============================================
  // Contract Handlers
  // ============================================
  http.get(apiUrl('/contracts'), ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword');
    let filtered = [...mockContracts];
    if (status && status !== 'all') filtered = filtered.filter(c => c.status === status);
    if (keyword) {
      const kw = keyword.toLowerCase();
      filtered = filtered.filter(c => c.no.toLowerCase().includes(kw) || c.name.toLowerCase().includes(kw) || c.customerName.toLowerCase().includes(kw));
    }
    return HttpResponse.json({ code: 200, message: 'success', data: { list: filtered, total: filtered.length } });
  }),
  http.get(apiUrl('/contracts/:id'), ({ params }) => {
    const contract = mockContracts.find(c => c.id === params.id);
    if (!contract) return HttpResponse.json({ code: 404, message: '合同不存在' }, { status: 404 });
    return HttpResponse.json({ code: 200, message: 'success', data: contract });
  }),
  http.post(apiUrl('/contracts'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newContract = {
      id: 'ct' + Date.now(),
      no: body.no || `CT-${new Date().getFullYear()}-${String(mockContracts.length + 1).padStart(3, '0')}`,
      ...body,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    mockContracts.push(newContract);
    return HttpResponse.json({ code: 200, message: 'success', data: newContract });
  }),
  http.put(apiUrl('/contracts/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockContracts.findIndex(c => c.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '合同不存在' }, { status: 404 });
    mockContracts[idx] = { ...mockContracts[idx], ...body, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) };
    return HttpResponse.json({ code: 200, message: 'success', data: mockContracts[idx] });
  }),
  http.delete(apiUrl('/contracts/:id'), ({ params }) => {
    const idx = mockContracts.findIndex(c => c.id === params.id);
    if (idx >= 0) mockContracts.splice(idx, 1);
    return HttpResponse.json({ code: 200, message: 'success' });
  }),
  ...mobileSamplingHandlers,
];

