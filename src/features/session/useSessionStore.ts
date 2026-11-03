import { create } from 'zustand';
import type { Exercise } from '../../types';

interface SessionState {
  queue: Exercise[];
  currentIndex: number;
  isRunning: boolean;
  elapsed: number;
  startSession: (exercises: Exercise[], startIndex: number) => void;
  toggleRun: () => void;
  next: () => void;
  prev: () => void;
  addToSession: (exercise: Exercise) => void;
  tick: () => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  queue: [],
  currentIndex: -1,
  isRunning: false,
  elapsed: 0,

  startSession: (exercises, startIndex) => {
    if (exercises.length === 0) return;
    set({ queue: exercises, currentIndex: startIndex, elapsed: 0, isRunning: true });
  },

  toggleRun: () => {
    const { queue, currentIndex, isRunning } = get();
    if (queue.length === 0) return;
    if (currentIndex === -1) set({ currentIndex: 0, elapsed: 0, isRunning: true });
    else set({ isRunning: !isRunning });
  },

  next: () => {
    const { queue, currentIndex } = get();
    if (currentIndex < queue.length - 1) set({ currentIndex: currentIndex + 1, elapsed: 0 });
    else set({ isRunning: false });
  },

  prev: () => {
    const { currentIndex, elapsed } = get();
    if (elapsed > 3 || currentIndex <= 0) set({ elapsed: 0 });
    else set({ currentIndex: currentIndex - 1, elapsed: 0 });
  },

  addToSession: (exercise) => {
    const { queue } = get();
    if (queue.some((e) => e.id === exercise.id)) return;
    set({ queue: [...queue, exercise] });
  },

  tick: () => {
    const { queue, currentIndex, isRunning, elapsed } = get();
    const current = queue[currentIndex];
    if (!isRunning || !current) return;
    set({ elapsed: elapsed + 1 });
    if (elapsed + 1 >= current.duration) get().next();
  },
}));
