import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { Exercise } from '../../types';
import CountdownBar from './CountdownBar';
import { useSessionStore } from './useSessionStore';

const e1: Exercise = { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 };
const e2: Exercise = { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 };

describe('CountdownBar', () => {
  beforeEach(() => {
    useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
  });

  it('chưa bắt đầu buổi tập thì không hiện thời gian còn lại', () => {
    render(<CountdownBar />);
    expect(screen.queryByText(/Còn lại/)).not.toBeInTheDocument();
  });

  it('hiện thời gian còn lại của bài hiện tại và cập nhật khi elapsed tăng', () => {
    useSessionStore.setState({ queue: [e1, e2], currentIndex: 1, elapsed: 0 });
    render(<CountdownBar />);
    expect(screen.getByText('Còn lại: 1:07')).toBeInTheDocument();

    act(() => {
      useSessionStore.setState({ elapsed: 5 });
    });
    expect(screen.getByText('Còn lại: 1:02')).toBeInTheDocument();
  });

  it('thanh tiến trình thể hiện phần trăm đã tập', () => {
    useSessionStore.setState({ queue: [e1], currentIndex: 0, elapsed: 15 });
    render(<CountdownBar />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '50');
  });
});

describe('CountdownBar – nghỉ giữa bài', () => {
  it('đang nghỉ thì hiện thời gian nghỉ còn lại và bài tiếp theo thay cho "Còn lại"', () => {
    useSessionStore.setState({
      queue: [e1, e2],
      currentIndex: 0,
      elapsed: 30,
      isResting: true,
      restLeft: 7,
      restDuration: 10,
    });
    render(<CountdownBar />);

    expect(screen.getByText('Nghỉ giữa bài: 0:07 – tiếp theo: Kéo tạ đơn 1')).toBeInTheDocument();
    expect(screen.queryByText(/Còn lại/)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('value', '30');
  });
});
