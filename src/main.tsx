import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core';
import '@mantine/core/styles.css';
import './styles.css';
import { theme } from './theme';
import { AppDataProvider } from './state/AppDataContext';
import { LanguageProvider } from './i18n/LanguageContext';
import App from './App';

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
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  });
}
