# 高校科研版可用性提升 — 调研与功能设计

> Issue: hc-o8j · 优先级: P1 · 类型: EPIC

---

## 一、竞品调研

### 1.1 iLab (美国)
- **定位**: 高校仪器共享平台标杆
- **核心功能**: 仪器预约日历、计费规则引擎、用户培训认证、使用统计报表
- **借鉴点**: 
  - 日历视图支持拖拽预约
  - 计费规则支持按时/按次/按样品多级计费
  - 用户必须先通过培训才能预约特定仪器

### 1.2 LabArchives (ELN)
- **定位**: 科研电子实验记录本
- **核心功能**: 模板化实验记录、结构化数据录入、版本控制、DOI集成
- **借鉴点**:
  - 丰富的实验模板库（有机合成、材料表征、生物实验等）
  - 支持表格/公式/代码块等富文本元素
  - 与ORCID、DataCite等学术身份系统集成

### 1.3 高校仪器共享平台（中国典型）
- **定位**: 大型仪器共享管理平台
- **核心功能**: 多级审批流程、机时统计、成果关联、信用积分
- **借鉴点**:
  - 预约冲突检测与自动推荐时段
  - 使用记录自动关联科研成果
  - 信用积分制（违规扣分、准时加分）

---

## 二、功能设计总览

### 2.1 模块矩阵

| 模块 | 当前行数 | 目标行数 | 核心改进 |
|------|:--------:|:--------:|----------|
| 科研团队管理 | 167 | ~350 | API驱动、成员CRUD、经费流水、成果关联 |
| 科研项目管理 | 128 | ~350 | 里程碑/Gantt、经费明细、任务分解 |
| ELN | 156 | ~400 | 模板选择、版本历史、附件管理、见证流程 |
| 仪器预约 | 135 | ~350 | 日历视图增强、冲突检测、计费规则 |
| 教学管理 | 100 | ~300 | 学生名单、成绩管理、实验排期 |
| 成果管理 | 108 | ~300 | 多维筛选、引用统计、批量导出 |

### 2.2 数据模型增强

#### ResearchGroup (科研团队)
```typescript
interface ResearchGroup {
  id: string;
  name: string;
  dept: string;
  pi: string;
  piTitle: string;
  founded: string;
  field: string;
  members: Member[];
  projects: string[];      // 关联项目ID
  budgetTotal: number;
  budgetUsed: number;
  budgetTransactions: BudgetTransaction[];
  instrumentUsage: InstrumentUsage[];
  publications: string[];  // 关联成果ID
  status: 'active' | 'inactive';
}

interface Member {
  id: string;
  name: string;
  role: 'PI' | '博士后' | '博士生' | '硕士生' | '科研助理' | '本科生';
  education: string;
  field: string;
  joinDate: string;
  leaveDate?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'graduated' | 'left';
}

interface BudgetTransaction {
  id: string;
  date: string;
  source: string;
  type: '纵向' | '横向' | '校内';
  amount: number;
  used: number;
  remain: number;
  description?: string;
}
```

#### ResearchProject (科研项目)
```typescript
interface ResearchProject {
  id: string;
  no: string;
  name: string;
  type: '纵向' | '横向' | '校内';
  source: string;
  pi: string;
  groupId: string;
  groupName: string;
  startDate: string;
  endDate: string;
  budget: number;
  used: number;
  status: 'active' | 'closing' | 'closed';
  progress: number;
  milestones: Milestone[];
  budgetBreakdown: BudgetBreakdown[];
  members: ProjectMember[];
}

interface Milestone {
  id: string;
  name: string;
  plannedDate: string;
  actualDate?: string;
  status: 'pending' | 'completed' | 'delayed';
}

interface BudgetBreakdown {
  category: string;
  budget: number;
  used: number;
  remain: number;
}
```

#### ELNEntry (电子实验记录)
```typescript
interface ELNEntry {
  id: string;
  no: string;
  title: string;
  author: string;
  authorId: string;
  project: string;
  projectId: string;
  group: string;
  groupId: string;
  date: string;
  protocol: string;
  status: 'draft' | 'signed' | 'witnessed' | 'locked';
  tags: string[];
  content?: string;
  steps: ExperimentStep[];
  attachments: Attachment[];
  versions: Version[];
  signatures: Signature[];
}

interface ExperimentStep {
  id: string;
  order: number;
  title: string;
  description: string;
  completed: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'data' | 'document';
  url: string;
  uploadedAt: string;
}

interface Signature {
  role: 'experimenter' | 'supervisor' | 'witness';
  signer: string;
  signedAt: string;
  ip: string;
}
```

#### Reservation (仪器预约)
```typescript
interface Reservation {
  id: string;
  instrumentId: string;
  instrument: string;
  user: string;
  userId: string;
  group: string;
  groupId: string;
  project: string;
  projectId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;  // 分钟
  fee: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled';
  purpose: string;
  createdAt: string;
}

interface InstrumentRule {
  instrumentId: string;
  instrument: string;
  method: 'hourly' | 'per_use' | 'sample';
  rate: number;
  priorityRate: number;
  freePeriod?: string;
  overtimeRate: number;
  penalty: number;
}
```

#### Course (教学课程)
```typescript
interface Course {
  id: string;
  name: string;
  teacher: string;
  teacherId: string;
  dept: string;
  semester: string;
  students: number;
  studentList: Student[];
  experiments: Experiment[];
  status: 'active' | 'ended';
}

interface Student {
  id: string;
  name: string;
  studentNo: string;
  class: string;
  status: 'active' | 'dropped';
}

interface Experiment {
  id: string;
  name: string;
  hours: number;
  batch: number;
  status: 'pending' | 'completed' | 'testing';
  schedule?: string;
}
```

#### Publication (科研成果)
```typescript
interface Publication {
  id: string;
  title: string;
  type: '论文' | '专利' | '报告' | '软件著作权';
  journal: string;
  authors: string;
  authorIds: string[];
  year: number;
  doi: string;
  project: string;
  projectId: string;
  group: string;
  groupId: string;
  status: 'draft' | 'submitted' | 'published';
  citations?: number;
  impactFactor?: number;
  files?: Attachment[];
}
```

---

## 三、API 设计

### 3.1 科研团队
```
GET    /api/v1/research/groups              # 列表
POST   /api/v1/research/groups              # 创建
GET    /api/v1/research/groups/:id          # 详情
PUT    /api/v1/research/groups/:id          # 更新
DELETE /api/v1/research/groups/:id          # 删除
POST   /api/v1/research/groups/:id/members  # 添加成员
PUT    /api/v1/research/groups/:id/members/:uid  # 更新成员
DELETE /api/v1/research/groups/:id/members/:uid  # 移除成员
GET    /api/v1/research/groups/:id/budget   # 经费流水
GET    /api/v1/research/groups/:id/usage    # 仪器使用统计
```

### 3.2 科研项目
```
GET    /api/v1/research/projects            # 列表
POST   /api/v1/research/projects            # 创建
GET    /api/v1/research/projects/:id        # 详情
PUT    /api/v1/research/projects/:id        # 更新
DELETE /api/v1/research/projects/:id        # 删除
GET    /api/v1/research/projects/:id/milestones  # 里程碑
POST   /api/v1/research/projects/:id/milestones  # 添加里程碑
GET    /api/v1/research/projects/:id/budget # 经费明细
```

### 3.3 ELN
```
GET    /api/v1/research/eln                 # 列表
POST   /api/v1/research/eln                 # 创建
GET    /api/v1/research/eln/:id             # 详情
PUT    /api/v1/research/eln/:id             # 更新
POST   /api/v1/research/eln/:id/sign        # 签名
POST   /api/v1/research/eln/:id/witness     # 见证
GET    /api/v1/research/eln/:id/versions    # 版本历史
GET    /api/v1/research/eln/templates       # 模板列表
```

### 3.4 仪器预约
```
GET    /api/v1/research/reservations        # 列表
POST   /api/v1/research/reservations        # 创建
PUT    /api/v1/research/reservations/:id    # 更新
DELETE /api/v1/research/reservations/:id    # 取消
GET    /api/v1/research/reservations/rules  # 计费规则
GET    /api/v1/research/reservations/conflicts  # 冲突检测
```

### 3.5 教学管理
```
GET    /api/v1/teaching/courses             # 列表
POST   /api/v1/teaching/courses             # 创建
GET    /api/v1/teaching/courses/:id         # 详情
PUT    /api/v1/teaching/courses/:id         # 更新
GET    /api/v1/teaching/courses/:id/students    # 学生名单
POST   /api/v1/teaching/courses/:id/students    # 添加学生
GET    /api/v1/teaching/courses/:id/reports     # 实验报告
PUT    /api/v1/teaching/courses/:id/reports/:rid # 评分
```

### 3.6 成果管理
```
GET    /api/v1/research/publications        # 列表
POST   /api/v1/research/publications        # 创建
GET    /api/v1/research/publications/:id    # 详情
PUT    /api/v1/research/publications/:id    # 更新
DELETE /api/v1/research/publications/:id    # 删除
GET    /api/v1/research/publications/export # 导出
```

---

## 四、UI/UX 设计规范

### 4.1 页面布局统一
- 顶部: `Row justify="space-between"` + Title + 操作按钮
- 统计区: 4个 Statistic Card（`gutter={[16,16]}`）
- 内容区: Card 包裹 Table/表单
- 详情: Drawer 520px 或 640px，Tabs 分组

### 4.2 交互规范
- 列表支持搜索 + 筛选（状态/类型/日期）
- 新建/编辑使用 Modal，详情使用 Drawer
- 操作按钮统一: 查看(链接)、编辑(链接)、删除(确认)
- 数据加载统一使用 `loading` 状态

### 4.3 色彩规范
- 状态色: active=green, pending=blue, closed=default, warning=orange, danger=red
- 类型标签: 纵向=blue, 横向=orange, 校内=default
- 角色标签: PI=red, 博士后=blue, 博士生=green, 硕士生=orange

---

## 五、测试策略

### 5.1 单元测试 (Vitest)
- 每个页面至少2个测试: 渲染测试 + 交互测试
- 测试内容渲染、Modal/Drawer 打开、表单提交

### 5.2 E2E 测试 (Playwright)
- 导航冒烟: 所有科研模块页面能正常打开
- 功能冒烟: 新建→保存→查看 主流程
- 回归测试: 刷新、前进后退无错误

---

## 六、开发计划

| 阶段 | 内容 | 预计时间 |
|------|------|----------|
| 1 | 设计文档 + 数据模型扩展 | 2h |
| 2 | 科研团队 + 科研项目重构 | 3h |
| 3 | ELN + 仪器预约重构 | 3h |
| 4 | 教学管理 + 成果管理重构 | 2h |
| 5 | 测试补充 + Playwright | 2h |
| 6 | 验收 + 修复 | 1h |
