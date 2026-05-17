# HC-LIMS 前端设计规范

> 版本: v1.0 | 适用范围: 所有页面组件 | 基础框架: Ant Design 5 + React 19

---

## 1. 布局规范

### 1.1 页面标准结构

```
┌────────────────────────────────────────────────────┐
│ Row justify="space-between"                        │
│   Col ← 页面标题 (Title level=4)                    │
│   Col ← 操作按钮 (Button type="primary")            │
├────────────────────────────────────────────────────┤
│ Row gutter=[16,16]  marginBottom=16                │
│   Col xs=12 sm=6   ← Statistic KPI 卡片 (4列)     │
│   Col xs=12 sm=6   ← 数据指标                       │
│   Col xs=12 sm=6   ← 带颜色 valueStyle              │
│   Col xs=12 sm=6   ← 趋势指标                       │
├────────────────────────────────────────────────────┤
│ Card                                               │
│   Space marginBottom=16 ← 筛选栏 (Input+Select)    │
│   Table size="middle" pagination pagination         │
└────────────────────────────────────────────────────┘
```

### 1.2 间距系统

| Token | 值 | 使用场景 |
|-------|-----|---------|
| `marginBottom: 16` | 16px | 页面标题与内容、KPI行与表格 |
| `gutter: [16, 16]` | 16px | Row 列间距和行间距 |
| `marginBottom: 8` | 8px | 卡片内元素间距 |
| `padding: 24` (默认) | 24px | Card 内边距 |

### 1.3 断点响应式

| 断点 | 宽度 | 列数 |
|------|------|:----:|
| xs | <576px | 1-2列 |
| sm | ≥576px | 2列 |
| md | ≥768px | 2-3列 |
| lg | ≥992px | 3-4列 |
| xl | ≥1200px | 4列 |

**KPI 卡片标准**: `xs={12} sm={6}` (移动端2列, 桌面端4列)

---

## 2. 组件规范

### 2.1 表格 (Table)

```tsx
// ✅ 标准用法
<Table 
  dataSource={data}
  rowKey="id"
  loading={loading}
  pagination={{ pageSize: 10, showTotal: t => `共 ${t} 条` }}
  size="middle"     // 统一使用 middle
  columns={[
    { title: '编号', dataIndex: 'code', width: 100,
      render: (v: string) => <Text code>{v}</Text> },  // 编码用 code
    { title: '名称', dataIndex: 'name', 
      render: (v: string, r: any) => <a onClick={() => setFn(r)}>{v}</a> },  // 可点击
    { title: '状态', dataIndex: 'status', width: 90,
      render: (s: string) => <Tag color={colorMap[s]}>{labelMap[s]}</Tag> },  // 状态用Tag
    { title: '操作', key: 'action', width: 100,
      render: (_: any, r: any) => <Button type="link" size="small" icon={<EyeOutlined />} /> },
  ]}
/>
```

#### Table 规则
- ✅ 统一 `size="middle"`
- ✅ 统一 `pagination` 带总数显示
- ✅ 编码字段用 `<Text code>{v}</Text>` 渲染
- ✅ 可点击名称用 `<a>` 包裹
- ✅ 状态用 `<Tag color={...}>` 渲染
- ✅ 操作按钮用 `type="link" size="small"`
- ✅ 定义 `ColumnsType<Interface>` 类型
- ❌ 不使用内联 style 覆盖表格样式

### 2.2 KPI 统计卡片

```tsx
// ✅ 标准用法
<Card size="small">    // KPI使用size="small"紧凑卡片
  <Statistic 
    title="指标名称"
    value={value}
    valueStyle={{ color: colorMap[key] }}  // 趋势色
    prefix={<Icon />}                       // 图标前缀
    suffix="单位"
  />
</Card>
```

#### KPI 颜色规范
| 指标类型 | 颜色 | 场景 |
|---------|------|------|
| 正常/增长 | `#52c41a` (green) | 完成数、通过数 |
| 警告/中等 | `#faad14` (orange) | 即将过期、待处理 |
| 危险/下降 | `#ff4d4f` (red) | 逾期、失败、缺货 |
| 信息 | `#1677ff` (blue) | 总数、在途 |

### 2.3 表单 (Form) & 弹窗 (Modal)

```tsx
// ✅ 标准用法 — 新建弹窗
<Modal 
  title="新建XX" 
  open={modalVisible} 
  onOk={() => form.submit()}  // 使用 form.submit()
  onCancel={() => { setModalVisible(false); form.resetFields(); }}
>
  <Form form={form} layout="vertical" onFinish={handleSubmit}>
    <Form.Item name="fieldName" label="字段名" rules={[{ required: true }]}>
      <Input />
    </Form.Item>
  </Form>
</Modal>
```

#### Form 规则
- ✅ 统一 `layout="vertical"`
- ✅ 必填字段加 `rules={[{ required: true }]}`
- ✅ Modal 关闭时 `form.resetFields()`
- ✅ 提交用 `form.submit()` → `onFinish`
- ❌ 避免直接在 Modal 内写 `onClick` 提交

### 2.4 详情抽屉 (Drawer)

```tsx
// ✅ 标准用法
<Drawer 
  title={selected?.name} 
  open={drawerVisible} 
  onClose={() => { setDrawerVisible(false); setSelected(null); }}
  width={480}       // 标准宽度 480px
>
  {selected && (
    <Descriptions column={1} bordered size="small">
      <Descriptions.Item label="字段">{selected.field}</Descriptions.Item>
    </Descriptions>
  )}
</Drawer>
```

#### Drawer 规则
- ✅ 标准宽度 `480px` (详情) / `520px` (多内容) / `640px` (含Tabs)
- ✅ 使用 `selected &&` 条件渲染防 null 错误
- ✅ 关闭时同时清除 `selected` 状态
- ✅ 详情字段用 `Descriptions bordered size="small"`

### 2.5 Tabs 标签页

```tsx
// ✅ 标准用法
<Tabs defaultActiveKey="tab1" items={[
  { key: 'tab1', label: 'Tab名称', children: (
    <Card>内容</Card>
  )},
  { key: 'tab2', label: 'Tab名称', children: <Card>内容</Card> },
]} />
```

- ✅ 统一使用 `items={[]}` 语法 (Ant Design v5)
- ✅ 每个 Tab 内容用 `<Card>` 包裹 (有标题) / 直接内容 (无标题)

### 2.6 标签 (Tag)

| 用途 | 颜色 | 示例 |
|------|------|------|
| **状态-正常/完成** | `green` / `#52c41a` | 已完成、生效、正常 |
| **状态-进行中** | `blue` / `#1677ff` | 检测中、草稿、待分配 |
| **状态-待处理** | `orange` / `#faad14` | 待审核、即将过期、警告 |
| **状态-异常** | `red` / `#ff4d4f` | 已逾期、已过期、失控 |
| **状态-已归档** | `default` / `#d9d9d9` | 已完成、已归档、离线 |
| **优先级-高** | `#ff4d4f` | urgent/high |
| **优先级-中** | `#faad14` | medium |
| **优先级-低** | `#52c41a` | low |

```tsx
// ✅ 标准状态Tag
const statusColorMap: Record<string, string> = {
  completed: '#52c41a', active: '#52c41a',
  pending: '#1677ff', testing: '#1677ff',
  warning: '#faad14', review: '#faad14',
  error: '#ff4d4f', overdue: '#ff4d4f',
};
<Tag color={statusColorMap[status]}>{statusLabel}</Tag>
```

---

## 3. 数据获取模式

### 3.1 标准 fetch 模式

```tsx
const [data, setData] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

const fetchData = async () => {
  setLoading(true);
  try {
    const res = await fetch('/api/v1/endpoint');
    const json = await res.json();
    setData(json.data.list);
  } catch { message.error('加载失败'); }
  finally { setLoading(false); }
};

useEffect(() => { fetchData(); }, []);
```

- ✅ 统一使用 `async/await`
- ✅ 统一使用 `try/catch/finally`
- ✅ 统一错误提示用 `message.error()`
- ✅ 统一 loading 状态绑定到 Table

### 3.2 多接口并行

```tsx
// ✅ 标准用法
const [res1, res2] = await Promise.all([
  fetch('/api/v1/a').then(r => r.json()),
  fetch('/api/v1/b').then(r => r.json()),
]);
```

---

## 4. 颜色系统

### 4.1 品牌色

| Token | 色值 | 用途 |
|-------|------|------|
| Primary | `#1677ff` | 主按钮、链接、激活态 |
| Primary Hover | `#4096ff` | 悬停态 |
| Primary Active | `#0958d9` | 点击态 |

### 4.2 语义色

| Token | 色值 | 用途 |
|-------|------|------|
| Success | `#52c41a` | 成功、完成、正常 |
| Warning | `#faad14` | 警告、超期预警 |
| Error | `#ff4d4f` | 错误、逾期、失败 |
| Info | `#1677ff` | 信息、进行中 |

### 4.3 中性色

| Token | 色值 | 用途 |
|-------|------|------|
| Text Primary | `#333` | 正文 |
| Text Secondary | `#999` / `#8c8c8c` | 辅助文字 |
| Border | `#f0f0f0` | 分割线、边框 |
| Background | `#f5f5f5` | 信息卡片背景 |
| White | `#fff` | 卡片背景 |

---

## 5. 代码规范

### 5.1 导入顺序

```tsx
// 1. React
import React, { useEffect, useState } from 'react';

// 2. Ant Design (按字母序)
import { Button, Card, Form, Input, message, Modal, Select, Table, Tag } from 'antd';

// 3. Ant Design 图标
import { PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';

// 4. 第三方库
import type { ColumnsType } from 'antd/es/table';
import { Line, Pie } from '@ant-design/plots';

// 5. 项目内部
import { apiUrl } from '../utils/api';
```

### 5.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `DashboardPage.tsx` |
| 导出组件 | PascalCase | `export const DashboardPage` |
| 状态变量 | camelCase | `const [data, setData]` |
| 事件处理 | handleXxx | `handleCreate`, `handleSubmit` |
| Mock数据 | mockXxx | `mockTasks`, `mockInventory` |
| 接口类型 | PascalCase | `interface TaskItem` |
| 颜色映射 | xxxColorMap | `statusColorMap` |
| 常量 | UPPER_SNAKE | `API_BASE_URL` |

### 5.3 状态变量命名

```tsx
// ✅ 标准模式
const [data, setData] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [searchText, setSearchText] = useState('');
const [selected, setSelected] = useState<any>(null);
const [drawerVisible, setDrawerVisible] = useState(false);
const [modalVisible, setModalVisible] = useState(false);
const [form] = Form.useForm();
```

---

## 6. 目录结构

```
src/
├── pages/           ← 页面组件 (每个路由一个文件)
│   ├── DashboardPage.tsx
│   ├── SamplesPage.tsx
│   └── ...
├── components/      ← 公共组件
│   ├── layout/      ← 布局组件 (AppHeader, AppSider, AppLayout)
│   └── RouteGuard.tsx
├── stores/          ← Zustand 状态管理
│   ├── authStore.ts
│   ├── themeStore.ts
│   └── labTypeStore.ts
├── mocks/           ← MSW Mock数据
│   ├── data.ts      ← 所有Mock数据
│   ├── handlers.ts  ← 所有API处理器
│   └── browser.ts   ← MSW浏览器启动
├── router/          ← 路由配置
│   └── index.tsx
└── types/           ← TypeScript类型定义 (待完善)
```

---

## 7. 设计图规范

### 7.1 设计图目录结构

```
design/
├── 01-首页/
│   ├── 01-Dashboard首页.png
│   ├── 02-自定义工作台.png
│   └── README.md
├── 02-样品管理/
│   ├── 01-样品登记列表.png
│   └── ...
└── flows/           ← 用户使用流程文档
    ├── 01-登录与认证.md
    └── ...
```

### 7.2 设计图文件命名

```bash
{序号}-{页面名称}.png
# 示例
01-样品登记列表.png
02-样品列表.png
03-新建样品登记-5步向导.png
```

---

## 8. 新增公共组件

### 8.1 BarcodeLabel

```tsx
// 条码生成/打印组件
<BarcodePreview code="SMP202405210001" label="样品标签" />
<BarcodePrintModal visible={bool} code="xxx" label="xxx" type="sample" />
<BatchBarcodePrint visible={bool} codes={[{code,label}]} />
```

### 8.2 SignaturePad

```tsx
// 电子签名组件
<SignaturePad visible={bool} onClose={fn} onSign={fn} type="审核" />
<SignatureDisplay signature={sig} />
```

### 8.3 BatchActions

```tsx
// 批量操作工具栏
<BatchActions selectedCount={n} onBatchStatus={fn} onBatchDelete={fn} onBatchExport={fn} />
```

### 8.4 CustomWorkspace

```tsx
// Dashboard自定义工作台
<CustomWorkspace open={bool} onClose={fn} onSave={fn} initialVisible={[]} />
```

### 8.5 BreadcrumbNav

```tsx
// 面包屑导航
<BreadcrumbNav />
```

---

## 9. 新增 Store

| Store | 用途 | 方法 |
|------|------|------|
| `labTypeStore` | 双版本切换 | `setLabType('commercial'|'research')` |
| `permissionStore` | 权限控制 | `hasPermission(module, action)` |
| `themeStore` | 主题切换 | `toggle()` / `setMode('dark'|'light')` |
| `i18nStore` | 国际化 | `setLocale('zh'|'en')` / `t(key)` |

---

## 10. 组件库清单 (Ant Design 5)

| 组件 | 使用规范 | 页面示例 |
|------|---------|---------|
| `Card` | `size="small"` 用于KPI和嵌套卡片 | 全部页面 |
| `Table` | `size="middle"`, 统一columns宽度 | 全部列表页 |
| `Statistic` | 4个一组, 带颜色 `valueStyle` | Dashboard, 各列表 |
| `Tag` | 状态统一映射到 `statusColorMap` | 全部页面 |
| `Badge` | 状态指示器, 用于树和简单状态 | 课题组树, 侧边栏 |
| `Button` | `type="link" size="small"` 操作 | 表格操作列 |
| `Form` | `layout="vertical"` | 新建/编辑弹窗 |
| `Modal` | 配合 `Form.useForm()` | 新建/编辑/确认 |
| `Drawer` | 详情面板, 标准宽 480px | 列表行点击 |
| `Tabs` | `items={[]}` 语法, 内容用 Card 包裹 | 详情页 |
| `Descriptions` | `bordered size="small"` | 详情展示 |
| `Timeline` | 流程/状态时间线 | 样品流转, 任务步骤 |
| `Steps` | 多步骤向导 | 样品登记向导 |
| `Progress` | 进度/利用率 | 任务进度, 仪器利用率 |
| `Space` | 间距控制, 替代手动 margin | 筛选栏, 按钮组 |
| `Input.Search` | 搜索框 `allowClear` | 全局搜索 |
| `Select` | 下拉筛选, `allowClear` | 筛选栏 |
| `Tree` | 组织树/分类树 | 课题组组织树 |

---

## 9. API 规范

### 9.1 请求/响应格式

```typescript
// Request
fetch('/api/v1/resource', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

// Response (统一格式)
{
  code: 200,           // 业务状态码
  data: {
    list: [],          // 列表数据
    total: 0,          // 总数 (可选)
  },
  message: 'success',  // 提示信息
}
```

### 9.2 端点命名

```
GET    /api/v1/{resource}          ← 列表
GET    /api/v1/{resource}/:id      ← 详情
POST   /api/v1/{resource}          ← 创建
POST   /api/v1/{resource}/:id/action  ← 操作
```

---

## 10. 错误处理规范

```tsx
// ✅ 标准错误处理
try {
  const res = await fetch('/api/v1/endpoint');
  const json = await res.json();
  if (json.code === 200) {
    message.success('操作成功');
    fetch();              // 刷新列表
  } else {
    message.error(json.message || '操作失败');
  }
} catch {
  message.error('网络错误，请重试');
}
```

---

## 11. 状态管理规范

| 存储 | 用途 | 位置 |
|------|------|------|
| `useState` | 组件内局部状态 | 页面组件 |
| `Zustand store` | 全局共享状态 (auth, theme, labType) | `src/stores/` |
| `localStorage` | 持久化配置 (lab_type 等) | 系统设置 |

---

> 此规范适用于 HC-LIMS 所有前端页面。新页面开发请严格遵循上述规范。
> 如有例外需在 PR 中说明原因。
