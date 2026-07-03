import fs from 'fs';
import path from 'path';

const files = {
  'src/modules/project/project.model.js': `import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  deploymentUrl: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'ACTIVE',
  }
}, {
  tableName: 'projects',
  timestamps: true,
});

export default Project;`,
  'src/modules/project/projectAssignment.model.js': `import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const ProjectAssignment = sequelize.define('ProjectAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roleInProject: {
    type: DataTypes.ENUM('TESTER', 'DEVELOPER'),
    allowNull: false,
  }
}, {
  tableName: 'project_assignments',
  timestamps: true,
});

export default ProjectAssignment;`,
  'src/modules/project/project.schema.js': `import { z } from 'zod';

export const createProjectSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().optional(),
  deploymentUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

export const updateProjectSchema = z.object({
  projectName: z.string().min(3).optional(),
  description: z.string().optional(),
  deploymentUrl: z.string().url().optional().or(z.literal('')),
  status: z.string().optional(),
});

export const assignUserSchema = z.object({
  userId: z.number().int().positive(),
  roleInProject: z.enum(['TESTER', 'DEVELOPER']),
});`,
  'src/modules/project/project.service.js': `import Project from './project.model.js';
import ProjectAssignment from './projectAssignment.model.js';
import User from '../user/user.model.js';

export const getAllProjects = async () => {
  return await Project.findAll();
};

export const getProjectById = async (id) => {
  const project = await Project.findByPk(id, {
    include: [{
      model: ProjectAssignment,
      as: 'assignments',
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }]
    }]
  });
  if (!project) throw new Error('Project not found');
  return project;
};

export const createProject = async (projectData) => {
  return await Project.create(projectData);
};

export const updateProject = async (id, updateData) => {
  const project = await Project.findByPk(id);
  if (!project) throw new Error('Project not found');
  return await project.update(updateData);
};

export const deleteProject = async (id) => {
  const project = await Project.findByPk(id);
  if (!project) throw new Error('Project not found');
  await project.destroy();
  return { id };
};

export const assignUserToProject = async (projectId, assignmentData) => {
  const project = await Project.findByPk(projectId);
  if (!project) throw new Error('Project not found');

  const user = await User.findByPk(assignmentData.userId);
  if (!user) throw new Error('User not found');
  
  if (user.role !== assignmentData.roleInProject && user.role !== 'SUPER_ADMIN') {
     throw new Error(\`User role (\${user.role}) does not match project role (\${assignmentData.roleInProject})\`);
  }

  const existingAssignment = await ProjectAssignment.findOne({
    where: { projectId, userId: assignmentData.userId }
  });

  if (existingAssignment) {
    return await existingAssignment.update({ roleInProject: assignmentData.roleInProject });
  }

  return await ProjectAssignment.create({
    projectId,
    userId: assignmentData.userId,
    roleInProject: assignmentData.roleInProject
  });
};

export const getAssignedProjects = async (userId) => {
  const assignments = await ProjectAssignment.findAll({
    where: { userId },
    include: [{ model: Project, as: 'project' }]
  });
  return assignments.map(a => a.project);
};`,
  'src/modules/project/project.controller.js': `import * as projectService from './project.service.js';
import { sendResponse } from '../../shared/utils/response.js';
import { createProjectSchema, updateProjectSchema, assignUserSchema } from './project.schema.js';

export const getAllProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    return sendResponse(res, 200, true, 'Projects fetched successfully', projects);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    return sendResponse(res, 200, true, 'Project fetched successfully', project);
  } catch (error) {
    return sendResponse(res, 404, false, error.message);
  }
};

export const createProject = async (req, res) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    const project = await projectService.createProject(validatedData);
    return sendResponse(res, 201, true, 'Project created successfully', project);
  } catch (error) {
    if (error.errors) return sendResponse(res, 400, false, 'Validation Error', error.errors);
    return sendResponse(res, 400, false, error.message);
  }
};

export const updateProject = async (req, res) => {
  try {
    const validatedData = updateProjectSchema.parse(req.body);
    const project = await projectService.updateProject(req.params.id, validatedData);
    return sendResponse(res, 200, true, 'Project updated successfully', project);
  } catch (error) {
    if (error.errors) return sendResponse(res, 400, false, 'Validation Error', error.errors);
    return sendResponse(res, 400, false, error.message);
  }
};

export const deleteProject = async (req, res) => {
  try {
    await projectService.deleteProject(req.params.id);
    return sendResponse(res, 200, true, 'Project deleted successfully');
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};

export const assignUser = async (req, res) => {
  try {
    const validatedData = assignUserSchema.parse(req.body);
    const assignment = await projectService.assignUserToProject(req.params.id, validatedData);
    return sendResponse(res, 200, true, 'User assigned successfully', assignment);
  } catch (error) {
    if (error.errors) return sendResponse(res, 400, false, 'Validation Error', error.errors);
    return sendResponse(res, 400, false, error.message);
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const projects = await projectService.getAssignedProjects(req.user.id);
    return sendResponse(res, 200, true, 'Assigned projects fetched successfully', projects);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};`,
  'src/modules/project/project.routes.js': `import { Router } from 'express';
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

export default router;`,
  'src/models/initModels.js': `import sequelize from '../config/db.js';
import User from '../modules/user/user.model.js';
import Auth from '../modules/auth/auth.model.js';
import Project from '../modules/project/project.model.js';
import ProjectAssignment from '../modules/project/projectAssignment.model.js';

// Associations
User.hasMany(ProjectAssignment, { foreignKey: 'userId', as: 'assignments' });
ProjectAssignment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(ProjectAssignment, { foreignKey: 'projectId', as: 'assignments' });
ProjectAssignment.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

export const initModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

export { User, Auth, Project, ProjectAssignment };`
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
