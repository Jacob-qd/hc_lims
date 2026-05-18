# 方法管理

> 对标: StarLIMS Method Management | LabWare Method Management
> 现有代码: `src/pages/MethodsPage.tsx`
> 成熟度: ✅ 已实现完整功能

---

## 1. 功能概述

检测方法/标准的管理，包括方法库、版本控制、SOP 管理和方法验证。

### 已实现功能

| 功能点 | 状态 | 说明 |
|--------|:----:|------|
| 方法列表（筛选+搜索） | ✅ | 按状态筛选、关键词搜索 |
| 方法详情（基本信息+SOP+版本历史+验证记录） | ✅ | Drawer + Tab 页分组 |
| 版本控制 Timeline | ✅ | 版本历史可视化，支持发布新版本 |
| 方法验证进度 | ✅ | 验证项卡片点击循环切换状态 |
| 方法状态管理（草稿/生效/修订中/已归档） | ✅ | 状态标签颜色区分 |
| 新增方法弹窗 | ✅ | 创建新方法，自动同步 statusLabel |
| 编辑方法（弹窗修改字段+状态） | ✅ | 列表行「编辑」可修改方法信息，状态变更自动同步 statusLabel |
| 复制方法（弹窗填写新编号/名称） | ✅ | 复制已有方法为新草稿 |
| 删除方法（确认后移除） | ✅ | Popconfirm 确认后调用 API 删除 |
| 版本发布（弹窗填写新版本号+生效日期） | ✅ | 发布后更新方法版本和状态 |
| SOP 编辑（弹窗文本编辑器） | ✅ | 详情页「编辑SOP」弹窗保存内容 |
| 验证记录状态切换（点击卡片循环切换） | ✅ | passed/testing/pending 循环切换 |
| API 集成 | ✅ | GET/POST/PUT/DELETE /api/v1/methods |

---

## 2. 用户故事

### US-01: 质量主管管理方法库
> 作为**质量主管**，维护实验室的检测方法库，确保所有方法有版本控制。

**验收标准：**
- [x] 方法列表: 名称/编号/版本/类型/状态/负责人/生效日期
- [x] 按状态筛选（草稿/生效/修订中/已归档）
- [x] 状态标签颜色标识

### US-02: 检测员查看与编辑方法 SOP
> 作为**检测员/质量主管**，执行检测前查看方法的标准操作程序，并在需要时更新 SOP 内容。

**验收标准：**
- [x] 方法详情 Tab: 基本信息/SOP/版本历史/验证记录
- [x] SOP Tab 展示操作程序和步骤（支持多行文本）
- [x] 点击「编辑SOP」弹窗编辑并保存内容
- [x] 版本历史 Timeline 展示变更记录
- [x] 点击「版本发布」创建新版本记录并更新生效日期

### US-03: 质量主管管理方法验证与版本
> 作为**质量主管**，我需要跟踪方法验证进度，管理方法版本生命周期。

**验收标准：**
- [x] 验证记录卡片点击循环切换 passed → testing → pending
- [x] 验证进度圆环实时反映完成百分比
- [x] 版本发布弹窗填写新版本号、生效日期、版本说明
- [x] 发布后方法状态自动变为「生效」，版本历史更新
- [x] 编辑方法弹窗可修改名称、分析项目、基质、仪器、检出限、状态、负责人
- [x] 状态变更时 statusLabel 自动同步（生效/修订中/已归档/草稿）
- [x] 复制方法弹窗填写新编号和名称，生成草稿状态的新方法
- [x] 删除方法确认后从列表移除

---

## 3. API 接口

```
GET    /api/v1/methods                      # 方法列表
POST   /api/v1/methods                      # 创建方法
PUT    /api/v1/methods/:id                  # 更新方法（自动同步 statusLabel）
DELETE /api/v1/methods/:id                  # 删除方法
```

### 状态映射
| status | statusLabel |
|--------|-------------|
| active | 生效 |
| revision | 修订中 |
| archived | 已归档 |
| draft | 草稿 |

---

## 4. 数据结构

```typescript
interface MethodItem {
  id: string;
  code: string;           // 方法编号，如 HJ 828-2017
  name: string;           // 方法名称
  analyte: string;        // 分析项目
  version: string;        // 版本号，如 v2.1
  matrix: string;         // 样品基质
  instrument: string;     // 适用仪器
  effectiveDate: string;  // 生效日期
  status: string;         // 状态：draft/active/revision/archived
  statusLabel: string;    // 状态显示文本
  detectionLimit: string; // 检出限
  responsible: string;    // 负责人
}
```
