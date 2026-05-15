# HC-LIMS Agent Instructions

> 红创实验室信息管理系统 — 中小检测 + 高校科研双场景
> 技术栈: React 19 + TypeScript + Ant Design 5 + MSW Mock
> 状态: Phase 1 完成，67 个差距功能开发中

---

## 📋 项目概况

HC-LIMS 是一个面向中小检测机构和高校科研实验室的开源 LIMS，对标 StarLIMS 和 LabWare。

### 当前架构

```
hc_lims/
├── src/
│   ├── pages/          # 36 个页面组件
│   ├── components/     # 7 个通用组件 (CustomWorkspace/SignaturePad等)
│   ├── stores/         # 5 个状态管理 (auth/i18n/labType/permission/theme)
│   ├── mocks/          # MSW Mock 数据 (data.ts 75KB + handlers.ts)
│   ├── router/         # 路由配置 (含权限守卫)
│   └── utils/          # 工具函数 (export.ts)
├── mayor/rig/design/
│   ├── existing-docs/  # 22 份现有功能设计文档
│   │   ├── core/       # 10 份: 驾驶舱/样品/检测/报告/QC/仪器/库存/方法/人员/客户
│   │   ├── academic/   # 6 份: 课题组/项目/ELN/预约/教学/成果
│   │   └── system/     # 6 份: 系统管理/审计/权限/安全/门户/路由
│   └── gap-plans/      # 20 份差距功能设计文档
│       ├── phase1/     # P0-P1 基础补齐 (6份)
│       ├── phase2/     # P1-P2 核心增强 (6份)
│       ├── phase3/     # P1-P2 生产就绪 (6份)
│       └── phase4/     # P2-P3 差异化优势 (5份)
├── .beads/             # 67 个开发 issue (bd)
├── polecats/           # 工作区
│   ├── chrome/         # Polecat: Chrome
│   └── rust/           # Polecat: Rust
├── dist/               # 构建输出
├── e2e/                # Playwright E2E 测试
└── vitest.config.ts    # Vitest 测试配置
```

---

## 🎯 开发优先级

### 按 issue ID 前缀分组

所有 gap 功能 issue 使用前缀 `hc-`，在 hc_lims 镇中管理。

### 优先级说明

| 优先级 | 数量 | 含义 |
|:------:|:----:|------|
| **P0** | 3 | CNAS/CMA 合规门槛，必须先完成 |
| **P1** | 18 | 核心生产可用性功能 |
| **P2** | 31 | 重要增强功能 |
| **P3** | 15 | 差异化/长期功能 |

### 开发顺序

```
Phase 1: P0 → P1 (基础补齐)
Phase 2: P1-P2 (核心增强)
Phase 3: P1-P2 (生产就绪)
Phase 4: P2-P3 (差异化优势)
```

---

## 📐 每项功能的开发流程

### 1. 开工前

```bash
bd show <hc-xxx>           # 查看 issue 详情（开发目标+验收标准）
```

阅读对应的设计文档（在 `mayor/rig/design/` 中）:
- 差距功能: `mayor/rig/design/gap-plans/phaseN/PX-XX-xxx.md`
- 现有功能参考: `mayor/rig/design/existing-docs/core/XX-xxx.md`

### 2. 实施时

**当前项目无后端**，所有 API 通过 MSW Mock 实现:
- `src/mocks/data.ts` — Mock 数据
- `src/mocks/handlers.ts` — Mock API 处理器

**实现模式:**
```
设计文档 → 数据模型(data.ts) → API路由(handlers.ts) → 页面组件(pages/) → 验收
```

**代码规范:**
- 使用 Ant Design 5 组件库
- 遵循现有代码风格（函数式组件 + hooks）
- 新页面放在 `src/pages/`，新组件放在 `src/components/`
- 新 store 放在 `src/stores/`
- TypeScript 严格模式

### 3. 验收标准

每项功能有明确的验收标准（在 issue description 和设计文档中），**必须全部通过**才能关闭。

### 4. 提交流程

```bash
git add -A
git commit -m "feat: 功能名 (hc-xxx)"
git push origin HEAD
bd close hc-xxx --reason="功能描述"
```

---

## 🧩 模块速查

### 核心模块 (core)

| 模块 | 页面 | 代码行 | 状态 |
|------|------|:------:|:----:|
| 首页驾驶舱 | DashboardPage | 325 | ✅ 完成 |
| 样品管理 | SamplesPage + SampleDetailPage | 592 | ✅ 基础 + 8项待开发 |
| 检测管理 | TasksPage + TaskResultEntry | 409 | ✅ 基础 + 6项待开发 |
| 报告管理 | ReportsPage | 1362 | ✅ 基础 + 6项待开发 |
| 质量控制 | QualityPage | 228 | ✅ 基础 + 10项待开发 |
| 仪器管理 | InstrumentsPage | 245 | ✅ 基础 + 8项待开发 |
| 库存管理 | InventoryPage | 191 | ✅ 基础 + 7项待开发 |
| 方法管理 | MethodsPage | 109 | ✅ 基础 + 5项待开发 |
| 人员管理 | PersonnelPage | 120 | ✅ 基础 + 4项待开发 |
| 客户合同 | ClientsPage + ContractsPage | 232 | ✅ 完成 |

### 高校科研模块 (academic — HC-LIMS 差异化优势)

| 模块 | 页面 | 说明 |
|------|------|------|
| 课题组管理 | ResearchGroupPage | ✅ 完成 (竞品无) |
| 研究项目管理 | ResearchProjectPage | ✅ 完成 (竞品无) |
| 电子实验记录 ELN | ELNPage | ✅ 完成 (竞品需+50-200万) |
| 仪器预约 | ReservationPage | ✅ 完成 (竞品无) |
| 教学实验管理 | TeachingPage | ✅ 完成 (竞品无) |
| 成果管理 | AchievementPage | ✅ 完成 (竞品无) |

### 系统管理模块 (system)

| 模块 | 页面 |
|------|------|
| 系统设置 | SettingsPage |
| 数据字典 | DictPage |
| 审计日志 | AuditLogPage |
| 消息通知 | NotificationPage |
| 安全管理 | SafetyPage |
| 客户门户 | CustomerPortalPage |
| 综合查询 | QueryPage + StatisticsPage |
| 登录 | LoginPage |
| 个人中心 | ProfilePage |

---

## 📁 设计文档索引

### 现有功能设计 (22份)

```
mayor/rig/design/existing-docs/
├── README.md
├── core/    01-dashboard.md ~ 10-client-contract.md
├── academic/  01-research-group.md ~ 06-achievement.md
└── system/  01-system-management.md + 02-other-modules.md
```

### 差距功能设计 (20份)

```
mayor/rig/design/gap-plans/
├── README.md
├── phase1/   P0-01-electronic-signature.md ~ P1-03-batch-ops.md
├── phase2/   P1-04-workflow-engine.md ~ P2-01-proficiency-testing.md
├── phase3/   P1-09-report-engine.md ~ P2-04-ldap-sso.md
└── phase4/   P2-05-mobile-app.md ~ P3-03-enterprise-bus.md
```

每份文档包含: 对标基准 / 功能概述 / 用户故事(含验收标准) / 功能需求 / UI/UX设计 / 数据结构 / API设计 / 技术方案 / 开发计划

---

## 🚀 快速开始

```bash
# 查看当前所有待开发的 gap 功能
bd list --status=open --limit 0

# 查看 P0 优先级
bd list --status=open -l priority:0

# 按模块查看
bd list --status=open --desc-contains "样品管理"

# 查看 issue 详情
bd show <hc-xxx>

# 查看设计文档 (阅读后再开发)
# mayor/rig/design/gap-plans/phase1/P0-02-coc-chain.md

# 查看当前工作在运行的 issue
bd list --status=in_progress

# 完成工作后
bd close <hc-xxx> --reason="完成说明"
```

---

## 🔧 技术注意事项

### Mock 数据
- 所有 API 通过 MSW (Mock Service Worker) 实现
- `src/mocks/data.ts`: 集中管理 Mock 数据
- `src/mocks/handlers.ts`: API 路由处理
- 新增 API 时: 先在 data.ts 加 Mock 数据，再在 handlers.ts 加路由

### 路由
- 路由配置: `src/router/index.tsx`
- 权限守卫: `src/components/RouteGuard.tsx`
- 新页面需在路由配置中注册

### 状态管理
- 使用 Zustand (轻量): `src/stores/`
- 主题: themeStore (亮色/暗黑切换)
- 权限: permissionStore (RBAC)
- 国际化: i18nStore
- 实验室切换: labTypeStore

### 构建
```bash
npm run dev      # 开发服务器
npm run build    # 生产构建
npx vitest run   # 运行测试
```

---

## 📋 会话结束检查清单

```
[ ] 所有代码已提交: git status (clean)
[ ] 已推送远程: git push
[ ] 已关闭完成的 issue: bd close <hc-xxx>
[ ] 未完成的工作已记录在 issue notes 中
[ ] 如果有需要交接的信息: gt mail send mayor/ -s "HANDOFF: xxx"
```

---

*HC-LIMS 项目 | 基于竞品分析文档和 20 份差距功能设计文档驱动开发*
*当前 issue 数: 67 open | 已实现模块: 22 个 | 代码总量: ~8,600 行*
