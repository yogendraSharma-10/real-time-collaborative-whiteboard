const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001';
const RECONNECT_INTERVAL = 3000; // Time in milliseconds to wait before attempting a reconnect
const MAX_RECONNECT_ATTEMPTS = 5; // Maximum number of reconnect attempts

/**
 * WebSocketClient class to manage the WebSocket connection for the whiteboard.
 * It handles connection lifecycle, message sending/receiving, and reconnection logic.
 * This class uses a simple event emitter pattern to dispatch messages to subscribed components.
 */
class WebSocketClient {
    constructor() {
        this.ws = null; // The WebSocket instance
        this.listeners = {}; // Stores event listeners for different message types
        this.reconnectAttempts = 0; // Counter for reconnection attempts
        this.isAuthenticated = false; // Flag to indicate if the client is authenticated
        this.sessionToken = null; // Authentication token (e.g., JWT)
        this.sessionId = null; // ID of the specific whiteboard session
        this.userId = null; // ID of the current authenticated user
        this.isExplicitlyDisconnected = false; // Flag to prevent unwanted reconnections
    }

    /**
     * Establishes a WebSocket connection to the server.
     * If a connection already exists or is in progress, it will log a warning and return.
     *
     * @param {string} sessionToken - The authentication token for the user.
     * @param {string} sessionId - The ID of the whiteboard session to join.
     * @param {string} userId - The ID of the current user.
     */
    connect(sessionToken, sessionId, userId) {
        if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
            console.warn('WebSocket is already connected or connecting. Skipping new connection attempt.');
            return;
        }

        this.sessionToken = sessionToken;
        this.sessionId = sessionId;
        this.userId = userId;
        this.isExplicitlyDisconnected = false; // Reset disconnect flag

        // Append token, session ID, and user ID as query parameters for initial handshake/authentication.
        // This is a common pattern for initial authentication and session identification with WebSockets.
        const url = `${WEBSOCKET_URL}?token=${sessionToken}&sessionId=${sessionId}&userId=${userId}`;
        this.ws = new WebSocket(url);

        // Assign event handlers
        this.ws.onopen = this._onOpen.bind(this);
        this.ws.onmessage = this._onMessage.bind(this);
        this.ws.onclose = this._onClose.bind(this);
        this.ws.onerror = this._onError.bind(this);

        console.log(`Attempting to connect to WebSocket: ${url}`);
    }

    /**
     * Handles the WebSocket 'open' event.
     * Resets reconnection attempts and sends an initial 'JOIN_SESSION' message.
     */
    _onOpen() {
        console.log('WebSocket connection established.');
        this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        this.isAuthenticated = true; // Assume authenticated if connection is open with token
        this.emit('connected'); // Notify listeners that the connection is open

        // Send a formal JOIN_SESSION message to confirm and potentially get initial whiteboard state
        this.send({
            type: 'JOIN_SESSION',
            payload: {
                sessionId: this.sessionId,
                userId: this.userId,
                // The token might be re-sent here, or the server might rely solely on the URL param.
                // Sending it again can be a good practice for robustness.
                token: this.sessionToken
            }
