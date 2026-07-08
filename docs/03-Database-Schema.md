# Database Schema
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

**ORM:** Prisma 5.x
**Database:** PostgreSQL 16

---

## 1. Entity Relationship Diagram (Textual)

```
users ──1:N──> wallets ──1:N──> wallet_addresses
users ──1:N──> transactions
users ──1:N──> orders ──1:N──> trades
users ──1:N──> price_alerts
users ──1:N──> kyc_documents
users ──1:N──> sessions
users ──1:N──> api_keys
users ──1:N──> signal_subscriptions
users ──1:N──> copy_trading_subscriptions
users ──1:N──> user_settings

signals ──1:N──> signal_performance
signals ──N:M──> users (via signal_subscriptions)

assets ──1:N──> market_prices
assets ──1:N──> wallets
assets ──1:N──> signals
assets ──1:N──> order_books

audit_logs ──N:1──> users
notifications ──N:1──> users
```

## 2. Complete Prisma Schema

```prisma
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions", "fullTextSearch"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgcrypto, uuidOsp]
}

// ============================================================
// USER & AUTHENTICATION
// ============================================================

enum UserRole {
  USER
  VERIFIED_USER
  PREMIUM_USER
  ADMIN
  SUPER_ADMIN
}

enum KYCLevel {
  NONE
  BASIC      // email + phone
  VERIFIED   // ID + selfie
  ADVANCED   // address proof + source of funds
}

model User {
  id                String    @id @default(uuid()) @db.Uuid
  email             String    @unique
  emailVerified     Boolean   @default(false)
  phone             String?   @unique
  phoneVerified     Boolean   @default(false)
  passwordHash      String
  displayName       String?
  avatarUrl         String?
  role              UserRole  @default(USER)
  kycLevel          KYCLevel  @default(NONE)
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?   // encrypted TOTP secret
  twoFactorMethod   String?   // "app" | "sms"
  isActive          Boolean   @default(true)
  isLocked          Boolean   @default(false)
  lockReason        String?
  lastLoginAt       DateTime?
  lastActiveAt      DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  // Relations
  wallets               Wallet[]
  transactions          Transaction[]
  orders                Order[]
  priceAlerts           PriceAlert[]
  kycDocuments          KycDocument[]
  sessions              Session[]
  apiKeys               ApiKey[]
  signalSubscriptions   SignalSubscription[]
  copyTradingSubs       CopyTradingSubscription[]
  userSettings          UserSettings?
  notifications         Notification[]
  auditLogs             AuditLog[]
  addresses             WhitelistedAddress[]

  @@index([email])
  @@index([role])
  @@index([kycLevel])
  @@map("users")
}

model Session {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String    @db.Uuid
  refreshToken  String    @unique
  deviceInfo    Json?     // device fingerprint, user agent, IP
  ipAddress     String?   @db.Inet
  isRevoked     Boolean   @default(false)
  expiresAt     DateTime
  createdAt     DateTime  @default(now())

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

model ApiKey {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  label       String
  keyPrefix   String    // first 8 chars for identification
  keyHash     String    // SHA-256 of full key
  permissions Json      @default("[\"read\"]") // ["read", "trade", "withdraw"]
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())

  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([keyPrefix, keyHash])
  @@index([userId])
  @@map("api_keys")
}

model UserSettings {
  id                    String   @id @default(uuid()) @db.Uuid
  userId                String   @unique @db.Uuid
  language              String   @default("en")
  currency              String   @default("USD")
  theme                 String   @default("system") // "light" | "dark" | "system"
  notificationPrice     Boolean  @default(true)
  notificationSignal    Boolean  @default(true)
  notificationTrade     Boolean  @default(true)
  notificationSystem    Boolean  @default(true)
  chartLayout           Json?    // TradingView layout preferences
  emailNotifications    Boolean  @default(true)
  smsNotifications      Boolean  @default(false)
  pushNotifications     Boolean  @default(true)
  withdrawalLimitDaily  Decimal? @db.Decimal(18, 8)
  withdrawalLimitMonthly Decimal? @db.Decimal(18, 8)
  defaultSlippage       Decimal  @default(0.5) @db.Decimal(5, 2) // percentage
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_settings")
}

// ============================================================
// KYC & COMPLIANCE
// ============================================================

enum KycStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
  REQUEST_RESUBMISSION
}

model KycDocument {
  id            String    @id @default(uuid()) @db.Uuid
  userId        String    @db.Uuid
  documentType  String    // "passport" | "drivers_license" | "national_id" | "proof_of_address" | "selfie"
  status        KycStatus @default(PENDING)
  fileUrl       String    // S3/Cloudflare R2 URL
  fileHash      String    // SHA-256 for integrity
  metadata      Json?     // extracted info (name, DOB, document number - encrypted)
  rejectionReason String?
  verifiedBy    String?   // admin user ID
  verifiedAt    DateTime?
  expiresAt     DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([status])
  @@map("kyc_documents")
}

// ============================================================
// WALLET & ASSETS
// ============================================================

model Asset {
  id              String   @id @default(uuid()) @db.Uuid
  symbol          String   @unique    // BTC, ETH, USDT, etc.
  name            String              // Bitcoin, Ethereum, Tether
  type            String   @default("cryptocurrency") // "cryptocurrency" | "fiat"
  decimals        Int                 // 8 for BTC, 18 for ETH
  logoUrl         String?
  isActive        Boolean  @default(true)
  isSupported     Boolean  @default(true)
  minWithdrawal   Decimal  @default(0.0001) @db.Decimal(18, 8)
  maxWithdrawal   Decimal? @db.Decimal(18, 8)
  withdrawalFee   Decimal  @default(0.0005) @db.Decimal(18, 8)
  depositFee      Decimal  @default(0) @db.Decimal(18, 8)
  tradingFee      Decimal  @default(0.001) @db.Decimal(6, 4) // 0.1%
  network         String?             // "bitcoin", "ethereum", "solana", "polygon"
  contractAddress String? @unique     // for ERC20/BEP20 tokens
  rank            Int?                // CoinGecko market cap rank
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  wallets       Wallet[]
  marketPrices  MarketPrice[]
  signals       Signal[]
  orderBooks    OrderBook[]
  transactions  Transaction[]

  @@index([symbol])
  @@index([isActive])
  @@map("assets")
}

enum WalletType {
  CUSTODIAL       // Server-managed
  NON_CUSTODIAL   // User-managed keys
}

model Wallet {
  id          String     @id @default(uuid()) @db.Uuid
  userId      String     @db.Uuid
  assetId     String     @db.Uuid
  type        WalletType @default(CUSTODIAL)
  balance     Decimal    @default(0) @db.Decimal(18, 8)
  lockedBalance Decimal  @default(0) @db.Decimal(18, 8) // in open orders
  totalDeposited Decimal @default(0) @db.Decimal(18, 8)
  totalWithdrawn Decimal @default(0) @db.Decimal(18, 8)
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  asset       Asset      @relation(fields: [assetId], references: [id])
  addresses   WalletAddress[]
  transactions Transaction[] // where this wallet was involved

  @@unique([userId, assetId, type])
  @@index([userId])
  @@index([assetId])
  @@map("wallets")
}

model WalletAddress {
  id          String   @id @default(uuid()) @db.Uuid
  walletId    String   @db.Uuid
  address     String
  derivationPath String?  // BIP44 derivation path for HD wallets
  label       String?  // user-assigned label
  isActive    Boolean  @default(true)
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())

  wallet      Wallet   @relation(fields: [walletId], references: [id], onDelete: Cascade)

  @@unique([address])
  @@index([walletId])
  @@map("wallet_addresses")
}

// ============================================================
// TRANSACTIONS
// ============================================================

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  TRANSFER_INTERNAL
  BUY
  SELL
  FEE
  SIGNAL_FEE
}

enum TransactionStatus {
  PENDING
  PROCESSING
  CONFIRMED
  FAILED
  CANCELLED
  REFUNDED
}

model Transaction {
  id              String            @id @default(uuid()) @db.Uuid
  userId          String            @db.Uuid
  walletId        String?           @db.Uuid
  type            TransactionType
  status          TransactionStatus @default(PENDING)
  assetId         String            @db.Uuid
  amount          Decimal           @db.Decimal(18, 8)
  fee             Decimal           @default(0) @db.Decimal(18, 8)
  feeAssetId      String?           @db.Uuid
  price           Decimal?          @db.Decimal(18, 8) // USD price at time
  total           Decimal?          @db.Decimal(18, 8) // total in USD
  fromAddress     String?
  toAddress       String?
  txHash          String?           @unique // blockchain transaction hash
  blockNumber     BigInt?
  confirmations   Int               @default(0)
  requiredConfirmations Int         @default(1)
  memo            String?
  metadata        Json?             // flexible metadata
  failureReason   String?
  approvedBy      String?           // admin for manual approvals
  approvedAt      DateTime?
  completedAt     DateTime?
  expiresAt       DateTime?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  user            User              @relation(fields: [userId], references: [id])
  wallet          Wallet?           @relation(fields: [walletId], references: [id])
  asset           Asset             @relation(fields: [assetId], references: [id])

  @@index([userId])
  @@index([walletId])
  @@index([status])
  @@index([type])
  @@index([txHash])
  @@index([createdAt])
  @@map("transactions")
}

// ============================================================
// TRADING
// ============================================================

enum OrderType {
  MARKET
  LIMIT
  STOP_LIMIT
  STOP_LOSS
  TAKE_PROFIT
}

enum OrderSide {
  BUY
  SELL
}

enum OrderStatus {
  PENDING
  OPEN
  PARTIALLY_FILLED
  FILLED
  CANCELLED
  EXPIRED
  FAILED
}

model Order {
  id              String      @id @default(uuid()) @db.Uuid
  userId          String      @db.Uuid
  assetId         String      @db.Uuid
  quoteAssetId    String      @db.Uuid        // USDT, USD, etc.
  type            OrderType   @default(MARKET)
  side            OrderSide
  status          OrderStatus @default(PENDING)
  price           Decimal?    @db.Decimal(18, 8) // limit price (null for market)
  stopPrice       Decimal?    @db.Decimal(18, 8) // for stop orders
  quantity        Decimal     @db.Decimal(18, 8) // amount of base asset
  filledQuantity  Decimal     @default(0) @db.Decimal(18, 8)
  remainingQuantity Decimal   @db.Decimal(18, 8)
  total           Decimal?    @db.Decimal(18, 8) // quote total
  filledTotal     Decimal?    @db.Decimal(18, 8)
  avgFillPrice    Decimal?    @db.Decimal(18, 8)
  fee             Decimal?    @db.Decimal(18, 8)
  feeAssetId      String?     @db.Uuid
  slippage        Decimal?    @db.Decimal(5, 2) // allowed slippage %
  timeInForce     String      @default("GTC") // GTC, IOC, FOK
  postOnly        Boolean     @default(false)
  reduceOnly      Boolean     @default(false)
  triggerCondition String?    // "gte" | "lte" for stop orders
  metadata        Json?
  expiresAt       DateTime?
  filledAt        DateTime?
  cancelledAt     DateTime?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation(fields: [userId], references: [id])
  asset           Asset       @relation(fields: [assetId], references: [id])
  trades          Trade[]

  @@index([userId])
  @@index([status])
  @@index([assetId, status])
  @@index([createdAt])
  @@map("orders")
}

model Trade {
  id          String   @id @default(uuid()) @db.Uuid
  orderId     String   @db.Uuid
  userId      String   @db.Uuid
  assetId     String   @db.Uuid
  side        OrderSide
  price       Decimal  @db.Decimal(18, 8)
  quantity    Decimal  @db.Decimal(18, 8)
  total       Decimal  @db.Decimal(18, 8)
  fee         Decimal  @default(0) @db.Decimal(18, 8)
  feeAssetId  String?  @db.Uuid
  takerOrderId String? // for matching engine tracking
  makerOrderId String?
  createdAt   DateTime @default(now())

  order       Order    @relation(fields: [orderId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  asset       Asset    @relation(fields: [assetId], references: [id])

  @@index([orderId])
  @@index([userId])
  @@index([assetId, createdAt])
  @@map("trades")
}

model OrderBook {
  id        String   @id @default(uuid()) @db.Uuid
  assetId   String   @db.Uuid
  side      OrderSide
  price     Decimal  @db.Decimal(18, 8)
  quantity  Decimal  @db.Decimal(18, 8)
  total     Decimal  @db.Decimal(18, 8)
  orderCount Int     @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  asset     Asset    @relation(fields: [assetId], references: [id])

  @@index([assetId, side, price])
  @@map("order_books")
}

// ============================================================
// MARKET DATA
// ============================================================

model MarketPrice {
  id              String   @id @default(uuid()) @db.Uuid
  assetId         String   @db.Uuid
  price           Decimal  @db.Decimal(18, 8)
  priceChange24h  Decimal? @db.Decimal(18, 8)
  priceChangePct24h Decimal? @db.Decimal(10, 4)
  high24h         Decimal? @db.Decimal(18, 8)
  low24h          Decimal? @db.Decimal(18, 8)
  volume24h       Decimal? @db.Decimal(18, 2)
  marketCap       Decimal? @db.Decimal(18, 2)
  bidPrice        Decimal? @db.Decimal(18, 8) // top bid
  askPrice        Decimal? @db.Decimal(18, 8) // top ask
  timestamp       DateTime @default(now())

  asset           Asset    @relation(fields: [assetId], references: [id])

  @@index([assetId, timestamp])
  @@map("market_prices")
}

model Candle {
  id        String   @id @default(uuid()) @db.Uuid
  assetId   String   @db.Uuid
  interval  String   // "1m", "5m", "15m", "1h", "4h", "1d", "1w"
  openTime  DateTime
  closeTime DateTime
  open      Decimal  @db.Decimal(18, 8)
  high      Decimal  @db.Decimal(18, 8)
  low       Decimal  @db.Decimal(18, 8)
  close     Decimal  @db.Decimal(18, 8)
  volume    Decimal  @db.Decimal(18, 2)
  trades    Int      @default(0)
  createdAt DateTime @default(now())

  @@unique([assetId, interval, openTime])
  @@index([assetId, interval, openTime])
  @@map("candles")
}

// ============================================================
// TRADING SIGNALS
// ============================================================

enum SignalType {
  TECHNICAL_ALGO    // Algorithmic from TA indicators
  COMMUNITY         // User-submitted
  PREMIUM_PROVIDER  // Paid signal provider
  COPY_TRADING      // Copy trading signal (mirrors trader)
}

enum SignalDirection {
  STRONG_BUY
  BUY
  NEUTRAL
  SELL
  STRONG_SELL
}

enum SignalStatus {
  ACTIVE
  TARGET_HIT
  STOP_LOSS_HIT
  EXPIRED
  CANCELLED
}

model Signal {
  id              String          @id @default(uuid()) @db.Uuid
  userId          String?         @db.Uuid   // null for system/ALGO signals
  assetId         String          @db.Uuid
  type            SignalType
  direction       SignalDirection
  status          SignalStatus    @default(ACTIVE)
  entryPrice      Decimal?        @db.Decimal(18, 8)
  currentPrice    Decimal?        @db.Decimal(18, 8)
  targetPrice1    Decimal?        @db.Decimal(18, 8)
  targetPrice2    Decimal?        @db.Decimal(18, 8)
  targetPrice3    Decimal?        @db.Decimal(18, 8)
  stopLoss        Decimal?        @db.Decimal(18, 8)
  confidence      Int?            @default(70) // 0-100
  timeframe       String?                     // "1h", "4h", "1d"
  rationale       String?         @db.Text
  indicators      Json?                       // which indicators triggered
  strategyName    String?                     // e.g., "RSI Overshoot Bounce"
  isPremium       Boolean         @default(false)
  subscribers     Int             @default(0)
  winRate         Decimal?        @db.Decimal(5, 2)
  totalPnl        Decimal?        @db.Decimal(18, 8)
  metadata        Json?
  publishedAt     DateTime        @default(now())
  closedAt        DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  asset           Asset           @relation(fields: [assetId], references: [id])
  signalPerformance SignalPerformance[]
  subscriptions   SignalSubscription[]

  @@index([assetId, status])
  @@index([type, status])
  @@index([direction])
  @@index([publishedAt])
  @@map("signals")
}

model SignalPerformance {
  id        String   @id @default(uuid()) @db.Uuid
  signalId  String   @db.Uuid
  userId    String?  @db.Uuid    // user who followed this signal
  entryPrice Decimal @db.Decimal(18, 8)
  exitPrice Decimal? @db.Decimal(18, 8)
  quantity   Decimal @db.Decimal(18, 8)
  pnl       Decimal? @db.Decimal(18, 8)
  pnlPercent Decimal? @db.Decimal(10, 4)
  roi       Decimal? @db.Decimal(10, 4)
  heldDays  Int?
  exitedAt  DateTime?
  createdAt DateTime @default(now())

  signal    Signal   @relation(fields: [signalId], references: [id])

  @@index([signalId])
  @@index([userId])
  @@map("signal_performance")
}

model SignalSubscription {
  id              String   @id @default(uuid()) @db.Uuid
  userId          String   @db.Uuid
  signalId        String   @db.Uuid
  autoTrade       Boolean  @default(false) // auto-execute signals
  maxAllocation   Decimal? @db.Decimal(18, 8) // max amount to auto-trade
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  signal          Signal   @relation(fields: [signalId], references: [id], onDelete: Cascade)

  @@unique([userId, signalId])
  @@map("signal_subscriptions")
}

// ============================================================
// COPY TRADING
// ============================================================

model CopyTradingSubscription {
  id                String   @id @default(uuid()) @db.Uuid
  followerId        String   @db.Uuid        // user copying
  traderId          String   @db.Uuid        // user being copied
  allocationAmount  Decimal  @db.Decimal(18, 8) // total allocated
  usedAmount        Decimal  @default(0) @db.Decimal(18, 8)
  profitShare       Decimal  @default(0.2) @db.Decimal(5, 4) // 20%
  maxDrawdown       Decimal? @db.Decimal(5, 2) // % max drawdown before auto-stop
  isActive          Boolean  @default(true)
  stopLossTriggered Boolean  @default(false)
  totalPnl          Decimal  @default(0) @db.Decimal(18, 8)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  follower          User     @relation("copy_follower", fields: [followerId], references: [id], onDelete: Cascade)
  trader            User     @relation("copy_trader", fields: [traderId], references: [id], onDelete: Cascade)

  @@unique([followerId, traderId])
  @@index([traderId])
  @@map("copy_trading_subscriptions")
}

// ============================================================
// PRICE ALERTS
// ============================================================

enum AlertCondition {
  ABOVE
  BELOW
  CROSSES_ABOVE
  CROSSES_BELOW
  CHANGE_PCT
  VOLUME_SPIKE
}

enum AlertStatus {
  ACTIVE
  TRIGGERED
  DISABLED
  EXPIRED
}

model PriceAlert {
  id              String         @id @default(uuid()) @db.Uuid
  userId          String         @db.Uuid
  assetId         String         @db.Uuid
  condition       AlertCondition
  value           Decimal        @db.Decimal(18, 8)
  currentValue    Decimal?       @db.Decimal(18, 8)
  status          AlertStatus    @default(ACTIVE)
  notifyEmail     Boolean        @default(true)
  notifyPush      Boolean        @default(true)
  notifySms       Boolean        @default(false)
  triggeredAt     DateTime?
  expiresAt       DateTime?
  cooldownMinutes Int?           @default(60) // prevent re-trigger
  lastTriggeredAt DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  asset           Asset          @relation(fields: [assetId], references: [id])

  @@index([userId])
  @@index([assetId, status])
  @@map("price_alerts")
}

// ============================================================
// WHITELISTED ADDRESSES (Withdrawal Security)
// ============================================================

model WhitelistedAddress {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  address   String
  network   String   // "bitcoin", "ethereum", etc.
  label     String
  isActive  Boolean  @default(false)
  cooldownUntil DateTime? // 24h activation delay for security
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, address, network])
  @@map("whitelisted_addresses")
}

// ============================================================
// NOTIFICATIONS
// ============================================================

enum NotificationType {
  PRICE_ALERT
  SIGNAL
  TRADE_COMPLETED
  DEPOSIT_CONFIRMED
  WITHDRAWAL_STATUS
  SYSTEM
  KYC_UPDATE
  SECURITY
}

model Notification {
  id        String           @id @default(uuid()) @db.Uuid
  userId    String           @db.Uuid
  type      NotificationType
  title     String
  body      String?          @db.Text
  data      Json?            // action payload (e.g., { orderId: "..." })
  isRead    Boolean          @default(false)
  readAt    DateTime?
  createdAt DateTime         @default(now())

  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

// ============================================================
// AUDIT LOGGING
// ============================================================

enum AuditAction {
  LOGIN
  LOGOUT
  LOGIN_FAILED
  TWO_FACTOR_ENABLED
  TWO_FACTOR_DISABLED
  PASSWORD_CHANGED
  WITHDRAWAL_CREATED
  WITHDRAWAL_APPROVED
  WITHDRAWAL_REJECTED
  ORDER_CREATED
  ORDER_CANCELLED
  KYC_SUBMITTED
  KYC_APPROVED
  KYC_REJECTED
  PROFILE_UPDATED
  API_KEY_CREATED
  API_KEY_REVOKED
  ADMIN_ACTION
  ADDRESS_WHITELISTED
  SIGNAL_CREATED
  SIGNAL_CANCELLED
}

model AuditLog {
  id          String      @id @default(uuid()) @db.Uuid
  userId      String?     @db.Uuid
  action      AuditAction
  resource    String?     // e.g., "withdrawal", "order"
  resourceId  String?     // ID of affected resource
  metadata    Json?       // request context, changes
  ipAddress   String?     @db.Inet
  userAgent   String?
  severity    String      @default("info") // "info", "warning", "critical"
  createdAt   DateTime    @default(now())

  user        User?       @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([action])
  @@index([createdAt])
  @@index([resource, resourceId])
  @@map("audit_logs")
}

// ============================================================
// SYSTEM
// ============================================================

model SystemConfig {
  id        String   @id @default(uuid()) @db.Uuid
  key       String   @unique
  value     Json
  updatedBy String?  // admin user ID
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("system_config")
}
```

## 3. Indexing Strategy

| Table | Index | Type | Reason |
|-------|-------|------|--------|
| `transactions` | `(userId, createdAt DESC)` | B-tree | User transaction history |
| `transactions` | `(status, type)` | B-tree | Admin filtering |
| `transactions` | `(txHash)` | B-tree (unique) | Blockchain lookup |
| `orders` | `(userId, status)` | B-tree | User open orders |
| `orders` | `(assetId, status, price)` | B-tree | Matching engine |
| `candles` | `(assetId, interval, openTime DESC)` | B-tree (unique) | OHLCV queries |
| `market_prices` | `(assetId, timestamp DESC)` | B-tree | Latest prices |
| `signals` | `(assetId, status)` | B-tree | Active signals feed |
| `sessions` | `(expiresAt)` | B-tree (partial) | Cleanup expired |
| `audit_logs` | `(createdAt DESC)` | B-tree | Time-range queries |

## 4. Partitioning Strategy

For scaling, partition high-volume tables:

```sql
-- Transactions: Partition by month
CREATE TABLE transactions (...) PARTITION BY RANGE (created_at);

-- Candles: Partition by asset + interval (time-based sub-partitions)
CREATE TABLE candles (...) PARTITION BY LIST (asset_id);

-- Audit logs: Partition by month, auto-drop after 12 months
CREATE TABLE audit_logs (...) PARTITION BY RANGE (created_at);
```

## 5. Redis Data Structures

| Key Pattern | Type | Purpose | TTL |
|-------------|------|---------|-----|
| `session:{token}` | String | Session data | 7d |
| `balance:{userId}:{assetId}` | String | Cached balance | 30s |
| `price:{assetId}` | String | Latest price | 5s |
| `candles:{assetId}:{interval}` | Sorted Set | Recent candles | 5m |
| `orderbook:{assetId}:bids` | ZSET | Bids sorted by price desc | 10s |
| `orderbook:{assetId}:asks` | ZSET | Asks sorted by price asc | 10s |
| `rate_limit:{key}` | String | Rate limiter counter | 1m |
| `ws:user:{userId}` | Set | Active socket IDs | session |
| `queue:{name}` | List | Bull queue | - |

---

**Next Document:** [04-API-Specification.md](04-API-Specification.md)
