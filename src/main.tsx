import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthCallback } from './components/AuthCallback.tsx';
import './index.css';

const root = createRoot(document.getElementById('root')!);

if (window.location.pathname === '/auth/callback' || window.location.pathname === '/auth/callback/') {
  root.render(
    <StrictMode>
      <AuthCallback />
    </StrictMode>
  );
} else {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
