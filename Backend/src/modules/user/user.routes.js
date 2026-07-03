import { Router } from 'express';
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

export default router;