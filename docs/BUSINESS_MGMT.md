# 商务管理模块设计文档

## 1. 概述

### 1.1 模块定位

商务管理是 LIMS 系统的对外业务窗口，覆盖从客户获取→报价→合同→委托→收款的全流程。对标金现代 LIMS 的客户关系管理(CRM)模块。

### 1.2 功能架构

```
商务管理
├── 客户管理 (Clients)       — 客户信息、信用、历史记录
├── 合同管理 (Contracts)     — 合同创建、执行、到期预警
├── 报价管理 (Quotations)    — 在线报价、报价单模板
├── 委托单管理 (Orders)     — 客户委托录入、状态追踪
└── 客户门户 (Portal)       — 客户自助查询/委托
```

### 1.3 User Stories

| ID | 角色 | 故事 | 对应功能 |
|----|------|------|----------|
| US-BM-01 | 商务人员 | 我希望新增客户并记录联系人/行业/信用等级 | 客户管理-Create |
| US-BM-02 | 商务人员 | 我希望编辑客户信息，查看客户的历史委托和合同 | 客户管理-Edit/View |
| US-BM-03 | 商务人员 | 我可以搜索和筛选客户列表 | 客户管理-Search/Filter |
| US-BM-04 | 商务人员 | 我可以删除不再合作的客户 | 客户管理-Delete |
| US-BM-05 | 商务人员 | 我可以在报价单中选择检测项目和收费标准 | 报价管理-Create |
| US-BM-06 | 客户 | 我可以通过报价单确认并生成合同 | 报价→合同转换 |
| US-BM-07 | 商务人员 | 我可以创建合同并跟踪合同执行状态 | 合同管理-CRUD |
| US-BM-08 | 商务人员 | 我可以查看即将到期的合同并续签 | 合同管理-到期预警 |
| US-BM-09 | 商务人员 | 我可以在系统中录入客户委托单 | 委托单管理-Create |
| US-BM-10 | 检测员 | 我可以在移动端查看客户委托信息 | 委托单管理-查询 |

---

## 2. 数据模型

```typescript
interface Client {
  id: string; name: string; shortName?: string;
  type: '企业' | '政府' | '个人';
  industry: string;
  contact: string; phone: string; email?: string;
  address?: string;
  credit: 'A' | 'B' | 'C';
  status: 'active' | 'pending' | 'suspended';
  source: string; // 客户来源
  createdAt: string; updatedAt: string;
}

interface Quotation {
  id: string; no: string;
  customerId: string; customerName: string;
  items: QuotationItem[];
  totalAmount: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'confirmed' | 'rejected';
  createdAt: string;
}

interface QuotationItem {
  testItem: string; method: string;
  unit: string; unitPrice: number; quantity: number;
}

interface Order {
  id: string; no: string;
  customerId: string; customerName: string;
  quotationId?: string;
  samples: string[]; // sample IDs
  status: 'pending' | 'sampling' | 'testing' | 'completed';
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  createdAt: string;
}
```

---

## 3. API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/clients | 客户列表 |
| POST | /api/v1/clients | 新增客户 |
| PUT | /api/v1/clients/:id | 编辑客户 |
| DELETE | /api/v1/clients/:id | 删除客户 |
| GET | /api/v1/quotations | 报价单列表 |
| POST | /api/v1/quotations | 创建报价单 |
| GET | /api/v1/orders | 委托单列表 |
| POST | /api/v1/orders | 创建委托单 |

---

## 4. UI 设计

### 4.1 客户管理

```
┌────────────────────────────────────────┐
│  商务管理 / 客户管理                     │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ 总数 │ │ 活跃 │ │ 本月 │ │ 到期 │  │
│  │  128 │ │  96  │ │  12  │ │  8   │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
│  [搜索...] [类型▼] [状态▼] [+新增客户] │
│  ┌─────────────────────────────────┐   │
│  │ 客户名称 │ 类型 │ ... │ 操作    │   │
│  │ 绿源环保 │ 企业 │ ... │ [查看]  │   │
│  │ 博克水务 │ 企业 │ ... │ [查看]  │   │
│  └─────────────────────────────────┘   │
└────────────────────────────────────────┘
```

### 4.2 报价管理

```
┌────────────────────────────────────────┐
│  报价管理                               │
│  [+新建报价]                            │
│  ┌────────┬──────┬─────────┬────────┐  │
│  │编号    │客户  │金额     │状态    │  │
│  │Q-001   │绿源  │¥15,000  │已发送  │  │
│  │Q-002   │博克  │¥28,000  │已确认  │  │
│  └────────┴──────┴─────────┴────────┘  │
└────────────────────────────────────────┘
```
