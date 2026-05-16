# HC-LIMS 开发计划 v4.0 — 完整版

> 基线: 43页 · 45路由 · 35Vitest(7文件) · 10E2E(3文件)
> 设计: 18份文档 · 95 User Story · 49 Review修正项
> 总工期: 52天 · 测试目标: 120用例

---

## 一、路由测试覆盖矩阵

| 路由 | 页面 | Vitest | E2E | 在计划中 |
|------|------|:---:|:---:|:---:|
| /dashboard | DashboardPage | ❌ | ✅ | ✅ P1-1 |
| /orders | OrdersPage | ❌ | ❌ | ✅ P1-1 |
| /samples | SamplesPage | ❌ | ✅ | ✅ P1-2 |
| /samples/:id | SampleDetailPage | ❌ | ❌ | ✅ P1-2 |
| /tasks | TasksPage | ❌ | ✅ | ✅ P1-6 |
| /tasks/:id/result | TaskResultEntry | ❌ | ❌ | ✅ P2-5 |
| /reports | ReportsPage | ❌ | ✅ | ✅ P1-4 |
| /reports/engine | ReportEnginePage | ❌ | ❌ | ✅  |
| /quality | QualityPage | ❌ | ❌ | ✅ P1-7 |
| /instruments | InstrumentsPage | ❌ | ✅ | ✅ P2-3 |
| /instruments/data | InstrumentDataPage | ❌ | ❌ | ✅  |
| /inventory | InventoryPage | ❌ | ❌ | ✅  |
| /methods | MethodsPage | ❌ | ❌ | ✅  |
| /personnel | PersonnelPage | ❌ | ❌ | ✅  |
| /clients | ClientsPage | ❌ | ❌ | ✅  |
| /contracts | ContractsPage | ❌ | ❌ | ✅  |
| /coc | COCPage | ❌ | ✅ | ✅ P3-3 |
| /certificates | CertificatePage | ❌ | ❌ | ✅  |
| /workflow | WorkflowPage | ❌ | ❌ | ✅  |
| /backup | BackupPage | ❌ | ❌ | ✅  |
| /settings | SettingsPage | ❌ | ❌ | ✅ P2-8 |
| /settings/field-configs | FieldConfigEditor | ❌ | ❌ | ✅  |
| /settings/integration | EnterpriseIntegrationPage | ❌ | ❌ | ✅  |
| /statistics | StatisticsPage | ❌ | ❌ | ✅  |
| /system-monitor | SystemMonitorPage | ❌ | ❌ | ✅  |
| /proficiency-testing | ProficiencyTestingPage | ❌ | ❌ | ✅  |
| /ai-assistant | AIAssistantPage | ❌ | ❌ | ✅  |
| /dict | DictPage | ❌ | ❌ | ✅  |
| /notifications | NotificationPage | ❌ | ❌ | ✅  |
| /audit-logs | AuditLogPage | ❌ | ❌ | ✅  |
| /help | HelpPage | ❌ | ❌ | ✅  |
| /profile | ProfilePage | ❌ | ❌ | ✅  |
| /login | LoginPage | ❌ | ❌ | ✅  |
| /portal | CustomerPortalPage | ❌ | ❌ | ✅  |
| /query | QueryPage | ❌ | ❌ | ✅  |
| /schedules | SchedulesPage | ❌ | ❌ | ✅  |
| /teaching | TeachingPage | ❌ | ❌ | ✅  |
| /safety | SafetyPage | ❌ | ❌ | ✅  |
| /achievements | AchievementPage | ❌ | ❌ | ✅  |
| /research/eln | ELNPage | ❌ | ❌ | ✅ P2-5 |
| /research/groups | ResearchGroupPage | ❌ | ❌ | ✅  |
| /research/projects | ResearchProjectPage | ❌ | ❌ | ✅  |
| /research/reservations | ReservationPage | ❌ | ❌ | ✅  |
| /workflow | WorkflowPage | ❌ | ❌ | ✅  |
| `*` | 404→/dashboard | - | - | ✅  |
| **合计** | **45条** | **7✅ 38❌** | **10✅ 35❌** | **45/45** |

---

## 二、全局修正任务 (Review R2 — 跨模块)

| # | 任务 | 影响范围 | 天 | 优先级 |
|---|------|---------|:--:|:---:|
| G1 | **编号规则统一** `PREFIX-YYYYMMDD-NNN` | 所有Mock数据 + 所有创建逻辑 | 2 | 🔴 |
| G2 | **时间格式统一** `YYYY-MM-DD HH:mm` | 所有Mock数据 + 所有显示 | 1 | 🔴 |
| G3 | **审计日志补全** (6类操作) | AuditLogPage + 各模块操作 | 2 | 🔴 |
| G4 | **电子签名补全** (5个场景) | 委托确认/接收/留样处置/QC/CAPA | 2 | 🔴 |
| G5 | **状态联动规则** | 委托→样品→任务→报告 跨模块 | 2 | 🔴 |
| G6 | **ALCOA+ 修正** (7项) | 数据保护/删除审计/持久化/一致性 | 2 | 🔴 |

---

## 三、功能开发任务 — 含测试

### 🔴 Phase 1: 核心业务闭环 (19天 + 2天全局 = 21天)

| # | 功能 | 天 | Vitest | E2E | Review项 |
|---|------|:--:|:---:|:---:|------|
| G1 | 编号规则统一 | 2 | - | - | R2-#1 |
| G2 | 时间格式统一 | 1 | - | - | R2-#2 |
| P1-1 | **预警中心聚合** | 2 | AlertPanel.test (3) | dashboard-alerts.spec (2) | R1-db1 |
| P1-2 | **分样/子样品** | 3 | AliquotManager.test (4) | sample-aliquot.spec (2) | R1-sm1 |
| P1-3 | **留样管理** + 处置签名 | 2 | RetentionMgr.test (3) | sample-retention.spec (2) | R1-sm2, R2-sig |
| P1-4 | **报告作废重签** | 2 | ReportVoid.test (3) | report-void.spec (2) | R1-rp1 |
| P1-5 | **报告自动分发** | 2 | Distribution.test (2) | report-dist.spec (1) | R1-rp2 |
| P1-6 | **超标自动复测** | 2 | RetestMgr.test (3) | task-retest.spec (2) | R1-tk1 |
| P1-7 | **CAPA闭环** + QA签名 | 2 | CAPAFlow.test (3) | qc-capa.spec (2) | R1-qc1, R2-sig |
| P1-8 | **跨模块追溯视图** | 2 | TraceView.test (2) | trace-view.spec (1) | R2-scenario |

**Phase 1 测试增量: Vitest +23, E2E +14**

### 🟡 Phase 2: 差异化增强 (14天 + 4天全局 = 18天)

| # | 功能 | 天 | Vitest | E2E | Review项 |
|---|------|:--:|:---:|:---:|------|
| G3 | 审计日志补全 | 2 | - | audit-compliance.spec (2) | R2-audit |
| G4 | 电子签名补全 | 2 | SignatureFlow.test (3) | sign-scenarios.spec (2) | R2-sig |
| P2-1 | 样品异常接收流程 | 2 | AbnormalReceive.test (2) | sample-abnormal.spec (1) | R1-sm3 |
| P2-2 | 质控样独立台账 | 2 | QCMaterial.test (3) | qc-material.spec (1) | R1-qc2 |
| P2-3 | 期间核查 | 2 | InterimCheck.test (2) | instrument-check.spec (1) | R1-in1 |
| P2-4 | 设备预约冲突检测 | 2 | BookingConflict.test (2) | schedule-conflict.spec (1) | R1-in2 |
| P2-5 | ELN草稿自动保存 + 断网恢复 | 2 | AutoSave.test (2) | eln-autosave.spec (1) | R2-eln |
| P2-6 | 派工预览 + 拖拽 | 2 | DispatchPreview.test (2) | dispatch-dnd.spec (1) | R1-dp1 |
| P2-7 | L-J质控图内联 | 1 | QCChart.test (2) | qc-chart.spec (1) | R1-qc3 |
| P2-8 | 权限矩阵可编辑 | 2 | PermissionMatrix.test (3) | rbac-edit.spec (1) | R1-rbac |

**Phase 2 测试增量: Vitest +21, E2E +12**

### 🟢 Phase 3: 完善体验 (10天 + 2天全局 = 12天)

| # | 功能 | 天 | Vitest | E2E |
|---|------|:--:|:---:|:---:|
| G5 | 状态联动规则 | 2 | StateFlow.test (3) | - |
| P3-1 | 角色差异化看板 | 2 | RoleDashboard.test (2) | role-dashboard.spec (1) |
| P3-2 | 客户门户增强 | 2 | PortalEnhanced.test (2) | portal-order.spec (1) |
| P3-3 | COC报告导出+扫码 | 2 | COCExport.test (2) | coc-export.spec (1) |
| P3-4 | 批次管理 | 2 | BatchMgr.test (2) | batch-flow.spec (1) |

**Phase 3 测试增量: Vitest +11, E2E +4**

### 🔵 技术债务 (5天 — 与Phase 2并行)

| # | 任务 | 天 |
|---|------|:--:|
| T1 | ReportsPage 拆分 (1672行→ReportList+ReportDetail+ReportEdit) | 3 |
| T2 | 提取通用组件 (StatCards/TableActions/FilterBar/DetailDrawer) | 2 |
| G6 | ALCOA+ 修正 + 统一数据获取层 | 2 |

---

## 四、全量测试计划

### 4.1 Vitest 详细分配

| Phase | 测试文件 | 用例数 | 状态 |
|:---:|------|:---:|:---:|
| 现有 | DynamicFieldRenderer + i18nStore + permissionStore + SignaturePad + BarcodeLabel + BatchActions + ReportWatermark | 35 | ✅ |
| P1 | AlertPanel + AliquotManager + RetentionMgr + ReportVoid + Distribution + RetestMgr + CAPAFlow + TraceView | 23 | ⬜ |
| P2 | SignatureFlow + AbnormalReceive + QCMaterial + InterimCheck + BookingConflict + AutoSave + DispatchPreview + QCChart + PermissionMatrix | 21 | ⬜ |
| P3 | StateFlow + RoleDashboard + PortalEnhanced + COCExport + BatchMgr | 11 | ⬜ |
| **总计** | | **90** | 35+55 |

### 4.2 Playwright 详细分配

| Phase | 测试文件 | 用例数 | 状态 |
|:---:|------|:---:|:---:|
| 现有 | core-workflows(6) + phase2-features(2) + button-audit(2) | 10 | ✅ |
| P1 | dashboard-alerts + sample-aliquot + sample-retention + report-void + report-dist + task-retest + qc-capa + trace-view | 14 | ⬜ |
| P2 | audit-compliance + sign-scenarios + sample-abnormal + qc-material + instrument-check + schedule-conflict + eln-autosave + dispatch-dnd + qc-chart + rbac-edit | 12 | ⬜ |
| P3 | role-dashboard + portal-order + coc-export + batch-flow | 4 | ⬜ |
| **总计** | | **40** | 10+30 |

### 4.3 合规测试 (手动 + 自动化)

| # | 测试场景 | 类型 | Phase |
|---|---------|:---:|:---:|
| C1 | 审计日志: 委托/样品/报告/ELN 所有操作有日志 | 自动化 | P2 |
| C2 | 电子签名: 含时间戳+含义+证书, 不可否认 | 手动 | P1 |
| C3 | 原始数据保护: ELN提交后不可修改 | 自动化 | P2 |
| C4 | 权限分离: 检测员不可签发报告 | 自动化 | P2 |
| C5 | 密码策略: 过期+锁定+历史不可重复 | 自动化 | P2 |
| C6 | 数据删除审计: 任何删除有完整审计 | 手动 | P2 |
| C7 | 编号唯一性: 并发创建不重复 | 自动化 | P1 |
| C8 | 时间戳不可篡改: 所有时间由服务端生成 | 手动 | P2 |

---

## 五、依赖关系图

```
G1(编号) G2(时间)
    ↓         ↓
P1-1(预警)  P1-2(分样)  P1-4(作废)  P1-6(复测)
    ↓         ↓           ↓           ↓
P3-1(角色) P1-3(留样)  P1-5(分发)  P1-7(CAPA)
                ↓           ↓           ↓
            P2-1(异常)  P1-8(追溯)  P2-2(台账)
                              ↓
                          G3(审计) G4(签名) G5(联动)
                              ↓         ↓         ↓
                          P2-5(ELN) P2-8(RBAC) P3-4(批次)
                              ↓
                          P2-6(派工) P2-7(质控图) P2-3(核查) P2-4(预约)
                              ↓
                          P3-2(门户) P3-3(COC)
```

---

## 六、验收里程碑

| 里程碑 | 触发条件 | 验收标准 |
|------|------|------|
| M1: P1完成 | 8功能 + G1+G2 | Vitest 58/58 · E2E 24/24 · TS零错误 |
| M2: P2完成 | 8功能 + G3+G4 | Vitest 79/79 · E2E 36/36 · 合规8项通过 |
| M3: P3完成 | 5功能 + G5+G6 | Vitest 90/90 · E2E 40/40 · 全路由200 |
| M4: 发布就绪 | 技术债完成 | Lighthouse≥90 · 兼容性4/4 · 45路由全200 |
