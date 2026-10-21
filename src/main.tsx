import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import '@mantine/core/styles.css';
import './styles.css';
import { theme } from './theme';
import { AppDataProvider } from './state/AppDataContext';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App';
import { isNativeApp } from './lib/native';

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'habits-app-color-scheme',
});

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element');

createRoot(rootElement).render(
  <StrictMode>
    <MantineProvider
      theme={theme}
      defaultColorScheme="auto"
      colorSchemeManager={colorSchemeManager}
    >
      <AppDataProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AppDataProvider>
    </MantineProvider>
  </StrictMode>,
);

// Minimal service worker for offline use — production builds only.
// Inside the native shell the app files are bundled locally, so the worker
// is skipped and any earlier registration/cache is removed: a stale SW
// cache must never outlive an app update delivered as a new APK.
if (import.meta.env.PROD) {
  if (isNativeApp()) {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker
        .getRegistration()
        .then((registration) => registration?.unregister())
        .catch(() => undefined);
    }
    if ('caches' in window) {
      void caches
        .keys()
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => undefined);
    }
  } else if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    });
  }
}
