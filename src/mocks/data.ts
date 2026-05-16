// ============================================
// HC-Lims Mock Data
// ============================================

export const mockUsers = [
  { id: '1', username: 'admin', password: 'admin123', realName: '管理员', role: 'admin' as const, avatar: '', department: '管理部', lab: '中心实验室', permissions: ['*'] },
  { id: '2', username: 'zhangwei', password: '123456', realName: '张伟', role: 'quality_manager' as const, avatar: '', department: '质量管理部', lab: '中心实验室', permissions: ['*'] },
  { id: '3', username: 'lisi', password: '123456', realName: '李思', role: 'analyst' as const, avatar: '', department: '检测一部', lab: '理化实验室', permissions: ['sample:view', 'sample:edit', 'task:view', 'task:edit', 'result:view', 'result:edit'] },
  { id: '4', username: 'wangqiang', password: '123456', realName: '王强', role: 'signatory' as const, avatar: '', department: '质量管理部', lab: '中心实验室', permissions: ['report:view', 'report:review', 'report:approve'] },
  { id: '5', username: 'liming', password: '123456', realName: '李明', role: 'instrument_manager' as const, avatar: '', department: '仪器管理部', lab: '仪器分析室', permissions: ['instrument:view', 'instrument:edit', 'instrument:calibrate', 'instrument:maintain'] },
];

export interface Sample {
  id: string;
  sampleNo: string;
  name: string;
  type: string;
  typeLabel: string;
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  samplingLocation: string;
  samplingTime: string;
  receivingTime: string;
  receiverId: string;
  receiverName: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  priorityLabel: string;
  status: string;
  statusLabel: string;
  flowStatus: string;
  flowStatusLabel: string;
  assignedLabId: string;
  assignedLabName: string;
  containerInfo: string;
  storageCondition: string;
  createdAt: string;
  updatedAt: string;
  testItems: number;
  testItemsCompleted: number;
}

export const sampleTypes = [
  { value: 'surface_water', label: '地表水' },
  { value: 'groundwater', label: '地下水' },
  { value: 'drinking_water', label: '饮用水' },
  { value: 'wastewater', label: '废水' },
  { value: 'soil', label: '土壤' },
  { value: 'air', label: '环境空气' },
  { value: 'noise', label: '噪声' },
  { value: 'waste_gas', label: '废气' },
  { value: 'sediment', label: '沉积物' },
  { value: 'biological', label: '生物' },
];

export const sampleStatuses = [
  { value: 'draft', label: '草稿', color: 'default' },
  { value: 'pending_receive', label: '待接收', color: 'blue' },
  { value: 'received', label: '已接收', color: 'cyan' },
  { value: 'pending_assign', label: '待分配', color: 'blue' },
  { value: 'assigned', label: '已分配', color: 'processing' },
  { value: 'testing', label: '检测中', color: 'warning' },
  { value: 'pending_review', label: '待审核', color: 'purple' },
  { value: 'reviewing', label: '审核中', color: 'processing' },
  { value: 'completed', label: '已完成', color: 'success' },
];

export const customers = [
  { id: 'c1', name: '绿源环保科技有限公司' },
  { id: 'c2', name: '市政水务集团' },
  { id: 'c3', name: '红创检测认证集团' },
  { id: 'c4', name: '清源化工有限公司' },
  { id: 'c5', name: '蓝天环境监测站' },
  { id: 'c6', name: '宏达食品有限公司' },
  { id: 'c7', name: '新能科技有限公司' },
  { id: 'c8', name: '康源医药集团' },
];

export const projects = [
  { id: 'p1', name: '地表水监测项目' },
  { id: 'p2', name: '市政供水检测' },
  { id: 'p3', name: '红创检测项目' },
  { id: 'p4', name: '清源化工项目' },
  { id: 'p5', name: '蓝天环境监测' },
  { id: 'p6', name: '交通噪声监测' },
  { id: 'p7', name: '地下水环境质量监测' },
  { id: 'p8', name: '工业企业监测' },
  { id: 'p9', name: '河流底泥监测' },
  { id: 'p10', name: '生态调查项目' },
];

export const labs = [
  { id: 'l1', name: '环境实验室' },
  { id: 'l2', name: '理化实验室' },
  { id: 'l3', name: '无机实验室' },
  { id: 'l4', name: '微生物实验室' },
  { id: 'l5', name: '声学实验室' },
  { id: 'l6', name: '生物实验室' },
];

export const mockSamples: Sample[] = [
  { id: 's1', sampleNo: 'SMP20240521001', name: '地表水样品-1', type: 'surface_water', typeLabel: '地表水', customerId: 'c1', customerName: '绿源环保科技有限公司', projectId: 'p1', projectName: '地表水监测项目', samplingLocation: '滨湖公园东侧', samplingTime: '2024-05-21 08:30', receivingTime: '2024-05-21 09:15', receiverId: '2', receiverName: '张伟', priority: 'normal', priorityLabel: '常规', status: 'pending_receive', statusLabel: '待接收', flowStatus: 'pending_receive', flowStatusLabel: '待接收', assignedLabId: '', assignedLabName: '-', containerInfo: 'PE瓶 1L', storageCondition: '4℃冷藏', createdAt: '2024-05-21 09:15', updatedAt: '2024-05-21 09:15', testItems: 12, testItemsCompleted: 0 },
  { id: 's2', sampleNo: 'SMP20240521002', name: '地下水样品-2', type: 'groundwater', typeLabel: '地下水', customerId: 'c2', customerName: '市政水务集团', projectId: 'p2', projectName: '市政供水检测', samplingLocation: '经开区监测井A1', samplingTime: '2024-05-21 07:45', receivingTime: '2024-05-21 10:02', receiverId: '2', receiverName: '张伟', priority: 'high', priorityLabel: '加急', status: 'testing', statusLabel: '检测中', flowStatus: 'assigned', flowStatusLabel: '已分配', assignedLabId: 'l2', assignedLabName: '理化实验室', containerInfo: 'PE瓶 500mL', storageCondition: '4℃冷藏', createdAt: '2024-05-21 10:02', updatedAt: '2024-05-21 10:02', testItems: 8, testItemsCompleted: 3 },
  { id: 's3', sampleNo: 'SMP20240520045', name: '土壤样品-3', type: 'soil', typeLabel: '土壤', customerId: 'c3', customerName: '红创检测认证集团', projectId: 'p3', projectName: '红创检测项目', samplingLocation: '经开区监测井A1', samplingTime: '2024-05-20 15:30', receivingTime: '2024-05-20 16:45', receiverId: '2', receiverName: '张伟', priority: 'normal', priorityLabel: '常规', status: 'testing', statusLabel: '检测中', flowStatus: 'assigned', flowStatusLabel: '已分配', assignedLabId: 'l2', assignedLabName: '理化实验室', containerInfo: '自封袋 500g', storageCondition: '常温', createdAt: '2024-05-20 16:45', updatedAt: '2024-05-20 16:45', testItems: 5, testItemsCompleted: 2 },
  { id: 's4', sampleNo: 'SMP20240520044', name: '废水样品-4', type: 'wastewater', typeLabel: '废水', customerId: 'c4', customerName: '清源化工有限公司', projectId: 'p4', projectName: '清源化工项目', samplingLocation: '清源污水处理厂', samplingTime: '2024-05-20 14:00', receivingTime: '2024-05-20 15:30', receiverId: '2', receiverName: '张伟', priority: 'urgent', priorityLabel: '紧急', status: 'testing', statusLabel: '检测中', flowStatus: 'assigned', flowStatusLabel: '已分配', assignedLabId: 'l1', assignedLabName: '环境实验室', containerInfo: 'PE瓶 1L', storageCondition: '4℃冷藏', createdAt: '2024-05-20 15:30', updatedAt: '2024-05-20 15:30', testItems: 10, testItemsCompleted: 5 },
  { id: 's5', sampleNo: 'SMP20240519088', name: '空气样品-5', type: 'air', typeLabel: '环境空气', customerId: 'c5', customerName: '蓝天环境监测站', projectId: 'p5', projectName: '蓝天环境监测', samplingLocation: '蓝天环境监测站', samplingTime: '2024-05-19 09:00', receivingTime: '2024-05-19 11:20', receiverId: '2', receiverName: '张伟', priority: 'normal', priorityLabel: '常规', status: 'completed', statusLabel: '已完成', flowStatus: 'completed', flowStatusLabel: '已完成', assignedLabId: 'l1', assignedLabName: '环境实验室', containerInfo: '采气袋 5L', storageCondition: '常温', createdAt: '2024-05-19 11:20', updatedAt: '2024-05-19 11:20', testItems: 6, testItemsCompleted: 6 },
  { id: 's6', sampleNo: 'SMP20240519077', name: '噪声样品-6', type: 'noise', typeLabel: '噪声', customerId: 'c6', customerName: '宏达食品有限公司', projectId: 'p6', projectName: '交通噪声监测', samplingLocation: '交通管理局', samplingTime: '2024-05-19 08:30', receivingTime: '2024-05-19 09:05', receiverId: '2', receiverName: '张伟', priority: 'normal', priorityLabel: '常规', status: 'pending_receive', statusLabel: '待检测', flowStatus: 'received', flowStatusLabel: '已接收', assignedLabId: 'l5', assignedLabName: '声学实验室', containerInfo: '-', storageCondition: '常温', createdAt: '2024-05-19 09:05', updatedAt: '2024-05-19 09:05', testItems: 3, testItemsCompleted: 0 },
  { id: 's7', sampleNo: 'SMP20240519056', name: '地下水样品-7', type: 'groundwater', typeLabel: '地下水', customerId: 'c7', customerName: '新能科技有限公司', projectId: 'p7', projectName: '地下水环境质量监测', samplingLocation: '地质环境研究院', samplingTime: '2024-05-19 07:00', receivingTime: '2024-05-19 08:30', receiverId: '2', receiverName: '张伟', priority: 'high', priorityLabel: '加急', status: 'testing', statusLabel: '检测中', flowStatus: 'assigned', flowStatusLabel: '已分配', assignedLabId: 'l2', assignedLabName: '理化实验室', containerInfo: 'PE瓶 1L', storageCondition: '4℃冷藏', createdAt: '2024-05-19 08:30', updatedAt: '2024-05-19 08:30', testItems: 7, testItemsCompleted: 1 },
  { id: 's8', sampleNo: 'SMP20240518033', name: '沉积物样品-8', type: 'sediment', typeLabel: '沉积物', customerId: 'c8', customerName: '康源医药集团', projectId: 'p9', projectName: '河流底泥监测', samplingLocation: '生态环境局', samplingTime: '2024-05-18 13:00', receivingTime: '2024-05-18 15:45', receiverId: '2', receiverName: '张伟', priority: 'normal', priorityLabel: '常规', status: 'pending_review', statusLabel: '待审核', flowStatus: 'pending_review', flowStatusLabel: '待交接', assignedLabId: 'l2', assignedLabName: '理化实验室', containerInfo: '自封袋 500g', storageCondition: '4℃冷藏', createdAt: '2024-05-18 15:45', updatedAt: '2024-05-18 15:45', testItems: 4, testItemsCompleted: 4 },
  { id: 's9', sampleNo: 'SMP20240518021', name: '生物样品-9', type: 'biological', typeLabel: '生物样品', customerId: 'c8', customerName: '康源医药集团', projectId: 'p10', projectName: '生态调查项目', samplingLocation: '生态环境局', samplingTime: '2024-05-18 12:30', receivingTime: '2024-05-18 14:20', receiverId: '2', receiverName: '张伟', priority: 'urgent', priorityLabel: '紧急', status: 'testing', statusLabel: '检测中', flowStatus: 'assigned', flowStatusLabel: '已分配', assignedLabId: 'l6', assignedLabName: '生物实验室', containerInfo: '离心管 50mL', storageCondition: '-20℃冷冻', createdAt: '2024-05-18 14:20', updatedAt: '2024-05-18 14:20', testItems: 15, testItemsCompleted: 8 },
  { id: 's10', sampleNo: 'SMP20240517009', name: '工业废气-10', type: 'waste_gas', typeLabel: '废气', customerId: 'c8', customerName: '康源医药集团', projectId: 'p8', projectName: '工业企业监测', samplingLocation: '钢铁集团有限公司', samplingTime: '2024-05-17 08:00', receivingTime: '2024-05-17 10:10', receiverId: '2', receiverName: '张伟', priority: 'normal', priorityLabel: '常规', status: 'completed', statusLabel: '已完成', flowStatus: 'completed', flowStatusLabel: '已完成', assignedLabId: 'l1', assignedLabName: '环境实验室', containerInfo: 'TEDLAR袋', storageCondition: '常温', createdAt: '2024-05-17 10:10', updatedAt: '2024-05-17 10:10', testItems: 8, testItemsCompleted: 8 },
];

// Dashboard KPI data
export const mockDashboardStats = {
  totalSamples: 1248,
  totalSamplesChange: 96,
  pendingTests: 356,
  pendingTestsChange: 28,
  overdueTasks: 27,
  overdueTasksChange: 5,
  completedReports: 892,
  completedReportsChange: 73,
};

export const mockDashboardTaskQueue = {
  pendingAssign: 18,
  pendingTest: 356,
  pendingReview: 24,
  pendingApprove: 11,
  overdue: 27,
};

export const mockDashboardInstruments = [
  { id: 'i1', name: '液相色谱仪 LC-001', status: 'running', statusLabel: '运行中' },
  { id: 'i2', name: '气相色谱仪 GC-002', status: 'idle', statusLabel: '空闲' },
  { id: 'i3', name: '原子吸收光谱仪 AAS-001', status: 'running', statusLabel: '运行中' },
  { id: 'i4', name: 'ICP-MS质谱仪 ICP-001', status: 'maintenance', statusLabel: '维护中' },
  { id: 'i5', name: '紫外分光光度计 UV-001', status: 'idle', statusLabel: '空闲' },
];

export const mockDashboardAlerts = [
  { id: 'a1', level: 'error', title: '有27个任务已逾期', desc: '请及时处理逾期任务', time: '10:15' },
  { id: 'a2', level: 'warning', title: '仪器ICP-001维护中', desc: '预计恢复时间：2024-05-22 14:00', time: '09:40' },
  { id: 'a3', level: 'info', title: '新版本发布', desc: '红创LIMS 2.3.1版本已发布', time: '昨天' },
  { id: 'a4', level: 'success', title: '报告批准', desc: '报告编号RPT20240520022已批准', time: '昨天' },
];

// Turnaround time trend data
export const mockTurnaroundTrend = [
  { date: '05-14', all: 5.2, water: 3.8, soil: 7.5, air: 2.1 },
  { date: '05-15', all: 5.5, water: 4.0, soil: 8.2, air: 2.3 },
  { date: '05-16', all: 5.0, water: 3.5, soil: 7.0, air: 2.0 },
  { date: '05-17', all: 5.8, water: 4.2, soil: 8.5, air: 2.5 },
  { date: '05-18', all: 5.3, water: 3.9, soil: 7.8, air: 2.2 },
  { date: '05-19', all: 5.0, water: 3.6, soil: 7.2, air: 2.1 },
  { date: '05-20', all: 5.5, water: 4.1, soil: 8.0, air: 2.4 },
];

// Sample type distribution
export const mockSampleTypeDistribution = [
  { type: '环境水', count: 480, percent: 38.5 },
  { type: '土壤', count: 279, percent: 22.4 },
  { type: '废水', count: 196, percent: 15.7 },
  { type: '环境空气', count: 152, percent: 12.2 },
  { type: '饮用水', count: 76, percent: 6.1 },
  { type: '其他', count: 65, percent: 5.1 },
];

// Sample flow history
export const mockSampleFlowHistory: Record<string, Array<{ time: string; action: string; user: string; desc: string }>> = {
  s1: [
    { time: '2024-05-21 09:15', action: '样品接收', user: '张伟', desc: '样品已接收，状态变更为：已接收' },
    { time: '2024-05-21 09:18', action: '样品入库', user: '系统', desc: '样品已入库，存放位置：样品冰箱-01' },
    { time: '2024-05-21 09:20', action: '样品分配', user: '张伟', desc: '已分配至环境实验室' },
  ],
  s2: [
    { time: '2024-05-21 10:02', action: '样品接收', user: '张伟', desc: '样品已接收' },
    { time: '2024-05-21 10:05', action: '样品入库', user: '系统', desc: '样品已入库' },
    { time: '2024-05-21 10:10', action: '样品分配', user: '张伟', desc: '已分配至理化实验室' },
  ],
};

export const mockSampleDetail = {
  s1: {
    sampleNo: 'SMP20240521001', name: '地表水样品-1', type: '地表水', customerName: '绿源环保科技有限公司',
    projectName: '地表水监测项目', samplingLocation: '滨湖公园东侧', samplingTime: '2024-05-21 08:30',
    receivingTime: '2024-05-21 09:15', receiverName: '张伟', containerInfo: 'PE瓶 1L',
    storageCondition: '4℃冷藏', priority: '常规', flowStatus: '已接收', assignedLabName: '-',
    testItems: [
      { name: 'pH值', method: 'HJ 1147-2020', status: '待检测' },
      { name: '化学需氧量(COD)', method: 'HJ 828-2017', status: '待检测' },
      { name: '氨氮(NH₃-N)', method: 'HJ 535-2009', status: '待检测' },
      { name: '总磷(TP)', method: 'GB/T 11893-1989', status: '待检测' },
      { name: '总氮(TN)', method: 'HJ 636-2012', status: '待检测' },
    ],
    testTotal: 12, tested: 0, testing: 0, completed: 0,
  },
  s2: {
    sampleNo: 'SMP20240521002', name: '地下水样品-2', type: '地下水', customerName: '市政水务集团',
    projectName: '市政供水检测', samplingLocation: '经开区监测井A1', samplingTime: '2024-05-21 07:45',
    receivingTime: '2024-05-21 10:02', receiverName: '张伟', containerInfo: 'PE瓶 500mL',
    storageCondition: '4℃冷藏', priority: '加急', flowStatus: '已分配', assignedLabName: '理化实验室',
    testItems: [
      { name: 'pH值', method: 'HJ 1147-2020', status: '检测中' },
      { name: '化学需氧量(COD)', method: 'HJ 828-2017', status: '检测中' },
      { name: '氨氮(NH₃-N)', method: 'HJ 535-2009', status: '检测中' },
      { name: '总磷(TP)', method: 'GB/T 11893-1989', status: '待检测' },
      { name: '总氮(TN)', method: 'HJ 636-2012', status: '待检测' },
    ],
    testTotal: 8, tested: 3, testing: 3, completed: 0,
  },
};

// Test items for new sample wizard
export const mockTestItemOptions = [
  { id: 't1', name: 'pH值', method: 'HJ 1147-2020', plannedDate: '2024-05-24', labId: 'l2', labName: '理化实验室', priority: 'normal' },
  { id: 't2', name: '化学需氧量(COD)', method: 'HJ 828-2017', plannedDate: '2024-05-25', labId: 'l2', labName: '理化实验室', priority: 'normal' },
  { id: 't3', name: '氨氮(NH₃-N)', method: 'HJ 535-2009', plannedDate: '2024-05-26', labId: 'l2', labName: '理化实验室', priority: 'urgent' },
  { id: 't4', name: '总磷(TP)', method: 'GB/T 11893-1989', plannedDate: '2024-05-25', labId: 'l2', labName: '理化实验室', priority: 'normal' },
  { id: 't5', name: '总氮(TN)', method: 'HJ 636-2012', plannedDate: '2024-05-26', labId: 'l2', labName: '理化实验室', priority: 'normal' },
  { id: 't6', name: '溶解氧(DO)', method: 'HJ 506-2009', plannedDate: '2024-05-24', labId: 'l2', labName: '理化实验室', priority: 'normal' },
  { id: 't7', name: '悬浮物(SS)', method: 'GB 11901-1989', plannedDate: '2024-05-25', labId: 'l2', labName: '理化实验室', priority: 'normal' },
  { id: 't8', name: '石油类', method: 'HJ 970-2018', plannedDate: '2024-05-26', labId: 'l1', labName: '环境实验室', priority: 'normal' },
];

// ============================================
// Report Management Mock Data
// ============================================

export interface Report {
  id: string;
  reportNo: string;
  title: string;
  sampleIds: string[];
  sampleNos: string[];
  customerId: string;
  customerName: string;
  projectId: string;
  projectName: string;
  sampleType: string;
  sampleTypeLabel: string;
  samplingLocation: string;
  samplingDate: string;
  status: string;
  statusLabel: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  issuedAt: string;
  cover: ReportCover;
  testResults: ReportTestResult[];
  signatures: ReportSignature[];
  reviews: ReportReview[];
  changeHistory: ReportChangeEntry[];
  attachments: ReportAttachment[];
  annotations: ReportAnnotation[];
}

export interface ReportCover {
  companyName: string;
  reportTitle: string;
  reportNo: string;
  entrustUnit: string;
  projectName: string;
  sampleType: string;
  samplingLocation: string;
  samplingDate: string;
  testDate: string;
  issueDate: string;
  pageCount: number;
  qrCode?: string;
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
  methodRef: string;
  judgment: '合格' | '不合格' | '-';
  remark: string;
}

export interface ReportSignature {
  id: string;
  role: 'compiler' | 'reviewer' | 'approver';
  roleLabel: string;
  userId: string;
  userName: string;
  signedAt: string;
  ipAddress: string;
  stampType: 'electronic' | 'handwritten' | '';
  reason: string;
  passwordVerified: boolean;
}

export interface ReportReview {
  id: string;
  conclusion: 'pass' | 'fail';
  opinion: string;
  reviewerId: string;
  reviewerName: string;
  reviewedAt: string;
  checklist: ReviewChecklistItem[];
}

export interface ReviewChecklistItem {
  key: string;
  label: string;
  passed: boolean;
}

export interface ReportChangeEntry {
  id: string;
  changedAt: string;
  operator: string;
  field: string;
  oldValue: string;
  newValue: string;
}

export interface ReportAttachment {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploader: string;
  url: string;
}

export interface ReportAnnotation {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  resolvedAt: string;
  resolvedBy: string;
  status: 'open' | 'resolved';
  mentions: string[];
  replies: ReportAnnotationReply[];
}

export interface ReportAnnotationReply {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export const reportStatuses = [
  { value: 'draft', label: '待撰写', color: 'default' },
  { value: 'pending_tech_review', label: '待技术审核', color: 'blue' },
  { value: 'tech_review', label: '技术审核中', color: 'processing' },
  { value: 'pending_approval', label: '待批准签发', color: 'purple' },
  { value: 'approval', label: '批准签发中', color: 'processing' },
  { value: 'issued', label: '已签发', color: 'success' },
  { value: 'archived', label: '已归档', color: 'default' },
];

export const reviewChecklistDef: ReviewChecklistItem[] = [
  { key: 'c1', label: '报告编号与委托书一致', passed: false },
  { key: 'c2', label: '检测结果数据完整、无遗漏', passed: false },
  { key: 'c3', label: '检测方法标准引用正确', passed: false },
  { key: 'c4', label: '判定结论依据充分', passed: false },
  { key: 'c5', label: '计量单位与有效数字规范', passed: false },
  { key: 'c6', label: '原始记录可追溯', passed: false },
];

function makeTestResults(count: number, baseItemName: string): ReportTestResult[] {
  const methods = [
    { name: 'pH值', method: 'HJ 1147-2020', ref: 'GB/T 6920-1986', unit: '无量纲', limit: '6.5-8.5', dl: '0.01' },
    { name: '化学需氧量(COD)', method: 'HJ 828-2017', ref: 'GB/T 11914-1989', unit: 'mg/L', limit: '≤100', dl: '4' },
    { name: '氨氮(NH₃-N)', method: 'HJ 535-2009', ref: 'GB/T 7479-1987', unit: 'mg/L', limit: '≤15', dl: '0.025' },
    { name: '总磷(TP)', method: 'GB/T 11893-1989', ref: 'GB/T 11893-1989', unit: 'mg/L', limit: '≤0.5', dl: '0.01' },
    { name: '总氮(TN)', method: 'HJ 636-2012', ref: 'HJ 636-2012', unit: 'mg/L', limit: '≤1.0', dl: '0.05' },
    { name: '溶解氧(DO)', method: 'HJ 506-2009', ref: 'HJ 506-2009', unit: 'mg/L', limit: '≥2.0', dl: '0.1' },
    { name: '悬浮物(SS)', method: 'GB 11901-1989', ref: 'GB 11901-1989', unit: 'mg/L', limit: '≤70', dl: '4' },
    { name: '石油类', method: 'HJ 970-2018', ref: 'HJ 970-2018', unit: 'mg/L', limit: '≤5.0', dl: '0.01' },
    { name: '砷(As)', method: 'HJ 694-2014', ref: 'GB/T 7485-1987', unit: 'mg/L', limit: '≤0.05', dl: '0.0003' },
    { name: '汞(Hg)', method: 'HJ 694-2014', ref: 'GB/T 7468-1987', unit: 'mg/L', limit: '≤0.001', dl: '0.00005' },
  ];
  const results: ReportTestResult[] = [];
  const sliced = methods.slice(0, count);
  sliced.forEach((m, i) => {
    const val = (Math.random() * 5 + 0.1).toFixed(3);
    const limitNum = parseFloat(m.limit.replace(/[^0-9.]/g, ''));
    const pass = parseFloat(val) <= limitNum || m.limit.startsWith('6.5');
    results.push({
      id: `${baseItemName}-tr-${i + 1}`,
      seq: i + 1,
      itemName: m.name,
      unit: m.unit,
      result: val,
      detectionLimit: m.dl,
      limitValue: m.limit,
      method: m.name,
      methodRef: m.ref,
      judgment: pass ? '合格' : '不合格',
      remark: '',
    });
  });
  return results;
}

export const mockReports: Report[] = [
  {
    id: 'rpt1',
    reportNo: 'RPT20240521001',
    title: '地表水水质检测报告',
    sampleIds: ['s1'],
    sampleNos: ['SMP20240521001'],
    customerId: 'c1',
    customerName: '绿源环保科技有限公司',
    projectId: 'p1',
    projectName: '地表水监测项目',
    sampleType: 'surface_water',
    sampleTypeLabel: '地表水',
    samplingLocation: '滨湖公园东侧',
    samplingDate: '2024-05-21',
    status: 'draft',
    statusLabel: '待撰写',
    creatorId: '3',
    creatorName: '李思',
    createdAt: '2024-05-22 09:00',
    updatedAt: '2024-05-22 09:00',
    issuedAt: '',
    cover: {
      companyName: '红创检测认证有限公司',
      reportTitle: '检测报告',
      reportNo: 'RPT20240521001',
      entrustUnit: '绿源环保科技有限公司',
      projectName: '地表水监测项目',
      sampleType: '地表水',
      samplingLocation: '滨湖公园东侧',
      samplingDate: '2024-05-21',
      testDate: '2024-05-22 ~ 2024-05-25',
      issueDate: '',
      pageCount: 12,
    },
    testResults: makeTestResults(5, 'rpt1'),
    signatures: [],
    reviews: [],
    changeHistory: [],
    attachments: [],
    annotations: [],
  },
  {
    id: 'rpt2',
    reportNo: 'RPT20240521002',
    title: '地下水水质检测报告',
    sampleIds: ['s2'],
    sampleNos: ['SMP20240521002'],
    customerId: 'c2',
    customerName: '市政水务集团',
    projectId: 'p2',
    projectName: '市政供水检测',
    sampleType: 'groundwater',
    sampleTypeLabel: '地下水',
    samplingLocation: '经开区监测井A1',
    samplingDate: '2024-05-21',
    status: 'pending_tech_review',
    statusLabel: '待技术审核',
    creatorId: '3',
    creatorName: '李思',
    createdAt: '2024-05-21 14:30',
    updatedAt: '2024-05-22 10:15',
    issuedAt: '',
    cover: {
      companyName: '红创检测认证有限公司',
      reportTitle: '检测报告',
      reportNo: 'RPT20240521002',
      entrustUnit: '市政水务集团',
      projectName: '市政供水检测',
      sampleType: '地下水',
      samplingLocation: '经开区监测井A1',
      samplingDate: '2024-05-21',
      testDate: '2024-05-21 ~ 2024-05-24',
      issueDate: '',
      pageCount: 10,
    },
    testResults: makeTestResults(8, 'rpt2'),
    signatures: [
      { id: 'sig-1', role: 'compiler', roleLabel: '编制', userId: '3', userName: '李思', signedAt: '2024-05-22 10:10', ipAddress: '192.168.1.100', stampType: 'electronic', reason: '报告编制完成，提交审核', passwordVerified: true },
    ],
    reviews: [],
    changeHistory: [
      { id: 'ch1', changedAt: '2024-05-22 09:00', operator: '李思', field: '报告', oldValue: '新建', newValue: '草稿状态' },
      { id: 'ch2', changedAt: '2024-05-22 10:10', operator: '李思', field: '状态', oldValue: '草稿', newValue: '待技术审核' },
    ],
    attachments: [],
    annotations: [
      {
        id: 'ann1', content: '@王强 请确认COD检测限是否满足标准要求？', authorId: '3', authorName: '李思',
        createdAt: '2024-05-22 10:00', resolvedAt: '', resolvedBy: '', status: 'open',
        mentions: ['4'],
        replies: [{ id: 'a1r1', content: '已确认，满足要求', authorId: '4', authorName: '王强', createdAt: '2024-05-22 10:05' }],
      },
    ],
  },
  {
    id: 'rpt3',
    reportNo: 'RPT20240520001',
    title: '土壤污染检测报告',
    sampleIds: ['s3'],
    sampleNos: ['SMP20240520045'],
    customerId: 'c3',
    customerName: '红创检测认证集团',
    projectId: 'p3',
    projectName: '红创检测项目',
    sampleType: 'soil',
    sampleTypeLabel: '土壤',
    samplingLocation: '经开区监测井A1',
    samplingDate: '2024-05-20',
    status: 'pending_approval',
    statusLabel: '待批准签发',
    creatorId: '3',
    creatorName: '李思',
    createdAt: '2024-05-20 17:00',
    updatedAt: '2024-05-22 14:00',
    issuedAt: '',
    cover: {
      companyName: '红创检测认证有限公司',
      reportTitle: '检测报告',
      reportNo: 'RPT20240520001',
      entrustUnit: '红创检测认证集团',
      projectName: '红创检测项目',
      sampleType: '土壤',
      samplingLocation: '经开区监测井A1',
      samplingDate: '2024-05-20',
      testDate: '2024-05-20 ~ 2024-05-23',
      issueDate: '',
      pageCount: 8,
    },
    testResults: makeTestResults(5, 'rpt3'),
    signatures: [
      { id: 'sig-2', role: 'compiler', roleLabel: '编制', userId: '3', userName: '李思', signedAt: '2024-05-22 11:00', ipAddress: '192.168.1.100', stampType: 'electronic', reason: '报告编制完成', passwordVerified: true },
      { id: 'sig-3', role: 'reviewer', roleLabel: '技术审核', userId: '2', userName: '张伟', signedAt: '2024-05-22 14:00', ipAddress: '192.168.1.101', stampType: 'electronic', reason: '审核通过', passwordVerified: true },
    ],
    reviews: [
      {
        id: 'rv1', conclusion: 'pass', opinion: '数据完整，方法正确，同意签发。',
        reviewerId: '2', reviewerName: '张伟', reviewedAt: '2024-05-22 14:00',
        checklist: reviewChecklistDef.map(c => ({ ...c, passed: true })),
      },
    ],
    changeHistory: [
      { id: 'ch3', changedAt: '2024-05-20 17:00', operator: '李思', field: '报告', oldValue: '新建', newValue: '草稿状态' },
      { id: 'ch4', changedAt: '2024-05-22 11:00', operator: '李思', field: '状态', oldValue: '草稿', newValue: '待技术审核' },
      { id: 'ch5', changedAt: '2024-05-22 14:00', operator: '张伟', field: '状态', oldValue: '待技术审核', newValue: '待批准签发' },
    ],
    attachments: [
      { id: 'att1', name: '原始记录-COD.pdf', type: 'pdf', size: '2.3 MB', uploadedAt: '2024-05-22 13:30', uploader: '李思', url: '#' },
      { id: 'att2', name: '采样记录单.pdf', type: 'pdf', size: '1.1 MB', uploadedAt: '2024-05-22 13:31', uploader: '李思', url: '#' },
    ],
    annotations: [],
  },
  {
    id: 'rpt4',
    reportNo: 'RPT20240519001',
    title: '废水污染检测报告',
    sampleIds: ['s4'],
    sampleNos: ['SMP20240520044'],
    customerId: 'c4',
    customerName: '清源化工有限公司',
    projectId: 'p4',
    projectName: '清源化工项目',
    sampleType: 'wastewater',
    sampleTypeLabel: '废水',
    samplingLocation: '清源污水处理厂',
    samplingDate: '2024-05-20',
    status: 'issued',
    statusLabel: '已签发',
    creatorId: '3',
    creatorName: '李思',
    createdAt: '2024-05-19 16:00',
    updatedAt: '2024-05-22 16:30',
    issuedAt: '2024-05-22 16:30',
    cover: {
      companyName: '红创检测认证有限公司',
      reportTitle: '检测报告',
      reportNo: 'RPT20240519001',
      entrustUnit: '清源化工有限公司',
      projectName: '清源化工项目',
      sampleType: '废水',
      samplingLocation: '清源污水处理厂',
      samplingDate: '2024-05-20',
      testDate: '2024-05-20 ~ 2024-05-23',
      issueDate: '2024-05-22',
      pageCount: 15,
    },
    testResults: makeTestResults(10, 'rpt4'),
    signatures: [
      { id: 'sig-4', role: 'compiler', roleLabel: '编制', userId: '3', userName: '李思', signedAt: '2024-05-22 14:00', ipAddress: '192.168.1.100', stampType: 'electronic', reason: '编制完成', passwordVerified: true },
      { id: 'sig-5', role: 'reviewer', roleLabel: '技术审核', userId: '2', userName: '张伟', signedAt: '2024-05-22 15:00', ipAddress: '192.168.1.101', stampType: 'electronic', reason: '技术审核通过', passwordVerified: true },
      { id: 'sig-6', role: 'approver', roleLabel: '批准签发', userId: '4', userName: '王强', signedAt: '2024-05-22 16:30', ipAddress: '192.168.1.102', stampType: 'electronic', reason: '批准签发', passwordVerified: true },
    ],
    reviews: [
      {
        id: 'rv2', conclusion: 'pass', opinion: '技术审核通过，数据完整。',
        reviewerId: '2', reviewerName: '张伟', reviewedAt: '2024-05-22 15:00',
        checklist: reviewChecklistDef.map(c => ({ ...c, passed: true })),
      },
      {
        id: 'rv3', conclusion: 'pass', opinion: '批准签发。',
        reviewerId: '4', reviewerName: '王强', reviewedAt: '2024-05-22 16:30',
        checklist: reviewChecklistDef.map(c => ({ ...c, passed: true })),
      },
    ],
    changeHistory: [
      { id: 'ch6', changedAt: '2024-05-19 16:00', operator: '李思', field: '报告', oldValue: '新建', newValue: '草稿状态' },
      { id: 'ch7', changedAt: '2024-05-22 14:00', operator: '李思', field: '状态', oldValue: '草稿', newValue: '待技术审核' },
      { id: 'ch8', changedAt: '2024-05-22 15:00', operator: '张伟', field: '状态', oldValue: '待技术审核', newValue: '待批准签发' },
      { id: 'ch9', changedAt: '2024-05-22 16:30', operator: '王强', field: '状态', oldValue: '待批准签发', newValue: '已签发' },
    ],
    attachments: [
      { id: 'att3', name: '原始记录.pdf', type: 'pdf', size: '3.2 MB', uploadedAt: '2024-05-22 14:30', uploader: '李思', url: '#' },
    ],
    annotations: [],
  },
];

export const mockReportStats = {
  draft: 12,
  pendingTechReview: 8,
  pendingApproval: 5,
  issued: 36,
  total: 61,
};

export const mockReportFlowHistory: Record<string, Array<{ time: string; action: string; user: string; desc: string }>> = {
  rpt1: [
    { time: '2024-05-22 09:00', action: '创建报告', user: '李思', desc: '报告编号 RPT20240521001 已创建' },
    { time: '2024-05-22 09:05', action: '录入结果', user: '李思', desc: '检测结果已录入' },
  ],
  rpt2: [
    { time: '2024-05-21 14:30', action: '创建报告', user: '李思', desc: '报告已创建' },
    { time: '2024-05-22 09:30', action: '录入结果', user: '李思', desc: '检测结果已录入' },
    { time: '2024-05-22 10:10', action: '提交审核', user: '李思', desc: '电子签名：李思' },
  ],
  rpt3: [
    { time: '2024-05-20 17:00', action: '创建报告', user: '李思', desc: '报告已创建' },
    { time: '2024-05-22 11:00', action: '提交审核', user: '李思', desc: '电子签名：李思' },
    { time: '2024-05-22 14:00', action: '技术审核通过', user: '张伟', desc: '电子签名：张伟' },
  ],
  rpt4: [
    { time: '2024-05-19 16:00', action: '创建报告', user: '李思', desc: '报告已创建' },
    { time: '2024-05-22 14:00', action: '提交审核', user: '李思', desc: '报告已提交，待技术审核' },
    { time: '2024-05-22 15:00', action: '技术审核通过', user: '张伟', desc: '审核通过' },
    { time: '2024-05-22 16:30', action: '批准签发', user: '王强', desc: '报告已签发' },
  ],
};

// ===== Instrument Management Mock Data =====
export interface Instrument {
  id: string;
  name: string;
  model: string;
  serialNo: string;
  manufacturer: string;
  location: string;
  responsiblePerson: string;
  purchaseDate: string;
  inUseDate: string;
  status: 'running' | 'idle' | 'maintenance' | 'calibration_due' | 'offline';
  statusLabel: string;
  connectionStatus: 'online' | 'offline';
  utilization: number;
  calibrationDue: string;
  maintenanceDate: string;
  department: string;
  description?: string;
}

export const mockInstruments: Instrument[] = [
  { id: 'i1', name: '液相色谱仪 LC-001', model: 'Agilent 1260 Infinity II', serialNo: 'LC2021001', manufacturer: 'Agilent Technologies', location: '色谱室101', responsiblePerson: '张伟', purchaseDate: '2021-03-15', inUseDate: '2021-04-01', status: 'running', statusLabel: '运行中', connectionStatus: 'online', utilization: 85, calibrationDue: '2024-08-15', maintenanceDate: '2024-05-10', department: '仪器分析室' },
  { id: 'i2', name: '气相色谱仪 GC-002', model: 'Shimadzu GC-2030', serialNo: 'GC2022003', manufacturer: 'Shimadzu Corporation', location: '色谱室202', responsiblePerson: '王明', purchaseDate: '2022-06-20', inUseDate: '2022-07-10', status: 'idle', statusLabel: '空闲', connectionStatus: 'online', utilization: 62, calibrationDue: '2024-09-20', maintenanceDate: '2024-04-25', department: '仪器分析室' },
  { id: 'i3', name: '原子吸收光谱仪 AAS-001', model: 'PerkinElmer PinAAcle 900', serialNo: 'AAS2020005', manufacturer: 'PerkinElmer', location: '光谱室201', responsiblePerson: '李明', purchaseDate: '2020-11-10', inUseDate: '2020-12-01', status: 'running', statusLabel: '运行中', connectionStatus: 'online', utilization: 78, calibrationDue: '2024-07-30', maintenanceDate: '2024-05-15', department: '无机分析室' },
  { id: 'i4', name: 'ICP-MS质谱仪 ICP-001', model: 'Thermo Fisher iCAP RQ', serialNo: 'ICP2021008', manufacturer: 'Thermo Fisher Scientific', location: '质谱室301', responsiblePerson: '孙磊', purchaseDate: '2021-08-05', inUseDate: '2021-09-01', status: 'maintenance', statusLabel: '维护中', connectionStatus: 'offline', utilization: 45, calibrationDue: '2024-06-15', maintenanceDate: '2024-05-20', department: '质谱分析室' },
  { id: 'i5', name: '紫外分光光度计 UV-001', model: 'Shimadzu UV-2600i', serialNo: 'UV2022002', manufacturer: 'Shimadzu Corporation', location: '光谱室203', responsiblePerson: '赵耀', purchaseDate: '2022-04-15', inUseDate: '2022-05-01', status: 'idle', statusLabel: '空闲', connectionStatus: 'online', utilization: 35, calibrationDue: '2024-10-30', maintenanceDate: '2024-03-10', department: '仪器分析室' },
  { id: 'i6', name: '电子天平 ME204E', model: 'Mettler Toledo ME204E', serialNo: 'TL2021006', manufacturer: 'Mettler Toledo', location: '天平室102', responsiblePerson: '周强', purchaseDate: '2021-05-20', inUseDate: '2021-06-01', status: 'calibration_due', statusLabel: '校准逾期', connectionStatus: 'online', utilization: 20, calibrationDue: '2024-05-01', maintenanceDate: '2024-02-15', department: '理化实验室' },
  { id: 'i7', name: 'pH计 PHS-3E', model: '雷磁 PHS-3E', serialNo: 'PH2023001', manufacturer: '上海仪电科学仪器', location: '理化室103', responsiblePerson: '郑丽', purchaseDate: '2023-01-10', inUseDate: '2023-02-01', status: 'idle', statusLabel: '空闲', connectionStatus: 'online', utilization: 55, calibrationDue: '2024-11-10', maintenanceDate: '2024-01-20', department: '理化实验室' },
  { id: 'i8', name: 'COD消解仪 HCA-100', model: '哈希 HCA-100', serialNo: 'COD2022004', manufacturer: 'Hach', location: '消解室104', responsiblePerson: '王明', purchaseDate: '2022-09-15', inUseDate: '2022-10-01', status: 'running', statusLabel: '运行中', connectionStatus: 'online', utilization: 90, calibrationDue: '2024-08-20', maintenanceDate: '2024-04-10', department: '仪器分析室' },
];

// Instrument calibration records
export const mockCalibrationRecords = [
  { id: 'cal1', instrumentId: 'i1', date: '2023-08-15', item: '波长准确度', result: '合格', certNo: 'CAL20230815-001', validUntil: '2024-08-15', agency: '中国计量科学研究院' },
  { id: 'cal2', instrumentId: 'i1', date: '2022-08-15', item: '波长准确度', result: '合格', certNo: 'CAL20220815-001', validUntil: '2023-08-15', agency: '中国计量科学研究院' },
  { id: 'cal3', instrumentId: 'i3', date: '2023-07-30', item: '吸光度线性', result: '合格', certNo: 'CAL20230730-001', validUntil: '2024-07-30', agency: '上海市计量测试技术研究院' },
  { id: 'cal4', instrumentId: 'i4', date: '2023-06-15', item: '质量轴校准', result: '合格', certNo: 'CAL20230615-001', validUntil: '2024-06-15', agency: '赛默飞原厂校准' },
];

// Maintenance records
export const mockMaintenanceRecords = [
  { id: 'mnt1', instrumentId: 'i1', date: '2024-05-10', type: '定期维护', content: '更换密封垫、清洗进样口', person: '张伟', nextDate: '2024-06-10', status: 'completed' },
  { id: 'mnt2', instrumentId: 'i3', date: '2024-05-15', type: '定期维护', content: '更换空心阴极灯', person: '李明', nextDate: '2024-06-15', status: 'completed' },
  { id: 'mnt3', instrumentId: 'i4', date: '2024-05-20', type: '故障维修', content: '真空泵异常，更换泵油', person: '孙磊', nextDate: '2024-06-20', status: 'in_progress' },
  { id: 'mnt4', instrumentId: 'i2', date: '2024-04-25', type: '定期维护', content: '更换进样垫、衬管', person: '王明', nextDate: '2024-05-25', status: 'completed' },
];

// ===== Quality Control Mock Data =====
export const mockQCResults = [
  { id: 'qc1', batch: 'QC-202405-001', analyte: 'COD', level: '高', target: 100, measured: 98.5, deviation: -1.5, westgardRule: '通过', analyst: '张伟', instrument: 'COD消解仪', date: '2024-05-20', status: 'normal' },
  { id: 'qc2', batch: 'QC-202405-001', analyte: 'COD', level: '低', target: 20, measured: 21.3, deviation: 6.5, westgardRule: '警告(2-2s)', analyst: '张伟', instrument: 'COD消解仪', date: '2024-05-20', status: 'warning' },
  { id: 'qc3', batch: 'QC-202405-002', analyte: '氨氮', level: '高', target: 5.0, measured: 4.92, deviation: -1.6, westgardRule: '通过', analyst: '李明', instrument: '紫外分光光度计', date: '2024-05-19', status: 'normal' },
  { id: 'qc4', batch: 'QC-202405-002', analyte: '氨氮', level: '低', target: 0.5, measured: 0.48, deviation: -4.0, westgardRule: '通过', analyst: '李明', instrument: '紫外分光光度计', date: '2024-05-19', status: 'normal' },
  { id: 'qc5', batch: 'QC-202405-003', analyte: '重金属(Pb)', level: '高', target: 2.0, measured: 2.15, deviation: 7.5, westgardRule: '失控(1-3s)', analyst: '郑丽', instrument: '原子吸收光谱仪', date: '2024-05-18', status: 'error' },
];

export const mockDeviations = [
  { id: 'dev1', no: 'DEV-202405-001', source: '质控结果失控', level: '严重', status: 'investigating', desc: '重金属(Pb)质控样品测定结果超出±3SD限', foundDate: '2024-05-18',责任人: '郑丽', analyst: '郑丽', rootCause: '', capaStatus: 'pending' },
  { id: 'dev2', no: 'DEV-202405-002', source: '仪器校准逾期', level: '中等', status: 'open', desc: '电子天平ME204E校准证书已过期30天', foundDate: '2024-05-15',责任人: '周强', analyst: '周强', rootCause: '', capaStatus: 'pending' },
  { id: 'dev3', no: 'DEV-202405-003', source: '客户投诉', level: '中等', status: 'closed', desc: '客户反馈报告编号RPT20240510022中氨氮结果与复检结果偏差较大', foundDate: '2024-05-10',责任人: '李思', analyst: '李思', rootCause: '采样容器污染导致', capaStatus: 'verified' },
];

export const mockControlChartData = {
  analyte: 'COD (重铬酸盐法)',
  mean: 50.2,
  sd: 2.1,
  points: [
    { date: '05-01', value: 49.8 }, { date: '05-02', value: 51.2 }, { date: '05-03', value: 50.5 },
    { date: '05-04', value: 48.9 }, { date: '05-05', value: 50.1 }, { date: '05-06', value: 52.3 },
    { date: '05-07', value: 49.5 }, { date: '05-08', value: 50.8 }, { date: '05-09', value: 47.8 },
    { date: '05-10', value: 51.5 }, { date: '05-11', value: 50.0 }, { date: '05-12', value: 49.2 },
    { date: '05-13', value: 50.6 }, { date: '05-14', value: 48.5 }, { date: '05-15', value: 51.8 },
    { date: '05-16', value: 50.3 }, { date: '05-17', value: 49.7 }, { date: '05-18', value: 53.5 },
    { date: '05-19', value: 48.2 }, { date: '05-20', value: 50.4 },
  ],
};

export interface TaskItem {
  id: string; taskNo: string; sampleId: string; sampleNo: string;
  sampleName: string; testItem: string; method: string;
  analystId: string; analystName: string; instrumentId: string; instrumentName: string;
  labId: string; labName: string;
  plannedStart: string; plannedEnd: string; actualStart?: string; actualEnd?: string;
  priority: 'high' | 'medium' | 'low'; priorityLabel: string;
  status: string; statusLabel: string; progress: number;
  createdAt: string; updatedAt: string;
  customerName?: string; projectName?: string;
}

export const mockTasks: TaskItem[] = [
  { id: 'tk1', taskNo: 'TK-2025-001', sampleId: 's1', sampleNo: 'SMP20240520001', sampleName: '地表水样品-1', testItem: 'pH值', method: 'HJ 1147-2020', analystId: 'a1', analystName: '张伟', instrumentId: 'i7', instrumentName: 'pH计 PHS-3E', labId: 'l2', labName: '理化实验室', plannedStart: '2024-05-20', plannedEnd: '2024-05-21', actualStart: '2024-05-20', actualEnd: '2024-05-21', priority: 'high', priorityLabel: '高', status: 'completed', statusLabel: '已完成', progress: 100, createdAt: '2024-05-20', updatedAt: '2024-05-21', customerName: '绿源环保', projectName: '地表水检测' },
  { id: 'tk2', taskNo: 'TK-2025-002', sampleId: 's1', sampleNo: 'SMP20240520001', sampleName: '地表水样品-1', testItem: '化学需氧量(COD)', method: 'HJ 828-2017', analystId: 'a2', analystName: '王明', instrumentId: 'i8', instrumentName: 'COD消解仪 HCA-100', labId: 'l2', labName: '理化实验室', plannedStart: '2024-05-20', plannedEnd: '2024-05-22', actualStart: '2024-05-20', priority: 'high', priorityLabel: '高', status: 'testing', statusLabel: '检测中', progress: 65, createdAt: '2024-05-20', updatedAt: '2024-05-21', customerName: '绿源环保', projectName: '地表水检测' },
  { id: 'tk3', taskNo: 'TK-2025-003', sampleId: 's2', sampleNo: 'SMP20240520002', sampleName: '饮用水样品-2', testItem: '氨氮', method: 'HJ 535-2009', analystId: 'a3', analystName: '李明', instrumentId: 'i5', instrumentName: '紫外分光光度计 UV-001', labId: 'l2', labName: '理化实验室', plannedStart: '2024-05-20', plannedEnd: '2024-05-23', priority: 'medium', priorityLabel: '中', status: 'pending', statusLabel: '待检测', progress: 0, createdAt: '2024-05-20', updatedAt: '2024-05-20', customerName: '博克水务', projectName: '饮用水检测' },
  { id: 'tk4', taskNo: 'TK-2025-004', sampleId: 's3', sampleNo: 'SMP20240520045', sampleName: '土壤样品-3', testItem: '重金属(Pb)', method: 'GB/T 17141-1997', analystId: 'a6', analystName: '郑丽', instrumentId: 'i3', instrumentName: '原子吸收光谱仪 AAS-001', labId: 'l3', labName: '无机分析室', plannedStart: '2024-05-21', plannedEnd: '2024-05-23', actualStart: '2024-05-21', priority: 'medium', priorityLabel: '常规', status: 'pending_review', statusLabel: '待审核', progress: 90, createdAt: '2024-05-20', updatedAt: '2024-05-22', customerName: '红创检测', projectName: '土壤检测' },
  { id: 'tk5', taskNo: 'TK-2025-005', sampleId: 's4', sampleNo: 'SMP20240520030', sampleName: '空气样品-4', testItem: 'PM2.5', method: 'HJ 618-2011', analystId: 'a4', analystName: '赵耀', instrumentId: '', instrumentName: '', labId: 'l4', labName: '环境监测室', plannedStart: '2024-05-22', plannedEnd: '2024-05-25', priority: 'high', priorityLabel: '高', status: 'unassigned', statusLabel: '待分配', progress: 0, createdAt: '2024-05-22', updatedAt: '2024-05-22', customerName: '蓝天监测站', projectName: '空气质量监测' },
  { id: 'tk6', taskNo: 'TK-2025-006', sampleId: 's3', sampleNo: 'SMP20240520045', sampleName: '土壤样品-3', testItem: '重金属(Cd)', method: 'GB/T 17141-1997', analystId: 'a6', analystName: '郑丽', instrumentId: 'i3', instrumentName: '原子吸收光谱仪 AAS-001', labId: 'l3', labName: '无机分析室', plannedStart: '2024-05-21', plannedEnd: '2024-05-23', actualStart: '2024-05-21', actualEnd: '2024-05-23', priority: 'medium', priorityLabel: '常规', status: 'completed', statusLabel: '已完成', progress: 100, createdAt: '2024-05-20', updatedAt: '2024-05-23', customerName: '红创检测', projectName: '土壤检测' },
  { id: 'tk7', taskNo: 'TK-2025-007', sampleId: 's5', sampleNo: 'SMP20240520050', sampleName: '废水样品-5', testItem: '总磷(TP)', method: 'GB/T 11893-1989', analystId: 'a2', analystName: '王明', instrumentId: 'i5', instrumentName: '紫外分光光度计 UV-001', labId: 'l2', labName: '理化实验室', plannedStart: '2024-05-19', plannedEnd: '2024-05-21', priority: 'high', priorityLabel: '高', status: 'overdue', statusLabel: '已逾期', progress: 40, createdAt: '2024-05-19', updatedAt: '2024-05-21', customerName: '清源化工', projectName: '废水检测' },
];

// ===== Research Module Mock Data =====
export const mockResearchProjects = [
  { id: 'rp1', no: 'NSFC-2024-001', name: '新型二维材料的界面调控机制研究', type: '纵向', source: '国家自然科学基金面上项目', pi: '张明', group: '环境分析课题组', startDate: '2024-01-01', endDate: '2027-12-31', budget: 580000, used: 126000, status: 'active', progress: 22 },
  { id: 'rp2', no: 'SJ-2024-002', name: '地表水VOCs在线监测技术开发', type: '横向', source: '绿源环保科技有限公司', pi: '张明', group: '环境分析课题组', startDate: '2024-03-01', endDate: '2025-06-30', budget: 350000, used: 158000, status: 'active', progress: 45 },
  { id: 'rp3', no: 'NSFC-2023-003', name: '拉曼光谱在环境分析中的应用', type: '纵向', source: '省自然科学基金', pi: '李华', group: '光谱分析课题组', startDate: '2023-06-01', endDate: '2025-05-31', budget: 300000, used: 220000, status: 'active', progress: 73 },
  { id: 'rp4', no: 'XY-2024-004', name: '校内青年创新基金项目', type: '校内', source: '校级科研启动金', pi: '王强', group: '色谱质谱课题组', startDate: '2024-01-01', endDate: '2024-12-31', budget: 100000, used: 98000, status: 'closing', progress: 98 },
];

export const mockELNEntries = [
  { id: 'eln1', no: 'ELN20240521-001', title: '土壤pH测定实验', author: '张伟', project: '地表水VOCs监测', group: '环境分析课题组', date: '2024-05-21', protocol: '土壤pH测定SOP v1.2', status: 'signed', tags: ['土壤', 'pH', '水质'] },
  { id: 'eln2', no: 'ELN20240520-008', title: '二维材料表面改性测试', author: '李明', project: '二维材料界面调控', group: '环境分析课题组', date: '2024-05-20', protocol: '表面改性实验模板v2.0', status: 'locked', tags: ['二维材料', 'XPS', 'AFM'] },
  { id: 'eln3', no: 'ELN20240519-003', title: '拉曼光谱标准曲线测定', author: '刘洋', project: '拉曼光谱应用', group: '光谱分析课题组', date: '2024-05-19', protocol: '拉曼光谱SOP v1.0', status: 'draft', tags: ['拉曼', '标准曲线'] },
];

export const mockReservations = [
  { id: 'res1', instrument: 'ICP-MS质谱仪 ICP-001', user: '张明', group: '环境分析课题组', project: '二维材料界面调控', date: '2025-05-16', time: '08:00-10:00', fee: 200, status: 'completed' },
  { id: 'res2', instrument: '气相色谱仪 GC-002', user: '李华', group: '光谱分析课题组', project: '拉曼光谱应用', date: '2025-05-16', time: '08:30-11:00', fee: 375, status: 'active' },
  { id: 'res3', instrument: '紫外分光光度计 UV-001', user: '王芳', group: '环境分析课题组', project: '地表水VOCs监测', date: '2025-05-16', time: '13:30-15:00', fee: 150, status: 'pending' },
  { id: 'res4', instrument: '原子吸收光谱仪 AAS-001', user: '赵岩', group: '环境分析课题组', project: '土壤重金属检测', date: '2025-05-17', time: '09:00-12:00', fee: 450, status: 'active' },
  { id: 'res5', instrument: '液相色谱仪 LC-001', user: '周敏', group: '色谱质谱课题组', project: '高分辨质谱', date: '2025-05-17', time: '14:00-17:00', fee: 600, status: 'pending' },
];

export const mockChemicals = [
  { id: 'ch1', name: '浓硫酸 (98%)', cas: '7664-93-9', category: '腐蚀品', stock: '5L', location: '危化品柜A1', responsible: '张明', msds: '有', status: 'normal' },
  { id: 'ch2', name: '丙酮', cas: '67-64-1', category: '易燃品', stock: '2L', location: '危化品柜A2', responsible: '李华', msds: '有', status: 'warning' },
  { id: 'ch3', name: '重铬酸钾', cas: '7778-50-9', category: '氧化剂', stock: '500g', location: '危化品柜B1', responsible: '王强', msds: '有', status: 'normal' },
];

export const mockPublications = [
  { id: 'pub1', title: '新型二维材料在高效催化中的结构调控与性能优化研究', type: '论文', journal: 'Nature Materials', authors: '张明, 李华, 王芳', year: 2025, doi: '10.1038/s41563-025-xxxxx', project: '二维材料界面调控', status: 'published' },
  { id: 'pub2', title: '基于拉曼光谱的水体污染物快速检测方法', type: '论文', journal: 'Analytical Chemistry', authors: '李华, 刘洋', year: 2024, doi: '10.1021/acs.analchem.4cxxxxx', project: '拉曼光谱应用', status: 'published' },
  { id: 'pub3', title: '一种VOCs在线监测预处理装置', type: '专利', journal: '国家发明专利', authors: '张明, 王芳', year: 2025, doi: 'CN2025xxxxxx.xx', project: 'VOCs监测', status: 'pending' },
  { id: 'pub4', title: '环境水体中微塑料的分离检测方法研究', type: '论文', journal: 'Environmental Science & Technology', authors: '王芳, 赵岩, 张明', year: 2024, doi: '10.1021/acs.est.4cxxxxx', project: '地表水VOCs监测', status: 'published' },
  { id: 'pub5', title: '基于深度学习的水质预测模型', type: '报告', journal: '年度研究报告', authors: '张明, 李华', year: 2025, doi: 'REP-2025-001', project: '二维材料界面调控', status: 'draft' },
];

// ===== Expanded Mock Samples =====
export const mockSamplesExpanded = [
  { id: 'se1', sampleNo: 'SMP20240521001', name: '地表水-滨湖公园', typeLabel: '地表水', customer: '绿源环保', status: 'pending_receive', statusLabel: '待接收', priority: 'high', date: '2024-05-21', items: 12 },
  { id: 'se2', sampleNo: 'SMP20240521002', name: '地下水-经开区', typeLabel: '地下水', customer: '市政水务', status: 'testing', statusLabel: '检测中', priority: 'high', date: '2024-05-21', items: 8 },
  { id: 'se3', sampleNo: 'SMP20240521003', name: '废水-纺织厂出口', typeLabel: '废水', customer: '清源化工', status: 'received', statusLabel: '已接收', priority: 'medium', date: '2024-05-21', items: 6 },
  { id: 'se4', sampleNo: 'SMP20240521004', name: '饮用水-出厂水', typeLabel: '饮用水', customer: '博克水务', status: 'pending_receive', statusLabel: '待接收', priority: 'urgent', date: '2024-05-21', items: 15 },
  { id: 'se5', sampleNo: 'SMP20240520045', name: '土壤-工业用地', typeLabel: '土壤', customer: '红创检测', status: 'testing', statusLabel: '检测中', priority: 'medium', date: '2024-05-20', items: 5 },
  { id: 'se6', sampleNo: 'SMP20240520030', name: '空气-监测站A', typeLabel: '环境空气', customer: '蓝天监测', status: 'unassigned', statusLabel: '待分配', priority: 'high', date: '2024-05-20', items: 4 },
  { id: 'se7', sampleNo: 'SMP20240519088', name: '空气-监测站B', typeLabel: '环境空气', customer: '蓝天监测', status: 'completed', statusLabel: '已完成', priority: 'medium', date: '2024-05-19', items: 6 },
  { id: 'se8', sampleNo: 'SMP20240519077', name: '噪声-交通路口', typeLabel: '噪声', customer: '宏达食品', status: 'pending_receive', statusLabel: '待接收', priority: 'low', date: '2024-05-19', items: 3 },
  { id: 'se9', sampleNo: 'SMP20240518055', name: '废水-电镀厂', typeLabel: '废水', customer: '新能科技', status: 'review', statusLabel: '待审核', priority: 'high', date: '2024-05-18', items: 10 },
  { id: 'se10', sampleNo: 'SMP20240518022', name: '土壤-农田', typeLabel: '土壤', customer: '康源医药', status: 'completed', statusLabel: '已完成', priority: 'medium', date: '2024-05-18', items: 7 },
  { id: 'se11', sampleNo: 'SMP20240517033', name: '地表水-水库', typeLabel: '地表水', customer: '绿源环保', status: 'completed', statusLabel: '已完成', priority: 'medium', date: '2024-05-17', items: 12 },
  { id: 'se12', sampleNo: 'SMP20240516012', name: '饮用水-管网末梢', typeLabel: '饮用水', customer: '博克水务', status: 'completed', statusLabel: '已完成', priority: 'high', date: '2024-05-16', items: 15 },
];

export const mockTasksExpanded = [
  { id: 'tke1', taskNo: 'TK-2025-008', sampleName: '废水-纺织厂出口', testItem: 'COD', analyst: '王明', priority: 'high', plannedEnd: '2024-05-23', status: 'pending', statusLabel: '待检测', progress: 0 },
  { id: 'tke2', taskNo: 'TK-2025-009', sampleName: '地表水-滨湖公园', testItem: 'pH值', analyst: '张伟', priority: 'high', plannedEnd: '2024-05-22', status: 'testing', statusLabel: '检测中', progress: 40 },
  { id: 'tke3', taskNo: 'TK-2025-010', sampleName: '地下水-经开区', testItem: '重金属(Pb)', analyst: '郑丽', priority: 'high', plannedEnd: '2024-05-24', status: 'pending', statusLabel: '待检测', progress: 0 },
  { id: 'tke4', taskNo: 'TK-2025-011', sampleName: '饮用水-出厂水', testItem: '余氯', analyst: '李明', priority: 'urgent', plannedEnd: '2024-05-22', status: 'unassigned', statusLabel: '待分配', progress: 0 },
  { id: 'tke5', taskNo: 'TK-2025-012', sampleName: '废水-电镀厂', testItem: '总铬', analyst: '郑丽', priority: 'high', plannedEnd: '2024-05-25', status: 'review', statusLabel: '待审核', progress: 100 },
  { id: 'tke6', taskNo: 'TK-2025-013', sampleName: '空气-监测站A', testItem: 'PM2.5', analyst: '赵耀', priority: 'high', plannedEnd: '2024-05-23', status: 'unassigned', statusLabel: '待分配', progress: 0 },
];

export const mockResearchGroupsExpanded = [
  { id: 'rge1', name: '生物传感课题组', dept: '生命科学学院', pi: '陈静', members: 10, budget: '¥980,000', projects: 3, usage: 56, field: '生物传感器 / 电化学检测' },
  { id: 'rge2', name: '纳米材料课题组', dept: '材料科学与工程学院', pi: '刘强', members: 14, budget: '¥2,800,000', projects: 6, usage: 92, field: '纳米材料合成 / 催化' },
  { id: 'rge3', name: '环境毒理课题组', dept: '环境科学与工程学院', pi: '赵敏', members: 8, budget: '¥650,000', projects: 2, usage: 34, field: '生态毒理 / 风险评估' },
  { id: 'rge4', name: '分析化学课题组', dept: '化学与分子工程学院', pi: '周建国', members: 18, budget: '¥3,200,000', projects: 7, usage: 145, field: '色谱分析 / 质谱联用' },
];

export const mockInstrumentsExpanded = [
  { id: 'ie1', name: '超高效液相色谱 UPLC-002', model: 'Waters ACQUITY', location: '色谱室103', status: 'running', utilization: 92, calibrationDue: '2024-08-20' },
  { id: 'ie2', name: '气相色谱质谱联用 GC-MS-001', model: 'Agilent 8890-5977C', location: '质谱室302', status: 'idle', utilization: 55, calibrationDue: '2024-09-15' },
  { id: 'ie3', name: '电感耦合等离子体发射光谱 ICP-OES', model: 'PerkinElmer Avio 550', location: '光谱室204', status: 'maintenance', utilization: 30, calibrationDue: '2024-07-01' },
  { id: 'ie4', name: '离子色谱仪 IC-001', model: 'Thermo ICS-6000', location: '色谱室104', status: 'idle', utilization: 45, calibrationDue: '2024-10-10' },
  { id: 'ie5', name: '荧光分光光度计 FL-001', model: 'Hitachi F-7100', location: '光谱室205', status: 'running', utilization: 68, calibrationDue: '2024-11-05' },
  { id: 'ie6', name: '总有机碳分析仪 TOC-001', model: 'Shimadzu TOC-L', location: '理化室105', status: 'idle', utilization: 25, calibrationDue: '2024-12-01' },
  { id: 'ie7', name: '自动滴定仪 AT-001', model: 'Metrohm 848 Titrino', location: '理化室106', status: 'running', utilization: 75, calibrationDue: '2025-01-15' },
];

export const mockQualityDataExpanded = [
  { batch: 'QC-202405-004', analyte: '总磷', level: '高', target: 1.0, measured: 0.98, deviation: -2.0, westgardRule: '通过', analyst: '王明', date: '2024-05-21', status: 'normal' },
  { batch: 'QC-202405-004', analyte: '总磷', level: '低', target: 0.1, measured: 0.11, deviation: 10.0, westgardRule: '警告(1-2s)', analyst: '王明', date: '2024-05-21', status: 'warning' },
  { batch: 'QC-202405-005', analyte: 'pH值', level: '高', target: 7.0, measured: 7.02, deviation: 0.3, westgardRule: '通过', analyst: '张伟', date: '2024-05-21', status: 'normal' },
  { batch: 'QC-202405-005', analyte: 'pH值', level: '低', target: 7.0, measured: 6.98, deviation: -0.3, westgardRule: '通过', analyst: '张伟', date: '2024-05-21', status: 'normal' },
];

export const mockDeviationsExpanded = [
  { no: 'DEV-202405-004', source: '仪器故障', level: '严重', status: 'open', desc: 'ICP-MS真空度异常，需更换分子泵', foundDate: '2024-05-20',责任人: '孙磊', rootCause: '', capaStatus: 'pending' },
  { no: 'DEV-202405-005', source: '方法偏离', level: '轻微', status: 'closed', desc: 'COD检测中消解时间偏差5分钟，经评估在可接受范围内', foundDate: '2024-05-16',责任人: '王明', rootCause: '操作人员未严格按SOP执行', capaStatus: 'verified' },
  { no: 'DEV-202405-006', source: '环境条件', level: '中等', status: 'investigating', desc: '天平室温度超标(26.5℃)，可能影响称量精度', foundDate: '2024-05-19',责任人: '赵耀', rootCause: '空调故障导致', capaStatus: 'executing' },
];

export const mockControlChartDataExpanded = {
  analyte: '氨氮 (水杨酸分光光度法)',
  mean: 0.502,
  sd: 0.025,
  points: Array.from({ length: 30 }, (_, i) => ({
    date: `05-${String(i + 1).padStart(2, '0')}`,
    value: 0.502 + (Math.random() - 0.5) * 0.08,
  })),
};

export const mockELNExpanded = [
  { no: 'ELN20240518-005', title: '细胞毒性MTT实验', author: '陈静', project: '生物传感', group: '生物传感课题组', date: '2024-05-18', protocol: 'MTT实验SOP v2.0', status: 'draft', tags: ['细胞', 'MTT', '毒性'] },
  { no: 'ELN20240517-002', title: '纳米材料TEM表征', author: '刘洋', project: '纳米材料合成', group: '纳米材料课题组', date: '2024-05-17', protocol: 'TEM制样SOP v1.5', status: 'signed', tags: ['TEM', '纳米', '表征'] },
  { no: 'ELN20240516-007', title: '蛋白表达与纯化', author: '赵敏', project: '生态毒理', group: '环境毒理课题组', date: '2024-05-16', protocol: '蛋白纯化SOP v3.0', status: 'locked', tags: ['蛋白', '表达', '纯化'] },
  { no: 'ELN20240515-001', title: '标准曲线绘制-重金属混合标液', author: '郑丽', project: '土壤重金属', group: '环境分析课题组', date: '2024-05-15', protocol: 'ICP-MS标准曲线SOP', status: 'locked', tags: ['标准曲线', 'ICP-MS', '重金属'] },
  { no: 'ELN20240514-003', title: '水样前处理-固相萃取', author: '王芳', project: '地表水VOCs监测', group: '环境分析课题组', date: '2024-05-14', protocol: 'SPE前处理SOP v1.2', status: 'signed', tags: ['SPE', '前处理', '水样'] },
];

export const mockReservationExpanded = [
  { instrument: '超高效液相色谱 UPLC-002', user: '周建国', group: '分析化学课题组', project: '色谱分析', date: '2025-05-18', time: '09:00-12:00', fee: 600, status: 'pending' },
  { instrument: '气相色谱质谱联用 GC-MS-001', user: '刘强', group: '纳米材料课题组', project: '纳米材料表征', date: '2025-05-18', time: '14:00-17:00', fee: 750, status: 'pending' },
  { instrument: '荧光分光光度计 FL-001', user: '陈静', group: '生物传感课题组', project: '生物传感器开发', date: '2025-05-19', time: '08:00-10:00', fee: 200, status: 'active' },
  { instrument: '离子色谱仪 IC-001', user: '赵敏', group: '环境毒理课题组', project: '生态毒理评估', date: '2025-05-19', time: '10:00-12:00', fee: 250, status: 'pending' },
  { instrument: '总有机碳分析仪 TOC-001', user: '王芳', group: '环境分析课题组', project: '地表水VOCs监测', date: '2025-05-20', time: '09:00-11:00', fee: 150, status: 'pending' },
  { instrument: '自动滴定仪 AT-001', user: '张伟', group: '环境分析课题组', project: '水质常规分析', date: '2025-05-20', time: '13:00-16:00', fee: 300, status: 'completed' },
];

export const mockChemicalExpanded = [
  { name: '硝酸 (65%)', cas: '7697-37-2', category: '腐蚀品', stock: '8L', location: '危化品柜A3', status: 'normal' },
  { name: '盐酸 (36%)', cas: '7647-01-0', category: '腐蚀品', stock: '10L', location: '危化品柜A4', status: 'normal' },
  { name: '甲醇 (色谱纯)', cas: '67-56-1', category: '易燃品', stock: '4L', location: '试剂柜B2', status: 'warning' },
  { name: '乙腈 (色谱纯)', cas: '75-05-8', category: '易燃品', stock: '3L', location: '试剂柜B3', status: 'warning' },
  { name: '磷酸', cas: '7664-38-2', category: '腐蚀品', stock: '2L', location: '危化品柜A5', status: 'normal' },
  { name: '过氧化氢 (30%)', cas: '7722-84-1', category: '氧化剂', stock: '1L', location: '危化品柜C1', status: 'normal' },
];

// ===== Realistic Dashboard Timeline =====
export const mockTurnaroundTrendReal = [
  { date: '05-01', all: 4.8 }, { date: '05-02', all: 5.1 }, { date: '05-03', all: 4.5 },
  { date: '05-04', all: 4.2 }, { date: '05-05', all: 5.5 }, { date: '05-06', all: 4.9 },
  { date: '05-07', all: 5.2 }, { date: '05-08', all: 4.7 }, { date: '05-09', all: 4.3 },
  { date: '05-10', all: 5.8 }, { date: '05-11', all: 5.0 }, { date: '05-12', all: 4.6 },
  { date: '05-13', all: 5.3 }, { date: '05-14', all: 4.8 }, { date: '05-15', all: 4.4 },
  { date: '05-16', all: 5.6 }, { date: '05-17', all: 5.1 }, { date: '05-18', all: 4.7 },
  { date: '05-19', all: 4.9 }, { date: '05-20', all: 4.5 }, { date: '05-21', all: 5.2 },
];

export const mockAnalysts = [
  { id: 'a1', name: '张伟', dept: '检测一部', role: '检测员', tasks: 12, completed: 8, efficiency: 92 },
  { id: 'a2', name: '王明', dept: '检测一部', role: '检测员', tasks: 15, completed: 11, efficiency: 88 },
  { id: 'a3', name: '李明', dept: '仪器管理部', role: '仪器管理员', tasks: 8, completed: 7, efficiency: 95 },
  { id: 'a4', name: '赵耀', dept: '检测二部', role: '检测员', tasks: 10, completed: 6, efficiency: 78 },
  { id: 'a5', name: '孙磊', dept: '仪器管理部', role: '仪器管理员', tasks: 5, completed: 5, efficiency: 100 },
  { id: 'a6', name: '郑丽', dept: '检测二部', role: '检测员', tasks: 14, completed: 10, efficiency: 85 },
  { id: 'a7', name: '周强', dept: '检测一部', role: '检测员', tasks: 9, completed: 7, efficiency: 82 },
  { id: 'a8', name: '李思', dept: '质量管理部', role: '报告审核员', tasks: 20, completed: 18, efficiency: 96 },
];

// ===== Inventory Management =====
export interface InventoryItem {
  id: string; code: string; name: string; category: string; spec: string;
  batchNo: string; supplier: string; location: string; stock: number;
  unit: string; expiryDate: string; safetyStock: number; status: string; 
  statusLabel: string; price: number;
}
export const mockInventory: InventoryItem[] = [
  { id: 'inv1', code: 'RE-001', name: '重铬酸钾(AR)', category: '试剂', spec: '500g/瓶', batchNo: 'B20240501', supplier: '国药集团', location: '试剂柜A1', stock: 8, unit: '瓶', expiryDate: '2025-05-01', safetyStock: 5, status: 'normal', statusLabel: '正常', price: 85 },
  { id: 'inv2', code: 'RE-002', name: '硫酸亚铁铵(AR)', category: '试剂', spec: '500g/瓶', batchNo: 'B20240415', supplier: '国药集团', location: '试剂柜A1', stock: 3, unit: '瓶', expiryDate: '2025-04-15', safetyStock: 5, status: 'low', statusLabel: '低库存', price: 65 },
  { id: 'inv3', code: 'RE-003', name: 'COD预制管试剂', category: '耗材', spec: '25支/盒', batchNo: 'B20240320', supplier: '哈希中国', location: '耗材柜B1', stock: 2, unit: '盒', expiryDate: '2024-12-31', safetyStock: 5, status: 'low', statusLabel: '低库存', price: 320 },
  { id: 'inv4', code: 'ST-001', name: 'COD标准溶液(1000mg/L)', category: '标准品', spec: '100mL/瓶', batchNo: 'B20240201', supplier: '中国计量院', location: '标准品柜C1', stock: 1, unit: '瓶', expiryDate: '2024-06-15', safetyStock: 2, status: 'expiring', statusLabel: '即将过期', price: 180 },
  { id: 'inv5', code: 'RE-004', name: '盐酸(GR)', category: '试剂', spec: '500mL/瓶', batchNo: 'B20240510', supplier: '国药集团', location: '试剂柜A2', stock: 12, unit: '瓶', expiryDate: '2026-05-10', safetyStock: 5, status: 'normal', statusLabel: '正常', price: 45 },
  { id: 'inv6', code: 'HC-001', name: '定量滤纸(中速)', category: '耗材', spec: '12.5cm/100张', batchNo: 'B20240105', supplier: '杭州沃华', location: '耗材柜B2', stock: 15, unit: '盒', expiryDate: '2026-01-05', safetyStock: 5, status: 'normal', statusLabel: '正常', price: 28 },
  { id: 'inv7', code: 'ST-002', name: '氨氮标准溶液(100mg/L)', category: '标准品', spec: '50mL/瓶', batchNo: 'B20240120', supplier: '中国计量院', location: '标准品柜C1', stock: 2, unit: '瓶', expiryDate: '2024-07-20', safetyStock: 3, status: 'expiring', statusLabel: '即将过期', price: 150 },
  { id: 'inv8', code: 'HC-002', name: '微孔滤膜(0.45μm)', category: '耗材', spec: '50片/盒', batchNo: 'B20240301', supplier: '默克化工', location: '耗材柜B3', stock: 0, unit: '盒', expiryDate: '2025-03-01', safetyStock: 5, status: 'out', statusLabel: '缺货', price: 95 },
];

export const mockPurchaseRequests = [
  { id: 'pr1', no: 'PR-2025-001', applicant: '张伟', dept: '检测一部', group: '—', date: '2024-05-20', urgency: '紧急', total: 640, status: 'pending_approval', items: [{ name: 'COD预制管试剂', spec: '25支/盒', qty: 2, price: 320 }] },
  { id: 'pr2', no: 'PR-2025-002', applicant: '李明', dept: '仪器管理部', group: '—', date: '2024-05-19', urgency: '普通', total: 450, status: 'approved', items: [{ name: 'ICP-MS进样针', spec: '适配iCAP RQ', qty: 3, price: 150 }] },
  { id: 'pr3', no: 'PR-2025-003', applicant: '郑丽', dept: '检测二部', group: '环境分析课题组', date: '2024-05-18', urgency: '普通', total: 890, status: 'ordered', items: [{ name: '铅标准溶液', spec: '1000mg/L 50mL', qty: 2, price: 180 }, { name: '镉标准溶液', spec: '1000mg/L 50mL', qty: 2, price: 180 }, { name: '氩气(高纯)', spec: '40L/瓶', qty: 1, price: 530 }] },
];

// ===== Method Management =====
export interface MethodItem {
  id: string; code: string; name: string; analyte: string; version: string;
  matrix: string; instrument: string; effectiveDate: string; status: string;
  statusLabel: string; detectionLimit: string; responsible: string; sopFile?: string;
}
export const mockMethods: MethodItem[] = [
  { id: 'mtd1', code: 'HJ 828-2017', name: '水质 化学需氧量的测定 重铬酸盐法', analyte: 'COD', version: 'v2.1', matrix: '水质', instrument: 'COD消解仪', effectiveDate: '2024-01-15', status: 'active', statusLabel: '生效', detectionLimit: '4 mg/L', responsible: '张伟' },
  { id: 'mtd2', code: 'HJ 535-2009', name: '水质 氨氮的测定 纳氏试剂分光光度法', analyte: '氨氮', version: 'v1.0', matrix: '水质', instrument: '紫外分光光度计', effectiveDate: '2023-06-01', status: 'active', statusLabel: '生效', detectionLimit: '0.025 mg/L', responsible: '李明' },
  { id: 'mtd3', code: 'GB/T 17141-1997', name: '土壤质量 铅、镉的测定 石墨炉原子吸收分光光度法', analyte: '重金属', version: 'v2.0', matrix: '土壤', instrument: '原子吸收光谱仪', effectiveDate: '2024-03-01', status: 'active', statusLabel: '生效', detectionLimit: '0.01 mg/kg', responsible: '郑丽' },
  { id: 'mtd4', code: 'HJ 1147-2020', name: '水质 pH值的测定 电极法', analyte: 'pH值', version: 'v1.2', matrix: '水质', instrument: 'pH计', effectiveDate: '2023-09-01', status: 'active', statusLabel: '生效', detectionLimit: '0.01', responsible: '张伟' },
  { id: 'mtd5', code: 'HJ 618-2011', name: '环境空气 PM10和PM2.5的测定 重量法', analyte: 'PM2.5', version: 'v1.1', matrix: '空气', instrument: '恒温恒湿称重系统', effectiveDate: '2024-02-01', status: 'revision', statusLabel: '修订中', detectionLimit: '10 μg/m³', responsible: '赵耀' },
  { id: 'mtd6', code: 'GB/T 11893-1989', name: '水质 总磷的测定 钼酸铵分光光度法', analyte: '总磷', version: 'v1.0', matrix: '水质', instrument: '紫外分光光度计', effectiveDate: '2023-01-01', status: 'archived', statusLabel: '已归档', detectionLimit: '0.01 mg/L', responsible: '王明' },
];

// ===== Personnel =====
export const mockPersonnel = [
  { id: 'p1', name: '张伟', empNo: 'EMP-2022001', dept: '检测一部', position: '检测工程师', role: '检测员', lab: '理化实验室', joinDate: '2022-03-15', certStatus: 'active', certStatusLabel: '正常' },
  { id: 'p2', name: '李明', empNo: 'EMP-2021012', dept: '仪器管理部', position: '高级仪器工程师', role: '仪器管理员', lab: '仪器分析室', joinDate: '2021-06-01', certStatus: 'active', certStatusLabel: '正常' },
  { id: 'p3', name: '王强', empNo: 'EMP-2020003', dept: '质量管理部', position: '质量主管', role: '质量主管', lab: '中心实验室', joinDate: '2020-09-01', certStatus: 'active', certStatusLabel: '正常' },
  { id: 'p4', name: '李思', empNo: 'EMP-2023015', dept: '检测一部', position: '检测员', role: '检测员', lab: '理化实验室', joinDate: '2023-04-10', certStatus: 'warning', certStatusLabel: '即将过期' },
  { id: 'p5', name: '郑丽', empNo: 'EMP-2021018', dept: '检测二部', position: '高级检测工程师', role: '检测员', lab: '无机分析室', joinDate: '2021-11-20', certStatus: 'active', certStatusLabel: '正常' },
  { id: 'p6', name: '王明', empNo: 'EMP-2022025', dept: '检测一部', position: '检测工程师', role: '检测员', lab: '理化实验室', joinDate: '2022-08-15', certStatus: 'expired', certStatusLabel: '已过期' },
  { id: 'p7', name: '孙磊', empNo: 'EMP-2020010', dept: '仪器管理部', position: '仪器管理主管', role: '仪器管理员', lab: '仪器分析室', joinDate: '2020-03-01', certStatus: 'active', certStatusLabel: '正常' },
  { id: 'p8', name: '赵耀', empNo: 'EMP-2023030', dept: '检测二部', position: '检测员', role: '检测员', lab: '环境监测室', joinDate: '2023-06-01', certStatus: 'active', certStatusLabel: '正常' },
];

export const mockTrainingRecords = [
  { id: 'tr1', name: '安全生产培训(2024年第二期)', target: '新员工', dept: '全部', status: 'completed', planDate: '2024-06-15', actualDate: '2024-06-18', duration: '2天', participants: 25, passRate: 96 },
  { id: 'tr2', name: 'CNAS-CL01内审员培训', target: '质量管理人员', dept: '质量管理部', status: 'completed', planDate: '2024-05-20', actualDate: '2024-05-22', duration: '3天', participants: 8, passRate: 100 },
  { id: 'tr3', name: 'ICP-MS操作进阶培训', target: '检测人员', dept: '检测二部', status: 'in_progress', planDate: '2024-06-01', actualDate: '2024-06-01', duration: '5天', participants: 6, passRate: 0 },
  { id: 'tr4', name: '实验室安全管理规范培训', target: '全体人员', dept: '全部', status: 'planned', planDate: '2024-07-01', actualDate: '', duration: '1天', participants: 0, passRate: 0 },
];

export const mockCertificates = [
  { id: 'cert1', no: 'CNAS-L1234', holder: '李娜', type: '实验室认可(CNAS)', issuer: '中国合格评定国家认可委员会', expiryDate: '2026-07-15', status: 'active' },
  { id: 'cert2', no: 'CMA-2024-001', holder: '张伟', type: '检验检测机构资质认定(CMA)', issuer: '国家市场监督管理总局', expiryDate: '2025-08-20', status: 'active' },
  { id: 'cert3', no: 'NTC-2023-045', holder: '郑丽', type: '授权签字人', issuer: '中国环境监测总站', expiryDate: '2024-06-30', status: 'expiring' },
  { id: 'cert4', no: 'NTC-2022-102', holder: '王明', type: '上岗证', issuer: '中国环境监测总站', expiryDate: '2024-05-01', status: 'expired' },
];

// ===== Dynamic Form Field Configs =====
export const fieldTypes = [
  { value: 'text', label: '文本', icon: 'Aa' },
  { value: 'textarea', label: '多行文本', icon: '¶' },
  { value: 'number', label: '数字', icon: '#' },
  { value: 'date', label: '日期', icon: '📅' },
  { value: 'datetime', label: '日期时间', icon: '🕐' },
  { value: 'select', label: '下拉选择', icon: '▼' },
  { value: 'multiSelect', label: '多选', icon: '☑' },
  { value: 'radio', label: '单选', icon: '○' },
  { value: 'switch', label: '开关', icon: '⚡' },
  { value: 'upload', label: '文件上传', icon: '📎' },
  { value: 'signature', label: '签名', icon: '✍' },
  { value: 'reference', label: '关联查询', icon: '🔗' },
];

export const mockFieldConfigs: Record<string, any[]> = {
  sample: [
    { id: 'fc1', module: 'sample', fieldKey: 'sampleName', label: '样品名称', fieldType: 'text', required: true, sortOrder: 1, groupName: '基本信息', active: true },
    { id: 'fc2', module: 'sample', fieldKey: 'sampleType', label: '样品类型', fieldType: 'select', required: true, sortOrder: 2, groupName: '基本信息', options: [{ label: '水质', value: 'water' }, { label: '土壤', value: 'soil' }, { label: '食品', value: 'food' }, { label: '空气', value: 'air' }, { label: '其他', value: 'other' }], active: true },
    { id: 'fc3', module: 'sample', fieldKey: 'samplingLocation', label: '采样地点', fieldType: 'text', required: true, sortOrder: 3, groupName: '采样信息', active: true },
    { id: 'fc4', module: 'sample', fieldKey: 'samplingDate', label: '采样日期', fieldType: 'date', required: true, sortOrder: 4, groupName: '采样信息', active: true },
    { id: 'fc5', module: 'sample', fieldKey: 'client', label: '委托人', fieldType: 'text', required: false, sortOrder: 5, groupName: '委托信息', active: true },
    { id: 'fc6', module: 'sample', fieldKey: 'samplingDepth', label: '采样深度(米)', fieldType: 'number', required: false, sortOrder: 10, groupName: '扩展信息', conditionRules: [{ field: 'sampleType', operator: 'eq', value: 'water' }], active: true },
    { id: 'fc7', module: 'sample', fieldKey: 'container', label: '采样容器', fieldType: 'select', required: false, sortOrder: 11, groupName: '扩展信息', options: [{ label: '玻璃瓶', value: 'glass' }, { label: '塑料瓶', value: 'plastic' }, { label: '不锈钢瓶', value: 'steel' }], conditionRules: [{ field: 'sampleType', operator: 'eq', value: 'water' }], active: true },
    { id: 'fc8', module: 'sample', fieldKey: 'preservation', label: '保存方式', fieldType: 'select', required: false, sortOrder: 12, groupName: '扩展信息', options: [{ label: '冷藏(4°C)', value: 'refrigerated' }, { label: '冷冻(-20°C)', value: 'frozen' }, { label: '常温', value: 'ambient' }, { label: '加酸', value: 'acidified' }], conditionRules: [{ field: 'sampleType', operator: 'in', value: ['water', 'food'] }], active: true },
    { id: 'fc9', module: 'sample', fieldKey: 'fieldPh', label: '现场pH', fieldType: 'number', required: false, sortOrder: 13, groupName: '扩展信息', validation: { min: 0, max: 14 }, conditionRules: [{ field: 'sampleType', operator: 'eq', value: 'water' }], active: true },
    { id: 'fc10', module: 'sample', fieldKey: 'transportTemp', label: '运输温度(°C)', fieldType: 'number', required: false, sortOrder: 14, groupName: '扩展信息', conditionRules: [{ field: 'sampleType', operator: 'eq', value: 'food' }], active: true },
    { id: 'fc11', module: 'sample', fieldKey: 'soilDepth', label: '采样深度(cm)', fieldType: 'number', required: true, sortOrder: 15, groupName: '土壤参数', conditionRules: [{ field: 'sampleType', operator: 'eq', value: 'soil' }], active: true },
    { id: 'fc12', module: 'sample', fieldKey: 'soilTexture', label: '土壤质地', fieldType: 'select', required: true, sortOrder: 16, groupName: '土壤参数', options: [{ label: '砂土', value: 'sand' }, { label: '壤土', value: 'loam' }, { label: '粘土', value: 'clay' }], conditionRules: [{ field: 'sampleType', operator: 'eq', value: 'soil' }], active: true },
    { id: 'fc13', module: 'sample', fieldKey: 'airVolume', label: '采样体积(L)', fieldType: 'number', required: true, sortOrder: 17, groupName: '空气参数', conditionRules: [{ field: 'sampleType', operator: 'eq', value: 'air' }], active: true },
    { id: 'fc14', module: 'sample', fieldKey: 'flowRate', label: '采样流量(L/min)', fieldType: 'number', required: true, sortOrder: 18, groupName: '空气参数', conditionRules: [{ field: 'sampleType', operator: 'eq', value: 'air' }], active: true },
  ],
  test: [
    { id: 'ft1', module: 'test', fieldKey: 'dilutionFactor', label: '稀释倍数', fieldType: 'number', required: false, sortOrder: 1, groupName: '前处理', validation: { min: 1, max: 1000 }, active: true },
    { id: 'ft2', module: 'test', fieldKey: 'pretreatment', label: '前处理方法', fieldType: 'select', required: false, sortOrder: 2, groupName: '前处理', options: [{ label: '消解', value: 'digestion' }, { label: '萃取', value: 'extraction' }, { label: '稀释', value: 'dilution' }, { label: '过滤', value: 'filtration' }], active: true },
  ],
  report: [
    { id: 'fr1', module: 'report', fieldKey: 'reportTitle', label: '报告标题', fieldType: 'text', required: true, sortOrder: 1, groupName: '基本信息', active: true },
    { id: 'fr2', module: 'report', fieldKey: 'conclusion', label: '检测结论', fieldType: 'select', required: true, sortOrder: 2, groupName: '基本信息', options: [{ label: '合格', value: 'pass' }, { label: '不合格', value: 'fail' }, { label: '仅对来样负责', value: 'sampleOnly' }], active: true },
  ],
};

export const mockFieldTemplates = [
  {
    id: 'tmpl1', name: '水质检测模板', module: 'sample', description: '水质样品字段配置', version: 1,
    appliesTo: { sampleType: ['water'] }, isSnapshot: false,
    fieldConfigs: mockFieldConfigs.sample.filter(f =>
      !f.conditionRules || f.conditionRules.some((c: any) => c.field === 'sampleType' && c.value === 'water')
    ),
    createdBy: '管理员', createdAt: '2026-05-01',
  },
  {
    id: 'tmpl2', name: '土壤检测模板', module: 'sample', description: '土壤样品字段配置', version: 1,
    appliesTo: { sampleType: ['soil'] }, isSnapshot: false,
    fieldConfigs: mockFieldConfigs.sample.filter(f =>
      !f.conditionRules || f.conditionRules.some((c: any) => ['soil', 'water'].includes(c.value as string))
    ),
    createdBy: '管理员', createdAt: '2026-05-01',
  },
];

// ===== COC Chain of Custody =====
const now = new Date();
const d = (days: number, h: number) => new Date(now.getTime() - days * 86400000 + h * 3600000).toISOString();

const makeEvent = (id: string, chainId: string, type: any, op: string, offsetDays: number, offsetHour: number, prev: string | null, loc: string, note?: string): any => ({
  id, chainId, eventType: type, operatorName: op, occurredAt: d(offsetDays, offsetHour),
  location: loc, notes: note, prevEventId: prev, metadata: {},
});

const cocEvents1 = [
  makeEvent('evt1', 'coc1', 'SAMPLING', '采样员 刘强', 2, 8, null, '东湖水库', '采集3个点位'),
  makeEvent('evt2', 'coc1', 'SUBMISSION', '采样员 刘强', 2, 10, 'evt1', '现场', '冷链专送'),
  makeEvent('evt3', 'coc1', 'RECEIPT', '张伟', 2, 11, 'evt2', '收样室', '样品完好,温度4°C'),
  makeEvent('evt4', 'coc1', 'REGISTRATION', '张伟', 2, 12, 'evt3', '实验室', '编号SMP001'),
  makeEvent('evt5', 'coc1', 'SUB_SAMPLING', '李四', 2, 14, 'evt4', '分样室', '分出3个子样'),
  makeEvent('evt6', 'coc1', 'TESTING', '李四', 3, 9, 'evt5', '理化室', 'COD检测完成'),
];

const cocEvents2 = [
  makeEvent('evt7', 'coc2', 'SAMPLING', '客户 张经理', 1, 9, null, '工厂大门'),
  makeEvent('evt8', 'coc2', 'SUBMISSION', '客户 张经理', 1, 11, 'evt7', '工厂'),
  makeEvent('evt9', 'coc2', 'RECEIPT', '王五', 1, 14, 'evt8', '收样室', '样品外观完好'),
  makeEvent('evt10', 'coc2', 'REGISTRATION', '王五', 1, 15, 'evt9', '实验室', '编号SMP002'),
];

const cocEvents3 = [
  makeEvent('evt11', 'coc3', 'SAMPLING', '采样员 王明', 3, 7, null, '河流B断面'),
  // 缺少 SUBMISSION 和 RECEIPT — 测试链断裂
  makeEvent('evt12', 'coc3', 'REGISTRATION', '赵六', 2, 10, null, '实验室', '异常:直接登记'),
  makeEvent('evt13', 'coc3', 'EXCEPTION', '质量主管', 2, 11, 'evt12', '办公室', '链完整性异常,缺少送样和收样环节'),
];

export const mockCOCChains = [
  {
    id: 'coc1', cocNumber: 'COC-260514-0001', sampleId: 'SMP001', sampleName: '地表水样品-水质监测',
    status: 'active', integrity: true, events: cocEvents1, createdAt: d(2, 8), completedAt: undefined,
  },
  {
    id: 'coc2', cocNumber: 'COC-260514-0002', sampleId: 'SMP002', sampleName: '废气样品-工厂排放',
    status: 'active', integrity: true, events: cocEvents2, createdAt: d(1, 9), completedAt: undefined,
  },
  {
    id: 'coc3', cocNumber: 'COC-260513-0001', sampleId: 'SMP003', sampleName: '河流水质样品',
    status: 'broken', integrity: false, integrityMsg: '缺少送样和收样环节',
    events: cocEvents3, createdAt: d(3, 7), completedAt: undefined,
  },
];

// ===== Backup =====
export const mockBackupList = [
  { id: 'b1', name: 'hc_lims_full_20260514_120000.sql', size: '256MB', type: '自动', date: '2026-05-14 12:00', status: 'completed' },
  { id: 'b2', name: 'hc_lims_full_20260513_120000.sql', size: '248MB', type: '自动', date: '2026-05-13 12:00', status: 'completed' },
  { id: 'b3', name: 'hc_lims_data_20260512_180000.json', size: '45MB', type: '手动', date: '2026-05-12 18:00', status: 'completed' },
  { id: 'b4', name: 'hc_lims_full_20260511_120000.sql', size: '235MB', type: '自动', date: '2026-05-11 12:00', status: 'completed' },
  { id: 'b5', name: 'hc_lims_full_20260510_120000.sql', size: '230MB', type: '自动', date: '2026-05-10 12:00', status: 'completed' },
];

// ===== Teaching Management =====
export const mockCourses = [
  { id: 'course1', name: '分析化学实验', teacher: '张明', dept: '化学与分子工程学院', semester: '2024春季', students: 45, experiments: 8, status: 'active' },
  { id: 'course2', name: '环境监测实验', teacher: '李华', dept: '环境科学与工程学院', semester: '2024春季', students: 32, experiments: 6, status: 'active' },
  { id: 'course3', name: '仪器分析实验', teacher: '王强', dept: '化学与分子工程学院', semester: '2024春季', students: 28, experiments: 10, status: 'active' },
];

// ============================================
// Electronic Signature (SM2/SM3) Mock Data
// ============================================

export type SignatureMeaning = 'PREPARED' | 'REVIEWED' | 'APPROVED' | 'VERIFIED';

export const signatureMeanings: { value: SignatureMeaning; label: string; description: string }[] = [
  { value: 'PREPARED', label: '编制', description: '报告编制完成，确认数据录入准确无误' },
  { value: 'REVIEWED', label: '审核', description: '已审核报告内容，技术数据完整、方法标准引用正确' },
  { value: 'APPROVED', label: '批准', description: '批准签发，报告符合质量管理要求，同意对外发出' },
  { value: 'VERIFIED', label: '复核', description: '复核确认检测结果可追溯' },
];

export interface SignRequest {
  documentId: string;
  documentType: 'REPORT' | 'CERTIFICATE' | 'RECORD';
  meaning: SignatureMeaning;
  password: string;
  meaningStatement?: string;
}

export interface SignatureInfo {
  signerName: string;
  meaning: SignatureMeaning;
  meaningLabel: string;
  time: string;
  certSubject: string;
  status: 'valid' | 'invalid' | 'revoked';
}

export interface VerificationResult {
  valid: boolean;
  documentIntact: boolean;
  signerVerified: boolean;
  certValid: boolean;
  timestampValid: boolean;
  signatures: SignatureInfo[];
  details: string[];
  verifiedAt: string;
}

export interface Sm2Certificate {
  id: string;
  userId: string;
  userName: string;
  certSubject: string;
  certIssuer: string;
  serialNumber: string;
  algorithm: string;
  keyLength: number;
  notBefore: string;
  notAfter: string;
  status: 'active' | 'revoked' | 'expired';
  revokedAt?: string;
  createdAt: string;
}

export interface SignatureAuditEntry {
  id: string;
  signatureId: string;
  action: 'CREATED' | 'VERIFIED' | 'REVOKED';
  operatorId: string;
  operatorName: string;
  details: string;
  createdAt: string;
}

export interface DigitalSignatureRecord {
  id: string;
  documentId: string;
  documentType: 'REPORT' | 'CERTIFICATE' | 'RECORD';
  documentHash: string;
  signerId: string;
  signerName: string;
  signerCertId: string;
  meaning: SignatureMeaning;
  meaningStatement: string;
  signatureValue: string;
  timestamp: string;
  timeSource: string;
  previousSignatureId?: string;
  clientInfo: {
    ip: string;
    userAgent: string;
    sessionId: string;
  };
  status: 'valid' | 'revoked' | 'expired';
  createdAt: string;
}

// SM3 hash simulation (mock crypto, produces deterministic 64-char hex)
export function mockSm3Hash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const seed = Math.abs(hash).toString(16).padStart(8, '0');
  // Produce a deterministic 64-char hex string (simulating SM3 256-bit output)
  const chars = '0123456789abcdef';
  let result = seed;
  for (let i = result.length; i < 64; i++) {
    const idx = (Math.abs(hash) * (i + 1) * 7) % 16;
    result += chars[idx];
  }
  return result;
}

// SM2 signature simulation (mock)
export function mockSm2Sign(data: string, _privateKey: string): string {
  const hash = mockSm3Hash(data);
  // Deterministic prefix based on input
  const prefix = hash.slice(0, 8);
  const mid = hash.slice(8, 16);
  return `SM2-${prefix}${mid}-${hash.slice(16, 32)}-${hash.slice(32, 48)}-${hash.slice(48, 64)}`;
}

// Mock SM2 Certificates
export const mockSm2Certificates: Sm2Certificate[] = [
  {
    id: 'cert-sm2-001',
    userId: '3',
    userName: '李思',
    certSubject: 'CN=李思, OU=检测一部, O=红创检测认证有限公司',
    certIssuer: 'CN=红创CA, OU=CA, O=红创检测认证有限公司',
    serialNumber: 'SM2-CERT-2024-001',
    algorithm: 'SM2',
    keyLength: 256,
    notBefore: '2024-01-01',
    notAfter: '2026-12-31',
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: 'cert-sm2-002',
    userId: '2',
    userName: '张伟',
    certSubject: 'CN=张伟, OU=质量管理部, O=红创检测认证有限公司',
    certIssuer: 'CN=红创CA, OU=CA, O=红创检测认证有限公司',
    serialNumber: 'SM2-CERT-2024-002',
    algorithm: 'SM2',
    keyLength: 256,
    notBefore: '2024-01-01',
    notAfter: '2026-12-31',
    status: 'active',
    createdAt: '2024-01-01',
  },
  {
    id: 'cert-sm2-003',
    userId: '4',
    userName: '王强',
    certSubject: 'CN=王强, OU=质量管理部, O=红创检测认证有限公司',
    certIssuer: 'CN=红创CA, OU=CA, O=红创检测认证有限公司',
    serialNumber: 'SM2-CERT-2024-003',
    algorithm: 'SM2',
    keyLength: 256,
    notBefore: '2024-03-01',
    notAfter: '2027-02-28',
    status: 'active',
    createdAt: '2024-03-01',
  },
  {
    id: 'cert-sm2-004',
    userId: '1',
    userName: '管理员',
    certSubject: 'CN=管理员, OU=管理部, O=红创检测认证有限公司',
    certIssuer: 'CN=红创CA, OU=CA, O=红创检测认证有限公司',
    serialNumber: 'SM2-CERT-2024-004',
    algorithm: 'SM2',
    keyLength: 256,
    notBefore: '2023-06-01',
    notAfter: '2024-05-01',
    status: 'expired',
    createdAt: '2023-06-01',
  },
  {
    id: 'cert-sm2-005',
    userId: '5',
    userName: '李明',
    certSubject: 'CN=李明, OU=仪器管理部, O=红创检测认证有限公司',
    certIssuer: 'CN=红创CA, OU=CA, O=红创检测认证有限公司',
    serialNumber: 'SM2-CERT-2023-005',
    algorithm: 'SM2',
    keyLength: 256,
    notBefore: '2023-01-01',
    notAfter: '2025-12-31',
    status: 'revoked',
    revokedAt: '2024-06-01',
    createdAt: '2023-01-01',
  },
];

// Mock digital signature records
export const mockDigitalSignatures: DigitalSignatureRecord[] = [
  {
    id: 'dsig-001',
    documentId: 'rpt2',
    documentType: 'REPORT',
    documentHash: 'a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
    signerId: '3',
    signerName: '李思',
    signerCertId: 'cert-sm2-001',
    meaning: 'PREPARED',
    meaningStatement: '报告编制完成，提交审核',
    signatureValue: 'SM2-a3f8b2c1d4e5-3045022100f2a3b4c5d6e7f8a9-022010b1c2d3e4f5a6b7-3045022100f2a3b4c5d6e7',
    timestamp: '2024-05-22T10:10:00+08:00',
    timeSource: 'NTP',
    clientInfo: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0', sessionId: 'sess-001' },
    status: 'valid',
    createdAt: '2024-05-22 10:10',
  },
  {
    id: 'dsig-002',
    documentId: 'rpt3',
    documentType: 'REPORT',
    documentHash: 'b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    signerId: '3',
    signerName: '李思',
    signerCertId: 'cert-sm2-001',
    meaning: 'PREPARED',
    meaningStatement: '报告编制完成',
    signatureValue: 'SM2-b0c1d2e3f4a5-3046022100b1c2d3e4f5a6b7c8-022100d9e0f1a2b3c4d5e6-3046022100b1c2d3e4f5a6',
    timestamp: '2024-05-22T11:00:00+08:00',
    timeSource: 'NTP',
    previousSignatureId: undefined,
    clientInfo: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0', sessionId: 'sess-001' },
    status: 'valid',
    createdAt: '2024-05-22 11:00',
  },
  {
    id: 'dsig-003',
    documentId: 'rpt3',
    documentType: 'REPORT',
    documentHash: 'b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0',
    signerId: '2',
    signerName: '张伟',
    signerCertId: 'cert-sm2-002',
    meaning: 'REVIEWED',
    meaningStatement: '技术审核通过',
    signatureValue: 'SM2-c1d2e3f4a5b6-3045022100d2e3f4a5b6c7d8e9-022010f0a1b2c3d4e5f6-3045022100d2e3f4a5b6c7',
    timestamp: '2024-05-22T14:00:00+08:00',
    timeSource: 'NTP',
    previousSignatureId: 'dsig-002',
    clientInfo: { ip: '192.168.1.101', userAgent: 'Mozilla/5.0', sessionId: 'sess-002' },
    status: 'valid',
    createdAt: '2024-05-22 14:00',
  },
  {
    id: 'dsig-004',
    documentId: 'rpt4',
    documentType: 'REPORT',
    documentHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    signerId: '3',
    signerName: '李思',
    signerCertId: 'cert-sm2-001',
    meaning: 'PREPARED',
    meaningStatement: '编制完成',
    signatureValue: 'SM2-e5f6a7b8c9d0-3045022100f6a7b8c9d0e1f2a3-022010b4c5d6e7f8a9b0-3045022100f6a7b8c9d0e1',
    timestamp: '2024-05-22T14:00:00+08:00',
    timeSource: 'NTP',
    clientInfo: { ip: '192.168.1.100', userAgent: 'Mozilla/5.0', sessionId: 'sess-003' },
    status: 'valid',
    createdAt: '2024-05-22 14:00',
  },
  {
    id: 'dsig-005',
    documentId: 'rpt4',
    documentType: 'REPORT',
    documentHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    signerId: '2',
    signerName: '张伟',
    signerCertId: 'cert-sm2-002',
    meaning: 'REVIEWED',
    meaningStatement: '技术审核通过',
    signatureValue: 'SM2-f6a7b8c9d0e1-3046022100a7b8c9d0e1f2a3b4-022100c5d6e7f8a9b0c1d2-3046022100a7b8c9d0e1f2',
    timestamp: '2024-05-22T15:00:00+08:00',
    timeSource: 'NTP',
    previousSignatureId: 'dsig-004',
    clientInfo: { ip: '192.168.1.101', userAgent: 'Mozilla/5.0', sessionId: 'sess-004' },
    status: 'valid',
    createdAt: '2024-05-22 15:00',
  },
  {
    id: 'dsig-006',
    documentId: 'rpt4',
    documentType: 'REPORT',
    documentHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    signerId: '4',
    signerName: '王强',
    signerCertId: 'cert-sm2-003',
    meaning: 'APPROVED',
    meaningStatement: '批准签发',
    signatureValue: 'SM2-a7b8c9d0e1f2-3045022100b8c9d0e1f2a3b4c5-022010d6e7f8a9b0c1d2-3045022100b8c9d0e1f2a3',
    timestamp: '2024-05-22T16:30:00+08:00',
    timeSource: 'NTP',
    previousSignatureId: 'dsig-005',
    clientInfo: { ip: '192.168.1.102', userAgent: 'Mozilla/5.0', sessionId: 'sess-005' },
    status: 'valid',
    createdAt: '2024-05-22 16:30',
  },
];

// Mock signature audit log
export const mockSignatureAuditLog: SignatureAuditEntry[] = [
  { id: 'audit-001', signatureId: 'dsig-001', action: 'CREATED', operatorId: '3', operatorName: '李思', details: '报告 RPT20240521002 编制签名创建', createdAt: '2024-05-22 10:10' },
  { id: 'audit-002', signatureId: 'dsig-002', action: 'CREATED', operatorId: '3', operatorName: '李思', details: '报告 RPT20240520001 编制签名创建', createdAt: '2024-05-22 11:00' },
  { id: 'audit-003', signatureId: 'dsig-003', action: 'CREATED', operatorId: '2', operatorName: '张伟', details: '报告 RPT20240520001 审核签名创建', createdAt: '2024-05-22 14:00' },
  { id: 'audit-004', signatureId: 'dsig-004', action: 'CREATED', operatorId: '3', operatorName: '李思', details: '报告 RPT20240519001 编制签名创建', createdAt: '2024-05-22 14:00' },
  { id: 'audit-005', signatureId: 'dsig-005', action: 'CREATED', operatorId: '2', operatorName: '张伟', details: '报告 RPT20240519001 审核签名创建', createdAt: '2024-05-22 15:00' },
  { id: 'audit-006', signatureId: 'dsig-006', action: 'CREATED', operatorId: '4', operatorName: '王强', details: '报告 RPT20240519001 批准签名创建', createdAt: '2024-05-22 16:30' },
];

// ============================================
// Workflow Engine Mock Data
// ============================================

export interface WorkflowNode {
  id: string;
  type: 'start' | 'approval' | 'condition' | 'cc' | 'end';
  name: string;
  x: number;
  y: number;
  config?: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  type: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  status: 'draft' | 'deployed' | 'disabled';
  version: number;
  usedCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowInstance {
  id: string;
  defId: string;
  defName: string;
  defVersion: number;
  businessType: string;
  businessId: string;
  businessSummary: string;
  status: 'running' | 'completed' | 'terminated' | 'suspended';
  currentNodes: string[];
  currentNodeNames: string[];
  assignees: string[];
  variables: Record<string, any>;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  history: WorkflowHistoryItem[];
}

export interface WorkflowHistoryItem {
  id: string;
  nodeId: string;
  nodeName: string;
  action: string;
  operator: string;
  comment?: string;
  timestamp: string;
}

export const mockWorkflowDefinitions: WorkflowDefinition[] = [
  {
    id: 'wf1',
    name: '样品检测流程',
    type: '检测',
    description: '从样品接收到报告生成的完整检测流程',
    status: 'deployed',
    version: 3,
    usedCount: 128,
    createdBy: '张伟',
    createdAt: '2024-01-15 09:00',
    updatedAt: '2024-05-10 14:30',
    nodes: [
      { id: 'n1', type: 'start', name: '开始', x: 100, y: 80, config: { trigger: 'manual' } },
      { id: 'n2', type: 'approval', name: '样品接收', x: 100, y: 200, config: { approverType: 'role', approverRole: 'sample_receiver', approvalMode: 'or', timeoutHours: 24 } },
      { id: 'n3', type: 'approval', name: '任务分配', x: 100, y: 320, config: { approverType: 'role', approverRole: 'lab_manager', approvalMode: 'or' } },
      { id: 'n4', type: 'approval', name: '检测执行', x: 100, y: 440, config: { approverType: 'role', approverRole: 'analyst', approvalMode: 'or' } },
      { id: 'n5', type: 'condition', name: '结果判定', x: 100, y: 560, config: { expression: 'result.qualified === true' } },
      { id: 'n6', type: 'approval', name: '数据复核', x: 300, y: 560, config: { approverType: 'role', approverRole: 'reviewer', approvalMode: 'or' } },
      { id: 'n7', type: 'cc', name: '通知客户', x: 100, y: 680, config: { recipients: ['customer'] } },
      { id: 'n8', type: 'end', name: '结束', x: 100, y: 800 },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n4', target: 'n5' },
      { id: 'e5', source: 'n5', target: 'n6', condition: '不合格', label: '不合格' },
      { id: 'e6', source: 'n5', target: 'n7', condition: '合格', label: '合格' },
      { id: 'e7', source: 'n6', target: 'n4' },
      { id: 'e8', source: 'n7', target: 'n8' },
    ],
  },
  {
    id: 'wf2',
    name: '报告审核流程',
    type: '报告',
    description: '报告编制后的多级审核流程',
    status: 'deployed',
    version: 2,
    usedCount: 95,
    createdBy: '张伟',
    createdAt: '2024-02-01 10:00',
    updatedAt: '2024-04-20 11:00',
    nodes: [
      { id: 'n1', type: 'start', name: '开始', x: 100, y: 80 },
      { id: 'n2', type: 'approval', name: '编制完成', x: 100, y: 200, config: { approverType: 'role', approverRole: 'compiler', approvalMode: 'or' } },
      { id: 'n3', type: 'approval', name: '技术审核', x: 100, y: 320, config: { approverType: 'role', approverRole: 'reviewer', approvalMode: 'or' } },
      { id: 'n4', type: 'approval', name: '批准签发', x: 100, y: 440, config: { approverType: 'role', approverRole: 'signatory', approvalMode: 'or' } },
      { id: 'n5', type: 'cc', name: '归档通知', x: 100, y: 560, config: { recipients: ['archive_admin'] } },
      { id: 'n6', type: 'end', name: '结束', x: 100, y: 680 },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n4', target: 'n5' },
      { id: 'e5', source: 'n5', target: 'n6' },
    ],
  },
  {
    id: 'wf3',
    name: '采购审批流程',
    type: '采购',
    description: '试剂耗材采购多级审批',
    status: 'deployed',
    version: 1,
    usedCount: 32,
    createdBy: '李明',
    createdAt: '2024-03-01 09:00',
    updatedAt: '2024-03-15 16:00',
    nodes: [
      { id: 'n1', type: 'start', name: '开始', x: 100, y: 80 },
      { id: 'n2', type: 'approval', name: '申请提交', x: 100, y: 200, config: { approverType: 'any', approvalMode: 'or' } },
      { id: 'n3', type: 'condition', name: '金额判断', x: 100, y: 320, config: { expression: 'amount > 5000' } },
      { id: 'n4', type: 'approval', name: '部门审批', x: 300, y: 320, config: { approverType: 'role', approverRole: 'dept_manager', approvalMode: 'or' } },
      { id: 'n5', type: 'approval', name: '直接审批', x: 100, y: 440, config: { approverType: 'role', approverRole: 'purchase_manager', approvalMode: 'or' } },
      { id: 'n6', type: 'approval', name: '质量审批', x: 300, y: 440, config: { approverType: 'role', approverRole: 'quality_manager', approvalMode: 'or' } },
      { id: 'n7', type: 'end', name: '结束', x: 100, y: 560 },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4', condition: '>5000', label: '>5000元' },
      { id: 'e4', source: 'n3', target: 'n5', condition: '<=5000', label: '<=5000元' },
      { id: 'e5', source: 'n4', target: 'n6' },
      { id: 'e6', source: 'n5', target: 'n7' },
      { id: 'e7', source: 'n6', target: 'n7' },
    ],
  },
  {
    id: 'wf4',
    name: '偏差处理流程',
    type: '质量',
    description: '检测偏差/OOS处理流程',
    status: 'draft',
    version: 1,
    usedCount: 0,
    createdBy: '张伟',
    createdAt: '2024-05-01 10:00',
    updatedAt: '2024-05-01 10:00',
    nodes: [
      { id: 'n1', type: 'start', name: '开始', x: 100, y: 80 },
      { id: 'n2', type: 'approval', name: '偏差发现', x: 100, y: 200, config: { approverType: 'any', approvalMode: 'or' } },
      { id: 'n3', type: 'approval', name: '原因分析', x: 100, y: 320, config: { approverType: 'role', approverRole: 'quality_manager', approvalMode: 'or' } },
      { id: 'n4', type: 'approval', name: '纠正措施', x: 100, y: 440, config: { approverType: 'role', approverRole: 'lab_manager', approvalMode: 'or' } },
      { id: 'n5', type: 'end', name: '结束', x: 100, y: 560 },
    ],
    edges: [
      { id: 'e1', source: 'n1', target: 'n2' },
      { id: 'e2', source: 'n2', target: 'n3' },
      { id: 'e3', source: 'n3', target: 'n4' },
      { id: 'e4', source: 'n4', target: 'n5' },
    ],
  },
];

export const mockWorkflowInstances: WorkflowInstance[] = [
  {
    id: 'wi1',
    defId: 'wf1',
    defName: '样品检测流程',
    defVersion: 3,
    businessType: '样品',
    businessId: 'SMP20240521001',
    businessSummary: '地表水 COD 检测',
    status: 'running',
    currentNodes: ['n4'],
    currentNodeNames: ['检测执行'],
    assignees: ['李思'],
    variables: { sampleId: 'SMP20240521001', testItem: 'COD' },
    startedBy: '张伟',
    startedAt: '2024-05-21 09:00',
    history: [
      { id: 'h1', nodeId: 'n1', nodeName: '开始', action: 'start', operator: '系统', timestamp: '2024-05-21 09:00' },
      { id: 'h2', nodeId: 'n2', nodeName: '样品接收', action: 'approved', operator: '张伟', comment: '样品完好', timestamp: '2024-05-21 09:15' },
      { id: 'h3', nodeId: 'n3', nodeName: '任务分配', action: 'approved', operator: '张伟', comment: '分配给李思', timestamp: '2024-05-21 09:30' },
    ],
  },
  {
    id: 'wi2',
    defId: 'wf2',
    defName: '报告审核流程',
    defVersion: 2,
    businessType: '报告',
    businessId: 'RPT20240521001',
    businessSummary: '水质检测报告 #001',
    status: 'running',
    currentNodes: ['n3'],
    currentNodeNames: ['技术审核'],
    assignees: ['王强'],
    variables: { reportId: 'RPT20240521001' },
    startedBy: '李思',
    startedAt: '2024-05-21 10:00',
    history: [
      { id: 'h1', nodeId: 'n1', nodeName: '开始', action: 'start', operator: '系统', timestamp: '2024-05-21 10:00' },
      { id: 'h2', nodeId: 'n2', nodeName: '编制完成', action: 'approved', operator: '李思', comment: '报告编制完成', timestamp: '2024-05-21 10:30' },
    ],
  },
  {
    id: 'wi3',
    defId: 'wf3',
    defName: '采购审批流程',
    defVersion: 1,
    businessType: '采购',
    businessId: 'PR-2025-001',
    businessSummary: '乙腈 500mL 采购',
    status: 'running',
    currentNodes: ['n4'],
    currentNodeNames: ['部门审批'],
    assignees: ['张伟'],
    variables: { amount: 6800, item: '乙腈 500mL' },
    startedBy: '李明',
    startedAt: '2024-05-20 14:00',
    history: [
      { id: 'h1', nodeId: 'n1', nodeName: '开始', action: 'start', operator: '系统', timestamp: '2024-05-20 14:00' },
      { id: 'h2', nodeId: 'n2', nodeName: '申请提交', action: 'approved', operator: '李明', comment: '急需', timestamp: '2024-05-20 14:10' },
      { id: 'h3', nodeId: 'n3', nodeName: '金额判断', action: 'condition', operator: '系统', comment: '金额6800>5000', timestamp: '2024-05-20 14:10' },
    ],
  },
  {
    id: 'wi4',
    defId: 'wf1',
    defName: '样品检测流程',
    defVersion: 3,
    businessType: '样品',
    businessId: 'SMP20240520003',
    businessSummary: '土壤重金属检测',
    status: 'completed',
    currentNodes: ['n8'],
    currentNodeNames: ['结束'],
    assignees: [],
    variables: { sampleId: 'SMP20240520003', testItem: '重金属' },
    startedBy: '张伟',
    startedAt: '2024-05-20 08:00',
    completedAt: '2024-05-21 16:00',
    history: [
      { id: 'h1', nodeId: 'n1', nodeName: '开始', action: 'start', operator: '系统', timestamp: '2024-05-20 08:00' },
      { id: 'h2', nodeId: 'n2', nodeName: '样品接收', action: 'approved', operator: '张伟', timestamp: '2024-05-20 08:15' },
      { id: 'h3', nodeId: 'n3', nodeName: '任务分配', action: 'approved', operator: '张伟', timestamp: '2024-05-20 08:30' },
      { id: 'h4', nodeId: 'n4', nodeName: '检测执行', action: 'approved', operator: '李思', timestamp: '2024-05-20 15:00' },
      { id: 'h5', nodeId: 'n5', nodeName: '结果判定', action: 'condition', operator: '系统', timestamp: '2024-05-20 15:00' },
      { id: 'h6', nodeId: 'n7', nodeName: '通知客户', action: 'cc', operator: '系统', timestamp: '2024-05-20 15:05' },
      { id: 'h7', nodeId: 'n8', nodeName: '结束', action: 'end', operator: '系统', timestamp: '2024-05-21 16:00' },
    ],
  },
  {
    id: 'wi5',
    defId: 'wf2',
    defName: '报告审核流程',
    defVersion: 2,
    businessType: '报告',
    businessId: 'RPT20240520002',
    businessSummary: '废水检测报告 #003',
    status: 'terminated',
    currentNodes: ['n3'],
    currentNodeNames: ['技术审核'],
    assignees: ['王强'],
    variables: { reportId: 'RPT20240520002' },
    startedBy: '李思',
    startedAt: '2024-05-19 09:00',
    completedAt: '2024-05-19 11:00',
    history: [
      { id: 'h1', nodeId: 'n1', nodeName: '开始', action: 'start', operator: '系统', timestamp: '2024-05-19 09:00' },
      { id: 'h2', nodeId: 'n2', nodeName: '编制完成', action: 'approved', operator: '李思', timestamp: '2024-05-19 09:30' },
      { id: 'h3', nodeId: 'n3', nodeName: '技术审核', action: 'terminated', operator: '张伟', comment: '客户取消', timestamp: '2024-05-19 11:00' },
    ],
  },
];

// Helper to compute SM3 document hash
export function computeDocumentHash(document: { id: string; reportNo: string; title: string; customerName: string; testResults: any[] }): string {
  const normalized = JSON.stringify({
    id: document.id,
    reportNo: document.reportNo,
    title: document.title,
    customerName: document.customerName,
    testResultCount: document.testResults.length,
    sortedResults: document.testResults.map((r: any) => ({
      itemName: r.itemName,
      result: r.result,
      unit: r.unit,
      judgment: r.judgment,
    })),
  });
  return mockSm3Hash(normalized);
}
