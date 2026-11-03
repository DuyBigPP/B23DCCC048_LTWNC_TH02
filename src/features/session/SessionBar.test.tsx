import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../types';
import SessionBar from './SessionBar';
import { useSessionStore } from './useSessionStore';

const e1: Exercise = { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 };
const e2: Exercise = { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 };
const e3: Exercise = { id: 'e3', name: 'Gập tạ đơn 1', trainer: 'Đức Anh', group: 'Tay', duration: 104 };

const wait = (ms: number) => {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
};
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
const startAt = (queue: Exercise[], index: number) => {
  act(() => {
    useSessionStore.getState().startSession(queue, index);
  });
};

describe('SessionBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('chưa bắt đầu thì hiện "Chưa bắt đầu buổi tập" và "Buổi tập: 0 bài"', () => {
    render(<SessionBar />);
    expect(screen.getByText('Chưa bắt đầu buổi tập')).toBeInTheDocument();
    expect(screen.getByText('Buổi tập: 0 bài')).toBeInTheDocument();
  });

  it('bắt đầu ở e2: hiện tên bài, HLV, "Còn lại: 1:07", sau 5 giây là "Còn lại: 1:02"', () => {
    render(<SessionBar />);
    startAt([e1, e2, e3], 1);

    expect(screen.getByText('Đang tập: Kéo tạ đơn 1 – HLV Phương Anh')).toBeInTheDocument();
    expect(screen.getByText('Còn lại: 1:07')).toBeInTheDocument();
    expect(screen.getByText('Buổi tập: 3 bài')).toBeInTheDocument();

    wait(5000);
    expect(screen.getByText('Còn lại: 1:02')).toBeInTheDocument();
  });

  it('bấm Tạm dừng thì thời gian đứng yên, bấm Bắt đầu thì chạy tiếp', () => {
    render(<SessionBar />);
    startAt([e1, e2], 1);
    wait(5000);

    click('Tạm dừng');
    wait(3000);
    expect(screen.getByText('Còn lại: 1:02')).toBeInTheDocument();

    click('Bắt đầu');
    wait(1000);
    expect(screen.getByText('Còn lại: 1:01')).toBeInTheDocument();
  });

  it('bấm Sau thì sang "Gập tạ đơn 1 – HLV Đức Anh", "Còn lại: 1:44"; bấm Trước thì quay lại', () => {
    render(<SessionBar />);
    startAt([e1, e2, e3], 1);

    click('Sau');
    expect(screen.getByText('Đang tập: Gập tạ đơn 1 – HLV Đức Anh')).toBeInTheDocument();
    expect(screen.getByText('Còn lại: 1:44')).toBeInTheDocument();

    click('Trước');
    expect(screen.getByText('Đang tập: Kéo tạ đơn 1 – HLV Phương Anh')).toBeInTheDocument();
  });

  it('bắt đầu ở e1, hết 0:30 thì tự chuyển sang "Kéo tạ đơn 1"', () => {
    render(<SessionBar />);
    startAt([e1, e2], 0);

    wait(29000);
    expect(screen.getByText('Còn lại: 0:01')).toBeInTheDocument();
    wait(1000);
    expect(screen.getByText('Đang tập: Kéo tạ đơn 1 – HLV Phương Anh')).toBeInTheDocument();
    expect(screen.getByText('Còn lại: 1:07')).toBeInTheDocument();
  });

  it('gỡ SessionBar khỏi trang thì đồng hồ dừng đếm (clearInterval)', () => {
    const { unmount } = render(<SessionBar />);
    startAt([e1], 0);
    wait(2000);

    unmount();
    wait(5000);
    expect(useSessionStore.getState().elapsed).toBe(2);
  });
});
