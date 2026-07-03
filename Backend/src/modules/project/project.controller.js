import * as projectService from './project.service.js';
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
};