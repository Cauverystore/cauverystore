// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

import ErrorBoundary from './components/ErrorBoundary';
import ToasterProvider from './components/ToasterProvider';
import { LoadingProvider } from './context/LoadingContext';
import { DarkModeProvider } from './store/darkModeStore';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <DarkModeProvider>
        <LoadingProvider>
          <ToasterProvider />
          <App />
        </LoadingProvider>
      </DarkModeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
