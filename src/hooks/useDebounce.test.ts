import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from './useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('đổi giá trị: trước 300ms vẫn là giá trị cũ, sau advanceTimersByTime(300) là giá trị mới', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'cũ' },
    });

    rerender({ value: 'mới' });
    expect(result.current).toBe('cũ');

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current).toBe('mới');
  });

  it('ngay trước mốc 300ms (299ms) vẫn giữ giá trị cũ, đủ 300ms mới đổi', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'cũ' },
    });

    rerender({ value: 'mới' });
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('cũ');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('mới');
  });

  it('gõ liên tục thì đếm lại từ đầu, chỉ cập nhật sau lần gõ cuối 300ms', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });

    rerender({ value: 'đ' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: 'đẩ' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('');

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(result.current).toBe('đẩ');
  });
});
