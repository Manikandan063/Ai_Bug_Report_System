import { Router } from 'express';
import { downloadExcelReport } from './report.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.get('/download', downloadExcelReport);

export default router;