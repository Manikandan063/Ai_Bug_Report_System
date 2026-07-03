import User from '../user/user.model.js';
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
};