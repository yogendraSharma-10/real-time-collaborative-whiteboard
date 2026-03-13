import React, { useState, useEffect, useRef, useCallback } from 'react';
import WhiteboardCanvas from './components/WhiteboardCanvas';
import { connectWebSocket, disconnectWebSocket, sendMessage, onMessage } from './services/websocketClient';
import '../src/styles/main.css'; // Global styles

/**
 * App Component
 *
 * This is the main application component for the Real-time Collaborative Whiteboard.
 * It manages user authentication (simulated), session joining, and the WebSocket connection lifecycle.
 * It renders the WhiteboardCanvas component once a session is successfully joined.
 */
function App() {
  // State for user identification and session management
  // User ID is generated once or retrieved from local storage to persist across refreshes.
  // In a production environment, this would typically come from an authentication service.
  const [userId, setUserId] = useState(localStorage.getItem('whiteboardUserId') || `user_${Math.random().toString(36).substr(2, 9)}`);
  const [username, setUsername] = useState(localStorage.getItem('whiteboardUsername') || `Guest_${Math.random().toString(36).substr(2, 5)}`);
  // Session ID for the whiteboard, can be entered by the user.
  const [sessionId, setSessionId] = useState(localStorage.getItem('whiteboardSessionId') || 'default-session');
  // Tracks the session ID the user is currently connected to. Null if not connected.
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // WebSocket connection status
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [error, setError] = useState(null);

  // Ref to hold the WebSocket instance or a reference managed by the service.
  // This prevents re-instantiation on re-renders and allows access across effects.
  const wsRef = useRef(null);

  /**
   * Effect to persist user and session info to localStorage.
   * This ensures that user ID, username, and the last used session ID are remembered
   * across browser sessions or refreshes.
   */
  useEffect(() => {
    localStorage.setItem('whiteboardUserId', userId);
    localStorage.setItem('whiteboardUsername', username);
    localStorage.setItem('whiteboardSessionId', sessionId);
  }, [userId, username, sessionId]);

  /**
   * Callback function to handle joining a whiteboard session.
   * It initiates the WebSocket connection via the `websocketClient` service.
   *
   * @returns {Promise<void>}
   */
  const joinSession = useCallback(async () => {
    // If already in a session, disconnect first to ensure a clean re-connection.
    if (currentSessionId) {
      leaveSession();
    }

    setConnectionStatus('Connecting...');
    setError(null);

    try {
      // Attempt to connect using the websocketClient service.
      // The service handles the actual WebSocket object and its lifecycle.
      // We pass callbacks for connection events (open, error, close).
      wsRef.current = await connectWebSocket(
        userId,
        username,
        sessionId,
        () => { // onOpen callback
          setIsConnected(true);
          setCurrentSessionId(sessionId);
          setConnectionStatus(`Connected to session: ${sessionId}`);
          setError(null);
        },
        (err) => { // onError callback
          console.error('WebSocket connection error:', err);
          setIsConnected(false);
          setCurrentSessionId(null);
          setConnectionStatus('Disconnected');
          setError(`Connection failed: ${err.message || 'Unknown error'}`);
        },
        () => { // onClose callback
          console.log('WebSocket connection closed.');
          setIsConnected(false);
          setCurrentSessionId(null);
          setConnectionStatus('Disconnected');
