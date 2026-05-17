# P2-02 仪器数据直连（高级版）

> 对标: LabWare 300+ 驱动 | StarLIMS 400+ 驱动
> 版本: v1.0 | 优先级: P2 | 估算: 12周

---

## 1. 功能概述

在基础版框架上开发主流品牌仪器驱动，覆盖 HPLC/GC/MS/ICP/UV 等核心分析仪器。

---

## 2. 驱动开发计划

| 阶段 | 品牌 | 仪器类型 | 协议 | 周数 |
|:----:|------|---------|------|:----:|
| 1 | 岛津 (Shimadzu) | HPLC, GC | ASTM / 串口 | 3周 |
| 1 | 安捷伦 (Agilent) | HPLC, GC | TCP/IP ASTM | 3周 |
| 2 | Waters | HPLC, UPLC | TCP/IP | 2周 |
| 2 | Thermo | ICP-MS, IC | 串口 / 文件 | 2周 |
| 3 | PerkinElmer | ICP, UV-Vis | 串口 / TCP | 2周 |
| 3 | 梅特勒 (Mettler) | Titrator, pH | 串口 | 1周 |
| 4 | CDS 集成 | Empower/Chromeleon | API / 文件 | 3周 |
| 4 | 通用 ASTM | 多品牌 | ASTM E1394 | 2周 |

### 驱动开发流程

```
调研仪器通讯协议 → 搭建测试环境(模拟器) →
实现连接模块 → 实现数据解析 →
开发单元测试 → 集成测试 → 
撰写驱动文档 → 验收
```

### 插件化架构

```
instrument-drivers/
├── core/                     # 驱动框架
│   ├── interface.ts          # 驱动接口定义
│   ├── connector.ts          # 连接器基类
│   └── parser.ts             # 数据解析器基类
├── shimadzu/
│   ├── hplc/
│   │   ├── driver.ts         # 驱动实现
│   │   ├── parser.ts         # 数据解析
│   │   └── config.ts         # 连接配置
│   └── gc/
│       ├── driver.ts
│       ├── parser.ts
│       └── config.ts
├── agilent/                  # 同上结构
└── generic/                  # 通用 ASTM 驱动
    ├── astm-e1394.ts         # ASTM E1394 协议
    └── astm-e1381.ts         # ASTM E1381 协议
```
