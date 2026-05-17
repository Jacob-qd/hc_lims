# P1-10 移动端（小程序/H5）

> 对标: 金现代小程序 | StarLIMS Mobile APP
> 版本: v1.0 | 优先级: P1 | 估算: 6周

---

## 1. 功能概述

为 HC-LIMS 增加移动端能力，第一阶段实现 PWA（离线缓存+摄像头+GPS），第二阶段开发微信小程序。

### 核心功能

| 模块 | 功能 | 阶段 |
|------|------|:----:|
| 现场采样 | 样品登记（拍照/GPS/语音） | PWA |
| 现场采样 | 条码扫描（手机摄像头） | 小程序 |
| 样品签收 | 扫码签收 → COC 更新 | PWA |
| 待办任务 | 我的待办列表 | PWA |
| 结果录入 | 手机录入检测结果 | 小程序 |
| 报告查看 | 报告预览/下载/签名确认 | 小程序 |
| 通知推送 | 微信模板消息/短信 | 小程序 |

---

## 2. 技术方案

### 第一阶段: PWA

```
┌────────────────────────────────────┐
│        React PWA                    │
│                                     │
│  Service Worker                     │
│  · 离线缓存 (Workbox)              │
│  · 后台同步 (Background Sync)      │
│                                     │
│  核心 API:                          │
│  · Navigator.mediaDevices → 拍照    │
│  · Geolocation → GPS 定位          │
│  · BarcodeDetector → 扫码           │
│  · Cache API → 离线数据             │
│                                     │
│  适配: 响应式 CSS (Mobile First)    │
│  安装: 浏览器 "添加到主屏幕"        │
└────────────────────────────────────┘
```

### 第二阶段: 微信小程序

```
┌────────────────────────────────────┐
│       微信小程序                    │
│                                     │
│  原生能力:                          │
│  · wx.scanCode → 扫码              │
│  · wx.chooseImage → 拍照/相册      │
│  · wx.getLocation → GPS            │
│  · wx.request → API 调用           │
│  · wx.downloadFile → 报告下载      │
│                                     │
│  订阅消息:                          │
│  · wx.requestSubscribeMessage       │
│  · 模板消息推送待办提醒             │
│                                     │
│  开发: Taro / uni-app (React 语法)  │
└────────────────────────────────────┘
```

### 核心 API

```
# 移动端专用（轻量级数据）
GET    /api/v1/mobile/tasks?status=pending    # 待办任务
POST   /api/v1/mobile/samples/scan            # 扫码签收
POST   /api/v1/mobile/samples/collect         # 现场采样登记
POST   /api/v1/mobile/tests/:id/result        # 结果录入
GET    /api/v1/mobile/reports/:id             # 报告详情
POST   /api/v1/mobile/signatures              # 移动端签名
```
