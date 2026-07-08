import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('does not update the debounced value before the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } },
    );

    rerender({ value: 'world', delay: 500 });

    // Still the old value before the delay
    expect(result.current).toBe('hello');
  });

  it('updates the debounced value after the delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } },
    );

    rerender({ value: 'world', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('world');
  });

  it('resets the timer when value changes rapidly', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 500 } },
    );

    rerender({ value: 'b', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Change again before the 500ms is up
    rerender({ value: 'c', delay: 500 });
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should get the latest value
    expect(result.current).toBe('c');
  });

  it('uses the default delay of 300ms when not provided', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      { initialProps: { value: 'first' } },
    );

    rerender({ value: 'second' });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('second');
  });

  it('works with numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 200 } },
    );

    rerender({ value: 42, delay: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current).toBe(42);
  });

  it('cleans up the timer on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'hello', delay: 500 } },
    );

    rerender({ value: 'world', delay: 500 });
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
