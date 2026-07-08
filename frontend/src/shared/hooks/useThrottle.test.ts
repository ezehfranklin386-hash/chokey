import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useThrottle } from './useThrottle';

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls the callback immediately on first invocation', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 1000));

    act(() => {
      result.current();
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('drops calls within the delay window', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 1000));

    act(() => {
      result.current();
      result.current();
      result.current();
    });

    // Only the first call should fire immediately
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('fires the trailing call after the delay', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 1000));

    act(() => {
      result.current();
    });
    expect(fn).toHaveBeenCalledTimes(1);

    // Attempt another call immediately — should be throttled
    act(() => {
      result.current();
    });
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance past the delay — the trailing call should fire
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('passes arguments to the callback', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 1000));

    act(() => {
      result.current('hello', 42);
    });

    expect(fn).toHaveBeenCalledWith('hello', 42);
  });

  it('uses the default delay of 1000ms when not provided', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn));

    act(() => {
      result.current();
    });
    expect(fn).toHaveBeenCalledTimes(1);

    // Should still be throttled at 500ms
    act(() => {
      vi.advanceTimersByTime(500);
      result.current();
    });
    expect(fn).toHaveBeenCalledTimes(1);

    // Should fire trailing at 1000ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('allows a new call after the delay has passed', () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useThrottle(fn, 500));

    act(() => {
      result.current();
    });
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance past the delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should be able to fire immediately again
    act(() => {
      result.current();
    });
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
