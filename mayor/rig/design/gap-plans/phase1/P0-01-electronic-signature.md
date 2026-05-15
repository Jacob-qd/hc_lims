# P0-01 电子签名（国密 SM2/SM3）

> 对标: StarLIMS 21 CFR Part 11 | LabWare 21 CFR Part 11
> 版本: v1.0 | 优先级: P0 | 估算: 3周

---

## 1. 功能概述

实现符合《电子签名法》和 CNAS/CMA 要求的电子签名系统。采用国密 SM2（非对称签名）和 SM3（杂凑摘要）算法，替代国际算法的同时也符合中国密码合规要求。

### 核心能力

- 国密 SM2 数字签名 + SM3 摘要
- 签名含义声明（编制/审核/批准/复核）
- 签名审计链（不可篡改）
- 多方签名工作流
- 签名验真（含二维码验真）
- 数字证书管理（支持国密证书）

### 业务价值

| 价值 | 说明 |
|------|------|
| CNAS/CMA 合规 | 满足实验室认可对电子签名的法定要求 |
| 客户信任 | 国密合规增强政府/国企客户信任度 |
| 效率提升 | 从纸质签名（数天）→ 电子签名（分钟级） |
| 防篡改 | SM3 摘要 + SM2 签名确保报告不可篡改 |

---

## 2. 用户故事

### US-01: 实验室主任签发报告
> 作为**实验室主任**，我希望在审核检测报告后使用电子签名签发，以便无需打印纸质文件即可完成签署流程。

**验收标准：**
- [ ] 可在报告审核页面点击"电子签名"按钮
- [ ] 选择签名含义"批准"，输入密码确认
- [ ] 系统自动将签名、时间戳、证书写入报告
- [ ] 签名后报告状态变为"已签发"，不可再编辑
- [ ] 签名记录出现在审计日志中

### US-02: 检测员编制报告后签名
> 作为**检测员**，我在完成报告编制后需要以"编制人"身份签名，以便进入审核流程。

**验收标准：**
- [ ] 报告编辑完成后可见"提交签名"按钮
- [ ] 签名含义自动设为"编制"
- [ ] 签名后报告锁定编辑，流转至审核人待办

### US-03: 客户扫码验真
> 作为**客户**，我收到检测报告后扫描报告上的二维码，即可验证报告真伪和签名有效性。

**验收标准：**
- [ ] 报告 PDF 每页或首页右下角有验真二维码
- [ ] 扫码后打开验真页面，显示报告基本信息
- [ ] 显示每个签名人的信息、时间、签名含义
- [ ] 如果报告被篡改，显示红色警告"签名已失效"
- [ ] 如果报告有效，显示绿色"签名有效"标识

### US-04: 质量负责人管理签名证书
> 作为**质量负责人**，我需要管理实验室的签名证书，包括导入、吊销、查看证书详情。

**验收标准：**
- [ ] 证书管理页面列出所有可用证书
- [ ] 支持导入 SM2 国密证书（.pfx/.p12 格式）
- [ ] 支持吊销证书
- [ ] 显示证书有效期、颁发机构、主题
- [ ] 到期前 30 天自动发出更换提醒

---

## 3. 功能需求

### FR-01: SM2 数字签名

| 项目 | 说明 |
|------|------|
| 算法 | SM2 椭圆曲线公钥密码算法（GB/T 32918） |
| 签名内容 | reportHash(SM3) + signerId + meaning + timestamp |
| 签名输出 | DER 编码的 SM2 签名值（Base64 编码存储） |
| 密钥长度 | 256 位 |
| 私钥存储 | 可选方案: 文件证书 / HSM / 云 KMS |

**签名流程：**
```
用户点击签名 → 输入密码解密私钥 → 
构建签名原文 (documentHash + signerId + meaning + timestamp) →
SM2 签名 → 存储签名记录 → 更新业务状态
```

### FR-02: SM3 摘要

| 项目 | 说明 |
|------|------|
| 算法 | SM3 密码杂凑算法（GB/T 32905） |
| 摘要对象 | 报告完整内容（JSON 规范化字符串） |
| 输出长度 | 256 位（32 字节，Hex 编码 64 字符） |
| 用途 | 防篡改校验 + 签名原文构建 |

### FR-03: 签名含义声明

| 含义 | 说明 | 使用场景 |
|------|------|---------|
| 编制 (Prepared) | 文档编制人签名 | 报告编制完成 |
| 审核 (Reviewed) | 数据/结果审核 | 报告审核环节 |
| 批准 (Approved) | 最终签发批准 | 报告签发环节 |
| 复核 (Verified) | 复核确认 | 检测结果复核 |

### FR-04: 签名审计链

签名审计记录包含：

```json
{
  "id": "sig-20260515-001",
  "documentId": "report-20260515-001",
  "documentType": "REPORT",
  "documentHash": "SM3摘要值...",
  "signer": {
    "id": "user-001",
    "name": "张伟",
    "certId": "cert-sm2-001",
    "certSubject": "CN=张伟, OU=实验室, O=红创科技"
  },
  "meaning": "APPROVED",
  "signingTime": "2026-05-15T10:30:00+08:00",
  "timeSource": "NTP",
  "signatureValue": "SM2签名Base64...",
  "previousSignatureId": "sig-20260515-000",
  "clientInfo": {
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0 ...",
    "sessionId": "sess-xxx"
  }
}
```

**约束：** 审计记录一经创建不可删除、不可修改，仅可追加。

### FR-05: 签名验真

| 场景 | 验证步骤 | 结果 |
|------|---------|------|
| 在线验真（扫码） | ① 读取文档 ID → ② 查询原始签名记录 → ③ 重新计算当前文档 SM3 → ④ 比较摘要 → ⑤ 验证 SM2 签名 → ⑥ 检查证书有效性 | 有效/无效 |
| 页面加载时自动验真 | 同上，前端自动触发 | 显示签名状态标识 |
| 批量验真 | 管理员选择多份报告 → 批量验证 | 验证报告列表 |

### FR-06: 数字证书管理

| 功能 | 说明 |
|------|------|
| 证书导入 | 支持 SM2 证书导入 (.pfx/.p12/.cer) |
| 证书查看 | 主题、颁发者、有效期、指纹、密钥用法 |
| 证书吊销 | 吊销后签名验真返回"证书已吊销" |
| CRL 管理 | 导入/更新证书吊销列表 |
| 到期提醒 | 证书到期前 30 天系统通知 |

---

## 4. UI/UX 设计

### 4.1 签名对话框

```
┌──────────────────────────────────────┐
│          ✏️ 电子签名                   │
│                                        │
│  文档: 检测报告-20260515-001          │
│  当前环节: 批准签发                   │
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ 签名含义:  [批准 ⬇]             │ │
│  │                                  │ │
│  │  我已审核报告内容，确认数据准确， │ │
│  │  符合标准要求，同意签发。         │ │
│  │                                  │ │
│  │  签署密码:  [········]           │ │
│  │                                  │ │
│  │  报告摘要 (SM3):                 │ │
│  │  a3f8b2c1...e5d6                 │ │
│  │                                  │ │
│  │  □ 我确认以上内容真实有效        │ │
│  └──────────────────────────────────┘ │
│                                        │
│         [取消]    [确认签名]           │
└──────────────────────────────────────┘
```

### 4.2 签名状态标识

| 状态 | 标识 | 说明 |
|------|------|------|
| 未签名 | 🔴 未签名 | 待签名 |
| 部分签名 | 🟡 进行中 | 已部分签署（如已编制，未审核） |
| 完全签名 | 🟢 已签发 | 所有环节签名完成 |
| 验真失败 | 🔴 签名无效 | 文档已被篡改或证书已吊销 |

### 4.3 验真页面

```
┌──────────────────────────────────────┐
│          ✅ 报告验真                   │
│                                        │
│  报告编号: REPORT-20260515-001        │
│  文件名: 检测报告_水样_20260515.pdf   │
│  签发日期: 2026-05-15                 │
│                                        │
│  ┌─── 签名验证结果 ───────────────┐   │
│  │                                 │   │
│  │   ✅ 签名有效                    │   │
│  │                                 │   │
│  │  编制: 李四  2026-05-15 10:00   │   │
│  │  审核: 王五  2026-05-15 14:00   │   │
│  │  批准: 张伟  2026-05-16 09:00   │   │
│  │                                 │   │
│  │  文档完整性: ✅ 未被篡改         │   │
│  │  证书状态:   ✅ 有效            │   │
│  │  时间源:     ✅ 可信时间戳       │   │
│  └─────────────────────────────────┘   │
│                                        │
│  本报告由 HC-LIMS 电子签名系统签发     │
│  验证时间: 2026-05-16 10:30            │
└──────────────────────────────────────┘
```

---

## 5. 数据结构

### 数据库表

```sql
-- 签名记录表
CREATE TABLE digital_signatures (
  id              VARCHAR(32) PRIMARY KEY,
  document_id     VARCHAR(64) NOT NULL,
  document_type   VARCHAR(32) NOT NULL,  -- REPORT | CERTIFICATE | RECORD
  document_hash   VARCHAR(128) NOT NULL, -- SM3 摘要
  signer_id       VARCHAR(32) NOT NULL,
  signer_name     VARCHAR(64) NOT NULL,
  signer_cert_id  VARCHAR(32) NOT NULL,
  meaning         VARCHAR(32) NOT NULL,  -- PREPARED | REVIEWED | APPROVED | VERIFIED
  meaning_stmt    TEXT,                   -- 签名含义声明文本
  signature_value TEXT NOT NULL,          -- SM2 签名值 (Base64)
  timestamp       TIMESTAMPTZ NOT NULL,
  time_source     VARCHAR(32) DEFAULT 'NTP',
  previous_sig_id VARCHAR(32),           -- 前序签名 ID (链式)
  client_info     JSONB,
  status          VARCHAR(16) DEFAULT 'valid',  -- valid | revoked | expired
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_prev_sig FOREIGN KEY (previous_sig_id) REFERENCES digital_signatures(id)
);

-- 证书管理表
CREATE TABLE sm2_certificates (
  id              VARCHAR(32) PRIMARY KEY,
  user_id         VARCHAR(32) NOT NULL,
  cert_subject    TEXT NOT NULL,
  cert_issuer     TEXT NOT NULL,
  serial_number   VARCHAR(128) NOT NULL,
  algorithm       VARCHAR(32) DEFAULT 'SM2',
  key_length      INT DEFAULT 256,
  cert_pem        TEXT NOT NULL,          -- 证书 PEM
  private_key     TEXT,                   -- 加密后的私钥 (可选)
  not_before      TIMESTAMPTZ NOT NULL,
  not_after       TIMESTAMPTZ NOT NULL,
  status          VARCHAR(16) DEFAULT 'active',  -- active | revoked | expired
  revoked_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(serial_number)
);

-- 签名审计日志表 (不可删除)
CREATE TABLE signature_audit_log (
  id              BIGSERIAL PRIMARY KEY,
  signature_id    VARCHAR(32) NOT NULL,
  action          VARCHAR(32) NOT NULL,  -- CREATED | VERIFIED | REVOKED
  operator_id     VARCHAR(32),
  details         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### TypeScript 类型

```typescript
// 签名含义
type SignatureMeaning = 'PREPARED' | 'REVIEWED' | 'APPROVED' | 'VERIFIED';

// 签名创建请求
interface SignRequest {
  documentId: string;
  documentType: 'REPORT' | 'CERTIFICATE' | 'RECORD';
  meaning: SignatureMeaning;
  password: string;
  meaningStatement?: string;
}

// 签名验真请求
interface VerificationRequest {
  documentId: string;
  documentHash?: string;   // 可选，不传则重新计算
}

// 验真结果
interface VerificationResult {
  valid: boolean;
  documentIntact: boolean;
  signerVerified: boolean;
  certValid: boolean;
  timestampValid: boolean;
  signatures: SignatureInfo[];
  details: string[];
  verifiedAt: string;
}

interface SignatureInfo {
  signerName: string;
  meaning: SignatureMeaning;
  time: string;
  certSubject: string;
  status: 'valid' | 'invalid' | 'revoked';
}
```

---

## 6. API 设计

```
POST   /api/v1/signatures                    # 创建签名
GET    /api/v1/signatures/:id                # 查询签名记录
GET    /api/v1/signatures/document/:docId    # 查询文档所有签名
POST   /api/v1/signatures/verify             # 验真
GET    /api/v1/signatures/verify/qr/:docId   # 二维码验真（公开）

POST   /api/v1/certificates                  # 导入证书
GET    /api/v1/certificates                  # 证书列表
GET    /api/v1/certificates/:id              # 证书详情
POST   /api/v1/certificates/:id/revoke       # 吊销证书
GET    /api/v1/certificates/:id/export       # 导出证书

GET    /api/v1/audit/signatures              # 签名审计日志
GET    /api/v1/signatures/verify/qr/:docId   # 公开验真接口（无需认证）
```

---

## 7. 技术方案

### 架构

```
┌──────────────────────────────────────┐
│            前端 (React)               │
│  ┌─────────┐  ┌─────────┐           │
│  │ 签名对话框│  │ 验真页面 │           │
│  │ · gm-crypto│  │ · QR扫码│           │
│  └─────┬───┘  └────┬────┘           │
│        │            │                │
│  ┌─────┴────────────┴──────────┐    │
│  │      SignContext            │    │
│  │  · 签名状态管理              │    │
│  │  · 验真状态管理              │    │
│  └───────────┬─────────────────┘    │
└──────────────┼──────────────────────┘
               │ REST
┌──────────────┼──────────────────────┐
│              ▼                       │
│  ┌────────────────────────────┐    │
│  │     Sign Service            │    │
│  │  · SM2 Sign                 │    │
│  │  · SM3 Hash                 │    │
│  │  · Certificate Mgmt         │    │
│  │  · Audit Log                │    │
│  └────────┬───────────────────┘    │
│           │                         │
│  ┌────────┴──────────┐             │
│  │    Crypto Provider │             │
│  │  (node: crypto +  │             │
│  │   gm-crypto)      │             │
│  └───────────────────┘             │
│                                     │
│  DB: PostgreSQL                     │
│  Cache: Redis (验证码/临时会话)      │
└─────────────────────────────────────┘
```

### 密钥技术选型

| 组件 | 选型 | 说明 |
|------|------|------|
| 国密 SM2 | `@npmjs/sm-crypto` (纯JS) / `gm-crypto` (Node addon) | 推荐服务端使用 `gm-crypto` |
| 国密 SM3 | 同上 | SM3 作为 SM2 配套 |
| 证书解析 | `node-forge` / `x509.js` | PEM/DER 证书解析 |
| 二维码 | `qrcode.react` | 验真二维码生成 |
| 时间戳 | NTP + 可选可信时间戳 API | 对接国家授时中心 |

### 安全设计

| 安全项 | 措施 |
|--------|------|
| 私钥存储 | 加密存储在数据库（AES-256-GCM 加密）或 HSM |
| 签名密码 | 密码使用 bcrypt 哈希，每次签名需验证 |
| 防重放 | 签名的 timestamp 需在 ±5 分钟内 |
| 防篡改 | 签名链确保前序签名不可修改 |
| 审计 | 所有签名操作记入不可删除的审计表 |

---

## 8. 验收标准

### 功能验收

| # | 测试场景 | 预期结果 |
|:-:|---------|---------|
| 1 | 用户对报告进行 SM2 签名 | 签名成功，状态更新，审计日志写入 |
| 2 | 签名后修改报告内容 | 验真返回"签名已失效" |
| 3 | 扫报告二维码验真 | 验真页面显示签名信息和状态 |
| 4 | 多级签名流程（编制→审核→批准） | 每级签名后状态正确流转 |
| 5 | 导入 SM2 国密证书 | 证书可用，签名时可选择证书 |
| 6 | 吊销证书后验真 | 验真返回"证书已吊销" |
| 7 | 证书到期前提醒 | 系统通知证书即将过期 |

### 性能验收

| 指标 | 要求 |
|------|------|
| 签名操作耗时 | < 2 秒 |
| 验真操作耗时 | < 1 秒 |
| 二维码验真页面加载 | < 3 秒 |
| 审计日志查询 | < 0.5 秒 |

### 安全验收

| # | 测试场景 | 预期结果 |
|:-:|---------|---------|
| 1 | 错误的签名密码 | 签名被拒绝，记录失败日志 |
| 2 | 已签名文档再编辑 | 编辑被阻止（业务状态锁） |
| 3 | 尝试删除审计日志 | 数据库层面禁止 DELETE |
| 4 | 过期证书用于签名 | 签名被拒绝 |
| 5 | 重放旧签名请求 | 因 timestamp 超限被拒绝 |

---

## 9. 依赖项

| 依赖 | 类型 | 说明 |
|------|------|------|
| `@npmjs/sm-crypto` | npm | SM2/SM3 国密算法纯 JS 实现 |
| `node-forge` | npm | 证书解析 (x.509) |
| PostgreSQL JSONB | 数据库 | 审计日志存储 |
| 后端服务 | 基础设施 | 签名服务需后端支持 |

## 10. 开放问题

| # | 问题 | 决策 |
|:-:|------|------|
| 1 | 私钥存储方式？ | 建议 A: 加密存储在数据库。B: HSM。C: 用户本地。**推荐 A** |
| 2 | 是否对接第三方 CA？ | 可选。初期支持导入 CA 签发的证书即可 |
| 3 | 是否支持硬件 Key？ | 暂不支持。未来可对接国密 Key（如龙脉/飞天） |
| 4 | 时间戳是否对接国家授时中心？ | P2 增强。第一阶段使用 NTP 时间 |
