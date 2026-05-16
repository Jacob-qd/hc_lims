# P0-3 自动派工规则引擎 — 竞品调研与功能设计

## 1. 竞品调研

### 1.1 金现代 (JXD LIMS)

金现代派工核心能力：
- **按样品/项目/方法自动拆分任务**：一个样品含 12 个检测项目，自动拆为 12 个任务
- **自动分组**：相同方法/仪器的任务自动分组，提高批量检测效率
- **自动派工**：根据**检测员资质 + 设备空闲 + 负载均衡**自动分配
- **紧急插单**：紧急样品自动提升优先级，触发排程重算
- **任务可视化**：看板视图展示每个人/每台设备当前任务负载

> 来源：金现代官网 + 化工方案（强调"设备智能辅助排程"）

### 1.2 LabWare

LabWare 派工特点：
- **Rule-based 任务分配**：管理员配置派工规则（如"COD 检测 → 理化实验室 → 王明"）
- **负载均衡**：系统自动将任务分给当前负载最低的合格检测员
- **资质校验**：检测员必须具有对应方法的授权才能被分配

### 1.3 STARLIMS

STARLIMS 派工特点：
- **Instrument-driven 排程**：以设备为核心进行排程，考虑设备通道数、预约、维护时间
- **TAT 驱动**：根据 SLA 倒推每个步骤的时间窗口
- **自动提醒**：任务分配后自动通知检测员

### 1.4 Thermo Fisher SampleManager

SampleManager 派工特点：
- **Workload Management**：可视化的实验室负载仪表盘
- **Bulk Assignment**：支持批量分配（如"将 20 个 pH 检测任务分配给张伟"）
- **优先级动态调整**：根据样品优先级和截止日期动态排序

### 1.5 最佳实践总结

| 能力 | 推荐方案 | 来源 |
|------|---------|------|
| 任务拆分 | 按检测项目自动拆分 | JXD |
| 派工规则 | Rule-based + 资质校验 | LabWare + JXD |
| 负载均衡 | 优先分配给负载最低的合格人员 | LabWare |
| 设备排程 | 考虑设备通道 + 预约 + 维护 | STARLIMS |
| 紧急插单 | 提升优先级 + 触发重排程 | JXD |
| 可视化 | 看板 + 甘特图 + 负载仪表盘 | SampleManager |

---

## 2. 用户故事

### US1 — 任务自动拆分
> 作为**样品管理员**，样品登记完成后，系统自动根据检测项目拆分为独立任务，无需手动创建。

### US2 — 智能派工
> 作为**实验室主管**，系统根据检测员资质、当前负载和设备空闲情况自动分配任务。

### US3 — 紧急插单
> 作为**业务员**，标记为"紧急"的委托，系统自动将关联任务提升到队列最前面。

### US4 — 负载监控
> 作为**实验室主管**，我需要一目了然地看到每个检测员/每台设备当前的任务量和完成进度。

### US5 — 批量操作
> 作为**实验室主管**，我需要批量分配、批量重新排程、批量转移任务。

---

## 3. 功能设计

### 3.1 派工规则引擎架构

```
样品登记完成
     │
     ▼
┌─────────────────┐
│  任务拆分引擎     │  按检测项目拆分为 N 个 Task
│  (Task Splitter) │  Task = Sample + TestItem + Method
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  资质匹配引擎     │  筛选具备该方法授权的检测员
│  (Qual Matcher)  │  筛选支持该方法的仪器
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  负载均衡引擎     │  计算检测员当前负载 (未完成任务数)
│  (Load Balancer) │  选择负载最低的合格人员
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  排程优化引擎     │  考虑设备预约/维护/通道占用
│  (Scheduler)     │  考虑优先级/截止日期/TAT
└────────┬────────┘
         │
         ▼
    任务分配完成 → 通知检测员
```

### 3.2 派工规则配置页面

```
┌──────────────────────────────────────────────────────────┐
│  派工规则配置                              [+ 新建规则]    │
├──────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐    │
│  │ 规则 #1: COD 检测自动派工                        │    │
│  │ 条件: 检测项目 = COD                            │    │
│  │ 分配: 实验室 = 理化实验室                        │    │
│  │      检测员 = 自动(负载最低)                     │    │
│  │      仪器 = COD消解仪 HCA-100                   │    │
│  │ 优先级: 基于样品优先级 + 截止日期                │    │
│  │ 状态: ✅ 启用                        [编辑] [禁用] │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 规则 #2: 重金属检测派工                          │    │
│  │ 条件: 检测项目 IN (Pb, Cd, Hg, As, Cr)          │    │
│  │ 分配: 实验室 = 无机分析室                        │    │
│  │      检测员 = 自动(负载最低·有资质)              │    │
│  │      仪器 = 自动(空闲·已校准)                   │    │
│  │ 状态: ✅ 启用                                    │    │
│  └─────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 3.3 负载监控面板

```
┌──────────────────────────────────────────────────────────┐
│  实验室负载监控                                [自动刷新]  │
├──────────────────────────────────────────────────────────┤
│  👤 检测员负载                                仪器负载    │
│  ┌──────────────────────┐          ┌──────────────────┐ │
│  │ 张伟  ████████░░ 8/10│          │ HPLC-1  ████░ 4/6│ │
│  │ 李明  ██████░░░ 6/10│          │ GC-MS   ██░░░ 2/4│ │
│  │ 王明  ████░░░░░ 4/10│          │ ICP-MS  █████ 5/6│ │
│  │ 郑丽  ███░░░░░░ 3/10│          │ UV-Vis  ██░░░ 2/4│ │
│  └──────────────────────┘          └──────────────────┘ │
│                                                          │
│  任务看板                                                │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐    │
│  │ 待分配  │ 待检测  │ 检测中  │ 待审核  │ 已完成  │    │
│  │   2     │   5     │   8     │   4     │  126    │    │
│  │ TK-005 │ TK-008  │ TK-002  │ TK-004  │ TK-001  │    │
│  │ TK-011 │ TK-010  │ TK-003  │ TK-012  │ TK-006  │    │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 3.4 数据模型

```typescript
// 派工规则
interface DispatchRule {
  id: string;
  name: string;
  conditions: {
    testItemIds?: string[];        // 指定检测项目
    methodIds?: string[];          // 指定方法
    sampleTypes?: string[];        // 指定样品类型
    urgency?: string[];            // 指定优先级
  };
  assignment: {
    labId?: string;                // 指定实验室
    assigneeStrategy: 'auto' | 'manual' | 'named';
    assigneeId?: string;           // 指定检测员
    instrumentStrategy: 'auto' | 'manual' | 'named';
    instrumentId?: string;         // 指定仪器
  };
  priority: {
    base: 'sample_priority' | 'due_date' | 'first_in';
    weightSLA: number;             // SLA 权重
    weightLoad: number;            // 负载权重
  };
  enabled: boolean;
}

// 检测员负载
interface AnalystLoad {
  analystId: string;
  analystName: string;
  currentTasks: number;
  maxCapacity: number;
  completedToday: number;
  averageTAT: number;             // 平均完成时间
}

// 设备负载
interface InstrumentLoad {
  instrumentId: string;
  instrumentName: string;
  currentTasks: number;
  maxChannels: number;
  nextAvailableSlot: string;
  maintenanceScheduled: boolean;
}
```

### 3.5 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/dispatch/rules` | 派工规则列表 |
| POST | `/api/v1/dispatch/rules` | 创建规则 |
| PUT | `/api/v1/dispatch/rules/:id` | 编辑规则 |
| POST | `/api/v1/dispatch/auto` | 执行自动派工 |
| POST | `/api/v1/dispatch/assign` | 手动分配任务 |
| POST | `/api/v1/dispatch/reassign` | 重新排程 |
| GET | `/api/v1/dispatch/load` | 负载监控数据 |

---

## 4. MVP 实现计划 (3天)

| 天 | 内容 |
|:--:|------|
| D1 | 设备能力矩阵 + 派工规则配置页面（含权重参数） |
| D2 | 自动派工核心算法（人+设备双维度）+ 负载看板 + 甘特图 |
| D3 | 手动拖拽微调 + 紧急插单 + 重排程触发 + 集成到 TasksPage |

---

## 5. Review 修正 (v1.1)

### 5.1 补充 User Story

#### US6 — 手动微调自动派工结果
> 作为**实验室主管**，系统自动派工后，我需要在甘特图/看板上看到结果，并能拖拽调整——把张伟的 2 个任务拖给李明。

#### US7 — 紧急插单重排程
> 作为**业务员**，周五下午 4 点收到 20 个紧急样品，系统应一键"全部紧急"，自动重排程，预估新的完成时间。

#### US8 — 设备驱动的任务分配
> 作为**实验室主管**，HPLC #1 故障维修，系统应自动将该设备上的待检测任务重新分配给 HPLC #2（如通道有空闲）。

#### US9 — 基于历史效率的智能分配
> 作为**系统**，应学习每个检测员对每种方法的平均完成时间（张伟做 COD 平均 2.3 小时，李明 3.1 小时），紧急任务优先分配给效率更高的人。

#### US10 — 负载预警
> 作为**实验室主管**，当某人或某设备的负载超过 80%，系统应自动告警并建议"考虑分配给 XXX"。

### 5.2 设备能力矩阵

```typescript
interface InstrumentCapability {
  instrumentId: string;
  instrumentName: string;
  supportedMethods: string[];     // 支持的方法 ID
  supportedTestItems: string[];   // 支持的检测项目 ID
  channelCount: number;           // 通道数（同时可运行的任务数）
  calibrationStatus: 'valid' | 'expiring_30d' | 'expiring_7d' | 'expired';
  calibrationDueAt: string;
  maintenanceStatus: 'available' | 'scheduled' | 'in_progress';
  nextMaintenanceAt?: string;
  averageTAT: number;            // 该方法在设备上的平均耗时(小时)
}
```

### 5.3 排程算法明确定义

```typescript
interface DispatchScore {
  taskId: string;
  analystId: string;
  instrumentId?: string;
  totalScore: number;
  breakdown: {
    urgencyScore: number;    // 权重 0.35
    tatScore: number;        // 权重 0.25
    loadScore: number;       // 权重 0.20
    efficiencyScore: number; // 权重 0.15
    equipmentScore: number;  // 权重 0.05
  };
}

function calculateDispatchScore(task: Task, analyst: Analyst, instrument?: Instrument): DispatchScore {
  const urgencyScore = { normal: 1, rush: 2, urgent: 3 }[task.urgency] * 0.35;
  const tatScore = (1 / Math.max(task.remainingTAT, 0.5)) * 0.25;
  const loadScore = (1 - analyst.currentLoad / analyst.maxCapacity) * 0.20;
  const efficiencyScore = (1 / analyst.averageTAT[task.methodId]) * 0.15;
  const equipmentScore = instrument && instrument.calibrationStatus === 'valid' ? 0.05 : 0;
  
  return {
    taskId: task.id, analystId: analyst.id, instrumentId: instrument?.id,
    totalScore: urgencyScore + tatScore + loadScore + efficiencyScore + equipmentScore,
    breakdown: { urgencyScore, tatScore, loadScore, efficiencyScore, equipmentScore }
  };
}
```

### 5.4 重排程触发条件

| 触发事件 | 影响范围 | 重排程动作 |
|---------|---------|----------|
| 设备故障/离线 | 该设备所有待执行任务 | 寻找同能力替代设备 |
| 检测员请假 | 该检测员所有未开始任务 | 重新分配给其他合格人员 |
| 紧急插单 | 所有未开始任务 | 提升紧急任务优先级，重算顺序 |
| 前序任务超时 | 依赖链上的后续任务 | 预警 + 建议重新分配 |
| 新设备上线 | 可选的排队任务 | 可选地分担负载 |

### 5.5 并发安全

```typescript
// 采用乐观锁 + 版本号
interface Task {
  id: string;
  version: number;  // 每次分配 +1
}

async function assignTask(taskId: string, analystId: string): Promise<void> {
  const task = await db.findTask(taskId);
  const updated = await db.updateTask(
    { id: taskId, version: task.version },
    { assigneeId: analystId, version: task.version + 1 }
  );
  if (updated.affectedRows === 0) {
    throw new ConcurrencyError('任务已被其他人分配，请刷新重试');
  }
}
```

### 5.6 手动拖拽调整

派工看板采用看板 + 甘特图双视图：
- **看板视图**：按检测员分列，每列显示当前任务卡片（可拖拽）
- **甘特图视图**：时间轴显示任务排期（可拖拽调整时间）
- 拖拽后自动验证：目标检测员是否有资质、设备是否可用
- 验证失败时显示原因并回弹

---

## 6. 开发实现规格

### 6.1 组件树 (TasksPage增强)
```
TasksPage
├── Tabs
│   ├── Tab[任务列表] (原有)
│   └── Tab[任务看板]
│       ├── Card[派工规则]
│       │   ├── RuleTable (规则名/条件/分配策略/状态/操作)
│       │   └── Button[新建规则] → toast
│       ├── Card[负载监控]
│       │   ├── 检测员负载 (每行: 名字 + 当前/最大 + 进度条)
│       │   ├── 设备占用 (每行: 名字 + 通道占用 + 进度条)
│       │   ├── Button[执行自动派工] → toast含分配数量
│       │   └── Button[批量分配]
│       └── KanbanBoard (原有)
```

### 6.2 负载监控数据流
```
页面加载 → 本地mock数据渲染
进度条: percent = (currentLoad / maxCapacity) * 100
颜色: >= 80% red, >= 60% yellow, < 60% green
检测员数据: { name, load, max, completed, avgTAT }
设备数据: { name, load, max, 通道 }
```

### 6.3 交互事件
```
[执行自动派工] → 遍历待分配任务 → 匹配规则 → 选择负载最低的合格检测员 → toast "已分配N个任务"
[批量分配] → toast "批量分配功能"
```

### 6.4 边缘情况
| 场景 | 处理 |
|------|------|
| 所有检测员负载已满 | 提示"当前无可用检测员" |
| 设备全部离线 | 提示"当前无可用设备" |
| 规则未配置 | 显示Empty: "暂无派工规则, 点击新建" |

### 6.5 API
```
GET  /api/v1/dispatch/rules   → { list: DispatchRule[] }
POST /api/v1/dispatch/auto    → { assigned: number, details: [...] }
GET  /api/v1/dispatch/load    → { analysts: AnalystLoad[], instruments: InstrumentLoad[] }
```

### 6.6 测试
| # | 测试 | 预期 |
|---|------|------|
| T1 | 执行自动派工 | toast "已分配5个任务" |
| T2 | 张伟负载8/10 | 进度条80%, 黄色异常状态 |
| T3 | 设备GC-MS 2/4通道 | 进度条50%, 绿色正常 |
