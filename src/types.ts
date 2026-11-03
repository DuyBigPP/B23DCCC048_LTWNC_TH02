export type MuscleGroup = 'Ngực' | 'Lưng' | 'Chân' | 'Vai' | 'Tay';

export interface Exercise {
  id: string;
  name: string;
  trainer: string; // huấn luyện viên hướng dẫn
  group: MuscleGroup;
  duration: number; // đơn vị: giây
}
