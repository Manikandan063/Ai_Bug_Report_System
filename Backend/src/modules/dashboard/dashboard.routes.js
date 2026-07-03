import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', getDashboardStats);

export default router;