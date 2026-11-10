import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/seasonalEffect.css';
import './index.css';
import { App } from './App';
import { applyStoredTheme } from './hooks/useTheme';

applyStoredTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
