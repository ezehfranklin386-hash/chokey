# API Specification
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

**Base URL (dev):** `http://localhost:4000/api/v1`
**Base URL (prod):** `https://api.cryptowallet.app/api/v1`
**WebSocket:** `wss://api.cryptowallet.app/ws`

---

## 1. API Standards

### 1.1 Response Format (JSEND)

```json
// Success
{
  "status": "success",
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "cursor": "eyJpZCI6MTUwfQ=="
  }
}

// Error
{
  "status": "error",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance to complete this order",
    "details": {
      "required": "0.5 BTC",
      "available": "0.1 BTC"
    }
  },
  "requestId": "req_abc123"
}
```

### 1.2 Authentication

| Method | Header |
|--------|--------|
| JWT Access Token | `Authorization: Bearer <token>` |
| API Key | `X-API-Key: <key>` |

### 1.3 Rate Limiting

Headers returned on every response:
```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1623456789
```

### 1.4 Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_INPUT` | 400 | Validation error |
| `UNAUTHORIZED` | 401 | Missing/invalid auth |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INSUFFICIENT_BALANCE` | 422 | Not enough funds |
| `ORDER_REJECTED` | 422 | Order matching failed |
| `KYC_REQUIRED` | 403 | KYC not completed |
| `MAINTENANCE_MODE` | 503 | System under maintenance |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 2. REST Endpoints

### 2.1 Authentication

#### POST /auth/register
Register a new user account.

```json
// Request
{
  "email": "user@example.com",
  "password": "StrongP@ss123",
  "passwordConfirm": "StrongP@ss123",
  "referralCode": "REF123"
}

// Response 201
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "USER",
      "kycLevel": "NONE"
    },
    "tokens": {
      "accessToken": "eyJ...",
      "expiresIn": 1800,
      "refreshToken": "eyJ..."
    }
  }
}
```

#### POST /auth/login
Authenticate with email + password.

```json
// Request
{
  "email": "user@example.com",
  "password": "StrongP@ss123",
  "deviceInfo": {
    "userAgent": "...",
    "ip": "...",
    "fingerprint": "..."
  }
}

// Response (no 2FA)
{ "accessToken": "...", "refreshToken": "...", "twoFactorRequired": false }

// Response (2FA required)
{ "twoFactorRequired": true, "tempToken": "temp_..." }

// Response 401
{ "code": "INVALID_CREDENTIALS" }
```

#### POST /auth/2fa/verify
Complete login with 2FA code.

```json
// Request
{
  "tempToken": "temp_...",
  "code": "123456"
}

// Response
{ "accessToken": "...", "refreshToken": "..." }
```

#### POST /auth/refresh
Refresh expired access token.

```json
// Request (Cookie: refreshToken=...)
{}

// Response
{ "accessToken": "eyJ...", "expiresIn": 1800 }
```

#### POST /auth/logout
Revoke current session.

```json
// Response 200
{ "status": "success" }
```

#### POST /auth/2fa/enable
Enable TOTP 2FA.

```json
// Response
{
  "secret": "JBSWY3DPEHPK3PXP",
  "qrCodeUrl": "otpauth://totp/...",
  "recoveryCodes": ["abc123", "def456", ...]
}

// Then verify:
POST /auth/2fa/verify-setup
{ "code": "123456", "secret": "JBSWY3DPEHPK3PXP" }
// Response 200: { "status": "success", "message": "2FA enabled" }
```

#### POST /auth/forgot-password
Request password reset email.

```json
// Request
{ "email": "user@example.com" }
// Response 200 (always success to prevent enumeration)
{ "status": "success", "message": "If email exists, reset link sent" }
```

#### POST /auth/reset-password
Complete password reset.

```json
// Request
{ "token": "reset_token_from_email", "password": "NewStr0ng!Pass", "passwordConfirm": "NewStr0ng!Pass" }
// Response 200
{ "status": "success", "message": "Password reset successfully" }
```

### 2.2 User Profile

#### GET /users/me
Get current user profile.

```json
// Response
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "emailVerified": true,
    "phone": "+1234567890",
    "phoneVerified": true,
    "displayName": "John Doe",
    "avatarUrl": "https://cdn.cryptowallet.app/avatars/uuid.jpg",
    "role": "USER",
    "kycLevel": "VERIFIED",
    "twoFactorEnabled": true,
    "isActive": true,
    "createdAt": "2026-01-15T10:30:00Z"
  },
  "settings": {
    "language": "en",
    "currency": "USD",
    "theme": "dark",
    "notificationPrice": true,
    "notificationSignal": true
  }
}
```

#### PATCH /users/me
Update user profile.

```json
// Request
{ "displayName": "John Updated", "phone": "+1987654321" }
// Response
{ "status": "success", "user": { ... } }
```

#### POST /users/me/avatar
Upload avatar (multipart/form-data).

```json
// Response
{ "avatarUrl": "https://cdn.cryptowallet.app/avatars/uuid.jpg" }
```

### 2.3 KYC

#### POST /kyc/start
Start KYC verification process.

```json
// Response
{
  "verificationId": "uuid",
  "requiredDocs": ["passport", "selfie"],
  "uploadUrls": {
    "passport": "https://cdn.cryptowallet.app/upload/temp_..."
  }
}
```

#### POST /kyc/upload
Upload KYC document (multipart/form-data).

```json
// Request (multipart)
file: <binary>
documentType: "passport"

// Response
{ "documentId": "uuid", "status": "PENDING" }
```

#### GET /kyc/status
Get KYC verification status.

```json
// Response
{
  "kycLevel": "BASIC",
  "status": "IN_PROGRESS",
  "documents": [
    { "type": "passport", "status": "APPROVED", "verifiedAt": "..." },
    { "type": "selfie", "status": "PENDING" }
  ]
}
```

### 2.4 Wallets

#### GET /wallets
List all user wallets with balances.

```json
// Response
{
  "wallets": [
    {
      "id": "uuid",
      "asset": {
        "symbol": "BTC",
        "name": "Bitcoin",
        "logoUrl": "...",
        "decimals": 8,
        "network": "bitcoin"
      },
      "type": "CUSTODIAL",
      "balance": "1.50000000",
      "lockedBalance": "0.00000000",
      "availableBalance": "1.50000000",
      "usdValue": 45000.00,
      "change24hPct": 2.34
    },
    {
      "id": "uuid",
      "asset": {
        "symbol": "ETH",
        "name": "Ethereum",
        "logoUrl": "...",
        "decimals": 18,
        "network": "ethereum"
      },
      "type": "CUSTODIAL",
      "balance": "15.000000000000000000",
      "lockedBalance": "2.000000000000000000",
      "availableBalance": "13.000000000000000000",
      "usdValue": 45000.00,
      "change24hPct": -1.23
    }
  ],
  "totalUsdValue": 90000.00,
  "totalChange24hPct": 0.55
}
```

#### GET /wallets/:id
Get single wallet details.

```json
// Response
{
  "wallet": {
    "id": "uuid",
    "asset": { ... },
    "type": "CUSTODIAL",
    "balance": "1.50000000",
    "lockedBalance": "0.00000000",
    "totalDeposited": "5.00000000",
    "totalWithdrawn": "3.50000000"
  },
  "addresses": [
    { "address": "bc1q...", "label": "Main", "isDefault": true }
  ]
}
```

#### GET /wallets/:id/transactions
Get wallet transaction history.

**Query:** `?type=&status=&page=1&limit=20&from=&to=&sort=createdAt:desc`

```json
// Response
{
  "transactions": [
    {
      "id": "uuid",
      "type": "DEPOSIT",
      "status": "CONFIRMED",
      "amount": "0.50000000",
      "fee": "0.00005000",
      "price": 45000.00,
      "total": 22500.00,
      "txHash": "abc123...",
      "confirmations": 6,
      "fromAddress": null,
      "toAddress": "bc1q...",
      "completedAt": "2026-07-01T12:00:00Z",
      "createdAt": "2026-07-01T11:55:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 45 }
}
```

#### POST /wallets/:id/addresses
Generate new deposit address.

```json
// Request
{ "label": "Savings" }
// Response
{ "address": "bc1q...", "derivationPath": "m/44'/0'/0'/0/1" }
```

### 2.5 Transactions (Send/Receive)

#### POST /transactions/send
Send crypto to external wallet.

```json
// Request
{
  "walletId": "uuid",
  "toAddress": "bc1q...",
  "amount": "0.10000000",
  "memo": "Payment",
  "pin": "1234",
  "twoFactorCode": "123456"  // if 2FA enabled for withdrawals
}

// Response
{
  "transaction": {
    "id": "uuid",
    "type": "WITHDRAWAL",
    "status": "PENDING",
    "amount": "0.10000000",
    "fee": "0.00005000",
    "toAddress": "bc1q...",
    "txHash": null,
    "estimatedTime": "10-30 minutes"
  }
}
```

#### POST /transactions/internal
Send to another user on the platform (instant, no fee).

```json
// Request
{
  "walletId": "uuid",
  "recipientEmail": "friend@example.com",
  "amount": "0.05000000",
  "memo": "Thanks!"
}

// Response
{
  "transaction": {
    "id": "uuid",
    "type": "TRANSFER_INTERNAL",
    "status": "CONFIRMED",
    "amount": "0.05000000",
    "fee": "0",
    "fromUser": "...",
    "toUser": "..."
  }
}
```

#### GET /transactions
List all user transactions (paginated, filterable).

**Query:** `?type=DEPOSIT&status=CONFIRMED&assetId=uuid&page=1&limit=20&from=2026-01-01&to=2026-07-06`

```json
// Response
{
  "transactions": [...],
  "meta": { "page": 1, "limit": 20, "total": 150 }
}
```

#### GET /transactions/:id
Get single transaction details.

```json
// Response
{
  "transaction": {
    "id": "uuid",
    "type": "WITHDRAWAL",
    "status": "CONFIRMED",
    "amount": "0.10000000",
    "fee": "0.00005000",
    "price": 45000.00,
    "total": 4500.00,
    "fromAddress": "bc1q...",
    "toAddress": "bc1q...",
    "txHash": "a1b2c3d4e5f6...",
    "blockNumber": 800000,
    "confirmations": 6,
    "blockchainUrl": "https://mempool.space/tx/a1b2..."
  }
}
```

### 2.6 Trading

#### GET /trade/pairs
List all tradable pairs.

```json
// Response
{
  "pairs": [
    {
      "symbol": "BTC/USD",
      "baseAsset": "BTC",
      "quoteAsset": "USD",
      "price": 45000.00,
      "change24h": 1050.00,
      "changePct24h": 2.34,
      "high24h": 45500.00,
      "low24h": 44000.00,
      "volume24h": 1250000000.00,
      "isActive": true
    }
  ]
}
```

#### POST /trade/orders
Place a new order.

```json
// Request
{
  "assetId": "uuid-btc",
  "quoteAssetId": "uuid-usd",
  "type": "LIMIT",
  "side": "BUY",
  "price": 44000.00,
  "quantity": 0.5,
  "timeInForce": "GTC",
  "postOnly": false
}

// Response 201
{
  "order": {
    "id": "uuid",
    "type": "LIMIT",
    "side": "BUY",
    "status": "OPEN",
    "price": 44000.00,
    "quantity": 0.5,
    "filledQuantity": 0,
    "remainingQuantity": 0.5,
    "total": 22000.00,
    "createdAt": "2026-07-06T14:30:00Z"
  }
}
```

#### GET /trade/orders
List user's orders.

**Query:** `?status=OPEN&side=BUY&assetId=uuid&page=1&limit=20`

```json
// Response
{
  "orders": [...],
  "meta": { "page": 1, "limit": 20, "total": 12 }
}
```

#### DELETE /trade/orders/:id
Cancel an open order.

```json
// Response
{ "status": "success", "order": { "id": "uuid", "status": "CANCELLED" } }
```

#### GET /trade/orders/:id
Get order details with trades.

```json
// Response
{
  "order": { ... },
  "trades": [
    {
      "id": "uuid",
      "price": 44000.00,
      "quantity": 0.3,
      "total": 13200.00,
      "fee": 13.20,
      "feeAsset": "USD",
      "createdAt": "..."
    }
  ]
}
```

#### GET /trade/history
Get trade execution history.

**Query:** `?assetId=uuid&from=&to=&page=1&limit=50`

```json
// Response
{
  "trades": [...],
  "meta": { "page": 1, "limit": 50, "total": 350 }
}
```

#### GET /trade/quote
Get a price quote before trading (no order placement).

```json
// Request Query
GET /trade/quote?assetId=uuid&side=BUY&quantity=0.5

// Response
{
  "quote": {
    "asset": "BTC",
    "side": "BUY",
    "quantity": 0.5,
    "price": 45000.00,
    "total": 22500.00,
    "fee": 22.50,
    "feePercent": 0.001,
    "totalWithFee": 22522.50,
    "quoteExpiresAt": "2026-07-06T14:30:30Z",
    "slippage": 0.05
  }
}
```

#### GET /trade/orderbook/:assetId
Get current order book depth.

**Query:** `?depth=50`

```json
// Response
{
  "bids": [
    { "price": 44900.00, "quantity": 1.5, "total": 67350.00 },
    { "price": 44850.00, "quantity": 2.0, "total": 89700.00 }
  ],
  "asks": [
    { "price": 45100.00, "quantity": 0.8, "total": 36080.00 },
    { "price": 45150.00, "quantity": 1.2, "total": 54180.00 }
  ],
  "spread": 200.00,
  "spreadPercent": 0.44
}
```

### 2.7 Market Data

#### GET /market/prices
Get latest prices for all assets.

```json
// Response
{
  "prices": [
    {
      "assetId": "uuid",
      "symbol": "BTC",
      "price": 45000.00,
      "change24h": 1050.00,
      "changePct24h": 2.34,
      "high24h": 45500.00,
      "low24h": 44000.00,
      "volume24h": 1250000000.00,
      "marketCap": 875000000000.00,
      "updatedAt": "2026-07-06T14:30:00Z"
    }
  ]
}
```

#### GET /market/candles/:assetId
Get OHLCV candle data.

**Query:** `?interval=1h&from=2026-07-01T00:00:00Z&to=2026-07-06T23:59:59Z&limit=500`

```json
// Response
{
  "candles": [
    {
      "openTime": "2026-07-06T10:00:00Z",
      "open": 44800.00,
      "high": 45150.00,
      "low": 44750.00,
      "close": 45000.00,
      "volume": 12500.50,
      "trades": 3421
    }
  ]
}
```

#### GET /market/tickers
Streaming ticker data (also available via WebSocket).

```json
// Response
{
  "tickers": {
    "BTC": { "price": 45000, "volume": 1250000 },
    "ETH": { "price": 3000, "volume": 850000 }
  }
}
```

### 2.8 Signals

#### GET /signals
Get active signals feed.

**Query:** `?type=TECHNICAL_ALGO&assetId=uuid&direction=BUY&page=1&limit=20`

```json
// Response
{
  "signals": [
    {
      "id": "uuid",
      "asset": {
        "symbol": "BTC",
        "name": "Bitcoin"
      },
      "type": "TECHNICAL_ALGO",
      "direction": "STRONG_BUY",
      "entryPrice": 44000.00,
      "currentPrice": 45000.00,
      "targetPrice1": 46000.00,
      "targetPrice2": 47500.00,
      "targetPrice3": 50000.00,
      "stopLoss": 42500.00,
      "confidence": 85,
      "timeframe": "1d",
      "rationale": "RSI oversold below 30 on daily timeframe with bullish divergence. Volume spike confirms reversal pattern.",
      "indicators": {
        "rsi": 28.5,
        "macd": "bullish_cross",
        "ma50": 43500,
        "volumeRatio": 2.5
      },
      "strategyName": "RSI Overshoot Bounce",
      "winRate": 72.5,
      "publishedAt": "2026-07-06T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 8 }
}
```

#### GET /signals/:id
Get signal details.

```json
// Response
{
  "signal": { ... },
  "performance": {
    "totalSignals": 50,
    "wins": 36,
    "losses": 14,
    "winRate": 72.0,
    "avgPnlPercent": 8.5,
    "totalPnl": 42500.00
  }
}
```

#### POST /signals/:id/subscribe
Subscribe to receive this signal.

```json
// Request
{ "autoTrade": false }

// Response
{ "status": "success", "subscription": { "id": "uuid", "autoTrade": false } }
```

#### DELETE /signals/:id/subscribe
Unsubscribe from signal.

```json
// Response 200
{ "status": "success" }
```

#### POST /signals
Create a community signal (premium users only).

```json
// Request
{
  "assetId": "uuid",
  "direction": "BUY",
  "entryPrice": 44000.00,
  "targetPrice1": 46000.00,
  "targetPrice2": 47500.00,
  "stopLoss": 42500.00,
  "timeframe": "1d",
  "rationale": "Technical analysis shows...",
  "indicators": { "rsi": 32 }
}

// Response 201
{ "signal": { ... } }
```

### 2.9 Price Alerts

#### GET /alerts
List user's price alerts.

```json
// Response
{
  "alerts": [
    {
      "id": "uuid",
      "asset": { "symbol": "BTC" },
      "condition": "ABOVE",
      "value": 50000.00,
      "currentValue": 45000.00,
      "status": "ACTIVE",
      "createdAt": "2026-07-01T12:00:00Z"
    }
  ]
}
```

#### POST /alerts
Create a new price alert.

```json
// Request
{
  "assetId": "uuid",
  "condition": "ABOVE",
  "value": 50000.00,
  "notifyEmail": true,
  "notifyPush": true,
  "expiresAt": "2026-08-01T00:00:00Z"
}

// Response 201
{ "alert": { ... } }
```

#### DELETE /alerts/:id
Delete a price alert.

```json
// Response 200
{ "status": "success" }
```

### 2.10 Fiat On-Ramp / Off-Ramp

#### POST /payment/buy
Initialize fiat-to-crypto purchase.

```json
// Request
{
  "assetId": "uuid",
  "fiatCurrency": "USD",
  "fiatAmount": 500.00,
  "paymentMethod": "credit_card"
}

// Response
{
  "paymentUrl": "https://buy.moonpay.com/widget?...",
  "transactionId": "uuid",
  "estimatedCryptoAmount": "0.01111000",
  "fee": 15.00,
  "totalWithFee": 515.00
}
```

#### POST /payment/sell
Initialize crypto-to-fiat sell.

```json
// Request
{
  "assetId": "uuid",
  "cryptoAmount": "0.10000000",
  "withdrawalMethod": "bank_transfer"
}

// Response
{
  "transactionId": "uuid",
  "estimatedFiatAmount": 4470.00,
  "fee": 22.35,
  "exchangeRate": 45000.00,
  "processingTime": "1-3 business days"
}
```

#### GET /payment/methods
Get available payment methods.

```json
// Response
{
  "methods": [
    {
      "type": "credit_card",
      "provider": "MoonPay",
      "feePercent": 3.5,
      "minAmount": 50,
      "maxAmount": 10000,
      "processingTime": "instant",
      "supportedCurrencies": ["USD", "EUR", "GBP"]
    },
    {
      "type": "bank_transfer",
      "provider": "Stripe",
      "feePercent": 1.0,
      "minAmount": 1000,
      "maxAmount": 50000,
      "processingTime": "1-3 business days",
      "supportedCurrencies": ["USD", "EUR", "GBP"]
    }
  ]
}
```

### 2.11 Admin Endpoints

All admin endpoints are prefixed with `/admin` and require `ADMIN` or `SUPER_ADMIN` role.

#### GET /admin/users
List all users with filters.

**Query:** `?role=&kycLevel=&isActive=true&isLocked=&search=email&page=1&limit=50`

```json
{
  "users": [...],
  "meta": { "page": 1, "limit": 50, "total": 2500 }
}
```

#### PATCH /admin/users/:id
Update user status (lock, verify KYC, change role).

```json
// Request
{ "isLocked": true, "lockReason": "Suspicious activity", "role": "VERIFIED_USER" }
// Response
{ "user": { ... } }
```

#### GET /admin/transactions
Monitor all transactions.

**Query:** `?status=PENDING&type=WITHDRAWAL&page=1&limit=50`

```json
{ "transactions": [...], "meta": { ... } }
```

#### POST /admin/transactions/:id/approve
Approve pending withdrawal.

```json
// Response
{ "transaction": { "status": "PROCESSING" } }
```

#### POST /admin/transactions/:id/reject
Reject pending withdrawal.

```json
// Request
{ "reason": "Suspicious address" }
// Response
{ "transaction": { "status": "FAILED" } }
```

#### GET /admin/signals/moderation
Get signal moderation queue.

```json
{ "signals": [...], "meta": { ... } }
```

#### PATCH /admin/signals/:id/moderate
Approve or reject community signal.

```json
// Request
{ "status": "ACTIVE" }
// Response
{ "signal": { ... } }
```

#### GET /admin/stats
Dashboard statistics.

```json
{
  "totalUsers": 25000,
  "activeToday": 8500,
  "totalVolume24h": 1250000.00,
  "totalFees24h": 3750.00,
  "pendingWithdrawals": 45,
  "pendingKyc": 120,
  "signalsActive": 35,
  "systemHealth": {
    "cpu": 45,
    "memory": 62,
    "dbConnections": 28,
    "avgResponseTime": 145
  }
}
```

### 2.12 WebSocket Events

#### Connection
```
wss://api.cryptowallet.app/ws?token=<access_token>
```

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `subscribe:prices` | `["BTC-USD", "ETH-USD"]` | Subscribe to price feeds |
| `unsubscribe:prices` | `["BTC-USD"]` | Unsubscribe from price feeds |
| `subscribe:orders` | `{}` | Subscribe to own order updates |
| `subscribe:balance` | `{}` | Subscribe to own balance updates |
| `subscribe:signals` | `{assetId?: string}` | Subscribe to signal feed |
| `ping` | `{}` | Keep-alive |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `price:update` | `{ symbol: "BTC", price: 45000, change24h: 2.34, volume: 1250000 }` | Price tick |
| `order:update` | `{ orderId: "uuid", status: "FILLED", filledQty: 0.5 }` | Order status change |
| `balance:update` | `{ asset: "BTC", balance: 2.5, locked: 0.5 }` | Balance change |
| `signal:new` | `{ signal: { ... } }` | New signal published |
| `alert:triggered` | `{ alertId: "uuid", message: "BTC above $50k" }` | Price alert fired |
| `trade:executed` | `{ trade: { ... } }` | User's trade executed |
| `notification` | `{ type, title, body }` | General notification |
| `pong` | `{}` | Keep-alive response |

---

## 3. API Versioning

- Current: `v1` (URL-prefixed)
- Breaking changes → `v2`
- Deprecated endpoints: `Deprecation: timestamp` header + 6-month sunset period
- All versions documented via Swagger at `/api/v1/docs`

## 4. SDK / Client Libraries

```typescript
// Planned client SDK structure
import { WalletClient } from '@cryptowallet/sdk';

const client = new WalletClient({
  apiKey: 'xxx',
  baseUrl: 'https://api.cryptowallet.app',
});

// Available services
client.auth.login(email, password);
client.wallets.list();
client.trade.placeOrder({ side: 'BUY', quantity: 0.5, price: 44000 });
client.signals.list({ direction: 'BUY' });
client.alerts.create({ assetId: 'btc', condition: 'ABOVE', value: 50000 });
```

---

**Next Document:** [05-Frontend-Architecture.md](05-Frontend-Architecture.md)
