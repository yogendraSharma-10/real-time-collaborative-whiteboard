/**
 * @file server/src/config/constants.js
 * @description Global constants and configuration settings for the Real-time Collaborative Whiteboard server.
 *              Leverages environment variables for sensitive data and flexible deployment.
 */

require('dotenv').config(); // Load environment variables from .env file

/**
 * Server Configuration Constants
 * These define the operational parameters for the Node.js server.
 */
const SERVER_CONFIG = {
  PORT: process.env.PORT || 5000, // Port the server listens on
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000', // URL of the React client for CORS
  WEBSOCKET_PATH: '/websocket', // Path for WebSocket connections
  CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'], // Allowed origins for CORS
  NODE_ENV: process.env.NODE_ENV || 'development', // Current environment (e.g., 'development', 'production')
};

/**
 * Authentication and Authorization Constants
 * These are crucial for securing API endpoints and WebSocket connections.
 * In a microservice architecture, authentication might be delegated to a dedicated service.
 */
const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkeyforwhiteboard', // Secret key for signing JWTs
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h', // JWT token expiration time
  // URL for an external Authentication Service (e.g., part of a larger user management system)
  // This service would handle user login, registration, and token validation.
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:4001/api/auth',
  // API endpoint for validating a JWT token with the external auth service
  AUTH_VALIDATE_TOKEN_ENDPOINT: '/validate-token',
};

/**
 * WebSocket Event Names
 * Standardized event names for communication between client and server.
 * This ensures consistency and reduces potential errors.
 */
const WS_EVENTS = {
  // Connection lifecycle
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  // Session management
  JOIN_SESSION: 'joinSession',      // Client requests to join a specific session
  LEAVE_SESSION: 'leaveSession',    // Client requests to leave a session
  SESSION_STATE_SYNC: 'sessionStateSync', // Server sends full session state to a new joiner
  USER_JOINED: 'userJoined',        // Server notifies others that a user joined
  USER_LEFT: 'userLeft',            // Server notifies others that a user left
  ACTIVE_USERS_UPDATE: 'activeUsersUpdate', // Server sends updated list of active users in a session

  // Drawing and interaction
  DRAWING_UPDATE: 'drawingUpdate',  // Client sends new drawing data (e.g., line segment)
  CLEAR_CANVAS: 'clearCanvas',      // Client requests to clear the entire canvas
  CURSOR_UPDATE: 'cursorUpdate',    // Client sends real-time cursor position
  UNDO_ACTION: 'undoAction',        // Client requests to undo the last action
  REDO_ACTION: 'redoAction',        // Client requests to redo the last undone action

  // Error handling
  ERROR: 'error',                   // Generic error message from server to client
  AUTH_ERROR: 'authError',          // Authentication-specific error
};

/**
 * Whiteboard Session and Drawing Defaults
 * Default values for new sessions or drawing tools.
 */
const WHITEBOARD_DEFAULTS = {
  MAX_SESSION_USERS: 20, // Maximum number of concurrent users allowed in a single whiteboard session
  SESSION_ID_LENGTH: 8,  // Length of randomly generated session IDs
  DEFAULT_BRUSH_SIZE: 5,
  DEFAULT_BRUSH_COLOR: '#000000',
  DEFAULT_BACKGROUND_COLOR: '#FFFFFF',
};

/**
 * Cross-Service Integration URLs
 * URLs for other services within the larger interconnected system.
 * These are included for context and potential future integration points.
 */
const MICROSERVICE_URLS = {
  TASK_MANAGEMENT_SERVICE_URL: process.env.TASK_MANAGEMENT_SERVICE_URL || 'http://localhost:4002',
  SOCIAL_MEDIA_SERVICE_URL: process.env.SOCIAL_MEDIA_SERVICE_URL || 'http://localhost:4003',
  ECOMMERCE_SERVICE_URL: process.env.ECOMMERCE_SERVICE_URL || 'http://localhost:4004',
};

module.exports = {
  SERVER_CONFIG,
  AUTH_CONFIG,
  WS_EVENTS,
  WHITEBOARD_DEFAULTS,
  MICROSERVICE_URLS,
};