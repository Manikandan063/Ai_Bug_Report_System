import * as aiService from './ai.service.js';
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
};