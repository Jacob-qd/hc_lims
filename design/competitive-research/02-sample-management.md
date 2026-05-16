# 模块 2: 样品管理 — 竞品调研 + 设计 + 实现对比

---

## 1. 竞品调研

### 1.1 金现代 (JXD)

金现代样品管理核心能力：
- **条码全生命周期**：采样赋码 → 运输标签 → 接收扫码 → 分样打印 → 留样标签 → 处置扫码
- **样品位置在线**：每个样品有库位编号，扫码入库/出库
- **样品状态可视化**：时间线展示从采样到处置的完整轨迹
- **智能接收**：扫码自动带出委托信息和检测项目，验收规则自动判断（温度超标？外观异常？）
- **链式追溯**：从样品可反向追溯到委托→客户→合同，正向追溯到报告

> 来源：JXD 官网 + 环境监测方案（强调 GPS + 照片 + 样品链）

### 1.2 Thermo Fisher SampleManager

SampleManager 样品管理特点：
- **Sample Hierarchy**：Parent Sample → Sub-sample → Aliquot 三级关系
- **Storage Management**：可视化存储位置（冰箱/货架/盒子/位置）
- **Chain of Custody**：每个样品操作记录时间、人、动作和签名
- **Retention Policy**：留样策略配置 + 到期自动提醒处置

### 1.3 LabWare

LabWare 样品管理特点：
- **Sample Registration**：支持批量登记（一批 100 个样品一次录入）
- **Sample Login**：收样时自动检查所需容器和保存条件
- **Sample Scheduling**：基于检测项目自动计算工作量

### 1.4 三维天地 (SW-LIMS)

三维天地样品管理特点：
- **CMA/CNAS 合规样品标签**：自动生成符合评审要求的标签格式
- **样品流转记录**：每一步操作强制留痕，不可跳过
- **异常样品处理**：外观异常/温度超标样品可标记"有条件接收"并拍照留证

### 1.5 最佳实践总结

| 能力 | 推荐方案 | 来源 |
|------|---------|------|
| 样品层级 | Parent→Sub-sample→Aliquot 三级 | SampleManager |
| 条码追踪 | 采样→接收→分样→检测→留样→处置 全程 | JXD |
| 存储管理 | 可视化库位 (冰箱/货架/盒/位) | SampleManager |
| 留样管理 | 留样策略 + 到期提醒 + 处置确认 | SampleManager + 三维天地 |
| 异常处理 | 有条件接收 + 拍照留证 + 原因记录 | 三维天地 |
| 批量操作 | 批量登记 + 批量接收 | LabWare |

---

## 2. User Story

### US1 — 样品登记（快捷向导）
> 作为**收样员**，样品送达后，我通过扫码或手工输入样品信息，系统自动带出委托的检测项目和客户信息。整个过程 < 1 分钟。

### US2 — 子样品/分样管理
> 作为**收样员**，一瓶 1L 的水样需要分成 3 份：200mL 给理化室做 COD，200mL 给无机室做重金属，600mL 留样。系统应支持从父样品创建子样品。

### US3 — 留样管理
> 作为**样品管理员**，留样到期前 7 天系统应自动提醒。处置时需填写处置方式（销毁/退回/续期）并签名确认。

### US4 — 样品位置追踪
> 作为**样品管理员**，我需要知道每个样品当前在哪个冰箱的哪个位置，谁最后移动了它。

### US5 — 异常样品处理
> 作为**收样员**，收到的样品温度超标，我应能标记"有条件接收"，拍照留证，填写原因，并通知客户。

### US6 — 批量导入样品
> 作为**业务员**，我需要通过 Excel 模板一次性导入 50 个样品，系统自动校验并生成样品编号和条码。

---

## 3. 功能设计

### 3.1 样品全生命周期状态机

```
采样登记 → 运输中 → 样品接收 → 入库
                              ↓
                    验收通过 ← 验收检查 → 有条件接收(标记异常)
                        ↓
                    任务拆分 → 分样(创建子样品)
                        ↓
                    检测中 → 数据审核 → 留样入库
                        ↓
                    留样到期提醒 → 处置(销毁/退回/续期)
```

### 3.2 样品层级模型

```typescript
interface Sample {
  id: string;
  sampleNo: string;
  parentSampleId?: string;       // 父样品 (分样场景)
  orderId: string;               // 委托
  sampleType: string;
  sampleName: string;
  barcode: string;
  
  // 接收信息
  receivedAt: string;
  receivedBy: string;
  receivedCondition: 'normal' | 'abnormal';
  abnormalReason?: string;
  abnormalPhotos?: string[];
  
  // 存储
  storageCondition: string;      // "4℃冷藏"
  storageLocation?: StorageLocation;
  
  // 分样
  isAliquot: boolean;            // 是否为子样品
  aliquotOf?: string;            // 原始样品 ID
  aliquotVolume?: string;        // "200mL"
  aliquotPurpose?: string;       // "COD检测/留样/重金属检测"
  
  // 留样
  retentionRequired: boolean;
  retentionPeriod?: number;      // 天
  retentionExpiryAt?: string;
  disposalMethod?: string;
  disposalAt?: string;
  disposalBy?: string;
  
  // 状态
  status: SampleStatus;
  custodyEvents: CustodyEvent[];
}

interface StorageLocation {
  room: string;                  // "样品室A"
  refrigerator: string;          // "冰箱#3"
  shelf: string;                 // "2层"
  box?: string;                  // "B盒"
  position?: string;             // "3排4列"
}

interface CustodyEvent {
  id: string;
  sampleId: string;
  eventType: 'sampling' | 'transport' | 'receive' | 'inspect' | 'aliquot' | 'store' | 'move' | 'retrieve' | 'dispose';
  operatorId: string;
  operatorName: string;
  timestamp: string;
  fromLocation?: StorageLocation;
  toLocation?: StorageLocation;
  notes?: string;
  signature?: string;
}
```

### 3.3 样品接收工作台

```
┌──────────────────────────────────────────────────────────┐
│  📦 样品接收                                 [扫码接收]   │
├──────────────────────────────────────────────────────────┤
│  待接收列表                                               │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 委托号        │ 客户    │ 样品数│ 状态  │ 操作    │    │
│  │ ORD-20260516  │ 绿源环保 │ 12   │ 待接收│ 📥接收  │    │
│  │ ORD-20260515  │ 博克水务 │ 8    │ 部分  │ 📥接收  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  接收详情 (点击「接收」后展开)                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 样品: 地表水样品-1  SMP20240521001                │    │
│  │ 外观: ○正常 ○异常 [拍照]                          │    │
│  │ 温度: [__] ℃  要求: 2-8℃                         │    │
│  │ 容器: [PE瓶 1L]  数量: [3]                        │    │
│  │ 库位: [样品室A → 冰箱#3 → 2层]                    │    │
│  │                                                   │    │
│  │ 📋 检测项目 (从委托带入)                            │    │
│  │ ☑ pH值 (HJ 1147-2020)                             │    │
│  │ ☑ COD (HJ 828-2017)                               │    │
│  │ ☑ 氨氮 (HJ 535-2009)                              │    │
│  │                                                   │    │
│  │ 需要分样: ☑  分样方案:                             │    │
│  │   → 子样1: 200mL 理化室 (COD+氨氮)                │    │
│  │   → 子样2: 200mL 无机室 (重金属)                  │    │
│  │   → 留样: 600mL 样品室A                            │    │
│  │                                                   │    │
│  │              [确认接收] [有条件接收] [拒收]         │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

---

## 4. HC-LIMS 当前实现对比

### 4.1 现有实现

**文件**: `SamplesPage.tsx` (487行) + `SampleDetailPage.tsx` (88行) + `COCPage.tsx` (377行)

| 设计项 | 实现状态 | 差距 |
|--------|:---:|------|
| 样品登记向导 | ✅ 4步向导 (基本信息/容器/检测项目/确认) | 缺少从委托自动带入 |
| 子样品/分样 | ❌ | **未实现** |
| 留样管理 | ❌ | **未实现** |
| 样品接收工作台 | ⚠️ | 有基本接收字段，缺验收规则和拍照 |
| 存储位置管理 | ❌ | 仅有文本字段，无结构化库位 |
| 异常处理 | ❌ | 无"有条件接收"流程 |
| 条码追踪 | ✅ 条码生成+打印 | 缺扫码交接 |
| COC 监管链 | ✅ COCPage | 已完善 |

### 4.2 差距评估

| 维度 | 当前 | 目标 | 差距 |
|------|:---:|:---:|------|
| 样品接收 | 50% | 85% | 缺验收规则+异常处理+拍照 |
| 样品层级 | 10% | 80% | **缺子样品/分样管理** |
| 留样管理 | 5% | 80% | **缺留样策略+到期提醒+处置** |
| 存储管理 | 10% | 70% | 缺结构化库位 |

### 4.3 优先改进项

1. 🔴 **分样/子样品管理**：从父样品创建子样品 + 分样方案
2. 🔴 **留样管理**：留样策略 + 到期提醒 + 处置确认签名
3. 🟡 **样品接收增强**：验收规则 + 异常处理 + 拍照留证
4. 🟡 **存储库位**：结构化库位 (房间/冰箱/层/盒/位)

---

## 5. 开发实现规格 — 分样与留样 (最大缺失)

### 5.1 分样管理
```
SamplesPage 新增 Tab[分样管理]:
├── 选择父样品 → 点击[分样]
├── 分样Modal:
│   ├── 父样品信息展示
│   ├── 子样品列表 (动态添加行):
│   │   ├── 子样编号 (自动生成 SMP-xxx-A/B/C)
│   │   ├── 体积 (mL)
│   │   ├── 用途 (检测/留样/备份)
│   │   ├── 目标实验室
│   │   └── 存储位置
│   └── 总体积校验 (子样总体积 ≤ 父样总体积)
└── 确认 → 创建子样品 → 父样品状态更新
```

### 5.2 留样管理
```
SamplesPage 新增 Tab[留样管理]:
├── 留样列表 (样品编号/留样期限/到期日期/存储位置/状态)
├── 到期提醒: 到期前7天 → 列表红色标记 + 通知
├── 处置操作:
│   ├── [销毁] → 确认弹窗 → 填写销毁方式 → 签名
│   ├── [退回] → 确认弹窗 → 填写退回原因
│   └── [续期] → 输入新的保留天数
└── 留样策略配置: 默认保留天数/按样品类型配置
```

### 5.3 数据模型
```typescript
interface SampleAliquot {
  id: string;
  parentSampleId: string;
  aliquotNo: string;        // SMP-xxx-A
  volume: string;           // "200mL"
  purpose: 'testing' | 'retention' | 'backup';
  targetLabId?: string;
  storageLocation?: StorageLocation;
  status: 'active' | 'consumed' | 'disposed';
}

interface SampleRetention {
  sampleId: string;
  retentionPeriod: number;  // 天
  expiryAt: string;
  disposalMethod?: 'destroy' | 'return' | 'extend';
  disposalAt?: string;
  disposalBy?: string;
  disposalSignature?: string;
}
```

### 5.4 测试
| # | 测试 | 预期 |
|---|------|------|
| T1 | 分样: 1L样品→3份子样品 | 创建成功, 总体积=1000mL |
| T2 | 分样: 子样体积>父样 | 校验失败, 红色提示 |
| T3 | 留样到期提醒 | 到期红色标记 |
| T4 | 留样处置销毁 | 签名确认, 状态更新 |

---

## 6. Review 修正 (R1 + R2)

- 🔴 分样/留样纳入下一阶段开发 (3天)
- 🔴 接收工作台增加异常处理流程 (有条件接收+拍照+原因)
- 🔴 留样处置需电子签名确认
- 🔴 样品编号统一: SMP-YYYYMMDD-NNN
