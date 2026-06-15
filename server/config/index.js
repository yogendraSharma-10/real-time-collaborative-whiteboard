require('dotenv').config();

/**
 * @file server/config/index.js
 * @description Centralized configuration management for the Real-time Collaborative Whiteboard server.
 *              Loads environment variables and provides default values for various settings.
 *              Includes configurations relevant to an interconnected microservice architecture.
 */

const config = {
  /**
   * Application Environment
   * 'development', 'production', 'test'
   */
  NODE_ENV: process.env.NODE_ENV || 'development',

  /**
   * Server Port Configuration
   * The port on which the main HTTP server (and potentially WebSocket server) will listen.
   */
  PORT: parseInt(process.env.PORT || '3001', 10),

  /**
   * WebSocket Server Port (Optional, if separate from HTTP)
   * If the WebSocket server runs on a different port than the main HTTP server.
   * For this project, we'll assume it runs on the same port as the HTTP server for simplicity
   * unless explicitly specified otherwise.
   */
  WS_PORT: parseInt(process.env.WS_PORT || process.env.PORT || '3001', 10),

  /**
   * CORS (Cross-Origin Resource Sharing) Configuration
   * Specifies allowed origins for client requests.
   * In a production environment, this should be set to your client's domain.
   * Multiple origins can be separated by commas.
   */
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  /**
   * JWT (JSON Web Token) Configuration
   * Secret key used for signing and verifying JWTs.
   * This should be a strong, randomly generated string and kept secret.
   * In a real microservice setup, this might be shared with an authentication service
   * or tokens might be validated via an introspection endpoint.
   */
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkeyforwhiteboard',

  /**
   * Whiteboard Session Management Configuration
   * Settings for cleaning up inactive whiteboard sessions to free up resources.
   */
  SESSION_CLEANUP_INTERVAL_MS: parseInt(process.env.SESSION_CLEANUP_INTERVAL_MS || '600000', 10), // 10 minutes
  SESSION_INACTIVITY_TIMEOUT_MS: parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MS || '3600000', 10), // 1 hour

  /**
   * Microservice Interconnection Configuration
   * URLs for other services within the larger system.
   * These are included to demonstrate awareness of the interconnected architecture,
   * even if not directly consumed by the whiteboard service itself in every case.
   */
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL || 'http://localhost:3002/api/auth', // Example Auth Service URL
  TASK_SERVICE_URL: process.env.TASK_SERVICE_URL || 'http://localhost:3003/api/tasks', // Example Collaborative Task Management System URL
  SOCIAL_SERVICE_URL: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3004/api/social', // Example Micro Social Media Dashboard URL
  ECOMMERCE_SERVICE_URL: process.env.ECOMMERCE_SERVICE_URL || 'http://localhost:3005/api/ecommerce', // Example Multi-vendor E-commerce Marketplace URL

  /**
   * Logging Configuration (Placeholder)
   * In a real application, you might integrate a logging library like Winston or Pino here.
   */
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
};

module.exports = config;