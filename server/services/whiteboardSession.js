const { v4: uuidv4 } = require('uuid');
const config = require('../config'); // For potential configuration like session timeouts, max elements, etc.

// In-memory store for active whiteboard sessions.
// In a production environment, this would typically be backed by a persistent store (e.g., Redis for real-time state,
// MongoDB/PostgreSQL for long-term session data) for scalability and fault tolerance.
const activeSessions = new Map(); // Map<sessionId, WhiteboardSession>

/**
 * Represents a single whiteboard session.
 * @typedef {Object} WhiteboardSession
 * @property {string} id - Unique ID of the session.
 * @property {string} name - User-friendly name of the session.