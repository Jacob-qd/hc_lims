# 商务管理

> 对标: 金现代 LIMS 商务管理 | LabWare SDMS 商务模块
> 现有代码:
> - `src/pages/ClientsPage.tsx` (212行)
> - `src/pages/ContractsPage.tsx` (307行)
> - `src/pages/QuotationsPage.tsx` (210行)
> - `src/pages/OrdersPage.tsx` (170行)
> 成熟度: ✅ 已实现完整功能（客户/合同/报价/委托单）

---

## 1. 功能概述

商务管理模块覆盖第三方检测实验室的核心商务流程：客户建档 → 报价 → 委托下单 → 合同签订 → 回款跟踪。

### 子模块

| 子模块 | 功能 | 说明 |
|--------|------|------|
| 客户管理 | 客户档案、联系人、信用等级、合作状态 | 支持企业/政府/个人分类 |
| 合同管理 | 合同签订、到期提醒、续签跟踪 | 支持年度/项目/框架合同 |
| 报价管理 | 检测项目报价、有效期、状态流转 | 草稿→已发送→已确认/已拒绝 |
| 委托单管理 | 委托下单、进度跟踪、付款状态 | 与样品管理联动 |

---

## 2. User Stories

### US-BM-01: 业务员管理客户信息
> 作为**业务员**，我在客户档案中维护客户信息，查看客户的委托历史和合同执行情况。

**验收标准：**
- [x] 客户列表: 名称/类型/联系人/电话/状态/合同数
- [x] 按客户类型（企业/政府/个人）筛选
- [x] 详情页: 基本信息 Tab + 委托项目 Tab + 合同 Tab
- [x] 信用等级: A/B/C 三级
- [x] 客户来源: 自行开发/客户推荐/展会/招投标/线上渠道

### US-BM-02: 业务员编辑客户信息
> 作为**业务员**，我更新客户的联系人、地址、信用等级等信息。

**验收标准：**
- [x] 点击编辑打开弹窗，表单预填充现有数据
- [x] 保存后列表自动刷新
- [x] 删除客户需二次确认

### US-BM-03: 业务员搜索客户
> 作为**业务员**，我通过名称/联系人/电话快速找到客户。

**验收标准：**
- [x] 搜索框实时过滤列表
- [x] 支持按类型和状态筛选

### US-BM-04: 合同管理员跟踪合同
> 作为**合同管理员**，我管理检测委托合同，跟踪合同的执行状态和回款情况。

**验收标准：**
- [x] 合同列表: 编号/客户/金额/签订日期/到期日期/状态
- [x] 状态标签: 执行中/即将到期/已到期/已归档
- [x] 到期前提醒（高亮显示）
- [x] 新建/编辑/删除合同

### US-BM-05: 商务人员生成报价单
> 作为**商务人员**，我根据客户检测需求生成报价单，选择检测项目和数量。

**验收标准：**
- [x] 选择客户（关联客户档案）
- [x] 从预设检测项目库添加项目（自动填充方法/单位/单价）
- [x] 实时计算合计金额
- [x] 设置报价有效期
- [x] 报价单编号自动生成

### US-BM-06: 商务人员管理报价状态
> 作为**商务人员**，我跟踪报价单的状态，发送给客户并确认。

**验收标准：**
- [x] 状态流转: 草稿 → 已发送 → 已确认/已拒绝
- [x] 已确认的报价可转为委托单
- [x] 按状态筛选报价列表

### US-BM-07: 商务人员录入委托单
> 作为**商务人员**，我根据客户确认的报价录入委托单，生成检测任务。

**验收标准：**
- [x] 选择客户和关联报价单
- [x] 填写项目名称、样品数量、总金额
- [x] 付款状态: 未付款/部分付款/已付款
- [x] 委托单编号自动生成

### US-BM-08: 商务人员跟踪委托进度
> 作为**商务人员**，我查看委托单的检测进度和付款情况。

**验收标准：**
- [x] 状态标签: 待处理/采样中/检测中/已完成
- [x] 详情页显示进度时间线
- [x] 已付金额/未付金额显示

---

## 3. 数据模型

### 3.1 客户 (Client)

```typescript
interface Client {
  id: string;
  name: string;              // 客户全称
  shortName?: string;        // 简称
  type: '企业' | '政府' | '个人';
  industry: string;          // 所属行业
  contact: string;           // 联系人
  phone: string;             // 联系电话
  email?: string;
  address?: string;
  credit: 'A' | 'B' | 'C';   // 信用等级
  status: 'active' | 'pending' | 'suspended';  // 合作状态
  source: string;            // 客户来源
  samples: number;           // 历史样品数
  contracts: number;         // 合同数
  createdAt: string;
  updatedAt: string;
}
```

### 3.2 合同 (Contract)

```typescript
interface Contract {
  id: string;
  no: string;                // 合同编号
  name: string;              // 合同名称
  customerId: string;
  customerName: string;
  amount: number;            // 合同金额
  type: 'annual' | 'project' | 'framework';  // 年度/项目/框架
  typeLabel: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired' | 'archived';
  statusLabel: string;
  signDate: string;
  contactPerson: string;
  contactPhone: string;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3.3 报价单 (Quotation)

```typescript
interface QuotationItem {
  key: string;
  testItem: string;          // 检测项目
  method: string;            // 检测方法
  unit: string;              // 单位
  unitPrice: number;         // 单价
  quantity: number;          // 数量
}

interface Quotation {
  id: string;
  no: string;                // 报价编号
  customerId: string;
  customerName: string;
  items: QuotationItem[];
  totalAmount: number;
  validUntil: string;        // 有效期
  status: 'draft' | 'sent' | 'confirmed' | 'rejected';
  remark: string;
  createdAt: string;
}
```

### 3.4 委托单 (Order)

```typescript
interface Order {
  id: string;
  no: string;                // 委托编号
  customerId: string;
  customerName: string;
  quotationId?: string;      // 关联报价单
  projectName: string;
  sampleCount: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'sampling' | 'testing' | 'completed';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  samples: string[];         // 样品编号列表
  remark: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. API 接口

```
# 客户管理
GET    /api/v1/clients                      # 客户列表
POST   /api/v1/clients                      # 新增客户
PUT    /api/v1/clients/:id                  # 更新客户
DELETE /api/v1/clients/:id                  # 删除客户

# 合同管理
GET    /api/v1/contracts                    # 合同列表
POST   /api/v1/contracts                    # 新增合同
PUT    /api/v1/contracts/:id                # 更新合同
DELETE /api/v1/contracts/:id                # 删除合同

# 报价管理
GET    /api/v1/quotations                   # 报价列表
POST   /api/v1/quotations                   # 新增报价
PUT    /api/v1/quotations/:id              # 更新报价（状态变更）

# 委托单管理
GET    /api/v1/orders                       # 委托单列表
POST   /api/v1/orders                       # 新增委托单
PUT    /api/v1/orders/:id                  # 更新委托单
```

---

## 5. 界面设计要点

### 5.1 客户管理

```
┌─────────────────────────────────────────────┐
│  客户管理                          [+新增客户]│
├─────────────────────────────────────────────┤
│ [客户总数: 6] [活跃: 5] [本月新增: 0] [活跃合同: 5]│
├─────────────────────────────────────────────┤
│ [搜索名称/联系人/电话] [类型▼] [状态▼]        │
├─────────────────────────────────────────────┤
│ 客户名称      类型   行业   联系人   状态    │
│ 绿源环保科技  企业   环保   王经理   合作中  │
│ 博克水务集团  企业   水务   李主任   合作中  │
│ 蓝天环境监测站 政府  环保   刘站长   合作中  │
└─────────────────────────────────────────────┘
```

### 5.2 报价管理

```
┌─────────────────────────────────────────────┐
│  报价管理                          [+新建报价]│
├─────────────────────────────────────────────┤
│ [报价总数: 3] [待确认: 1] [已确认: 1] [总金额: ¥4,800]│
├─────────────────────────────────────────────┤
│ 编号        客户           金额    有效期    状态    │
│ Q-2026-001  绿源环保科技   ¥1,800  2026-06-30 已确认 │
│ Q-2026-002  博克水务集团   ¥2,000  2026-06-15 已发送 │
│ Q-2026-003  清源化工       ¥1,000  2026-05-30 草稿   │
└─────────────────────────────────────────────┘
```

---

## 6. 与检测流程的关联

```
客户建档 → 生成报价 → 客户确认 → 录入委托单 → 样品登记 → 检测任务 → 报告出具 → 回款
   │          │           │           │           │          │          │         │
   ▼          ▼           ▼           ▼           ▼          ▼          ▼         ▼
 Clients  Quotations   Contracts    Orders     Samples    Tasks    Reports  Invoices
```

| 关联模块 | 数据流向 | 说明 |
|---------|---------|------|
| 客户管理 → 报价管理 | 客户信息引用 | 报价单选择客户时自动填充名称 |
| 报价管理 → 委托单管理 | 报价ID关联 | 已确认报价可一键生成委托单 |
| 委托单管理 → 样品管理 | 样品编号同步 | 委托单创建后登记样品 |
| 委托单管理 → 检测任务 | 任务派发 | 样品分配后生成检测任务 |
| 合同管理 → 客户管理 | 合同数量统计 | 客户卡片显示合同数 |
