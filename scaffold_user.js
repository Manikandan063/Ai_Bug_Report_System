import fs from 'fs';
import path from 'path';

const files = {
  'src/shared/middlewares/auth.js': `import { verifyToken } from '../utils/jwt.js';
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
};`,
  'src/shared/middlewares/role.js': `import { sendResponse } from '../utils/response.js';

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return sendResponse(res, 403, false, 'Access denied: Insufficient permissions');
    }
    next();
  };
};`,
  'src/modules/user/user.schema.js': `import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'TESTER', 'DEVELOPER']),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['SUPER_ADMIN', 'TESTER', 'DEVELOPER']).optional(),
  status: z.boolean().optional(),
});`,
  'src/modules/user/user.service.js': `import User from './user.model.js';
import { hashPassword } from '../../shared/utils/bcrypt.js';

export const getAllUsers = async () => {
  return await User.findAll({ attributes: { exclude: ['password'] } });
};

export const getUserById = async (id) => {
  const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
  if (!user) throw new Error('User not found');
  return user;
};

export const createUser = async (userData) => {
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) throw new Error('User already exists');

  const hashedPassword = await hashPassword(userData.password);
  const newUser = await User.create({ ...userData, password: hashedPassword });
  
  const userWithoutPassword = newUser.toJSON();
  delete userWithoutPassword.password;
  return userWithoutPassword;
};

export const updateUser = async (id, updateData) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');

  if (updateData.email && updateData.email !== user.email) {
    const existing = await User.findOne({ where: { email: updateData.email } });
    if (existing) throw new Error('Email is already taken');
  }

  await user.update(updateData);
  const updatedUser = user.toJSON();
  delete updatedUser.password;
  return updatedUser;
};

export const deleteUser = async (id) => {
  const user = await User.findByPk(id);
  if (!user) throw new Error('User not found');
  await user.destroy();
  return { id };
};`,
  'src/modules/user/user.controller.js': `import * as userService from './user.service.js';
import { sendResponse } from '../../shared/utils/response.js';
import { createUserSchema, updateUserSchema } from './user.schema.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    return sendResponse(res, 200, true, 'Users fetched successfully', users);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return sendResponse(res, 200, true, 'User fetched successfully', user);
  } catch (error) {
    return sendResponse(res, 404, false, error.message);
  }
};

export const createUser = async (req, res) => {
  try {
    const validatedData = createUserSchema.parse(req.body);
    const user = await userService.createUser(validatedData);
    return sendResponse(res, 201, true, 'User created successfully', user);
  } catch (error) {
    if (error.errors) {
      return sendResponse(res, 400, false, 'Validation Error', error.errors);
    }
    return sendResponse(res, 400, false, error.message);
  }
};

export const updateUser = async (req, res) => {
  try {
    const validatedData = updateUserSchema.parse(req.body);
    const user = await userService.updateUser(req.params.id, validatedData);
    return sendResponse(res, 200, true, 'User updated successfully', user);
  } catch (error) {
    if (error.errors) {
      return sendResponse(res, 400, false, 'Validation Error', error.errors);
    }
    return sendResponse(res, 400, false, error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    await userService.deleteUser(req.params.id);
    return sendResponse(res, 200, true, 'User deleted successfully');
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};`,
  'src/modules/user/user.routes.js': `import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from './user.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { authorizeRole } from '../../shared/middlewares/role.js';

const router = Router();

// Protect all user routes
router.use(authenticate);

// Super Admin only routes
router.use(authorizeRole('SUPER_ADMIN'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join('c:\\\\Ai_Bug_Report', filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log('Created ' + fullPath);
}
