import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { RoutineProvider } from './features/routines/RoutineContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RoutineProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </RoutineProvider>
    </ThemeProvider>
  </StrictMode>,
);
