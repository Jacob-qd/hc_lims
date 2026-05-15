# P1-11 完整仪器管理（Phase 2）

> 对标: LabWare Instrument Lifecycle | StarLIMS Instrument Management
> 版本: v1.0 | 优先级: P1 | 估算: 6周

---

## 1. 功能概述

在现有台账基础上，增加实时监控、期间核查、IQ/OQ/PQ 认证管理、仪器比对、利用率深度分析。

### Phase 2 新增

| 模块 | 功能 | 对标 |
|------|------|------|
| 实时监控 | 运行参数 WebSocket 实时推送 + 异常告警 | StarLIMS 仪器集成 |
| 期间核查 | 核查计划 + 自动提醒 + 结果记录 | ISO 17025 要求 |
| IQ/OQ/PQ | 认证文档管理 + 到期提醒 + 变更追踪 | GMP 要求 |
| 仪器比对 | 多台仪器统计比对 + CV% 分析 | LabWare 比对 |
| 深度分析 | 使用率/空闲时段/成本分析 | StarLIMS BI |

---

## 2. 功能需求

### FR-01: 实时监控

```
架构:
前端 WebSocket ← → Instrument Gateway Service ← → (模拟器/未来仪器)

监控面板:
┌────────────────────────────────────────┐
│  LC-01 液相色谱   🟢 运行中              │
│  当前方法: COD_analysis                 │
│  流速: 1.2 mL/min  柱温: 35°C          │
│  波长: 254 nm      压力: 8.5 MPa       │
│  运行时长: 2h15m   当前样品: S-001      │
│  [压力趋势图 ▼]                         │
└────────────────────────────────────────┘
```

### FR-02: 期间核查

| 核查项 | 周期 | 方法 |
|--------|------|------|
| 外观检查 | 每月 | 目视 + 记录 |
| 性能验证 | 每季 | 标准物质测试 |
| 计量溯源 | 每年 | 外部校准 |
| 软件验证 | 版本升级时 | 功能测试 |

### FR-03: IQ/OQ/PQ 认证

| 阶段 | 内容 | 文档 |
|:----:|------|------|
| IQ | 安装确认：到货检查、安装环境、配件清单 | IQ 报告模板 |
| OQ | 运行确认：功能测试、参数验证 | OQ 报告模板 |
| PQ | 性能确认：实际样品测试、重复性/再现性 | PQ 报告模板 |

---

## 3. API 设计

```
GET    /api/v1/instruments/:id/monitoring           # 实时监控数据
GET    /api/v1/instruments/:id/verification          # 期间核查记录
POST   /api/v1/instruments/:id/verification          # 创建核查记录
GET    /api/v1/instruments/:id/certification         # IQ/OQ/PQ 记录
POST   /api/v1/instruments/:id/certification         # 创建认证记录
GET    /api/v1/instruments/:id/comparison            # 仪器比对数据
GET    /api/v1/instruments/statistics/usage           # 利用率统计
```
