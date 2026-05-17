# 移动采样系统设计文档

## 1. 概述

### 1.1 背景

移动采样是 LIMS 系统的核心现场功能。检测流程的第一步"采样"通常在客户现场/野外进行，采样员需要：
- 到达指定采样点
- 记录采样信息（坐标、照片、现场数据）
- 生成样品条码
- 启动 COC 监管链
- 将样品信息同步回实验室

### 1.2 对标分析

| 系统 | 移动采样功能 | HC-LIMS 差距 |
|------|-------------|-------------|
| **金现代 LIMS** | 移动采样 App：GPS 定位、拍照、条码打印、离线缓存、实时同步 | ❌ 无 |
| **LabWare LIMS** | 移动客户端：采样计划推送、现场录入、电子签名 | ❌ 无 |
| **StarLIMS** | 移动采样模块：任务分配、路径规划、现场确认 | ❌ 无 |

### 1.3 目标

构建 H5 移动采样模块，覆盖从采样任务领取→现场采样→样品提交的全流程。

---

## 2. 功能需求

### 2.1 用户故事

```
作为 采样员，
我希望 在手机上接收采样任务、到达现场后记录 GPS 坐标和现场照片，
以便 样品信息在采样时即进入 LIMS 系统，无需回实验室补录。
```

### 2.2 功能列表

| 优先级 | 功能 | 描述 |
|--------|------|------|
| P0 | 采样任务列表 | 显示分配给当前用户的采样任务 |
| P0 | 现场采样登记 | 记录样品名称、类型、位置 GPS、现场描述 |
| P0 | GPS 定位 | 自动获取浏览器地理位置 |
| P0 | 现场拍照 | 调用手机摄像头拍照并上传 |
| P0 | 条码生成 | 自动生成样品条码/二维码 |
| P0 | COC 链创建 | 采样时自动创建 COC 监管链的 SAMPLING 事件 |
| P1 | 采样计划 | 查看预分配的采样计划（地点、时间、项目） |
| P1 | 现场测量 | 记录现场数据（pH、温度、溶解氧等） |
| P1 | 离线队列 | 无网络时暂存采样记录，联网后自动同步 |
| P2 | 路径导航 | 从任务到采样点的地图导航 |
| P2 | 批量采样 | 同地点批量采集多个样品 |
| P2 | 样品容器关联 | 关联预置容器条码 |

### 2.3 数据模型

```typescript
interface SamplingTask {
  id: string;
  taskNo: string;
  projectName: string;
  sampleType: string;
  samplingPoints: SamplingPoint[];
  assignedTo: string;
  planDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface SamplingPoint {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  expectedSampleType: string;
  expectedCount: number;
}

interface FieldSample {
  id: string;
  sampleNo: string;
  taskId?: string;
  pointId?: string;
  name: string;
  sampleType: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  photos: FieldPhoto[];
  fieldData: Record<string, number>;
  description: string;
  collectedAt: string;
  collectedBy: string;
  cocEventId?: string;
  status: 'draft' | 'synced';
}

interface FieldPhoto {
  id: string;
  dataUrl: string;  // base64
  thumbnail: string;
  timestamp: string;
  note?: string;
}
```

---

## 3. 技术设计

### 3.1 架构

```
移动端 H5 (/mobile)
  └── 采样模块 (/mobile/sampling)
       ├── 采样任务列表
       ├── 现场采样表单
       ├── GPS 定位服务
       ├── 拍照服务
       ├── 条码生成
       └── 离线队列 (IndexedDB)

Mock API:
  GET  /api/v1/mobile/sampling-tasks
  GET  /api/v1/mobile/sampling-tasks/:id
  POST /api/v1/mobile/field-samples
  POST /api/v1/mobile/field-samples/:id/photos
  POST /api/v1/mobile/field-samples/:id/sync
  GET  /api/v1/mobile/field-samples
```

### 3.2 页面结构

```
/mobile                   - 移动首页
/mobile/sampling          - 采样任务列表
/mobile/sampling/:id      - 采样任务详情 + 采样点
/mobile/sampling/collect  - 现场采样表单（GPS + 拍照 + 条码）
/mobile/sampling/history  - 已采样记录
```

### 3.3 GPS 服务

使用浏览器 `Geolocation API`：
```typescript
navigator.geolocation.getCurrentPosition(
  (pos) => {
    setLat(pos.coords.latitude);
    setLng(pos.coords.longitude);
    setAccuracy(pos.coords.accuracy);
  },
  (err) => message.warning('定位失败：' + err.message),
  { enableHighAccuracy: true, timeout: 10000 }
);
```

### 3.4 拍照服务

使用 `MediaDevices API` 或 `<input type="file" accept="image/*" capture="environment">`。

### 3.5 离线队列

使用 localStorage 暂存未同步的采样记录。联网后通过 `navigator.onLine` 事件触发自动同步。

### 3.6 COC 集成

每次采样完成自动调用 COC API 创建链，添加 SAMPLING 事件：
```
POST /api/v1/coc/chains
  body: { sampleId, sampleName, location, operatorName, occurredAt }
→ 返回 chainId

POST /api/v1/coc/chains/{chainId}/events
  body: { eventType: 'SAMPLING', operatorName, location, occurredAt }
```

---

## 4. UI 设计

### 4.1 采样任务列表

```
┌────────────────────────┐
│ 🔙 移动采样     📋 历史 │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ 水质监测项目-东湖    │ │
│ │ 3个采样点 · 今日    │ │
│ │ 📍 东湖公园        │ │
│ │ [进行中]  ▶        │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ 土壤监测-工业区     │ │
│ │ 5个采样点 · 明日    │ │
│ │ 📍 科技园区        │ │
│ │ [待开始]  ▶        │ │
│ └────────────────────┘ │
│           ↓            │
└────────────────────────┘
```

### 4.2 现场采样表单

```
┌────────────────────────┐
│ 🔙 现场采样      ✅ 保存│
├────────────────────────┤
│ 📍 GPS: 30.27, 120.12  │
│   精度: ±10m  [刷新]   │
├────────────────────────┤
│ 📸 现场照片             │
│ ┌──┐ ┌──┐ ┌──┐        │
│ │📷│ │📷│ │➕│        │
│ └──┘ └──┘ └──┘        │
├────────────────────────┤
│ 样品名称: [________]    │
│ 样品类型: [地表水 ▼]   │
│ 采样描述: [________]    │
├────────────────────────┤
│ 现场测量数据            │
│ pH: [____]  水温: [____]│
│ 溶解氧: [____]  流速:   │
├────────────────────────┤
│ ┌────────────────────┐ │
│ │ 📱 生成条码 →      │ │
│ └────────────────────┘ │
│ ┌────────────────────┐ │
│ │ ✅ 提交采样        │ │
│ └────────────────────┘ │
└────────────────────────┘
```

### 4.3 COC 启动确认

```
┌────────────────────────┐
│ 采样已记录              │
│                        │
│ ✅ 样品 SMP-001 已创建  │
│ 📍 东湖 (30.27,120.12) │
│ 📸 3 张现场照片         │
│                        │
│ COC 监管链已自动启动：   │
│ ┌────────────────────┐ │
│ │ 🟢 SAMPLING 已记录  │ │
│ │ ⚪ SUBMISSION 待送样│ │
│ │ ⚪ RECEIPT 待收样   │ │
│ └────────────────────┘ │
│                        │
│ [继续采样]  [查看COC链] │
└────────────────────────┘
```

---

## 5. 实现计划

| 阶段 | 功能 | 工作量 |
|------|------|--------|
| Phase 1 | 采样任务列表 + 现场采样表单（GPS+拍照+条码） | 4h |
| Phase 2 | COC 链集成 + 离线队列 | 2h |
| Phase 3 | 历史记录 + 采样计划 | 2h |
| Phase 4 | 地图导航 + 批量采样 | 2h |

**总计：约 10h**

---

## 6. Mock API 端点

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/mobile/sampling-tasks` | 采样任务列表 |
| GET | `/api/v1/mobile/sampling-tasks/:id` | 采样任务详情 |
| POST | `/api/v1/mobile/field-samples` | 提交现场采样记录 |
| GET | `/api/v1/mobile/field-samples` | 已采样品列表 |
| POST | `/api/v1/mobile/field-samples/:id/sync` | 手动同步离线记录 |
