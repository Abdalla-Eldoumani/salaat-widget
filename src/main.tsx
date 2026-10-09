import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import DesktopOnly from './components/DesktopOnly';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const hasShell = '__TAURI_INTERNALS__' in window;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>{hasShell ? <App /> : <DesktopOnly />}</ErrorBoundary>
  </StrictMode>,
);
