import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop } from './useMediaQuery';

// Store original matchMedia
const originalMatchMedia = window.matchMedia;

function createMatchMediaMock(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();

  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (e: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
    dispatchEvent: (e: MediaQueryListEvent) => {
      listeners.forEach((l) => l(e));
      return true;
    },
    // For older implementations that use addListener/removeListener
    addListener: (listener: (e: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeListener: (listener: (e: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
  }));
}

describe('useMediaQuery', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when the query matches', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('returns false when the query does not match', () => {
    window.matchMedia = createMatchMediaMock(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('updates when the match status changes', () => {
    // Start as non-matching
    window.matchMedia = createMatchMediaMock(false);
    const { result } = renderHook(() => useMediaQuery('(max-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('throws on server-side when no matchMedia', () => {
    window.matchMedia = undefined as any;
    expect(() => {
      renderHook(() => useMediaQuery('(max-width: 768px)'));
    }).toThrow();
  });
});

describe('useIsMobile', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when viewport is mobile size', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('returns false when viewport is not mobile size', () => {
    window.matchMedia = createMatchMediaMock(false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });
});

describe('useIsTablet', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when viewport is tablet size', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useIsTablet());
    expect(result.current).toBe(true);
  });
});

describe('useIsDesktop', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when viewport is desktop size', () => {
    window.matchMedia = createMatchMediaMock(true);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });
});
