import { Router } from 'express';
import { 
  createBugReport, getBugReports, getBugReportById, 
  updateBugReport, deleteBugReport 
} from './bugReport.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { authorizeRole } from '../../shared/middlewares/role.js';

const router = Router();

router.use(authenticate);

router.get('/', getBugReports);
router.get('/:id', getBugReportById);

// Tester only routes
router.post('/', authorizeRole('TESTER'), createBugReport);

// Developer and Super Admin can update
router.put('/:id', authorizeRole('DEVELOPER', 'SUPER_ADMIN'), updateBugReport);

// Only Super Admin can delete
router.delete('/:id', authorizeRole('SUPER_ADMIN'), deleteBugReport);

export default router;