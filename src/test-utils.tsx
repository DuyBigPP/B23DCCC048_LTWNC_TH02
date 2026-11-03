import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { RoutineProvider } from './features/routines/RoutineContext';

interface Options {
  /** Địa chỉ đang mở, VD "/routines/r1". */
  route?: string;
  /** Mẫu route để useParams đọc được tham số, VD "/routines/:id". */
  path?: string;
}

export function renderWithProviders(ui: ReactElement, { route = '/', path }: Options = {}) {
  return render(
    <ThemeProvider>
      <RoutineProvider>
        <MemoryRouter initialEntries={[route]}>
          {path ? (
            <Routes>
              <Route path={path} element={ui} />
            </Routes>
          ) : (
            ui
          )}
        </MemoryRouter>
      </RoutineProvider>
    </ThemeProvider>,
  );
}
