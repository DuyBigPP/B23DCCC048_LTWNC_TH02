import { useCallback, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { EXERCISE_BY_ID } from '../../data/exercises';
import { formatDuration, formatMinutesSeconds } from '../../utils/format';
import { useSessionStore } from '../session/useSessionStore';
import { useRoutineDispatch, useRoutines } from './RoutineContext';

export default function RoutineDetailPage() {
  const { id } = useParams();
  const routine = useRoutines().find((r) => r.id === id);
  const dispatch = useRoutineDispatch();
  const startSession = useSessionStore((s) => s.startSession);

  const exercises = useMemo(
    () => (routine?.exerciseIds ?? []).flatMap((exerciseId) => EXERCISE_BY_ID.get(exerciseId) ?? []),
    [routine],
  );
  const totalSeconds = exercises.reduce((sum, e) => sum + e.duration, 0);

  const handleStartAll = useCallback(() => startSession(exercises, 0), [exercises, startSession]);

  if (!routine) {
    return (
      <section>
        <h1>Chi tiết giáo án</h1>
        <p>Không tìm thấy giáo án</p>
        <Link to="/routines">← Danh sách giáo án</Link>
      </section>
    );
  }

  return (
    <section>
      <Link to="/routines">← Danh sách giáo án</Link>
      <h1>{routine.name}</h1>
      <p>{`Tổng thời gian: ${formatMinutesSeconds(totalSeconds)}`}</p>
      <button type="button" onClick={handleStartAll} disabled={exercises.length === 0}>
        Tập tất cả
      </button>
      <ul className="routine-exercises">
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            <span className="col-name">{exercise.name}</span>
            <span className="col-trainer">{exercise.trainer}</span>
            <span className="col-duration">{formatDuration(exercise.duration)}</span>
            <button
              type="button"
              onClick={() =>
                dispatch({ type: 'removeExercise', routineId: routine.id, exerciseId: exercise.id })
              }
            >
              Bỏ
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
