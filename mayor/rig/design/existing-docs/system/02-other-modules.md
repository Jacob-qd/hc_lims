# 其他模块

> 涵盖: 安全管理 / 客户门户 / 综合查询 / 统计分析 / 登录注册 / 个人中心 / 帮助页

---

## 1. 安全管理 (SafetyPage)

> 代码: `src/pages/SafetyPage.tsx` (122行)

### 已实现功能

| 功能点 | 说明 |
|--------|------|
| 危化品台账 | 名称/分类/存量/存储位置/MSDS |
| 安全检查记录 | 检查项/日期/结果/负责人 |
| 安全培训记录 | 培训主题/时间/参加人 |
| 废弃物管理 | 废弃物类型/数量/处理方式/处理日期 |

### 用户故事

**US-01**: 作为**安全管理员**，我管理危化品台账，记录安全检查和安全培训。

### API

```
GET    /api/v1/safety/chemicals             # 危化品列表
POST   /api/v1/safety/chemicals             # 新增危化品
GET    /api/v1/safety/inspections           # 检查记录
POST   /api/v1/safety/inspections           # 创建检查
GET    /api/v1/safety/trainings             # 培训记录
POST   /api/v1/safety/trainings             # 创建培训
```

---

## 2. 客户门户 (CustomerPortalPage)

> 代码: `src/pages/CustomerPortalPage.tsx` (139行)

### 已实现功能

| 功能点 | 说明 |
|--------|------|
| 客户登录后首页 | 委托样品概览 |
| 委托进度查询 | 样品状态/检测进度/报告状态 |
| 报告下载 | 已签发报告 PDF 下载 |
| 委托提交 | 在线提交检测委托 |
| 历史委托 | 历史委托记录查询 |

### 用户故事

**US-01**: 作为**客户**，登录客户门户查看委托检测的进度和下载检测报告。

---

## 3. 综合查询 (QueryPage)

> 代码: `src/pages/QueryPage.tsx` (70行)
> + `src/pages/StatisticsPage.tsx` (132行)

### 已实现功能

| 功能 | 说明 |
|------|------|
| 按条件查询: 样品号/客户/时间段/状态 | 跨模块综合查询 |
| 统计面板: 按月份/季度/年度趋势 | 检测量/报告量/收入趋势 |

### API

```
GET    /api/v1/query                        # 综合查询
GET    /api/v1/statistics/overview          # 概览统计
GET    /api/v1/statistics/trends?range=month  # 趋势数据
```

---

## 4. 登录/个人中心

> 代码: `src/pages/LoginPage.tsx` (87行) | `src/pages/ProfilePage.tsx` (72行)

### 已实现功能

| 功能 | 说明 |
|------|------|
| 用户名密码登录 | 表单登录 |
| 记住密码 | 本地存储 |
| 个人中心: 修改密码/个人信息/我的任务 | 个人管理 |

### 认证模型

```typescript
interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
  permissions: string[];
  avatar?: string;
  lab: string;       // 所属实验室
}
```

---

## 5. 帮助页 (HelpPage)

> 代码: `src/pages/HelpPage.tsx` (62行)

### 已实现功能
- 系统版本信息
- 快速入门指南
- GitHub 链接
- 联系支持

---

## 6. 布局与路由

> 代码: `src/components/layout/AppHeader.tsx` | `src/components/layout/AppSider.tsx`
>        `src/router/index.tsx` | `src/components/RouteGuard.tsx`

### 布局结构

```
┌──────────────────────────────────────────┐
│  AppHeader                                │
│  Logo | 导航菜单 | 实验室切换 | 通知 | 用户 │
├────────┬─────────────────────────────────┤
│        │                                  │
│  Sider │  Content (页面路由)               │
│  (收起) │                                  │
│         │                                  │
│  菜单   │  面包屑导航                        │
│         │  页面内容                          │
│         │                                  │
└────────┴──────────────────────────────────┘
```

### 路由结构

| 路径 | 模块 | 权限 |
|------|------|------|
| `/dashboard` | 首页驾驶舱 | 所有用户 |
| `/samples` | 样品管理 | sample:view |
| `/tasks` | 检测管理 | task:view |
| `/reports` | 报告管理 | report:view |
| `/quality` | 质量控制 | qc:view |
| `/instruments` | 仪器管理 | instrument:view |
| `/inventory` | 库存管理 | inventory:view |
| `/methods` | 方法管理 | method:view |
| `/personnel` | 人员管理 | personnel:view |
| `/clients` | 客户管理 | client:view |
| `/settings` | 系统设置 | admin |
| `/eln` | 电子实验记录 | eln:view |
| `/research-groups` | 课题组 | group:view |
| `/research-projects` | 研究项目 | project:view |
| `/reservations` | 仪器预约 | reservation:view |
| `/teaching` | 教学实验 | teaching:view |
| `/achievements` | 成果管理 | achievement:view |
| `/portal` | 客户门户 | 公开 |

### RouteGuard

角色/权限路由守卫，未授权用户重定向到 403 页面。
