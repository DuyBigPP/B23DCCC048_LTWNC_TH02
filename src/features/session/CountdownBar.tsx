import { formatDuration } from '../../utils/format';
import { useSessionStore } from './useSessionStore';

export default function CountdownBar() {
  const duration = useSessionStore((s) => s.queue[s.currentIndex]?.duration);
  const elapsed = useSessionStore((s) => s.elapsed);
  const isResting = useSessionStore((s) => s.isResting);
  const restLeft = useSessionStore((s) => s.restLeft);
  const restDuration = useSessionStore((s) => s.restDuration);
  const nextName = useSessionStore((s) => s.queue[s.currentIndex + 1]?.name);

  if (duration === undefined) return null;

  if (isResting) {
    const percent = Math.round(((restDuration - restLeft) / restDuration) * 100);
    return (
      <div className="countdown resting">
        <span>{`Nghỉ giữa bài: ${formatDuration(restLeft)} – tiếp theo: ${nextName}`}</span>
        <progress value={percent} max={100} aria-label="Tiến trình nghỉ" />
      </div>
    );
  }

  const percent = Math.round((elapsed / duration) * 100);

  return (
    <div className="countdown">
      <span>{`Còn lại: ${formatDuration(duration - elapsed)}`}</span>
      <progress value={percent} max={100} aria-label="Tiến trình bài tập" />
    </div>
  );
}
