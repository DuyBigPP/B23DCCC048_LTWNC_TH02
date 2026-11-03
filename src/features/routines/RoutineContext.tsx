import { createContext, useContext, useEffect, useReducer } from 'react';
import type { Dispatch, ReactNode } from 'react';
import { routineReducer } from './routineReducer';
import type { Routine, RoutineAction } from './routineReducer';
import { withLogger } from './withLogger';

const STORAGE_KEY = 'workout-routines';

const RoutineStateContext = createContext<Routine[] | null>(null);
const RoutineDispatchContext = createContext<Dispatch<RoutineAction> | null>(null);

const loggedReducer = withLogger(routineReducer);

const isRoutine = (value: unknown): value is Routine => {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.name === 'string' &&
    Array.isArray(r.exerciseIds) &&
    r.exerciseIds.every((id) => typeof id === 'string')
  );
};

function loadRoutines(): Routine[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(data) ? data.filter(isRoutine) : [];
  } catch {
    return [];
  }
}

export function RoutineProvider({ children }: { children: ReactNode }) {
  const [routines, dispatch] = useReducer(loggedReducer, undefined, loadRoutines);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines));
  }, [routines]);

  return (
    <RoutineStateContext.Provider value={routines}>
      <RoutineDispatchContext.Provider value={dispatch}>{children}</RoutineDispatchContext.Provider>
    </RoutineStateContext.Provider>
  );
}

export function useRoutines(): Routine[] {
  const routines = useContext(RoutineStateContext);
  if (routines === null) throw new Error('useRoutines() phải được dùng bên trong <RoutineProvider>');
  return routines;
}

export function useRoutineDispatch(): Dispatch<RoutineAction> {
  const dispatch = useContext(RoutineDispatchContext);
  if (dispatch === null) {
    throw new Error('useRoutineDispatch() phải được dùng bên trong <RoutineProvider>');
  }
  return dispatch;
}
