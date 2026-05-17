# HC-LIMS 设计文档目录

## 目录结构

```
docs/
├── README.md                     ← 本文件
├── reports/                      ← 分析报告
├── design/                       ← 系统设计
│   └── gap-plans/               ← 功能差距分析（按阶段）
├── modules/                      ← 模块设计
├── features/                     ← 功能专题设计
└── flows/                        ← 业务流程
```

## 一、分析报告 (`reports/`)

| 文档 | 说明 |
|------|------|
| [COMPLETION_REPORT.md](reports/COMPLETION_REPORT.md) | 开发完成报告（覆盖率、功能对照） |
| [DEVIATION_ANALYSIS.md](reports/DEVIATION_ANALYSIS.md) | 偏差分析 |
| [GAP_ANALYSIS_REPORT.md](reports/GAP_ANALYSIS_REPORT.md) | 功能差距分析 |
| [GAP_IMPLEMENTATION_PLAN.md](reports/GAP_IMPLEMENTATION_PLAN.md) | 差距实施计划 |
| [LIMS_COMPETITIVE_ANALYSIS.md](reports/LIMS_COMPETITIVE_ANALYSIS.md) | 竞品分析（金现代等） |
| [TEST_REPORT.md](reports/TEST_REPORT.md) | 测试报告 |
| [WORKFLOW_ANALYSIS.md](reports/WORKFLOW_ANALYSIS.md) | 工作流分析 |

## 二、系统设计 (`design/`)

| 文档 | 说明 |
|------|------|
| [SYSTEM_DESIGN.md](design/SYSTEM_DESIGN.md) | 系统总体设计 |
| [FRONTEND_DESIGN_SPEC.md](design/FRONTEND_DESIGN_SPEC.md) | 前端设计规范 |
| [ROADMAP.md](design/ROADMAP.md) | 产品路线图 |
| [gap-plans/](design/gap-plans/) | 功能差距分析（Phase 1-4） |

## 三、模块设计 (`modules/`)

### 核心模块

| 文档 | 模块 |
|------|------|
| [01-dashboard.md](modules/01-dashboard.md) | 首页 Dashboard |
| [02-sample-management.md](modules/02-sample-management.md) | 样品管理 |
| [03-test-management.md](modules/03-test-management.md) | 检测管理 |
| [04-report-management.md](modules/04-report-management.md) | 报告管理 |
| [05-quality-control.md](modules/05-quality-control.md) | 质量控制 |
| [06-instrument-management.md](modules/06-instrument-management.md) | 仪器管理 |
| [07-inventory-management.md](modules/07-inventory-management.md) | 库存管理 |
| [08-method-management.md](modules/08-method-management.md) | 方法管理 |
| [09-personnel-management.md](modules/09-personnel-management.md) | 人员与培训 |
| [10-client-contract.md](modules/10-client-contract.md) | 客户与合同管理 |

### 科研模块

| 文档 | 模块 |
|------|------|
| [01-research-group.md](modules/01-research-group.md) | 课题组管理 |
| [02-research-project.md](modules/02-research-project.md) | 研究项目管理 |
| [03-eln.md](modules/03-eln.md) | 电子实验记录 ELN |
| [04-reservation.md](modules/04-reservation.md) | 仪器共享预约 |
| [05-teaching.md](modules/05-teaching.md) | 教学实验管理 |
| [06-achievement.md](modules/06-achievement.md) | 成果管理 |

### 系统模块

| 文档 | 模块 |
|------|------|
| [01-system-management.md](modules/01-system-management.md) | 系统管理 |
| [02-other-modules.md](modules/02-other-modules.md) | 其他模块 |

## 四、功能设计 (`features/`)

| 文档 | 说明 |
|------|------|
| [BUSINESS_MGMT.md](BUSINESS_MGMT.md) | 商务管理（客户、合同、报价、委托单） |
| [CUSTOMER_PORTAL_DESIGN.md](CUSTOMER_PORTAL_DESIGN.md) | 客户自助门户设计 |
| [MOBILE_SAMPLING.md](MOBILE_SAMPLING.md) | 移动采样系统设计 |

## 五、业务流程 (`flows/`)

| 文档 | 说明 |
|------|------|
| [01-登录与认证.md](flows/01-登录与认证.md) | 登录与认证流程 |
| [02-首页Dashboard.md](flows/02-首页Dashboard.md) | 首页信息流 |
| [03-样品管理.md](flows/03-样品管理.md) | 样品管理流程 |
| [04-检测管理.md](flows/04-检测管理.md) | 检测管理流程 |
| [05-报告管理.md](flows/05-报告管理.md) | 报告管理流程 |
| [06-质量控制.md](flows/06-质量控制.md) | 质量控制流程 |
| [07-仪器管理.md](flows/07-仪器管理.md) | 仪器管理流程 |
| [99-UI还原度验证.md](flows/99-UI还原度验证.md) | UI 还原度验证 |
