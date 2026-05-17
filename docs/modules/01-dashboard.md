# 首页 Dashboard（驾驶舱）

> 对标: StarLIMS Dashboard | LabWare Home Page
> 现有代码: `src/pages/DashboardPage.tsx` (325行) | `src/components/CustomWorkspace.tsx` (66行)
> 成熟度: ✅ 已实现核心功能

---

## 1. 功能概述

首页驾驶舱，集中展示实验室运营关键指标（KPI），提供快速操作入口和自定义工作台功能。

### 已实现功能

| 功能点 | 状态 | 说明 |
|--------|:----:|------|
| KPI 卡片（样品总数/待检测/逾期任务/已签报告） | ✅ | 4项核心指标 + 环比 |
| 最近样品表格（5条，含状态标签） | ✅ | 最新登记的5条样品 |
| 任务队列面板（待分配/待检测/待审核/待批准/已逾期） | ✅ | 按状态分组展示 |
| 仪器状态概览（前5台） | ✅ | 运行/空闲/离线/故障 |
| 系统提醒面板 | ✅ | 逾期/维护/版本/批准通知 |
| 周转时间趋势折线图 | ✅ | 近7天，按样品类型分线 |
| 样品类型分布环形图 | ✅ | 各类样品占比 |
| 快速操作入口 | ✅ | 样品登记/创建检测/查看报告等 |
| 实验室切换（中心实验室/理化/仪器分析室） | ✅ | 顶部下拉切换 |
| 自定义工作台配置（拖拽组件+栅格布局） | ✅ | 组件可见性配置+本地存储 |

---

## 2. 用户故事

### US-01: 实验室主任每日查看 KPI
> 作为**实验室主任**，每天登录系统后首先看到首页驾驶舱，我可以一目了然地掌握实验室运营状况。

**验收标准：**
- [ ] 4 项 KPI 指标正确显示：样品总数、待检测数、逾期任务数、已签发报告数
- [ ] 每项指标显示与昨日的环比变化（上升/下降百分比）
- [ ] 数据每天早上自动刷新
- [ ] 点击 KPI 卡片可跳转到对应模块详情

### US-02: 检测组长监控任务队列
> 作为**检测组长**，我通过首页的任务队列面板了解各状态任务的数量，发现积压后及时调整人员分配。

**验收标准：**
- [ ] 任务队列按状态分组展示
- [ ] 每个分组显示任务数量
- [ ] 逾期任务高亮标记（红色）
- [ ] 点击分组可跳转到任务管理页的筛选视图

### US-03: 质量主管查看异常提醒
> 作为**质量主管**，我通过首页系统提醒面板查看逾期任务、仪器维护到期、超期留样等异常信息。

**验收标准：**
- [ ] 提醒按类型分组（逾期/维护/版本/批准）
- [ ] 每条提醒时间明确
- [ ] 未读提醒有红点标记
- [ ] 点击提醒跳转到对应处理页面

### US-04: 检测员自定义工作台
> 作为**检测员**，我不需要查看仪器状态，我希望隐藏不需要的组件，只保留任务队列和我的样品。

**验收标准：**
- [ ] 点击"自定义工作台"按钮打开配置弹窗
- [ ] 组件列表以开关形式展示，可切换可见性
- [ ] 配置自动保存到本地存储
- [ ] 下次登录配置保留

### US-05: 切换实验室上下文
> 作为**超级用户**，我为多个实验室提供 LIMS 服务，需要在首页顶部切换不同实验室的视角。

**验收标准：**
- [ ] 顶部实验室下拉选择器
- [ ] 切换后所有数据按选定实验室过滤
- [ ] 切换显示提示消息确认

---

## 3. 数据模型

```typescript
// KPI 统计
interface DashboardStats {
  totalSamples: number;
  pendingTests: number;
  overdueTasks: number;
  completedReports: number;
  // 环比
  sampleTrend: number;     // +12.5%
  testTrend: number;
  overdueTrend: number;
  reportTrend: number;
}

// 任务队列分组
interface TaskQueue {
  toAssign: number;
  inProgress: number;
  toReview: number;
  toApprove: number;
  overdue: number;
}

// 仪器状态
interface InstrumentStatus {
  id: string;
  name: string;
  status: 'running' | 'idle' | 'offline' | 'maintenance';
  currentMethod?: string;
}

// 提醒
interface Alert {
  id: string;
  type: 'overdue' | 'maintenance' | 'version' | 'approval';
  title: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
}
```

---

## 4. API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/dashboard/stats` | KPI 统计数据 |
| GET | `/api/v1/dashboard/recent-samples?limit=5` | 最近样品 |
| GET | `/api/v1/dashboard/task-queue` | 任务队列 |
| GET | `/api/v1/dashboard/instruments?limit=5` | 仪器状态 |
| GET | `/api/v1/dashboard/alerts` | 系统提醒 |
| GET | `/api/v1/dashboard/charts/turnaround` | 周转时间趋势 |
| GET | `/api/v1/dashboard/charts/sample-distribution` | 样品类型分布 |
| GET | `/api/v1/dashboard?lab=physics` | 带实验室过滤的全部数据 |
