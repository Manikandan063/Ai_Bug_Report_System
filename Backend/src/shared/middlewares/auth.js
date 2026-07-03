import { verifyToken } from '../utils/jwt.js';
import { sendResponse } from '../utils/response.js';
import User from '../../modules/user/user.model.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (token && token.startsWith('Bearer ')) {
      token = token.split(' ')[1];
    }

    if (!token) {
      return sendResponse(res, 401, false, 'Authentication token missing');
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.status) {
      return sendResponse(res, 401, false, 'User not found or account disabled');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid or expired token');
  }
};