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
  const restDuration = useSessionStore((s) => s.restDuration);
  const setRestDuration = useSessionStore((s) => s.setRestDuration);

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [isRunning, tick]);

  // Phím tắt Space: bỏ qua khi đang gõ hoặc đang focus nút (nút tự xử lý Space).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const target = e.target as HTMLElement;
      if (target.isContentEditable || target.closest('input, textarea, select, button')) return;
      e.preventDefault();
      toggleRun();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRun]);

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
        <label className="rest-select">
          Nghỉ giữa bài
          <select
            value={String(restDuration)}
            onChange={(e) => setRestDuration(Number(e.target.value))}
          >
            <option value="0">Không nghỉ</option>
            <option value="10">10 giây</option>
            <option value="30">30 giây</option>
          </select>
        </label>
      </div>
    </footer>
  );
}
