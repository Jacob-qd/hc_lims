# 系统管理

> 现有代码: `src/pages/SettingsPage.tsx` (149行) | `src/pages/DictPage.tsx` (56行)
>        | `src/pages/AuditLogPage.tsx` (96行) | `src/pages/NotificationPage.tsx` (101行)
>        | `src/stores/permissionStore.ts` | `src/stores/themeStore.ts`
> 成熟度: ✅ 已实现系统设置+数据字典+审计日志+消息通知+权限管理

---

## 1. 系统设置 (SettingsPage)

### 已实现功能
- 系统参数配置: 实验室信息、编号规则、默认值
- 用户管理: 用户列表、角色分配
- 角色权限管理: RBAC 角色配置、菜单权限

### 用户故事

**US-01**: 作为**系统管理员**，我在系统设置中配置实验室信息、编号规则等系统参数。
**US-02**: 作为**系统管理员**，我管理用户账号，分配角色和权限。

### API

```
GET    /api/v1/settings                     # 系统配置
PUT    /api/v1/settings                     # 更新配置
GET    /api/v1/users                        # 用户列表
POST   /api/v1/users                        # 创建用户
PUT    /api/v1/users/:id/role               # 分配角色
GET    /api/v1/roles                        # 角色列表
POST   /api/v1/roles                        # 创建角色
```

---

## 2. 数据字典 (DictPage)

### 已实现功能
- 数据字典管理: 字典分类、字典项 CRUD
- 支持系统预置字典（样品类型、检测项目分类等）

### 用户故事

**US-01**: 作为**系统管理员**，我维护数据字典，添加/修改/删除字典项，供各模块下拉选择使用。

### API

```
GET    /api/v1/dicts                        # 字典分类列表
POST   /api/v1/dicts                        # 创建字典分类
GET    /api/v1/dicts/:code/items            # 字典项列表
POST   /api/v1/dicts/:code/items            # 添加字典项
PUT    /api/v1/dict-items/:id               # 更新字典项
DELETE /api/v1/dict-items/:id               # 删除字典项
```

---

## 3. 审计日志 (AuditLogPage)

### 已实现功能
- 审计日志列表: 操作人/模块/操作类型/时间/IP
- 按模块分类统计：用户管理/样品/检测/报告/系统
- 搜索筛选（操作人/模块/时间范围）

### 用户故事

**US-01**: 作为**质量主管**，我查看审计日志追踪谁在什么时间做了什么操作。
**US-02**: 作为**系统管理员**，按模块分类查看操作统计，了解系统使用情况。

### API

```
GET    /api/v1/audit-logs                   # 审计日志列表
GET    /api/v1/audit-logs/statistics        # 分类统计
```

---

## 4. 消息通知 (NotificationPage)

### 已实现功能
- 通知列表: 标题/内容/时间/类型/已读状态
- 通知类型: 任务分配、审核通过、审核驳回、系统消息
- 批量标记已读
- 全部标记已读

### 用户故事

**US-01**: 作为**检测员**，系统分配任务后收到通知，点击通知跳转到任务页面。

### API

```
GET    /api/v1/notifications                # 通知列表
GET    /api/v1/notifications/unread-count   # 未读数
PUT    /api/v1/notifications/:id/read       # 标记已读
PUT    /api/v1/notifications/read-all       # 全部已读
```

---

## 5. 权限管理 (permissionStore)

### 已实现功能
- RBAC 权限模型
- 菜单级权限控制
- 权限状态管理

### 权限模型

```typescript
interface Permission {
  code: string;           // 权限编码: 'sample:create', 'report:approve'
  name: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];  // 权限编码列表
}

interface User {
  id: string;
  username: string;
  role: string;
  permissions: string[];  // 实际权限（合并角色权限）
}
```

### 权限检查

```typescript
// 在组件中使用:
const { can } = usePermissionStore();
if (can('report:approve')) {
  // 显示批准按钮
}
```

---

## 6. 主题管理 (themeStore)

### 已实现功能

| 功能 | 说明 |
|------|------|
| 亮色/暗黑模式切换 | AntD 5 主题切换 |
| 主题色配置 | 主色/成功色/警告色/错误色 |
| 个性化设置 | 布局模式、内容区域宽度 |
| 持久化 | 配置保存在 localStore |
| 侧边栏折叠 | 收起/展开切换 |
