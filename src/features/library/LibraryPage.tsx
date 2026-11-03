import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FixedSizeList, areEqual } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import { EXERCISES, GROUPS } from '../../data/exercises';
import { useDebounce } from '../../hooks/useDebounce';
import type { Exercise, MuscleGroup } from '../../types';
import { useRoutineDispatch, useRoutines } from '../routines/RoutineContext';
import { useSessionStore } from '../session/useSessionStore';
import ExerciseRow from './ExerciseRow';

type GroupFilter = MuscleGroup | 'all';
type SortKey = 'default' | 'name' | 'duration';

interface RowData {
  items: Exercise[];
  onStart: (exercise: Exercise) => void;
  onAddToSession: (exercise: Exercise) => void;
  onAddToRoutine: (exercise: Exercise) => void;
  canAddToRoutine: boolean;
}

const itemKey = (index: number, data: RowData) => data.items[index].id;

const Row = memo(function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  return (
    <ExerciseRow
      exercise={data.items[index]}
      index={index}
      style={style}
      onStart={data.onStart}
      onAddToSession={data.onAddToSession}
      onAddToRoutine={data.onAddToRoutine}
      canAddToRoutine={data.canAddToRoutine}
    />
  );
}, areEqual);

export default function LibraryPage() {
  const [keyword, setKeyword] = useState('');
  const [group, setGroup] = useState<GroupFilter>('all');
  const [sort, setSort] = useState<SortKey>('default');
  const debouncedKeyword = useDebounce(keyword, 300);
  const startSession = useSessionStore((s) => s.startSession);
  const addToSession = useSessionStore((s) => s.addToSession);
  const routines = useRoutines();
  const routineDispatch = useRoutineDispatch();
  const [selectedRoutineId, setSelectedRoutineId] = useState('');
  // Giáo án đã chọn bị xóa (hoặc chưa chọn) thì dùng giáo án đầu tiên.
  const activeRoutineId = routines.some((r) => r.id === selectedRoutineId)
    ? selectedRoutineId
    : (routines[0]?.id ?? '');

  // Ref để handler đọc danh sách mới nhất mà không đổi tham chiếu (tránh render lại các dòng).
  const routinesRef = useRef(routines);
  useEffect(() => {
    routinesRef.current = routines;
  }, [routines]);

  // seq giúp hẹn giờ ẩn chạy lại kể cả khi nội dung thông báo trùng lần trước.
  const [notice, setNotice] = useState<{ text: string; seq: number } | null>(null);
  const showNotice = useCallback((text: string) => {
    setNotice((prev) => ({ text, seq: (prev?.seq ?? 0) + 1 }));
  }, []);
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3000);
    return () => clearTimeout(id);
  }, [notice]);

  const items = useMemo(() => {
    const q = debouncedKeyword.trim().toLowerCase();
    const filtered = EXERCISES.filter(
      (e) =>
        (group === 'all' || e.group === group) &&
        (q === '' || e.name.toLowerCase().includes(q) || e.trainer.toLowerCase().includes(q)),
    );
    if (sort === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    if (sort === 'duration') return [...filtered].sort((a, b) => a.duration - b.duration);
    return filtered;
  }, [debouncedKeyword, group, sort]);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  }, []);

  const handleGroupChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setGroup(e.target.value as GroupFilter);
  }, []);

  const handleSortChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortKey);
  }, []);

  // Buổi tập là danh sách đang hiển thị (đã lọc, đã sắp xếp), bắt đầu từ bài được bấm.
  const handleStart = useCallback(
    (exercise: Exercise) => startSession(items, items.indexOf(exercise)),
    [items, startSession],
  );

  const handleRoutineChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoutineId(e.target.value);
  }, []);

  const handleAddToSession = useCallback(
    (exercise: Exercise) => {
      const exists = useSessionStore.getState().queue.some((e) => e.id === exercise.id);
      addToSession(exercise);
      showNotice(
        exists ? `"${exercise.name}" đã có trong buổi tập` : `Đã thêm "${exercise.name}" vào buổi tập`,
      );
    },
    [addToSession, showNotice],
  );

  const handleAddToRoutine = useCallback(
    (exercise: Exercise) => {
      const routine = routinesRef.current.find((r) => r.id === activeRoutineId);
      if (!routine) return;
      if (routine.exerciseIds.includes(exercise.id)) {
        showNotice(`"${exercise.name}" đã có trong giáo án "${routine.name}"`);
        return;
      }
      routineDispatch({ type: 'addExercise', routineId: routine.id, exerciseId: exercise.id });
      showNotice(`Đã thêm "${exercise.name}" vào giáo án "${routine.name}"`);
    },
    [activeRoutineId, routineDispatch, showNotice],
  );

  const canAddToRoutine = activeRoutineId !== '';

  const itemData = useMemo<RowData>(
    () => ({
      items,
      onStart: handleStart,
      onAddToSession: handleAddToSession,
      onAddToRoutine: handleAddToRoutine,
      canAddToRoutine,
    }),
    [items, handleStart, handleAddToSession, handleAddToRoutine, canAddToRoutine],
  );

  return (
    <section>
      <h1>Kho bài tập</h1>
      <div className="filters">
        <label>
          Tìm kiếm
          <input
            type="search"
            value={keyword}
            onChange={handleSearchChange}
            placeholder="Tên bài tập hoặc HLV"
          />
        </label>
        <label>
          Nhóm cơ
          <select value={group} onChange={handleGroupChange}>
            <option value="all">Tất cả</option>
            {GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sắp xếp
          <select value={sort} onChange={handleSortChange}>
            <option value="default">Mặc định</option>
            <option value="name">Tên A–Z</option>
            <option value="duration">Thời lượng tăng dần</option>
          </select>
        </label>
        <label>
          Giáo án đang chọn
          <select
            value={activeRoutineId}
            onChange={handleRoutineChange}
            disabled={routines.length === 0}
          >
            {routines.length === 0 && <option value="">Chưa có giáo án</option>}
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="notice" role="status">
        {notice?.text}
      </p>

      {items.length === 0 ? (
        <p>Không tìm thấy bài tập nào</p>
      ) : (
        <>
          <p>{`Tìm thấy ${items.length} bài tập`}</p>
          <FixedSizeList
            height={560}
            width="100%"
            itemCount={items.length}
            itemSize={56}
            itemData={itemData}
            itemKey={itemKey}
          >
            {Row}
          </FixedSizeList>
        </>
      )}
    </section>
  );
}
