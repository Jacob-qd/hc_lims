# P2-03 系统监控/告警

> 对标: StarLIMS Admin Console
> 版本: v1.0 | 优先级: P2 | 估算: 1周

---

## 1. 功能概述

实现系统健康监控，采集服务器指标并在异常时自动告警。

### 指标采集

| 指标 | 采集方式 | 告警阈值 |
|------|---------|---------|
| CPU 使用率 | `os.cpus()` | > 80% 持续 5min |
| 内存使用率 | `os.freemem()` | > 85% |
| 磁盘使用率 | `diskusage` | > 90% |
| 数据库连接数 | pg pool 统计 | > 80% 最大连接 |
| API 响应时间 | 中间件统计 | > 5s P99 |
| 错误率 | 日志统计 | > 1% 5min |
| 备份状态 | 备份服务状态 | 备份失败 |

### 告警通道

- 系统通知（站内消息）
- 邮件
- 企业微信/钉钉 Webhook（可选）

### API

```
GET    /api/v1/monitor/metrics                 # 当前指标
GET    /api/v1/monitor/history?range=24h       # 历史指标
GET    /api/v1/monitor/alerts                  # 告警记录
POST   /api/v1/monitor/rules                   # 告警规则配置
GET    /api/v1/monitor/logs                    # 系统日志查看
```
