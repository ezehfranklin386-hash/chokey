# Security & Compliance
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

---

## 1. Security Overview

Security is the single most critical concern for a cryptocurrency wallet application. This document covers all layers: infrastructure, application, data, operational, and regulatory compliance.

---

## 2. Threat Model

| Threat | Severity | Mitigation |
|--------|----------|------------|
| **Account Takeover** | Critical | 2FA, device fingerprinting, login alerts, rate limiting |
| **Private Key Theft** | Critical | HSM, encryption at rest, never store non-custodial keys |
| **SQL Injection** | Critical | Parameterized queries (Prisma ORM), no raw SQL |
| **XSS** | High | CSP headers, React's built-in XSS protection, input sanitization |
| **CSRF** | High | SameSite cookies, CSRF tokens for state-changing requests |
| **API Abuse / DDoS** | High | Rate limiting, WAF, IP-based blocking, CAPTCHA |
| **Man-in-the-Middle** | High | TLS 1.3, HSTS, certificate pinning |
| **Session Hijacking** | High | JWT rotation, httpOnly cookies, secure flag, short expiry |
| **Phishing** | High | Email verification, security notifications, domain monitoring |
| **Insider Threat** | High | Audit logging, access control, separation of duties |
| **Supply Chain Attack** | Medium | npm audit, SRI for CDN resources, lockfile verification |
| **Data Breach** | Critical | Encryption at rest, key rotation, data minimization |

---

## 3. Application Security

### 3.1 Authentication & Authorization

```
┌──────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1: Email/Password + Captcha                            │
│  Step 2: Rate limited (5 attempts/minute/IP)                 │
│  Step 3: If 2FA enabled → TOTP/SMS code required            │
│  Step 4: JWT issued: access_token (30min) + refresh (7d)    │
│  Step 5: Refresh token rotation (old invalidated on use)    │
│  Step 6: Device fingerprint stored + known devices tracked   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### Password Policy
- Minimum 12 characters
- At least 1 uppercase, 1 lowercase, 1 number, 1 special character
- Checked against common password database (haveibeenpwned API)
- Bcrypt hash with cost factor 12
- Maximum 1 password change per 24h
- Force password change if suspicious activity detected

#### JWT Structure
```json
// Access Token (30 min)
{
  "sub": "user_uuid",
  "role": "USER",
  "kycLevel": "VERIFIED",
  "sessionId": "session_uuid",
  "iat": 1712345678,
  "exp": 1712347478,
  "jti": "unique_token_id"
}

// Refresh Token (7 days)
// Stored in httpOnly, Secure, SameSite=Strict cookie
// SHA-256 hash stored in database
// Single-use: rotated on each refresh
```

### 3.2 API Security

```typescript
// Security middleware stack
app.use(helmet());                    // Security headers
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
}));
app.use(rateLimiter.global);          // 300 req/min per IP
app.use(rateLimiter.auth);            // 5 req/min per IP for auth
app.use(requestValidation);           // Zod schema validation
app.use(csrfProtection);              // CSRF token check
app.use(deviceFingerprint);          // Passive device fingerprint
app.use(requestLogging);             // Structured audit logging
```

#### Rate Limiting Tiers

| Tier | Limit | Scope | Endpoints |
|------|-------|-------|-----------|
| Global | 300/min | IP | All |
| Auth | 5/min | IP + email | `/auth/*` |
| Trade | 100/min | User | `/trade/*` |
| Withdraw | 3/min | User | `/transactions/send` |
| API Key | 1000/min | Key | All |
| WebSocket | 60/min | Connection | Price updates |

### 3.3 Input Validation

```typescript
// All inputs validated server-side with Zod
// Schemas shared between frontend and backend

export const sendCryptoSchema = z.object({
  walletId: z.string().uuid(),
  toAddress: z.string()
    .min(26) // shortest valid crypto address
    .max(100)
    .refine(isValidAddress, 'Invalid blockchain address'),
  amount: z.string()
    .regex(/^\d+(\.\d+)?$/, 'Invalid amount format')
    .refine(val => parseFloat(val) > 0, 'Amount must be positive')
    .refine(val => parseFloat(val) <= 100000, 'Amount exceeds maximum'),
  memo: z.string().max(256).optional(),
  pin: z.string().length(4).regex(/^\d{4}$/),
  twoFactorCode: z.string().length(6).optional(),
});
```

### 3.4 CSRF Protection

```typescript
// Double-submit cookie pattern
// 1. Server sets CSRF token in httpOnly cookie on login
// 2. Frontend reads same token from non-httpOnly cookie (set by JS)
// 3. Frontend sends token in X-CSRF-Token header
// 4. Server validates both match
```

### 3.5 Wallet Security

#### Custodial Wallet (Server-Managed)
```
Key Generation:
  HSM → Generate master seed → BIP32 HD wallet
  ├── m/44'/0'/0'/0/0   → BTC deposit address 1
  ├── m/44'/0'/0'/0/1   → BTC deposit address 2
  ├── m/44'/60'/0'/0/0  → ETH deposit address 1
  └── ...

Key Storage:
  Master Seed → Encrypted with AES-256-GCM
  Encryption Key → AWS KMS / HashiCorp Vault (auto-rotation: 90d)
  Decrypted only in-memory when signing transactions
  Keys NEVER logged, never written to disk unencrypted

Transaction Signing:
  Small txs (< $10k) → Software signing (rate limited)
  Medium txs ($10k - $100k) → 2FA + Admin approval + software signing
  Large txs (> $100k) → Multi-sig (2 of 3) + HSM signing + time lock (24h)
```

#### Non-Custodial Wallet (User-Managed)
```
- Seed phrase generated client-side using secure random (window.crypto)
- Seed phrase NEVER sent to the server
- Encrypted with user's password before storage in IndexedDB
- Option to export private key / seed phrase (encrypted QR code)
- User responsible for backup (we provide printable recovery sheet)
```

### 3.6 Withdrawal Security

```
Withdrawal Flow:
  1. Address Whitelist Check
     - Unwhitelisted address → 24h cooldown
     - Whitelisted address → proceed
  
  2. Velocity Checks
     - Daily limit exceeded? → Block + notify admin
     - Unusual amount? → Risk score check
  
  3. 2FA Verification
     - Require 6-digit TOTP code
  
  4. Spending PIN
     - Require 4-digit PIN
  
  5. Risk Scoring
     - New device? → Extra verification
     - New IP in different country? → Email confirmation
     - Amount > 2x average? → Manual review
  
  6. Multi-Sig for Large Amounts
     - > $100k → Requires 2 admin approvals
```

---

## 4. Infrastructure Security

### 4.1 Network Security

```yaml
# Infrastructure security controls
Firewall:
  - All ports closed except 443 (HTTPS), 80 (redirect to HTTPS)
  - Database port 5432: private subnet only
  - Redis port 6379: localhost only
  - SSH: key-based auth only, VPN required

WAF (Cloudflare):
  - SQL injection detection
  - XSS detection
  - Rate limiting
  - DDoS protection
  - Bot management

DDoS Protection:
  - Cloudflare Magic Transit / AWS Shield Advanced
  - Auto-scaling groups absorb traffic spikes
  - Rate limiting at edge

SSL/TLS:
  - TLS 1.3 minimum
  - HSTS: max-age=31536000; includeSubDomains; preload
  - Certificate auto-renewal (Let's Encrypt / ACM)
```

### 4.2 Secrets Management

```yaml
Secrets Storage:
  - Environment variables: development only
  - Production: AWS Secrets Manager / HashiCorp Vault
  - Auto-rotation for sensitive keys (90d)
  - Access logged and audited

What's a Secret:
  ✓ Database passwords
  ✓ JWT signing keys
  ✓ API keys (MoonPay, Infura, etc.)
  ✓ Encryption keys
  ✓ KMS keys
  ✗ Database connection strings (include username/password — rotated separately)
  ✗ Public certificates
```

### 4.3 Data Encryption

| Data Type | At Rest | In Transit | Notes |
|-----------|---------|------------|-------|
| Passwords | bcrypt (cost 12) | TLS 1.3 | Never stored in plaintext |
| Private Keys | AES-256-GCM + KMS | TLS 1.3 | Master key in HSM |
| User Emails | AES-256 | TLS 1.3 | Encrypted column |
| KYC Documents | AES-256 (S3 SSE) | TLS 1.3 | Separate bucket, limited retention |
| JWT Secrets | AES-256 | TLS 1.3 | Rotated every 90d |
| Transaction Data | Plain | TLS 1.3 | Audited, not encrypted (needs indexing) |
| Session Tokens | SHA-256 hash | TLS 1.3 | Only hash stored |
| 2FA Secrets | AES-256-GCM | TLS 1.3 | Per-user encryption |
| API Keys | SHA-256 hash | TLS 1.3 | Only hash, prefix for identification |

### 4.4 Database Security

```sql
-- Row-Level Security (RLS) for multi-tenant data isolation
-- Even if a query bypasses application logic, users can only see their own data

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_wallets ON wallets
  USING (user_id = current_setting('app.current_user_id')::uuid);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_transactions ON transactions
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

---

## 5. Compliance & Regulatory

### 5.1 Jurisdictional Coverage

| Region | Regulator | Requirements | Status |
|--------|-----------|-------------|--------|
| **USA** | FinCEN | MSB registration, BSA/AML, SAR filing, KYC | Required |
| **UK** | FCA | Crypto asset registration, AML/CTF | Required |
| **EU** | ESMA / Local | MiCA regulation (2024+), AML Directives | Required |
| **Canada** | FINTRAC | MSB registration, KYC | Required |
| **Singapore** | MAS | Payment Services Act, KYC/AML | Required |
| **Dubai** | VARA | Virtual Asset license | Required |
| **Australia** | AUSTRAC | DCE registration, KYC | Required |
| **Restricted** | - | NY (BitLicense), China, Algeria, etc. | Geo-block |

### 5.2 KYC/AML Program

```yaml
KYC Levels:
  Level 0: Anonymous
    - Email + password only
    - Max balance: $500
    - No trading, no withdrawals
    - Purely for exploration

  Level 1: Basic (Email + Phone + Name)
    - Deposit limit: $10,000/day
    - Withdrawal limit: $2,000/day
    - Trading: yes
    - Signals: view only

  Level 2: Verified (Government ID + Selfie)
    - Deposit limit: $100,000/day
    - Withdrawal limit: $25,000/day
    - All features unlocked
    - Signal creation (if premium)

  Level 3: Advanced (Address Proof + Source of Funds)
    - Deposit limit: $1,000,000/day
    - Withdrawal limit: $250,000/day
    - Institutional features
    - Custom limits

Monitoring:
  - Real-time transaction monitoring system
  - Pattern detection (structuring, rapid trading)
  - Sanctions screening (OFAC, UN, EU sanctions lists)
  - PEP (Politically Exposed Person) screening
  - Daily volume anomaly detection
  - Machine learning-based fraud detection

Record Keeping:
  - All KYC records: 5 years after account closure
  - Transaction records: 7 years (US), 5 years (EU)
  - Communication records: 3 years
  - Suspicious Activity Reports: 5 years
```

### 5.3 Data Privacy (GDPR / CCPA)

```yaml
User Rights:
  - Right to access (data export)
  - Right to rectification
  - Right to deletion (subject to 5-year retention)
  - Right to data portability
  - Right to object to processing
  - Right to withdraw consent

Data Minimization:
  - Only collect KYC data if user exceeds Level 0 limits
  - Automatic data purging after retention period
  - Anonymized analytics data (no PII)

DPA (Data Processing Agreement):
  - Required for all third-party processors
  - Cloud providers: AWS (GDPR-compliant regions)
  - KYC provider: Onfido/Jumio (DPA signed)
```

---

## 6. Smart Contract & Blockchain Security

### 6.1 Supported Blockchains & Security

| Blockchain | Security Consideration | Mitigation |
|------------|----------------------|------------|
| Bitcoin | Reorg risk, address reuse | Wait 6 confirmations, generate fresh address per deposit |
| Ethereum | Reorg, contract risk, gas wars | Wait 12 confirmations, estimate gas properly |
| Solana | Different finality model | Wait 32 confirmations, handle fork edge cases |
| Polygon/L2 | Sequencer downtime | Fallback to L1, monitor bridge health |

### 6.2 Blockchain Communication

```typescript
// Blockchain node connectivity with failover
const providers = {
  ethereum: [
    { url: process.env.INFURA_URL, weight: 3 },
    { url: process.env.ALCHEMY_URL, weight: 3 },
    { url: process.env.QUICKNODE_URL, weight: 2 },
    { url: process.env.PUBLIC_NODE_URL, weight: 1 }, // fallback
  ],
  // Load-balanced with health checks and automatic failover
  // Rate-limited per provider
  // Minimum 2 different providers per blockchain
};
```

---

## 7. Monitoring & Incident Response

### 7.1 Security Monitoring

```yaml
Real-time Alerts:
  - Multiple failed login attempts (5+ in 1 min) → SRE PagerDuty
  - Unusual withdrawal pattern (3+ in 5 min) → Security team
  - Large transaction (> $50k) → Security team + Compliance
  - New device login from different country → User email alert
  - Admin action audit → Security team Slack webhook
  - API error rate spike (5xx > 5%) → SRE PagerDuty
  - Database connection pool exhaustion → SRE PagerDuty

Daily Automated Checks:
  - Brute force attempt summary
  - Failed KYC attempts
  - Pending withdrawal aging report
  - API key usage anomalies

Weekly Manual Review:
  - Suspicious activity review
  - Sanctions list update check
  - Access control audit
  - Log review (admin actions)
```

### 7.2 Incident Response Plan

```
LEVEL 1: Minor (e.g., single user account issue)
  → Support team handles, security notified
  → Resolve within 24h

LEVEL 2: Moderate (e.g., API outage, bug impacting some users)
  → Engineering lead + Security engineer
  → Resolve within 4h
  → Post-mortem required

LEVEL 3: Severe (e.g., data breach, active exploit, funds at risk)
  → Full incident response team activated
  → Immediate mitigation (pause withdrawals if needed)
  → Notify legal + compliance
  → Customer communication within 2h
  → Resolve within 1h or escalate
  → Full post-mortem within 72h
  → Regulatory reporting within required timeline

LEVEL 4: Critical (e.g., large-scale fund loss, regulatory breach)
  → Level 3 + external forensics team
  → Law enforcement notification
  → Public disclosure
  → Board-level briefing
```

### 7.3 Monitoring Tools

| Tool | Purpose |
|------|---------|
| Sentry | Error tracking (app + API) |
| Grafana + Prometheus | Metrics, dashboards, alerts |
| Loki | Log aggregation and search |
| WAF Logs | Security event detection |
| Database Audit Logs | All data changes tracked |
| CloudTrail / Audit Trail | Infrastructure changes |

---

## 8. Audits & Penetration Testing

```yaml
Schedule:
  - Internal security review: Every sprint
  - Automated vulnerability scan: Daily
  - Penetration test: Quarterly (external firm)
  - Smart contract audit: Before any contract deployment
  - SOC 2 Type II: Annual
  - Bug bounty program: Continuous (HackerOne / Immunefi)

Past findings tracker:
  - All findings tracked in security log
  - Critical/High: Fix within 72h
  - Medium: Fix within 2 weeks
  - Low: Fix within next sprint
```

---

## 9. Bug Bounty Program

```yaml
Platform: HackerOne / Immunefi
Scope:
  - Web application (api.cryptowallet.app)
  - Mobile API endpoints
  - Smart contracts (if applicable)
  - Browser extension (if applicable)

Out of Scope:
  - Social engineering
  - Physical attacks
  - DDoS attacks
  - Self-XSS

Rewards:
  - Critical (access to all users' funds): $50,000+
  - High (access to individual user funds): $15,000
  - Medium (data exposure, no fund risk): $5,000
  - Low (minor info disclosure): $500
  - Note: Bug bounty requests for private keys / seed phrases with no exploit path are informational only
```

---

## 10. Security Checklist (Pre-Launch)

- [ ] Penetration test completed (external firm)
- [ ] Smart contract audit completed (if applicable)
- [ ] Bug bounty program launched
- [ ] SOC 2 Type II in progress
- [ ] KYC/AML procedures documented and tested
- [ ] Incident response plan documented and rehearsed
- [ ] Data retention policies implemented
- [ ] Backup and disaster recovery tested
- [ ] Rate limiting configured and tested
- [ ] All secrets in vault (no hardcoded keys)
- [ ] WAF enabled and rules tuned
- [ ] HSTS preload submitted
- [ ] CSP headers configured and verified
- [ ] Email authentication (SPF, DKIM, DMARC) configured
- [ ] Database encryption verified
- [ ] Audit logging working and monitored
- [ ] 2FA implementation reviewed
- [ ] Withdrawal security flow tested
- [ ] RLS policies verified
- [ ] Load testing completed (target: 10x expected traffic)
- [ ] Disaster recovery drill completed

---

**Next Document:** [07-Signals-Charts-Architecture.md](07-Signals-Charts-Architecture.md)
