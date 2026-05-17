# P0-03 自定义字段 / 动态表单

> 对标: LabWare Configurable Fields | StarLIMS Dynamic Forms
> 版本: v1.0 | 优先级: P0 | 估算: 4周

---

## 1. 功能概述

将系统中所有硬编码表单替换为基于 JSON Schema 的动态渲染系统。管理员可通过配置界面自定义字段，无需修改代码即可扩展业务数据模型。

### 核心能力

- JSON Schema 驱动的动态表单渲染
- 字段配置管理界面（拖拽排序、属性编辑）
- 条件显示与字段联动
- 字段模板（按样品/检测类型）
- 版本快照（已提交数据使用创建时的配置）

---

## 2. 用户故事

### US-01: 质量主管添加自定义字段
> 作为**质量主管**，检测标准变更后我需要为"水质检测"样品类型添加"COD 稀释倍数"字段，不走开发排期。

### US-02: 检测员使用动态表单
> 作为**检测员**，登记不同样品的表单字段根据样品类型自动变化，我只看到相关的字段。

### US-03: 管理员管理字段模板
> 作为**系统管理员**，我可以在配置界面拖拽排序字段、设置必填和校验规则，并预览效果。

---

## 3. 功能需求

### FR-01: 字段类型

| 类型 | 配置项 | 渲染组件 |
|------|--------|---------|
| 文本 | minLength, maxLength, pattern | Input |
| 多行文本 | maxLength, rows | TextArea |
| 数字 | min, max, decimal, unit | InputNumber |
| 日期 | min, max | DatePicker |
| 日期时间 | 同上 | DateTimePicker |
| 下拉选择 | options (静态/动态) | Select |
| 多选 | options, maxCount | Checkbox |
| 单选 | options | Radio |
| 开关 | — | Switch |
| 文件上传 | accept, maxSize, maxCount | Upload |
| 富文本 | maxLength | RichTextEditor |
| 签名 | — | SignaturePad |
| 关联查询 | targetModule, displayField | AutoComplete |
| 表格子表单 | columns, minRows, maxRows | Table |
| 地理位置 | — | MapPicker |

### FR-02: 条件显示

```typescript
interface ConditionRule {
  field: string;          // 依赖字段
  operator: ConditionOperator;
  value: unknown;
  logic: 'AND' | 'OR';
}

type ConditionOperator = 
  | 'eq'           // 等于
  | 'neq'          // 不等于
  | 'gt'           // 大于
  | 'gte'          // 大于等于
  | 'lt'           // 小于
  | 'lte'          // 小于等于
  | 'in'           // 包含于
  | 'notIn'        // 不包含于
  | 'contains'     // 包含文本
  | 'startsWith'   // 以…开头
  | 'endsWith'     // 以…结尾
  | 'empty'        // 为空
  | 'notEmpty';    // 不为空
```

### FR-03: 字段联动

- 下拉 A 的选择影响下拉 B 的选项列表
- 例: 选择"水质"后，"检测项目"下拉只显示水质相关项目
- 联动数据源: 数据字典 / API 查询 / 固定映射表

### FR-04: 字段模板

- 按模块 + 业务类型预定义字段集
- 创建业务数据时选择模板 → 加载对应字段
- 模板可 clone 修改 → 另存为新模板
- 模板有版本号，修改后不影响已提交数据

---

## 4. UI/UX 设计

### 4.1 字段配置界面

```
┌──────────────────────────────────────────────────┐
│  自定义字段配置 → 样品管理                        │
│                                                   │
│  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ 字段列表      │  │ 字段属性编辑              │  │
│  │               │  │                          │  │
│  │ ⠿ 样品名称    │  │ 标识: sampleName         │  │
│  │ ⠿ 样品类型    │  │ 标签: 样品名称            │  │
│  │ ⠿ 采样地点    │  │ 类型: [文本 ⬇]           │  │
│  │ ⠿ 采样日期    │  │ 必填: [✅]               │  │
│  │ ⠿ 样品性状    │  │ 排序: 1                  │  │
│  │ ⠿ 包装方式    │  │ 默认值:                  │  │
│  │ ⠿ 温度要求    │  │                          │  │
│  │   [+] 添加字段│  │ 校验规则:                │  │
│  │               │  │ 最大长度: [100]          │  │
│  │               │  │ 正则: [^\\u4e00-\\u9fa5]│  │
│  │               │  │                          │  │
│  │               │  │ 分组: [基本信息 ⬇]       │  │
│  │               │  │                          │  │
│  │               │  │ 条件显示:                │  │
│  │               │  │ 当 [样品类型] [等于]     │  │
│  │               │  │ [水质]                   │  │
│  │               │  │                          │  │
│  │               │  │   [保存]  [取消]         │  │
│  └──────────────┘  └──────────────────────────┘  │
│                                                   │
│  ┌── 实时预览 ───────────────────────────────┐   │
│  │  样品名称 [________________]               │   │
│  │  样品类型 [水质 ⬇]                        │   │
│  │  采样地点 [________________]               │   │
│  │  采样日期 [📅____]                        │   │
│  └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### 4.2 动态渲染效果

```
无模板: 显示基础字段                  水质模板: 显示扩展字段
┌──────────────┐                    ┌──────────────────┐
│ 样品名称     │                    │ 样品名称         │
│ 样品类型     │                    │ 样品类型: 水质 ✅│
│ 采样地点     │                    │ 采样地点         │
│ 采样日期     │                    │ 采样日期         │
└──────────────┘                    │ 采样深度(米)    ← 自定义
                                    │ 采样容器        ← 自定义
                                    │ 保存方式        ← 自定义
                                    │ 现场pH          ← 自定义
                                    │ 运输温度(℃)    ← 自定义
                                    └──────────────────┘
```

---

## 5. 数据结构

```sql
-- 字段配置
CREATE TABLE field_configs (
  id              VARCHAR(32) PRIMARY KEY,
  module          VARCHAR(32) NOT NULL,
  template_id     VARCHAR(32),
  field_key       VARCHAR(64) NOT NULL,
  label           VARCHAR(128) NOT NULL,
  field_type      VARCHAR(32) NOT NULL,
  required        BOOLEAN DEFAULT FALSE,
  default_value   TEXT,
  placeholder     VARCHAR(256),
  sort_order      INT DEFAULT 0,
  group_name      VARCHAR(64),
  validation      JSONB,        -- 校验规则
  options         JSONB,        -- 下拉选项
  condition_rules JSONB,        -- 条件显示规则
  cascading       JSONB,        -- 联动配置
  metadata        JSONB,        -- 扩展属性
  active          BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 字段模板
CREATE TABLE field_templates (
  id              VARCHAR(32) PRIMARY KEY,
  name            VARCHAR(128) NOT NULL,
  module          VARCHAR(32) NOT NULL,
  description     TEXT,
  version         INT DEFAULT 1,
  applies_to      JSONB,         -- 适用条件
  is_snapshot     BOOLEAN DEFAULT FALSE,  -- true=已冻结
  parent_id       VARCHAR(32),            -- 继承自
  created_by      VARCHAR(32),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 业务数据扩展字段 (在每个业务表中增加 JSONB 列)
-- ALTER TABLE samples ADD COLUMN dynamic_fields JSONB;
-- ALTER TABLE tests ADD COLUMN dynamic_fields JSONB;
-- ALTER TABLE reports ADD COLUMN dynamic_fields JSONB;
```

---

## 6. API 设计

```
GET    /api/v1/field-configs?module=sample          # 字段配置列表
POST   /api/v1/field-configs                        # 创建字段
PUT    /api/v1/field-configs/:id                    # 更新字段
DELETE /api/v1/field-configs/:id                    # 删除字段
PUT    /api/v1/field-configs/reorder                # 拖拽排序

GET    /api/v1/field-templates?module=sample        # 模板列表
POST   /api/v1/field-templates                      # 创建模板
PUT    /api/v1/field-templates/:id                  # 更新模板
POST   /api/v1/field-templates/:id/clone            # 克隆模板
POST   /api/v1/field-templates/:id/snapshot         # 冻结模板快照

GET    /api/v1/dynamic-render/:module/:templateId   # 获取渲染 Schema
POST   /api/v1/dynamic-validate                     # 动态表单数据校验
```

---

## 7. 技术方案

```
┌────────────────────────────────────────────────────┐
│                  前端 (React)                       │
│                                                     │
│  DynamicFieldRenderer                               │
│  ┌──────────────────────────────────────────────┐  │
│  │  JSON Schema (从 API 获取)                   │  │
│  │  → React JSON Schema Form (@rjsf/antd)       │  │
│  │  → 或者自研映射: Schema → AntD Form.Item[]   │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  FieldConfigEditor                                  │
│  ┌──────────────────────────────────────────────┐  │
│  │  · 字段列表 (拖拽排序: @dnd-kit)              │  │
│  │  · 属性编辑面板                               │  │
│  │  · 实时预览                                   │  │
│  └──────────────────────────────────────────────┘  │
└──────────────────────┬─────────────────────────────┘
                       │ REST
┌──────────────────────┴─────────────────────────────┐
│                  后端                               │
│  · FieldConfig Service (CRUD + 校验)                │
│  · FormSchema 生成器 (配置 → JSON Schema)           │
│  · 模板管理 + 快照                                  │
└─────────────────────────────────────────────────────┘
```

**推荐: 轻量自研方案**
- 不自研全新表单引擎，而是使用 **Schema → AntD Form** 映射方案
- 字段类型映射表: `{text: Input, number: InputNumber, date: DatePicker, ...}`
- 条件显示引擎: 递归遍历 Schema 的 `showIf` 属性

---

## 8. 验收标准

| # | 测试场景 | 预期结果 |
|:-:|---------|---------|
| 1 | 创建文本字段 | 表单渲染出 Input 组件 |
| 2 | 设置必填 → 提交空值 | 校验失败，提示信息 |
| 3 | 条件显示: 类型=水质 → 显示深度字段 | 选择水质后深度字段出现 |
| 4 | 拖拽排序 | 保存后预览顺序正确 |
| 5 | 创建模板 → 登记时选择 → 字段按模板渲染 | 只显示该模板的字段 |
| 6 | 模板克隆 → 修改 → 不影响原模板 | 原模板不变 |
| 7 | 已提交数据不受字段修改影响 | 旧数据使用快照 Schema |

---

## 9. 影响范围

| 模块 | 影响程度 | 改造内容 |
|------|---------|---------|
| 样品管理 | 🔴 高 | 替换登记/详情表单为动态渲染 |
| 检测管理 | 🟡 中 | 结果录入表单动态化 |
| 报告管理 | 🟡 中 | 报告编制表单动态化 |
| 仪器管理 | 🟢 低 | 台账表单动态化 |
| 库存管理 | 🟢 低 | 出入库表单动态化 |

**建议推进策略：**
1. 先完成框架 + 字段配置界面
2. 样品管理先行（最需要自定义字段的模块）
3. 逐模块替换，每个模块 2-3 天
