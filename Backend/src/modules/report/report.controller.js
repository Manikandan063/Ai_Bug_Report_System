import * as reportService from './report.service.js';

export const downloadExcelReport = async (req, res) => {
  try {
    const { projectId } = req.query;
    const workbook = await reportService.generateBugReportExcel(req.user, projectId);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=' + `bug_reports_${req.user.role}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};