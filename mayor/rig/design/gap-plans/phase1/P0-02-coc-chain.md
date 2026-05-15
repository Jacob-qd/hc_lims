# P0-02 COC 监管链（Chain of Custody）

> 对标: StarLIMS COC | LabWare Chain of Custody
> 版本: v1.0 | 优先级: P0 | 估算: 2周

---

## 1. 功能概述

实现从样品采集到处置的全生命周期监管链追踪系统。基于**事件溯源（Event Sourcing）**模式，每个流转节点生成不可篡改的事件记录，确保样品的完整性和可追溯性。

### 核心能力

- COC 表单自动生成（含编号规则）
- 样品交接扫码签收
- 全链路事件溯源
- 链式完整性自动校验
- 样品处置管理
- COC 可视化时间线
- COC 审计报告导出

### 业务价值

| 价值 | 说明 |
|------|------|
| ISO 17025 合规 | 满足认可准则对样品追溯的要求 |
| 司法证据效力 | 监管链完整，具备司法采信力 |
| 防差错 | 扫码交接防止样品混淆/丢失 |
| 效率提升 | 从纸版记录→电子追溯，查询即时 |

---

## 2. 用户故事

### US-01: 采样员现场采集样品
> 作为**采样员**，完成现场采样后，我要在系统中生成 COC 表单并打印，以便随样品一并送达实验室。

### US-02: 收样员签收样品
> 作为**收样员**，收到送达样品后，我要扫码签收并核对 COC 信息，以确认样品完整到达。

### US-03: 质量主管追踪异常
> 作为**质量主管**，发现某样品在 COC 链中长时间未流转，我需要查看完整时间线找出滞留环节。

### US-04: 检测员确认分样
> 作为**检测员**，我要记录从原始样品中分样的操作，确保子样品与母样品的追溯关系清晰。

---

## 3. 功能需求

### FR-01: COC 编号生成

| 规则 | 说明 |
|------|------|
| 格式 | `COC-{YYMMDD}-{4位流水号}` |
| 示例 | `COC-260515-0001` |
| 规则可配 | 前缀、日期格式、流水号位数 |
| 唯一性 | 全局唯一，数据库约束 |

### FR-02: 事件类型

| 事件 | 触发条件 | 记录内容 |
|------|---------|---------|
| SAMPLING 采样 | 采样员完成采样登记 | 采样点位、采样时间、采样方法、采样人 |
| SUBMISSION 送样 | 样品移交快递/送样人 | 送样人、送样时间、运输方式 |
| RECEIPT 收样 | 实验室扫码签收 | 收样人、收样时间、温度状态、外观状态 |
| REGISTRATION 登记 | 实验室完成样品登记 | 登记人、登记时间、样品编号 |
| SUB_SAMPLING 分样 | 从母样分出子样 | 分样人、子样编号、分样量、分样日期 |
| TESTING 检测 | 开始/完成检测 | 检测人、检测项目、检测日期 |
| RETENTION 留样 | 样品移交留样区 | 留样人、留样位置、留样条件、保留期限 |
| DISPOSAL 处置 | 留样到期处置 | 处置人、处置方式、处置日期 |
| EXCEPTION 异常 | 发现异常情况 | 异常类型、描述、处理措施、处理人 |

### FR-03: 样品交接

**交接流程：**
```
送样方操作：提交交接 → 系统生成交接单 → 打印 COC 二维码
收样方操作：扫描二维码 → 核对信息 → 电子签名确认 → COC 更新
```

**交接校验：**
- 样品数量核对（实物 vs 表单）
- 样品外观状态记录（完好/破损/泄漏）
- 运输温度记录（如有冷链要求）
- 交接时间差（采样→送样→收样 时长）

### FR-04: 链式完整性校验

| 校验规则 | 说明 |
|---------|------|
| 前序事件校验 | 每个事件必须有合法的前序事件 ID |
| 时间顺序校验 | 后序事件时间必须≥前序事件时间 |
| 事件顺序规则 | 按业务定义的合法事件序列（如 采样→送样→收样 不能颠倒） |
| 缺失检测 | 发现链式断裂时标记 "BROKEN" 状态 |
| 自动修复 | 仅管理员可插入补录事件（需审批） |

### FR-05: 样品处置

| 处置方式 | 说明 |
|---------|------|
| 销毁 | 按危废/普通废品流程销毁，记录销毁方式 |
| 退回 | 退回委托方，记录退回原因 |
| 续期 | 延长留样期限（需审批） |
| 移交 | 移交其他实验室/部门 |

### FR-06: COC 可视化

- 水平时间线展示全部事件节点
- 每个节点显示: 事件图标 + 操作人 + 时间 + 位置
- 状态颜色: 正常(绿)、异常(红)、进行中(蓝)
- 点击节点展开详情
- 支持时间线缩放

---

## 4. UI/UX 设计

### 4.1 COC 时间线

```
┌──────────────────────────────────────────────────────┐
│  COC: COC-260515-0001  状态: ✅ 流转中               │
│                                                      │
│  采样 ─── 送样 ─── 收样 ──●── 登记 ── 检测 ── 留样 ── 处置│
│  05:00    06:00    08:00   │  09:00   10:00   15:00  T+30d│
│  张三     李四     王五    │  赵六    钱七    孙八    │
│                            │                          │
│                     ● 当前 分样                       │
│                       09:05 子样品 S-001             │
│                                                      │
│   ⚠ 采样到送样间隔 1h                               │
└──────────────────────────────────────────────────────┘
```

### 4.2 交接界面

```
┌──────────────────────────────────────┐
│  📦 样品交接                          │
│                                        │
│  扫码编号: COC-260515-0001            │
│  样品数: 5/5 ✅ 全部到齐              │
│                                        │
│  ┌── COC 信息 ─────────────────────┐  │
│  │ 委托单位: 环境监测中心           │  │
│  │ 采样日期: 2026-05-15 05:00      │  │
│  │ 运输方式: 冷链专送               │  │
│  │ 温度记录: 2.3°C ✅ 符合要求      │  │
│  │ 样品外观: 完好                   │  │
│  └────────────────────────────────┘  │
│                                        │
│  交接确认:                             │
│  [王五] 已确认样品数量和状态无误。     │
│  签名: [✍️ 签名区域]                   │
│                                        │
│         [退回]    [确认签收]            │
└──────────────────────────────────────┘
```

---

## 5. 数据结构

```sql
-- COC 链主表
CREATE TABLE coc_chains (
  id              VARCHAR(32) PRIMARY KEY,
  coc_number      VARCHAR(32) NOT NULL UNIQUE,
  sample_id       VARCHAR(32),
  status          VARCHAR(16) DEFAULT 'active',  -- active | completed | broken | disposed
  integrity       BOOLEAN DEFAULT TRUE,          -- 链完整性
  integrity_msg   TEXT,                           -- 完整性异常说明
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  UNIQUE(coc_number)
);

-- COC 事件表 (事件溯源 - 只追加)
CREATE TABLE coc_events (
  id              VARCHAR(32) PRIMARY KEY,
  chain_id        VARCHAR(32) NOT NULL REFERENCES coc_chains(id),
  event_type      VARCHAR(32) NOT NULL,
  operator_id     VARCHAR(32) NOT NULL,
  operator_name   VARCHAR(64) NOT NULL,
  occurred_at     TIMESTAMPTZ NOT NULL,
  recorded_at     TIMESTAMPTZ DEFAULT NOW(),
  location        VARCHAR(128),
  signature       TEXT,                    -- 交接电子签名
  witness_sig     TEXT,                    -- 见证人签名
  notes           TEXT,
  metadata        JSONB,                   -- 节点特有数据
  prev_event_id   VARCHAR(32),             -- 前序事件 ID (链式)
  event_hash      VARCHAR(128),            -- 事件内容 SM3 摘要
  CONSTRAINT fk_prev_event FOREIGN KEY (prev_event_id) REFERENCES coc_events(id),
  CONSTRAINT valid_sequence CHECK (prev_event_id IS NOT NULL OR event_type = 'SAMPLING')
);

-- 交接记录表
CREATE TABLE coc_transfers (
  id              VARCHAR(32) PRIMARY KEY,
  event_id        VARCHAR(32) REFERENCES coc_events(id),
  from_party      VARCHAR(128) NOT NULL,
  to_party        VARCHAR(128) NOT NULL,
  sample_count    INT NOT NULL,
  intact_count    INT,
  damaged_count   INT DEFAULT 0,
  temperature     DECIMAL(5,2),
  transport_mode  VARCHAR(32),
  from_signature  TEXT,
  to_signature    TEXT,
  completed_at    TIMESTAMPTZ
);
```

---

## 6. API 设计

```
POST   /api/v1/coc/chains                    # 创建 COC 链
GET    /api/v1/coc/chains/:id                # 查询 COC 链
GET    /api/v1/coc/chains/by-sample/:sid     # 按样品查 COC
POST   /api/v1/coc/chains/:id/events         # 添加事件
GET    /api/v1/coc/chains/:id/events         # 事件列表
POST   /api/v1/coc/chains/:id/verify         # 链完整性校验
POST   /api/v1/coc/transfer                  # 交接记录
GET    /api/v1/coc/chains/:id/report         # COC 报告导出
POST   /api/v1/coc/disposal                  # 样品处置
GET    /api/v1/coc/print/:id                 # 打印 COC 表单
```

---

## 7. 技术方案

```
┌──────────────────────────────────────────┐
│              COC Manager                   │
│  ┌──────────┐  ┌────────┐  ┌──────────┐  │
│  │ Chain    │  │ Event  │  │ Transfer │  │
│  │ Service  │  │ Service│  │ Service  │  │
│  └────┬─────┘  └───┬────┘  └────┬─────┘  │
│       │             │            │        │
│  ┌────┴─────────────┴────────────┴───┐   │
│  │     Event Store (只追加)          │   │
│  │  · 所有事件不可删除，不可修改      │   │
│  │  · 当前状态 = 事件聚合结果        │   │
│  └──────────────────────────────────┘   │
│                                          │
│  Barcode: jsbarcode / qrcode.react       │
│  Timeline: 自定义 React 组件            │
│  PDF: @react-pdf/renderer                │
└──────────────────────────────────────────┘
```

---

## 8. 验收标准

| # | 测试场景 | 预期结果 |
|:-:|---------|---------|
| 1 | 创建样品并自动生成 COC | COC 编号生成，首事件(SAMPLING)记录 |
| 2 | 扫码交接样品 | 交接事件记录，COC 状态更新 |
| 3 | 完整 COC 链（采样→处置） | 全链路事件完整，integrity=true |
| 4 | 跳过收样直接登记 | integrity=false，标记 BROKEN |
| 5 | 导出 COC 审计报告 | PDF 包含全部事件节点和签名 |
| 6 | 时间线展示 10 个事件 | 正确排序，颜色状态正确 |
| 7 | 样品处置后 COC 关闭 | status=disposed，不可再添加事件 |

---

## 9. 依赖项

| 依赖 | 说明 |
|------|------|
| PostgreSQL JSONB | 事件 metadata 存储 |
| `qrcode.react` | 交接二维码 |
| `jsbarcode` | COC 表单条码 |
| 后端 CRUD | REST API 支持 |
