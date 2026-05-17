# HC-LIMS 高校科研版 — 6模块重构设计文档

> 版本: v1.0
> 日期: 2026-05-17
> 范围: 高校科研版6个核心模块重构

---

## 1. 概述

高校科研版是 HC-LIMS 的差异化优势模块，面向高校科研实验室场景。本次重构在现有功能基础上，统一交互范式、增强数据可视化、完善Mock API覆盖，确保6个模块达到生产可用水准。

## 2. 模块清单

| # | 模块 | 页面文件 | 核心能力 |
|---|------|----------|----------|
| 1 | 课题组管理 | `ResearchGroupPage.tsx` | 组织架构、成员角色、经费台账、仪器使用统计 |
| 2 | 科研项目管理 | `ResearchProjectPage.tsx` | 项目生命周期、甘特图、里程碑、经费科目 |
| 3 | 电子实验记录 | `ELNPage.tsx` | 模板化记录、签名锁定、见证流程、版本历史 |
| 4 | 仪器预约 | `ReservationPage.tsx` | 日历视图、冲突检测、审批流、计费规则 |
| 5 | 教学实验管理 | `TeachingPage.tsx` | 课程管理、学生分组、实验大纲、成绩录入 |
| 6 | 成果管理 | `AchievementPage.tsx` | 论文/专利/奖励分类、年度统计、批量导出 |

## 3. 统一设计规范

### 3.1 页面布局范式
```
┌─ Title Row (页面标题 + 新建按钮) ─┐
├─ KPI Cards (4项统计卡片) ────────┤
├─ Filter Row (搜索 + 筛选器) ─────┤
├─ Main Table (主列表) ────────────┤
├─ Detail Drawer (详情抽屉) ───────┤
└─ Create/Edit Modal ──────────────┘
```

### 3.2 交互规范
- 所有列表支持搜索、筛选、分页
- 详情使用 Drawer (width=560-640px)
- 新建/编辑使用 Modal (width=520-600px)
- 数据操作后自动刷新列表
- 使用 Ant Design `message` 反馈操作结果

### 3.3 数据获取规范
- 页面挂载时通过 `fetch` 调用 MSW Mock API
- 使用 `loading` 状态控制 Table 的加载态
- 错误时调用 `message.error('加载失败')`

### 3.4 类型定义规范
- 每个页面顶部定义本地接口类型
- 避免使用 `any`，使用具体类型或 `unknown`
- 复用 `src/mocks/data.ts` 中的类型定义

## 4. 各模块详细设计

### 4.1 课题组管理 (ResearchGroupPage)

**增强点:**
- 左侧组织树 + 右侧列表联动
- 成员管理增加角色标签色 (PI/博士后/博士生/硕士生/科研助理)
- 经费台账增加执行率进度条
- 仪器使用统计增加费用汇总
- 详情抽屉增加4个Tab: 成员/基本信息/经费/仪器统计

**Mock API:**
- `GET /api/v1/research/groups/expanded` — 扩展课题组列表

### 4.2 科研项目管理 (ResearchProjectPage)

**增强点:**
- 项目列表增加执行率可视化 (Progress)
- 详情增加甘特图时间轴 (Timeline)
- 经费管理细化到科目级别
- 关联实验列表展示

**Mock API:**
- `GET /api/v1/research/projects` — 项目列表
- `POST /api/v1/research/projects` — 创建项目

### 4.3 电子实验记录 (ELNPage)

**增强点:**
- 列表增加状态筛选
- 编辑器增加步骤追踪面板
- 签名流程增加密码确认 + 审计时间线
- 增加"见证"状态流转

**Mock API:**
- `GET /api/v1/research/eln-entries` — ELN列表
- `POST /api/v1/research/eln-entries` — 创建记录
- `POST /api/v1/research/eln-entries/:id/sign` — 签名锁定

### 4.4 仪器预约 (ReservationPage)

**增强点:**
- 网格化日历视图 (仪器×日期)
- 预约状态颜色区分
- 计费规则表格展示
- 使用统计概览

**Mock API:**
- `GET /api/v1/research/reservations` — 预约列表
- `POST /api/v1/research/reservations` — 创建预约

### 4.5 教学实验管理 (TeachingPage)

**增强点:**
- 课程列表展示学期/学生数/实验数
- 详情增加教学大纲Tab
- 学生管理Tab (占位扩展)
- 实验报告评分界面

**Mock API:**
- `GET /api/v1/teaching/courses` — 课程列表

### 4.6 成果管理 (AchievementPage)

**增强点:**
- 类型筛选 (论文/专利/报告)
- 年份筛选
- 详情增加关联实验数据
- 批量导出功能 (CSV/PDF/JSON)
- 年度统计图表 (Ant Design Plots)

**Mock API:**
- `GET /api/v1/research/publications` — 成果列表
- `POST /api/v1/research/publications` — 登记成果

## 5. 数据结构

见 `src/mocks/data.ts` 中以下导出:
- `mockResearchGroupsExpanded`
- `mockResearchProjects`
- `mockELNEntries`
- `mockReservations`
- `mockCourses`
- `mockPublications`

## 6. API 路由

见 `src/mocks/handlers.ts` 中 `/research/*` 和 `/teaching/*` 路由。

## 7. 测试策略

- 每个页面编写 Vitest + React Testing Library 测试
- 测试覆盖: 渲染、搜索筛选、打开详情、打开新建Modal
- 使用 MSW 在测试层提供 Mock API

## 8. 验收标准

- [x] 6个模块全部重构完成
- [x] Mock API响应正确
- [x] 单元测试覆盖主要交互
- [x] Playwright E2E测试通过
- [x] npm run build 零错误
