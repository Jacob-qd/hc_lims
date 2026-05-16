# P0-1 委托管理模块 — 竞品调研与功能设计

## 1. 竞品调研

### 1.1 金现代 (JXD LIMS)

金现代委托管理核心能力：
- 委托创建支持**在线下单 + 批量导入**，自动带出客户信息、历史项目
- **紧急程度分级**（普通/加急/紧急），影响排程优先级
- **SLA/TAT 自动计算**：根据检测项目组合预估完成时间
- **变更记录**：修改委托自动留痕，触发审批
- 支持委托单与**合同号绑定**，对接 ERP 财务

> 来源：金现代官网 + 达能/食品行业方案

### 1.2 Thermo Fisher SampleManager

SampleManager 委托特点：
- **Project-based 委托模型**：委托 = Project > Samples > Tests 三级结构
- 支持 **Standing Order**（长期合同定期送样）和 **Ad-hoc Order**（单次委托）
- 内置 **报价引擎**：根据检测项目组合自动计算费用
- 委托审核工作流：业务员提交 → 技术确认 → 客户确认

### 1.3 LabWare LIMS

LabWare 委托特点：
- **高度可配置的委托类型**：不同实验室可自定义字段和流程
- **批次委托**：支持同一批次多样品一次登记
- 委托与 **样品生命周期强绑定**：从委托可钻取到每个样品的当前状态

### 1.4 三维天地 (SW-LIMS)

三维天地在国内检测机构的特点：
- **符合 CMA/CNAS 评审要求的委托单**：自动生成标准格式
- **客户自助委托门户**：客户在线填写委托、上传附件、查看进度
- **委托变更控制**：已派工委托变更需技术负责人审批

### 1.5 最佳实践总结

| 能力 | 推荐方案 | 来源 |
|------|---------|------|
| 委托模型 | Project > Order > Samples 三级 | SampleManager + JXD |
| 下单方式 | 在线下单 + 批量 Excel 导入 + 客户自助 | JXD + 三维天地 |
| 紧急程度 | 三级（普通/加急/紧急），联动排程 | JXD |
| SLA 预估 | 基于检测项目组合 + 设备负载自动计算 | JXD + LabWare |
| 变更控制 | 已派工委托变更需审批留痕 | 三维天地 + JXD |
| 委托归档 | 关联合同号 + 财务对账 | JXD + SampleManager |

---

## 2. 用户故事

### US1 — 业务员创建委托
> 作为**业务员**，我需要在系统中快速创建委托单，选择客户、检测项目，系统自动生成委托编号和预估完成时间。

### US2 — 批量导入委托
> 作为**业务员**，我需要通过 Excel 模板批量导入委托（如 50 个样品、12 个检测项的报价单）。

### US3 — 委托变更
> 作为**业务员**，当客户要求增加检测项目时，我需要在已创建的委托上追加项目，系统记录变更历史。

### US4 — 委托进度追踪
> 作为**客户**，我需要通过委托单号查询当前进度（样品是否签收、检测是否开始、报告是否签发）。

### US5 — 委托统计
> 作为**实验室主管**，我需要查看本周/本月委托量、委托类型分布、紧急委托占比。

---

## 3. 功能设计

### 3.1 委托创建流程

```
业务员登录 → 选择客户 → 填写委托信息
    ├── 检测项目选择（多选，带方法+限值+单价）
    ├── 样品信息（支持多样品一次委托）
    ├── 紧急程度（普通/加急/紧急）
    ├── 期望完成日期
    └── 附件上传（合同/技术要求）

提交 → 系统计算 SLA → 生成委托编号 → 通知收样
```

### 3.2 页面设计

**委托列表页** (OrdersPage)：
```
┌─────────────────────────────────────────────────────┐
│  ← 委托管理           [+ 新建委托] [批量导入] [导出]  │
├─────────────────────────────────────────────────────┤
│  [搜索委托号/客户] [状态▾] [类型▾] [日期范围]        │
├──────────┬──────────┬──────┬──────┬──────┬──────────┤
│ 委托编号  │ 客户      │ 项目  │ 样品  │ 状态  │ 操作     │
│ ORD-001  │ 绿源环保   │ 水质  │ 12   │ 执行中│ 查看/变更 │
│ ORD-002  │ 博克水务   │ 饮用水│ 8    │ 待收样│ 查看     │
├──────────┴──────────┴──────┴──────┴──────┴──────────┤
│  共 2 条  ·  本月统计: 128 委托 · 1520 样品          │
└─────────────────────────────────────────────────────┘
```

**委托详情 Drawer**：
- 委托基本信息（编号/客户/合同/紧急程度/SLA）
- 检测项目清单（项目名称/方法/限值/单价/状态）
- 样品清单（样品编号/名称/状态/流转步骤）
- 变更记录（时间/操作人/变更内容/原因）
- 费用概览（总金额/已结/未结）

### 3.3 数据模型

```typescript
interface Order {
  id: string;
  orderNo: string;              // ORD-20260516-001
  customerId: string;
  customerName: string;
  contractNo?: string;           // 关联合同号
  projectName: string;           // 项目/计划名称
  urgency: 'normal' | 'rush' | 'urgent';
  status: OrderStatus;           // draft/submitted/received/testing/review/completed/archived
  estimatedTAT: number;          // 预估周转天数
  dueDate?: string;              // 期望完成日期
  sampleCount: number;           // 样品总数
  testItemIds: string[];         // 检测项目
  totalAmount?: number;          // 总金额
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  samples: OrderSample[];        // 关联样品
  changes: OrderChange[];        // 变更记录
}

type OrderStatus = 'draft' | 'submitted' | 'received' | 'in_progress' | 'review' | 'completed' | 'archived';

interface OrderSample {
  id: string;
  orderId: string;
  sampleId?: string;             // 收样后关联
  sampleName: string;
  sampleType: string;
  testItems: string[];
  containerInfo: string;
  storageCondition: string;
  status: 'pending' | 'received' | 'testing' | 'completed';
}

interface OrderChange {
  id: string;
  orderId: string;
  changeType: 'add_item' | 'remove_item' | 'update_info' | 'cancel';
  beforeValue: string;
  afterValue: string;
  reason: string;
  operatorId: string;
  operatorName: string;
  changedAt: string;
}
```

### 3.4 API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/orders` | 委托列表（分页/搜索/筛选） |
| POST | `/api/v1/orders` | 创建委托 |
| GET | `/api/v1/orders/:id` | 委托详情 |
| PATCH | `/api/v1/orders/:id` | 变更委托（自动留痕） |
| POST | `/api/v1/orders/:id/submit` | 提交委托（流转到收样） |
| POST | `/api/v1/orders/:id/cancel` | 取消委托 |
| POST | `/api/v1/orders/batch-import` | Excel 批量导入 |
| GET | `/api/v1/orders/stats` | 委托统计 |

---

## 4. MVP 实现计划 (3天)

| 天 | 内容 |
|:--:|------|
| D1 | 委托列表页 (OrdersPage) + 创建 Modal + 数据模型 |
| D2 | 委托详情 Drawer + 变更记录 + Mock 数据 |
| D3 | 批量导入 + 统计卡片 + 路由注册 + 测试 |

---

## 5. Review 修正 (v1.1)

### 5.1 补充 User Story

#### US6 — 快速委托（高频场景）
> 作为**业务员**，我每天要接 20+ 委托电话。从老客户创建委托应在 30 秒内完成：选择客户 → 选择检测套餐 → 输入样品数量 → 完成。

#### US7 — 委托进度透明
> 作为**客户**，我看到委托单上应显示每个样品的实时状态（待收样/检测中/已完成），以及预估完成时间倒计时。超期委托应有红色警告。

#### US8 — 从模板创建委托
> 作为**业务员**，每月固定客户（如市政水务）的委托内容完全相同，我应能从模板一键创建，无需重复填写。

#### US9 — 委托变更审批
> 作为**实验室主管**，已派工的委托如需变更（追加检测项目），必须经过我审批。系统自动判断变更是否需要审批。

### 5.2 补充字段

```typescript
interface Order {
  // ... 原有字段 ...
  customerPoNo?: string;         // 🆕 客户采购单号（对账必需）
  samplingAddress?: string;      // 🆕 采样地址（环境监测必需）
  isRush: boolean;               // 🆕 是否加急（独立于 urgency，影响收费）
  rushFee?: number;              // 🆕 加急附加费
  billingStatus: 'unbilled' | 'billed' | 'paid';  // 🆕 计费状态
  submittedAt?: string;          // 🆕 提交时间
  receivedAt?: string;           // 🆕 收样时间
  completedAt?: string;          // 🆕 完成时间
  assignedLabId?: string;        // 🆕 客户指定实验室
  templateId?: string;           // 🆕 从模板创建时关联
}

// 🆕 检测套餐/方案
interface TestPackage {
  id: string;
  name: string;                  // "地表水24项" "饮用水106项"
  category: string;              // 水质/土壤/空气/食品
  testItems: { itemId: string; methodId: string; price: number }[];
  estimatedTAT: number;          // 预估天数
  totalPrice: number;
}

// 🆕 委托模板
interface OrderTemplate {
  id: string;
  name: string;                  // "市政水务月度检测"
  customerId: string;
  testPackageId: string;
  sampleCount: number;
  isDefault: boolean;            // 该客户的默认模板
}
```

### 5.3 状态机修正

```
draft → submitted → tech_review → accepted → received → in_progress
                                    ↘ rejected (退回修改)
                         ↘ on_hold (客户要求暂停)
in_progress → partial_complete → completed → archived(invoiced)
                            ↘ cancelled (客户取消)
```

### 5.4 SLA 可视化

列表页增加 SLA 倒计时列：
- 🟢 正常（> 剩余 3 天）
- 🟡 预警（剩余 1-3 天）
- 🔴 超期（已过截止日期）

### 5.5 快速委托入口

列表页顶部增加醒目的"🔍 快速委托"按钮：
1. 选择客户（搜索/最近）→ 自动带出历史检测套餐
2. 选择套餐 → 输入样品数量
3. 确认委托 → 30 秒完成

---

## 6. 开发实现规格 (Implementation Spec)

### 6.1 组件树

```
OrdersPage
├── PageHeader
│   ├── Button[快速委托] → setQuickOpen(true)
│   ├── Button[新建委托] → setCreateOpen(true)
│   ├── Button[批量导入] → 文件上传触发
│   └── Button[导出] → CSV下载
├── StatCards (4列: 总数/执行中/本月完成/紧急)
├── FilterBar (搜索框 + 状态Select + 紧急度Select)
├── OrderTable
│   ├── 委托编号列 (可点击 → 打开DetailDrawer)
│   ├── 客户/项目列 (ellipsis溢出省略)
│   ├── SLA列 (Progress + 颜色标记)
│   └── 操作列 (详情/提交/变更 - 状态感知)
├── DetailDrawer (width=640)
│   ├── Descriptions (基本信息)
│   ├── Tabs
│   │   ├── 状态时间线 (Timeline)
│   │   ├── 检测套餐 (套餐详情)
│   │   └── 样品清单 (Table)
│   └── Extra: [取消委托] [导出]
├── CreateModal (width=600)
│   └── Form (客户/PO/项目/套餐/样品/紧急度/截止日期)
└── QuickOrderModal (width=500)
    └── Form (客户选择器 + 套餐选择器 + 样品数 + 紧急度)
```

### 6.2 状态管理

```typescript
const [orders, setOrders] = useState(mockOrders);
const [search, setSearch] = useState('');
const [statusFilter, setStatusFilter] = useState('all');
const [selected, setSelected] = useState<any>(null);
const [detailOpen, setDetailOpen] = useState(false);
const [createOpen, setCreateOpen] = useState(false);
const [quickOpen, setQuickOpen] = useState(false);
const [editing, setEditing] = useState<any>(null);
```

### 6.3 交互事件流

**创建委托**: 点击[新建] → fill form → validateFields() → handleCreate → match套餐→构造Order → setOrders前置 → toast → closeModal

**快速委托**: 点击[快速] → 选客户(Select showSearch) → 选套餐 → 填样品数 → handleQuickCreate → 查历史自动填PO/项目 → status='submitted'跳过草稿 → 计算金额=price×count → toast含金额信息

**SLA计算**: daysLeft = ceil((dueDate - now) / 86400000); color: <0=red, ≤2=yellow, >2=green

### 6.4 表单验证

| 字段 | 规则 | 错误提示 |
|------|------|---------|
| customerName | required | "请选择或输入客户" |
| projectName | required | "请输入项目名称" |
| sampleCount | min:1 | "样品数量至少为1" |
| testPackageId | optional | - |

### 6.5 边缘情况

| 场景 | 处理 |
|------|------|
| 委托已提交后修改 | 只有 draft 状态可提交, 其他显示「变更」|
| 取消委托 | completed/cancelled 状态不可取消 |
| 空列表 | Empty占位: "暂无委托" |
| 搜索无结果 | 空数据 + "未找到匹配的委托" |
| 套餐未选择 | 快速委托时必选, 否则无法计算TAT和金额 |

### 6.6 API 规格

```
GET  /api/v1/orders?search=&status=&page=1  → { code, data: { list:Order[], total } }
POST /api/v1/orders  → { customerName*, projectName*, sampleCount*, testPackageId?, urgency?, dueDate? }  → { code, message, data:Order }
```

### 6.7 测试用例

| # | 测试场景 | 预期 |
|---|---------|------|
| T1 | 快速委托: 绿源+地表水24项+3样品 | 创建成功, 金额=8400, 状态=已提交 |
| T2 | 新建委托: 不填客户名 | 校验失败, 红色提示 |
| T3 | 搜索"绿源" | 过滤仅显示绿源环保 |
| T4 | SLA: 截止日期=昨天 | 红色进度条, "超期1天" |
| T5 | 取消委托 | 状态→cancelled, 不再显示取消按钮 |
| T6 | 导出CSV | 下载orders.csv |

---

## 7. Review 修正 (R1 + R2)

### R1 修正
- ✅ 委托编号改为后端生成 (Mock: `ORD-${date}-${random}`)
- ✅ 快速委托客户选择限制为已有客户 (Select options 从 orders 去重)
- ✅ 增加「变更检测套餐」操作按钮
- ✅ 样品清单关联真实样品状态 (从 samples 数据获取)

### R2 修正
- 🔴 统一编号格式: `ORD-YYYYMMDD-NNN`
- 🔴 统一时间格式: `YYYY-MM-DD HH:mm`
- 🔴 委托状态→样品状态联动: 委托 submitted→通知收样; received→样品状态更新
- 🔴 委托确认需业务员签名 (电子签名集成)
- 🔴 增加完整审计日志: 创建/变更/取消/提交 均记录操作人+时间+前后值
- 🔴 引入 useOrders() 数据获取层, 解耦 Mock 数据
