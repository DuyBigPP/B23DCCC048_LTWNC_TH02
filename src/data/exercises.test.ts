import { describe, expect, it } from 'vitest';
import { EXERCISES, EXERCISE_BY_ID, generateExercises } from './exercises';

describe('generateExercises', () => {
  const list = generateExercises(10000);

  it('sinh đủ 10000 bài tập', () => {
    expect(list).toHaveLength(10000);
  });

  it('không có id nào bị trùng', () => {
    expect(new Set(list.map((e) => e.id)).size).toBe(10000);
  });

  it('mọi thời lượng nằm trong khoảng 30–120 giây', () => {
    expect(list.every((e) => e.duration >= 30 && e.duration <= 120)).toBe(true);
  });

  it('3 bài đầu đúng như đề mô tả', () => {
    expect(list.slice(0, 3)).toEqual([
      { id: 'e1', name: 'Đẩy tạ đơn 1', trainer: 'Minh Khang', group: 'Ngực', duration: 30 },
      { id: 'e2', name: 'Kéo tạ đơn 1', trainer: 'Phương Anh', group: 'Chân', duration: 67 },
      { id: 'e3', name: 'Gập tạ đơn 1', trainer: 'Đức Anh', group: 'Tay', duration: 104 },
    ]);
  });
});

describe('EXERCISES', () => {
  it('kho dùng trong ứng dụng có 10000 bài', () => {
    expect(EXERCISES).toHaveLength(10000);
  });

  it('tra cứu theo id trả về đúng bài tập', () => {
    expect(EXERCISE_BY_ID.get('e3')?.name).toBe('Gập tạ đơn 1');
    expect(EXERCISE_BY_ID.get('e10000')?.id).toBe('e10000');
    expect(EXERCISE_BY_ID.get('e10001')).toBeUndefined();
  });
});
