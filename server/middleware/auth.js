const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * @typedef {object} AuthenticatedRequest
 * @property {object} user - The decoded user payload from the JWT.
 * @property {string} user.id - The user's unique identifier.
 * @property {string} [user.username] - The user's username (optional).
 * @property {string} [user.email] - The user's email (optional).
 * @property {string[]} [user.roles] - Array of user roles (optional).
 * @property {string} [user.serviceOrigin] - Identifier for the service that issued the token (e.g., 'social-media', 'e-commerce').
 */

/**
 * Middleware to authenticate requests using JWT tokens.
 * It expects a JWT in the 'Authorization' header in the format 'Bearer <token>'.
 * If authentication is successful, it decodes the user payload and attaches it to `req.user`.
 *
 * This middleware is designed to work across the interconnected microservices
 * (e.g., Social Media Dashboard, E-commerce Marketplace) by verifying tokens
 * issued by a central authentication service or a shared secret.
 *
 * @param {import('express').Request & AuthenticatedRequest} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @param {import('express').NextFunction} next - The Express next middleware function.
 */
const authenticateToken = (req, res, next) => {
  // 1. Extract the Authorization header
  const authHeader = req.headers['authorization'];

  // 2. Check if the header exists and is in the correct 'Bearer <token>' format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Authentication failed: No token provided or malformed header.');
    return res.status(401).json({ message: 'Authentication required: No token provided or invalid format.' });
  }

  // 3. Extract the token part
  const token = authHeader.split(' ')[1];

  // 4. Verify the token
  try {
    // Use the JWT secret from the configuration. This secret should be consistent
    // across all services that need to verify tokens issued by the central auth.
    const decoded = jwt.verify(token, config.jwtSecret);

    // Attach the decoded user payload to the request object.
    // This makes user information available to subsequent middleware and route handlers.
    // The payload typically includes `id`, and potentially `username`, `email`, `roles`, etc.
    req.user = decoded;

    // Log successful authentication (optional, for debugging/monitoring)
    console.log(`User authenticated: ${req.user.id}`);

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle different types of JWT errors
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Authentication failed: Token expired.');
      return res.status(401).json({ message: 'Authentication failed: Token expired.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn(`Authentication failed: Invalid token. Error: ${error.message}`);
      return res.status(403).json({ message: 'Authentication failed: Invalid token.' });
    }
    // Catch any other unexpected errors during token verification
    console.error(`Authentication failed: An unexpected error occurred. Error: ${error.message}`);
    return res.status(500).json({ message: 'Authentication failed: Internal server error.' });
  }
};

/**
 * Middleware to check if the authenticated user has specific roles.
 * This can be chained after `authenticateToken`.
 *
 * @param {string[]} allowedRoles - An array of roles that are permitted to access the resource.
 * @returns {import('express').RequestHandler} An Express middleware function.
 */
const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    // Ensure req.user exists (meaning authenticateToken ran successfully)
    if (!req.user || !req.user.roles) {
      console.warn(`Authorization failed for user ${req.user?.id}: User roles not found or not authenticated.`);
      return res.status(403).json({ message: 'Access denied: User not authorized or roles not defined.' });
    }

    // Check if the user has any of the allowed roles
    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));

    if (hasPermission) {
      console.log(`User ${req.user.id} authorized with roles: ${req.user.roles.join(', ')}`);
      next();
    } else {
      console.warn(`Authorization failed for user ${req.user.id}: Required roles [${allowedRoles.join(', ')}] not met. User roles: [${req.user.roles.join(', ')}]`);
      return res.status(403).json({ message: 'Access denied: Insufficient permissions.' });
    }
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};