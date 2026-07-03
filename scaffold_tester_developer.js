import fs from 'fs';
import path from 'path';

const files = {
  'src/modules/tester/TesterLayout.jsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { LayoutDashboard, Bug, FileSpreadsheet } from 'lucide-react';
import TesterDashboard from './TesterDashboard';
import AiBugReport from './AiBugReport';

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
        <Route path="/reports" element={<div className="p-4 bg-white rounded-xl shadow-sm border">Reports functionality coming soon. Check API endpoint for direct download.</div>} />
      </Routes>
    </SidebarLayout>
  );
};

export default TesterLayout;`,

  'src/modules/tester/TesterDashboard.jsx': `import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { LayoutDashboard, Bug, FolderKanban } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

const TesterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [myBugs, setMyBugs] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchProjects();
    fetchBugs();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard');
      setStats(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/my-projects');
      setProjects(res.data.data);
    } catch (err) { console.error(err); }
  };

  const fetchBugs = async () => {
    try {
      // By default getBugReports returns bugs for assigned projects.
      // Since it's a tester, they see bugs on their assigned projects.
      const res = await api.get('/bug-reports');
      setMyBugs(res.data.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Tester Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assignedProjects || 0}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Reported Bugs</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.reportedBugs || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">My Assigned Projects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.projectName}</TableCell>
                    <TableCell><Badge variant="outline">{p.status}</Badge></TableCell>
                    <TableCell>
                      {p.deploymentUrl ? (
                        <Button variant="link" className="p-0 h-auto" onClick={() => window.open(p.deploymentUrl, '_blank')}>Open Project</Button>
                      ) : 'No URL'}
                    </TableCell>
                  </TableRow>
                ))}
                {projects.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center h-24">No assigned projects</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg">Recent Bug Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBugs.slice(0, 5).map(bug => (
                  <TableRow key={bug.id}>
                    <TableCell className="font-medium truncate max-w-[150px]">{bug.moduleName}</TableCell>
                    <TableCell><Badge variant={bug.severity === 'High' ? 'destructive' : 'secondary'}>{bug.severity}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{bug.status}</Badge></TableCell>
                  </TableRow>
                ))}
                {myBugs.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center h-24">No bugs reported yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TesterDashboard;`,

  'src/modules/tester/AiBugReport.jsx': `import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Badge } from '../../components/ui/Badge';
import { Sparkles, Save } from 'lucide-react';

const AiBugReport = () => {
  const [projects, setProjects] = useState([]);
  
  // Step 1 data
  const [projectId, setProjectId] = useState('');
  const [moduleName, setModuleName] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  
  // Step 2 AI Generated data
  const [generatedReport, setGeneratedReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects/my-projects');
        setProjects(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchProjects();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!projectId || !moduleName || !bugDescription) return alert("Fill all required fields first.");
    
    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate-bug-report', { bugDescription });
      setGeneratedReport(res.data.data);
    } catch (err) {
      alert('Failed to generate report: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!generatedReport) return;
    setIsSubmitting(true);
    
    const payload = {
      projectId: Number(projectId),
      moduleName,
      bugDescription,
      testDescription: generatedReport.testDescription,
      actualResult: generatedReport.actualResult,
      expectedResult: generatedReport.expectedResult,
      severity: generatedReport.severity
    };

    try {
      await api.post('/bug-reports', payload);
      alert('Bug report submitted successfully!');
      
      // Reset form
      setProjectId('');
      setModuleName('');
      setBugDescription('');
      setGeneratedReport(null);
    } catch (err) {
      alert('Failed to submit: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">AI Bug Reporter</h2>

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Step 1: Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Project</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={projectId} 
                  onChange={e => setProjectId(e.target.value)}
                  required
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Module Name</Label>
                <Input required placeholder="e.g. Checkout Cart" value={moduleName} onChange={e => setModuleName(e.target.value)} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Simple Bug Description</Label>
              <textarea 
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required 
                placeholder="Describe what happened simply..." 
                value={bugDescription} 
                onChange={e => setBugDescription(e.target.value)} 
              />
            </div>
            
            <Button type="submit" disabled={isGenerating} className="w-full bg-indigo-600 hover:bg-indigo-700">
              <Sparkles className="mr-2 h-4 w-4" />
              {isGenerating ? 'Gemini is thinking...' : 'Generate AI Report'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedReport && (
        <Card className="glass-card shadow-lg shadow-primary/10 border-primary/50 animate-in fade-in slide-in-from-bottom-4">
          <CardHeader>
            <CardTitle className="text-lg flex justify-between items-center">
              <span>Step 2: Review AI Generated Report</span>
              <Badge variant={generatedReport.severity === 'High' ? 'destructive' : 'secondary'}>
                Severity: {generatedReport.severity}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg border">
                <p className="text-sm font-semibold text-slate-500 mb-1">Test Description</p>
                <p className="text-sm text-slate-800">{generatedReport.testDescription}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border">
                <p className="text-sm font-semibold text-slate-500 mb-1">Expected Result</p>
                <p className="text-sm text-slate-800">{generatedReport.expectedResult}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100 md:col-span-2">
                <p className="text-sm font-semibold text-red-500 mb-1">Actual Result</p>
                <p className="text-sm text-slate-800">{generatedReport.actualResult}</p>
              </div>
            </div>
            
            <Button onClick={handleSubmitReport} disabled={isSubmitting} className="w-full text-base h-12">
              <Save className="mr-2 h-5 w-5" />
              {isSubmitting ? 'Saving to Database...' : 'Submit Bug Report'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AiBugReport;`,

  'src/modules/developer/DeveloperLayout.jsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { LayoutDashboard, Bug, FileSpreadsheet } from 'lucide-react';
import DeveloperDashboard from './DeveloperDashboard';
import BugTracker from './BugTracker';

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
        <Route path="/reports" element={<div className="p-4 bg-white rounded-xl shadow-sm border">Reports functionality coming soon. Check API endpoint for direct download.</div>} />
      </Routes>
    </SidebarLayout>
  );
};

export default DeveloperLayout;`,

  'src/modules/developer/DeveloperDashboard.jsx': `import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { LayoutDashboard, Bug, FolderKanban, CheckCircle } from 'lucide-react';

const DeveloperDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.data);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Developer Dashboard</h2>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.assignedProjects || 0}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugs to Fix (Open)</CardTitle>
            <Bug className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.totalBugsToFix || 0}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fixed Bugs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats?.fixedBugs || 0}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="p-8 mt-4 glass-card border rounded-xl text-center flex flex-col items-center justify-center min-h-[300px]">
        <Bug className="h-16 w-16 text-slate-200 mb-4" />
        <h3 className="text-lg font-medium text-slate-600">Navigate to Bug Tracker</h3>
        <p className="text-sm text-slate-400 max-w-sm mt-2">View all reported bugs for your assigned projects and update their status on the Bug Tracker page.</p>
      </div>
    </div>
  );
};

export default DeveloperDashboard;`,

  'src/modules/developer/BugTracker.jsx': `import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';

const BugTracker = () => {
  const [bugs, setBugs] = useState([]);
  const [selectedBug, setSelectedBug] = useState(null);
  
  // Edit Form State
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBugs = async () => {
    try {
      const res = await api.get('/bug-reports');
      setBugs(res.data.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchBugs();
  }, []);

  const handleSelectBug = (bug) => {
    setSelectedBug(bug);
    setStatus(bug.status);
    setRemarks(bug.remarks || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedBug) return;
    
    setIsUpdating(true);
    try {
      await api.put(\`/bug-reports/\${selectedBug.id}\`, { status, remarks });
      alert('Bug status updated!');
      fetchBugs();
      setSelectedBug(null);
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Developer Bug Tracker</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Module</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bugs.map(bug => (
                    <TableRow key={bug.id}>
                      <TableCell className="font-medium">#{bug.id}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{bug.moduleName}</TableCell>
                      <TableCell><Badge variant={bug.severity === 'High' ? 'destructive' : 'secondary'}>{bug.severity}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={bug.status === 'Open' ? 'outline' : bug.status === 'Fixed' ? 'success' : 'default'}>
                          {bug.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="secondary" size="sm" onClick={() => handleSelectBug(bug)}>View / Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bugs.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center h-24">No bugs found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="glass-card sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">{selectedBug ? \`Update Bug #\${selectedBug.id}\` : 'Select a bug to edit'}</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedBug ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-md text-sm mb-4">
                    <p className="font-semibold text-slate-700">Description:</p>
                    <p className="text-slate-600 mt-1">{selectedBug.bugDescription}</p>
                    <p className="font-semibold text-slate-700 mt-3">Expected vs Actual:</p>
                    <p className="text-slate-600 mt-1 text-xs">{selectedBug.expectedResult} / {selectedBug.actualResult}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <select 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={status} 
                      onChange={e => setStatus(e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Fixed">Fixed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Remarks</Label>
                    <textarea 
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      placeholder="Add developer remarks..." 
                      value={remarks} 
                      onChange={e => setRemarks(e.target.value)} 
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isUpdating}>
                    {isUpdating ? 'Updating...' : 'Save Updates'}
                  </Button>
                </form>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  Click 'View / Edit' on a bug in the table to see details and update its status.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BugTracker;`,

  'src/routes/AppRouter.jsx': `import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../modules/auth/Login';
import SuperAdminLayout from '../modules/superAdmin/SuperAdminLayout';
import TesterLayout from '../modules/tester/TesterLayout';
import DeveloperLayout from '../modules/developer/DeveloperLayout';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'SUPER_ADMIN') return <Navigate to="/superadmin" />;
    if (user.role === 'TESTER') return <Navigate to="/tester" />;
    if (user.role === 'DEVELOPER') return <Navigate to="/developer" />;
  }
  return children;
};

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/superadmin/*" element={
        <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
          <SuperAdminLayout />
        </ProtectedRoute>
      } />
      
      <Route path="/tester/*" element={
        <ProtectedRoute allowedRoles={['TESTER']}>
          <TesterLayout />
        </ProtectedRoute>
      } />
      
      <Route path="/developer/*" element={
        <ProtectedRoute allowedRoles={['DEVELOPER']}>
          <DeveloperLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRouter;`
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
