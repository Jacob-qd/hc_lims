# 现有功能 — 设计文档索引

> 基于 HC-LIMS 已实现的代码功能编写的设计文档
> 涵盖: 22 个模块 | 36 个页面 | 6 个全局组件

---

## 核心业务模块 (core/)

| 模块 | 页面 | 设计文档 | 代码行数 |
|------|------|---------|:--------:|
| 首页驾驶舱 | DashboardPage | [01-dashboard.md](./core/01-dashboard.md) | 325 |
| 样品管理 | SamplesPage + SampleDetailPage | [02-sample-management.md](./core/02-sample-management.md) | 592 |
| 检测管理 | TasksPage + TaskResultEntry + SchedulesPage | [03-test-management.md](./core/03-test-management.md) | 479 |
| 报告管理 | ReportsPage | [04-report-management.md](./core/04-report-management.md) | 1362 |
| 质量控制 | QualityPage | [05-quality-control.md](./core/05-quality-control.md) | 228 |
| 仪器管理 | InstrumentsPage | [06-instrument-management.md](./core/06-instrument-management.md) | 245 |
| 库存管理 | InventoryPage | [07-inventory-management.md](./core/07-inventory-management.md) | 191 |
| 方法管理 | MethodsPage | [08-method-management.md](./core/08-method-management.md) | 109 |
| 人员管理 | PersonnelPage | [09-personnel-management.md](./core/09-personnel-management.md) | 120 |
| 客户合同 | ClientsPage + ContractsPage | [10-client-contract.md](./core/10-client-contract.md) | 232 |

## 高校科研模块 (academic/)

| 模块 | 页面 | 设计文档 | 代码行数 |
|------|------|---------|:--------:|
| 课题组管理 | ResearchGroupPage | [01-research-group.md](./academic/01-research-group.md) | 167 |
| 研究项目管理 | ResearchProjectPage | [02-research-project.md](./academic/02-research-project.md) | 139 |
| 电子实验记录 ELN | ELNPage | [03-eln.md](./academic/03-eln.md) | 156 |
| 仪器预约 | ReservationPage | [04-reservation.md](./academic/04-reservation.md) | 154 |
| 教学实验管理 | TeachingPage | [05-teaching.md](./academic/05-teaching.md) | 145 |
| 成果管理 | AchievementPage | [06-achievement.md](./academic/06-achievement.md) | 163 |

## 系统管理模块 (system/)

| 模块 | 页面 | 设计文档 |
|------|------|---------|
| 系统设置 + 数据字典 | SettingsPage + DictPage | [01-system-management.md](./system/01-system-management.md) |
| 审计日志 + 消息通知 | AuditLogPage + NotificationPage | 同上 |
| 权限管理 | permissionStore | 同上 |
| 主题管理 | themeStore | 同上 |
| 安全管理 | SafetyPage | [02-other-modules.md](./system/02-other-modules.md) |
| 客户门户 | CustomerPortalPage | 同上 |
| 综合查询 | QueryPage + StatisticsPage | 同上 |
| 登录/个人中心 | LoginPage + ProfilePage | 同上 |
| 帮助页 | HelpPage | 同上 |
| 布局/路由 | AppHeader + AppSider + RouteGuard | 同上 |

## 全局组件

| 组件 | 代码 | 说明 |
|------|------|------|
| CustomWorkspace | `src/components/CustomWorkspace.tsx` | 自定义工作台（拖拽组件配置） |
| BatchActions | `src/components/BatchActions.tsx` | 批量操作组件 |
| BarcodeLabel | `src/components/BarcodeLabel.tsx` | 条码标签生成 |
| SignaturePad | `src/components/SignaturePad.tsx` | 电子签名绘制 |
| BreadcrumbNav | `src/components/BreadcrumbNav.tsx` | 面包屑导航 |
| RouteGuard | `src/components/RouteGuard.tsx` | 路由权限守卫 |

## 状态管理

| Store | 代码 | 说明 |
|-------|------|------|
| authStore | `src/stores/authStore.ts` | 认证状态 |
| i18nStore | `src/stores/i18nStore.ts` | 国际化 |
| labTypeStore | `src/stores/labTypeStore.ts` | 实验室类型切换 |
| permissionStore | `src/stores/permissionStore.ts` | 权限 |
| themeStore | `src/stores/themeStore.ts` | 主题（亮色/暗黑） |

## Mock 数据

| 文件 | 说明 |
|------|------|
| `src/mocks/data.ts` (75,941 bytes) | 全模块 Mock 数据 |
| `src/mocks/handlers.ts` (19,769 bytes) | MSW 请求处理 |
| `src/mocks/browser.ts` | MSW 浏览器 worker |
