import { describe, expect, it } from 'vitest';
import { routineReducer } from './routineReducer';
import type { Routine } from './routineReducer';

const chest: Routine = { id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] };
const legs: Routine = { id: 'r2', name: 'Ngày chân', exerciseIds: [] };

describe('routineReducer', () => {
  it('create thêm giáo án mới, rỗng bài tập, vào cuối danh sách', () => {
    const next = routineReducer([chest], { type: 'create', id: 'r2', name: 'Ngày chân' });
    expect(next).toEqual([chest, { id: 'r2', name: 'Ngày chân', exerciseIds: [] }]);
  });

  it('rename chỉ đổi tên đúng giáo án', () => {
    const next = routineReducer([chest, legs], { type: 'rename', id: 'r2', name: 'Chân mông' });
    expect(next).toEqual([chest, { ...legs, name: 'Chân mông' }]);
  });

  it('remove xóa đúng giáo án', () => {
    expect(routineReducer([chest, legs], { type: 'remove', id: 'r1' })).toEqual([legs]);
  });

  it('xóa giáo án không tồn tại thì state giữ nguyên', () => {
    const state = [chest, legs];
    expect(routineReducer(state, { type: 'remove', id: 'r9' })).toEqual([chest, legs]);
  });

  it('addExercise thêm bài vào cuối giáo án', () => {
    const next = routineReducer([chest, legs], { type: 'addExercise', routineId: 'r1', exerciseId: 'e2' });
    expect(next).toEqual([{ ...chest, exerciseIds: ['e1', 'e2'] }, legs]);
  });

  it('addExercise không thêm trùng bài đã có', () => {
    const next = routineReducer([chest], { type: 'addExercise', routineId: 'r1', exerciseId: 'e1' });
    expect(next).toEqual([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] }]);
  });

  it('removeExercise bỏ bài khỏi giáo án', () => {
    const state: Routine[] = [{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e2', 'e3'] }];
    const next = routineReducer(state, { type: 'removeExercise', routineId: 'r1', exerciseId: 'e2' });
    expect(next).toEqual([{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1', 'e3'] }]);
  });

  it('thao tác với giáo án không tồn tại thì state giữ nguyên', () => {
    const state = [chest];
    expect(routineReducer(state, { type: 'rename', id: 'r9', name: 'X' })).toEqual([chest]);
    expect(routineReducer(state, { type: 'addExercise', routineId: 'r9', exerciseId: 'e2' })).toEqual([chest]);
    expect(routineReducer(state, { type: 'removeExercise', routineId: 'r9', exerciseId: 'e1' })).toEqual([chest]);
  });

  it('là hàm thuần: không sửa trực tiếp state cũ', () => {
    const state: Routine[] = [{ id: 'r1', name: 'Ngày ngực', exerciseIds: ['e1'] }];
    const snapshot = structuredClone(state);
    routineReducer(state, { type: 'addExercise', routineId: 'r1', exerciseId: 'e2' });
    routineReducer(state, { type: 'removeExercise', routineId: 'r1', exerciseId: 'e1' });
    routineReducer(state, { type: 'rename', id: 'r1', name: 'Khác' });
    routineReducer(state, { type: 'create', id: 'r2', name: 'Mới' });
    routineReducer(state, { type: 'remove', id: 'r1' });
    expect(state).toEqual(snapshot);
  });
});
