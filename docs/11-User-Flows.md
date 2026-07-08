# User Flows
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06

---

## Table of Contents

1. [Onboarding & Authentication](#1-onboarding--authentication)
2. [Deposit Funds](#2-deposit-funds)
3. [Spot Trading (Buy)](#3-spot-trading-buy)
4. [Spot Trading (Sell)](#4-spot-trading-sell)
5. [Portfolio Dashboard](#5-portfolio-dashboard)
6. [Withdraw Funds](#6-withdraw-funds)
7. [Trading Signals](#7-trading-signals)
8. [Order History & Management](#8-order-history--management)
9. [Wallet Management](#9-wallet-management)
10. [KYC / Identity Verification](#10-kyc--identity-verification)
11. [Alert Configuration](#11-alert-configuration)
12. [Settings & Profile](#12-settings--profile)
13. [Error & Edge Cases](#13-error--edge-cases)

---

> **Notation:** → = screen transition, [Action] = user action, ◇ = decision point, ⚠ = edge case

---

## 1. Onboarding & Authentication

### 1.1 First-Time User Registration

```
                  ┌──────────────────────┐
                  │   Landing Page        │
                  │                      │
                  │  ▲ Logo (gold)       │
                  │  "Trade smarter..."  │
                  │  [Sign Up] [Sign In] │
                  └──────────┬───────────┘
                             │ [Sign Up]
                             ▼
                  ┌──────────────────────┐
                  │  Create Account       │
                  │                      │
                  │  Email                │
                  │  Password             │
                  │  Confirm Password     │
                  │  [ ] Accept Terms     │
                  │                      │
                  │  [Create Account]     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │  Email Verification   │
                  │                      │
                  │  "Check your inbox"  │
                  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐│
                  │  │  │ │  │ │  │ │  ││ ← 6-digit code
                  │  └──┘ └──┘ └──┘ └──┘│
                  │  [Verify]            │
                  │  Resend in 0:45      │
                  └──────────┬───────────┘
                             │
                  ┌──────────┴───────────┐
                  │                      │
                  ▼                      ▼
         ┌──────────────────┐  ┌──────────────────┐
         │  Verification     │  │  Verification     │
         │  Success          │  │  Failed           │
         │                   │  │                   │
         │  ✓ Email verified │  │  ✗ Invalid code   │
         │  [Continue]       │  │  [Try Again]      │
         └────────┬─────────┘  └────────┬─────────┘
                  │                      │
                  │                (back to code entry)
                  ▼
         ┌──────────────────┐
         │  Welcome Screen  │
         │                  │
         │  "Set up your    │
         │   profile"       │
         │                  │
         │  Full Name        │
         │  Username         │
         │  Phone (optional) │
         │                  │
         │  [Next → KYC]    │
         │  [Skip for now]  │
         └──────────────────┘
```

**Edge Cases:**
- ⚠ Email already registered → "An account with this email already exists. [Sign In] [Reset Password]"
- ⚠ Weak password → inline validation with requirements (min 8 chars, uppercase, number, special)
- ⚠ Network timeout during verification → "Connection lost. [Retry]" with auto-retry (3 attempts)
- ⚠ Rate-limited resend → "Too many attempts. Try again in 2 minutes."
- ⚠ Expired verification code → "Code expired. [Resend New Code]"

### 1.2 Returning User Sign-In

```
         ┌──────────────────────┐
         │      Sign In         │
         │                      │
         │  Email                │
         │  Password             │
         │  [ ] Remember me      │
         │                      │
         │  [Sign In]            │
         │  Forgot Password?     │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  2FA Verification    │  ← If 2FA enabled
         │                      │
         │  "Enter authenticator│
         │   code or SMS code"  │
         │  ┌──┐ ┌──┐ ┌──┐ ┌──┐│
         │  │  │ │  │ │  │ │  ││
         │  └──┘ └──┘ └──┘ └──┘│
         │  [Verify]            │
         │  [Use recovery code] │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Dashboard          │
         │   (Portfolio View)   │
         └──────────────────────┘
```

**Edge Cases:**
- ⚠ Account locked (5 failed attempts) → "Account temporarily locked. Try again in 15 minutes."
- ⚠ 2FA device lost → "Use one of your recovery codes" (then prompt to reconfigure 2FA)
- ⚠ Suspicious login (new IP/location) → Email verification step before granting access
- ⚠ Session expired mid-trade → Auto-save draft order, redirect to sign-in, restore draft post-auth

### 1.3 Password Reset

```
  Forgot Password → Enter Email → Send Reset Link → Check Email →
  Click Link → New Password → Confirm → Success → Redirect to Sign In

  ⚠ Link expired → "Reset link expired. [Request New]"
  ⚠ Invalid token → Redirect to forgot-password with error message
```

---

## 2. Deposit Funds

### 2.1 Crypto Deposit

```
         ┌──────────────────────┐
         │  Wallet Dashboard    │
         │                      │
         │  [Deposit]           │ ← Gold CTA button
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Deposit             │
         │                      │
         │  Currency: ┌──────┐  │
         │            │ BTC  │  │ ← Dropdown selector
         │            └──────┘  │
         │  Network: ┌──────┐   │
         │           │ BTC  │   │ ← Auto-matched to currency
         │           └──────┘   │
         │                      │
         │  [Generate Address]  │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────────────────┐
         │  Deposit Address                  │
         │                                   │
         │  ₿ Bitcoin (BTC)                  │
         │  Network: Bitcoin (BTC)           │
         │                                   │
         │  ┌────────────────────────────┐  │
         │  │ bc1q5v9...7l3k             │  │
         │  │                            │  │
         │  │   [Copy]  [Share]  [QR]   │  │
         │  └────────────────────────────┘  │
         │                                   │
         │  ┌────────────────────────────┐  │
         │  │     ██████████████         │  │  ← QR Code
         │  │     ██  QR Code  ██        │  │
         │  │     ██████████████         │  │
         │  └────────────────────────────┘  │
         │                                   │
         │  ⚠ Send only BTC to this addr    │
         │  Minimum deposit: 0.001 BTC       │
         │                                   │
         │  ┌────────────────────────────┐  │
         │  │  Recent Deposits           │  │
         │  │  ─────────────────         
         │  │  No recent deposits        │  │
         │  └────────────────────────────┘  │
         └──────────────────────────────────┘
```

**Success Flow:**
```
  [Send crypto from external wallet]
         │
         ▼
  ┌──────────────────────┐
  │  Transaction          │
  │  Pending (0/2 confs)  │ ← Shows in recent deposits
  │                      │     with animation
  └──────────────────────┘
         │ (1-30 min)
         ▼
  ┌──────────────────────┐
  │  Transaction          │
  │  Completed (2+ confs) │ ← Push notification sent
  │  BTC +0.5000         │     Balance updated
  │  $22,500.00          │
  └──────────────────────┘
```

**Edge Cases:**
- ⚠ Unsupported network selected → Warning: "Sending via [network] may result in loss of funds. Use [recommended network]."
- ⚠ Below minimum deposit → Warning shown but address still generated; funds credited if received
- ⚠ Wrong network used → Detection system attempts recovery; support ticket auto-created
- ⚠ Deposit address expired (security timeout) → Auto-generate new one; warn if old address used

### 2.2 Fiat Deposit (Card / Bank Transfer)

```
  Wallet → Deposit → [Fiat Tab]
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Fiat Deposit                        │
  │                                      │
  │  Currency:     [USD ▼]  [$]          │
  │  Amount:       [___________]         │
  │                                      │
  │  Method:                             │
  │  ┌────────────────────────────────┐  │
  │  │  ○ Credit/Debit Card          │  │
  │  │     Instant · 2.5% fee         │  │
  │  ├────────────────────────────────┤  │
  │  │  ● Bank Transfer (ACH)        │  │
  │  │     1-3 business days · $0 fee│  │
  │  ├────────────────────────────────┤  │
  │  │  ○ Wire Transfer              │  │
  │  │     1-2 business days · $15   │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  KYC required for all fiat deposits  │
  │  [Continue to Deposit]               │
  └──────────────────────────────────────┘
```

**Edge Cases:**
- ⚠ KYC not completed → Redirect to KYC flow, return to deposit after
- ⚠ Daily deposit limit exceeded → Show limit, "Upgrade KYC level to increase"
- ⚠ Card declined → "Transaction declined by issuer. Try another card or method."
- ⚠ Pending bank transfer for 5+ days → Auto-notification: "Payment not received. Contact support?"

---

## 3. Spot Trading — Buy

### 3.1 Market Buy

```
         ┌──────────────────────┐
         │  Trading View        │
         │  BTC/USDT            │
         │                      │
         │  [Spot] [Margin]     │ ← Tab bar
         │                      │
         │  ┌────────────────┐  │
         │  │  Chart Area    │  │
         │  └────────────────┘  │
         │                      │
         │  ┌──────┬──────────┐ │
         │  │ Buy  │  Sell    │ │ ← Toggle (gold underline)
         │  └──────┴──────────┘ │
         │                      │
         │  Market ● Limit ○    │ ← Order type
         │                      │
         │  Available: 5,000    │
         │         USDT         │
         │                      │
         │  Total: ┌─────────┐  │
         │         │ 250 USDT│  │ ← Input amount in quote
         │         └─────────┘  │
         │                      │
         │  Est. Receive:       │
         │  0.005555 BTC        │
         │                      │
         │  25%  50%  75%  100% │ ← Quick amount buttons
         │                      │
         │  ┌──────────────────┐│
         │  │   Buy BTC        ││ ← Gold button
         │  │   (Market)       ││
         │  └──────────────────┘│
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Order Confirmation  │ ←  Toast notification
         │                      │
         │  ✓ Order Placed      │
         │  Market Buy 0.005555 │
         │  BTC @ ~$44,990      │
         │                      │
         │  [View Order]        │
         └──────────────────────┘
                    │ (instant fill)
                    ▼
         ┌──────────────────────┐
         │  Order Filled        │ ← Push notification
         │                      │
         │  ✓ Filled            │
         │  0.005555 BTC        │
         │  @ $44,990.00        │
         │  Total: $249.95      │
         │                      │
         │  Portfolio updated   │
         └──────────────────────┘
```

### 3.2 Limit Buy

```
  Trading View → Buy Tab → [Limit]
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Limit Order                         │
  │                                      │
  │  Price:  ┌──────────────┐  ┌──────┐ │
  │          │ 44,500.00   │  │ USDT │ │
  │          └──────────────┘  └──────┘ │
  │                        [Last Price]  │ ← Quick fill button
  │                                      │
  │  Amount: ┌──────────────┐  ┌──────┐ │
  │          │ 0.0050      │  │ BTC  │ │
  │          └──────────────┘  └──────┘ │
  │                                      │
  │  Total:  222.50 USDT                 │
  │                                      │
  │  ┌────────────────────────────────┐  │
  │  │  ○ Good 'Til Cancelled (GTC)  │  │
  │  │  ● Immediate or Cancel (IOC)  │  │
  │  │  ○ Fill or Kill (FOK)         │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  ┌────────────────────────────┐      │
  │  │  Price Alert: Notify when  │      │
  │  │  filled                     │      │
  │  └────────────────────────────┘      │
  │                                      │
  │  Fee: ~0.1% ($0.22)                 │
  │                                      │
  │  ┌────────────────────────────┐      │
  │  │      Place Limit Order     │      │  ← Gold button
  │  └────────────────────────────┘      │
  └──────────────────────────────────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
         ▼                      ▼
  ┌──────────────────┐  ┌──────────────────┐
  │  Order Placed     │  │  Insufficient    │
  │                   │  │  Balance         │
  │  ✓ Limit order    │  │                  │
  │    placed BTC     │  │  ✗ You need      │
  │    @ $44,500      │  │    222.50 USDT   │
  │                   │  │    Available:    │
  │  Open Orders: 1   │  │    100.00 USDT   │
  │  [View Orders]    │  │                  │
  └──────────────────┘  │  [Deposit] [OK]  │
                        └──────────────────┘
```

**Limit Order Lifecycle:**
```
  Placed → Pending → [Price reaches $44,500] → Partially Filled
         → [Remaining fills] → Fully Filled → Notification
         
  Placed → Pending → [Price moves away] → Expired (if IOC/FOK)
         → Notification: "Order expired unfilled"
         
  Placed → Pending → [Manual cancel] → Cancelled
         → Notification: "Order cancelled"
```

**Edge Cases:**
- ⚠ Price gap (limit price crossed but no fill) → Show "Order active — market at $44,600, your limit $44,500"
- ⚠ Partial fill remains open → Badge on Orders tab showing "1 Partial"
- ⚠ Insufficient balance → Show exact shortfall + quick [Deposit] action
- ⚠ Order exceeds max position → Show position limit with explanation
- ⚠ Maintenance mode → Orders queue, placed on reopen
- ⚠ Slippage on market order > 2% → Warning before confirmation: "Expected: $44,990. Slippage up to: $45,900"

---

## 4. Spot Trading — Sell

### 4.1 Market Sell

```
  Trading View → Sell Tab
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Sell BTC                            │
  │                                      │
  │  Market ○ Limit                      │
  │                                      │
  │  Available:  0.5000 BTC             │
  │  Value:      ~$22,495.00            │
  │                                      │
  │  Amount:   ┌────────────────────┐    │
  │            │ 0.2500            │    │
  │            └────────────────────┘    │
  │                                      │
  │  Est. Receive:  11,240.00 USDT      │
  │                                      │
  │  25%  50%  75%  100%  Max            │ ← Max = all
  │                                      │
  │  ┌────────────────────────────┐      │
  │  │       Sell BTC             │      │ ← Red button
  │  │       (Market)             │      │
  │  └────────────────────────────┘      │
  └──────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  ✓ Market Sell       │
         │  0.2500 BTC @        │
         │  $44,950.00          │
         │  +24,475.00 USDT     │
         └──────────────────────┘
```

**Edge Cases:**
- ⚠ Insufficient crypto balance → Show: "You have 0.0500 BTC available. Enter amount ≤ 0.0500."
- ⚠ Low liquidity order → Warning: "Order may have high slippage. Expected: $44,950, worst: $43,200"

---

## 5. Portfolio Dashboard

### 5.1 Home View

```
         ┌──────────────────────────────────────┐
         │  12:30  Portfolio      🔔  👤       │ ← Header
         ├──────────────────────────────────────┤
         │                                      │
         │  ┌────────────────────────────────┐  │
         │  │  Total Balance                 │  │
         │  │  ● $172,500.00                │  │ ← Toggle visibility
         │  │  ──────────────────────────    │  │
         │  │  +$4,250.00 (+2.53%) today    │  │ ← Green if positive
         │  │  ↓ Portfolio Chart (mini)     │  │ ← Sparkline
         │  └────────────────────────────────┘  │
         │                                      │
         │  ┌──────┬──────┬──────┬──────┐      │
         │  │ BTC  │ ETH  │ SOL  │ USDT │      │ ← Holdings tiles
         │  │ 39%  │ 26%  │ 20%  │ 15%  │      │
         │  │+2.3% │-1.2% │+5.6% │ 0.0% │      │
         │  └──────┴──────┴──────┴──────┘      │
         │                                      │
         │  ┌────────────────────────────────┐  │
         │  │  Quick Actions                 │  │
         │  │  [Deposit] [Trade] [Signals]  │  │ ← Gold chips
         │  └────────────────────────────────┘  │
         │                                      │
         │  ┌────────────────────────────────┐  │
         │  │  Recent Transactions           │  │
         │  │  ──────────────────────────    │  │
         │  │  ▲ Buy BTC    0.005  $250    │  │
         │  │  ▼ Sell ETH   0.500  $1,500  │  │
         │  │  ● Deposit    BTC    +2.0    │  │
         │  │                     [View All]│  │
         │  └────────────────────────────────┘  │
         │                                      │
         │  ┌────────────────────────────────┐  │
         │  │  Active Signals (2)            │  │
         │  │  ──────────────────────────    │  │
         │  │  ██ BTC Strong Buy  85%      │  │
         │  │  ██ ETH Hold         62%      │  │
         │  └────────────────────────────────┘  │
         └──────────────────────────────────────┘
```

**Pull-to-Refresh** (mobile): Pull down on portfolio to force refresh all data.
**Auto-refresh:** Every 5 seconds when app is foregrounded.

**Edge Cases:**
- ⚠ Offline mode → Show cached portfolio balances with "Last updated: 2m ago" banner
- ⚠ No assets → Empty state with [Buy Your First Crypto] CTA
- ⚠ Balance load error → Show last known balance + "Updating..." spinner

---

## 6. Withdraw Funds

### 6.1 Crypto Withdrawal

```
         ┌──────────────────────┐
         │  Wallet → Asset List │
         │  → [BTC]             │
         └──────────┬───────────┘
                    ▼
         ┌──────────────────────┐
         │  Bitcoin (BTC)       │
         │                      │
         │  Balance: 0.5000    │
         │  ≈ $22,500.00       │
         │                      │
         │  [Deposit] [Withdraw]│
         └──────────┬───────────┘
                    │ [Withdraw]
                    ▼
         ┌──────────────────────────────────┐
         │  Withdraw BTC                    │
         │                                  │
         │  Address: ┌──────────────────┐   │
         │           │ bc1q...          │   │
         │           └──────────────────┘   │
         │           [Paste] [Scan QR]      │
         │                                  │
         │  Amount:   ┌───────────────┐     │
         │            │ 0.2500       │     │
         │            └───────────────┘     │
         │             Max: 0.5000          │
         │                                  │
         │  Network fee: 0.0005 BTC         │
         │  You receive: 0.2495 BTC         │
         │                                  │
         │  ┌────────────────────────┐      │
         │  │   Security Check       │      │
         │  │   2FA code required    │      │
         │  └────────────────────────┘      │
         │                                  │
         │  [Request Withdrawal]            │ ← Gold, opens 2FA
         └──────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  2FA Verification    │
         │                      │
         │  Enter 2FA code:    │
         │  ┌──┐ ┌──┐ ┌──┐ ┌──┐│
         │  │  │ │  │ │  │ │  ││
         │  └──┘ └──┘ └──┘ └──┘│
         │                      │
         │  Confirm:            │
         │  Withdraw 0.2500 BTC │ ← Summary shown
         │  to bc1q5v9...7l3k  │
         │                      │
         │  [Confirm] [Cancel]  │
         └──────────┬───────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Withdrawal Sent     │
         │                      │
         │  ✓ Withdrawal        │
         │    submitted         │
         │                      │
         │  0.2500 BTC →        │
         │  bc1q5v9...7l3k     │
         │                      │
         │  Status: Pending     │
         │  Est. 10-30 min      │
         │                      │
         │  [View Status]       │
         │  [Back to Wallet]    │
         └──────────────────────┘
```

**Withdrawal Security Flow:**
```
  Request → 2FA Check → Email Confirmation → Admin Review (if > threshold)
         → Broadcast to Blockchain → Pending → Completed

  High-value thresholds:
    < $1,000      → 2FA only
    $1,000-$10,000 → 2FA + Email confirm
    > $10,000     → 2FA + Email + 24h time lock
    New address   → 24h hold on first withdrawal
```

**Edge Cases:**
- ⚠ Unverified address → "This address hasn't been used before. Withdrawal delayed 24h for security."
- ⚠ Above daily limit → "Daily withdrawal limit: $50,000. Remaining: $12,000. [Increase Limit via KYC]"
- ⚠ Whitelist required → "Address not in whitelist. Add and wait 24h to activate."
- ⚠ Wrong network → "This address appears to be on [other network]. Sending BTC to this address may lose funds."
- ⚠ Insufficient for fee → "Insufficient balance for network fee. You need 0.0005 BTC for fees."

---

## 7. Trading Signals

### 7.1 Browse & Act on Signals

```
         ┌──────────────────────┐
         │  Signals Feed        │
         │                      │
         │  Filter: [All ▼]     │ ← Buy | Sell | Neutral
         │  Time:   [1D ▼]      │ ← 1H | 4H | 1D | 1W
         │                      │
         │  ┌──────────────────┐│
         │  ██│ BTC STRONG BUY ││ ← Gold accent bar
         │  ██│ ★85% conf.    ││
         │  ██│ Entry: $44,000││
         │  ██│ T1: $46,000   ││
         │  ██│ Stop: $42,500 ││
         │  ██│                ││
         │  ██│ RSI oversold   ││
         │  ██│ + bullish div  ││
         │  ██│                ││
         │  ██│ 👤 TraderPro   ││
         │  ██│ 72.5% win rate ││
         │  ██│ [Trade Now] [🔖]││
         │  └──────────────────┘│
         │                      │
         │  ┌──────────────────┐│
         │  │ ETH BUY          ││ ← Green accent bar
         │  │ ★68% conf.      ││
         │  │ Entry: $3,200   ││
         │  │ ...              ││
         │  │ [Trade Now] [🔖] ││
         │  └──────────────────┘│
         │                      │
         │  ┌──────────────────┐│
         │  │ SOL SELL         ││ ← Red accent bar
         │  │ ★71% conf.      ││
         │  │ ...              ││
         │  │ [Trade Now] [🔖] ││
         │  └──────────────────┘│
         └──────────────────────┘
```

### 7.2 Trade Now Flow

```
  [Trade Now] on signal card
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Pre-filled Order (BTC/USDT)         │
  │                                      │
  │  Signal: STRONG BUY ★85%            │
  │  By: TraderPro                       │
  │  ──────────────────────────────       │
  │                                      │
  │  Recommended Entry: $44,000.00       │
  │  ┌────────────────────────────────┐  │
  │  │  Price:  44,000.00            │  │ ← Pre-filled
  │  │  Amount: 0.0050               │  │
  │  │  Stop:   42,500.00 [Set]     │  │ ← Auto-fill if signal has it
  │  │  Target: 46,000.00 [Set]     │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  ┌────────────────────────────┐      │
  │  │   Place Signal Order       │      │ ← Gold, pulse glow
  │  └────────────────────────────┘      │
  │                                      │
  │  ┌────────────────────────────┐      │
  │  │  □ Set Stop-Loss           │      │
  │  │  □ Set Take-Profit         │      │
  │  │  □ Notify on fill          │      │
  │  └────────────────────────────┘      │
  └──────────────────────────────────────┘
```

**Edge Cases:**
- ⚠ Signal expired (older than its timeframe) → "This signal has expired. Showing for reference only."
- ⚠ Price moved past entry → "Current price $45,200 is above signal entry $44,000. Consider limit order or wait for retrace."
- ⚠ Stop-loss already triggered → Signal marked with red "STOPPED" badge
- ⚠ Signal creator suspended → "Signal from inactive trader. Verify before following."

### 7.3 Signal Subscription

```
  Signals Feed → [🔖] Bookmark → Signal saved
  Signals Feed → Long press → [Subscribe to TraderPro]
         │
         ▼
  ┌──────────────────────┐
  │  Subscribe to        │
  │  TraderPro           │
  │                      │
  │  Plan: Premium       │
  │  15 signals/month    │
  │  $9.99/month         │
  │                      │
  │  Past Performance:   │
  │  Win rate: 72.5%     │
  │  Total P&L: +$12,450 │
  │  Active subs: 1,240  │
  │                      │
  │  [Subscribe] [Cancel]│
  └──────────────────────┘
```

---

## 8. Order History & Management

### 8.1 Open Orders

```
         ┌──────────────────────────────────┐
         │  Trade → [Open Orders]           │
         │                                  │
         │  ┌──────┬───────┬───────┬──────┐│
         │  │ Open │History│ Fills │ Pos. ││ ← Tab bar
         │  └──────┴───────┴───────┴──────┘│
         │                                  │
         │  ┌────────────────────────────┐  │
         │  │ BTC/USDT  Limit Buy        │  │
         │  │ $44,500 · 0.0050 BTC       │  │
         │  │ Filled: 0%                 │  │
         │  │ ▓░░░░░░░░░░░░░░░░░░░ 0%   │  │ ← Progress bar
         │  │ Created: 2m ago            │  │
         │  │ [Cancel] [Edit]            │  │
         │  └────────────────────────────┘  │
         │                                  │
         │  ┌────────────────────────────┐  │
         │  │ ETH/USDT  Limit Sell       │  │
         │  │ $3,400 · 0.5000 ETH        │  │
         │  │ Filled: 50%                │  │
         │  │ ▓▓▓▓▓▓▓▓░░░░░░░░░░░░ 50%  │  │
         │  │ Created: 1h ago            │  │
         │  │ [Cancel]                   │  │
         │  └────────────────────────────┘  │
         └──────────────────────────────────┘
```

### 8.2 Cancel Order Flow

```
  [Cancel] → Confirmation dialog: "Cancel BTC limit buy?"
         → Yes → Order cancelled → Toast: "Order cancelled"
         → No → Dismiss

  ⚠ Cancel during fill race → "Order already fully or partially filled."
     Show actual fill status.
```

### 8.3 Order History

```
  Order History tab:
  ┌──────┬────────┬──────┬─────────┬──────┬──────────┐
  │ Date │ Pair   │ Type │ Price   │ Amt  │ Status   │
  ├──────┼────────┼──────┼─────────┼──────┼──────────┤
  │ 6 Jul│ BTC    │ Buy  │ $44,990 │ 0.005│ ✅ Filled │
  │ 5 Jul│ ETH    │ Sell │ $3,380  │ 0.500│ ✅ Filled │
  │ 5 Jul│ SOL    │ Buy  │ $140.50 │ 5.0  │ ❌ Cancel │
  │ 4 Jul│ BTC    │ Sell │ $45,100 │ 0.010│ ✅ Filled │
  └──────┴────────┴──────┴─────────┴──────┴──────────┘

  Filterable: All | Filled | Cancelled | Expired
  Searchable: by pair or date range
  Paginated: 25 per page
```

**Edge Cases:**
- ⚠ Order history empty → "No orders yet. [Start Trading]" with gold CTA

---

## 9. Wallet Management

### 9.1 Asset Detail View

```
  Wallet → [BTC]
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Bitcoin (BTC)                       │
  │                                      │
  │  ┌────────────────────────────────┐  │
  │  │  Balance:  0.5000 BTC          │  │
  │  │  Value:    $22,500.00 USD      │  │
  │  │  24h:      +2.34%              │  │ ← Mini sparkline
  │  └────────────────────────────────┘  │
  │                                      │
  │  [Deposit] [Withdraw] [Trade]        │ ← Gold row
  │                                      │
  │  ┌────────────────────────────────┐  │
  │  │  Distribution                 │  │
  │  │  ● Spot:     0.4000 BTC       │  │
  │  │  ● Orders:   0.0500 BTC       │  │
  │  │  ● Pending:  0.0500 BTC       │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  ┌────────────────────────────────┐  │
  │  │  Transaction History           │  │
  │  │  ──────────────────────────    │  │
  │  │  Jun 30  Buy     +0.005 $225  │  │
  │  │  Jun 28  Sell    -0.010 $445  │  │
  │  │  Jun 25  Deposit +0.500 $22K  │  │
  │  │  Jun 20  W/draw  -0.250 $11K  │  │
  │  │                   [View All]  │  │
  │  └────────────────────────────────┘  │
  └──────────────────────────────────────┘
```

### 9.2 Transaction Detail

```
  [Tap any transaction row]
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Transaction Detail                  │
  │                                      │
  │  ₿ Bitcoin (BTC)                     │
  │                                      │
  │  Status: ✅ Completed               │ ← Or: ⏳ Pending
  │                                      │
  │  Type:    Deposit                    │
  │  Amount:  +0.5000 BTC               │
  │  Value:   $22,500.00                │
  │  Fee:     0.0000 BTC                │
  │                                      │
  │  From:    3J98t1WpEZxC...           │ ← External wallet
  │  To:      bc1q5v9w4tzg83...         │ ← Your wallet
  │                                      │
  │  Tx ID:   ┌────────────────────┐    │
  │           │ 0x4a5b...3f2c     │    │ ← Copyable
  │           └────────────────────┘    │
  │                                      │
  │  Confirmations: 15/15               │
  │  Date: 2026-06-25 14:32:01 UTC      │
  │                                      │
  │  [View on Explorer →]               │ ← Opens block explorer
  └──────────────────────────────────────┘
```

**Edge Cases:**
- ⚠ Pending transaction > 1 hour → "This transaction is taking longer than expected. [Check status on explorer]"
- ⚠ Failed transaction → Red status, reason provided (e.g., "Network congestion, replaced by new tx")

---

## 10. KYC / Identity Verification

### 10.1 Full KYC Flow

```
  Settings → [Verify Identity] or Triggered by deposit > limit
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Identity Verification               │
  │                                      │
  │  Current Level: 0 (Unverified)       │
  │  ────────────────────────────         │
  │                                      │
  │  Level 1: Basic                      │
  │  ✓ Full Name                         │
  │  ✓ Date of Birth                     │
  │  ✓ Country of Residence              │
  │  ┌────────────────────────────────┐  │
  │  │  [Start Verification]         │  │
  │  └────────────────────────────────┘  │
  └──────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Personal Info       │
         │                      │
         │  Legal Name           │
         │  ┌────────────────┐  │
         │  │ John A. Doe   │  │
         │  └────────────────┘  │
         │                      │
         │  Date of Birth       │
         │  ┌────────────────┐  │
         │  │ 1990-01-15    │  │
         │  └────────────────┘  │
         │                      │
         │  Nationality          │
         │  ┌────────────────┐  │
         │  │ United States ▼│  │
         │  └────────────────┘  │
         │                      │
         │  [Next: Document]   │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Document Upload     │
         │                      │
         │  Select document:    │
         │  ○ Passport          │
         │  ○ Driver's License  │
         │  ● National ID       │
         │                      │
         │  Upload Front:       │
         │  ┌────────────────┐  │
         │  │  📎 Drag or    │  │
         │  │  click to upld │  │
         │  └────────────────┘  │
         │                      │
         │  Upload Back:        │
         │  ┌────────────────┐  │
         │  │  📎 Drag or    │  │
         │  │  click to upld │  │
         │  └────────────────┘  │
         │                      │
         │  [Submit Documents]  │
         └──────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Liveness Check      │
         │                      │
         │  "Take a selfie with │
         │   your ID visible"   │
         │                      │
         │  ┌────────────────┐  │
         │  │                │  │
         │  │   📸 Camera   │  │
         │  │   Preview      │  │
         │  │                │  │
         │  └────────────────┘  │
         │                      │
         │  [Capture & Submit]  │
         └──────────────────────┘
                    │
         ┌──────────┴───────────┐
         │                      │
         ▼                      ▼
  ┌──────────────────┐  ┌──────────────────┐
  │  Under Review     │  │  Verification    │
  │                   │  │  Failed          │
  │  ⏳ Documents     │  │                  │
  │     submitted     │  │  ✗ ID not legible│
  │                   │  │                  │
  │  Est. 5-15 min    │  │  [Try Again]     │
  │                   │  │  [Contact Supp.] │
  │  [Notify me when  │  └──────────────────┘
  │   complete]       │
  └──────────────────┘
         │ (review done)
         ▼
  ┌──────────────────────┐
  │  ✓ Verified!         │
  │                      │
  │  Level 2 Approved    │
  │                      │
  │  New limits:         │
  │  Deposit: $50,000/d  │
  │  Withdraw: $100k/d   │
  │  Trade: Unlimited    │
  │                      │
  │  [Continue to Wallet]│
  └──────────────────────┘
```

**Edge Cases:**
- ⚠ Blurry document → "Image too blurry. Please retake in good lighting."
- ⚠ Expired ID detected → "This document appears to be expired. Please submit a valid ID."
- ⚠ Name mismatch (KYC vs account) → "Name must match your account. [Edit Profile] or [Contact Support]"
- ⚠ Face match failed → "Unable to verify identity. Ensure your face is well-lit and unobstructed."
- ⚠ Document already used (fraud) → "This document is associated with another account. [Contact Support]"
- ⚠ Sanctions hit → Silently flag for manual review; show generic "Verification taking longer than expected"

---

## 11. Alert Configuration

### 11.1 Create Price Alert

```
  Market → [BTC/USDT] → Chart → [Alert Bell Icon]
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Create Price Alert                  │
  │                                      │
  │  BTC/USDT > $45,000                  │
  │  ┌────────────────────────────────┐  │
  │  │  When price   [Crosses Above ▼]│  │
  │  │  ┌─────────────────────────┐   │  │
  │  │  │ 45,000.00              │   │  │
  │  │  └─────────────────────────┘   │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  ┌────────────────────────────────┐  │
  │  │  Notification:                │  │
  │  │  ✓ Push notification          │  │
  │  │  ✓ Email                      │  │
  │  │  ○ SMS (KYC Level 2+)        │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  ┌────────────────────────────────┐  │
  │  │  One-time alert                │  │
  │  │  Repeat every [Never ▼]        │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  [Create Alert]                      │
  └──────────────────────────────────────┘
                    │
                    ▼
  ┌──────────────────────┐
  │  ✓ Alert Created     │
  │                      │
  │  We'll notify you    │
  │  when BTC/USDT       │
  │  crosses $45,000    │
  │                      │
  │  [Manage Alerts]     │
  └──────────────────────┘
```

### 11.2 Alert Triggered

```
  [Price hits $45,000] → Push Notification:
  "🔔 BTC/USDT hit $45,000.32 — Crossed your alert. [View]"

  [Tap notification]
         │
         ▼
  Open Trading View with BTC/USDT at trigger price, chart
  centered on trigger moment with annotation
```

**Edge Cases:**
- ⚠ Alert at extreme price (e.g., 10× current) → "Alert set far above current price. It may never trigger."
- ⚠ Max alerts reached (50 limit) → "You've reached your 50-alert limit. [Manage] existing alerts."
- ⚠ Alert triggers during app open → In-app toast instead of push notification

---

## 12. Settings & Profile

### 12.1 Settings Navigation

```
  Sidebar → [Settings ⚙]
         │
         ▼
  ┌──────────────────────────────────────┐
  │  Settings                            │
  │                                      │
  │  Profile                             │
  │  ┌────────────────────────────────┐  │
  │  │  👤 John Doe                   │  │
  │  │     johndoe@email.com          │  │
  │  │     ••••••••••••••••• [Edit]  │  │
  │  └────────────────────────────────┘  │
  │                                      │
  │  Security                            │
  │  │ Two-Factor Auth        🔘 ON    │  │
  │  │ Device Management      ➤        │  │
  │  │ Session Activity       ➤        │  │
  │  │ Withdrawal Whitelist   ➤        │  │
  │  │ API Keys               ➤        │  │
  │  │ Password & PIN         ➤        │  │
  │  └────────────────────────┘         │
  │                                      │
  │  Preferences                         │
  │  │ Currency Display     [USD ▼]    │  │
  │  │ Language             [EN ▼]     │  │
  │  │ Default Trading View [Spot ▼]   │  │
  │  │ Chart Theme          [Dark ▼]   │  │
  │  │ Slippage Tolerance   [1% ▼]     │  │
  │  └────────────────────────┘         │
  │                                      │
  │  Notifications                       │
  │  │ Price Alerts          ➤3 active │  │
  │  │ Signal Notifications   🔘 ON    │  │
  │  │ Deposit Confirmations  🔘 ON    │  │
  │  │ Withdrawal Alerts      🔘 ON    │  │
  │  │ Push Notifications     🔘 ON    │  │
  │  └────────────────────────┘         │
  │                                      │
  │  About                               │
  │  │ App Version      1.0.0          │  │
  │  │ Terms of Service    ➤           │  │
  │  │ Privacy Policy      ➤           │  │
  │  │ Licenses            ➤           │  │
  │  │ [Log Out]                       │  │
  └──────────────────────────────────────┘
```

### 12.2 Log Out Flow

```
  [Log Out]
         │
         ▼
  ┌──────────────────────┐
  │  Are you sure?       │
  │                      │
  │  You will be signed  │
  │  out on all devices  │
  │                      │
  │  [Log Out] [Cancel]  │
  └──────────────────────┘
         │ [Log Out]
         ▼
  → Clear session → Clear cached sensitive data → Redirect to Sign In

  ⚠ Pending orders exist → Warning: "You have open orders. They will remain active."
  ⚠ Pending withdrawals → Warning: "A withdrawal is pending. Check status after re-login."
```

---

## 13. Error & Edge Cases

### 13.1 Common Error Flows

```
┌────────────────────────────────────────────┐
│  Network Error                             │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  🌐                               │    │ ← 56px icon
│  │  Connection Lost                  │    │
│  │  Check your internet and retry.   │    │
│  │                                   │    │
│  │  ┌────────────────────────────┐   │    │
│  │  │     [Retry]                │   │    │
│  │  └────────────────────────────┘   │    │
│  │  [Go to Dashboard]                │    │
│  └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────┐
│  Server Error (500, 502, 503)              │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  ⚠️                              │    │
│  │  Something went wrong             │    │
│  │  Our servers are having issues.   │    │
│  │  Please try again in a moment.    │    │
│  │                                   │    │
│  │  ┌────────────────────────────┐   │    │
│  │  │     [Try Again]            │   │    │
│  │  └────────────────────────────┘   │    │
│  │  [Contact Support]                │    │
│  └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────┐
│  Rate Limited (429)                       │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │  ⏱️                              │    │
│  │  Too Many Requests                │    │
│  │  Please wait 30 seconds before    │    │
│  │  placing another order.           │    │
│  │                                   │    │
│  │  ┌────────────────────────────┐   │    │
│  │  │     Got It                 │   │    │
│  │  └────────────────────────────┘   │    │
│  └────────────────────────────────────┘    │
└────────────────────────────────────────────┘
```

### 13.2 Offline Mode Behavior (PWA)

| Scenario | Behavior |
|----------|----------|
| No network on dashboard | Show cached portfolio. Banner: "Offline — showing cached data" |
| Try to place order | Block: "You need an internet connection to trade. Orders saved as draft." |
| Try to deposit | Show saved deposit addresses. "Generate requires connection." |
| View signals | Show last cached signals with timestamp. "Updated 15m ago" |
| Try to submit KYC | Block: "Upload requires internet connection. [Save Draft]" |
| Network restored | Auto-refresh all data. Dismiss banner. Toast: "Back online. Data refreshed." |

### 13.3 Concurrent Session Handling

```
  User logs in on another device
         │
         ▼
  ┌──────────────────────┐
  │  Session Conflict    │
  │                      │
  │  New login detected  │
  │  on another device   │
  │                      │
  │  [Keep this session] │
  │  [Log out other]     │
  │  [Log out here]      │
  └──────────────────────┘
```

### 13.4 Maintenance Mode

```
  ┌──────────────────────────────────────────┐
  │  🔧 Scheduled Maintenance                │
  │                                          │
  │  We'll be back shortly                   │
  │                                          │
  │  Trading will resume at:                 │
  │  2026-07-07 02:00 UTC                    │
  │                                          │
  │  (45 minutes remaining)                  │
  │  ███████████░░░░░░░░░░░░ 55%            │
  │                                          │
  │  Open orders will remain active.         │
  │  Pending withdrawals will process.       │
  │                                          │
  │  [Notify me when live]                   │
  └──────────────────────────────────────────┘
```

---

## Flow Dependency Map

```
                    ┌─────────────────────┐
                    │   Onboarding         │
                    │   (Register/Login)   │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                 │
              ▼                ▼                 ▼
     ┌────────────────┐ ┌────────────┐ ┌────────────────┐
     │  Unverified     │ │  Verified  │ │  Suspicious    │
     │  (Level 0)      │ │  (1-4)    │ │  (Flagged)     │
     └───────┬────────┘ └──────┬─────┘ └────────────────┘
             │                 │
             ▼                 ├──────────────────────────┐
     ┌──────────────┐         │           │               │
     │  Start KYC   │         ▼           ▼               ▼
     └──────────────┘   ┌────────┐ ┌──────────┐ ┌────────────┐
                        │Deposit │ │ Withdraw │ │  Trade     │
                        └────────┘ └──────────┘ └─────┬──────┘
                                                       │
                                              ┌────────┴────────┐
                                              │    Signals      │
                                              │    Subscribe    │
                                              └─────────────────┘
```

---

**Document prepared by:** Claude Code
**Date:** 2026-07-06
**Related documents:** [01-PRD.md](./01-PRD.md), [05-Frontend-Architecture.md](./05-Frontend-Architecture.md), [10-Design-System.md](./10-Design-System.md)
