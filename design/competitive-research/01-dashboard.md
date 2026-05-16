# 模块 1: 仪表盘/工作台 — 竞品调研 + 设计 + 实现对比

---

## 1. 竞品调研

### 1.1 金现代 (JXD) — 驾驶舱

金现代的驾驶舱核心能力：
- **检测量看板**：今日/本周/本月样品量、完成量、合格率，可钻取到明细
- **任务进度**：按检测员/设备/方法三个维度展示实时进度，支持逾期预警
- **设备状态**：设备运行/空闲/故障/维护中 实时面板，含利用率排名
- **成本分析**：检测成本趋势、人均产出、设备 ROI
- **预警中心**：质控违规、设备校准到期、试剂效期、资质到期四类预警聚合
- **可配置看板**：管理员可自定义图表组件和布局

> 来源：JXD 官网 + 化工方案页（强调"秒级预警 + 1 分钟出日报"）

### 1.2 Thermo Fisher SampleManager

SampleManager 仪表盘特点：
- **KPI Dashboard**：预设 20+ KPI 指标卡片
- **Workload Overview**：按实验室/部门展示当前负载
- **Turnaround Time Analysis**：TAT 趋势图 + 超标分析
- **Sample Lifecycle**：每个样品的完整生命周期可视化

### 1.3 LabWare

LabWare 仪表盘特点：
- **Role-based Dashboards**：不同角色看到不同的默认看板
- **Drill-down**：从汇总数字 → 图表 → 列表 → 详情
- **Alert Dashboard**：独立告警面板，按严重程度分级

### 1.4 STARLIMS

STARLIMS 仪表盘特点：
- **Integrated Analytics**：内置 BI 引擎，支持多数据源
- **Scheduled Reports**：定时推送到邮箱
- **Compliance Dashboard**：合规状态一目了然

### 1.5 最佳实践总结

| 能力 | 推荐方案 | 来源 |
|------|---------|------|
| KPI 卡片 | 实时数字 + 同比环比 + 点击钻取 | SampleManager |
| 任务进度 | 按人/设备/方法三维展示 + 逾期红色标记 | JXD |
| 设备状态 | 实时面板 + 利用率排行 | JXD |
| 预警聚合 | 四类预警统一入口 + 分级显示 | JXD |
| 角色定制 | 不同角色不同默认看板 | LabWare |
| 定时推送 | 日报/周报自动生成推送 | STARLIMS |

---

## 2. User Story

### US1 — 主管晨会看板
> 作为**实验室主管**，每天早上打开系统，第一眼看到：今天有多少样品待检测、多少报告待签发、哪些设备故障、哪些质控违规。所有关键信息在一屏内。

### US2 — 样品量趋势
> 作为**实验室主管**，我需要看到近 6 个月样品量趋势（同比/环比），判断业务增长是否需要增加人手。

### US3 — TAT 监控
> 作为**实验室主管**，我需要知道哪些样品/检测项目超期了，以及超期原因（设备故障？人员不足？）。

### US4 — 预警一键处理
> 作为**QA**，仪表盘上的质控违规告警应能一键跳转到对应处理页面，而不是让我去菜单里找。

### US5 — 自定义工作台
> 作为**检测员**，我只想看我的待办任务和我的质控数据，不需要看到全实验室的统计。

### US6 — 定时报表推送
> 作为**实验室主管**，每天早上 8:00 应自动收到昨日的检测日报邮件。

---

## 3. 功能设计

### 3.1 布局设计

```
┌──────────────────────────────────────────────────────────┐
│  🏠 工作台                                 [自定义工作台]  │
├──────────────────────────────────────────────────────────┤
│  📊 KPI 卡片行 (4列)                                     │
│  ┌────────┬────────┬────────┬────────┐                  │
│  │ 今日样品│ 完成率  │ 超期数  │ 设备在线│                  │
│  │  28    │ 94.2%  │  3 🔴  │ 8/10  │                  │
│  │ ↑12%   │ ↑2.1%  │ ↓1     │ 正常  │                  │
│  └────────┴────────┴────────┴────────┘                  │
├──────────────────────────┬───────────────────────────────┤
│  📈 样品量趋势 (6月)     │  ⚠️ 预警中心                    │
│  [折线图 + 柱状图]       │  🔴 质控违规 1项 → 处理        │
│                          │  🟡 设备校准到期 2台           │
│                          │  🟡 试剂效期 3个              │
│                          │  🔵 资质到期 1人              │
├──────────────────────────┼───────────────────────────────┤
│  📋 待办任务队列          │  🔧 设备状态面板               │
│  [表格: 任务号/样品/项目  │  HPLC-1 🟢 运行中             │
│   /检测员/状态/SLA]      │  GC-MS  🟢 运行中             │
│                          │  ICP-MS 🟡 维护中             │
│                          │  UV-Vis 🟢 空闲               │
│                          │  [查看全部 →]                 │
├──────────────────────────┴───────────────────────────────┤
│  📊 实验室工作量对比 (柱状图)                              │
│  理化室 ████████ 420  仪器室 ██████ 280                   │
│  无机室 ████ 190       环境室 ███ 150                    │
└──────────────────────────────────────────────────────────┘
```

### 3.2 数据模型

```typescript
interface DashboardData {
  kpis: {
    todaySamples: number;
    todaySamplesTrend: number;      // 环比百分比
    completionRate: number;
    overdueCount: number;
    onlineInstruments: number;
    totalInstruments: number;
    pendingReports: number;
    revenueMTD: number;
  };
  sampleTrend: { month: string; count: number; lastYear: number }[];
  taskQueue: DashboardTask[];
  instrumentStatus: InstrumentStatus[];
  alerts: DashboardAlert[];
  labWorkload: { lab: string; samples: number; tasks: number }[];
}

interface DashboardTask {
  taskNo: string;
  sampleName: string;
  testItem: string;
  analyst: string;
  status: string;
  slaRemaining: number; // 小时
}

interface DashboardAlert {
  id: string;
  type: 'qc_violation' | 'calibration_due' | 'reagent_expiry' | 'cert_expiry';
  level: 'critical' | 'warning' | 'info';
  message: string;
  linkUrl: string;  // 跳转处理页面
  createdAt: string;
}
```

### 3.3 角色差异化

| 角色 | 默认 KPI | 可见图表 | 预警范围 |
|------|---------|---------|---------|
| 实验室主管 | 全实验室统计 | 全部 | 全部 |
| 检测员 | 我的任务/我的完成率 | 个人统计 | 仅我的 |
| QA | 质控统计 + 违规 | 质控趋势 | 全部 |
| 收样员 | 今日收样/待收样 | 收样统计 | 样品相关 |
| 客户 | 我的委托进度 | 仅本人 | 无 |

---

## 4. HC-LIMS 当前实现对比

### 4.1 现有实现

**文件**: `DashboardPage.tsx` (325行) + `StatisticsPage.tsx` (134行)

| 设计项 | 实现状态 | 差距 |
|--------|:---:|------|
| KPI 卡片 | ✅ 4 个卡片 (总样品/周转时间/报告率/利用率) | 缺同比环比箭头和颜色 |
| 样品量趋势 | ✅ 折线图 (近5月) | 缺去年同比线 |
| 任务队列 | ✅ 任务表格 | 缺 SLA 倒计时和颜色 |
| 预警中心 | ❌ | **未实现** — 这是最大的缺失 |
| 设备状态 | ✅ 仪器卡片 | 基本可用 |
| 角色差异化 | ❌ | **所有人看到相同看板** |
| 自定义工作台 | ✅ 看板设计器 Drawer | 可拖拽排序 |
| 定时推送 | ❌ | **未实现** |
| 钻取功能 | ⚠️ | 部分 (查看全部链接) |
| 实验室工作量 | ✅ 在 StatisticsPage | 分离在另一个页面 |

### 4.2 差距评估

| 维度 | 当前评分 | 目标 | 差距 |
|------|:---:|:---:|------|
| KPI 完整性 | 60% | 85% | 缺同比环比 + 趋势箭头 |
| 预警聚合 | 10% | 90% | **最大缺失** — 无统一预警入口 |
| 角色差异化 | 10% | 80% | 需基于 RBAC 动态加载 |
| 数据钻取 | 40% | 80% | 需从汇总到明细的完整链路 |

### 4.3 优先改进项

1. 🔴 **预警中心**：聚合质控违规/校准到期/试剂效期/资质到期四类预警
2. 🟡 **KPI 增强**：添加同比环比 + 红绿箭头
3. 🟡 **角色看板**：基于当前用户角色动态展示
4. 🟢 **定时推送**：日报/周报自动生成

---

## 5. 开发实现规格 — 预警中心 (最大缺失)

### 5.1 组件
```
DashboardPage 新增:
└── AlertPanel (替换现有简单告警列表)
    ├── AlertSummary (4类计数: 🔴质控/🟡校准/🟡试剂/🔵资质)
    └── AlertList
        └── AlertItem (类型图标 + 级别Badge + 消息 + 时间 + [处理]按钮)
```

### 5.2 预警数据结构
```typescript
interface DashboardAlert {
  id: string;
  type: 'qc_violation' | 'calibration_due' | 'reagent_expiry' | 'cert_expiry';
  level: 'critical' | 'warning' | 'info';
  message: string;
  detail: string;
  linkUrl: string;     // 点击[处理]跳转
  createdAt: string;
  acknowledged: boolean;
}
```

### 5.3 交互
```
[处理] → 根据 linkUrl 跳转: qc_violation→/quality, calibration_due→/instruments, reagent_expiry→/inventory, cert_expiry→/personnel
预警计数: 实时从各模块聚合, 未acknowledged的计入Badge
```

### 5.4 KPI增强
```
每个KPI卡片增加:
├── 数值 (大号)
├── 同比/环比箭头 (↑绿色 ↓红色)
├── 变化百分比
└── onClick → 钻取到明细列表
```

### 5.5 测试
| # | 测试 | 预期 |
|---|------|------|
| T1 | 仪表盘加载 | 4类预警计数正确 |
| T2 | 点击质控违规[处理] | 跳转到 /quality |
| T3 | KPI点击钻取 | 跳转到对应列表页 |
