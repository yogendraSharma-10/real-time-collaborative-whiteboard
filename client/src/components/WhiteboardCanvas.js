```javascript
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  connectWebSocket,
  sendDrawEvent,
  onDrawEvent,
  offDrawEvent,
  sendClearEvent,
  onClearEvent,
  offClearEvent,
  sendUndoEvent, // Assuming an undo event might be added later
  onUndoEvent,
  offUndoEvent
} from '../services/websocketClient';
import '../styles/main.css'; // Import global styles for basic layout and canvas styling

/**
 * @typedef {object} Point
 * @property {number} x - The X coordinate.
 * @property {number} y - The Y coordinate.
 */

/**
 * @typedef {object}