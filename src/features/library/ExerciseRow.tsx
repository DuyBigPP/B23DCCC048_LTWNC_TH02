import { memo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { Exercise } from '../../types';
import { formatDuration } from '../../utils/format';
import { useSavedStore } from '../saved/useSavedStore';

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  style?: CSSProperties;
  onStart: (exercise: Exercise) => void;
  onAddToSession: (exercise: Exercise) => void;
}

function ExerciseRow({ exercise, index, style, onStart, onAddToSession }: ExerciseRowProps) {
  const isSaved = useSavedStore((s) => s.ids.includes(exercise.id));
  const toggleSaved = useSavedStore((s) => s.toggle);

  const handleStart = useCallback(() => onStart(exercise), [onStart, exercise]);
  const handleAddToSession = useCallback(() => onAddToSession(exercise), [onAddToSession, exercise]);
  const handleToggleSaved = useCallback(() => toggleSaved(exercise.id), [toggleSaved, exercise.id]);

  return (
    <div className="exercise-row" style={style}>
      <span className="col-index">{index + 1}</span>
      <span className="col-name">{exercise.name}</span>
      <span className="col-trainer">{exercise.trainer}</span>
      <span className="col-group">{exercise.group}</span>
      <span className="col-duration">{formatDuration(exercise.duration)}</span>
      <span className="col-actions">
        <button type="button" onClick={handleStart}>
          Bắt đầu
        </button>
        <button
          type="button"
          onClick={handleToggleSaved}
          aria-label={isSaved ? 'Bỏ lưu' : 'Lưu bài tập'}
        >
          {isSaved ? '★' : '☆'}
        </button>
        <button type="button" onClick={handleAddToSession}>
          + Buổi tập
        </button>
      </span>
    </div>
  );
}

export default memo(ExerciseRow);
