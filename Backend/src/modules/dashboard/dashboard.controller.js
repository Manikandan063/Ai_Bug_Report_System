import * as dashboardService from './dashboard.service.js';
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
};