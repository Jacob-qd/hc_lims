# P0-4 质控方案配置 — 竞品调研与功能设计

## 1. 竞品调研

### 1.1 金现代 (JXD LIMS)

金现代质控方案核心能力：
- **质控方案配置**：空白样、平行样、加标回收、质控样四种类型可自由组合
- **质控样自动插入**：系统按照配置的频率自动在样品序列中插入质控样
- **SPC 判异**：支持 Westgard 规则，化工方案强调"秒级判异"
- **质控图自动生成**：从真实数据源读取，自动绘制 L-J 图
- **异常预警闭环**：1 分钟预警 → 冻结 → 根因分析 → CAPA

> 来源：金现代化工方案 + 环境监测方案

### 1.2 LabWare QC

LabWare QC 特点：
- **Stability Study**：长期稳定性考察，支持多时间点取样
- **Control Sample Management**：质控样品独立台账（批次/浓度/有效期）
- **Trend Analysis**：多维度趋势分析（按仪器/方法/人员/时间）

### 1.3 STARLIMS QC

STARLIMS QC 特点：
- **Integrated QC**：QC 与样品检测流程深度结合，不可跳过
- **Automatic Hold**：QC 失败自动冻结相关样品结果
- **Multi-rule Evaluation**：支持 Westgard 全规则（1₂s/1₃s/2₂s/R₄s/4₁s/10x）

### 1.4 Thermo Fisher SampleManager

SampleManager QC 特点：
- **QC 与 Instrument 深度绑定**：仪器校准失效 → 自动冻结该仪器所有结果
- **SQC (Statistical QC)**：内置统计分析引擎
- **QC Scheduling**：按日历自动生成 QC 检测计划

### 1.5 最佳实践总结

| 能力 | 推荐方案 | 来源 |
|------|---------|------|
| 质控类型 | 空白 + 平行 + 加标 + 质控样 + 重复样 | JXD + STARLIMS |
| 插入策略 | 按频率自动插入（每 10 样 + 1 质控） | JXD |
| 判异规则 | Westgard 全规则 + 自定义限值 | STARLIMS + JXD |
| 异常处理 | 自动冻结 → 通知 QA → CAPA 闭环 | STARLIMS + JXD |
| 质控图 | L-J 图 + 多维度趋势 | LabWare + JXD |
| 质控样品管理 | 独立台账 + 批次追踪 | LabWare |

---

## 2. 功能设计

### 2.1 质控方案配置

```
┌──────────────────────────────────────────────────────────┐
│  质控方案配置                              [+ 新建方案]    │
├──────────────────────────────────────────────────────────┤
│  方案名称: 水质检测标准QC方案                             │
│  适用方法: HJ 828-2017 (COD)                             │
│  适用实验室: 理化实验室                                   │
├──────────────────────────────────────────────────────────┤
│  QC 类型配置                                              │
│  ┌──────────────────────────────────────────────────┐    │
│  │ ☑ 空白样 (Blank)                                 │    │
│  │   频率: 每批次开始 + 每20个样品                   │    │
│  │   判定: 空白值 ≤ 检出限                           │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ ☑ 平行样 (Duplicate)                             │    │
│  │   频率: 每10个样品                                │    │
│  │   判定: RPD ≤ 20%                                 │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ ☑ 加标回收 (Spike)                               │    │
│  │   频率: 每批次1次                                 │    │
│  │   加标浓度: 25 mg/L                               │    │
│  │   判定: 回收率 80%-120%                           │    │
│  ├──────────────────────────────────────────────────┤    │
│  │ ☑ 质控样 (CRM)                                   │    │
│  │   质控样品: COD标准溶液 (25.0±2.5 mg/L)           │    │
│  │   频率: 每批次1次                                 │    │
│  │   判定: 测定值在证书范围内                        │    │
│  └──────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────┤
│  判异规则 (Westgard)                                      │
│  ┌──────────────────────────────────────────────────┐    │
│  │ ☑ 1₂s 警告   ☑ 1₃s 失控   ☑ 2₂s 失控           │    │
│  │ ☑ R₄s 失控   ☑ 4₁s 失控   ☑ 10x 失控           │    │
│  │ 控制限: ±2s 警告限  ±3s 行动限                   │    │
│  └──────────────────────────────────────────────────┘    │
├──────────────────────────────────────────────────────────┤
│  异常处理                                                 │
│  ☑ QC 失败自动冻结相关样品结果                            │
│  ☑ 自动通知 QA 主管                                      │
│  ☑ 触发偏差/OOS 流程                                     │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Westgard 规则引擎

```typescript
// Westgard 规则定义
const westgardRules = {
  '1_2s': {
    name: '1₂s 警告',
    description: '1个质控值超出 ±2s',
    evaluate: (values: number[], mean: number, sd: number) => {
      return values.some(v => Math.abs(v - mean) > 2 * sd);
    },
    action: 'warning'  // 警告，不冻结
  },
  '1_3s': {
    name: '1₃s 失控',
    description: '1个质控值超出 ±3s',
    evaluate: (values: number[], mean: number, sd: number) => {
      return values.some(v => Math.abs(v - mean) > 3 * sd);
    },
    action: 'reject'  // 失控，冻结
  },
  '2_2s': {
    name: '2₂s 失控',
    description: '连续2个质控值同方向超出 ±2s',
    evaluate: (values: number[], mean: number, sd: number) => {
      for (let i = 1; i < values.length; i++) {
        const a = values[i-1] - mean;
        const b = values[i] - mean;
        if (Math.abs(a) > 2*sd && Math.abs(b) > 2*sd && a*b > 0) return true;
      }
      return false;
    },
    action: 'reject'
  },
  'R_4s': {
    name: 'R₄s 失控',
    description: '连续2个质控值之差超出 4s',
    evaluate: (values: number[], mean: number, sd: number) => {
      for (let i = 1; i < values.length; i++) {
        if (Math.abs(values[i] - values[i-1]) > 4 * sd) return true;
      }
      return false;
    },
    action: 'reject'
  },
  '4_1s': {
    name: '4₁s 失控',
    description: '连续4个质控值同方向超出 ±1s',
    evaluate: (values: number[], mean: number, sd: number) => {
      let count = 1;
      for (let i = 1; i < values.length; i++) {
        const a = values[i-1] - mean, b = values[i] - mean;
        if (Math.abs(a) > sd && Math.abs(b) > sd && a*b > 0) {
          count++;
          if (count >= 4) return true;
        } else count = 1;
      }
      return false;
    },
    action: 'reject'
  },
  '10x': {
    name: '10x 失控',
    description: '连续10个质控值在均值同侧',
    evaluate: (values: number[], mean: number, sd: number) => {
      let count = 1;
      for (let i = 1; i < values.length; i++) {
        if ((values[i-1]-mean)*(values[i]-mean) > 0) {
          count++;
          if (count >= 10) return true;
        } else count = 1;
      }
      return false;
    },
    action: 'reject'
  }
};
```

### 2.3 L-J 质控图

```
   3s ┤ · · · · · · · · · · · · · · · · · · · · · · UCL
   2s ┤ · · · · · · · · · · · ·●· · · · · · · · · · · UWL
   1s ┤ · · · · · · ● · · · · · · · · · · · · · · · · 
Mean  ┤ · · · · ·●· · · · ● · · · · · · · · · ·●· · · ───
  -1s ┤ · · · · · · · · · · · · · · · · · · · · · · · 
  -2s ┤ · · · · · · · · · · · · · · · · · · · · · · · LWL
  -3s ┤ · · · · · · · · · · · · · · · · · · · · · · · LCL
       └──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──┬──
         1  2  3  4  5  6  7  8  9 10 11 12 13 14 15
         
  违规标记: ● 第8点超出 2s 警告限 → 触发 1₂s 规则
```

### 2.4 数据模型

```typescript
interface QCPlan {
  id: string;
  name: string;
  methodIds: string[];
  labId: string;
  qcTypes: QCType[];
  westgardRules: string[];
  autoInsert: boolean;
  frequency: number;             // 每 N 个样品插入
  autoReject: boolean;           // 失败自动冻结
  notifyOnFail: boolean;
}

interface QCType {
  type: 'blank' | 'duplicate' | 'spike' | 'crm';
  frequency: number;
  criteria: Record<string, any>;
}

interface QCResult {
  id: string;
  planId: string;
  batchId: string;
  qcType: string;
  measuredValue: number;
  targetValue?: number;
  sd?: number;
  cv?: number;
  recovery?: number;             // 加标回收率
  rpd?: number;                  // 平行样偏差
  westgardViolations: string[];  // ['1_2s', '2_2s']
  status: 'in_control' | 'warning' | 'out_of_control';
  action: 'none' | 'flagged' | 'rejected';
}
```

### 2.5 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/qc/plans` | 质控方案列表 |
| POST | `/api/v1/qc/plans` | 创建方案 |
| GET | `/api/v1/qc/results` | 质控结果列表 |
| POST | `/api/v1/qc/evaluate` | 执行判异 |
| GET | `/api/v1/qc/chart/:methodId` | 质控图数据 |
| POST | `/api/v1/qc/reject` | 冻结相关结果 |

---

## 3. MVP 实现计划 (3天)

| 天 | 内容 |
|:--:|------|
| D1 | QC 方案数据模型 + 方案配置页面 |
| D2 | Westgard 全规则引擎 + L-J 质控图组件 |
| D3 | QC 自动插入逻辑 + 异常冻结 + 集成到 QualityPage |
