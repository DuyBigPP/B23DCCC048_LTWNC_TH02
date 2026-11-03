import { memo, useCallback, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { FixedSizeList, areEqual } from 'react-window';
import type { ListChildComponentProps } from 'react-window';
import { EXERCISES, GROUPS } from '../../data/exercises';
import { useDebounce } from '../../hooks/useDebounce';
import type { Exercise, MuscleGroup } from '../../types';
import ExerciseRow from './ExerciseRow';

type GroupFilter = MuscleGroup | 'all';
type SortKey = 'default' | 'name' | 'duration';

interface RowData {
  items: Exercise[];
  onStart: (exercise: Exercise) => void;
}

const itemKey = (index: number, data: RowData) => data.items[index].id;

const Row = memo(function Row({ index, style, data }: ListChildComponentProps<RowData>) {
  return (
    <ExerciseRow
      exercise={data.items[index]}
      index={index}
      style={style}
      onStart={data.onStart}
    />
  );
}, areEqual);

export default function LibraryPage() {
  const [keyword, setKeyword] = useState('');
  const [group, setGroup] = useState<GroupFilter>('all');
  const [sort, setSort] = useState<SortKey>('default');
  const debouncedKeyword = useDebounce(keyword, 300);

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

  const handleStart = useCallback(() => {
    // Phần 2: nối với buổi tập (Zustand)
  }, []);

  const itemData = useMemo<RowData>(() => ({ items, onStart: handleStart }), [items, handleStart]);

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
      </div>

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
