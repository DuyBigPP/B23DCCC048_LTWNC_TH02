import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useRoutineDispatch, useRoutines } from './RoutineContext';

interface CreateRoutineFormProps {
  isNameTaken: (name: string) => boolean;
}

// Chỉ dùng dispatch nên không render lại khi danh sách giáo án thay đổi.
const CreateRoutineForm = memo(function CreateRoutineForm({ isNameTaken }: CreateRoutineFormProps) {
  const dispatch = useRoutineDispatch();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed === '') return setError('Tên giáo án không được để trống');
    if (isNameTaken(trimmed)) return setError('Tên giáo án đã tồn tại');
    dispatch({ type: 'create', id: crypto.randomUUID(), name: trimmed });
    setName('');
    setError('');
  };

  return (
    <form className="routine-form" onSubmit={handleSubmit} noValidate>
      <label>
        Tên giáo án
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button type="submit">Tạo</button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
});

export default function RoutinesPage() {
  const routines = useRoutines();
  const dispatch = useRoutineDispatch();

  // Ref giúp isNameTaken luôn đọc danh sách mới nhất mà vẫn giữ nguyên tham chiếu.
  const routinesRef = useRef(routines);
  useEffect(() => {
    routinesRef.current = routines;
  }, [routines]);

  const isNameTaken = useCallback(
    (name: string) =>
      routinesRef.current.some((r) => r.name.toLowerCase() === name.toLowerCase()),
    [],
  );

  return (
    <section>
      <h1>Giáo án</h1>
      <CreateRoutineForm isNameTaken={isNameTaken} />
      <ul className="routine-list">
        {routines.map((r) => (
          <li key={r.id}>
            <Link to={`/routines/${r.id}`}>{r.name}</Link>
            <span>{`${r.exerciseIds.length} bài`}</span>
            <button type="button" onClick={() => dispatch({ type: 'remove', id: r.id })}>
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
