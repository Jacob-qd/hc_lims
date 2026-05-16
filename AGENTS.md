# HC-LIMS Agent Instructions

> 红创实验室信息管理系统 — 中小检测 + 高校科研双场景
> 技术栈: React 19 + TypeScript + Ant Design 5 + MSW Mock + Zustand + dnd-kit
> 状态: v5.0 完成 · 95% 功能覆盖 · 109 Vitest · 28 Playwright · 25 设计文档

---

## 📋 项目概况

HC-LIMS 是一个面向中小检测机构和高校科研实验室的开源 LIMS，对标 金现代/StarLIMS/LabWare/SampleManager/三维天地。

### 当前规模

| 指标 | 数值 |
|------|:---:|
| 页面 | 44 |
| 路由 | 46 |
| 组件 | 15 |
| TSX 行数 | ~11,500 |
| Mock 数据 | 1,550+ 行 |
| Mock Handlers | 1,100+ 行 |
| Vitest | 109 用例 / 13 文件 |
| Playwright | 28 用例 / 6 文件 |
| 设计文档 | 25 份 / 5,000+ 行 |
| User Story | 78 个 / 83% 覆盖 |

---

## 🧩 模块速查

### 核心业务模块

| 模块 | 页面 | 路由 | 状态 |
|------|------|------|:---:|
| 仪表盘 | DashboardPage | /dashboard | ✅ 预警中心+KPI+角色视图 |
| 委托管理 | OrdersPage | /orders | ✅ CRUD+快速委托+SLA+套餐 |
| 样品管理 | SamplesPage | /samples | ✅ 登记+分样+留样+库位+异常 |
| 样品详情 | SampleDetailPage | /samples/:id | ✅ |
| 检测管理 | TasksPage | /tasks | ✅ 看板+派工+负载+批次+紧急插单 |
| 结果录入 | TaskResultEntry | /tasks/:id/result | ✅ ELN+超标复测+设备回填 |
| 报告管理 | ReportsPage | /reports | ✅ 编制→审核→签发+作废+分发 |
| 质量控制 | QualityPage | /quality | ✅ 方案+Westgard+L-J图+CAPA+台账 |
| 仪器管理 | InstrumentsPage | /instruments | ✅ 台账+监控+IQOQPQ+比对+核查 |
| 仪器数据 | InstrumentDataPage | /instruments/data | ✅ |
| 库存管理 | InventoryPage | /inventory | ✅ CRUD+入出库+盘点+供应商 |
| 客户管理 | ClientsPage | /clients | ✅ CRUD |
| 合同管理 | ContractsPage | /contracts | ✅ CRUD |
| 客户门户 | CustomerPortalPage | /portal | ✅ 套餐+在线委托 |
| COC监管链 | COCPage | /coc | ✅ 事件溯源+导出 |
| 方法管理 | MethodsPage | /methods | ✅ CRUD+SOP+模板导入导出+历史复制 |

### 系统管理模块

| 模块 | 页面 | 路由 |
|------|------|------|
| 系统设置 | SettingsPage | /settings |
| RBAC权限 | (Settings Tab) | /settings |
| 字段配置 | FieldConfigEditor | /settings/field-configs |
| 企业集成 | EnterpriseIntegrationPage | /settings/integration |
| 数据字典 | DictPage | /dict |
| 审计日志 | AuditLogPage | /audit-logs |
| 通知中心 | NotificationPage | /notifications |
| 数据备份 | BackupPage | /backup |
| 工作流 | WorkflowPage | /workflow |
| 报表引擎 | ReportEnginePage | /reports/engine |
| 系统监控 | SystemMonitorPage | /system-monitor |
| AI助手 | AIAssistantPage | /ai-assistant |
| 能力验证 | ProficiencyTestingPage | /proficiency-testing |
| 数字证书 | CertificatePage | /certificates |

### 科研模块

| 模块 | 页面 | 路由 |
|------|------|------|
| ELN | ELNPage | /research/eln |
| 课题组 | ResearchGroupPage | /research/groups |
| 研究项目 | ResearchProjectPage | /research/projects |
| 仪器预约 | ReservationPage | /research/reservations |
| 教学 | TeachingPage | /teaching |
| 安全 | SafetyPage | /safety |
| 成果 | AchievementPage | /achievements |

### 基础模块

| 模块 | 页面 |
|------|------|
| 登录 | LoginPage |
| 个人中心 | ProfilePage |
| 帮助 | HelpPage |
| 综合查询 | QueryPage |
| 数据分析 | StatisticsPage |
| 排程管理 | SchedulesPage |
| 人员培训 | PersonnelPage |
| 跨模块追溯 | TraceViewPage |

---

## 📁 设计文档索引

```
design/
├── MASTER-PLAN.md               ← 开发计划 v4.0
├── PROGRESS-ASSESSMENT.md       ← 进度评估
├── FINAL-COMPLETION.md          ← 完成报告
├── FINAL-REPORT.md              ← 最终报告
├── USER-STORY-GAP.md            ← User Story 差距分析
├── GAP_ANALYSIS_VS_JXD.md       ← 金现代对标
├── PHASE1-VERIFICATION.md       ← P1 核对
├── PHASE1-TEST-REPORT.md        ← P1 测试报告
├── REVIEW-ROUND1.md             ← 第1轮 Review
├── REVIEW-ROUND2.md             ← 第2轮 Review
├── REVIEW-FINAL.md              ← 终审
├── PLAN-REVIEW.md               ← 计划 Review
├── p0/                          ← P0 设计 (5份)
│   ├── P0-1-order-management.md
│   ├── P0-2-eln-template-engine.md
│   ├── P0-3-auto-dispatch.md
│   ├── P0-4-qc-plan-config.md
│   └── P0-5-rbac-permissions.md
└── competitive-research/        ← 竞品调研 (5份)
    ├── 01-dashboard.md
    ├── 02-sample-management.md
    ├── 03-report-management.md
    ├── 04-task-management.md
    └── 05-qc-instruments-coc-clients.md
```

---

## 🔧 开发规范

### 数据流
- 所有 API 通过 MSW Mock 实现
- Mock 数据: `src/mocks/data.ts`
- API 路由: `src/mocks/handlers.ts`
- 新增功能: data.ts → handlers.ts → pages/

### 路由
- 路由配置: `src/router/index.tsx`
- 权限守卫: `src/components/RouteGuard.tsx`
- 导航菜单: `src/components/layout/AppSider.tsx`

### 状态管理
- Zustand stores: `src/stores/`
- 通用工具: `src/utils/idgen.ts` (编号/时间生成)

### 通用组件
- `StatCards` — 统计卡片行
- `ALCOAIndicator` — ALCOA+ 完整性标记
- `BarcodeLabel` — 条码打印
- `BatchActions` — 批量操作
- `ReportWatermark` — 报告水印
- `SignaturePad` — 电子签名
- `DynamicFieldRenderer` — 动态表单

### 测试
```bash
npx vitest run        # 109 用例
npx playwright test   # 28 用例 (需浏览器)
npx tsc --noEmit      # TS 检查
```

---

## 📋 会话结束检查清单

```
[ ] 所有代码已提交: git status
[ ] TypeScript 零错误: npx tsc --noEmit
[ ] Vitest 通过: npx vitest run
[ ] 路由扫描通过: curl localhost:5173/<route>
[ ] git push
```

---

*HC-LIMS v5.0 | 44页 · 46路由 · 109测试 · 25设计文档 · 95%功能覆盖*
