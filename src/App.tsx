import { NavLink, Route, Routes } from 'react-router-dom';
import LibraryPage from './features/library/LibraryPage';
import SavedPage from './features/saved/SavedPage';
import RoutinesPage from './features/routines/RoutinesPage';
import RoutineDetailPage from './features/routines/RoutineDetailPage';

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
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/saved" element={<SavedPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/routines/:id" element={<RoutineDetailPage />} />
        </Routes>
      </main>
    </>
  );
}
