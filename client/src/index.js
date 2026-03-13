import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/main.css'; // Global styles for the application

/**
 * The main entry point for the React client-side application.
 * This file initializes the React root and renders the primary App component
 * into the DOM element specified in public/index.html.
 */

// Get the root DOM element where the React application will be mounted.
// This element is typically defined in public/index.html with id="root".
const rootElement = document.getElementById('root');

// Ensure the root element exists before attempting to render.
if (rootElement) {
  // Create a React root using ReactDOM.createRoot (for React 18+).
  // This enables concurrent features and improved performance.
  const root = ReactDOM.createRoot(rootElement);

  // Render the main App component into the root.
  // React.StrictMode is used to highlight potential problems in an application.
  // It activates additional checks and warnings for its descendants during development.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  // Log an error if the root element is not found, which would prevent the app from starting.
  console.error('Failed to find the root element. Make sure an element with id="root" exists in index.html.');
}