import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { AuthProvider } from "./AuthContext";

const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0]?.includes('react-phone-number-input')) return;
  originalWarn(...args);
};
const originalErr = console.error;
console.error = (...args) => {
  if (args[0]?.includes('react-phone-number-input')) return;
  originalErr();
};
createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
  // </React.StrictMode>
);
