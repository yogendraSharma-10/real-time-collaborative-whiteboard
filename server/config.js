require('dotenv').config();

/**
 * @file server/config.js
 * @description Centralized configuration management for the Real-time Collaborative Whiteboard server.
 *              Loads environment variables and provides structured access to application settings.
 */

const config = {
  /**
   * Application Environment
   * @type {string}
   * @default 'development'
   */
  NODE_ENV: process.env.NODE_ENV || 'development',

  /**
   * Server Port
   * The port on which the HTTP server will listen.
   * @type {number}
   * @default 3001
   */
  PORT: parseInt(process.env.PORT || '3001', 10),

  /**
   * WebSocket Server Port
   * The port on which the WebSocket server will listen.
   * Often the same as the HTTP server port if using a single server instance.
   * @type {number}
   * @default 3001
   */
  WS_PORT: parseInt(process.env.WS_PORT || process.env.PORT || '3001', 10),

  /**
   * Database Connection URL
   * MongoDB connection string.
   * @type {string}
   * @default 'mongodb://localhost:27017/whiteboard_db'
   */
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/whiteboard_db',

  /**
   * JWT Secret Key
   * Secret key used for signing and verifying JSON Web Tokens for authentication.
   * IMPORTANT: Use a strong, randomly generated secret in production.
   * @type {string}
   */
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkeyforwhiteboard',

  /**
   * CORS Origin
   * The origin(s) allowed to make cross-origin requests to this server.
   * Can be a comma-separated string for multiple origins.
   * @type {string|string[]}
   * @default 'http://localhost:3000'
   */
  CORS_ORIGIN: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],

  /**
   * Service Name
   * Identifier for this service, useful for logging and monitoring in a microservices architecture.
   * @type {string}
   * @default 'whiteboard-service'
   */
  SERVICE_NAME: process.env.SERVICE_NAME || 'whiteboard-service',

  /**
   * Microservice API URLs (Cross-Project Context)
   * URLs for interacting with other services in the ecosystem.
   */
  MICROSERVICES: {
    /**
     * URL for the Collaborative Task Management System API.
     * @type {string}
     * @default 'http://localhost:3002/api/tasks'
     */
    TASK_MANAGER_API_URL: process.env.TASK_MANAGER_API_URL || 'http://localhost:3002/api/tasks',

    /**
     * URL for the Micro Social Media Dashboard API.
     * @type {string}
     * @default 'http://localhost:3003/api/social'
     */
    SOCIAL_MEDIA_API_URL: process.env.SOCIAL_MEDIA_API_URL || 'http://localhost:3003/api/social',

    /**
     * URL for the Multi-vendor E-commerce Marketplace API.
     * @type {string}
     * @default 'http://localhost:3004/api/ecommerce'
     */
    ECOMMERCE_API_URL: process.env.ECOMMERCE_API_URL || 'http://localhost:3004/api/ecommerce',
  },

  /**
   * Session Configuration
   * Settings related to whiteboard session management.
   */
  SESSION: {
    /**
     * Maximum number of concurrent users allowed in a single whiteboard session.
     * @type {number}
     * @default 20
     */
    MAX_USERS_PER_SESSION: parseInt(process.env.MAX_USERS_PER_SESSION || '20', 10),

    /**
     * Time in minutes after which an inactive session might be cleaned up (e.g., if no users).
     * @type {number}
     * @default 60
     */
    INACTIVE_SESSION_TIMEOUT_MINUTES: parseInt(process.env.INACTIVE_SESSION_TIMEOUT_MINUTES || '60', 10),
  },
};

// Validate essential configuration variables in production
if (config.NODE_ENV === 'production') {
  if (!config.JWT_SECRET || config.JWT_SECRET === 'supersecretjwtkeyforwhiteboard') {
    console.warn('WARNING: JWT_SECRET is not set or is using a default value. This is insecure in production!');
  }
  if (!config.DATABASE_URL || config.DATABASE_URL === 'mongodb://localhost:27017/whiteboard_db') {
    console.warn('WARNING: DATABASE_URL is not set or is using a default local value. Ensure it points to a production database.');
  }
  if (!process.env.CORS_ORIGIN) {
    console.warn('WARNING: CORS_ORIGIN is not explicitly set in production. Defaulting to localhost may not be desired.');
  }
}

module.exports = config;