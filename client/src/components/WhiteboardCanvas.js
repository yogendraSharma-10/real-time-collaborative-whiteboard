import React, { useRef, useEffect, useState, useCallback } from 'react';
import { socket } from '../api/websocket'; // Import the WebSocket client instance
import '../styles/main.css'; // Assuming some basic styling for controls

/**
 * WhiteboardCanvas Component
 * Renders an interactive canvas for real-time collaborative drawing.
 * Users can draw with different tools, colors, and line widths.
 * Drawing actions are synchronized across all participants in a session via WebSockets.
 *
 * Props:
 * - sessionId: The ID of the current whiteboard session.
 * - userId: The ID of the current authenticated user (e.g., from Auth Service).
 * - username: The username of the current authenticated user.
 */
const WhiteboardCanvas = ({ sessionId, userId, username }) => {
  // Refs for canvas element and its 2D rendering context
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // State for drawing parameters
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null); // Stores the last point drawn {x, y}
  const [tool,