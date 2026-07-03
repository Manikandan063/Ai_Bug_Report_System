import BugReport from './bugReport.model.js';
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
  const includeProject = [{ model: Project, as: 'project', attributes: ['projectName'] }];

  if (user.role === 'SUPER_ADMIN') {
    const whereClause = projectId ? { projectId } : {};
    return await BugReport.findAll({ where: whereClause, include: includeProject });
  }

  if (user.role === 'TESTER') {
    const whereClause = projectId ? { projectId, testerId: user.id } : { testerId: user.id };
    return await BugReport.findAll({ where: whereClause, include: includeProject });
  }

  // If DEVELOPER, they can only view bugs for assigned projects
  const assignments = await ProjectAssignment.findAll({ where: { userId: user.id } });
  const assignedProjectIds = assignments.map(a => a.projectId);

  if (projectId) {
    if (!assignedProjectIds.includes(Number(projectId))) {
      throw new Error('Access denied to this project');
    }
    return await BugReport.findAll({ where: { projectId }, include: includeProject });
  }

  return await BugReport.findAll({ where: { projectId: assignedProjectIds }, include: includeProject });
};

export const getBugReportById = async (user, id) => {
  const bug = await BugReport.findByPk(id);
  if (!bug) throw new Error('Bug report not found');

  if (user.role === 'TESTER') {
    if (bug.testerId !== user.id) throw new Error('Access denied to this bug report');
  } else if (user.role === 'DEVELOPER') {
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
};