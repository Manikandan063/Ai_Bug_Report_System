import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Bug, FolderKanban, Sparkles, ExternalLink, Activity } from 'lucide-react';
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

  const ensureAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

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
      const res = await api.get('/bug-reports');
      setMyBugs(res.data.data);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center justify-center p-2 bg-indigo-50 rounded-xl mb-3">
             <Activity className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Tester Workspace
          </h2>
          <p className="text-slate-500 mt-1 text-sm">Monitor your assigned projects and recent bug reports.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 border-0 shadow-lg group hover:shadow-xl transition-all">
          <div className="absolute -right-4 -top-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <FolderKanban className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-indigo-100">Assigned Projects</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-white">{stats?.assignedProjects || 0}</div>
            <p className="text-xs text-indigo-200 mt-2">Projects you are actively testing</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-orange-500 border-0 shadow-lg group hover:shadow-xl transition-all">
          <div className="absolute -right-4 -top-4 opacity-10 transform group-hover:scale-110 transition-transform duration-500">
            <Bug className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-rose-100">My Reported Bugs</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-4xl font-extrabold text-white">{stats?.reportedBugs || 0}</div>
            <p className="text-xs text-rose-200 mt-2">Total bugs submitted by you</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Projects Table */}
        <Card className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-indigo-500" /> My Assigned Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-600">Project Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map(p => (
                  <TableRow key={p.id} className="hover:bg-indigo-50/30 transition-colors">
                    <TableCell className="font-medium text-slate-700">{p.projectName}</TableCell>
                    <TableCell><Badge variant="outline" className="bg-white">{p.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {p.deploymentUrl ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-full px-4" 
                          onClick={() => window.open(ensureAbsoluteUrl(p.deploymentUrl), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1.5" /> Launch
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No URL</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {projects.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center h-32 text-slate-400">No assigned projects</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Bugs Table */}
        <Card className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bug className="h-5 w-5 text-rose-500" /> Recent Bug Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="font-semibold text-slate-600">Module</TableHead>
                  <TableHead className="font-semibold text-slate-600">Severity</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myBugs.slice(0, 5).map(bug => (
                  <TableRow key={bug.id} className="hover:bg-rose-50/30 transition-colors">
                    <TableCell className="font-medium text-slate-700 truncate max-w-[150px]">{bug.moduleName}</TableCell>
                    <TableCell>
                      <Badge variant={bug.severity === 'High' ? 'destructive' : 'secondary'} className={bug.severity === 'High' ? 'shadow-sm' : 'bg-slate-100 text-slate-600'}>
                        {bug.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={`bg-white ${bug.status === 'Fixed' ? 'border-green-200 text-green-700' : ''}`}>
                        {bug.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {myBugs.length === 0 && (
                  <TableRow><TableCell colSpan={3} className="text-center h-32 text-slate-400">No bugs reported yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default TesterDashboard;