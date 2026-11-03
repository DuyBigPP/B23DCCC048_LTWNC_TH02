import { beforeEach, describe, expect, it } from 'vitest';
import { useSavedStore } from './useSavedStore';

const savedInStorage = () => {
  const raw = localStorage.getItem('workout-saved');
  return raw ? (JSON.parse(raw) as { state: { ids: string[] } }).state.ids : null;
};

describe('useSavedStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useSavedStore.setState({ ids: [] });
  });

  it('toggle lần đầu lưu bài, lần hai bỏ lưu', () => {
    useSavedStore.getState().toggle('e1');
    useSavedStore.getState().toggle('e3');
    expect(useSavedStore.getState().ids).toEqual(['e1', 'e3']);

    useSavedStore.getState().toggle('e1');
    expect(useSavedStore.getState().ids).toEqual(['e3']);
  });

  it('ghi danh sách đã lưu vào localStorage key "workout-saved"', () => {
    useSavedStore.getState().toggle('e1');
    useSavedStore.getState().toggle('e3');
    expect(savedInStorage()).toEqual(['e1', 'e3']);
  });

  it('tải lại trang (rehydrate) thì đọc lại danh sách từ localStorage', async () => {
    localStorage.setItem('workout-saved', JSON.stringify({ state: { ids: ['e1', 'e3'] }, version: 0 }));
    await useSavedStore.persist.rehydrate();
    expect(useSavedStore.getState().ids).toEqual(['e1', 'e3']);
  });
});
