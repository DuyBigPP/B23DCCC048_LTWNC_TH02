import { act, fireEvent, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { useSavedStore } from '../saved/useSavedStore';
import { useSessionStore } from '../session/useSessionStore';
import LibraryPage from './LibraryPage';

const rowRenders = vi.hoisted(() => ({ count: 0 }));

// Bọc ExerciseRow thật để đếm số lần dòng bị render (không thay đổi hành vi).
vi.mock('./ExerciseRow', async (importOriginal) => {
  const { default: Real } = await importOriginal<typeof import('./ExerciseRow')>();
  return {
    default: function CountedRow(props: ComponentProps<typeof Real>) {
      rowRenders.count += 1;
      return <Real {...props} />;
    },
  };
});

const typeSearch = (value: string) => {
  fireEvent.change(screen.getByLabelText('Tìm kiếm'), { target: { value } });
};
const waitDebounce = () => {
  act(() => {
    vi.advanceTimersByTime(300);
  });
};
const select = (label: string, value: string) => {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
};
const foundText = () => screen.getByText(/^Tìm thấy \d+ bài tập$/).textContent;
const firstRowName = () => document.querySelector('.exercise-row .col-name')?.textContent;
const clickRowButton = (name: string, row: number) => {
  fireEvent.click(screen.getAllByRole('button', { name })[row]);
};
const session = () => useSessionStore.getState();
const currentName = () => session().queue[session().currentIndex]?.name;

describe('LibraryPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useSavedStore.setState({ ids: [] });
    useSessionStore.setState({ queue: [], currentIndex: -1, isRunning: false, elapsed: 0 });
    rowRenders.count = 0;
    renderWithProviders(<LibraryPage />);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ban đầu hiện đủ 10000 bài nhưng chỉ render vài dòng trong DOM (ảo hóa)', () => {
    expect(foundText()).toBe('Tìm thấy 10000 bài tập');
    const rows = document.querySelectorAll('.exercise-row').length;
    expect(rows).toBeGreaterThan(0);
    expect(rows).toBeLessThanOrEqual(15);
  });

  it('gõ "đẩy": trong 300ms danh sách chưa đổi, sau 300ms còn 1250 bài', () => {
    typeSearch('đẩy');
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(foundText()).toBe('Tìm thấy 10000 bài tập');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(foundText()).toBe('Tìm thấy 1250 bài tập');
  });

  it('tìm không phân biệt hoa thường', () => {
    typeSearch('ĐẨY');
    waitDebounce();
    expect(foundText()).toBe('Tìm thấy 1250 bài tập');
  });

  it('"đẩy" kết hợp nhóm cơ Vai còn 250 bài', () => {
    typeSearch('đẩy');
    waitDebounce();
    select('Nhóm cơ', 'Vai');
    expect(foundText()).toBe('Tìm thấy 250 bài tập');
  });

  it('tìm theo tên huấn luyện viên: "đức anh" ra 1000 bài', () => {
    typeSearch('đức anh');
    waitDebounce();
    expect(foundText()).toBe('Tìm thấy 1000 bài tập');
    expect(document.querySelector('.exercise-row .col-trainer')?.textContent).toBe('Đức Anh');
  });

  it('không có kết quả thì báo "Không tìm thấy bài tập nào"', () => {
    typeSearch('xyz');
    waitDebounce();
    expect(screen.getByText('Không tìm thấy bài tập nào')).toBeInTheDocument();
    expect(document.querySelectorAll('.exercise-row')).toHaveLength(0);
  });

  it('sắp xếp Tên A–Z thì dòng đầu là "Bật chậm 1"', () => {
    select('Sắp xếp', 'name');
    expect(firstRowName()).toBe('Bật chậm 1');
  });

  it('sắp xếp Thời lượng tăng dần thì dòng đầu là bài 0:30', () => {
    select('Sắp xếp', 'duration');
    expect(document.querySelector('.exercise-row .col-duration')?.textContent).toBe('0:30');
  });

  it('sắp xếp không làm đổi thứ tự gốc: quay về Mặc định thì dòng đầu lại là "Đẩy tạ đơn 1"', () => {
    select('Sắp xếp', 'name');
    select('Sắp xếp', 'default');
    expect(firstRowName()).toBe('Đẩy tạ đơn 1');
  });

  it('bấm Bắt đầu: buổi tập là danh sách đang hiển thị (đã lọc), bắt đầu từ bài được bấm', () => {
    typeSearch('đẩy');
    waitDebounce();
    clickRowButton('Bắt đầu', 1);

    expect(session().queue).toHaveLength(1250);
    expect(session().queue.every((e) => e.name.startsWith('Đẩy'))).toBe(true);
    expect(session().currentIndex).toBe(1);
    expect(session().isRunning).toBe(true);

    session().next();
    expect(currentName()).toMatch(/^Đẩy/);
  });

  it('bấm Bắt đầu trên danh sách đã sắp xếp thì buổi tập theo đúng thứ tự đang hiển thị', () => {
    select('Sắp xếp', 'name');
    clickRowButton('Bắt đầu', 0);
    expect(currentName()).toBe('Bật chậm 1');
    expect(session().queue).toHaveLength(10000);
  });

  it('bấm "+ Buổi tập" thì thêm bài vào cuối buổi tập', () => {
    clickRowButton('+ Buổi tập', 0);
    clickRowButton('+ Buổi tập', 2);
    expect(session().queue.map((e) => e.id)).toEqual(['e1', 'e3']);
  });

  it('đồng hồ chạy (tick mỗi giây) không làm các dòng render lại', () => {
    clickRowButton('Bắt đầu', 0);
    const before = rowRenders.count;
    act(() => {
      session().tick();
      session().tick();
      session().tick();
    });
    expect(session().elapsed).toBe(3);
    expect(rowRenders.count).toBe(before);
  });

  it('đang gõ (chưa hết 300ms) thì các dòng không bị render lại', () => {
    const before = rowRenders.count;
    typeSearch('đ');
    typeSearch('đẩ');
    typeSearch('đẩy');
    expect(rowRenders.count).toBe(before);
  });
});

describe('LibraryPage – thêm bài vào giáo án', () => {
  const storedRoutines = () =>
    JSON.parse(localStorage.getItem('workout-routines') ?? '[]') as { id: string; exerciseIds: string[] }[];

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('chưa có giáo án nào thì nút "+ Giáo án" bị khóa', () => {
    renderWithProviders(<LibraryPage />);
    const buttons = screen.getAllByRole('button', { name: '+ Giáo án' });
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((b) => expect(b).toBeDisabled());
  });

  it('chọn "Ngày ngực", bấm + Giáo án ở e1, e2 rồi e1 lần nữa thì giáo án có 2 bài', () => {
    localStorage.setItem(
      'workout-routines',
      JSON.stringify([
        { id: 'r2', name: 'Ngày chân', exerciseIds: [] },
        { id: 'r1', name: 'Ngày ngực', exerciseIds: [] },
      ]),
    );
    renderWithProviders(<LibraryPage />);

    select('Giáo án đang chọn', 'r1');
    clickRowButton('+ Giáo án', 0);
    clickRowButton('+ Giáo án', 1);
    clickRowButton('+ Giáo án', 0);

    expect(storedRoutines()).toEqual([
      { id: 'r2', name: 'Ngày chân', exerciseIds: [] },
      { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2'] },
    ]);
  });

  it('mặc định chọn giáo án đầu tiên', () => {
    localStorage.setItem('workout-routines', JSON.stringify([{ id: 'r1', name: 'Ngày ngực', exerciseIds: [] }]));
    renderWithProviders(<LibraryPage />);

    expect(screen.getByLabelText('Giáo án đang chọn')).toHaveValue('r1');
    clickRowButton('+ Giáo án', 2);
    expect(storedRoutines()[0].exerciseIds).toEqual(['e3']);
  });

  it('khi thêm bài, Console có log action addExercise (middleware withLogger)', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    localStorage.setItem('workout-routines', JSON.stringify([{ id: 'r1', name: 'Ngày ngực', exerciseIds: [] }]));
    renderWithProviders(<LibraryPage />);

    clickRowButton('+ Giáo án', 0);

    expect(log).toHaveBeenCalledWith('addExercise', {
      prev: [{ id: 'r1', name: 'Ngày ngực', exerciseIds: [] }],
      next: [{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] }],
    });
  });
});
