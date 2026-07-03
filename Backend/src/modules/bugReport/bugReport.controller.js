import * as bugReportService from './bugReport.service.js';
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
};