import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../types';
import { useSavedStore } from '../saved/useSavedStore';
import ExerciseRow from './ExerciseRow';

const exercise: Exercise = {
  id: 'e1',
  name: 'Đẩy tạ đơn 1',
  trainer: 'Minh Khang',
  group: 'Ngực',
  duration: 30,
};

const renderRow = (overrides: { onStart?: () => void; onAddToSession?: () => void; index?: number } = {}) =>
  render(
    <ExerciseRow
      exercise={exercise}
      index={overrides.index ?? 0}
      onStart={overrides.onStart ?? vi.fn()}
      onAddToSession={overrides.onAddToSession ?? vi.fn()}
    />,
  );

describe('ExerciseRow', () => {
  beforeEach(() => {
    localStorage.clear();
    useSavedStore.setState({ ids: [] });
  });

  it('hiển thị số thứ tự, tên bài tập, HLV, nhóm cơ và thời lượng "0:30"', () => {
    renderRow({ index: 4 });

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Đẩy tạ đơn 1')).toBeInTheDocument();
    expect(screen.getByText('Minh Khang')).toBeInTheDocument();
    expect(screen.getByText('Ngực')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('bấm nút Bắt đầu thì gọi onStart đúng một lần với đúng bài tập', async () => {
    const onStart = vi.fn();
    renderRow({ onStart });

    await userEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(exercise);
  });

  it('bấm "+ Buổi tập" thì gọi onAddToSession với đúng bài tập', async () => {
    const onAddToSession = vi.fn();
    renderRow({ onAddToSession });

    await userEvent.click(screen.getByRole('button', { name: '+ Buổi tập' }));

    expect(onAddToSession).toHaveBeenCalledTimes(1);
    expect(onAddToSession).toHaveBeenCalledWith(exercise);
  });

  it('nút lưu đổi giữa ☆ "Lưu bài tập" và ★ "Bỏ lưu", ghi vào danh sách đã lưu', async () => {
    renderRow();

    const saveButton = screen.getByRole('button', { name: 'Lưu bài tập' });
    expect(saveButton).toHaveTextContent('☆');

    await userEvent.click(saveButton);
    const unsaveButton = screen.getByRole('button', { name: 'Bỏ lưu' });
    expect(unsaveButton).toHaveTextContent('★');
    expect(useSavedStore.getState().ids).toEqual(['e1']);

    await userEvent.click(unsaveButton);
    expect(screen.getByRole('button', { name: 'Lưu bài tập' })).toBeInTheDocument();
    expect(useSavedStore.getState().ids).toEqual([]);
  });

  it('bài đã lưu từ trước thì hiện sẵn ★', () => {
    useSavedStore.setState({ ids: ['e1'] });
    renderRow();
    expect(screen.getByRole('button', { name: 'Bỏ lưu' })).toHaveTextContent('★');
  });
});
