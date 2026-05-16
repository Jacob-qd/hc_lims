# P0-5 完整 RBAC 权限矩阵 — 竞品调研与功能设计

## 1. 竞品调研

### 1.1 金现代 (JXD LIMS)

金现代权限特点：
- **组织 + 岗位 + 角色**三层模型：多实验室组织隔离 + 岗位授权 + 角色权限
- **菜单权限**：控制可见模块
- **数据权限**：控制可见数据范围（如"仅看本实验室数据"）
- **字段权限**：控制可编辑字段（如"实验员可填结果，不可改限值"）
- **签名权限**：控制可执行电子签名的范围和类型
- **集团化权限**：支持多法人、多工厂、多实验室逻辑隔离

> 来源：金现代官网 + 中国华电 70+ 实验室集团化案例

### 1.2 STARLIMS

STARLIMS 权限特点：
- **基于 NIST RBAC 标准**：角色-权限-用户三层模型
- **Location-based 权限**：不同实验室站点的用户权限隔离
- **Delegation**：支持权限委托（如主管休假时委托审批权）

### 1.3 LabWare

LabWare 权限特点：
- **可配置的权限矩阵**：管理员可通过矩阵视图配置权限
- **Project-based 权限**：按项目/研究隔离数据
- **Audit of Permission Changes**：权限变更自动审计

### 1.4 21 CFR Part 11 要求

FDA Part 11 对权限的明确要求：
- **唯一用户身份**：每个用户独立账户，不可共享
- **密码策略**：复杂度、过期、锁定
- **权限分离**：系统管理员不应有业务操作权限
- **签名权限独立**：电子签名权限单独授权
- **权限变更审计**：所有权限变更记录不可删除

### 1.5 CNAS 要求

CNAS-CL01 对人员的核心要求：
- **授权签字人**：需经 CNAS 认可，有明确授权范围
- **检测员资质**：需培训合格并有上岗授权
- **权限与职责匹配**：权限范围不超过岗位职责

### 1.6 最佳实践总结

| 能力 | 推荐方案 | 来源 |
|------|---------|------|
| 权限模型 | 组织 + 角色 + 岗位 三层 | JXD + STARLIMS |
| 菜单权限 | 角色 → 菜单可见性 | JXD |
| 数据权限 | 实验室隔离 + 项目隔离 + 字段掩码 | JXD + LabWare |
| 操作权限 | CRUD + 审批 + 签名 分离 | Part 11 |
| 签名权限 | 独立授权 + 签名范围 | Part 11 + CNAS |
| 审计 | 权限变更全记录 + 不可删除 | Part 11 |

---

## 2. 角色定义（参照金现代报告推荐）

| 角色 | 菜单权限 | 数据范围 | 操作权限 | 签名权限 |
|------|---------|---------|---------|---------|
| **系统管理员** | 全部菜单 | 全部数据 | 配置/用户管理 | 无 |
| **实验室主管** | 本实验室 | 本实验室 | 查看+分配+审核 | 技术审核 |
| **收样员** | 样品收样 | 本实验室 | 收样/赋码/交接 | 无 |
| **检测员** | 任务+ELN | 已分配 | 填写/提交 | 无 |
| **QA/质控** | 全部(只读) | 全部数据 | 查看+QC+偏差 | QC确认 |
| **报告编制** | 报告管理 | 已分配 | 创建/编辑报告 | 编制签名 |
| **审核人** | 报告审核 | 本实验室 | 审核/退回 | 审核签名 |
| **授权签字人** | 报告签发 | 授权范围 | 终签/作废 | 终签 |
| **设备管理员** | 仪器管理 | 全部 | CRUD+校准 | 设备确认 |
| **物料管理员** | 库存管理 | 全部 | 出入库/盘点 | 无 |
| **客户/委托方** | 客户门户 | 仅本人 | 下单/查看 | 无 |
| **审计员** | 审计日志 | 全部(只读) | 查看 | 无 |

---

## 3. 功能设计

### 3.1 权限矩阵配置页面

```
┌──────────────────────────────────────────────────────────┐
│  角色权限配置                               [+ 新建角色]   │
├──────────────────────────────────────────────────────────┤
│  选择角色: [检测员 ▾]                                     │
├──────────────────────────────────────────────────────────┤
│  📋 菜单权限                                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │ ☑ 首页                ☐ 样品管理                  │    │
│  │ ☑ 检测管理 (仅我的任务) ☐ 报告管理                │    │
│  │ ☐ 质量控制             ☐ 仪器管理                 │    │
│  │ ☐ 库存管理             ☐ 方法管理                 │    │
│  │ ☐ 系统管理             ☐ 客户管理                 │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  📊 数据权限                                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 数据范围: ○ 全部  ● 本实验室  ○ 仅本人           │    │
│  │ 可见字段: ☑ 样品编号 ☑ 样品名称 ☐ 客户信息       │    │
│  │          ☐ 成本/价格 ☐ 审计记录                   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ✏️ 操作权限                                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 检测任务: ☑ 查看  ☑ 创建  ☑ 编辑(自己)          │    │
│  │          ☐ 删除  ☐ 审核  ☐ 分配                 │    │
│  │ ELN记录:  ☑ 查看  ☑ 创建  ☑ 编辑(自己)          │    │
│  │          ☑ 提交  ☐ 复核  ☐ 退回                 │    │
│  │ 仪器设备: ☑ 查看  ☐ 创建  ☐ 编辑  ☐ 删除       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│  ✍️ 签名权限                                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │ ☐ 编制签名  ☐ 审核签名  ☐ 批准签发              │    │
│  │ 签名范围: [                ]                       │    │
│  │ 需要二次认证: ☐                                     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                           │
│                        [保存角色] [重置]                   │
└──────────────────────────────────────────────────────────┘
```

### 3.2 用户授权页面

```
┌──────────────────────────────────────────────────────────┐
│  用户授权管理                              [+ 新建用户]    │
├──────────────────────────────────────────────────────────┤
│  [搜索姓名/工号]                                         │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ 姓名      │ 部门      │ 角色      │ 资质      │ 操作         │
│ 张伟     │ 检测一部   │ 检测员    │ 有效      │ 编辑授权     │
│ 李明     │ 仪器管理部 │ 设备管理员│ 有效      │ 编辑授权     │
│ 王强     │ 质量管理部 │ QA主管   │ 有效      │ 编辑授权     │
│ 李思     │ 检测一部   │ 授权签字人│ 过期⚠️   │ 编辑授权     │
└──────────┴──────────┴──────────┴──────────┴──────────────┘
```

### 3.3 数据模型

```typescript
interface Role {
  id: string;
  name: string;                  // "检测员"
  description: string;
  // 菜单权限
  menuPermissions: string[];     // ['/dashboard', '/tasks', '/tasks/:id/result']
  // 数据权限
  dataScope: 'all' | 'lab' | 'self';
  visibleFields: string[];       // 可见字段（也可控制掩码）
  // 操作权限
  permissions: Record<string, PermissionSet>;
  // 签名权限
  signScopes: SignScope[];
  requiresMFA: boolean;
}

interface PermissionSet {
  view: boolean;
  create: boolean;
  edit: 'none' | 'own' | 'all';
  delete: boolean;
  approve: boolean;
  assign: boolean;
}

interface SignScope {
  type: 'prepared' | 'reviewed' | 'approved';  // 签名类型
  documentTypes: string[];       // 可签名文档类型
}

interface User {
  id: string;
  empNo: string;
  name: string;
  orgId: string;                 // 所属组织/实验室
  roleIds: string[];             // 角色列表
  competencyTags: string[];      // 资质标签
  signerScope?: SignScope[];
  accountStatus: 'active' | 'locked' | 'expired';
  lastLoginAt?: string;
  passwordExpiresAt?: string;
}
```

### 3.4 权限检查流程

```
用户请求 → API Gateway
    │
    ▼
┌──────────────┐
│ 身份验证      │  JWT Token 验证
│ (Authentication)│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 菜单权限检查  │  用户角色 → 菜单列表
│ (Menu Auth)   │  无权限 → 404 页面
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 操作权限检查  │  角色 → CRUD 权限
│ (Action Auth) │  无权限 → 按钮置灰/隐藏
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 数据权限检查  │  角色 → 数据范围
│ (Data Auth)   │  自动添加 lab_id / user_id 过滤
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ 签名权限检查  │  角色 → 签名范围
│ (Sign Auth)   │  无权限 → 签名按钮不可用
└──────────────┘
```

### 3.5 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/roles` | 角色列表 |
| POST | `/api/v1/roles` | 创建角色 |
| PUT | `/api/v1/roles/:id` | 编辑角色权限 |
| DELETE | `/api/v1/roles/:id` | 删除角色 |
| GET | `/api/v1/users/:id/permissions` | 用户权限详情 |
| PUT | `/api/v1/users/:id/roles` | 更新用户角色 |
| PUT | `/api/v1/users/:id/competency` | 更新用户资质 |
| GET | `/api/v1/auth/me` | 当前用户权限 |
| GET | `/api/v1/audit/permission-changes` | 权限变更审计 |

---

## 4. MVP 实现计划 (3天)

| 天 | 内容 |
|:--:|------|
| D1 | 角色数据模型 + 权限矩阵配置页面 + 多角色合并策略 |
| D2 | 用户授权页面 + 数据权限过滤中间件 + 权限检查 API |
| D3 | 签名权限 + 临时委托 + 密码策略 + 权限变更审计 |

---

## 5. Review 修正 (v1.1)

### 5.1 补充 User Story

#### US6 — 多角色权限合并
> 作为**系统管理员**，当用户有多个角色时（如"检测员"+"设备使用者"），系统应按 deny-override 原则合并权限——任一角色限制的权限即为最终限制。

#### US7 — 临时权限委托
> 作为**实验室主管**，我休假 2 周期间，需要将审批权限临时委托给副主管。到期后自动收回，不留后门。

#### US8 — 新员工快速配置
> 作为**系统管理员**，新入职检测员应能一键应用"新检测员"角色模板（包含检测员基本权限 + 设备使用 + 样品查看），无需手动勾选 20+ 项权限。

#### US9 — 权限变更通知
> 作为**检测员**，当我的权限被修改时，应收到站内通知和邮件，告知"您的 XX 权限已被 YY 修改为 ZZ"。

#### US10 — 密码策略合规
> 作为**系统**，应符合 21 CFR Part 11 要求：密码 8 位以上含大小写+数字+特殊字符，90 天过期，5 次失败锁定 30 分钟，不可重复使用最近 5 次密码。

### 5.2 多角色权限合并策略

```typescript
// deny-override: 安全优先原则
function mergePermissions(roles: Role[]): EffectivePermissions {
  const merged: EffectivePermissions = {
    menuPermissions: new Set<string>(),
    dataScope: 'all' as DataScope,
    operations: {},
    signScopes: []
  };
  
  for (const role of roles) {
    // 菜单: 取并集
    role.menuPermissions.forEach(m => merged.menuPermissions.add(m));
    
    // 数据范围: 取最严格（deny-override）
    const scopePriority = { self: 1, lab: 2, all: 3 };
    if (scopePriority[role.dataScope] < scopePriority[merged.dataScope]) {
      merged.dataScope = role.dataScope;
    }
    
    // 操作权限: 逐个资源取最严格
    for (const [resource, perm] of Object.entries(role.permissions)) {
      if (!merged.operations[resource]) {
        merged.operations[resource] = { ...perm };
      } else {
        // deny-override: 任一角色无权限 = 最终无权限
        const existing = merged.operations[resource];
        existing.view = existing.view && perm.view;
        existing.create = existing.create && perm.create;
        existing.delete = existing.delete && perm.delete;
        // edit 取最严格
        const editPriority = { none: 0, own: 1, all: 2 };
        if (editPriority[perm.edit] < editPriority[existing.edit]) {
          existing.edit = perm.edit;
        }
      }
    }
  }
  
  return merged;
}
```

### 5.3 临时权限委托

```typescript
interface PermissionDelegation {
  id: string;
  fromUserId: string;
  toUserId: string;
  permissions: string[];         // 委托的权限列表
  validFrom: string;
  validUntil: string;            // 到期自动收回
  reason: string;                 // 委托原因（必填，审计用）
  status: 'active' | 'expired' | 'revoked';
  approvedBy: string;             // 需要上级审批
  createdAt: string;
}

// 定时任务：每小时检查过期委托并自动收回
async function revokeExpiredDelegations(): Promise<void> {
  const expired = await db.findDelegations({ 
    status: 'active', 
    validUntil: { lt: new Date().toISOString() } 
  });
  for (const d of expired) {
    await db.updateDelegation(d.id, { status: 'expired' });
    await auditLog.create({ action: 'delegation_expired', details: d });
    await notifyUser(d.fromUserId, `对 ${d.toUserId} 的权限委托已到期收回`);
  }
}
```

### 5.4 密码策略配置

```typescript
interface PasswordPolicy {
  minLength: number;             // >= 8
  requireUppercase: boolean;     // 必须含大写
  requireLowercase: boolean;     // 必须含小写
  requireDigit: boolean;         // 必须含数字
  requireSpecial: boolean;       // 必须含特殊字符
  maxAgeDays: number;            // 90 天过期
  maxFailedAttempts: number;     // 5 次锁定
  lockoutDurationMinutes: number;// 30 分钟
  historyCount: number;          // 不可重复最近 5 次
}

const defaultPolicy: PasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
  maxAgeDays: 90,
  maxFailedAttempts: 5,
  lockoutDurationMinutes: 30,
  historyCount: 5
};
```

### 5.5 权限检查 API

```typescript
// 实时权限检查
GET /api/v1/auth/check?action=edit&resource=report:RPT-001
→ { allowed: true, reason: null }
→ { allowed: false, reason: "您没有报告编辑权限" }

// 有效权限查询（合并所有角色）
GET /api/v1/users/:id/effective-permissions
→ {
  menuPermissions: ["/dashboard", "/tasks", ...],
  dataScope: "lab",
  operations: { "report": { view: true, create: false, edit: "own", delete: false } },
  signScopes: [{ type: "prepared", documentTypes: ["report"] }],
  activeDelegations: [{ fromUser: "王强", until: "2026-06-01" }]
}

// 角色模板
GET /api/v1/roles/templates
→ [
  { id: "tpl-new-analyst", name: "新入职检测员", roles: ["analyst", "instrument-user", "sample-viewer"] },
  { id: "tpl-qa-specialist", name: "QA专员", roles: ["qa", "report-viewer", "audit-viewer"] }
]
```
