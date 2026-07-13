// @ts-nocheck
/**
 * Demo Mode — Axios adapter that intercepts all HTTP requests
 * and returns realistic mock data. Activated by VITE_DEMO_MODE=true.
 *
 * Every handler mirrors the real API shape so the app works identically
 * — no backend needed.
 */
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { DELAY_MS } from './demoConfig';
import {
  generatePrices,
  generatePriceUpdate,
  generateCandles,
  generateTradingPairs,
  generateOrderBook,
  generateRecentTrades,
  generateWallets,
  generateWallet,
  generateTransactions,
  generatePortfolioHistory,
  generateDepositAddress,
  generateDepositNetworks,
  generateWithdrawEstimate,
  generateOrders,
  generatePositions,
  generatePlaceOrder,
  generateSignals,
  generateSignal,
  generateRelatedSignals,
  generateSignalProvider,
  generateKycStatus,
  generateKycSubmit,
  generateSettings,
  generateKycUpload,
  DEMO_USER,
  DEMO_TOKENS,
} from './demoData';

// ── Helpers ───────────────────────────────────────────────────
function match(method: string, pattern: RegExp, url: string): RegExpExecArray | null {
  // Strip base path before matching
  const stripped = url.replace(/^\/api\/v1/, '');
  return new RegExp(`^${pattern.source}$`).exec(stripped);
}

function delay(ms = DELAY_MS): Promise<void> {
  return new Promise((r) => setTimeout(r, ms + Math.random() * 200));
}

function respond<T>(data: T, status = 200): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: { 'content-type': 'application/json' },
    config: {} as AxiosRequestConfig,
  };
}

// ── URL ⟶ handler map ────────────────────────────────────────
type Handler = (config: AxiosRequestConfig) => Promise<AxiosResponse> | AxiosResponse;

function buildRoutes(): Array<[RegExp, 'GET' | 'POST' | 'PUT' | 'DELETE', Handler]> {
  return [
    // ── Auth ────────────────────────────────────────────────
    [/\/auth\/login/, 'POST', () => respond({
      user: DEMO_USER,
      tokens: DEMO_TOKENS,
      requiresTwoFactor: false,
    })],

    [/\/auth\/register/, 'POST', () => respond({
      user: DEMO_USER,
      tokens: DEMO_TOKENS,
    })],

    [/\/auth\/logout/, 'POST', () => respond({ message: 'Logged out' })],

    [/\/auth\/me/, 'GET', () => respond(DEMO_USER)],

    [/\/auth\/refresh/, 'POST', () => respond(DEMO_TOKENS)],

    [/\/auth\/verify-email/, 'POST', () => respond({ verified: true })],

    [/\/auth\/resend-verification/, 'POST', () => respond({ message: 'Code sent' })],

    [/\/auth\/forgot-password/, 'POST', () => respond({ message: 'Email sent' })],

    [/\/auth\/reset-password/, 'POST', () => respond({ message: 'Password reset' })],

    [/\/auth\/2fa\/setup/, 'POST', () => respond({
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      secret: 'DEMO2FA',
      backupCodes: ['demo-11111', 'demo-22222', 'demo-33333'],
    })],

    [/\/auth\/2fa\/verify/, 'POST', () => respond({
      user: DEMO_USER,
      tokens: DEMO_TOKENS,
    })],

    [/\/auth\/2fa\/confirm/, 'POST', () => respond({
      enabled: true,
      recoveryCodes: ['rec-demo-1', 'rec-demo-2'],
    })],

    [/\/auth\/2fa\/disable/, 'POST', () => respond({ disabled: true })],

    [/\/auth\/2fa\/recovery/, 'POST', () => respond({
      user: DEMO_USER,
      tokens: DEMO_TOKENS,
    })],

    [/\/auth\/password/, 'PUT', () => respond({ message: 'Password changed' })],

    [/\/auth\/profile/, 'PUT', (config) => {
      const body = JSON.parse(config.data ?? '{}');
      return respond({ ...DEMO_USER, ...body });
    }],

    [/\/auth\/avatar/, 'POST', () => respond({
      url: 'https://picsum.photos/200/200',
    })],

    // ── Market ──────────────────────────────────────────────
    [/\/market\/prices\/(\w+)/, 'GET', (config) => {
      const symbol = config.url?.split('/').pop() ?? 'BTC';
      return respond(generatePriceUpdate(symbol));
    }],

    [/\/market\/prices/, 'GET', () => respond({ prices: generatePrices() })],

    [/\/market\/candles\/(\w+)/, 'GET', (config) => {
      const match = config.url?.match(/\/candles\/(\w+)/);
      const symbol = match?.[1] ?? 'BTC';
      const limit = Number(config.params?.limit ?? 200);
      return respond(generateCandles(symbol, limit));
    }],

    [/\/market\/search/, 'GET', (config) => {
      const q = (config.params?.q as string ?? '').toLowerCase();
      const all = generatePrices();
      return respond(all.filter((a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)));
    }],

    [/\/market\/symbols/, 'GET', () => respond(generateTradingPairs())],

    [/\/market\/orderbook\/(\w+)/, 'GET', (config) => {
      const symbol = config.url?.match(/\/orderbook\/(\w+)/)?.[1] ?? 'BTCUSDT';
      return respond(generateOrderBook(symbol));
    }],

    [/\/market\/trades\/(\w+)/, 'GET', (config) => {
      const symbol = config.url?.match(/\/trades\/(\w+)/)?.[1] ?? 'BTCUSDT';
      return respond(generateRecentTrades(symbol));
    }],

    // ── Wallet ──────────────────────────────────────────────
    [/\/wallets\/transactions/, 'GET', (config) =>
      respond(generateTransactions(config.params))],

    [/\/wallets\/portfolio-history/, 'GET', (config) =>
      respond(generatePortfolioHistory(config.params))],

    [/\/wallets\/(\w+)\/deposit\/networks/, 'GET', (config) => {
      const asset = config.url?.match(/\/wallets\/(\w+)\/deposit/)?.[1] ?? 'BTC';
      return respond(generateDepositNetworks(asset));
    }],

    [/\/wallets\/(\w+)\/deposit/, 'GET', (config) => {
      const asset = config.url?.match(/\/wallets\/(\w+)\/deposit/)?.[1] ?? 'BTC';
      return respond(generateDepositAddress(asset, config.params?.network));
    }],

    [/\/wallets\/(\w+)\/withdraw\/estimate/, 'GET', (config) =>
      respond(generateWithdrawEstimate(
        config.params?.assetId ?? 'BTC',
        config.params?.amount ?? '0.1',
        config.params?.network ?? 'BITCOIN',
      ))],

    [/\/wallets\/(\w+)/, 'GET', (config) => {
      const asset = config.url?.match(/\/wallets\/(\w+)/)?.[1] ?? 'BTC';
      if (['transactions', 'portfolio-history'].includes(asset)) return null; // handled above
      return respond(generateWallet(asset));
    }],

    [/\/wallets/, 'GET', () => respond(generateWallets())],

    [/\/wallets\/withdraw/, 'POST', (config) => {
      const body = JSON.parse(config.data ?? '{}');
      return respond({ id: `withdraw-${Date.now()}`, status: 'pending', estimatedArrival: '30-60 minutes' });
    }],

    // ── Orders ──────────────────────────────────────────────
    [/\/orders\/history/, 'GET', () => respond(generateOrders())],

    [/\/orders\/(\w+)/, 'DELETE', () => respond({ message: 'Order cancelled' })],

    [/\/orders\/(\w+)/, 'GET', () => respond(generateOrders()[0])],

    [/\/orders/, 'POST', (config) => {
      const body = JSON.parse(config.data ?? '{}');
      return respond(generatePlaceOrder(body));
    }],

    [/\/orders/, 'GET', (config) => respond(generateOrders(config.params?.symbol))],

    // ── Positions ───────────────────────────────────────────
    [/\/positions/, 'GET', () => respond(generatePositions())],

    // ── Signals ─────────────────────────────────────────────
    [/\/signals\/providers\/(\w+)/, 'GET', (config) => {
      const id = config.url?.match(/\/providers\/(\w+)/)?.[1] ?? 'prov-1';
      return respond(generateSignalProvider(id));
    }],

    [/\/signals\/(\w+)\/related/, 'GET', (config) => {
      const id = config.url?.match(/\/signals\/(\w+)\/related/)?.[1] ?? 'signal-0';
      return respond(generateRelatedSignals(id));
    }],

    [/\/signals\/(\w+)\/bookmark/, 'POST', () => respond({ bookmarked: true })],

    [/\/signals\/(\w+)/, 'GET', (config) => {
      const id = config.url?.match(/\/signals\/(\w+)/)?.[1] ?? 'signal-0';
      if (['providers'].includes(id)) return null; // handled above
      return respond(generateSignal(id));
    }],

    [/\/signals/, 'GET', (config) => respond(generateSignals(config.params))],

    // ── KYC ─────────────────────────────────────────────────
    [/\/kyc\/status/, 'GET', () => respond(generateKycStatus())],

    [/\/kyc\/submit/, 'POST', () => respond(generateKycSubmit())],

    [/\/kyc\/upload/, 'POST', () => respond(generateKycUpload())],

    [/\/kyc\/resubmit/, 'PUT', () => respond(generateKycSubmit())],

    // ── Settings ────────────────────────────────────────────
    [/\/settings/, 'GET', () => respond(generateSettings())],

    [/\/settings/, 'PUT', (config) => {
      const body = JSON.parse(config.data ?? '{}');
      return respond({ ...generateSettings(), ...body });
    }],
  ];
}

// ── Demo Adapter ──────────────────────────────────────────────
export async function demoAdapter(config: AxiosRequestConfig): Promise<AxiosResponse> {
  // Simulate network latency
  await delay(DELAY_MS);

  const method = (config.method ?? 'get').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE';
  const url = config.url ?? '';
  const routes = buildRoutes();

  for (const [pattern, routeMethod, handler] of routes) {
    if (method !== routeMethod) continue;
    if (match(method, pattern, url)) {
      const result = await handler(config);
      if (result) return result;
    }
  }

  // Fallback for unmatched routes
  console.warn(`[Demo] Unmatched route: ${method} ${url}`);
  throw {
    code: 'DEMO_UNMATCHED',
    message: `Demo mode: no mock for ${method} ${url}`,
    status: 404,
  };
}
