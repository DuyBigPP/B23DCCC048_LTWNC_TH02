import { act, render, renderHook, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RoutineProvider, useRoutineDispatch, useRoutines } from './RoutineContext';

const stored = () => JSON.parse(localStorage.getItem('workout-routines') ?? 'null') as unknown;

function RoutineNames() {
  const routines = useRoutines();
  return <p>{routines.map((r) => r.name).join(', ') || 'trống'}</p>;
}

// Mỗi lần DispatchOnly render sẽ báo dispatch nhận được qua spy này.
const onDispatchOnlyRender = vi.fn<(dispatch: ReturnType<typeof useRoutineDispatch>) => void>();
function DispatchOnly() {
  onDispatchOnlyRender(useRoutineDispatch());
  return null;
}
const dispatch = () => onDispatchOnlyRender.mock.lastCall![0];

describe('RoutineContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    onDispatchOnlyRender.mockClear();
  });

  it('useRoutines dùng ngoài Provider thì báo lỗi rõ ràng', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useRoutines())).toThrow(/RoutineProvider/);
  });

  it('useRoutineDispatch dùng ngoài Provider thì báo lỗi rõ ràng', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useRoutineDispatch())).toThrow(/RoutineProvider/);
  });

  it('đọc danh sách giáo án đã lưu trong localStorage "workout-routines"', () => {
    localStorage.setItem(
      'workout-routines',
      JSON.stringify([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] }]),
    );
    render(
      <RoutineProvider>
        <RoutineNames />
      </RoutineProvider>,
    );
    expect(screen.getByText('Ngày ngực')).toBeInTheDocument();
  });

  it('dữ liệu localStorage hỏng thì bắt đầu với danh sách rỗng', () => {
    localStorage.setItem('workout-routines', '{hỏng');
    render(
      <RoutineProvider>
        <RoutineNames />
      </RoutineProvider>,
    );
    expect(screen.getByText('trống')).toBeInTheDocument();
  });

  it('dispatch cập nhật danh sách và lưu vào localStorage mỗi khi thay đổi', () => {
    render(
      <RoutineProvider>
        <RoutineNames />
        <DispatchOnly />
      </RoutineProvider>,
    );
    act(() => {
      dispatch()({ type: 'create', id: 'r1', name: 'Ngày ngực' });
      dispatch()({ type: 'addExercise', routineId: 'r1', exerciseId: 'e1' });
    });

    expect(screen.getByText('Ngày ngực')).toBeInTheDocument();
    expect(stored()).toEqual([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] }]);
  });

  it('component chỉ dùng dispatch không bị render lại khi danh sách thay đổi', () => {
    render(
      <RoutineProvider>
        <RoutineNames />
        <DispatchOnly />
      </RoutineProvider>,
    );
    const before = onDispatchOnlyRender.mock.calls.length;

    act(() => {
      dispatch()({ type: 'create', id: 'r1', name: 'Ngày ngực' });
    });

    expect(screen.getByText('Ngày ngực')).toBeInTheDocument();
    expect(onDispatchOnlyRender).toHaveBeenCalledTimes(before);
  });
});
