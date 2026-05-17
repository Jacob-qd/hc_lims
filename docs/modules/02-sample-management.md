# 样品管理

> 对标: StarLIMS Sample Management | LabWare Sample Management
> 现有代码: `src/pages/SamplesPage.tsx` (463行) | `src/pages/SampleDetailPage.tsx` (129行)
> 成熟度: ✅ 已实现核心功能（5步向导+完整状态机+Timeline）

---

## 1. 功能概述

样品的全生命周期管理，从登记到检测到留样处置。支持 5 步登记向导、状态流转、历程追溯。

### 已实现功能

| 功能点 | 状态 | 说明 |
|--------|:----:|------|
| 样品列表（筛选+搜索+表格） | ✅ | 支持按状态/类型/日期筛选 |
| 5 步登记向导（类型→信息→项目→附件→确认） | ✅ | Step 向导式填写 |
| 样品状态流转（登记→接收→检测→审核→报告→归档） | ✅ | 完整状态机 |
| 样品详情（基本信息+检测项目+状态时间线+附件） | ✅ | Tab 页分组展示 |
| Timeline 组件（样品历程可视化） | ✅ | 纵向时间线+图标 |
| 样品编辑 | ✅ | 弹窗编辑 |
| 样品删除 | ✅ | 二次确认删除 |
| 批量操作 | ⚠️ 有按钮占位 | 批量导入/导出未实现 |

---

## 2. 用户故事

### US-01: 收样员登记新样品
> 作为**收样员**，客户送样后我在系统中按向导逐步录入样品信息，包括类型、来源、检测项目和附件。

**验收标准：**
- [ ] 点击"新增样品"打开 5 步登记向导
- [ ] 第一步: 选择样品类型（水质/土壤/食品/空气/其他）
- [ ] 第二步: 填写基本信息（名称/编号/来源/委托人/采样日期）
- [ ] 第三步: 选择检测项目（从项目列表勾选）
- [ ] 第四步: 上传附件（图片/文档，支持拖拽）
- [ ] 第五步: 确认预览，提交后状态变为"待接收"
- [ ] 提交后自动跳转到样品列表

### US-02: 检测组长查看样品详情
> 作为**检测组长**，我通过样品详情页了解样品的完整信息、当前状态、关联检测任务。

**验收标准：**
- [ ] 基本信息 Tab: 样品编号、类型、来源、委托人、采样信息
- [ ] 检测项目 Tab: 已分配的检测项目列表、状态
- [ ] 时间线 Tab: 从登记到当前的全部操作记录
- [ ] 附件 Tab: 关联文件列表，支持下载
- [ ] 页面顶部展示样品状态标签和操作按钮

### US-03: 检测员追踪样品进度
> 作为**检测员**，我通过样品时间线了解样品从接收到当前的全过程，快速定位到当前需要处理的环节。

**验收标准：**
- [ ] Timeline 展示从"登记"到"接收"到"检测中"到"完成"的完整链
- [ ] 当前环节高亮显示
- [ ] 每个节点显示操作人、时间和备注
- [ ] 异常节点（长时间未流转）红色标记

---

## 3. 数据模型

```typescript
// 样品
interface Sample {
  id: string;
  sampleNo: string;           // 样品编号
  sampleType: SampleType;      // 水质 | 土壤 | 食品 | 空气 | 其他
  name: string;
  status: SampleStatus;
  source: string;              // 来源
  client: string;              // 委托人
  samplingDate: string;
  receivedDate?: string;
  storageCondition?: string;
  attachments?: Attachment[];
  testItems: TestItem[];
  timeline: TimelineEvent[];
  createdAt: string;
  updatedAt: string;
}

type SampleType = 'water' | 'soil' | 'food' | 'air' | 'other';

type SampleStatus = 
  | 'pending_receipt'    // 待接收
  | 'received'           // 已接收
  | 'in_testing'         // 检测中
  | 'in_review'          // 审核中
  | 'reported'           // 已出报告
  | 'archived';          // 已归档

interface TestItem {
  id: string;
  name: string;
  method?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  assignee?: string;
  result?: string;
  unit?: string;
  standard?: string;       // 标准限值
  isOverLimit?: boolean;
}

interface TimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  operator: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
}
```

---

## 4. API 接口

```
GET    /api/v1/samples                     # 样品列表（分页+筛选）
GET    /api/v1/samples/:id                 # 样品详情
POST   /api/v1/samples                     # 创建样品
PUT    /api/v1/samples/:id                 # 更新样品
DELETE /api/v1/samples/:id                 # 删除样品
PUT    /api/v1/samples/:id/status          # 更新状态
GET    /api/v1/samples/:id/timeline        # 样品时间线

# 5步向导
POST   /api/v1/samples/wizard/step1        # 保存向导第一步
GET    /api/v1/samples/wizard/:session     # 获取向导进度

# 检测项目
POST   /api/v1/samples/:id/test-items      # 添加检测项目
DELETE /api/v1/samples/:id/test-items/:tid # 移除检测项目

# 附件
POST   /api/v1/samples/:id/attachments     # 上传附件
DELETE /api/v1/samples/:id/attachments/:aid # 删除附件
```
