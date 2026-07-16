# Landing Page Redesign Plan — Modern, Premium, Classic

## Design Direction

Transform the current white/SaaS landing page into a dark, premium crypto platform that rivals Coinbase, Kraken, and Binance. The brand already has dark theme colors (`primary-900: #0A0E27`) — the landing page just doesn't use them.

## Visual Mood

- **Background**: Deep navy (`#0A0E27`) with subtle animated mesh gradients and a dot-grid overlay
- **Accent**: Brand blue (`#0052FF`) with gold (`#D4A843`) for premium touches
- **Glass**: Backdrop-blur cards with subtle border gradients
- **Typography**: Large, bold headlines (up to 72px), generous tracking on headings
- **Motion**: Scroll-triggered fade-ups, floating gradient orbs, shimmer on CTAs

## Sections to Redesign (in order)

### 1. Hero Section
**Current**: White bg, image of dashboard, simple text
**Target**: Dark gradient hero with:
- Animated mesh gradient background (purple-blue-cyan floating orbs)
- Subtle dot-grid overlay pattern
- Large display headline (56-72px) with gradient text span
- Floating glass-morphism stats card on the right
- Animated pill badge ("Now available in 100+ countries")
- CTA with glow-shadow on hover
- Background: `bg-primary-900` fading to `primary-800`

### 2. Stats Bar  
**Current**: Light gray bg, simple numbers
**Target**: Glass-morphism stat bar with:
- `bg-white/5 backdrop-blur-xl` with border
- Counters with `+` suffixes
- Dividers between stats
- Subtle shimmer animation on load

### 3. Features Grid
**Current**: White cards with border
**Target**: Glass cards with:
- `bg-white/5 backdrop-blur-lg border-white/10`
- Icon circles with gradient bg
- Hover lift effect with glow shadow
- Staggered fade-up on scroll

### 4. Security Section
**Current**: Light gray section with shield icon
**Target**: Split layout with:
- Dark gradient left side with feature list
- Right side: glass card with animated shield/grid
- Check icons with brand blue glow

### 5. CTA Section  
**Current**: Blue bg with dot pattern
**Target**: Gradient CTA with:
- `bg-gradient-to-br from-brand-500 to-primary-700`
- Animated particle/grid overlay
- Glass input field
- Dual CTAs with secondary ghost variant

### 6. Footer
**Current**: Light gray, simple
**Target**: Dark footer matching hero:
- `bg-primary-900` with border-white/10
- Columns with hover effects
- Social icons row
- Newsletter signup

## Technical Changes

| File | Change |
|------|--------|
| `src/pages/landing/LandingPage.tsx` | Rewrite with dark theme, glass-morphism, animations |
| `src/pages/landing/hero.png` | Replace with a more premium mockup image (WebFetch reference) |
| `src/pages/landing/LandingPage.css` | (optional) Extra animations if needed |

## Animations to Add

- **Fade-up on scroll**: Each section fades in with translateY(30px) → 0
- **Floating orbs**: CSS-only animated gradient blobs in the hero background
- **Counter animation**: Stats count up on viewport entry
- **Hover glow**: Cards and CTAs get subtle glow shadow on hover
- **Staggered grid**: Feature cards appear one after another

## Image Reference

Will use WebFetch to find a premium crypto dashboard mockup to replace `hero.png`. Looking for:
- Dark-themed trading dashboard
- Clean, modern UI with candlestick charts
- Preferably with a mobile device mockup alongside

## Implementation Order

1. Find replacement image via WebFetch
2. Rewrite Hero section (dark bg, floating orbs, glass card)
3. Rewrite Stats Bar (glass-morphism)
4. Rewrite Features grid (glass cards, scroll animations)
5. Rewrite Security section (dark split layout)
6. Rewrite CTA (gradient, animated bg)
7. Rewrite Footer (dark, matching hero)
8. Polish: animation timing, responsive tweaks, contrast check
