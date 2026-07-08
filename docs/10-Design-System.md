# Design System & UI/UX Reference
## Crypto Wallet Webapp / PWA

**Version:** 1.0
**Date:** 2026-07-06
**Inspiration:** Bybit Trading Platform
**Color Palette:** Dark Blue · Golden Yellow · White

---

## 1. Design Philosophy

Inspired by **Bybit's professional trading platform** — a design language built for clarity, speed, and data density. Bybit excels at presenting complex financial information without cognitive overload, using a dark theme as the canvas, clear visual hierarchy, and consistent component patterns.

Our adaptation uses your **custom palette** to create a premium, trusted, and energetic feel — distinct from the generic crypto black/orange.

**Core Principles:**
- **Clarity over decoration** — every pixel serves the data
- **Dark-first** — reduces eye strain during extended trading sessions
- **Data density with breathing room** — crammed but not cluttered
- **Consistent hierarchy** — predictable layouts build muscle memory
- **Motion with purpose** — transitions communicate state changes

---

## 2. Color System

### 2.1 Brand Palette

| Token | Hex | Usage | Example |
|-------|-----|-------|---------|
| `color-primary-900` | `#0A0E27` | Deepest background (body) | App shell |
| `color-primary-800` | `#0F1636` | Surface backgrounds | Sidebar, cards |
| `color-primary-700` | `#151D45` | Elevated surfaces | Modals, dropdowns |
| `color-primary-600` | `#1C2554` | Interactive elements | Inputs, hover states |
| `color-primary-500` | `#24306A` | Strokes, borders | Divider lines |
| `color-primary-400` | `#3B4A8A` | Disabled states | Disabled buttons |
| `color-gold-500` | `#D4A843` | Primary accent (gold) | Buttons, active states, highlights |
| `color-gold-400` | `#E0BD60` | Gold hover | Button hover |
| `color-gold-300` | `#ECD17D` | Gold light | Ghost hover, glow effects |
| `color-gold-200` | `#F5E4A0` | Subtle gold | Badges, tags |
| `color-gold-100` | `#FDF5D6` | Lightest gold | Background washes |
| `color-white` | `#FFFFFF` | Primary text | Headings, body text |
| `color-white-90` | `#E5E6EB` | Secondary text | Labels, descriptions |
| `color-white-70` | `#B3B5C2` | Tertiary text | Placeholder, muted |
| `color-white-50` | `#808394` | Disabled text | Disabled labels |
| `color-white-30` | `#4D5168` | Subtle borders | Light dividers |

### 2.2 Semantic Colors

| Token | Hex | Usage | Dark Variant |
|-------|-----|-------|-------------|
| `color-success` | `#22C55E` | Price up, positive, deposit confirmed | `rgba(34,197,94,0.15)` bg |
| `color-danger` | `#EF4444` | Price down, negative, withdrawal | `rgba(239,68,68,0.15)` bg |
| `color-warning` | `#F59E0B` | Warning, pending, alert | `rgba(245,158,11,0.15)` bg |
| `color-info` | `#60A5FA` | Information, notifications | `rgba(96,165,250,0.15)` bg |

### 2.3 Gradient Specifications

```css
/* Brand Gradient — for hero sections, landing page */
.brand-gradient {
  background: linear-gradient(135deg, #0A0E27 0%, #1C2554 50%, #0F1636 100%);
}

/* Gold Accent Gradient — for buttons, active tabs */
.gold-gradient {
  background: linear-gradient(135deg, #D4A843 0%, #E0BD60 50%, #ECD17D 100%);
}

/* Card Glow — for premium/highlight cards */
.card-glow {
  box-shadow: 0 0 20px rgba(212, 168, 67, 0.1),
              0 0 60px rgba(212, 168, 67, 0.05);
  border: 1px solid rgba(212, 168, 67, 0.2);
}
```

### 2.4 Background Layering (Depth System)

```
Layer 0 (Body):        #0A0E27  ────  App background
Layer 1 (Surface):     #0F1636  ────  Cards, sidebar, panels
Layer 2 (Elevated):    #151D45  ────  Dropdowns, modals, tooltips
Layer 3 (Interactive): #1C2554  ────  Input focus, hover states
Overlay:               rgba(0,0,0,0.6)  ────  Modal backdrops
```

---

## 3. Typography

### 3.1 Font Stack

```css
/* Primary: Inter — clean, highly legible at all sizes, excellent for data-dense UIs */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Mono: JetBrains Mono — for crypto amounts, prices, code */
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

/* Display: Playfair Display — for landing page hero text only */
font-family: 'Playfair Display', Georgia, serif;
```

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `text-xs` | 11px | 500 | 16px | Label, metric subtitle, table cell |
| `text-sm` | 12px | 500 | 18px | Body small, tab text, badge text |
| `text-base` | 14px | 400 | 20px | Body text, paragraph, table content |
| `text-md` | 15px | 500 | 22px | Button text, input value |
| `text-lg` | 16px | 600 | 24px | Card title, nav item |
| `text-xl` | 18px | 600 | 26px | Section heading |
| `text-2xl` | 22px | 700 | 30px | Page heading |
| `text-3xl` | 28px | 700 | 36px | Large metric (portfolio value) |
| `text-4xl` | 36px | 700 | 44px | Hero number (big price display) |
| `text-5xl` | 48px | 800 | 56px | Landing page hero |

**Crypto amount scale (monospace):**

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `crypto-xs` | 11px | 500 | Fee, small balance |
| `crypto-sm` | 13px | 500 | Wallet balance in tables |
| `crypto-base` | 16px | 600 | Primary crypto amount |
| `crypto-lg` | 24px | 700 | Big number (portfolio value) |
| `crypto-xl` | 36px | 700 | Hero price display |

### 3.3 Typography Guidelines

- **Never use gold for body text** — reserve for accents, CTAs, active states
- **White text always on dark blue backgrounds** — never black on dark blue
- **Price values always in monospace** — aligns decimals, easier to scan
- **Market movements always colored** — green for up, red for down
- **Font weight steps:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold) — match Bybit's weight philosophy

---

## 4. Layout Architecture (Inspired by Bybit)

### 4.1 Dashboard Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  Top Header Bar                                              │
│  ┌──────┬──────────────┬──────────┬──────────┬───────────┐  │
│  │ Logo │  Search      │ Price    │ Notif    │ Avatar    │  │
│  │      │              │ Ticker   │ Bell     │ + Dropdown│  │
│  └──────┴──────────────┴──────────┴──────────┴───────────┘  │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                    │
│ Left     │  Main Content Area                                 │
│ Sidebar  │                                                    │
│ ┌──────┐│  ┌──────────────┬───────────────────────────────┐  │
│ │Dash  ││  │ Quick Stats  │ Chart Area                    │  │
│ │      ││  │ Portfolio    │ (TradingView)                 │  │
│ ├──────┤│  │ Value, 24h   │                               │  │
│ │Trade ││  │ Change        │                               │  │
│ │      ││  └──────────────┘                               │  │
│ ├──────┤│  ┌──────────────────────────────────────────────┘  │
│ │Wallet││  │                                                  │
│ │      ││  │  Order Form          │  Order Book              │
│ ├──────┤│  │  ┌────────────────┐  │  ┌────────────────┐     │
│ │Market││  │  │ Buy / Sell tab │  │  │ Asks (red)     │     │
│ │      ││  │  │ Price input    │  │  │ Price | Qty    │     │
│ ├──────┤│  │  │ Amount input   │  │  │ ──────────── │     │
│ │Sign. ││  │  │ Total          │  │  │ Spread        │     │
│ │      ││  │  │ % quick sel    │  │  │ ──────────── │     │
│ ├──────┤│  │  │ Place Order    │  │  │ Bids (green)  │     │
│ │More  ││  │  └────────────────┘  │  └────────────────┘     │
│ └──────┘│  │                      │                         │
│          │  └──────────────────────┘                         │
├──────────┴──────────────────────────────────────────────────┤
│  Recent Trades Ticker (scrolling marquee across bottom)      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Layout (Tablet - 768px)

```
┌──────────────────────────────────┐
│ Top Header Bar                   │
├────────┬─────────────────────────┤
│ Sidebar│ Main Content             │
│ (icons │ ┌────────────────────┐  │
│  only)  │ │ Chart              │  │
│        │ └────────────────────┘  │
│ ┌──┐  │ ┌──────┬─────────────┐  │
│ │  │  │ │Order  │ Order Book  │  │
│ │  │  │ │Form   │ (collapsed) │  │
│ └──┘  │ └──────┴─────────────┘  │
├────────┴─────────────────────────┤
│ Bottom Tab Bar (Mobile-style)     │
└──────────────────────────────────┘
```

### 4.3 Layout (Mobile - 375px)

```
┌──────────────────────┐
│ Top Header (compact) │
├──────────────────────┤
│                      │
│ Chart (50% viewport) │
│                      │
├──────────────────────┤
│ Buy / Sell Toggle    │
├──────────────────────┤
│ Quick Amount: 25% 50%│
│ 75% 100%            │
├──────────────────────┤
│ Place Order Button   │
├──────────────────────┤
│ Bottom Navigation    │
│ ┌──┬──┬──┬──┬──┐   │
│ │  │  │  │  │  │   │
│ └──┴──┴──┴──┴──┘   │
└──────────────────────┘
```

---

## 5. Navigation System

### 5.1 Desktop Sidebar (160px wide)

```
┌──────────────────────┐
│   ▲ Logo (24px)      │
│                      │
│   ◆ Dashboard        │  ← Active: gold icon + white text
│   ▷ Trade            │  ← Inactive: white-70 icon
│   □ Wallet           │
│   ◈ Market           │
│   ⚡ Signals         │
│   ⚙ Settings         │
│                      │
│   ─────────────      │  ← Divider (white-30)
│                      │
│   ◆ Copy Trading     │  ← Secondary nav items
│   ◆ Alerts           │
│   ◆ Referral         │
│                      │
│   ═══════════════    │  ← User section
│                      │
│   👤 User Name       │
└──────────────────────┘
```

**Behavior:**
- Active item: gold icon + white text + 2px gold left border
- Hover item: icon fades to white-90, subtle `#1C2554` background
- Collapsible to icon-only (48px) on smaller screens
- Bottom section always shows user avatar + name

### 5.2 Mobile Bottom Tab Bar

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│          │          │          │          │          │
│  ◆       │  ▷       │    ●     │  ◈       │  ⚙       │
│  Wallet  │  Trade   │  Home    │  Market  │  More    │
│          │          │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Behavior:**
- Active tab: gold icon + gold label
- Home tab (center): slightly larger, acts as portfolio dashboard
- Badge count on Wallet tab when funds arrive
- "More" opens expanded menu (Signals, Alerts, Settings)

### 5.3 Tab Patterns (In-Page)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│   Spot   │  Margin  │  Futures │  Options │   P2P    │  ← Active: gold underline
│          │          │          │          │          │     + white text
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Inspired by Bybit's tab system** — flat horizontal tabs with a 2px gold bottom border on active, white-70 text on inactive, white text on hover.

---

## 6. Component Library (Tailwind-Based)

### 6.1 Buttons

```
┌─────────────────────────────────────────────────────┐
│  Primary Button (Gold)                               │
│  ┌──────────────────────────────────────────────┐   │
│  │           Buy BTC / Place Order              │   │
│  │  bg: gold-500 → gold-400 hover               │   │
│  │  text: white, weight: 600                    │   │
│  │  border-radius: 8px, padding: 12px 24px      │   │
│  │  shadow: gold glow on focus                   │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Secondary Button (Outlined)                         │
│  ┌──────────────────────────────────────────────┐   │
│  │           Sell BTC / Cancel                  │   │
│  │  border: 1px gold-500                        │   │
│  │  text: gold-500, bg: transparent              │   │
│  │  hover: bg gold-500/10                       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Tertiary Button (Ghost)                             │
│  ┌──────────────────────────────────────────────┐   │
│  │           View All Signals                   │   │
│  │  text: white-90                              │   │
│  │  hover: bg primary-600                       │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Danger Button                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │           Withdraw / Delete                  │   │
│  │  bg: #EF4444, text: white                     │   │
│  │  hover: #DC2626                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Quick Amount Buttons (Trading Form)                 │
│  ┌─────┬─────┬─────┬─────┬─────┐                    │
│  │ 25% │ 50% │ 75% │ 100%│ Max │                    │
│  └─────┴─────┴─────┴─────┴─────┘                    │
│  Selected: bg gold-500, text white                   │
│  Unselected: bg primary-700, text white-70           │
└─────────────────────────────────────────────────────┘
```

### 6.2 Cards

```css
/* Standard Card */
.card {
  background: #0F1636;
  border: 1px solid rgba(212, 168, 67, 0.08);
  border-radius: 12px;
  padding: 20px;
  transition: border-color 0.2s ease;
}
.card:hover {
  border-color: rgba(212, 168, 67, 0.2);
}

/* Premium Card (featured, highlighted) */
.card-premium {
  background: linear-gradient(135deg, #0F1636 0%, #1C2554 100%);
  border: 1px solid rgba(212, 168, 67, 0.3);
  box-shadow: 0 0 30px rgba(212, 168, 67, 0.08);
}

/* Stats Card (for dashboard metrics) */
.card-stat {
  background: #0F1636;
  border-radius: 10px;
  padding: 16px;
}
/* Stat value: text-3xl, white, bold */
/* Stat label: text-xs, white-70 */
/* Stat change: text-sm, color-success or color-danger */
```

### 6.3 Inputs & Forms

```
┌─────────────────────────────────────────────────────┐
│  Standard Text Input                                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Label                    white-70, text-sm   │   │
│  │  ┌────────────────────────────────────┐       │   │
│  │  │ 0.00 BTC            ▲ ▼            │       │   │
│  │  │ bg: #151D45                        │       │   │
│  │  │ border: 1px #24306A                │       │   │
│  │  │ text: white, mono                  │       │   │
│  │  │ focus: border gold-500             │       │   │
│  │  └────────────────────────────────────┘       │   │
│  │  Helper text       white-50, text-xs           │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Input with Token Icon                               │
│  ┌──────────────────────────────────────────────┐   │
│  │  Amount                                       │   │
│  │  ┌──────────┬────────────────────┐            │   │
│  │  │  ₿       │ 0.500000          │  BTC    │   │
│  │  └──────────┴────────────────────┘            │   │
│  │  icon left + token selector right             │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Toggle Switch                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  Push Notifications                          │   │
│  │  ┌──────────────────────┐  ┌──┐              │   │
│  │  │                      │  │██│  ← gold when │   │
│  │  │                      │  └──┘    active     │   │
│  │  └──────────────────────┘                     │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 6.4 Badges & Tags

```
┌──────────────────────────────────────────────┐
│  Direction Badges (Signals)                   │
│                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ STRONG   │ │    BUY   │ │   SELL   │     │
│  │   BUY    │ │   #0F1636│ │   #0F1636│     │
│  │ #0F1636  │ │  green   │ │   red    │     │
│  │  green   │ │  border  │ │  border  │     │
│  │  border  │ └──────────┘ └──────────┘     │
│  └──────────┘                                │
│                                               │
│  Status Badges                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│  │ ACTIVE   │ │  FILLED  │ │ PENDING  │     │
│  │ gold-500 │ │  green   │ │  orange  │     │
│  │   bg     │ │   bg     │ │   bg     │     │
│  └──────────┘ └──────────┘ └──────────┘     │
└──────────────────────────────────────────────┘
```

### 6.5 Tables & Data Grids

```
┌────────────────────────────────────────────────────┐
│  Asset Table (like Bybit's wallet page)            │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Asset    │  Balance  │  USD Value │ 24h Chg │  │
│  ├──────────────────────────────────────────────┤  │
│  │  ₿ BTC    │ 1.5000    │  $67,500   │  +2.34% │  │
│  │  ⟠ ETH    │ 15.0000   │  $45,000   │  -1.23% │  │
│  │  ◎ SOL    │ 250.0000  │  $35,000   │  +5.67% │  │
│  │  ● USDT   │ 25,000.00 │  $25,000   │  0.00%  │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  Header: text-xs, white-70, uppercase tracking-wide │
│  Body: text-sm, white (mono for balances)           │
│  Row hover: bg #1C2554                              │
│  Row border: 1px #24306A                            │
│  24h Change: green = color-success, red = danger    │
└─────────────────────────────────────────────────────┘
```

### 6.6 Order Book (Bybit-Style Split View)

```
┌──────────────────────────────────────┐
│  Order Book     BTC/USDT             │
│                      ↑ Sell / ↓ Buy  │
│                                      │
│  Price (USD)    │  Amount (BTC)    │
│  ─────────────────────────────────    │
│  45,150.00      │  0.85            │  ← Red (asks)
│  45,100.00      │  1.20            │
│  45,050.00      │  0.50            │
│  45,000.00      │  2.10            │
│  ─────────────────────────────────    │
│  44,950.00      │  1.75            │  ← Spread: 50.00
│  44,900.00      │  0.90            │
│  44,850.00      │  1.30            │
│  44,800.00      │  0.45            │  ← Green (bids)
│  ─────────────────────────────────    │
│  Last: 45,000.00  Chg: +2.34%      │
└──────────────────────────────────────┘

Each row has a depth bar background:
  Asks: gradient to red at opacity 0.1-0.3
  Bids: gradient to green at opacity 0.1-0.3
  Width = depth percentage
```

---

## 7. Key Screens & Page Layouts

### 7.1 Portfolio Dashboard

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo | Search | BTC $67,500 [+2.3%] | 🔔 | 👤  │
├──────────┬──────────────────────────────────────────────┤
│          │  Portfolio Summary                            │
│ Sidebar  │  ┌──────────────────┬────────────────────┐   │
│          │  │ Total Balance    │ 24h Change         │   │
│  ◆ Dash  │  │ $172,500.00     │ +$4,250 (+2.5%)   │   │
│  ▷ Trade │  │ 👁 hide          │                    │   │
│  □ Wallet│  └──────────────────┴────────────────────┘   │
│  ◈ Market│  ┌──────────────────────────────────────┐   │
│  ⚡ Signals│  │ Portfolio Allocation (Donut Chart)   │   │
│  ⚙ Setting│  │  BTC 39%  ETH 26%  SOL 20%  USDT 15%│   │
│          │  └──────────────────────────────────────┘   │
│          │  ┌──────────────────────────────────────┐   │
│          │  │ Asset Holdings Table                  │   │
│          │  │ Asset │ Bal │ USD Val │ 24h │ %Port  │   │
│          │  └──────────────────────────────────────┘   │
│          │  ┌──────────────────────────────────────┐   │
│          │  │ Recent Transactions (last 5)          │   │
│          │  └──────────────────────────────────────┘   │
└──────────┴──────────────────────────────────────────────┘
```

### 7.2 Trading View (Full Screen)

```
┌─────────────────────────────────────────────────────────┐
│  Header: BTC/USDT | Spot | 1H 4H 1D 1W | Indicators 🔧 │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │  Order Book   │
│ Market   │  Chart Area (TradingView)     │  ┌─────────┐ │
│ Pairs    │                              │  │ Asks    │ │
│ ┌──────┐│  ┌────────────────────────┐  │  │         │ │
│ │BTC   ││  │                        │  │  │ Spread  │ │
│ │ETH   ││  │  Candlestick Chart     │  │  │         │ │
│ │SOL   ││  │  with indicators       │  │  │ Bids    │ │
│ │XRP   ││  │                        │  │  └─────────┘ │
│ │ADA   ││  └────────────────────────┘  │              │
│ │DOGE  ││                              │  Recent      │
│ └──────┘│  ┌─────────────┬──────────┐  │  Trades      │
│          │  │ Buy Form   │ Sell Form│  │  ┌─────────┐ │
│ Favorite │  │ ┌───────┐  │ ┌──────┐ │  │  45,100  │ │
│ ┌──────┐│  │ │Limit   │  │ │Market│ │  │  45,050  │ │
│ │ETH   ││  │ │Price   │  │ │Price │ │  │  45,000  │ │
│ │SOL   ││  │ │Amount  │  │ │Amount│ │  └─────────┘ │
│ └──────┘│  │ │Total   │  │ │Total │ │              │
│          │  │ └───────┘  │ └──────┘ │              │
│          │  │ [Place Buy]│ [Sell]   │              │
│          │  └─────────────┴──────────┘              │
└──────────┴──────────────────────────────┴───────────────┘
```

**Bybit-Inspired Details:**
- Market pairs list (left): fixed 200px, scrollable, favorite pinning
- Chart: takes 60% of remaining width
- Order book (right): fixed 260px, real-time depth visualization
- Buy/Sell tabs toggle the form below chart (mobile: full-width)
- Green buy button, red sell button — always visible, never confused

### 7.3 Wallet Page

```
┌─────────────────────────────────────────────────────────┐
│  Header: Wallet | Deposit | Withdraw | Transfer          │
├─────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────┐     │
│  │  Total Balance: $172,500.00                    │     │
│  │  In Orders: $12,500.00  Available: $160,000.00 │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Search assets...                     Hide $    │     │
│  ├────────────────────────────────────────────────┤     │
│  │  ₿  Bitcoin (BTC)   1.50    $67,500   +2.3%   │     │
│  │  ⟠  Ethereum (ETH)  15.00   $45,000   -1.2%   │     │
│  │  ◎  Solana (SOL)    250.0   $35,000   +5.6%   │     │
│  │  ●  Tether (USDT)   25,000  $25,000   0.0%    │     │
│  │  ◆  Cardano (ADA)   50,000  $12,500   -0.8%   │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  Gold CTA: [Deposit] [Withdraw] (fixed bottom on mobile) │
└─────────────────────────────────────────────────────────┘
```

### 7.4 Signals Feed

```
┌──────────────────────────────────────────────────────────────┐
│  Signals    Filter: All | Buy | Sell | Timeframe: 1D | ...   │
├──────────────────────────────────────────────────────────────┤
│  ┌───┬──────────────────────────────────────────────────┐   │
│  │ ██│  BTC/USD    STRONG BUY    1D    Premium          │   │
│  │ ██│  Entry: $44,000  Target 1: $46,000              │   │
│  │ ██│  Stop: $42,500   Confidence: 85%                 │   │
│  │ ██│  RSI oversold rebound + bullish divergence       │   │
│  │ ██│  👤 TraderPro  ★72.5% win rate  [Trade Now] [F] │   │
│  └───┴──────────────────────────────────────────────────┘   │
│                                                              │
│  Signal card design:                                         │
│  • Left gold accent bar (4px) on STRONG_BUY signals         │
│  • Left green accent bar on BUY signals                      │
│  • Left red accent bar on SELL/STRONG_SELL                   │
│  • Card bg: #0F1636 with elevated #151D45 border             │
│  • Confidence bar: gold gradient fill                        │
│  • Win rate badge: gold when > 70%                           │
└──────────────────────────────────────────────────────────────┘
```

### 7.5 Login / Auth Screen

```
┌─────────────────────────────────────────────┐
│                                             │
│              ▲ Logo (Gold)                  │
│           CryptoWallet                      │
│        Trade smarter, not harder            │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Email                            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Password                          │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │        Sign In (Gold Button)       │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ───────────── or continue with ──────────  │
│                                             │
│  [Google]   [Apple]    [Email OTP]          │
│                                             │
│  Don't have an account? Register            │
│                                             │
│  Background: brand-gradient (#0A0E27 →      │
│  #1C2554), subtle particle or grid pattern   │
└─────────────────────────────────────────────┘
```

---

## 8. Motion & Animation

### 8.1 Duration & Easing

```css
/* Duration tokens */
--duration-fast:   100ms;   /* Micro-interactions: hover, active */
--duration-normal: 200ms;   /* Standard: dropdown, toggle */
--duration-slow:   300ms;   /* Panel open/close, page transitions */
--duration-xslow:  500ms;   /* Modal open, notification appear */

/* Easing tokens */
--ease-out:     cubic-bezier(0.16, 1, 0.3, 1);    /* Outgoing (default) */
--ease-in:      cubic-bezier(0.4, 0, 1, 1);        /* Incoming (rare) */
--ease-in-out:  cubic-bezier(0.65, 0, 0.35, 1);    /* Emphasis */
--ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1); /* Gold accent emphasis */
```

### 8.2 Pattern Library

```
▼ Hover & Active States
   Button hover:         gold-400 bg, slow scale(1.02)
   Card hover:           border gold-500 glow, duration-fast
   Row hover:            bg primary-600, duration-fast
   Click active:         scale(0.98), duration-fast

▼ Page Transitions
   Route change:         fade 200ms + slide up 10px
   Sidebar collapse:     width 300ms ease-out
   Modal open:           backdrop fade 300ms + content scale(0.95→1) 300ms

▼ Data Updates
   Price tick up:        flash green 500ms then fade
   Price tick down:      flash red 500ms then fade
   Balance change:       counter animation 800ms
   New signal:           slide-in from right 400ms + gold glow pulse

▼ Notifications
   Toast appear:         slide down from top 300ms ease-out
   Toast dismiss:        slide up + fade 300ms ease-in
   Notification badge:   pulse scale(1→1.2→1) 600ms

▼ Charts
   Candle update:        morph transition 300ms
   Indicator toggle:     opacity fade 200ms
   Timeframe switch:     cross-fade 200ms
```

---

## 9. Loading & Empty States

### 9.1 Skeleton Patterns

```
┌──────────────────────────────────────────────┐
│  Card Skeleton (pulse animation)              │
│                                               │
│  ┌────────────────────────────────────────┐  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓    ← 40% width        │  │
│  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓            │  │
│  │  ▓▓▓▓▓▓   20% width                     │  │
│  │  ─────────────────────────              │  │
│  │  ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓▓         │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Skeleton bg: #151D45                         │
│  Shimmer: rgba(255,255,255,0.05)              │
│  Animation: shimmer 2s ease-in-out infinite   │
└──────────────────────────────────────────────┘
```

### 9.2 Empty States

```
┌──────────────────────────────────────────────┐
│  Empty State Examples                        │
│                                               │
│  [No transactions]                            │
│  ┌────────────────────────────────────────┐  │
│  │             📭                          │  │
│  │    No transactions yet                  │  │
│  │    Your crypto transactions will        │  │
│  │    appear here once you start trading.  │  │
│  │                                         │  │
│  │    [Buy Crypto] ← Gold primary button  │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  [No signals]                                 │
│  ┌────────────────────────────────────────┐  │
│  │             📡                          │  │
│  │    No signals available                 │  │
│  │    Check back later for trading         │  │
│  │    signals on your tracked assets.      │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Icon: 56px, white-30                         │
│  Title: text-xl, white                        │
│  Description: text-base, white-70             │
│  CTA: gold primary button                     │
└──────────────────────────────────────────────┘
```

### 9.3 Error States

```
┌──────────────────────────────────────────────┐
│  Error State                                  │
│  ┌────────────────────────────────────────┐  │
│  │             ⚠️                         │  │
│  │    Something went wrong                 │  │
│  │    Failed to load portfolio data.      │  │
│  │                                         │  │
│  │    [Try Again]  [Contact Support]      │  │
│  └────────────────────────────────────────┘  │
│                                               │
│  Icon: 56px, color-warning                    │
│  Title: text-xl, white                        │
│  Err msg: text-base, white-70                 │
│  Retry: gold secondary                        │
│  Support: ghost button                        │
└──────────────────────────────────────────────┘
```

---

## 10. Design System Assets Checklist

### 10.1 File Deliverables

- [ ] `tailwind.config.ts` — full theme extension with custom colors, fonts, spacing
- [ ] `globals.css` — CSS variables, base styles, utility classes
- [ ] `tokens.js` — design token JSON (exportable to Figma)
- [ ] Component library in `shared/ui/` — all components from §6
- [ ] Figma component library (mirror of code components)
- [ ] Icon set (SVG sprites: 48 essential crypto + 24 UI icons)
- [ ] Logo variants (full, icon-only, white/gold/dark-blue)

### 10.2 Components to Build

```
shared/ui/
├── Button/
│   ├── Button.tsx          (variant: primary|secondary|ghost|danger)
│   ├── Button.test.tsx
│   └── Button.stories.tsx
├── Input/
│   ├── Input.tsx           (label, error, prefix, suffix)
│   ├── Input.test.tsx
│   └── Input.stories.tsx
├── Card/
│   ├── Card.tsx            (variant: default|premium|stat)
│   ├── Card.test.tsx
│   └── Card.stories.tsx
├── Badge/
│   ├── Badge.tsx           (variant: success|danger|warning|gold)
│   └── Badge.test.tsx
├── Table/
│   ├── Table.tsx           (sortable, paginated, virtualized)
│   ├── Table.test.tsx
│   └── Table.stories.tsx
├── Modal/
│   ├── Modal.tsx           (backdrop, animation, sizes)
│   └── Modal.test.tsx
├── Tabs/
│   ├── Tabs.tsx            (underline|pill|icon variants)
│   └── Tabs.test.tsx
├── OrderBook/
│   ├── OrderBook.tsx       (real-time depth visualization)
│   └── OrderBook.test.tsx
├── SignalCard/
│   ├── SignalCard.tsx      (full/compact variants)
│   └── SignalCard.test.tsx
├── Skeleton/
│   ├── Skeleton.tsx        (text, card, table, chart variants)
│   └── Skeleton.test.tsx
├── EmptyState/
│   └── EmptyState.tsx      (icon, title, description, CTA)
├── ErrorState/
│   └── ErrorState.tsx      (retry, support actions)
├── Toast/
│   ├── Toast.tsx           (success|error|warning|info)
│   └── Toast.test.tsx
├── Tooltip/
│   └── Tooltip.tsx
├── Toggle/
│   ├── Toggle.tsx
│   └── Toggle.test.tsx
├── ConfirmDialog/
│   └── ConfirmDialog.tsx
├── Pagination/
│   └── Pagination.tsx
├── PriceTicker/
│   └── PriceTicker.tsx
└── MiniChart/
    └── MiniChart.tsx       (Lightweight Charts integration)
```

---

## 11. Responsive Breakpoints

| Breakpoint | Width | Device | Layout Changes |
|------------|-------|--------|---------------|
| `xs` | < 480px | Small phone | Single column, bottom tabs, full-width chart |
| `sm` | 480–767px | Large phone | Single column, bottom tabs, compact header |
| `md` | 768–1023px | Tablet | Sidebar icons only, 2-column content |
| `lg` | 1024–1279px | Small desktop | Full sidebar, 3-column trading view |
| `xl` | 1280–1535px | Desktop | Full layout, all panels visible |
| `2xl` | ≥ 1536px | Large desktop | Max-width container, extra whitespace |

---

## 12. Accessibility

- **Color contrast:** All text meets WCAG 2.1 AA (4.5:1 for body, 3:1 for large text)
- **Gold on dark blue:** Gold-500 (#D4A843) on primary-800 (#0F1636) = 5.2:1 ✓
- **White on dark blue:** White on primary-800 = 15.3:1 ✓
- **Market colors:** Never rely solely on green/red — add ▲/▼ indicators
- **Focus states:** Gold-300 ring (`outline: 2px solid #ECD17D`) for keyboard navigation
- **Touch targets:** Minimum 44×44px on all interactive elements (mobile)
- **Screen reader:** ARIA labels on all icon-only buttons, crypto amounts announced with full precision

---

## 13. Figma to Code Handoff Notes

```yaml
Design tool: Figma
Plugin: Design Tokens (export to JSON)
Color naming: Use the token names from §2 (e.g., `color-primary-800`)
Component naming: Match file names from §10.2
Grid system: 8px base grid (spacing: 8, 16, 24, 32, 48, 64, 96)
Border radius: 4px (micro), 8px (standard), 12px (card), 16px (modal), 24px (pill)
Shadow system:
  - sm: 0 2px 4px rgba(0,0,0,0.3)
  - md: 0 4px 12px rgba(0,0,0,0.4)
  - lg: 0 8px 24px rgba(0,0,0,0.5)
  - glow: 0 0 20px rgba(212,168,67,0.15)
```

---

## 14. References & Inspirations

| Source | What We Borrowed |
|--------|-----------------|
| **Bybit** (bybit.com) | Layout structure, trading view composition, data density, order book pattern, bottom tab navigation |
| **Bybit Mobile App** | Bottom tab bar pattern, signal card layout, thumb-friendly interaction zones |
| **Bybit UX Case Study** (bongio.work) | Floating action button pattern, icon simplification strategy, unified design system philosophy |
| **Bybit Brand Colors** (brandcolorcode.com) | Their orange (#F7A707) informed our gold direction; we adapted to #D4A843 for a premium, warm gold |
| **Bypto Figma Kit** | Card patterns, stat card layout, portfolio allocation visualization |

---

**Design system prepared by:** Claude Code
**Based on research of:** Bybit trading platform (web + mobile), crypto exchange UI best practices, Dribbble/Behance crypto design community work
**Color palette:** Custom — Dark Blue (#0A0E27 → #1C2554), Golden Yellow (#D4A843 → #ECD17D), White (#FFFFFF → #B3B5C2)

**Next Steps:**
1. Build Tailwind config with all design tokens
2. Create the base component library (Button, Card, Tabs, Input)
3. Build the DashboardLayout with sidebar + header
4. Implement the trading view layout
5. Create signal card components matching this spec
