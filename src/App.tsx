import { Suspense, lazy } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { useTheme } from './contexts/ThemeContext';
import LibraryPage from './features/library/LibraryPage';
import SessionBar from './features/session/SessionBar';

const SavedPage = lazy(() => import('./features/saved/SavedPage'));
const RoutinesPage = lazy(() => import('./features/routines/RoutinesPage'));
const RoutineDetailPage = lazy(() => import('./features/routines/RoutineDetailPage'));

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? 'Giao diện tối' : 'Giao diện sáng'}
    </button>
  );
}

export default function App() {
  return (
    <>
      <header className="navbar">
        <nav>
          <NavLink to="/" end>
            Kho bài tập
          </NavLink>
          <NavLink to="/saved">Đã lưu</NavLink>
          <NavLink to="/routines">Giáo án</NavLink>
          <ThemeToggle />
        </nav>
      </header>
      <main>
        <Suspense fallback={<p>Đang tải trang...</p>}>
          <Routes>
            <Route path="/" element={<LibraryPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/routines" element={<RoutinesPage />} />
            <Route path="/routines/:id" element={<RoutineDetailPage />} />
          </Routes>
        </Suspense>
      </main>
      <SessionBar />
    </>
  );
}
