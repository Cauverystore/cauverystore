// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./index.css";


import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

import { LoadingProvider } from "@/context/LoadingContext";
import { DarkModeProvider } from "@/store/darkModeStore";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      {/* BrowserRouter should be at the root to enable routing */}
      <BrowserRouter>
        {/* Dark mode context provider */}
        <DarkModeProvider>
          {/* Loading context provider (e.g., global spinner) */}
          <LoadingProvider>
            {/* Main app component */}
            <App />
          </LoadingProvider>
        </DarkModeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
