import fs from 'fs';
import path from 'path';

const files = {
  'src/modules/bugReport/bugReport.model.js': `import { DataTypes } from 'sequelize';
import sequelize from '../../config/db.js';

const BugReport = sequelize.define('BugReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  testerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  moduleName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bugDescription: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  testDescription: {
    type: DataTypes.TEXT,
  },
  actualResult: {
    type: DataTypes.TEXT,
  },
  expectedResult: {
    type: DataTypes.TEXT,
  },
  severity: {
    type: DataTypes.ENUM('High', 'Medium', 'Low'),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Open', // Open, In Progress, Fixed, Closed
  },
  remarks: {
    type: DataTypes.TEXT,
  }
}, {
  tableName: 'bug_reports',
  timestamps: true,
});

export default BugReport;`,

  'src/modules/bugReport/bugReport.schema.js': `import { z } from 'zod';

export const createBugReportSchema = z.object({
  projectId: z.number().int().positive(),
  moduleName: z.string().min(1, 'Module Name is required'),
  bugDescription: z.string().min(1, 'Bug Description is required'),
  testDescription: z.string(),
  actualResult: z.string(),
  expectedResult: z.string(),
  severity: z.enum(['High', 'Medium', 'Low']),
});

export const updateBugReportSchema = z.object({
  status: z.string().optional(),
  remarks: z.string().optional(),
});`,

  'src/modules/bugReport/bugReport.service.js': `import BugReport from './bugReport.model.js';
import Project from '../project/project.model.js';
import ProjectAssignment from '../project/projectAssignment.model.js';

export const createBugReport = async (testerId, bugData) => {
  const assignment = await ProjectAssignment.findOne({
    where: { projectId: bugData.projectId, userId: testerId, roleInProject: 'TESTER' }
  });
  if (!assignment) throw new Error('You are not assigned as a TESTER to this project');

  return await BugReport.create({
    ...bugData,
    testerId,
    remarks: '', // Remarks must always be empty on creation
  });
};

export const getBugReports = async (user, projectId) => {
  if (user.role === 'SUPER_ADMIN') {
    const whereClause = projectId ? { projectId } : {};
    return await BugReport.findAll({ where: whereClause });
  }

  // If TESTER or DEVELOPER, they can only view bugs for assigned projects
  const assignments = await ProjectAssignment.findAll({ where: { userId: user.id } });
  const assignedProjectIds = assignments.map(a => a.projectId);

  if (projectId) {
    if (!assignedProjectIds.includes(Number(projectId))) {
      throw new Error('Access denied to this project');
    }
    return await BugReport.findAll({ where: { projectId } });
  }

  return await BugReport.findAll({ where: { projectId: assignedProjectIds } });
};

export const getBugReportById = async (user, id) => {
  const bug = await BugReport.findByPk(id);
  if (!bug) throw new Error('Bug report not found');

  if (user.role !== 'SUPER_ADMIN') {
    const assignment = await ProjectAssignment.findOne({
      where: { projectId: bug.projectId, userId: user.id }
    });
    if (!assignment) throw new Error('Access denied to this bug report');
  }

  return bug;
};

export const updateBugReport = async (user, id, updateData) => {
  const bug = await BugReport.findByPk(id);
  if (!bug) throw new Error('Bug report not found');

  if (user.role === 'DEVELOPER') {
    const assignment = await ProjectAssignment.findOne({
      where: { projectId: bug.projectId, userId: user.id, roleInProject: 'DEVELOPER' }
    });
    if (!assignment) throw new Error('You are not assigned as a DEVELOPER to this project');
  }

  return await bug.update(updateData);
};

export const deleteBugReport = async (id) => {
  const bug = await BugReport.findByPk(id);
  if (!bug) throw new Error('Bug report not found');
  await bug.destroy();
  return { id };
};`,

  'src/modules/bugReport/bugReport.controller.js': `import * as bugReportService from './bugReport.service.js';
import { sendResponse } from '../../shared/utils/response.js';
import { createBugReportSchema, updateBugReportSchema } from './bugReport.schema.js';

export const createBugReport = async (req, res) => {
  try {
    const validatedData = createBugReportSchema.parse(req.body);
    const bug = await bugReportService.createBugReport(req.user.id, validatedData);
    return sendResponse(res, 201, true, 'Bug report created successfully', bug);
  } catch (error) {
    if (error.errors) return sendResponse(res, 400, false, 'Validation Error', error.errors);
    return sendResponse(res, 400, false, error.message);
  }
};

export const getBugReports = async (req, res) => {
  try {
    const bugs = await bugReportService.getBugReports(req.user, req.query.projectId);
    return sendResponse(res, 200, true, 'Bug reports fetched successfully', bugs);
  } catch (error) {
    return sendResponse(res, 403, false, error.message);
  }
};

export const getBugReportById = async (req, res) => {
  try {
    const bug = await bugReportService.getBugReportById(req.user, req.params.id);
    return sendResponse(res, 200, true, 'Bug report fetched successfully', bug);
  } catch (error) {
    return sendResponse(res, 404, false, error.message);
  }
};

export const updateBugReport = async (req, res) => {
  try {
    const validatedData = updateBugReportSchema.parse(req.body);
    const bug = await bugReportService.updateBugReport(req.user, req.params.id, validatedData);
    return sendResponse(res, 200, true, 'Bug report updated successfully', bug);
  } catch (error) {
    if (error.errors) return sendResponse(res, 400, false, 'Validation Error', error.errors);
    return sendResponse(res, 400, false, error.message);
  }
};

export const deleteBugReport = async (req, res) => {
  try {
    await bugReportService.deleteBugReport(req.params.id);
    return sendResponse(res, 200, true, 'Bug report deleted successfully');
  } catch (error) {
    return sendResponse(res, 400, false, error.message);
  }
};`,

  'src/modules/bugReport/bugReport.routes.js': `import { Router } from 'express';
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

export default router;`,

  'src/modules/ai/ai.schema.js': `import { z } from 'zod';

export const generateBugReportSchema = z.object({
  bugDescription: z.string().min(1, 'Bug description is required'),
});`,

  'src/modules/ai/ai.service.js': `import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

export const generateBugReport = async (bugDescription) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }); 

  const prompt = \`
    You are an expert QA Tester. Generate a JSON bug report based on the following description.
    Return ONLY a raw valid JSON object without markdown formatting or code blocks.
    
    Bug Description: \${bugDescription}
    
    Required JSON format:
    {
      "testDescription": "string detailing the test scenario",
      "actualResult": "string describing what actually happened",
      "expectedResult": "string describing what should have happened",
      "severity": "High" | "Medium" | "Low",
      "remarks": ""
    }
  \`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text();
    text = text.replace(/\\r\\n/g, '').replace(/\\n/g, '').trim();
    if(text.startsWith('\`\`\`json')){
       text = text.substring(7, text.length - 3).trim();
    } else if(text.startsWith('\`\`\`')){
       text = text.substring(3, text.length - 3).trim();
    }
    const jsonResult = JSON.parse(text);

    // Validate the generated data and clean if necessary
    if (!['High', 'Medium', 'Low'].includes(jsonResult.severity)) {
      jsonResult.severity = 'Medium'; // default
    }
    jsonResult.remarks = '';

    return jsonResult;
  } catch (error) {
    console.error('AI Generation Error:', error);
    throw new Error('Failed to generate AI bug report');
  }
};`,

  'src/modules/ai/ai.controller.js': `import * as aiService from './ai.service.js';
import { sendResponse } from '../../shared/utils/response.js';
import { generateBugReportSchema } from './ai.schema.js';

export const generateReport = async (req, res) => {
  try {
    const validatedData = generateBugReportSchema.parse(req.body);
    const result = await aiService.generateBugReport(validatedData.bugDescription);
    return sendResponse(res, 200, true, 'AI Report generated successfully', result);
  } catch (error) {
    if (error.errors) return sendResponse(res, 400, false, 'Validation Error', error.errors);
    return sendResponse(res, 500, false, error.message);
  }
};`,

  'src/modules/ai/ai.routes.js': `import { Router } from 'express';
import { generateReport } from './ai.controller.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { authorizeRole } from '../../shared/middlewares/role.js';

const router = Router();

router.use(authenticate);
router.post('/generate-bug-report', authorizeRole('TESTER'), generateReport);

export default router;`,

  'src/models/initModels.js': `import sequelize from '../config/db.js';
import User from '../modules/user/user.model.js';
import Auth from '../modules/auth/auth.model.js';
import Project from '../modules/project/project.model.js';
import ProjectAssignment from '../modules/project/projectAssignment.model.js';
import BugReport from '../modules/bugReport/bugReport.model.js';

// User & Project Assignment Associations
User.hasMany(ProjectAssignment, { foreignKey: 'userId', as: 'assignments' });
ProjectAssignment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Project.hasMany(ProjectAssignment, { foreignKey: 'projectId', as: 'assignments' });
ProjectAssignment.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// BugReport Associations
BugReport.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Project.hasMany(BugReport, { foreignKey: 'projectId', as: 'bugReports' });

BugReport.belongsTo(User, { foreignKey: 'testerId', as: 'tester' });
User.hasMany(BugReport, { foreignKey: 'testerId', as: 'reportedBugs' });

export const initModels = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully');
  } catch (error) {
    console.error('Error syncing database:', error);
  }
};

export { User, Auth, Project, ProjectAssignment, BugReport };`
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
