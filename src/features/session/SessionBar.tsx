import { useEffect } from 'react';
import CountdownBar from './CountdownBar';
import { useSessionStore } from './useSessionStore';

export default function SessionBar() {
  const current = useSessionStore((s) => s.queue[s.currentIndex]);
  const queueLength = useSessionStore((s) => s.queue.length);
  const isRunning = useSessionStore((s) => s.isRunning);
  const toggleRun = useSessionStore((s) => s.toggleRun);
  const next = useSessionStore((s) => s.next);
  const prev = useSessionStore((s) => s.prev);
  const tick = useSessionStore((s) => s.tick);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  const empty = queueLength === 0;

  return (
    <footer className="session-bar">
      <div className="session-info">
        <strong>
          {current ? `Đang tập: ${current.name} – HLV ${current.trainer}` : 'Chưa bắt đầu buổi tập'}
        </strong>
        <CountdownBar />
      </div>
      <div className="session-controls">
        <button type="button" onClick={prev} disabled={empty}>
          Trước
        </button>
        <button type="button" onClick={toggleRun} disabled={empty}>
          {isRunning ? 'Tạm dừng' : 'Bắt đầu'}
        </button>
        <button type="button" onClick={next} disabled={empty}>
          Sau
        </button>
        <span>{`Buổi tập: ${queueLength} bài`}</span>
      </div>
    </footer>
  );
}
