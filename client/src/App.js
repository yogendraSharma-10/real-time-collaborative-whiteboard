import React, { useState, useEffect, useCallback } from 'react';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import { connectWebSocket, disconnectWebSocket, sendWebSocketMessage, onWebSocketMessage } from './api/websocket';
import '../src/styles/main.css'; // Global styles

/**
 * App Component
 *
 * This is the main application component for the Real-time Collaborative Whiteboard.
 * It manages user authentication, WebSocket connection, drawing state, and renders
 * the WhiteboardCanvas component along with UI controls.
 *
 * It simulates user authentication and session management, and integrates with
 * the WebSocket API for real-time collaboration.
 */
function App() {
  // --- State Management ---
  const [userId, setUserId] = useState(null); // Authenticated user ID
  const [sessionId, setSessionId] = useState(null); // Current whiteboard session ID
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Authentication status
  const [drawingOperations, setDrawingOperations] = useState([]); // Array of all drawing operations
  const [currentTool, setCurrentTool] = useState('pen'); // Current drawing tool (pen, eraser)
  const [currentColor, setCurrentColor] = useState('#000000'); // Current drawing color
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(3); // Current stroke width
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial setup
  const [error, setError] = useState(null); // Error message

  // --- Authentication Simulation (In a real app, this would be handled by a dedicated auth service) ---
  useEffect(() => {
    // Simulate fetching user data from a shared authentication service
    // In a microservice architecture, this might involve an API call to an Auth service
    // or reading a JWT from local storage/cookies.
    const authenticateUser = async () => {
      try {
        setIsLoading(true);
        // Mock authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For demonstration, generate a random user ID and a fixed session ID.
        // In a real scenario, sessionId might come from URL params, a user's dashboard,
        // or a selection from a list of available whiteboards (e.g., linked from a task in the
        // Collaborative Task Management System).
        const mockUserId = `user-${Math.random().toString(36).substring(2, 9)}`;
        const mockSessionId = 'whiteboard-session-123'; // Example: Could be from URL or user selection

        setUserId(mockUserId);
        setSessionId(mockSessionId);
        setIsAuthenticated(true);
        console.log(`Authenticated as User: ${mockUserId}, Session: ${mockSessionId}`);
      } catch (err) {
        console.error("Authentication failed:", err);
        setError("Failed to authenticate. Please try again.");
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    authenticateUser();
  }, []);

  // --- WebSocket Connection and Message Handling ---
  useEffect(() => {
    if (!isAuthenticated || !userId || !sessionId) {
      // Don't connect until authenticated and session ID is available
      return;
    }

    console.log(`Attempting to connect WebSocket for user ${userId} in session ${sessionId}...`);
    setIsLoading(true);
    setError(null);

    // Connect to WebSocket server, passing user and session info
    connectWebSocket(userId, sessionId)
      .then(() => {
        console.log('WebSocket connected successfully.');
        setIsLoading(false);

        // Set up listener for incoming messages
        onWebSocketMessage(handleWebSocketMessage);

        // Request initial state/history for the session
        sendWebSocketMessage({ type: 'request_history', payload: { sessionId } });
      })
      .catch((err) => {
        console.error('WebSocket connection failed:', err);
        setError('Failed to connect to the whiteboard server. Please check your network.');
        setIsLoading(false);
      });

    // Clean up WebSocket connection on component unmount or dependency change
    return () => {
      console.log('Disconnecting WebSocket...');
      disconnectWebSocket();
    };
  }, [isAuthenticated, userId, sessionId]); // Reconnect if auth or session changes

  /**
   * Handles incoming WebSocket messages from the server.
   * This function is memoized using useCallback to prevent unnecessary re-renders
   * and ensure stable reference for `onWebSocketMessage`.
   * @param {object} message - The message received from the WebSocket server.
   */
  const handleWebSocketMessage = useCallback((message) => {
    console.log('Received WebSocket message:', message);
    switch (message.type) {
      case 'drawing_operation':
        // Add new drawing operation from another user
        setDrawingOperations(prevOperations => [...prevOperations, message.payload]);
        break;
      case 'clear_canvas':
        // Clear canvas based on server command
        setDrawingOperations([]);
        break;
      case 'session_history':
        // Initialize canvas with historical data
        setDrawingOperations(message.payload.operations || []);
        console.log('Loaded session history:', message.payload.operations.length, 'operations');
        break;
      case 'error':
        setError(message.payload.message || 'An unknown error occurred on the server.');
        console.error('Server error:', message.payload);
        break;
      default:
        console.warn('Unknown WebSocket message type:', message.type);
    }
  }, []); // No dependencies, as it uses functional updates for state

  /**
   * Handles a new drawing operation initiated by the current user.
   * Sends the operation to the WebSocket server for broadcast to other users.
   * @param {object} operation - The drawing operation data (e.g., line coordinates, tool, color).
   */
  const handleDrawingOperation = useCallback((operation) => {
    if (!userId || !sessionId) {
      console.warn('Cannot send drawing operation: User or session ID not available.');
      return;
    }
    // Add the operation locally immediately for responsiveness
    setDrawingOperations(prevOperations => [...prevOperations, operation]);

    // Send the operation to the server
    sendWebSocketMessage({
      type: 'drawing_operation',
      payload: {
        ...operation,
        userId, // Attach current user ID to the operation
        sessionId, // Attach current session ID
      },
    });
  }, [userId, sessionId]);

  /**
   * Clears all drawing operations from the canvas for the current user
   * and sends a 'clear_canvas' command to the server.
   */
  const handleClearCanvas = useCallback(() => {
    if (!userId || !sessionId) {
      console.warn('Cannot clear canvas: User or session ID not available.');
      return;
    }
    setDrawingOperations([]); // Clear locally
    sendWebSocketMessage({
      type: 'clear_canvas',
      payload: { userId, sessionId },
    });
  }, [userId, sessionId]);

  // --- Render Logic ---
  if (isLoading) {
    return (
      <div className="app-container loading-screen">
        <div className="spinner"></div>
        <p>Connecting to whiteboard session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container error-screen">
        <h1>Error</h1>
        <p>{error}</p>
        <p>Please refresh the page or contact support.</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="app-container auth-required-screen">
        <h1>Authentication Required</h1>
        <p>You must be logged in to access the whiteboard.</p>
        {/* In a real app, this would redirect to a login page, possibly from the Micro Social Media Dashboard or Collaborative Task Management System */}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Real-time Whiteboard: Session {sessionId}</h1>
        <p className="user-info">Logged in as: {userId}</p>
        <div className="toolbar">
          <label htmlFor="tool-select">Tool:</label>
          <select
            id="tool-select"
            value={currentTool}
            onChange={(e) => setCurrentTool(e.target.value)}
            className="toolbar-item"
          >
            <option value="pen">Pen</option>
            <option value="eraser">Eraser</option>
          </select>

          <label htmlFor="color-picker">Color:</label>
          <input
            id="color-picker"
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="toolbar-item"
          />

          <label htmlFor="stroke-width">Stroke Width:</label>
          <input
            id="stroke-width"
            type="range"
            min="1"
            max="20"
            value={currentStrokeWidth}
            onChange={(e) => setCurrentStrokeWidth(Number(e.target.value))}
            className="toolbar-item"
          />
          <span>{currentStrokeWidth}px</span>

          <button onClick={handleClearCanvas} className="toolbar-item clear-button">
            Clear Canvas
          </button>
        </div>
      </header>

      <main className="whiteboard-main">
        <WhiteboardCanvas
          drawingOperations={drawingOperations}
          currentTool={currentTool}
          currentColor={currentColor}
          currentStrokeWidth={currentStrokeWidth}
          onNewDrawingOperation={handleDrawingOperation}
        />
      </main>

      <footer className="app-footer">
        <p>&copy; 2023 Collaborative Whiteboard. Part of the interconnected system.</p>
      </footer>
    </div>
  );
}

export default App;