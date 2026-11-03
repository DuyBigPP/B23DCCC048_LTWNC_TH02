import { formatDuration } from '../../utils/format';
import { useSessionStore } from './useSessionStore';

export default function CountdownBar() {
  const duration = useSessionStore((s) => s.queue[s.currentIndex]?.duration);
  const elapsed = useSessionStore((s) => s.elapsed);

  if (duration === undefined) return null;

  const percent = Math.round((elapsed / duration) * 100);

  return (
    <div className="countdown">
      <span>{`Còn lại: ${formatDuration(duration - elapsed)}`}</span>
      <progress value={percent} max={100} aria-label="Tiến trình bài tập" />
    </div>
  );
}
