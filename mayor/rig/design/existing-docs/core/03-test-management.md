# 检测管理

> 对标: StarLIMS Test Management | LabWare Test Management
> 现有代码: `src/pages/TasksPage.tsx` (239行) | `src/pages/TaskResultEntry.tsx` (170行) | `src/pages/SchedulesPage.tsx` (70行)
> 成熟度: ✅ 已实现任务列表+分配+结果录入+甘特图排期

---

## 1. 功能概述

检测任务的全流程管理，从分配排期到结果录入到审核发布。

### 已实现功能

| 功能点 | 状态 | 说明 |
|--------|:----:|------|
| 检测任务列表（筛选+搜索+状态标签） | ✅ | 按状态/检测人/日期筛选 |
| 任务分配 Modal（选择检测人+期限） | ✅ | 弹窗分配 |
| 甘特图排期（SVG 时间轴视图） | ✅ | 按周展示任务分布 |
| 结果录入（指标表格+仪器读数+计算公式） | ✅ | 表格内编辑 |
| 超标自动判定（≥标准限值→红色标记） | ✅ | 超标自动标记 |
| 结果审核（通过/驳回+意见） | ✅ | 审核弹窗 |
| 导出结果 | ✅ | CSV/JSON 导出 |
| 任务自动分配 | ❌ | 目前手动分配 |
| 移动端录入 | ❌ | 未实现 |

---

## 2. 用户故事

### US-01: 检测组长分配任务
> 作为**检测组长**，我收到一批新样品后，在任务列表中选择待分配任务，指定检测人和完成期限。

**验收标准：**
- [ ] 任务列表按状态分 tab（待分配/进行中/待审核/已完成）
- [ ] 选中任务后点击"分配"弹出分配 Modal
- [ ] 分配 Modal 中选择检测人（从人员列表选择）+ 截止日期
- [ ] 分配后任务状态变为"进行中"，检测人收到通知

### US-02: 检测员录入检测结果
> 作为**检测员**，完成检测操作后，在检测任务中手动录入结果，或从仪器导入数据。

**验收标准：**
- [ ] 点击任务进入结果录入页面
- [ ] 指标表格列: 检测指标、方法、结果、单位、标准限值、判定
- [ ] 超标时结果单元格自动变红并显示"超标"标签
- [ ] 支持公式字段自动计算（如平均值、加标回收率）
- [ ] 有计算过程展示: 公式 + 代入值 + 结果

### US-03: 质量主管审核结果
> 作为**质量主管**，检测员提交结果后，我在审核页面查看并确认数据准确性。

**验收标准：**
- [ ] 审核页显示检测任务完整的指标结果
- [ ] 超标项高亮显示
- [ ] 点击"通过"或"驳回"填写审核意见
- [ ] 通过后状态变为"待发布"
- [ ] 驳回后任务退回检测员修改

### US-04: 排程员查看甘特图
> 作为**排程员**，我通过甘特图查看本周所有检测任务的排期安排，发现冲突并及时调整。

**验收标准：**
- [ ] 甘特图以周为单位，按人员分组展示任务
- [ ] 每个任务条显示样品编号和检测项目
- [ ] 已逾期任务条红色标记
- [ ] 鼠标悬停显示任务详情

---

## 3. 数据模型

```typescript
interface Task {
  id: string;
  taskNo: string;
  sampleId: string;
  sampleNo: string;
  testItem: string;
  method: string;
  assignee?: string;
  deadline?: string;
  status: TaskStatus;
  priority: 'normal' | 'urgent';
  results?: TestResult[];
  review?: ReviewRecord;
  scheduledDate?: string;
  scheduledEnd?: string;
  createdAt: string;
}

type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'in_review' | 'completed';

interface TestResult {
  indicator: string;
  result: string | number;
  unit: string;
  standard?: string;       // 标准限值
  isOverLimit: boolean;
  formula?: string;
  calculation?: string;    // 计算过程
  instrument?: string;
  operator: string;
  testedAt: string;
}

interface ReviewRecord {
  reviewer: string;
  decision: 'approved' | 'rejected';
  comment: string;
  reviewedAt: string;
}
```

## 4. API 接口

```
GET    /api/v1/tasks                        # 任务列表
GET    /api/v1/tasks/:id                    # 任务详情
POST   /api/v1/tasks/:id/assign             # 分配检测人
PUT    /api/v1/tasks/:id/results            # 录入结果
POST   /api/v1/tasks/:id/submit             # 提交审核
POST   /api/v1/tasks/:id/review             # 审核（通过/驳回）
GET    /api/v1/tasks/schedule               # 甘特图排期数据
```
