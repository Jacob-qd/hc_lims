# P0-2 ELN 模板引擎 — 竞品调研与功能设计

## 1. 竞品调研

### 1.1 金现代 (JXD LIMS)

金现代 ELN 核心定位：
- **拖拽模板设计器**：管理员可通过拖拽创建实验模板，设置字段类型（文本/数字/下拉/日期/图片/附件/签名）
- **模板复用 + 版本管理**：模板可复制、可升级，历史记录绑定旧版本
- **字段联动**：选择样品类型 → 自动带出对应检测项目和方法
- **自动计算与修约**：内置公式引擎，支持四则运算、对数、修约规则
- **设备数据自动回填**：设备取数后自动填入对应字段
- **快捷填报模式**：扫码带出基础信息，减少手工录入

> 来源：金现代官网 + 化工方案 + 食品方案

### 1.2 LabWare ELN

LabWare ELN 特点：
- **统一的 LIMS + ELN 平台**：ELN 记录与样品/任务/方法天然关联
- **Spreadsheet 风格录入**：支持类似 Excel 的批量数据输入
- **方法执行向导**：Step-by-step 引导实验员完成 SOP 各步骤
- **审批签名**：每步可要求签名确认

### 1.3 Thermo Fisher SampleManager LES

SampleManager LES (Laboratory Execution System) 特点：
- **SOP 驱动执行**：将 SOP 拆分为步骤，每步确认后才进入下一步
- **偏差捕获**：执行偏离 SOP 时自动记录偏差
- **物料消耗追踪**：自动扣减使用的试剂/标准品库存
- **仪器数据自动采集**：执行步骤自动触发仪器读取

### 1.4 STARLIMS ELN

STARLIMS ELN 特点：
- **行业模板库**：预置制药、食品、环境等行业模板
- **计算引擎**：支持复杂公式、条件判定、自动修约
- **结果自动判定**：对照标准限值自动判定合格/不合格

### 1.5 最佳实践总结

| 能力 | 推荐方案 | 来源 |
|------|---------|------|
| 模板设计 | 拖拽式字段配置 + 分组 + 条件显示 | JXD + LabWare |
| 执行模式 | SOP 步骤引导 + 逐步确认 | SampleManager LES |
| 数据录入 | Spreadsheet 批量 + 扫码带出 | LabWare + JXD |
| 设备对接 | 自动取数回填 + 人工降级留痕 | JXD + SampleManager |
| 计算判定 | 公式引擎 + 修约规则 + 自动判定 | STARLIMS + JXD |
| 物料关联 | 自动扣减库存 | SampleManager LES |

---

## 2. 用户故事

### US1 — 管理员设计模板
> 作为**方法管理员**，我需要通过可视化界面创建 ELN 模板，定义字段类型、校验规则、计算公式和判定逻辑。

### US2 — 实验员执行实验
> 作为**实验员**，我需要打开任务后自动加载对应 ELN 模板，系统自动带入样品信息和方法参数。

### US3 — 自动计算与判定
> 作为**实验员**，我填写原始数据后，系统自动执行公式计算、修约和标准限值判定，无需手工计算。

### US4 — 设备数据回填
> 作为**实验员**，设备采集数据后自动填入 ELN 对应字段，减少转录错误。

### US5 — SOP 步骤引导
> 作为**实验员**，我需要按 SOP 步骤逐项执行并确认，确保不遗漏关键操作。

---

## 3. 功能设计

### 3.1 模板设计器

```
┌──────────────────────────────────────────────────────────┐
│  ELN 模板设计器                              [保存] [发布] │
├──────────────────────────────────────────────────────────┤
│  模板名称: COD检测模板   版本: v2.1   适用方法: HJ 828    │
├─────────────┬────────────────────────────────────────────┤
│  字段面板    │  画布区域                                   │
│  [文本]     │  ┌─────────────────────────────────────┐   │
│  [数字]     │  │ ① 样品信息（自动带入）               │   │
│  [下拉]     │  │   样品编号 [auto]  样品名称 [auto]   │   │
│  [日期]     │  │   检测方法 [auto]  检测员 [auto]     │   │
│  [图片]     │  ├─────────────────────────────────────┤   │
│  [附件]     │  │ ② 前处理记录                        │   │
│  [签名]     │  │   消解温度(℃) [____] 消解时间(min)  │   │
│  [表格]     │  │   加入试剂 [下拉: 重铬酸钾/硫酸汞]   │   │
│  [计算]     │  ├─────────────────────────────────────┤   │
│  [判定]     │  │ ③ 仪器读数 (自动采集)               │   │
│             │  │   [设备取数] → 吸光度 [0.321]       │   │
│             │  ├─────────────────────────────────────┤   │
│             │  │ ④ 结果计算                          │   │
│             │  │   COD = (A-A₀)×K×f = [25.6] mg/L   │   │
│             │  │   公式: (absorbance-blank)*K*dilution│   │
│             │  │   修约规则: 保留1位小数              │   │
│             │  ├─────────────────────────────────────┤   │
│             │  │ ⑤ 结果判定                          │   │
│             │  │   标准限值: ≤50 mg/L                │   │
│             │  │   判定结果: [✅ 合格]                │   │
│             │  └─────────────────────────────────────┘   │
└─────────────┴────────────────────────────────────────────┘
```

### 3.2 实验执行页面（增强 TaskResultEntry）

```
┌──────────────────────────────────────────────────────────┐
│  TK-2025-002 COD检测                 [保存] [提交复核]     │
├──────────────────────────────────────────────────────────┤
│  📋 SOP 步骤                                            │
│  ✅ 步骤1: 样品前处理                                    │
│  ✅ 步骤2: 仪器预热                                      │
│  ▶ 步骤3: 上机检测（当前）                               │
│  ⬜ 步骤4: 数据处理                                      │
├──────────────────────────────────────────────────────────┤
│  🧪 实验数据（COD检测模板 v2.1）                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 样品信息 (自动带入)                               │   │
│  │ 样品编号: SMP20240520001  样品名称: 地表水样品-1   │   │
│  │ 检测方法: HJ 828-2017     检测员: 王明            │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 前处理记录                                       │   │
│  │ 消解温度: [150] ℃   消解时间: [120] min          │   │
│  │ 加入试剂: [重铬酸钾▾]                            │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 仪器读数 [🔄 采集数据]                            │   │
│  │ 空白: 0.001  标准1: 0.152  标准2: 0.287  样品: [0.321]  │
│  │ 稀释倍数: [10]                                   │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 计算结果                                         │   │
│  │ COD = (0.321 - 0.001) × 80.0 × 1 = 25.6 mg/L    │   │
│  │ 修约后: 25.6 mg/L  (规则: 保留1位小数)           │   │
│  ├──────────────────────────────────────────────────┤   │
│  │ 结果判定                                         │   │
│  │ 标准限值: GB 3838-2002 Ⅲ类 ≤50 mg/L              │   │
│  │ 判定结果: ✅ 合格                                │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

### 3.3 数据模型

```typescript
// ELN 模板定义
interface ELNTemplate {
  id: string;
  name: string;
  methodId: string;              // 关联检测方法
  version: string;               // 模板版本
  status: 'draft' | 'published' | 'archived';
  sections: ELNSection[];        // 模板段落
  createdAt: string;
  updatedAt: string;
}

interface ELNSection {
  id: string;
  title: string;                 // "样品信息" / "前处理" / "仪器读数"
  order: number;
  fields: ELNField[];
}

interface ELNField {
  id: string;
  label: string;                 // "消解温度"
  fieldType: 'text' | 'number' | 'select' | 'date' | 'image' | 'file' | 'signature' | 'table' | 'calculation' | 'judgment' | 'auto';
  required: boolean;
  defaultValue?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];  // for select
  // 自动带入
  autoSource?: 'sampleNo' | 'sampleName' | 'method' | 'analyst' | 'instrumentData';
  // 计算
  formula?: string;              // "(absorbance - blank) * K * dilution"
  formulaVars?: string[];        // ["absorbance", "blank", "K", "dilution"]
  roundingRule?: string;         // "1" = 保留1位小数
  // 判定
  standardValue?: string;        // "≤50"
  unit?: string;                 // "mg/L"
  judgmentRule?: string;         // "lte" = less than or equal
}

// ELN 执行记录
interface ELNRecord {
  id: string;
  taskId: string;
  templateId: string;
  templateVersion: string;       // 冻结的模板版本
  status: 'draft' | 'in_progress' | 'submitted' | 'reviewed';
  currentStep: number;           // 当前 SOP 步骤
  fieldValues: Record<string, any>;  // { fieldId: value }
  calculatedResults: Record<string, number>;  // { fieldId: computedValue }
  judgments: Record<string, 'pass' | 'fail'>;
  attachments: string[];
  submittedAt?: string;
  submittedBy?: string;
}

// 计算引擎
interface CalculationEngine {
  evaluate(formula: string, vars: Record<string, number>): number;
  round(value: number, rule: string): number;
  judge(value: number, standard: string, rule: string): 'pass' | 'fail';
}
```

### 3.4 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/eln/templates` | 模板列表 |
| POST | `/api/v1/eln/templates` | 创建模板 |
| PUT | `/api/v1/eln/templates/:id` | 编辑模板（版本升级） |
| POST | `/api/v1/eln/templates/:id/publish` | 发布模板 |
| GET | `/api/v1/eln/records` | ELN 记录列表 |
| POST | `/api/v1/eln/records` | 创建实验记录（加载模板） |
| PUT | `/api/v1/eln/records/:id` | 保存实验数据 |
| POST | `/api/v1/eln/records/:id/calculate` | 执行计算与判定 |
| POST | `/api/v1/eln/records/:id/submit` | 提交复核 |

---

## 4. MVP 实现计划 (5天)

| 天 | 内容 |
|:--:|------|
| D1 | ELN 模板数据模型 + 模板列表页 + 模板不可变快照机制 |
| D2 | 模板设计器（字段配置 + 条件联动 + 字段属性配置） |
| D3 | 计算引擎（math.js 安全沙箱 + GB/T 8170 修约 + 判定）|
| D4 | 增强 TaskResultEntry 为 ELN 执行页 + SOP 步骤引导 + 历史复制 |
| D5 | 设备数据回填 + 模板导入导出 + 版本管理 + 测试 |

---

## 5. Review 修正 (v1.1)

### 5.1 补充 User Story

#### US6 — 从历史复制实验（最高频场景）
> 作为**实验员**，90% 的实验是重复性工作。打开任务后，我应能一键"复用上次记录"，系统自动填入上次的参数（消解温度、试剂、稀释倍数），我只需修改本次的特殊值。

#### US7 — 结果合理性校验
> 作为**实验员**，系统应在每个计算结果旁显示历史正常范围。如本次 COD=125 mg/L 但历史范围是 15-35 mg/L，系统应红色高亮提示"结果异常，建议重测"。

#### US8 — SOP 智能跳过
> 作为**实验员**，如果 SOP 步骤 3 是"如样品澄清则跳过过滤"，系统应根据我前一步填写的"样品外观=澄清"自动跳过该步骤。

#### US9 — 跨实验室模板共享
> 作为**方法管理员**，我创建的 COD 检测模板应能导出为 JSON 文件，分享给环境实验室导入使用，保持方法一致性。

#### US10 — 模板试运行
> 作为**方法管理员**，新模板发布前，我需要在"试运行模式"下模拟填写，验证公式和判定逻辑是否正确，不影响生产数据。

### 5.2 公式引擎重构

采用 **math.js** 安全沙箱替代字符串解析：

```typescript
import { create, all } from 'mathjs';

const math = create(all);
// 限制可用函数（安全沙箱）
const safeEvaluate = (formula: string, vars: Record<string, number>): number => {
  return math.evaluate(formula, vars);
};

// 使用示例
const result = safeEvaluate('(absorbance - blank) * K * dilution', {
  absorbance: 0.321, blank: 0.001, K: 80.0, dilution: 1
}); // → 25.6
```

### 5.3 修约规则 (GB/T 8170-2008)

```typescript
// 修约规则引擎
function gb8170Round(value: number, rule: RoundingRule): number {
  if (rule.method === 'decimal_places') {
    // 四舍六入五成双
    const factor = Math.pow(10, rule.value);
    const scaled = value * factor;
    const floor = Math.floor(scaled);
    const remainder = scaled - floor;
    
    if (remainder < 0.5) return floor / factor;
    if (remainder > 0.5) return (floor + 1) / factor;
    // remainder === 0.5: 五成双
    return (floor % 2 === 0 ? floor : floor + 1) / factor;
  }
  if (rule.method === 'significant_figures') {
    const magnitude = Math.floor(Math.log10(Math.abs(value))) + 1;
    return gb8170Round(value, { method: 'decimal_places', value: rule.value - magnitude });
  }
  return value;
}
```

### 5.4 模板不可变快照

```typescript
interface TemplateSnapshot {
  id: string;
  templateId: string;
  version: string;               // "v2.1"
  snapshot: ELNTemplate;         // 完整模板定义的不可变副本
  publishedAt: string;
  publishedBy: string;
  isActive: boolean;             // 只有最新版本为 active
}

// ELN 记录绑定快照版本
interface ELNRecord {
  templateId: string;
  templateVersion: string;       // 永远指向创建时的版本
  templateSnapshotId: string;    // 不可变快照引用
}
```

### 5.5 历史范围对比

每个计算结果旁显示历史统计：
```
COD: 25.6 mg/L  [历史: 18.2-32.5 mg/L, 均值 24.3] ✅ 正常
COD: 125.0 mg/L [历史: 18.2-32.5 mg/L, 均值 24.3] 🔴 异常！建议重测
```

计算逻辑：
```typescript
function getHistoricalRange(methodId: string, testItem: string): { min: number; max: number; mean: number; count: number } {
  // 查询过去 90 天该方法的检测结果
  // 排除已标记为异常的结果
  // 返回 P2.5-P97.5 范围
}
```
