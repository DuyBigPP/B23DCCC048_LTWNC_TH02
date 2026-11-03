import { act, fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('LibraryPage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    rowRenders.count = 0;
    render(<LibraryPage />);
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

  it('đang gõ (chưa hết 300ms) thì các dòng không bị render lại', () => {
    const before = rowRenders.count;
    typeSearch('đ');
    typeSearch('đẩ');
    typeSearch('đẩy');
    expect(rowRenders.count).toBe(before);
  });
});
