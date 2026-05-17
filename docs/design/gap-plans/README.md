# 差距功能补全 — 设计文档索引

> 基于 [LIMS_COMPETITIVE_ANALYSIS.md](../../../../LIMS_COMPETITIVE_ANALYSIS.md) 的对标分析
> 开发前请先阅读对应的设计文档

---

## 第一阶段 — 基础补齐 (T+0~2月)

| 优先级 | 功能 | 设计文档 | 估算 |
|:------:|------|---------|:----:|
| 🔴 P0 | 电子签名(国密SM2/SM3) | [P0-01-electronic-signature.md](./phase1/P0-01-electronic-signature.md) | 3周 |
| 🔴 P0 | COC 监管链 | [P0-02-coc-chain.md](./phase1/P0-02-coc-chain.md) | 2周 |
| 🔴 P0 | 自定义字段/动态表单 | [P0-03-dynamic-form.md](./phase1/P0-03-dynamic-form.md) | 4周 |
| 🟢 P1 | 条码批量打印 | [P1-01-barcode-printing.md](./phase1/P1-01-barcode-printing.md) | 1周 |
| 🟢 P1 | 数据备份/恢复 | [P1-02-data-backup.md](./phase1/P1-02-data-backup.md) | 1周 |
| 🟢 P1 | 批量操作增强 | [P1-03-batch-ops.md](./phase1/P1-03-batch-ops.md) | 2周 |

## 第二阶段 — 核心增强 (T+2~4月)

| 优先级 | 功能 | 设计文档 | 估算 |
|:------:|------|---------|:----:|
| 🟡 P1 | 工作流引擎 | [P1-04-workflow-engine.md](./phase2/P1-04-workflow-engine.md) | 6周 |
| 🟡 P1 | 仪器数据直连(基础版) | [P1-05-instrument-integration-basic.md](./phase2/P1-05-instrument-integration-basic.md) | 6周 |
| 🟡 P1 | 多语言 (i18n) | [P1-06-i18n.md](./phase2/P1-06-i18n.md) | 3周 |
| 🟡 P1 | 报告水印 + 防伪 | [P1-07-watermark.md](./phase2/P1-07-watermark.md) | 1周 |
| 🟡 P1 | 质控数据生产化 | [P1-08-qc-production.md](./phase2/P1-08-qc-production.md) | 2周 |
| 🟢 P2 | 能力验证管理 | [P2-01-proficiency-testing.md](./phase2/P2-01-proficiency-testing.md) | 2周 |

## 第三阶段 — 生产就绪 (T+4~8月)

| 优先级 | 功能 | 设计文档 | 估算 |
|:------:|------|---------|:----:|
| 🟡 P1 | 报表引擎 | [P1-09-report-engine.md](./phase3/P1-09-report-engine.md) | 8周 |
| 🟡 P1 | 移动端(小程序/H5) | [P1-10-mobile.md](./phase3/P1-10-mobile.md) | 6周 |
| 🟡 P1 | 完整仪器管理(Phase 2) | [P1-11-instrument-phase2.md](./phase3/P1-11-instrument-phase2.md) | 6周 |
| 🟢 P2 | 仪器数据直连(高级版) | [P2-02-instrument-integration-advanced.md](./phase3/P2-02-instrument-integration-advanced.md) | 12周 |
| 🟢 P2 | 系统监控/告警 | [P2-03-system-monitoring.md](./phase3/P2-03-system-monitoring.md) | 1周 |
| 🟢 P2 | LDAP/SSO 集成 | [P2-04-ldap-sso.md](./phase3/P2-04-ldap-sso.md) | 1周 |

## 第四阶段 — 差异化优势 (T+8~12月)

| 优先级 | 功能 | 设计文档 | 估算 |
|:------:|------|---------|:----:|
| 🟢 P2 | 移动 APP (原生) | [P2-05-mobile-app.md](./phase4/P2-05-mobile-app.md) | 12周 |
| 🟢 P2 | 21 CFR Part 11 合规 | [P2-06-21cfr-part11.md](./phase4/P2-06-21cfr-part11.md) | 6周 |
| 🟢 P3 | AI/ML 辅助决策 | [P3-01-ai-ml.md](./phase4/P3-01-ai-ml.md) | 12周 |
| 🟢 P3 | BI 看板 | [P3-02-bi-dashboard.md](./phase4/P3-02-bi-dashboard.md) | 8周 |
| 🟢 P3 | 企业集成总线 | [P3-03-enterprise-bus.md](./phase4/P3-03-enterprise-bus.md) | 12周 |

---

**总计: 20 个设计文档 | 估算: ~50 人周**
