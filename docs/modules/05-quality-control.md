# 质量控制

> 对标: StarLIMS QC Management | LabWare SPC
> 现有代码: `src/pages/QualityPage.tsx` (228行)
> 成熟度: ✅ 已实现 L-J 控制图+Westgard规则+CAPA

---

## 1. 功能概述

实验室质量控制管理，包括质控图、质控规则判定、偏差/CAPA 管理。

### 已实现功能

| 功能点 | 状态 | 说明 |
|--------|:----:|------|
| 质控总览（KPI 卡片） | ✅ | 控制样品数/违规次数/待处理偏差 |
| L-J 控制图（SVG 渲染） | ✅ | 均值±1/2/3SD 控制限 |
| Westgard 规则判定（1₂s/1₃s/2₂s/R₄s） | ✅ | 3 项规则自动标注 |
| 控制图 Tab（近7天/近30天/近90天） | ✅ | 时间范围切换 |
| 偏差/CAPA 管理（5Why 根因分析） | ✅ | 偏差列表+详情+CAPA 流程 |
| 偏差/CAPA 统计（按部门/类型/状态） | ✅ | 分类统计视图 |
| CAPA 验证 | ✅ | 措施执行后验证关闭 |
| 质控样品管理 | ⚠️ Mock 数据 | 需生产数据 |
| Westgard 全规则（4₁s/10x/8x） | ❌ | 当前仅 3 规则 |

---

## 2. 用户故事

### US-01: 质控员查看控制图
> 作为**质控员**，我定期查看 L-J 控制图，了解质控样品的检测趋势，发现异常及时处置。

**验收标准：**
- [ ] 控制图展示质控样品浓度的时间序列
- [ ] 均值线、±1SD、±2SD、±3SD 控制限清晰标注
- [ ] 超出 ±2SD 的点标记为黄色警告
- [ ] 超出 ±3SD 的点标记为红色失控
- [ ] 违反 Westgard 规则的点自动标注规则名称

### US-02: 质量主管处理偏差
> 作为**质量主管**，发现检测偏差后，我在系统中创建 CAPA 记录，分配责任人跟进整改。

**验收标准：**
- [ ] 偏差列表: 编号、来源、标题、状态、责任人、创建时间
- [ ] 创建偏差: 填写标题、来源检测任务、描述、影响评估
- [ ] 5Why 根因分析: 逐层深入原因分析
- [ ] 制定 CAPA 措施: 措施描述、责任人、完成期限
- [ ] CAPA 完成后需验证关闭

---

## 3. API 接口

```
GET    /api/v1/qc/overview                  # 质控总览数据
GET    /api/v1/qc/chart                     # 控制图数据
GET    /api/v1/qc/rules                     # Westgard 规则配置
POST   /api/v1/qc/tests                     # 录入质控结果

GET    /api/v1/qc/deviations                # 偏差列表
POST   /api/v1/qc/deviations                # 创建偏差
GET    /api/v1/qc/deviations/:id            # 偏差详情
POST   /api/v1/qc/deviations/:id/capa       # 添加 CAPA
PUT    /api/v1/qc/capa/:id/verify           # 验证 CAPA
```
