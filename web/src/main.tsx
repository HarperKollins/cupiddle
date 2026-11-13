import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// Global Chunk Load Recovery: If a stale PWA cache requests an old Vite chunk hash, reload freshly
window.addEventListener('error', (e) => {
  const isChunkError =
    e.message?.includes('Failed to fetch dynamically imported module') ||
    e.message?.includes('Loading chunk') ||
    (e.target && (e.target as any).tagName === 'SCRIPT');

  if (isChunkError && !sessionStorage.getItem('cupiddle_chunk_reload')) {
    sessionStorage.setItem('cupiddle_chunk_reload', 'true');
    window.location.reload();
  }
});

// Register PWA Service Worker with auto-update
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        reg.update();
      })
      .catch((err) => {
        console.log('SW registration note:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
