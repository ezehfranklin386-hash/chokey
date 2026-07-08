/**
 * Demo Mode configuration.
 * Toggle VITE_DEMO_MODE=true in your .env to activate.
 */

/** Simulated network latency (ms) */
export const DELAY_MS = 150;

/** True when demo mode is active */
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
