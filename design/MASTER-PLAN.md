# HC-LIMS 统一开发计划与测试计划

> 版本: v3.0 | 日期: 2026-05-16
> 基线: 42页 · 44路由 · 35Vitest · 10E2E · TS零错误
> 设计文档: 15份 · 3,868行 · 95个User Story · 两轮Review (49项修正)

---

## 一、已完成功能清单

### 1.1 核心业务模块

| 模块 | 页面 | 路由 | 状态 | 关键能力 |
|------|------|------|:---:|------|
| 仪表盘 | DashboardPage | /dashboard | ✅ | KPI卡片 + 趋势图 + 任务队列 + 仪器状态 |
| 委托管理 | OrdersPage | /orders | ✅ | 委托CRUD + 快速委托 + SLA倒计时 + 套餐 |
| 样品管理 | SamplesPage | /samples | ✅ | 登记向导 + 条码打印 + 批量操作 + 详情Drawer |
| 样品详情 | SampleDetailPage | /samples/:id | ✅ | 基本信息 + 检测项目 + 流转记录 |
| 检测管理 | TasksPage | /tasks | ✅ | 列表+看板+派工规则+负载监控+详情Drawer |
| 结果录入 | TaskResultEntry | /tasks/:id/result | ✅ | ELN模式 + 添加指标/读数 + 原始数据解析 |
| 报告管理 | ReportsPage | /reports | ✅ | 编制→审核→签发全流程 + SM2签名 + 验真 |
| 质量控制 | QualityPage | /quality | ✅ | 质控图 + 偏差CAPA + 质控方案 + Westgard |
| 仪器管理 | InstrumentsPage | /instruments | ✅ | 台账 + 实时监控 + IQ/OQ/PQ + 比对 + 利用率 |
| 仪器数据 | InstrumentDataPage | /instruments/data | ✅ | 连接管理 + 驱动库 + 文件导入 |
| 库存管理 | InventoryPage | /inventory | ✅ | CRUD + 入库/出库/盘点 + 供应商管理 |
| 客户管理 | ClientsPage | /clients | ✅ | CRUD + 详情 + 关联查看 |
| 合同管理 | ContractsPage | /contracts | ✅ | CRUD + 状态管理 |
| 客户门户 | CustomerPortalPage | /portal | ✅ | 报告查询 + 在线委托 |
| COC监管链 | COCPage | /coc | ✅ | 事件溯源 + 时间线 + 交接记录 + 链完整性 |

### 1.2 支撑模块

| 模块 | 页面 | 状态 | 关键能力 |
|------|------|:---:|------|
| 方法管理 | MethodsPage | ✅ | CRUD + SOP文档 + 版本发布 |
| 人员培训 | PersonnelPage | ✅ | 档案 + 培训 + 资质 + 新增人员Modal |
| 排程管理 | SchedulesPage | ✅ | 今日排期 + 周视图 + 新增排期Modal |
| 数据分析 | StatisticsPage | ✅ | 趋势图 + 分布图 + 看板设计器 |
| 系统管理 | SettingsPage | ✅ | 用户+角色+RBAC+密码策略+系统配置 |
| 字段配置 | FieldConfigEditor | /settings/field-configs | ✅ | 动态表单字段CRUD |
| 数字证书 | CertificatePage | /certificates | ✅ | SM2证书导入/吊销/验证 |
| 审计日志 | AuditLogPage | /audit-logs | ✅ | 50条Mock + 筛选 + 统计 |
| 通知中心 | NotificationPage | /notifications | ✅ | 未读/全部 + 多通道配置 |
| 数据备份 | BackupPage | /backup | ✅ | 备份记录 + 策略 + 恢复 + 归档 |
| 工作流 | WorkflowPage | /workflow | ✅ | 可视化设计器 + 待办/已办 + 流程监控 |
| 报表引擎 | ReportEnginePage | /reports/engine | ✅ | 报表模板 + 图表组件库 + 调度 |
| 系统监控 | SystemMonitorPage | /system-monitor | ✅ | CPU/内存/磁盘 + 告警 + 日志 |
| 企业集成 | EnterpriseIntegrationPage | /settings/integration | ✅ | ERP/OA/MQ + LDAP/SSO + API管理 |
| AI助手 | AIAssistantPage | /ai-assistant | ✅ | 智能问答 + 数据分析 + 推荐 |
| 能力验证 | ProficiencyTestingPage | /proficiency-testing | ✅ | PT计划 + z-score + CNAS覆盖 |
| ELN | ELNPage | /research/eln | ✅ | 模板库 + 试运行 + 公式引擎 |
| 科研模块 | Research* ×4 | /research/* | ✅ | 课题组/项目/ELN/预约 |

### 1.3 平台能力

| 能力 | 状态 | 位置 |
|------|:---:|------|
| 中英文 i18n | ✅ 334键 | i18nStore |
| 暗色主题 | ✅ | themeStore |
| 响应式布局 | ✅ | AppLayout |
| 全局CSS | ✅ 含动画+滚动条+打印 | index.css |
| MSW Mock | ✅ 1073行 | handlers.ts + data.ts |
| 路由守卫 | ✅ | RouteGuard |
| 面包屑导航 | ✅ | BreadcrumbNav |
| 自定义工作台 | ✅ | CustomWorkspace |

---

## 二、待开发功能清单 — 按优先级

### 🔴 P1 — 高优先级 (核心业务闭环) — 17天

| # | 功能 | 模块 | 设计文档 | 天 | 依赖 |
|---|------|------|------|:--:|------|
| P1-1 | **预警中心聚合** | 仪表盘 | 01-dashboard §5 | 2 | - |
| P1-2 | **分样/子样品管理** | 样品管理 | 02-sample §5.1 | 3 | - |
| P1-3 | **留样管理** | 样品管理 | 02-sample §5.2 | 2 | P1-2 |
| P1-4 | **报告作废重签** | 报告管理 | 03-report §5.1 | 2 | - |
| P1-5 | **报告自动分发** | 报告管理 | 03-report §5.2 | 2 | P1-4 |
| P1-6 | **超标自动复测** | 检测管理 | 04-task §4 | 2 | - |
| P1-7 | **CAPA闭环流程** | 质量控制 | P0-4 §6 | 2 | - |
| P1-8 | **跨模块追溯视图** | 全局 | R2-Review | 2 | P1-4 |

### 🟡 P2 — 中优先级 (差异化增强) — 14天

| # | 功能 | 模块 | 设计文档 | 天 |
|---|------|------|------|:--:|
| P2-1 | **样品异常接收流程** | 样品管理 | 02-sample §3.3 | 2 |
| P2-2 | **质控样独立台账** | 质量控制 | P0-4 §4.3 | 2 |
| P2-3 | **期间核查** | 仪器管理 | 05-... §模块6 | 2 |
| P2-4 | **设备预约冲突检测** | 仪器管理 | P0-3 §5.2 | 2 |
| P2-5 | **ELN草稿自动保存** | ELN | P0-2 §7 R2 | 1 |
| P2-6 | **派工预览+拖拽** | 检测管理 | P0-3 §7 R1 | 2 |
| P2-7 | **L-J质控图内联** | 质量控制 | P0-4 §7 R1 | 1 |
| P2-8 | **权限矩阵可编辑** | 系统管理 | P0-5 §7 R1 | 2 |

### 🟢 P3 — 低优先级 (完善体验) — 10天

| # | 功能 | 模块 | 天 |
|---|------|------|:--:|
| P3-1 | 角色差异化看板 | 仪表盘 | 2 |
| P3-2 | 客户门户在线委托增强 | 客户管理 | 2 |
| P3-3 | COC报告导出+扫码签收 | COC | 2 |
| P3-4 | 批次管理 | 检测管理 | 2 |
| P3-5 | 统一数据获取层 (useXxx hooks) | 全局 | 2 |

### 🔵 技术债务 — 与功能并行

| # | 项目 | 天 |
|---|------|:--:|
| T1 | ReportsPage 拆分 (1672行→多组件) | 3 |
| T2 | 提取通用组件 (StatCards/TableActions/FilterBar) | 2 |
| T3 | Mock数据统一管理 (移除组件内硬编码) | 2 |

---

## 三、开发阶段划分

```
Phase 1 (1-17天): P1 高优先级 — 核心业务闭环
  Week 1-2: P1-1 预警中心 + P1-2/P1-3 分样留样
  Week 2-3: P1-4/P1-5 报告作废+分发
  Week 3-4: P1-6 复测 + P1-7 CAPA + P1-8 追溯

Phase 2 (18-31天): P2 中优先级 — 差异化增强
  Week 5-6: P2-1~P2-4 质控+仪器增强
  Week 6-7: P2-5~P2-8 体验增强

Phase 3 (32-41天): P3 低优先级 — 完善体验
  Week 8-9: P3-1~P3-5

技术债务: 与各 Phase 并行处理
```

### 每个功能的开发检查清单

```
[ ] 读设计文档 → 理解交互流和边缘情况
[ ] 创建/增强页面组件
[ ] 添加 Mock 数据 (data.ts)
[ ] 添加 MSW Handler (handlers.ts)
[ ] 注册路由 (router/index.tsx)
[ ] 更新导航 (AppSider.tsx)
[ ] TypeScript 编译通过 (npx tsc --noEmit)
[ ] Vitest 测试 (≥2个用例)
[ ] Playwright E2E 测试 (≥1个用例)
[ ] 路由 200 验证 (curl)
[ ] git commit + 标注完成度
```

---

## 四、测试计划

### 4.1 单元测试 (Vitest) — 目标: 60+ 用例

**现有**: 35 用例, 7 测试文件

**新增**:

| 模块 | 测试文件 | 用例数 | 覆盖重点 |
|------|---------|:---:|------|
| 委托管理 | OrdersPage.test.tsx | 6 | 快速委托/套餐选择/SLA计算/表单验证 |
| ELN引擎 | ELNPage.test.tsx | 6 | 公式计算/修约/自动判定/试运行 |
| 派工规则 | DispatchRules.test.tsx | 4 | 负载计算/规则匹配/预览 |
| 质控方案 | QCPlan.test.tsx | 5 | Westgard规则/趋势预判/违例记录 |
| 预警中心 | AlertPanel.test.tsx | 3 | 聚合展示/跳转链接 |
| 分样管理 | AliquotManager.test.tsx | 4 | 体积校验/子样品创建 |
| 报告作废 | ReportVoid.test.tsx | 3 | 作废流程/版本创建 |
| 复测管理 | RetestManager.test.tsx | 3 | 超标触发/复测创建 |

**目标**: 35 → **66 用例** (+31)

### 4.2 E2E 测试 (Playwright) — 目标: 25+ 用例

**现有**: 10 用例, 2 测试文件

**新增**:

| 测试文件 | 用例数 | 覆盖场景 |
|---------|:---:|------|
| `order-workflow.spec.ts` | 5 | 快速委托→提交→查看详情→取消 |
| `sample-lifecycle.spec.ts` | 4 | 登记→分样→留样→处置 |
| `report-retraction.spec.ts` | 3 | 签发→作废→重签→分发 |
| `qc-violation.spec.ts` | 3 | 方案配置→违例→处置 |

**目标**: 10 → **25 用例** (+15)

### 4.3 合规测试 — 21 CFR Part 11 / CNAS

| 测试场景 | 验证点 | 类型 |
|---------|------|:---:|
| 审计日志完整性 | 委托/样品/报告/ELN 所有操作有日志 | 手动 |
| 电子签名不可否认 | 签名含时间戳+含义+证书 | 手动 |
| 原始数据保护 | ELN提交后不可修改 | 自动化 |
| 权限分离 | 检测员不可签发报告 | 自动化 |
| 密码策略 | 90天过期+5次锁定+历史不可重复 | 自动化 |
| 数据删除审计 | 任何删除操作有完整审计记录 | 手动 |

### 4.4 性能测试

| 指标 | 目标 | 测试方法 |
|------|:---:|------|
| 页面首次加载 | < 3s | Lighthouse |
| 表格渲染 (1000行) | < 500ms | Vitest perf |
| Modal 打开 | < 200ms | 手动计时 |
| 批量操作 (50条) | < 5s | 手动计时 |

### 4.5 兼容性测试

| 浏览器 | 版本 | 状态 |
|--------|------|:---:|
| Chrome | 最新 | ✅ 已验证 |
| Edge | 最新 | ⬜ 待测 |
| Firefox | 最新 | ⬜ 待测 |
| Safari | 最新 | ⬜ 待测 |

---

## 五、验收标准

### 每个功能完成后

- [ ] TypeScript 零错误
- [ ] Vitest 新增用例通过
- [ ] Playwright E2E 用例通过
- [ ] 路由 200 OK
- [ ] 手动验收路径通过 (见各设计文档 §人工验证路径)
- [ ] 设计文档标注完成度

### Phase 完成后

- [ ] 全量 Vitest 通过 (目标: 66+)
- [ ] 全量 Playwright 通过 (目标: 25+)
- [ ] 全路由 200 扫描通过
- [ ] 合规测试检查表完成
- [ ] git push + bd close 相关 issues
