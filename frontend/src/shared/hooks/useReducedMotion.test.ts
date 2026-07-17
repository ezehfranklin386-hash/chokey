import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReducedMotion } from './useReducedMotion';

const originalMatchMedia = window.matchMedia;

function createMatchMediaMock(matches: boolean) {
  const listeners = new Set<(e: MediaQueryListEvent) => void>();
  const mql = {
    matches,
    media: '(prefers-reduced-motion: reduce)',
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
    addListener: (listener: (e: MediaQueryListEvent) => void) => {
      listeners.add(listener);
    },
    removeListener: (listener: (e: MediaQueryListEvent) => void) => {
      listeners.delete(listener);
    },
  };

  const mockFn = vi.fn().mockReturnValue(mql);
  return { mockFn, mql, listeners };
}

describe('useReducedMotion', () => {
  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('returns true when prefers-reduced-motion is set to reduce', () => {
    const { mockFn } = createMatchMediaMock(true);
    window.matchMedia = mockFn;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('returns false when prefers-reduced-motion is not set', () => {
    const { mockFn } = createMatchMediaMock(false);
    window.matchMedia = mockFn;
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('updates when the preference changes', () => {
    const { mockFn, listeners } = createMatchMediaMock(false);
    window.matchMedia = mockFn;

    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);

    // Simulate the user enabling reduced motion
    act(() => {
      const event = { matches: true } as MediaQueryListEvent;
      listeners.forEach((l) => l(event));
    });

    expect(result.current).toBe(true);
  });

  it('listens for change events', () => {
    const { mockFn, mql } = createMatchMediaMock(false);
    const addEventListenerSpy = vi.spyOn(mql, 'addEventListener');

    window.matchMedia = mockFn;

    renderHook(() => useReducedMotion());

    expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('removes the event listener on unmount', () => {
    const { mockFn, mql } = createMatchMediaMock(false);
    const removeEventListenerSpy = vi.spyOn(mql, 'removeEventListener');

    window.matchMedia = mockFn;

    const { unmount } = renderHook(() => useReducedMotion());
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
