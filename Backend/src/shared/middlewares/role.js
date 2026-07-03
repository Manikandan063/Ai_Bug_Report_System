import { sendResponse } from '../utils/response.js';

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendResponse(res, 403, false, 'Access denied: Insufficient permissions');
    }
    next();
  };
};