import { Router } from 'express';
import { generateReport } from './ai.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { authorizeRole } from '../../shared/middlewares/role.js';

const router = Router();

router.use(authenticate);
router.post('/generate-bug-report', authorizeRole('TESTER'), generateReport);

export default router;