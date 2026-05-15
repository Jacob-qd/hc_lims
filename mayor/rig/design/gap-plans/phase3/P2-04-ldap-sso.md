# P2-04 LDAP/SSO 集成

> 对标: StarLIMS AD/LDAP | LabWare SSO
> 版本: v1.0 | 优先级: P2 | 估算: 1周

---

## 1. 功能概述

实现企业级身份认证集成，支持 LDAP 用户同步和 OAuth/SSO 单点登录。

### 核心功能

| 功能 | 协议 | 说明 |
|------|------|------|
| LDAP 认证 | LDAP / LDAPS | 对接 AD / OpenLDAP |
| 用户同步 | SCIM v2 | 自动创建/更新/禁用本地用户 |
| 组映射 | LDAP 组 → 系统角色 | 自动同步角色分配 |
| SSO 登录 | OAuth 2.0 / OIDC | 对接企业 IdP |
| SAML | SAML 2.0 | 对接 ADFS / Okta / Azure AD |

### API

```
POST   /api/v1/auth/login                     # 表单登录 (fallback)
GET    /api/v1/auth/oauth/:provider            # OAuth 登录
POST   /api/v1/auth/saml/callback              # SAML 回调
GET    /api/v1/auth/ldap/sync                  # 手动触发 LDAP 同步
GET    /api/v1/auth/ldap/users                 # LDAP 用户预览
POST   /api/v1/auth/ldap/config                # LDAP 连接配置
```

### LDAP 配置 UI

```
┌──────────────────────────────────────┐
│  LDAP 配置                            │
│                                        │
│  服务器: [ldap.company.com ⬇]        │
│  端口:   [389]    加密: [TLS ⬇]      │
│  基准DN: [dc=company,dc=com]         │
│  绑定用户: [cn=admin,dc=...]         │
│  绑定密码: [········]                │
│                                        │
│  用户过滤: [(objectClass=person)]     │
│  用户属性: 用户名[cn] 邮箱[mail]      │
│                                        │
│  角色映射:                             │
│  CN=LabAdmins → 管理员                 │
│  CN=LabUsers → 检测员                  │
│  CN=LabQC → 质量主管                   │
│                                        │
│         [测试连接]   [保存]            │
└──────────────────────────────────────┘
```
