import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SavedState {
  ids: string[];
  toggle: (id: string) => void;
}

export const useSavedStore = create<SavedState>()(
  persist(
    (set) => ({
      ids: [],
      toggle: (id) =>
        set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
    }),
    { name: 'workout-saved' },
  ),
);
