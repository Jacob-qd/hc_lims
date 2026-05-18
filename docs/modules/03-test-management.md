# 检测管理 (Test Management)

> 对标: StarLIMS Task Management | LabWare Task Scheduling
> 现有代码: `src/pages/TasksPage.tsx` | `src/pages/TaskResultEntry.tsx`
> 定位: 检测任务全生命周期管理，含复测和平行样验证

---

## 1. 功能概述

检测任务从分配、执行、复核到完成的完整流程管理，支持复测发起和平行样/加标回收验证。

### 已实现功能

| 功能点 | 状态 | 说明 |
|--------|:----:|------|
| 任务看板（Kanban） | ✅ | 待分配/待检测/检测中/待审核/已完成 |
| 排期视图（仪器维度） | ✅ | 按仪器和时间排期 |
| 任务列表（表格） | ✅ | 搜索+筛选+分页 |
| 任务分配 | ✅ | 分配分析员和仪器 |
| 检测状态流转 | ✅ | 分配→开始→完成→复核→审核 |
| **发起复测** | ✅ | 超标/异常/争议/质控 复测 |
| **平行样验证** | ✅ | 平行样 + 加标回收 |
| 结果录入 | ✅ | 多指标录入+模板 |
| 仪器读数记录 | ✅ | 序号+读数 |
| 计算过程展示 | ✅ | 公式+计算结果 |
| 附件上传 | ✅ | 原始记录附件 |

---

## 2. User Stories

### US-TM-01: 检测组长发起复测
> 作为**检测组长**，当检测结果超标或数据异常时，我发起复测任务。

**验收标准：**
- [x] 任务看板中点击已完成任务打开抽屉
- [x] 抽屉底部显示"发起复测"按钮
- [x] 复测原因选择：检测结果超标/数据异常/客户争议/质控要求
- [x] 稀释倍数输入（1-1000）
- [x] 提交后创建新的复测任务，状态为"待检测"
- [x] 原任务标记为"已复测"
- [x] 复测任务与原任务关联

### US-TM-02: 检测员执行平行样验证
> 作为**检测员**，我在结果录入时记录平行样和加标回收数据。

**验收标准：**
- [x] 结果录入页添加"平行样/加标回收"卡片
- [x] 平行样：记录原样、平行样1、平行样2 的结果
- [x] 自动计算相对偏差 RPD = |A-B|/((A+B)/2) × 100%
- [x] RPD 超出阈值（如15%）时红色警告
- [x] 加标回收：记录加标量和实测量
- [x] 自动计算回收率 = (实测-本底)/加标量 × 100%
- [x] 回收率超出范围（如80-120%）时红色警告

### US-TM-03: 检测员查看任务详情
> 作为**检测员**，我查看任务看板中某个任务的详情。

**验收标准：**
- [x] 基本信息：任务编号/样品/检测项目/方法/分析员/仪器
- [x] 状态和时间线
- [x] 进度条
- [x] 已完成任务显示"发起复测"和"平行样验证"按钮

---

## 3. 数据模型

```typescript
interface RetestRecord {
  id: string;
  parentTaskId: string;        // 原任务ID
  taskNo: string;
  reason: '超标' | '异常' | '争议' | '质控';
  dilutionFactor: number;      // 稀释倍数
  status: 'pending' | 'testing' | 'completed';
  createdAt: string;
}

interface ParallelSample {
  id: string;
  taskId: string;
  type: 'parallel' | 'spike';  // 平行样 / 加标回收
  // 平行样字段
  originalResult?: number;     // 原样结果
  parallel1Result?: number;    // 平行样1
  parallel2Result?: number;    // 平行样2
  rpd?: number;                // 相对偏差%
  rpdLimit: number;            // RPD限值（默认15%）
  // 加标回收字段
  backgroundResult?: number;   // 本底
  spikeAmount?: number;        // 加标量
  measuredResult?: number;     // 实测量
  recoveryRate?: number;       // 回收率%
  recoveryMin: number;         // 回收率下限（默认80%）
  recoveryMax: number;         // 回收率上限（默认120%）
  isValid: boolean;            // 是否合格
}
```

---

## 4. API 接口

```
POST   /api/v1/tasks/:id/retest          # 发起复测
  Body: { reason: string, dilutionFactor: number }

POST   /api/v1/tasks/:id/parallel        # 创建平行样记录
  Body: { type: 'parallel' | 'spike', ... }

PUT    /api/v1/tasks/:id/parallel/:pid  # 更新平行样结果
```
