export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
}

export type RoutineAction =
  | { type: 'create'; id: string; name: string }
  | { type: 'rename'; id: string; name: string }
  | { type: 'remove'; id: string }
  | { type: 'addExercise'; routineId: string; exerciseId: string }
  | { type: 'removeExercise'; routineId: string; exerciseId: string };

const updateRoutine = (state: Routine[], id: string, update: (r: Routine) => Routine): Routine[] =>
  state.some((r) => r.id === id) ? state.map((r) => (r.id === id ? update(r) : r)) : state;

export function routineReducer(state: Routine[], action: RoutineAction): Routine[] {
  switch (action.type) {
    case 'create':
      return [...state, { id: action.id, name: action.name, exerciseIds: [] }];
    case 'rename':
      return updateRoutine(state, action.id, (r) => ({ ...r, name: action.name }));
    case 'remove':
      return state.some((r) => r.id === action.id) ? state.filter((r) => r.id !== action.id) : state;
    case 'addExercise':
      return updateRoutine(state, action.routineId, (r) =>
        r.exerciseIds.includes(action.exerciseId)
          ? r
          : { ...r, exerciseIds: [...r.exerciseIds, action.exerciseId] },
      );
    case 'removeExercise':
      return updateRoutine(state, action.routineId, (r) => ({
        ...r,
        exerciseIds: r.exerciseIds.filter((id) => id !== action.exerciseId),
      }));
  }
}
