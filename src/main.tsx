import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';

import { App } from '@/app/App';
import { AppProviders } from '@/app/AppProviders';
import { registerPwaUpdates } from '@/app/pwaRegistration';
import '@/styles/global.css';

registerPwaUpdates(registerSW);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>
);
