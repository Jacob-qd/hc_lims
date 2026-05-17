# HC-LIMS 移动端功能设计文档

> 版本: v2.0 | 优先级: P1 | 状态: 开发中

## 1. 功能概述

为 HC-LIMS 构建完整的移动端 H5 能力，覆盖采样员/检测员在实验室外和实验室内的核心移动办公场景。

### 核心模块

| 模块 | 功能 | 用户角色 | 数据联通 |
|------|------|---------|---------|
| 移动首页 | 统计看板、快捷操作、待办提醒 | 采样员/检测员 | dashboard stats, tasks |
| 现场采样 | 任务领取→GPS定位→拍照→现场测量→条码生成→提交 | 采样员 | sampling-tasks → field-samples → samples |
| 扫码签收 | 扫描样品条码→确认接收→更新COC链 | 收样员 | samples → COC chains |
| 结果录入 | 选择任务→录入检测数据→提交审核 | 检测员 | tasks → test-results |
| 报告查看 | 报告列表→预览→签名确认→下载 | 客户/检测员 | reports |
| 我的 | 个人信息、资质文件、消息通知 | 所有角色 | users, messages |

## 2. User Stories

### US-MOB-001 采样任务领取
作为 采样员，我希望 在手机上查看分配给我的采样任务列表，以便 了解今天需要去哪里采样。

### US-MOB-002 GPS定位与地图导航
作为 采样员，我希望 到达现场后一键获取GPS坐标，并能跳转到地图导航，以便 准确记录采样位置。

### US-MOB-003 现场拍照
作为 采样员，我希望 用手机摄像头拍摄现场照片并关联到样品，以便 留存采样现场证据。

### US-MOB-004 现场测量数据录入
作为 采样员，我希望 在现场录入pH、水温、溶解氧等测量数据，以便 现场数据即时进入系统。

### US-MOB-005 离线采样与同步
作为 采样员，我希望 在没有网络时也能完成采样记录，联网后自动同步，以便 野外无信号时工作不受影响。

### US-MOB-006 样品扫码签收
作为 收样员，我希望 扫描送样人员带来的样品条码，确认接收，以便 样品状态从"运输中"更新为"已接收"。

### US-MOB-007 移动端结果录入
作为 检测员，我希望 在手机上查看分配给我的检测任务并录入结果，以便 无需回到电脑前即可录入检测数据。

### US-MOB-008 报告列表与预览
作为 客户或检测员，我希望 在手机上查看已出具的检测报告列表并预览，以便 随时随地查看报告状态。

### US-MOB-009 电子签名确认
作为 客户，我希望 在手机上查看报告并手写电子签名确认，以便 无需到实验室现场签字。

### US-MOB-010 个人信息查看
作为 所有用户，我希望 在手机上查看和编辑个人资料，以便 保持信息最新。

## 3. API 规范

```
POST   /api/v1/mobile/scan-receipt          # 扫码签收
GET    /api/v1/mobile/scan-receipts         # 签收历史
GET    /api/v1/mobile/my-tasks              # 我的检测任务
POST   /api/v1/mobile/tasks/:id/results     # 提交检测结果
GET    /api/v1/mobile/reports               # 报告列表
POST   /api/v1/mobile/reports/:id/sign      # 电子签名
GET    /api/v1/mobile/profile               # 个人信息
GET    /api/v1/mobile/messages              # 消息列表
```

## 4. 页面清单

| 路由 | 页面 | 状态 |
|------|------|------|
| /mobile | MobilePage | 已完成 |
| /mobile/sampling | MobileSamplingPage | 已完成 |
| /mobile/tasks | MobileTaskListPage | 已完成 |
| /mobile/scan-receipt | MobileScanReceiptPage | 待开发 |
| /mobile/result-entry | MobileResultEntryPage | 待开发 |
| /mobile/reports | MobileReportViewPage | 待开发 |
| /mobile/profile | MobileProfilePage | 待开发 |
