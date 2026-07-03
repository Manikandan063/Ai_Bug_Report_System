import sequelize from '../config/db.js';
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

export { User, Auth, Project, ProjectAssignment, BugReport };