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
  { id: 'c3', name: '华测检测认证集团' },
  { id: 'c4', name: '清源化工有限公司' },
  { id: 'c5', name: '蓝天环境监测站' },
  { id: 'c6', name: '宏达食品有限公司' },
  { id: 'c7', name: '新能科技有限公司' },
  { id: 'c8', name: '康源医药集团' },
];

export const projects = [
  { id: 'p1', name: '地表水监测项目' },
  { id: 'p2', name: '市政供水检测' },
  { id: 'p3', name: '华测检测项目' },
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
  { id: 's3', sampleNo: 'SMP20240520045', name: '土壤样品-3', type: 'soil', typeLabel: '土壤', customerId: 'c3', customerName: '华测检测认证集团', projectId: 'p3', projectName: '华测检测项目', samplingLocation: '经开区监测井A1', samplingTime: '2024-05-20 15:30', receivingTime: '2024-05-20 16:45', receiverId: '2', receiverName: '张伟', priority: 'normal', priorityLabel: '常规', status: 'testing', statusLabel: '检测中', flowStatus: 'assigned', flowStatusLabel: '已分配', assignedLabId: 'l2', assignedLabName: '理化实验室', containerInfo: '自封袋 500g', storageCondition: '常温', createdAt: '2024-05-20 16:45', updatedAt: '2024-05-20 16:45', testItems: 5, testItemsCompleted: 2 },
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
