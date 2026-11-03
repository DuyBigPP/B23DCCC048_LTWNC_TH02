import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Exercise } from '../../types';

interface SessionState {
  queue: Exercise[];
  currentIndex: number;
  isRunning: boolean;
  elapsed: number;
  /** Số giây nghỉ giữa 2 bài; 0 = không nghỉ. */
  restDuration: number;
  isResting: boolean;
  restLeft: number;
  startSession: (exercises: Exercise[], startIndex: number) => void;
  toggleRun: () => void;
  next: () => void;
  prev: () => void;
  addToSession: (exercise: Exercise) => void;
  tick: () => void;
  setRestDuration: (seconds: number) => void;
}

// devtools: xem lịch sử action trong Redux DevTools (chỉ bật khi chạy dev).
// Tham số thứ 3 của set là tên action hiện trong DevTools.
export const useSessionStore = create<SessionState>()(
  devtools(
    (set, get) => ({
      queue: [],
      currentIndex: -1,
      isRunning: false,
      elapsed: 0,
      restDuration: 0,
      isResting: false,
      restLeft: 0,

      startSession: (exercises, startIndex) => {
        if (exercises.length === 0) return;
        set(
          { queue: exercises, currentIndex: startIndex, elapsed: 0, isRunning: true, isResting: false },
          false,
          'startSession',
        );
      },

      toggleRun: () => {
        const { queue, currentIndex, isRunning } = get();
        if (queue.length === 0) return;
        if (currentIndex === -1) set({ currentIndex: 0, elapsed: 0, isRunning: true }, false, 'toggleRun');
        else set({ isRunning: !isRunning }, false, 'toggleRun');
      },

      next: () => {
        const { queue, currentIndex } = get();
        if (currentIndex < queue.length - 1) {
          set({ currentIndex: currentIndex + 1, elapsed: 0, isResting: false }, false, 'next');
        } else {
          set({ isRunning: false, isResting: false }, false, 'next');
        }
      },

      prev: () => {
        const { currentIndex, elapsed } = get();
        if (elapsed > 3 || currentIndex <= 0) set({ elapsed: 0, isResting: false }, false, 'prev');
        else set({ currentIndex: currentIndex - 1, elapsed: 0, isResting: false }, false, 'prev');
      },

      addToSession: (exercise) => {
        const { queue } = get();
        if (queue.some((e) => e.id === exercise.id)) return;
        set({ queue: [...queue, exercise] }, false, 'addToSession');
      },

      tick: () => {
        const { queue, currentIndex, isRunning, elapsed, isResting, restLeft, restDuration } = get();
        const current = queue[currentIndex];
        if (!isRunning || !current) return;

        if (isResting) {
          if (restLeft > 1) set({ restLeft: restLeft - 1 }, false, 'tick');
          else get().next();
          return;
        }

        set({ elapsed: elapsed + 1 }, false, 'tick');
        if (elapsed + 1 < current.duration) return;
        const hasNext = currentIndex < queue.length - 1;
        if (restDuration > 0 && hasNext) set({ isResting: true, restLeft: restDuration }, false, 'tick');
        else get().next();
      },

      setRestDuration: (seconds) =>
        set({ restDuration: Math.max(0, seconds) }, false, 'setRestDuration'),
    }),
    { name: 'session', enabled: import.meta.env.DEV },
  ),
);
