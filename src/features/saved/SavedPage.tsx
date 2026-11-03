import { useCallback, useMemo } from 'react';
import { EXERCISE_BY_ID } from '../../data/exercises';
import type { Exercise } from '../../types';
import ExerciseRow from '../library/ExerciseRow';
import { useSessionStore } from '../session/useSessionStore';
import { useSavedStore } from './useSavedStore';

export default function SavedPage() {
  const ids = useSavedStore((s) => s.ids);
  const startSession = useSessionStore((s) => s.startSession);
  const addToSession = useSessionStore((s) => s.addToSession);

  const exercises = useMemo(
    () => ids.flatMap((id) => EXERCISE_BY_ID.get(id) ?? []),
    [ids],
  );

  const handleStart = useCallback(
    (exercise: Exercise) => startSession(exercises, exercises.indexOf(exercise)),
    [exercises, startSession],
  );
  const handleStartAll = useCallback(() => startSession(exercises, 0), [exercises, startSession]);

  return (
    <section>
      <h1>Bài tập đã lưu</h1>
      {exercises.length === 0 ? (
        <p>Bạn chưa lưu bài tập nào</p>
      ) : (
        <>
          <button type="button" onClick={handleStartAll}>
            Tập tất cả
          </button>
          <div className="exercise-list">
            {exercises.map((exercise, index) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                index={index}
                onStart={handleStart}
                onAddToSession={addToSession}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
