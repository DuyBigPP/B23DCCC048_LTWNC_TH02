import type { Exercise, MuscleGroup } from '../types';

const MOVE = ['Đẩy', 'Kéo', 'Gập', 'Nâng', 'Ép', 'Xoay', 'Bật', 'Giữ'];
const VARIANT = [
  'tạ đơn', 'tạ đòn', 'dây kháng lực', 'trên ghế', 'một tay',
  'hai tay', 'nghiêng', 'chậm', 'tốc độ', 'tại chỗ',
];
const TRAINERS = [
  'Minh Khang', 'Thu Trang', 'Hải Đăng', 'Phương Anh', 'Gia Bảo',
  'Lan Chi', 'Đức Anh', 'Khánh Linh', 'Văn Toàn', 'Mai Hương',
];
export const GROUPS: MuscleGroup[] = ['Ngực', 'Lưng', 'Chân', 'Vai', 'Tay'];

export const generateExercises = (count: number): Exercise[] =>
  Array.from({ length: count }, (_, i) => {
    const name = `${MOVE[i % 8]} ${VARIANT[Math.floor(i / 8) % 10]}`;
    return {
      id: `e${i + 1}`,
      name: `${name} ${Math.floor(i / 80) + 1}`,
      trainer: TRAINERS[(i * 3) % 10],
      group: GROUPS[(i * 2) % 5],
      duration: 30 + ((i * 37) % 91), // từ 30 đến 120 giây
    };
  });

export const EXERCISES = generateExercises(10000);

export const EXERCISE_BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));
