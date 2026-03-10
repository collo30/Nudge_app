import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/patrick-hand';
import '@fontsource/playfair-display';
import '@fontsource/caveat';
import '@fontsource/indie-flower';
import '@fontsource/inter';
import { App as CapacitorApp } from '@capacitor/app';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);