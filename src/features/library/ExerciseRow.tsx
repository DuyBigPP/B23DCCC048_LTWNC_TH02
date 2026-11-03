import { memo, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { Exercise } from '../../types';
import { formatDuration } from '../../utils/format';

interface ExerciseRowProps {
  exercise: Exercise;
  index: number;
  style?: CSSProperties;
  onStart: (exercise: Exercise) => void;
}

function ExerciseRow({ exercise, index, style, onStart }: ExerciseRowProps) {
  const handleStart = useCallback(() => onStart(exercise), [onStart, exercise]);

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
      </span>
    </div>
  );
}

export default memo(ExerciseRow);
