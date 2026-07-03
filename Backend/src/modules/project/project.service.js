import Project from './project.model.js';
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
  const { testingTeamMembers, developerTeamMembers, ...restData } = projectData;
  const project = await Project.create(restData);

  if (testingTeamMembers && testingTeamMembers.length > 0) {
    const testerAssignments = testingTeamMembers.map(userId => ({ projectId: project.id, userId, roleInProject: 'TESTER' }));
    await ProjectAssignment.bulkCreate(testerAssignments);
  }
  if (developerTeamMembers && developerTeamMembers.length > 0) {
    const devAssignments = developerTeamMembers.map(userId => ({ projectId: project.id, userId, roleInProject: 'DEVELOPER' }));
    await ProjectAssignment.bulkCreate(devAssignments);
  }

  return await getProjectById(project.id);
};

export const updateProject = async (id, updateData) => {
  const { testingTeamMembers, developerTeamMembers, ...restData } = updateData;
  const project = await Project.findByPk(id);
  if (!project) throw new Error('Project not found');
  await project.update(restData);

  if (testingTeamMembers) {
    await ProjectAssignment.destroy({ where: { projectId: project.id, roleInProject: 'TESTER' } });
    if (testingTeamMembers.length > 0) {
      const testerAssignments = testingTeamMembers.map(userId => ({ projectId: project.id, userId, roleInProject: 'TESTER' }));
      await ProjectAssignment.bulkCreate(testerAssignments);
    }
  }

  if (developerTeamMembers) {
    await ProjectAssignment.destroy({ where: { projectId: project.id, roleInProject: 'DEVELOPER' } });
    if (developerTeamMembers.length > 0) {
      const devAssignments = developerTeamMembers.map(userId => ({ projectId: project.id, userId, roleInProject: 'DEVELOPER' }));
      await ProjectAssignment.bulkCreate(devAssignments);
    }
  }

  return await getProjectById(project.id);
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
     throw new Error(`User role (${user.role}) does not match project role (${assignmentData.roleInProject})`);
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
};