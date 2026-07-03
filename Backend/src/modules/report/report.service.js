import exceljs from 'exceljs';
import BugReport from '../bugReport/bugReport.model.js';
import ProjectAssignment from '../project/projectAssignment.model.js';
import Project from '../project/project.model.js';
import User from '../user/user.model.js';

export const generateBugReportExcel = async (user, projectId) => {
  let bugs = [];
  
  const includeOptions = [
    { 
      model: Project, 
      as: 'project', 
      attributes: ['projectName'],
      include: [{
        model: ProjectAssignment,
        as: 'assignments',
        required: false,
        where: { roleInProject: 'DEVELOPER' },
        include: [{ model: User, as: 'user', attributes: ['name'] }]
      }]
    },
    {
      model: User,
      as: 'tester',
      attributes: ['name']
    }
  ];

  if (user.role === 'SUPER_ADMIN') {
    const whereClause = projectId ? { projectId } : {};
    bugs = await BugReport.findAll({ where: whereClause, include: includeOptions });
  } else {
    const assignments = await ProjectAssignment.findAll({ where: { userId: user.id } });
    const projectIds = assignments.map(a => a.projectId);
    
    let whereClause = { projectId: projectId ? [Number(projectId)] : projectIds };
    if (user.role === 'TESTER') {
      whereClause.testerId = user.id;
    }
    bugs = await BugReport.findAll({ 
      where: whereClause,
      include: includeOptions 
    });
  }

  const workbook = new exceljs.Workbook();
  const worksheet = workbook.addWorksheet('Bug Reports');
  
  worksheet.columns = [
    { header: 'Bug ID', key: 'id', width: 10 },
    { header: 'Project Name', key: 'projectName', width: 20 },
    { header: 'Module Name', key: 'moduleName', width: 20 },
    { header: 'Test Description', key: 'testDescription', width: 40 },
    { header: 'Actual Result', key: 'actualResult', width: 40 },
    { header: 'Expected Result', key: 'expectedResult', width: 40 },
    { header: 'Severity', key: 'severity', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Assigned Developer', key: 'assignedDeveloper', width: 30 },
    { header: 'Tester Name', key: 'testerName', width: 20 },
    { header: 'Created Date', key: 'createdAt', width: 20 },
    { header: 'Updated Date', key: 'updatedAt', width: 20 },
    { header: 'Remarks', key: 'remarks', width: 40 },
  ];
  
  // Apply bold formatting to the header row
  worksheet.getRow(1).font = { bold: true };

  bugs.forEach(bug => {
    let devNames = 'Unassigned';
    if (bug.project && bug.project.assignments && bug.project.assignments.length > 0) {
      devNames = bug.project.assignments.map(a => a.user?.name).filter(Boolean).join(', ');
    }

    worksheet.addRow({
      id: bug.id,
      projectName: bug.project ? bug.project.projectName : 'Unknown',
      moduleName: bug.moduleName || '-',
      testDescription: bug.testDescription || '-',
      actualResult: bug.actualResult || '-',
      expectedResult: bug.expectedResult || '-',
      severity: bug.severity,
      status: bug.status,
      assignedDeveloper: devNames,
      testerName: bug.tester ? bug.tester.name : 'Unknown',
      createdAt: bug.createdAt.toISOString(),
      updatedAt: bug.updatedAt.toISOString(),
      remarks: bug.remarks || '-',
    });
  });

  return workbook;
};