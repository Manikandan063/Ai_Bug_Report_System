import { Router } from 'express';
import { 
  getAllProjects, getProjectById, createProject, 
  updateProject, deleteProject, assignUser, getMyProjects 
} from './project.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { authorizeRole } from '../../shared/middlewares/role.js';

const router = Router();

router.use(authenticate);

// Routes for TESTER and DEVELOPER to get their assigned projects
router.get('/my-projects', getMyProjects);

// Super Admin only routes
router.use(authorizeRole('SUPER_ADMIN'));

router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/assign', assignUser);

export default router;