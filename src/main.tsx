import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import UpdateBanner from './components/UpdateBanner';
// Service worker registration via vite-plugin-pwa virtual module
// @ts-ignore: virtual module provided by vite-plugin-pwa at build time
import { registerSW } from 'virtual:pwa-register';
import { useEffect, useState } from 'react';

function Root() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    let swRegistration: ServiceWorkerRegistration | undefined;
    // registerSW returns an updater function that checks for service worker updates.
    const updateFn = registerSW({
      onRegistered(reg: ServiceWorkerRegistration | undefined) {
        console.log('Service worker registered.', reg);
        swRegistration = reg ?? undefined;
      },
      onRegisterError(err: any) {
        console.error('Service worker registration failed:', err);
      },
      onOfflineReady() {
        console.log('App is ready to work offline.');
      },
      onNeedRefresh() {
        console.log('New content available, update ready.');
        const maybeWaiting = swRegistration?.waiting ?? null;
        setWaitingWorker(maybeWaiting);
        setUpdateAvailable(true);
      },
    });

    if (typeof updateFn === 'function') {
      (window as any).__updateServiceWorker = updateFn;
      void updateFn();
    }

    return () => {
      // no cleanup needed for sw registration helper
    };
  }, []);

  // Apply update when user chooses to
  const applyUpdate = async () => {
    try {
      if (waitingWorker && waitingWorker.postMessage) {
        // listen for controllerchange to reload when new SW takes control
        const onControllerChange = () => {
          window.location.reload();
        };
        navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      } else {
        // fallback: try the updater returned by registerSW (global helper)
        const up = (window as any).__updateServiceWorker as (() => Promise<void>) | undefined;
        if (up) {
          await up();
          window.location.reload();
        } else {
          console.warn('No waiting service worker found and no updater available.');
        }
      }
    } catch (e) {
      console.error('Failed to apply update:', e);
    }
  };

  const dismiss = () => {
    setUpdateAvailable(false);
  };

  return (
    <>
      <App />
      <UpdateBanner updateAvailable={updateAvailable} onUpdateNow={applyUpdate} onLater={dismiss} />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
