# 客户自助门户 (Customer Portal)

> 对标: 金现代 LIMS 客户端 | LabWare Web Portal | StarLIMS Customer Self-Service
> 现有代码: `src/pages/CustomerPortalPage.tsx`
> 定位: **完全独立的客户使用页面**，无需登录或轻量登录，无侧边栏

---

## 1. 产品调研

### 1.1 竞品功能矩阵

| 功能 | 金现代 LIMS | LabWare Portal | StarLIMS | 赛默飞 Web | HC-LIMS 目标 |
|------|-----------|----------------|----------|-----------|-------------|
| 在线委托 | ✅ 检测项目选择+自动计费 | ✅ 委托单录入 | ✅ 订单提交 | ✅ 委托录入 | ✅ |
| 进度追踪 | ✅ 实时状态+时间轴 | ✅ 样品状态追踪 | ✅ 进度看板 | ✅ 状态查询 | ✅ |
| 报告下载 | ✅ PDF 下载+在线预览 | ✅ 报告查看 | ✅ 结果查询 | ✅ 报告下载 | ✅ |
| 合同查看 | ✅ 合同列表+到期提醒 | ❌ | ❌ | ✅ | ✅ |
| 在线支付 | ✅ 支付宝/微信 | ❌ | ❌ | ❌ | 📝 远期 |
| 消息通知 | ✅ 短信+站内信 | ✅ 邮件通知 | ✅ 消息中心 | ✅ 推送 | ✅ |
| 电子签名 | ✅ 报告签收签名 | ✅ 电子确认 | ❌ | ✅ | ✅ |
| 历史趋势 | ❌ | ❌ | ✅ 趋势图 | ✅ | 📝 远期 |
| 多语言 | ❌ | ✅ | ✅ | ✅ | 📝 远期 |

### 1.2 核心差异化

HC-LIMS 客户门户的差异化定位：
1. **检测行业垂直深耕**：针对环境/食品/水质检测场景优化
2. **轻量免登**：通过委托单号+手机号验证码快速查询，无需注册账号
3. **数据可视化**：检测趋势图、周期分析（对接 AI 模块）
4. **移动端优先**：H5 自适应，支持微信分享

---

## 2. 功能架构

```
客户自助门户 (无侧边栏 · 独立域名/路径)
├── 首页 (Dashboard)
│   ├── KPI 看板：累计委托 / 进行中 / 可下载报告 / 待付款
│   ├── 快速查询：委托单号/手机号查询进度
│   └── 通知中心：系统通知滚动
├── 我的委托 (My Orders)
│   ├── 委托列表：筛选（状态/日期/类型）+ 搜索
│   ├── 委托详情：基本信息 + 进度时间轴 + 检测项目
│   └── 在线委托：检测项目选择器 → 自动报价 → 提交
├── 报告中心 (Reports)
│   ├── 报告列表：按委托单分组
│   ├── 在线预览：PDF 嵌入式预览
│   └── 电子签收：手写签名确认
├── 合同管理 (Contracts)
│   ├── 合同列表：有效期/金额/状态
│   └── 到期提醒：即将到期高亮
├── 账户信息 (Account)
│   ├── 公司资料：名称/地址/联系人
│   ├── 信用等级：A/B/C + 历史消费
│   └── 资质文件：营业执照/资质证书
└── 帮助中心 (Help)
    ├── 常见问题：委托流程/采样要求/报告周期
    └── 联系客服：电话/在线客服
```

---

## 3. User Stories

### US-CP-01: 客户快速查询委托进度
> 作为**客户**，我输入委托单号和手机号，快速查看检测进度。

**验收标准：**
- [x] 首页提供查询输入框（委托单号 + 手机号）
- [x] 查询结果显示委托状态、预计完成时间
- [x] 显示进度时间轴（委托提交→样品接收→检测中→报告出具）
- [x] 无需登录即可查询

### US-CP-02: 客户浏览历史委托
> 作为**客户**，我登录后查看所有历史委托单列表。

**验收标准：**
- [x] 委托列表显示：编号、样品名称、检测项目、提交日期、状态、金额
- [x] 支持按状态筛选（全部/进行中/已完成）
- [x] 支持按日期范围筛选
- [x] 点击委托单查看详情

### US-CP-03: 客户提交在线委托
> 作为**客户**，我在线选择检测项目并提交委托申请。

**验收标准：**
- [x] 按分类选择检测项目（常规/重金属/有机/微生物）
- [x] 实时显示已选项目总价
- [x] 填写样品信息（名称/数量/采样地点）
- [x] 提交后生成委托单号

### US-CP-04: 客户下载检测报告
> 作为**客户**，检测完成后我下载或预览检测报告。

**验收标准：**
- [x] 报告列表显示：报告编号、委托单、出具日期、状态
- [x] 支持 PDF 在线预览
- [x] 支持下载 PDF 文件
- [x] 已下载状态标记

### US-CP-05: 客户电子签收报告
> 作为**客户**，我在线查看报告并手写电子签名确认。

**验收标准：**
- [x] 报告详情页显示签名区域
- [x] 支持手写签名（Canvas）
- [x] 签名后状态更新为"已签收"
- [x] 记录签收时间和签名人

### US-CP-06: 客户查看合同
> 作为**客户**，我查看与实验室签订的检测合同。

**验收标准：**
- [x] 合同列表显示：合同编号、名称、金额、有效期、状态
- [x] 即将到期合同高亮提醒（30天内）
- [x] 合同详情查看

### US-CP-07: 客户管理账户信息
> 作为**客户**，我查看和更新公司联系信息。

**验收标准：**
- [x] 显示公司基本信息（名称、地址、联系人）
- [x] 显示信用等级和历史消费统计
- [x] 资质文件列表（营业执照等）

### US-CP-08: 客户接收通知
> 作为**客户**，我接收系统通知（报告出具、委托状态变更等）。

**验收标准：**
- [x] 消息分类：系统/报告/委托/合同
- [x] 未读消息红点提示
- [x] 点击消息跳转对应页面

---

## 4. 数据模型

```typescript
interface ClientOrder {
  id: string;
  no: string;                    // 委托编号 WT-2025-001
  clientName: string;
  clientPhone: string;
  sampleName: string;
  sampleCount: number;
  testItems: { name: string; price: number }[];
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'received' | 'sampling' | 'testing' | 'completed';
  statusLabel: string;
  progress: number;
  submitDate: string;
  estimatedCompleteDate?: string;
  remark?: string;
}

interface ClientReport {
  id: string;
  reportNo: string;
  orderId: string;
  orderNo: string;
  sampleName: string;
  issueDate: string;
  status: 'available' | 'signed';
  signedAt?: string;
  signedBy?: string;
  pdfUrl?: string;
}

interface ClientContract {
  id: string;
  no: string;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'expiring' | 'expired';
  statusLabel: string;
}

interface ClientProfile {
  id: string;
  companyName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  creditLevel: 'A' | 'B' | 'C';
  totalSpent: number;
  totalOrders: number;
}

interface ClientNotification {
  id: string;
  type: 'system' | 'report' | 'order' | 'contract';
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
  link?: string;
}
```

---

## 5. API 接口

```
# 免登查询
GET    /api/v1/portal/track?no={委托单号}&phone={手机号}

# 需要登录
GET    /api/v1/portal/orders              # 我的委托列表
POST   /api/v1/portal/orders              # 提交在线委托
GET    /api/v1/portal/orders/:id          # 委托详情
GET    /api/v1/portal/reports             # 报告列表
GET    /api/v1/portal/reports/:id/pdf     # 报告PDF
POST   /api/v1/portal/reports/:id/sign    # 电子签收
GET    /api/v1/portal/contracts           # 合同列表
GET    /api/v1/portal/profile             # 账户信息
GET    /api/v1/portal/notifications       # 消息列表
POST   /api/v1/portal/notifications/:id/read  # 标记已读
```

---

## 6. 界面设计

### 6.1 整体风格

- **布局**: 无侧边栏，顶部固定导航栏，内容区居中 maxWidth=1200px
- **配色**: 沿用系统主色 `#1677ff`，卡片白色底+灰色背景
- **导航**: 顶部 Tab 式导航（首页/我的委托/报告中心/合同/账户/帮助）
- **移动端**: 底部 Tab 导航（首页/委托/报告/我的）

### 6.2 首页布局

```
┌─────────────────────────────────────────────────────┐
│  [Logo] 红创检测认证      首页 委托 报告 合同 账户   │  ← 顶部导航
├─────────────────────────────────────────────────────┤
│                                                     │
│   累计委托   进行中    可下载报告   待付款          │  ← KPI 卡片行
│     12        3          5         ¥2,400          │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   [快速查询]                                        │
│   委托单号 [________]  手机号 [________]  [查询]   │
│                                                     │
│   查询结果:                                         │
│   ┌─────────────────────────────────────────────┐  │
│   │ WT-2025-001  地表水检测  检测中  预计3天后   │  │
│   │ ●━━━○━━━○━━━○━━━━━━━●                        │  │
│   │ 提交   接收  采样  检测  报告                │  │
│   └─────────────────────────────────────────────┘  │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   [通知中心]                              [更多 >] │
│   ● 报告 RPT001 已生成               1小时前      │
│   ● 委托 WT-002 已接收               昨天         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 7. 与实验室端数据联通

```
客户门户                      实验室端
─────────                    ─────────
在线委托  ───────POST──────▶  委托单管理
  │                              │
  │◀─────状态更新推送──────────┤
  │                              │
报告查看  ◀─────GET────────────  报告管理
  │                              │
电子签收  ──────POST───────▶   COC监管链
```
