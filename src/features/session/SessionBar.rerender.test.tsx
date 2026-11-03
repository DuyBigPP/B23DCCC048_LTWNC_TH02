import { Profiler } from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Exercise } from '../../types';
import SessionBar from './SessionBar';
import { useSessionStore } from './useSessionStore';

// CountdownBar thay bằng phần tử tĩnh: mọi lần commit Profiler ghi nhận đều do chính SessionBar render lại.
vi.mock('./CountdownBar', () => ({ default: () => null }));

const e1: Exercise = { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 };

beforeEach(() => {
  vi.useFakeTimers();
  useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
});

afterEach(() => {
  vi.useRealTimers();
});

it('khi đồng hồ đang chạy, phần tên bài và các nút điều khiển không render lại mỗi giây', () => {
  const onRender = vi.fn();
  render(
    <Profiler id="session-bar" onRender={onRender}>
      <SessionBar />
    </Profiler>,
  );
  act(() => {
    useSessionStore.getState().startSession([e1], 0);
  });
  onRender.mockClear();

  act(() => {
    vi.advanceTimersByTime(5000);
  });

  expect(useSessionStore.getState().elapsed).toBe(5);
  expect(onRender).not.toHaveBeenCalled();
});
