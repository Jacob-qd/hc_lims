import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

async function enableMocking() {
  if (import.meta.env.DEV || isLocalhost) {
    console.log('[MSW] Starting worker on', window.location.hostname);
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
      console.log('[MSW] Worker started');
    } catch (err) {
      console.error('[MSW] Failed to start worker:', err);
    }
  } else {
    console.log('[MSW] Skipped (not dev or localhost)');
  }
}

// PWA service worker — only in real production (not localhost preview)
if (!import.meta.env.DEV && !isLocalhost && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

// Unregister stale PWA SW on localhost to prevent conflicts with MSW
if (isLocalhost && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => {
      if (reg.active?.scriptURL?.includes('sw.js')) {
        console.log('[SW] Unregistering stale PWA service worker');
        reg.unregister();
      }
    });
  });
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
});
