# P1-04 工作流引擎

> 对标: StarLIMS BPMN 工作流 | LabWare Workflow Engine
> 版本: v1.0 | 优先级: P1 | 估算: 6周

---

## 1. 功能概述

自研轻量级工作流引擎，支持审批流程、检测流程、通知规则的可视化配置。替代当前硬编码的固定审批流。

### 核心能力

- 可视化流程设计器（拖拽式）
- 流程定义版本管理
- 运行时引擎（状态机驱动）
- 待办/已办/抄送任务中心
- 流程监控与干预
- 超时处理与升级

---

## 2. 用户故事

### US-01: 质量主管设计审批流程
> 作为**质量主管**，我可以在可视化设计器中拖拽创建报告审批流程：编制→室主任审核→技术负责人批准，无需开发支持。

### US-02: 检测员处理待办
> 作为**检测员**，登录系统后看到统一的待办任务中心，显示所有需要我审批/处理的流程任务。

### US-03: 质量负责人监控流程
> 作为**质量负责人**，我可以查看所有进行中的流程实例，高亮当前节点，对卡住的流程进行干预（转交/终止）。

---

## 3. 功能需求

### FR-01: 节点类型

| 节点类型 | 说明 | 配置项 |
|---------|------|--------|
| 开始 | 流程起点 | 触发条件（业务事件/手动发起） |
| 审批 | 单人审批 | 审批人/角色、驳回目标 |
| 会签 | 多人全部通过 | 审批人列表、通过比例 |
| 知会 | 通知相关人员 | 接收人/角色 |
| 条件 | 分支网关 | 条件表达式 (JavaScript) |
| 并行 | 并行执行 | — |
| 延时 | 定时等待 | 等待时长、到期自动执行 |
| 子流程 | 调用其他流程 | 子流程 ID |
| 结束 | 流程终点 | — |

### FR-02: 审批策略

| 策略 | 说明 |
|------|------|
| 或签（单人通过） | 任一审批人通过即进入下一节点 |
| 会签（全部通过） | 所有审批人通过才进入下一节点 |
| 比例会签 | 超过 N% 通过即进入下一节点 |
| 顺序审批 | 按指定顺序逐一审批 |
| 动态加签 | 审批过程中可添加额外审批人 |

### FR-03: 超时处理

| 超时策略 | 说明 |
|---------|------|
| 提醒 | 超时后发送通知给审批人 |
| 升级 | 超时后转交上级/指定人 |
| 自动通过 | 超时后自动通过 |
| 自动驳回 | 超时后自动驳回 |

---

## 4. UI/UX 设计

### 4.1 流程设计器

```
┌─────────────────────────────────────────────────────┐
│  流程设计器 → 报告审批流程                            │
│                                                      │
│  节点面板       画布                    属性面板      │
│  ┌──────┐   ┌─────────────────────┐   ┌──────────┐  │
│  │ 开始  │   │                     │   │ 节点属性  │  │
│  │ 审批  │   │  (开始) → (编制)    │   │ 名称: 审核│  │
│  │ 会签  │   │     ↓              │   │ 审批人:   │  │
│  │ 知会  │   │  (审核) → (条件)   │   │ [室主任⬇]│  │
│  │ 条件  │   │     ↓              │   │ 驳回目标: │  │
│  │ 延时  │   │  ┌───┴───┐         │   │ [编制]    │  │
│  └──────┘   │  │通过   │不通过     │   │          │  │
│             │  │  ↓     ↓          │   │ 超时策略: │  │
│             │  │(批准) (退回编制)   │   │ [升级⬇]  │  │
│             │  │  ↓                │   │          │  │
│             │  │ (结束)            │   └──────────┘  │
│             └─────────────────────┘                  │
└─────────────────────────────────────────────────────┘
```

### 4.2 待办任务中心

```
┌──────────────────────────────────────────────────────┐
│  待办任务 (5)    已办 (23)   抄送 (3)                │
│                                                      │
│  ┌── 待办列表 ───────────────────────────────────┐  │
│  │ 🔴 报告审批: 水质检测报告 #001  室主任审核   │  │
│  │   收到: 10:30  超时: 16:30  [处理] [转交]    │  │
│  │                                              │  │
│  │ 🟡 采购审批: 乙腈 500mL     技术负责人审批    │  │
│  │   收到: 09:00  还剩 2h      [处理] [转交]    │  │
│  │                                              │  │
│  │ 🔵 方法验证审批: COD 测定法  质量负责人审批   │  │
│  │   收到: 昨天 15:00 已超时     [处理] [升级]   │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 4.3 审批处理弹窗

```
┌──────────────────────────────────────┐
│  审批: 水质检测报告 #001              │
│                                        │
│  流程图: [编制] → ●[审核] → [批准]    │
│                                        │
│  ┌── 报告内容 ─────────────────────┐  │
│  │  项目: COD, BOD, NH3-N          │  │
│  │  结果: 12.3, 5.6, 2.1 mg/L     │  │
│  └────────────────────────────────┘  │
│                                        │
│  审批意见:                             │
│  [________________________________]   │
│                                        │
│  [驳回]  [退回上一步]  [通过]          │
└──────────────────────────────────────┘
```

---

## 5. 数据结构

```sql
-- 流程定义
CREATE TABLE workflow_definitions (
  id              VARCHAR(32) PRIMARY KEY,
  name            VARCHAR(128) NOT NULL,
  module          VARCHAR(32) NOT NULL,
  description     TEXT,
  version         INT DEFAULT 1,
  nodes           JSONB NOT NULL,      -- 节点数组
  edges           JSONB NOT NULL,      -- 边数组
  published       BOOLEAN DEFAULT FALSE,
  created_by      VARCHAR(32),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 流程实例
CREATE TABLE workflow_instances (
  id              VARCHAR(32) PRIMARY KEY,
  def_id          VARCHAR(32) NOT NULL REFERENCES workflow_definitions(id),
  def_version     INT NOT NULL,
  business_type   VARCHAR(32) NOT NULL,
  business_id     VARCHAR(32) NOT NULL,
  business_summary TEXT,
  status          VARCHAR(16) DEFAULT 'running',
  current_nodes   JSONB,               -- 当前活动节点 IDs
  variables       JSONB,               -- 流程变量
  started_by      VARCHAR(32),
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(business_type, business_id)
);

-- 流程任务
CREATE TABLE workflow_tasks (
  id              VARCHAR(32) PRIMARY KEY,
  instance_id     VARCHAR(32) NOT NULL REFERENCES workflow_instances(id),
  node_id         VARCHAR(32) NOT NULL,
  node_name       VARCHAR(128),
  assignee        VARCHAR(32),          -- 指定审批人
  assignee_role   VARCHAR(32),          -- 指定角色
  status          VARCHAR(16) DEFAULT 'pending',
  action          VARCHAR(32),          -- approved | rejected | transferred
  comment         TEXT,
  deadline        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  acted_at        TIMESTAMPTZ
);
```

---

## 6. API 设计

```
# 流程定义
GET    /api/v1/workflow/definitions                     # 流程列表
POST   /api/v1/workflow/definitions                     # 创建流程
PUT    /api/v1/workflow/definitions/:id                  # 更新
POST   /api/v1/workflow/definitions/:id/publish          # 发布
POST   /api/v1/workflow/definitions/:id/validate         # 校验

# 流程实例
POST   /api/v1/workflow/instances                        # 启动流程
GET    /api/v1/workflow/instances/:id                    # 流程详情
POST   /api/v1/workflow/instances/:id/terminate          # 终止流程

# 任务
GET    /api/v1/workflow/tasks?assignee=xxx&status=pending  # 待办列表
POST   /api/v1/workflow/tasks/:id/approve                # 通过
POST   /api/v1/workflow/tasks/:id/reject                 # 驳回
POST   /api/v1/workflow/tasks/:id/transfer               # 转交
```

---

## 7. 技术方案

```
┌────────────────────────────────────────────────────┐
│                   前端                              │
│  ┌─────────────┐  ┌─────────────┐                  │
│  │ 流程设计器   │  │ 任务中心     │                  │
│  │ (ReactFlow)  │  │ Task列表    │                  │
│  └──────┬──────┘  └──────┬──────┘                  │
└─────────┼────────────────┼─────────────────────────┘
          │                │
┌─────────┼────────────────┼─────────────────────────┐
│         ▼                ▼                          │
│  ┌────────────────────────────────────┐            │
│  │        Workflow Engine (Service)    │            │
│  │                                     │            │
│  │  ┌──────────┐  ┌───────────────┐  │            │
│  │  │ Definition│  │ Instance     │  │            │
│  │  │ Manager   │  │ Executor     │  │            │
│  │  └──────────┘  │ · StateMachine│  │            │
│  │                 │ · NodeMatcher │  │            │
│  │  ┌──────────┐  │ · TaskCreator │  │            │
│  │  │ Timer    │  └───────┬───────┘  │            │
│  │  │ Scheduler│          │          │            │
│  │  └──────────┘  ┌───────┴───────┐  │            │
│  │                │   DB/Redis   │  │            │
│  └────────────────┴───────────────┘  │            │
└──────────────────────────────────────┘            │
                                                     │
 关键依赖: reactflow (React Flow) — 可视化设计器
           xstate — 状态机（可选）
           node-cron — 超时调度
```

### 引擎运行逻辑

```
启动实例 → 找到起始节点 → 创建任务 → 
等待任务完成 → 根据结果推进到下一节点 → 
如果是条件节点 → 解析条件表达式 → 选择分支 →
循环直到到达结束节点
```

---

## 8. 验收标准

| # | 测试场景 | 预期结果 |
|:-:|---------|---------|
| 1 | 拖拽创建 3 节点流程（开始→审批→结束） | 流程定义保存成功 |
| 2 | 启动流程实例 | 实例运行，第一个节点任务创建 |
| 3 | 审批通过 | 流程推进到下一节点 |
| 4 | 审批驳回 | 流程回到指定退回节点 |
| 5 | 条件分支 | 根据变量值进入正确分支 |
| 6 | 超时升级 | 超时后任务转交升级人 |
| 7 | 流程监控 → 终止 | 实例状态变为 terminated |
| 8 | 待办列表 | 只显示当前用户的待办任务 |
