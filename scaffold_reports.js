import fs from 'fs';
import path from 'path';

const files = {
  'src/modules/report/ReportsPage.jsx': `import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Download, Search, Filter } from 'lucide-react';

const ReportsPage = () => {
  const [bugs, setBugs] = useState([]);
  const [filteredBugs, setFilteredBugs] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const res = await api.get('/bug-reports');
      setBugs(res.data.data);
      setFilteredBugs(res.data.data);
      
      // Extract unique projects
      const uniqueProjects = Array.from(new Set(res.data.data.map(b => b.projectId)));
      setProjects(uniqueProjects);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    let result = bugs;

    if (searchTerm) {
      result = result.filter(b => 
        b.moduleName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        b.bugDescription.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (severityFilter !== 'All') {
      result = result.filter(b => b.severity === severityFilter);
    }

    if (statusFilter !== 'All') {
      result = result.filter(b => b.status === statusFilter);
    }

    if (projectFilter !== 'All') {
      result = result.filter(b => b.projectId === Number(projectFilter));
    }

    setFilteredBugs(result);
  }, [searchTerm, severityFilter, statusFilter, projectFilter, bugs]);

  const handleDownload = async () => {
    try {
      const response = await api.get('/reports/download', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'bug_reports.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Advanced Reports</h2>
        <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" /> Export to Excel
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search bugs..." 
                className="pl-9"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={projectFilter} 
              onChange={e => setProjectFilter(e.target.value)}
            >
              <option value="All">All Projects</option>
              {projects.map(pid => <option key={pid} value={pid}>Project #{pid}</option>)}
            </select>

            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={severityFilter} 
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Fixed">Fixed</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Project ID</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBugs.map(bug => (
                <TableRow key={bug.id}>
                  <TableCell className="font-medium">#{bug.id}</TableCell>
                  <TableCell>#{bug.projectId}</TableCell>
                  <TableCell>{bug.moduleName}</TableCell>
                  <TableCell><Badge variant={bug.severity === 'High' ? 'destructive' : 'secondary'}>{bug.severity}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{bug.status}</Badge></TableCell>
                  <TableCell>{new Date(bug.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {filteredBugs.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center h-24">No bugs match your filters.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;`,
  'src/modules/superAdmin/SuperAdminLayout.jsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { LayoutDashboard, Users, FolderKanban, FileSpreadsheet } from 'lucide-react';
import DashboardStats from './DashboardStats';
import UserManagement from './UserManagement';
import ProjectManagement from './ProjectManagement';
import ReportsPage from '../report/ReportsPage';

const SuperAdminLayout = () => {
  const links = [
    { to: '/superadmin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/superadmin/users', label: 'User Management', icon: Users },
    { to: '/superadmin/projects', label: 'Project Management', icon: FolderKanban },
    { to: '/superadmin/reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <SidebarLayout links={links}>
      <Routes>
        <Route path="/" element={<DashboardStats />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/projects" element={<ProjectManagement />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </SidebarLayout>
  );
};

export default SuperAdminLayout;`,

  'src/modules/tester/TesterLayout.jsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { LayoutDashboard, Bug, FileSpreadsheet } from 'lucide-react';
import TesterDashboard from './TesterDashboard';
import AiBugReport from './AiBugReport';
import ReportsPage from '../report/ReportsPage';

const TesterLayout = () => {
  const links = [
    { to: '/tester', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/tester/ai-bug-report', label: 'AI Bug Reporter', icon: Bug },
    { to: '/tester/reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <SidebarLayout links={links}>
      <Routes>
        <Route path="/" element={<TesterDashboard />} />
        <Route path="/ai-bug-report" element={<AiBugReport />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </SidebarLayout>
  );
};

export default TesterLayout;`,

  'src/modules/developer/DeveloperLayout.jsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { LayoutDashboard, Bug, FileSpreadsheet } from 'lucide-react';
import DeveloperDashboard from './DeveloperDashboard';
import BugTracker from './BugTracker';
import ReportsPage from '../report/ReportsPage';

const DeveloperLayout = () => {
  const links = [
    { to: '/developer', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/developer/bugs', label: 'Bug Tracker', icon: Bug },
    { to: '/developer/reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <SidebarLayout links={links}>
      <Routes>
        <Route path="/" element={<DeveloperDashboard />} />
        <Route path="/bugs" element={<BugTracker />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </SidebarLayout>
  );
};

export default DeveloperLayout;`
};

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join('c:\\\\Ai_Bug_Report\\\\Frontend', filePath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content);
  console.log('Created ' + fullPath);
}
