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
  mockWorkflowDefinitions,
  mockWorkflowInstances,
  type WorkflowDefinition,
  type WorkflowInstance,
  mockScanReceipts,
  mockMessages,
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

const mockClients = [
  { id: "c1", name: "绿源环保科技有限公司", shortName: "绿源环保", type: "企业", industry: "环保", contact: "王经理", phone: "138-0001-1234", email: "wang@lyep.com", address: "杭州市西湖区文一路88号", credit: "A", status: "active", source: "自行开发", samples: 248, contracts: 3, createdAt: "2024-01-15", updatedAt: "2026-05-01" },
  { id: "c2", name: "博克水务集团", shortName: "博克水务", type: "企业", industry: "水务", contact: "李主任", phone: "139-0002-5678", email: "li@bksw.com", address: "上海市浦东新区张江路100号", credit: "A", status: "active", source: "客户推荐", samples: 196, contracts: 5, createdAt: "2024-03-01", updatedAt: "2026-04-28" },
  { id: "c3", name: "清源化工有限公司", shortName: "清源化工", type: "企业", industry: "化工", contact: "赵总", phone: "137-0003-9012", email: "zhao@qyhg.cn", credit: "B", status: "active", source: "展会", samples: 128, contracts: 2, createdAt: "2024-06-10", updatedAt: "2026-05-05" },
  { id: "c4", name: "蓝天环境监测站", shortName: "蓝天监测", type: "政府", industry: "环保", contact: "刘站长", phone: "136-0004-3456", email: "liu@lthj.gov.cn", credit: "A", status: "active", source: "招投标", samples: 96, contracts: 1, createdAt: "2024-08-20", updatedAt: "2026-03-15" },
  { id: "c5", name: "宏达食品有限公司", shortName: "宏达食品", type: "企业", industry: "食品", contact: "陈经理", phone: "135-0005-7890", email: "chen@hdship.com", credit: "B", status: "active", source: "自行开发", samples: 78, contracts: 2, createdAt: "2025-01-05", updatedAt: "2026-04-20" },
  { id: "c6", name: "康源医药集团", shortName: "康源医药", type: "企业", industry: "医药", contact: "孙经理", phone: "133-0007-6789", email: "sun@kyyy.com", credit: "C", status: "suspended", source: "线上渠道", samples: 54, contracts: 1, createdAt: "2025-03-12", updatedAt: "2026-02-01" },
];

let _mockQuotations: any[] = [];
let _mockOrders: any[] = [];

const clientsHandlers = [
  http.get(apiUrl('/clients'), () => HttpResponse.json({ code: 200, data: { list: mockClients, total: mockClients.length } })),
  http.post(apiUrl('/clients'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newClient = { id: `c${Date.now()}`, ...body, samples: 0, contracts: 0, createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) };
    mockClients.push(newClient);
    return HttpResponse.json({ code: 200, message: 'success', data: newClient });
  }),
  http.put(apiUrl('/clients/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockClients.findIndex((c: any) => c.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '客户不存在' }, { status: 404 });
    mockClients[idx] = { ...mockClients[idx], ...body, updatedAt: new Date().toISOString().slice(0, 10) };
    return HttpResponse.json({ code: 200, message: 'success', data: mockClients[idx] });
  }),
  http.delete(apiUrl('/clients/:id'), ({ params }) => {
    const idx = mockClients.findIndex((c: any) => c.id === params.id);
    if (idx >= 0) mockClients.splice(idx, 1);
    return HttpResponse.json({ code: 200, message: 'success' });
  }),

  // AI Assistant
  http.post(apiUrl('/ai/chat'), async ({ request }) => {
    const body = (await request.json()) as any;
    const msg = body.message || '';
    let reply = '';
    if (msg.includes('不合格')) reply = '本周不合格样品共 3 批次，主要集中在重金属检测（2 批次）和微生物检测（1 批次）。';
    else if (msg.includes('报告')) reply = '上周共生成检测报告 156 份，其中 148 份已通过审核，8 份正在审核中。';
    else if (msg.includes('质控')) reply = '近 30 天质控合格率 98.7%，其中有 2 次警告（铅标准品漂移）。';
    else if (msg.includes('预测')) reply = '基于当前排程，预计平均检测周期为 4.2 天，较上周缩短 0.5 天。';
    else reply = '收到您的问题：' + msg + '\n\n我是HC-LIMS AI助手，可以帮您查询样品状态、分析数据趋势、生成报告建议等。';
    return HttpResponse.json({ code: 200, data: { reply, suggestions: ['查看详细报告', '导出数据', '设置预警'] } });
  }),

  // AI Anomaly Dashboard
  http.get(apiUrl('/ai/anomaly/dashboard'), () => {
    const alerts = [
      { id: 'a1', level: 'critical', title: '铅标准品超标', description: '质控样 Pb 浓度 12.5 mg/L，超出控制限（10.0 mg/L）', source: '质控管理', occurredAt: '2025-08-15 09:30:00', status: 'active', suggestedAction: '重新配制标准品并校准仪器' },
      { id: 'a2', level: 'warning', title: '检测周期延长', description: '近 3 天平均检测周期 5.8 天，超出目标值 5.0 天', source: '任务管理', occurredAt: '2025-08-14 16:00:00', status: 'active', suggestedAction: '检查任务分配和仪器负载' },
      { id: 'a3', level: 'info', title: '新设备校准到期', description: 'ICP-MS 年度校准将于 2025-09-01 到期', source: '仪器管理', occurredAt: '2025-08-13 10:00:00', status: 'resolved', suggestedAction: '已预约校准服务' },
    ];
    const predictions = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i + 1);
      return { date: date.toISOString().slice(0, 10), predicted: 4.2 + Math.random() * 0.8 - 0.4, lower: 3.5, upper: 5.0 };
    });
    return HttpResponse.json({ code: 200, data: { riskScore: 62, alerts, predictions } });
  }),

  // ELN Templates
  http.get(apiUrl('/eln/templates'), () => HttpResponse.json({ code: 200, data: { list: [
    { id: 't1', name: '水质检测原始记录', category: '环境检测', fields: [
      { id: 'f1', label: '样品编号', type: 'text', required: true },
      { id: 'f2', label: '检测项目', type: 'select', required: true, options: ['pH', 'COD', '重金属', '微生物'] },
      { id: 'f3', label: '检测结果', type: 'table', required: true },
      { id: 'f4', label: '检测方法', type: 'select', required: true, options: ['GB/T 5750', 'HJ 828'] },
    ]},
    { id: 't2', name: '食品微生物检验记录', category: '食品检测', fields: [
      { id: 'f5', label: '样品名称', type: 'text', required: true },
      { id: 'f6', label: '培养条件', type: 'text', required: true },
      { id: 'f7', label: '菌落计数', type: 'table', required: true },
    ]},
  ]}})),

  // Achievements
  http.get(apiUrl('/achievements/statistics'), () => HttpResponse.json({ code: 200, data: {
    total: 12, paperCount: 5, patentCount: 3, awardCount: 2, completionCount: 2, totalCitations: 186,
  }})),
  http.post(apiUrl('/achievements'), async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({ code: 200, data: { id: 'ach' + Date.now(), ...body } });
  }),
  http.delete(apiUrl('/achievements/:id'), () => HttpResponse.json({ code: 200 })),

  // Teaching CRUD
  http.post(apiUrl('/teaching/courses'), async ({ request }) => {
    const body = (await request.json()) as any;
    const course = { id: 'c' + Date.now(), ...body, status: 'active', statusLabel: '开课中' };
    mockCourses.push(course);
    return HttpResponse.json({ code: 200, data: course });
  }),
  http.put(apiUrl('/teaching/courses/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses[idx] = { ...mockCourses[idx], ...body };
    return HttpResponse.json({ code: 200, data: mockCourses[idx] });
  }),
  http.delete(apiUrl('/teaching/courses/:id'), ({ params }) => {
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses.splice(idx, 1);
    return HttpResponse.json({ code: 200 });
  }),
];

const quotationsHandlers = [
  http.get(apiUrl('/quotations'), () => HttpResponse.json({ code: 200, data: { list: _mockQuotations, total: _mockQuotations.length } })),
  http.post(apiUrl('/quotations'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newQ = { id: `q${Date.now()}`, no: `Q-${new Date().getFullYear()}-${String(_mockQuotations.length + 1).padStart(3, '0')}`, ...body, createdAt: new Date().toISOString().slice(0, 10) };
    _mockQuotations.push(newQ);
    return HttpResponse.json({ code: 200, message: 'success', data: newQ });
  }),
  http.put(apiUrl('/quotations/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = _mockQuotations.findIndex((q: any) => q.id === params.id);
    if (idx >= 0) _mockQuotations[idx] = { ..._mockQuotations[idx], ...body };
    return HttpResponse.json({ code: 200, message: 'success' });
  }),

  // AI Assistant
  http.post(apiUrl('/ai/chat'), async ({ request }) => {
    const body = (await request.json()) as any;
    const msg = body.message || '';
    let reply = '';
    if (msg.includes('不合格')) reply = '本周不合格样品共 3 批次，主要集中在重金属检测（2 批次）和微生物检测（1 批次）。';
    else if (msg.includes('报告')) reply = '上周共生成检测报告 156 份，其中 148 份已通过审核，8 份正在审核中。';
    else if (msg.includes('质控')) reply = '近 30 天质控合格率 98.7%，其中有 2 次警告（铅标准品漂移）。';
    else if (msg.includes('预测')) reply = '基于当前排程，预计平均检测周期为 4.2 天，较上周缩短 0.5 天。';
    else reply = '收到您的问题：' + msg + '\n\n我是HC-LIMS AI助手，可以帮您查询样品状态、分析数据趋势、生成报告建议等。';
    return HttpResponse.json({ code: 200, data: { reply, suggestions: ['查看详细报告', '导出数据', '设置预警'] } });
  }),

  // AI Anomaly Dashboard
  http.get(apiUrl('/ai/anomaly/dashboard'), () => {
    const alerts = [
      { id: 'a1', level: 'critical', title: '铅标准品超标', description: '质控样 Pb 浓度 12.5 mg/L，超出控制限（10.0 mg/L）', source: '质控管理', occurredAt: '2025-08-15 09:30:00', status: 'active', suggestedAction: '重新配制标准品并校准仪器' },
      { id: 'a2', level: 'warning', title: '检测周期延长', description: '近 3 天平均检测周期 5.8 天，超出目标值 5.0 天', source: '任务管理', occurredAt: '2025-08-14 16:00:00', status: 'active', suggestedAction: '检查任务分配和仪器负载' },
      { id: 'a3', level: 'info', title: '新设备校准到期', description: 'ICP-MS 年度校准将于 2025-09-01 到期', source: '仪器管理', occurredAt: '2025-08-13 10:00:00', status: 'resolved', suggestedAction: '已预约校准服务' },
    ];
    const predictions = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i + 1);
      return { date: date.toISOString().slice(0, 10), predicted: 4.2 + Math.random() * 0.8 - 0.4, lower: 3.5, upper: 5.0 };
    });
    return HttpResponse.json({ code: 200, data: { riskScore: 62, alerts, predictions } });
  }),

  // ELN Templates
  http.get(apiUrl('/eln/templates'), () => HttpResponse.json({ code: 200, data: { list: [
    { id: 't1', name: '水质检测原始记录', category: '环境检测', fields: [
      { id: 'f1', label: '样品编号', type: 'text', required: true },
      { id: 'f2', label: '检测项目', type: 'select', required: true, options: ['pH', 'COD', '重金属', '微生物'] },
      { id: 'f3', label: '检测结果', type: 'table', required: true },
      { id: 'f4', label: '检测方法', type: 'select', required: true, options: ['GB/T 5750', 'HJ 828'] },
    ]},
    { id: 't2', name: '食品微生物检验记录', category: '食品检测', fields: [
      { id: 'f5', label: '样品名称', type: 'text', required: true },
      { id: 'f6', label: '培养条件', type: 'text', required: true },
      { id: 'f7', label: '菌落计数', type: 'table', required: true },
    ]},
  ]}})),

  // Achievements
  http.get(apiUrl('/achievements/statistics'), () => HttpResponse.json({ code: 200, data: {
    total: 12, paperCount: 5, patentCount: 3, awardCount: 2, completionCount: 2, totalCitations: 186,
  }})),
  http.post(apiUrl('/achievements'), async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({ code: 200, data: { id: 'ach' + Date.now(), ...body } });
  }),
  http.delete(apiUrl('/achievements/:id'), () => HttpResponse.json({ code: 200 })),

  // Teaching CRUD
  http.post(apiUrl('/teaching/courses'), async ({ request }) => {
    const body = (await request.json()) as any;
    const course = { id: 'c' + Date.now(), ...body, status: 'active', statusLabel: '开课中' };
    mockCourses.push(course);
    return HttpResponse.json({ code: 200, data: course });
  }),
  http.put(apiUrl('/teaching/courses/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses[idx] = { ...mockCourses[idx], ...body };
    return HttpResponse.json({ code: 200, data: mockCourses[idx] });
  }),
  http.delete(apiUrl('/teaching/courses/:id'), ({ params }) => {
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses.splice(idx, 1);
    return HttpResponse.json({ code: 200 });
  }),
];

const ordersHandlers = [
  http.get(apiUrl('/orders'), () => HttpResponse.json({ code: 200, data: { list: _mockOrders, total: _mockOrders.length } })),
  http.post(apiUrl('/orders'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newOrder = { id: `o${Date.now()}`, no: `ORD-${new Date().getFullYear()}-${String(_mockOrders.length + 1).padStart(3, '0')}`, ...body, paidAmount: 0, samples: [], createdAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) };
    _mockOrders.push(newOrder);
    return HttpResponse.json({ code: 200, message: 'success', data: newOrder });
  }),

  // AI Assistant
  http.post(apiUrl('/ai/chat'), async ({ request }) => {
    const body = (await request.json()) as any;
    const msg = body.message || '';
    let reply = '';
    if (msg.includes('不合格')) reply = '本周不合格样品共 3 批次，主要集中在重金属检测（2 批次）和微生物检测（1 批次）。';
    else if (msg.includes('报告')) reply = '上周共生成检测报告 156 份，其中 148 份已通过审核，8 份正在审核中。';
    else if (msg.includes('质控')) reply = '近 30 天质控合格率 98.7%，其中有 2 次警告（铅标准品漂移）。';
    else if (msg.includes('预测')) reply = '基于当前排程，预计平均检测周期为 4.2 天，较上周缩短 0.5 天。';
    else reply = '收到您的问题：' + msg + '\n\n我是HC-LIMS AI助手，可以帮您查询样品状态、分析数据趋势、生成报告建议等。';
    return HttpResponse.json({ code: 200, data: { reply, suggestions: ['查看详细报告', '导出数据', '设置预警'] } });
  }),

  // AI Anomaly Dashboard
  http.get(apiUrl('/ai/anomaly/dashboard'), () => {
    const alerts = [
      { id: 'a1', level: 'critical', title: '铅标准品超标', description: '质控样 Pb 浓度 12.5 mg/L，超出控制限（10.0 mg/L）', source: '质控管理', occurredAt: '2025-08-15 09:30:00', status: 'active', suggestedAction: '重新配制标准品并校准仪器' },
      { id: 'a2', level: 'warning', title: '检测周期延长', description: '近 3 天平均检测周期 5.8 天，超出目标值 5.0 天', source: '任务管理', occurredAt: '2025-08-14 16:00:00', status: 'active', suggestedAction: '检查任务分配和仪器负载' },
      { id: 'a3', level: 'info', title: '新设备校准到期', description: 'ICP-MS 年度校准将于 2025-09-01 到期', source: '仪器管理', occurredAt: '2025-08-13 10:00:00', status: 'resolved', suggestedAction: '已预约校准服务' },
    ];
    const predictions = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i + 1);
      return { date: date.toISOString().slice(0, 10), predicted: 4.2 + Math.random() * 0.8 - 0.4, lower: 3.5, upper: 5.0 };
    });
    return HttpResponse.json({ code: 200, data: { riskScore: 62, alerts, predictions } });
  }),

  // ELN Templates
  http.get(apiUrl('/eln/templates'), () => HttpResponse.json({ code: 200, data: { list: [
    { id: 't1', name: '水质检测原始记录', category: '环境检测', fields: [
      { id: 'f1', label: '样品编号', type: 'text', required: true },
      { id: 'f2', label: '检测项目', type: 'select', required: true, options: ['pH', 'COD', '重金属', '微生物'] },
      { id: 'f3', label: '检测结果', type: 'table', required: true },
      { id: 'f4', label: '检测方法', type: 'select', required: true, options: ['GB/T 5750', 'HJ 828'] },
    ]},
    { id: 't2', name: '食品微生物检验记录', category: '食品检测', fields: [
      { id: 'f5', label: '样品名称', type: 'text', required: true },
      { id: 'f6', label: '培养条件', type: 'text', required: true },
      { id: 'f7', label: '菌落计数', type: 'table', required: true },
    ]},
  ]}})),

  // Achievements
  http.get(apiUrl('/achievements/statistics'), () => HttpResponse.json({ code: 200, data: {
    total: 12, paperCount: 5, patentCount: 3, awardCount: 2, completionCount: 2, totalCitations: 186,
  }})),
  http.post(apiUrl('/achievements'), async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({ code: 200, data: { id: 'ach' + Date.now(), ...body } });
  }),
  http.delete(apiUrl('/achievements/:id'), () => HttpResponse.json({ code: 200 })),

  // Teaching CRUD
  http.post(apiUrl('/teaching/courses'), async ({ request }) => {
    const body = (await request.json()) as any;
    const course = { id: 'c' + Date.now(), ...body, status: 'active', statusLabel: '开课中' };
    mockCourses.push(course);
    return HttpResponse.json({ code: 200, data: course });
  }),
  http.put(apiUrl('/teaching/courses/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses[idx] = { ...mockCourses[idx], ...body };
    return HttpResponse.json({ code: 200, data: mockCourses[idx] });
  }),
  http.delete(apiUrl('/teaching/courses/:id'), ({ params }) => {
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses.splice(idx, 1);
    return HttpResponse.json({ code: 200 });
  }),
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

  // AI Assistant
  http.post(apiUrl('/ai/chat'), async ({ request }) => {
    const body = (await request.json()) as any;
    const msg = body.message || '';
    let reply = '';
    if (msg.includes('不合格')) reply = '本周不合格样品共 3 批次，主要集中在重金属检测（2 批次）和微生物检测（1 批次）。';
    else if (msg.includes('报告')) reply = '上周共生成检测报告 156 份，其中 148 份已通过审核，8 份正在审核中。';
    else if (msg.includes('质控')) reply = '近 30 天质控合格率 98.7%，其中有 2 次警告（铅标准品漂移）。';
    else if (msg.includes('预测')) reply = '基于当前排程，预计平均检测周期为 4.2 天，较上周缩短 0.5 天。';
    else reply = '收到您的问题：' + msg + '\n\n我是HC-LIMS AI助手，可以帮您查询样品状态、分析数据趋势、生成报告建议等。';
    return HttpResponse.json({ code: 200, data: { reply, suggestions: ['查看详细报告', '导出数据', '设置预警'] } });
  }),

  // AI Anomaly Dashboard
  http.get(apiUrl('/ai/anomaly/dashboard'), () => {
    const alerts = [
      { id: 'a1', level: 'critical', title: '铅标准品超标', description: '质控样 Pb 浓度 12.5 mg/L，超出控制限（10.0 mg/L）', source: '质控管理', occurredAt: '2025-08-15 09:30:00', status: 'active', suggestedAction: '重新配制标准品并校准仪器' },
      { id: 'a2', level: 'warning', title: '检测周期延长', description: '近 3 天平均检测周期 5.8 天，超出目标值 5.0 天', source: '任务管理', occurredAt: '2025-08-14 16:00:00', status: 'active', suggestedAction: '检查任务分配和仪器负载' },
      { id: 'a3', level: 'info', title: '新设备校准到期', description: 'ICP-MS 年度校准将于 2025-09-01 到期', source: '仪器管理', occurredAt: '2025-08-13 10:00:00', status: 'resolved', suggestedAction: '已预约校准服务' },
    ];
    const predictions = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i + 1);
      return { date: date.toISOString().slice(0, 10), predicted: 4.2 + Math.random() * 0.8 - 0.4, lower: 3.5, upper: 5.0 };
    });
    return HttpResponse.json({ code: 200, data: { riskScore: 62, alerts, predictions } });
  }),

  // ELN Templates
  http.get(apiUrl('/eln/templates'), () => HttpResponse.json({ code: 200, data: { list: [
    { id: 't1', name: '水质检测原始记录', category: '环境检测', fields: [
      { id: 'f1', label: '样品编号', type: 'text', required: true },
      { id: 'f2', label: '检测项目', type: 'select', required: true, options: ['pH', 'COD', '重金属', '微生物'] },
      { id: 'f3', label: '检测结果', type: 'table', required: true },
      { id: 'f4', label: '检测方法', type: 'select', required: true, options: ['GB/T 5750', 'HJ 828'] },
    ]},
    { id: 't2', name: '食品微生物检验记录', category: '食品检测', fields: [
      { id: 'f5', label: '样品名称', type: 'text', required: true },
      { id: 'f6', label: '培养条件', type: 'text', required: true },
      { id: 'f7', label: '菌落计数', type: 'table', required: true },
    ]},
  ]}})),

  // Achievements
  http.get(apiUrl('/achievements/statistics'), () => HttpResponse.json({ code: 200, data: {
    total: 12, paperCount: 5, patentCount: 3, awardCount: 2, completionCount: 2, totalCitations: 186,
  }})),
  http.post(apiUrl('/achievements'), async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({ code: 200, data: { id: 'ach' + Date.now(), ...body } });
  }),
  http.delete(apiUrl('/achievements/:id'), () => HttpResponse.json({ code: 200 })),

  // Teaching CRUD
  http.post(apiUrl('/teaching/courses'), async ({ request }) => {
    const body = (await request.json()) as any;
    const course = { id: 'c' + Date.now(), ...body, status: 'active', statusLabel: '开课中' };
    mockCourses.push(course);
    return HttpResponse.json({ code: 200, data: course });
  }),
  http.put(apiUrl('/teaching/courses/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses[idx] = { ...mockCourses[idx], ...body };
    return HttpResponse.json({ code: 200, data: mockCourses[idx] });
  }),
  http.delete(apiUrl('/teaching/courses/:id'), ({ params }) => {
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses.splice(idx, 1);
    return HttpResponse.json({ code: 200 });
  }),

  // ===== Mobile Scan Receipt =====
  http.get(apiUrl('/mobile/scan-receipts'), () => {
    return HttpResponse.json({ code: 200, data: { list: mockScanReceipts, total: mockScanReceipts.length } });
  }),
  http.post(apiUrl('/mobile/scan-receipt'), async ({ request }) => {
    const body = (await request.json()) as any;
    const receipt = {
      id: `sr-${Date.now()}`,
      ...body,
      status: 'received',
    };
    mockScanReceipts.push(receipt);
    // Update sample status to received
    const sample = mockSamples.find(s => s.id === body.sampleId);
    if (sample) sample.status = 'received';
    return HttpResponse.json({ code: 200, data: receipt, message: '签收成功' });
  }),

  // ===== Mobile Result Entry =====
  http.get(apiUrl('/mobile/my-tasks'), () => {
    return HttpResponse.json({ code: 200, data: { list: mockTasks, total: mockTasks.length } });
  }),
  http.post(apiUrl('/mobile/tasks/:id/results'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const task = mockTasks.find(t => t.id === params.id);
    if (task) {
      task.status = 'pending_review';
      task.statusLabel = '待审核';
      task.progress = 100;
    }
    return HttpResponse.json({ code: 200, data: { taskId: params.id, ...body }, message: '结果已提交' });
  }),

  // ===== Mobile Reports =====
  http.get(apiUrl('/mobile/reports'), () => {
    const mobileReports = mockReports.map(r => ({
      id: r.id,
      reportNo: r.reportNo,
      title: r.title,
      sampleName: r.sampleNos.join('、') || r.projectName,
      issueDate: r.issuedAt?.slice(0, 10) || r.createdAt?.slice(0, 10),
      status: r.status,
      statusLabel: r.statusLabel,
      signed: r.status === 'signed',
      customerName: r.customerName,
      testItems: r.testResults.map((t: any) => t.item).join('、'),
    }));
    return HttpResponse.json({ code: 200, data: { list: mobileReports, total: mobileReports.length } });
  }),
  http.post(apiUrl('/mobile/reports/:id/sign'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const report = mockReports.find(r => r.id === params.id);
    if (report) {
      report.status = 'signed';
      report.statusLabel = '已签收';
    }
    return HttpResponse.json({ code: 200, data: { reportId: params.id, ...body }, message: '签名确认成功' });
  }),

  // ===== Mobile Profile =====
  http.get(apiUrl('/mobile/profile'), () => {
    const user = mockUsers[0];
    return HttpResponse.json({ code: 200, data: {
      id: user.id, username: user.username, realName: user.realName,
      role: user.role, roleLabel: (user as any).roleLabel || '管理员', department: user.department,
      phone: (user as any).phone || '13800138001', email: (user as any).email || 'admin@hc-lims.com', status: (user as any).status || 'active',
    }});
  }),
  http.get(apiUrl('/mobile/messages'), () => {
    return HttpResponse.json({ code: 200, data: { list: mockMessages.slice(0, 5), total: 5 } });
  }),
];

export const handlers = [
  // Auth
  http.post(apiUrl('/auth/login'), async ({ request }) => {
    const body = (await request.json()) as { username: string; password: string; role?: string };
    // 先尝试匹配用户名+密码+角色
    let user = mockUsers.find(
      (u) => u.username === body.username && u.password === body.password && u.role === body.role
    );
    // 如果没找到，回退到仅匹配用户名+密码（管理员可跨角色登录）
    if (!user) {
      user = mockUsers.find(
        (u) => u.username === body.username && u.password === body.password
      );
    }

    if (!user) {
      return HttpResponse.json(
        { code: 401, message: '用户名或密码错误', data: null },
        { status: 401 }
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

  // ============================================
  // Workflow Engine Handlers
  // ============================================
  http.get(apiUrl('/workflow/definitions'), ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const keyword = url.searchParams.get('keyword');
    let list = [...mockWorkflowDefinitions];
    if (status && status !== 'all') list = list.filter(d => d.status === status);
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(d => d.name.toLowerCase().includes(kw) || d.type.toLowerCase().includes(kw));
    }
    return HttpResponse.json({ code: 200, message: 'success', data: { list, total: list.length } });
  }),
  http.post(apiUrl('/workflow/definitions'), async ({ request }) => {
    const body = (await request.json()) as any;
    const newDef: WorkflowDefinition = {
      id: 'wf' + Date.now(),
      name: body.name || '未命名流程',
      type: body.type || '通用',
      description: body.description || '',
      nodes: body.nodes || [],
      edges: body.edges || [],
      status: 'draft',
      version: 1,
      usedCount: 0,
      createdBy: '当前用户',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };
    mockWorkflowDefinitions.push(newDef);
    return HttpResponse.json({ code: 200, message: 'success', data: newDef });
  }),
  http.put(apiUrl('/workflow/definitions/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockWorkflowDefinitions.findIndex(d => d.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '流程定义不存在' }, { status: 404 });
    mockWorkflowDefinitions[idx] = { ...mockWorkflowDefinitions[idx], ...body, updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19) };
    return HttpResponse.json({ code: 200, message: 'success', data: mockWorkflowDefinitions[idx] });
  }),
  http.delete(apiUrl('/workflow/definitions/:id'), ({ params }) => {
    const idx = mockWorkflowDefinitions.findIndex(d => d.id === params.id);
    if (idx >= 0) mockWorkflowDefinitions.splice(idx, 1);
    return HttpResponse.json({ code: 200, message: 'success' });
  }),
  http.post(apiUrl('/workflow/definitions/:id/deploy'), ({ params }) => {
    const idx = mockWorkflowDefinitions.findIndex(d => d.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '流程定义不存在' }, { status: 404 });
    mockWorkflowDefinitions[idx].status = 'deployed';
    mockWorkflowDefinitions[idx].version += 1;
    mockWorkflowDefinitions[idx].updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return HttpResponse.json({ code: 200, message: '部署成功', data: mockWorkflowDefinitions[idx] });
  }),
  http.post(apiUrl('/workflow/definitions/:id/undeploy'), ({ params }) => {
    const idx = mockWorkflowDefinitions.findIndex(d => d.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '流程定义不存在' }, { status: 404 });
    mockWorkflowDefinitions[idx].status = 'disabled';
    mockWorkflowDefinitions[idx].updatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return HttpResponse.json({ code: 200, message: '停用成功', data: mockWorkflowDefinitions[idx] });
  }),
  http.get(apiUrl('/workflow/instances'), ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const defId = url.searchParams.get('defId');
    let list = [...mockWorkflowInstances];
    if (status && status !== 'all') list = list.filter(i => i.status === status);
    if (defId) list = list.filter(i => i.defId === defId);
    return HttpResponse.json({ code: 200, message: 'success', data: { list, total: list.length } });
  }),
  http.get(apiUrl('/workflow/instances/:id'), ({ params }) => {
    const inst = mockWorkflowInstances.find(i => i.id === params.id);
    if (!inst) return HttpResponse.json({ code: 404, message: '流程实例不存在' }, { status: 404 });
    return HttpResponse.json({ code: 200, message: 'success', data: inst });
  }),
  http.post(apiUrl('/workflow/instances'), async ({ request }) => {
    const body = (await request.json()) as any;
    const def = mockWorkflowDefinitions.find(d => d.id === body.defId);
    const newInst: WorkflowInstance = {
      id: 'wi' + Date.now(),
      defId: body.defId,
      defName: def?.name || '未知流程',
      defVersion: def?.version || 1,
      businessType: body.businessType || '通用',
      businessId: body.businessId || '',
      businessSummary: body.businessSummary || '',
      status: 'running',
      currentNodes: def?.nodes.filter(n => n.type === 'start').map(n => n.id) || [],
      currentNodeNames: def?.nodes.filter(n => n.type === 'start').map(n => n.name) || [],
      assignees: [],
      variables: body.variables || {},
      startedBy: '当前用户',
      startedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      history: [{ id: 'h' + Date.now(), nodeId: 'start', nodeName: '开始', action: 'start', operator: '系统', timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) }],
    };
    mockWorkflowInstances.push(newInst);
    return HttpResponse.json({ code: 200, message: 'success', data: newInst });
  }),
  http.post(apiUrl('/workflow/instances/:id/terminate'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockWorkflowInstances.findIndex(i => i.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '流程实例不存在' }, { status: 404 });
    mockWorkflowInstances[idx].status = 'terminated';
    mockWorkflowInstances[idx].completedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    mockWorkflowInstances[idx].history.push({
      id: 'h' + Date.now(),
      nodeId: mockWorkflowInstances[idx].currentNodes[0] || '',
      nodeName: mockWorkflowInstances[idx].currentNodeNames[0] || '',
      action: 'terminated',
      operator: '当前用户',
      comment: body.reason || '',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    return HttpResponse.json({ code: 200, message: '流程已终止', data: mockWorkflowInstances[idx] });
  }),
  http.post(apiUrl('/workflow/instances/:id/urge'), ({ params }) => {
    const idx = mockWorkflowInstances.findIndex(i => i.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '流程实例不存在' }, { status: 404 });
    mockWorkflowInstances[idx].history.push({
      id: 'h' + Date.now(),
      nodeId: mockWorkflowInstances[idx].currentNodes[0] || '',
      nodeName: mockWorkflowInstances[idx].currentNodeNames[0] || '',
      action: 'urge',
      operator: '当前用户',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    return HttpResponse.json({ code: 200, message: '催办成功', data: mockWorkflowInstances[idx] });
  }),
  http.post(apiUrl('/workflow/instances/:id/transfer'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockWorkflowInstances.findIndex(i => i.id === params.id);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '流程实例不存在' }, { status: 404 });
    mockWorkflowInstances[idx].assignees = [body.assignee];
    mockWorkflowInstances[idx].history.push({
      id: 'h' + Date.now(),
      nodeId: mockWorkflowInstances[idx].currentNodes[0] || '',
      nodeName: mockWorkflowInstances[idx].currentNodeNames[0] || '',
      action: 'transfer',
      operator: '当前用户',
      comment: `转交给 ${body.assignee}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    return HttpResponse.json({ code: 200, message: '转交成功', data: mockWorkflowInstances[idx] });
  }),

  // Workflow Tasks (待办/已办/抄送)
  http.get(apiUrl('/workflow/tasks'), ({ request }) => {
    const url = new URL(request.url);
    const assignee = url.searchParams.get('assignee');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type'); // pending | done | cc
    let tasks: any[] = [];
    mockWorkflowInstances.forEach(inst => {
      if (inst.status !== 'running') return;
      inst.currentNodes.forEach((nodeId, idx) => {
        const def = mockWorkflowDefinitions.find(d => d.id === inst.defId);
        const node = def?.nodes.find(n => n.id === nodeId);
        if (!node) return;
        const taskAssignee = inst.assignees[idx] || node.config?.approverRole || '未分配';
        const isCc = node.type === 'cc';
        const taskType = isCc ? 'cc' : 'pending';
        if (type === 'cc' && !isCc) return;
        if (type === 'pending' && isCc) return;
        if (assignee && taskAssignee !== assignee && !isCc) return;
        tasks.push({
          id: `${inst.id}_${nodeId}`,
          instanceId: inst.id,
          defName: inst.defName,
          nodeId,
          nodeName: node.name,
          businessSummary: inst.businessSummary,
          assignee: taskAssignee,
          status: 'pending',
          createdAt: inst.startedAt,
          deadline: node.config?.timeoutHours ? new Date(Date.now() + node.config.timeoutHours * 3600000).toISOString().replace('T', ' ').slice(0, 19) : undefined,
          type: taskType,
        });
      });
    });
    if (status) tasks = tasks.filter(t => t.status === status);
    return HttpResponse.json({ code: 200, message: 'success', data: { list: tasks, total: tasks.length } });
  }),
  http.post(apiUrl('/workflow/tasks/:id/approve'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const [instId, nodeId] = (params.id as string).split('_');
    const idx = mockWorkflowInstances.findIndex(i => i.id === instId);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '任务不存在' }, { status: 404 });
    const inst = mockWorkflowInstances[idx];
    inst.history.push({
      id: 'h' + Date.now(),
      nodeId,
      nodeName: inst.currentNodeNames[0] || '',
      action: 'approved',
      operator: '当前用户',
      comment: body.comment || '',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    // Simple progression: find next node via edges
    const def = mockWorkflowDefinitions.find(d => d.id === inst.defId);
    const edges = def?.edges.filter(e => e.source === nodeId) || [];
    if (edges.length > 0) {
      const nextNodeId = edges[0].target;
      const nextNode = def?.nodes.find(n => n.id === nextNodeId);
      inst.currentNodes = [nextNodeId];
      inst.currentNodeNames = [nextNode?.name || ''];
      if (nextNode?.type === 'end') {
        inst.status = 'completed';
        inst.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
      }
    } else {
      inst.status = 'completed';
      inst.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    }
    return HttpResponse.json({ code: 200, message: '审批通过', data: inst });
  }),
  http.post(apiUrl('/workflow/tasks/:id/reject'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const [instId, nodeId] = (params.id as string).split('_');
    const idx = mockWorkflowInstances.findIndex(i => i.id === instId);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '任务不存在' }, { status: 404 });
    const inst = mockWorkflowInstances[idx];
    inst.history.push({
      id: 'h' + Date.now(),
      nodeId,
      nodeName: inst.currentNodeNames[0] || '',
      action: 'rejected',
      operator: '当前用户',
      comment: body.comment || '',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    // Reject: go back to previous node if configured, else terminate
    const def = mockWorkflowDefinitions.find(d => d.id === inst.defId);
    const backEdge = def?.edges.find(e => e.target === nodeId && e.condition === '驳回');
    if (backEdge) {
      const prevNode = def?.nodes.find(n => n.id === backEdge.source);
      inst.currentNodes = [backEdge.source];
      inst.currentNodeNames = [prevNode?.name || ''];
    } else {
      inst.status = 'terminated';
      inst.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    }
    return HttpResponse.json({ code: 200, message: '已驳回', data: inst });
  }),
  http.post(apiUrl('/workflow/tasks/:id/transfer'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const [instId, nodeId] = (params.id as string).split('_');
    const idx = mockWorkflowInstances.findIndex(i => i.id === instId);
    if (idx === -1) return HttpResponse.json({ code: 404, message: '任务不存在' }, { status: 404 });
    const inst = mockWorkflowInstances[idx];
    inst.assignees = [body.assignee];
    inst.history.push({
      id: 'h' + Date.now(),
      nodeId,
      nodeName: inst.currentNodeNames[0] || '',
      action: 'transfer',
      operator: '当前用户',
      comment: `转交给 ${body.assignee}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    return HttpResponse.json({ code: 200, message: '转交成功', data: inst });
  }),
  http.post(apiUrl('/workflow/instances/:id/terminate'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const inst = mockWorkflowInstances.find(i => i.id === params.id);
    if (!inst) return HttpResponse.json({ code: 404, message: '实例不存在' }, { status: 404 });
    inst.status = 'terminated';
    inst.completedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    inst.history.push({
      id: `h${Date.now()}`,
      nodeId: inst.currentNodes[0] || '',
      nodeName: inst.currentNodeNames[0] || '',
      action: 'terminated',
      operator: '管理员',
      comment: body.reason || '手动终止',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    });
    return HttpResponse.json({ code: 200, message: '流程已终止', data: inst });
  }),

  // AI Assistant
  http.post(apiUrl('/ai/chat'), async ({ request }) => {
    const body = (await request.json()) as any;
    const msg = body.message || '';
    let reply = '';
    if (msg.includes('不合格')) reply = '本周不合格样品共 3 批次，主要集中在重金属检测（2 批次）和微生物检测（1 批次）。';
    else if (msg.includes('报告')) reply = '上周共生成检测报告 156 份，其中 148 份已通过审核，8 份正在审核中。';
    else if (msg.includes('质控')) reply = '近 30 天质控合格率 98.7%，其中有 2 次警告（铅标准品漂移）。';
    else if (msg.includes('预测')) reply = '基于当前排程，预计平均检测周期为 4.2 天，较上周缩短 0.5 天。';
    else reply = '收到您的问题：' + msg + '\n\n我是HC-LIMS AI助手，可以帮您查询样品状态、分析数据趋势、生成报告建议等。';
    return HttpResponse.json({ code: 200, data: { reply, suggestions: ['查看详细报告', '导出数据', '设置预警'] } });
  }),

  // AI Anomaly Dashboard
  http.get(apiUrl('/ai/anomaly/dashboard'), () => {
    const alerts = [
      { id: 'a1', level: 'critical', title: '铅标准品超标', description: '质控样 Pb 浓度 12.5 mg/L，超出控制限（10.0 mg/L）', source: '质控管理', occurredAt: '2025-08-15 09:30:00', status: 'active', suggestedAction: '重新配制标准品并校准仪器' },
      { id: 'a2', level: 'warning', title: '检测周期延长', description: '近 3 天平均检测周期 5.8 天，超出目标值 5.0 天', source: '任务管理', occurredAt: '2025-08-14 16:00:00', status: 'active', suggestedAction: '检查任务分配和仪器负载' },
      { id: 'a3', level: 'info', title: '新设备校准到期', description: 'ICP-MS 年度校准将于 2025-09-01 到期', source: '仪器管理', occurredAt: '2025-08-13 10:00:00', status: 'resolved', suggestedAction: '已预约校准服务' },
    ];
    const predictions = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(); date.setDate(date.getDate() + i + 1);
      return { date: date.toISOString().slice(0, 10), predicted: 4.2 + Math.random() * 0.8 - 0.4, lower: 3.5, upper: 5.0 };
    });
    return HttpResponse.json({ code: 200, data: { riskScore: 62, alerts, predictions } });
  }),

  // ELN Templates
  http.get(apiUrl('/eln/templates'), () => HttpResponse.json({ code: 200, data: { list: [
    { id: 't1', name: '水质检测原始记录', category: '环境检测', fields: [
      { id: 'f1', label: '样品编号', type: 'text', required: true },
      { id: 'f2', label: '检测项目', type: 'select', required: true, options: ['pH', 'COD', '重金属', '微生物'] },
      { id: 'f3', label: '检测结果', type: 'table', required: true },
      { id: 'f4', label: '检测方法', type: 'select', required: true, options: ['GB/T 5750', 'HJ 828'] },
    ]},
    { id: 't2', name: '食品微生物检验记录', category: '食品检测', fields: [
      { id: 'f5', label: '样品名称', type: 'text', required: true },
      { id: 'f6', label: '培养条件', type: 'text', required: true },
      { id: 'f7', label: '菌落计数', type: 'table', required: true },
    ]},
  ]}})),

  // Achievements
  http.get(apiUrl('/achievements/statistics'), () => HttpResponse.json({ code: 200, data: {
    total: 12, paperCount: 5, patentCount: 3, awardCount: 2, completionCount: 2, totalCitations: 186,
  }})),
  http.post(apiUrl('/achievements'), async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({ code: 200, data: { id: 'ach' + Date.now(), ...body } });
  }),
  http.delete(apiUrl('/achievements/:id'), () => HttpResponse.json({ code: 200 })),

  // Teaching CRUD
  http.post(apiUrl('/teaching/courses'), async ({ request }) => {
    const body = (await request.json()) as any;
    const course = { id: 'c' + Date.now(), ...body, status: 'active', statusLabel: '开课中' };
    mockCourses.push(course);
    return HttpResponse.json({ code: 200, data: course });
  }),
  http.put(apiUrl('/teaching/courses/:id'), async ({ params, request }) => {
    const body = (await request.json()) as any;
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses[idx] = { ...mockCourses[idx], ...body };
    return HttpResponse.json({ code: 200, data: mockCourses[idx] });
  }),
  http.delete(apiUrl('/teaching/courses/:id'), ({ params }) => {
    const idx = mockCourses.findIndex(c => c.id === params.id);
    if (idx >= 0) mockCourses.splice(idx, 1);
    return HttpResponse.json({ code: 200 });
  }),

  ...mobileSamplingHandlers,
  ...clientsHandlers,
  ...quotationsHandlers,
  ...ordersHandlers,
];

