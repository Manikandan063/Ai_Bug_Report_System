import fs from 'fs';
import path from 'path';

const files = {
  'src/modules/dashboard/dashboard.service.js': `import User from '../user/user.model.js';
import Project from '../project/project.model.js';
import BugReport from '../bugReport/bugReport.model.js';
import ProjectAssignment from '../project/projectAssignment.model.js';

export const getSuperAdminDashboard = async () => {
  const totalUsers = await User.count();
  const totalProjects = await Project.count();
  const totalBugs = await BugReport.count();
  const openBugs = await BugReport.count({ where: { status: 'Open' } });
  
  return { totalUsers, totalProjects, totalBugs, openBugs };
};

export const getTesterDashboard = async (userId) => {
  const assignments = await ProjectAssignment.findAll({ where: { userId } });
  const projectIds = assignments.map(a => a.projectId);

  const assignedProjects = projectIds.length;
  const reportedBugs = await BugReport.count({ where: { testerId: userId } });

  return { assignedProjects, reportedBugs };
};

export const getDeveloperDashboard = async (userId) => {
  const assignments = await ProjectAssignment.findAll({ where: { userId } });
  const projectIds = assignments.map(a => a.projectId);

  const assignedProjects = projectIds.length;
  const totalBugsToFix = await BugReport.count({ where: { projectId: projectIds, status: 'Open' } });
  const fixedBugs = await BugReport.count({ where: { projectId: projectIds, status: 'Fixed' } });

  return { assignedProjects, totalBugsToFix, fixedBugs };
};`,
  
  'src/modules/dashboard/dashboard.controller.js': `import * as dashboardService from './dashboard.service.js';
import { sendResponse } from '../../shared/utils/response.js';

export const getDashboardStats = async (req, res) => {
  try {
    const { role, id } = req.user;
    let stats;
    
    if (role === 'SUPER_ADMIN') {
      stats = await dashboardService.getSuperAdminDashboard();
    } else if (role === 'TESTER') {
      stats = await dashboardService.getTesterDashboard(id);
    } else if (role === 'DEVELOPER') {
      stats = await dashboardService.getDeveloperDashboard(id);
    }
    
    return sendResponse(res, 200, true, 'Dashboard stats fetched successfully', stats);
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};`,

  'src/modules/dashboard/dashboard.routes.js': `import { Router } from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.get('/', getDashboardStats);

export default router;`,

  'src/modules/report/report.service.js': `import exceljs from 'exceljs';
import BugReport from '../bugReport/bugReport.model.js';
import ProjectAssignment from '../project/projectAssignment.model.js';
import Project from '../project/project.model.js';

export const generateBugReportExcel = async (user) => {
  let bugs = [];
  
  if (user.role === 'SUPER_ADMIN') {
    bugs = await BugReport.findAll({ include: [{ model: Project, as: 'project', attributes: ['projectName'] }] });
  } else {
    const assignments = await ProjectAssignment.findAll({ where: { userId: user.id } });
    const projectIds = assignments.map(a => a.projectId);
    
    let whereClause = { projectId: projectIds };
    if (user.role === 'TESTER') {
      whereClause.testerId = user.id;
    }
    bugs = await BugReport.findAll({ 
      where: whereClause,
      include: [{ model: Project, as: 'project', attributes: ['projectName'] }] 
    });
  }

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Bug Reports');
  
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Project', key: 'projectName', width: 20 },
    { header: 'Module Name', key: 'moduleName', width: 20 },
    { header: 'Severity', key: 'severity', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Description', key: 'bugDescription', width: 40 },
    { header: 'Created At', key: 'createdAt', width: 20 },
  ];
  
  bugs.forEach(bug => {
    worksheet.addRow({
      id: bug.id,
      projectName: bug.project ? bug.project.projectName : 'Unknown',
      moduleName: bug.moduleName,
      severity: bug.severity,
      status: bug.status,
      bugDescription: bug.bugDescription,
      createdAt: bug.createdAt.toISOString(),
    });
  });

  return workbook;
};`,

  'src/modules/report/report.controller.js': `import * as reportService from './report.service.js';

export const downloadExcelReport = async (req, res) => {
  try {
    const workbook = await reportService.generateBugReportExcel(req.user);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + \`bug_reports_\${req.user.role}.xlsx\`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};`,

  'src/modules/report/report.routes.js': `import { Router } from 'express';
import { downloadExcelReport } from './report.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';

const router = Router();

router.use(authenticate);
router.get('/download', downloadExcelReport);

export default router;`,

  'src/scripts/seed.js': `import sequelize, { connectDB } from '../config/db.js';
import { initModels, User } from '../models/initModels.js';
import { hashPassword } from '../shared/utils/bcrypt.js';

const seedAdmin = async () => {
  await connectDB();
  await initModels();
  
  const existingAdmin = await User.findOne({ where: { email: 'admin@gmail.com' } });
  
  if (!existingAdmin) {
    const hashedPassword = await hashPassword('admin123');
    await User.create({
      name: 'Super Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'SUPER_ADMIN'
    });
    console.log('Super Admin seeded successfully');
  } else {
    console.log('Super Admin already exists');
  }
  
  process.exit(0);
};

seedAdmin();`,

  'src/app.js': `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import projectRoutes from './modules/project/project.routes.js';
import bugReportRoutes from './modules/bugReport/bugReport.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import reportRoutes from './modules/report/report.routes.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bug-reports', bugReportRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

export default app;`,

  'src/server.js': `import app from './app.js';
import { connectDB } from './config/db.js';
import { initModels } from './models/initModels.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await initModels();
  
  app.listen(PORT, () => {
    console.log(\`Server is running on port \${PORT}\`);
  });
};

startServer();`
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
