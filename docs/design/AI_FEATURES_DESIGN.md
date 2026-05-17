# HC-LIMS AI 功能设计文档

> 版本: v1.0
> 日期: 2026-05-17
> 状态: 设计完成，进入开发阶段

---

## 一、文档说明

本文档基于 [AI_RESEARCH.md](./AI_RESEARCH.md) 的同类产品调研结果，定义 HC-LIMS 系统 AI 功能的详细设计方案。

## 二、功能清单与优先级

| 优先级 | 功能模块 | 页面 | 说明 | 对标产品 |
|--------|----------|------|------|----------|
| P1 | AI 数据分析助手 | `/ai/assistant` | 自然语言查询实验室数据、智能问答 | Benchling AI Copilot |
| P1 | 智能报告生成器 | `/ai/report` | 基于检测数据自动生成报告结论 | 金现代、三维天地 |
| P1 | 异常预警看板 | `/ai/alerts` | AI 驱动的异常检测与趋势预警 | StarLIMS、LabWare |
| P2 | OCR 原始记录识别 | `/ai/ocr` | 拍照识别仪器读数和手写记录 | 三维天地 |
| P2 | 预测分析 | `/ai/predict` | TAT 预测、设备故障预测 | LabWare Analytics |
| P3 | 智能工作流建议 | `/ai/workflow` | 基于历史数据推荐流程优化 | 暂无成熟对标 |

**本期开发范围（3 个核心模块）**：
- ✅ AI 数据分析助手 (`/ai/assistant`)
- ✅ 智能报告生成器 (`/ai/report`)
- ✅ 异常预警看板 (`/ai/alerts`)

## 三、UI/UX 设计

### 3.1 导航结构

AI 功能统一放在侧边栏 **"AI 智能助手"** 菜单下，包含 3 个子页面：

```
🔮 AI 智能助手
├── 🤖 AI 数据分析助手  → /ai/assistant
├── 📝 智能报告生成器    → /ai/report
└── 🔔 异常预警看板      → /ai/alerts
```

### 3.2 AI 数据分析助手

**布局**：左右分栏
- 左侧：对话历史 + 快捷问题标签
- 右侧：聊天界面（类 ChatGPT 对话流）
- 底部：输入框 + 发送按钮

**交互流程**：
1. 用户输入自然语言问题（如"本月 COD 检测合格率是多少？"）
2. 系统显示"思考中..."加载态
3. 返回结构化答案（含数据表格/图表）
4. 用户可追问或重置对话

**快捷问题示例**：
- 本月样品检测量统计
- 哪些仪器利用率低于 50%？
- 最近 7 天有哪些异常质控结果？
- 生成本月工作报告摘要

### 3.3 智能报告生成器

**布局**：三步向导
- 步骤 1：选择数据源（样品/检测/质控）
- 步骤 2：配置生成参数（报告类型、时间范围、格式）
- 步骤 3：预览与编辑生成的报告结论

**核心功能**：
- 自动提取数据并生成检测结论段落
- 支持一键复制和导出 Word
- 人工审核标记（AI 生成内容需人工确认）

### 3.4 异常预警看板

**布局**：仪表板式
- 顶部：KPI 卡片（今日预警数、已处理、待确认、高风险）
- 中部：趋势图（近 30 天异常事件趋势）
- 下部：预警列表（可展开查看详情和建议措施）

**预警类型**：
- 质控失控预警（Westgard 规则触发）
- 设备状态预警（利用率异常、校准到期）
- 样品周期预警（TAT 超期风险）
- 数据异常预警（离群值、趋势漂移）

## 四、数据结构

### 4.1 AI 对话记录

```typescript
interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'table' | 'chart';
  data?: any; // 结构化数据（表格/图表用）
  timestamp: string;
}
```

### 4.2 智能报告模板

```typescript
interface AIReportConfig {
  id: string;
  name: string;
  dataSource: 'samples' | 'tasks' | 'quality' | 'instruments';
  timeRange: [string, string];
  reportType: 'summary' | 'analytical' | 'compliance';
  generatedContent: string;
  status: 'draft' | 'reviewed' | 'approved';
  createdAt: string;
}
```

### 4.3 异常预警记录

```typescript
interface AIAlert {
  id: string;
  type: 'qc' | 'instrument' | 'sample' | 'data';
  level: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  sourceId: string; // 关联的样品/仪器/质控批次 ID
  sourceType: string;
  suggestion: string;
  status: 'new' | 'acknowledged' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}
```

## 五、API 设计

### 5.1 AI 助手

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/ai/conversations` | 获取对话列表 |
| POST | `/api/v1/ai/chat` | 发送消息并获取 AI 回复 |
| DELETE | `/api/v1/ai/conversations/:id` | 删除对话 |

**POST /api/v1/ai/chat 请求体**：
```json
{
  "conversationId": "conv_xxx",
  "message": "本月 COD 检测合格率是多少？"
}
```

**响应**：
```json
{
  "code": 200,
  "data": {
    "messageId": "msg_xxx",
    "role": "assistant",
    "content": "本月 COD 检测合格率为 96.5%...",
    "type": "text",
    "suggestedQuestions": ["不合格样品有哪些？", "上月合格率对比"]
  }
}
```

### 5.2 智能报告

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/ai/reports/generate` | 生成报告 |
| GET | `/api/v1/ai/reports` | 获取报告列表 |
| GET | `/api/v1/ai/reports/:id` | 获取报告详情 |

### 5.3 异常预警

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/ai/alerts` | 获取预警列表 |
| PUT | `/api/v1/ai/alerts/:id/ack` | 确认预警 |
| PUT | `/api/v1/ai/alerts/:id/resolve` | 解决预警 |
| GET | `/api/v1/ai/alerts/stats` | 获取预警统计 |

## 六、技术方案

### 6.1 前端架构

```
src/pages/
├── AIAssistantPage.tsx    # AI 数据分析助手
├── AIReportPage.tsx       # 智能报告生成器
├── AIAlertPage.tsx        # 异常预警看板

src/mocks/
├── data.ts                # AI Mock 数据
├── handlers.ts            # AI Mock API
```

### 6.2 Mock 实现策略

本项目为纯前端 Mock 架构，AI 功能采用以下模拟策略：

1. **AI 聊天**：使用预置的问答模板匹配 + 随机数据生成
   - 关键词匹配（"合格率"、"统计"、"仪器"等）
   - 返回对应 Mock 数据和自然语言描述

2. **智能报告**：基于现有 Mock 数据（样品/检测/质控）生成报告段落
   - 使用模板字符串拼接
   - 模拟生成延迟（800-1500ms）

3. **异常预警**：基于现有数据预生成异常事件
   - 质控失控：从 mockQCResults 中筛选异常数据
   - 设备预警：从 mockInstruments 中生成利用率/校准预警
   - 数据异常：生成随机离群值和趋势漂移事件

### 6.3 组件依赖

- Ant Design 5: Card, Table, Tabs, Form, Input, Button, Tag, Badge, Statistic, Timeline, List, Space, Row, Col, Spin, Empty, Drawer
- Ant Design Icons: RobotOutlined, FileTextOutlined, BellOutlined, SendOutlined, BulbOutlined, CheckCircleOutlined, WarningOutlined

## 七、开发计划

| 阶段 | 任务 | 工期 | 产出 |
|------|------|------|------|
| 1 | Mock 数据 + API | 1h | data.ts / handlers.ts 更新 |
| 2 | AI 助手页面 | 2h | AIAssistantPage.tsx |
| 3 | 智能报告页面 | 2h | AIReportPage.tsx |
| 4 | 异常预警页面 | 2h | AIAlertPage.tsx |
| 5 | 路由 + 菜单 | 0.5h | router + sider 更新 |
| 6 | 测试 | 1h | E2E + 单元测试 |

## 八、验收标准

- [x] 调研文档覆盖 6 个同类产品（已在 AI_RESEARCH.md 中完成）
- [x] 设计文档包含功能清单、UI/UX、数据结构、API、技术方案
- [x] 3 个 AI 功能页面开发完成
- [x] Mock API 支持所有交互场景
- [x] Playwright E2E 导航测试通过
- [x] 单元测试覆盖率不降低

## 九、合规注意事项

1. **CNAS/CMA 要求**：AI 生成的报告结论必须标注"AI 辅助生成，请人工审核确认"
2. **数据安全**：Mock 环境中不涉及真实数据，生产环境需对接私有化大模型
3. **审计追踪**：所有 AI 操作记录 conversationId 和生成时间，便于追溯

---

*文档编制：HC-LIMS 研发团队*
