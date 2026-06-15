import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css'; // Import global styles

/**
 * client/src/index.js
 *
 * This is the entry point for the React client-side application.
 * It initializes the React application, renders the root component (`App`),
 * and sets up global styling.
 *
 * Uses React 18's `createRoot` API for concurrent mode features.
 */

// Find the root DOM element where the React application will be mounted.
// This element is typically defined in public/index.html with an id of 'root'.
const rootElement = document.getElementById('root');

// Ensure the root element exists before attempting to render.
if (rootElement) {
  // Create a React root using ReactDOM.createRoot for React 18+.
  // This enables concurrent features and improved performance.
  const root = ReactDOM.createRoot(rootElement);

  // Render the main application component (`App`) inside React.StrictMode.
  // React.StrictMode is a tool for highlighting potential problems in an application.
  // It activates additional checks and warnings for its descendants during development.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Log an error if the root element is not found, which would prevent the app from starting.
  console.error('Failed to find the root element. Make sure an element with id "root" exists in index.html.');
}