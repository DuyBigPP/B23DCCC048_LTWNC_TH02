import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Exercise } from '../../types';
import ExerciseRow from './ExerciseRow';

const exercise: Exercise = {
  id: 'e1',
  name: 'Đẩy tạ đơn 1',
  trainer: 'Minh Khang',
  group: 'Ngực',
  duration: 30,
};

describe('ExerciseRow', () => {
  it('hiển thị số thứ tự, tên bài tập, HLV, nhóm cơ và thời lượng "0:30"', () => {
    render(<ExerciseRow exercise={exercise} index={4} onStart={vi.fn()} />);

    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Đẩy tạ đơn 1')).toBeInTheDocument();
    expect(screen.getByText('Minh Khang')).toBeInTheDocument();
    expect(screen.getByText('Ngực')).toBeInTheDocument();
    expect(screen.getByText('0:30')).toBeInTheDocument();
  });

  it('bấm nút Bắt đầu thì gọi onStart đúng một lần với đúng bài tập', async () => {
    const onStart = vi.fn();
    render(<ExerciseRow exercise={exercise} index={0} onStart={onStart} />);

    await userEvent.click(screen.getByRole('button', { name: 'Bắt đầu' }));

    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith(exercise);
  });
});
