import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Download, Search, ChevronLeft, FolderKanban, FileText, ArrowRight, Filter } from 'lucide-react';

const ReportsPage = () => {
  const [bugs, setBugs] = useState([]);
  const [projectList, setProjectList] = useState([]);
  
  // View State: 'PROJECTS' or 'REPORTS'
  const [view, setView] = useState('PROJECTS');
  const [selectedProject, setSelectedProject] = useState(null);

  // Filters for REPORTS view
  const [filteredBugs, setFilteredBugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchBugs();
  }, []);

  const fetchBugs = async () => {
    try {
      const res = await api.get('/bug-reports');
      const allBugs = res.data.data;
      setBugs(allBugs);
      
      // Extract unique projects with bug counts
      const uniqueProjectMap = new Map();
      allBugs.forEach(b => {
        if (b.project) {
          if (!uniqueProjectMap.has(b.projectId)) {
            uniqueProjectMap.set(b.projectId, { 
              id: b.projectId, 
              name: b.project.projectName, 
              bugCount: 0 
            });
          }
          uniqueProjectMap.get(b.projectId).bugCount++;
        }
      });
      setProjectList(Array.from(uniqueProjectMap.values()));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (view === 'REPORTS' && selectedProject) {
      let result = bugs.filter(b => b.projectId === selectedProject.id);

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

      setFilteredBugs(result);
    }
  }, [searchTerm, severityFilter, statusFilter, selectedProject, bugs, view]);

  const handleDownload = async () => {
    if (!selectedProject) return;
    try {
      const urlStr = `/reports/download?projectId=${selectedProject.id}`;
      const fileName = `${selectedProject.name.replace(/[^a-zA-Z0-9]/g, '_')}_Bug_Reports.xlsx`;

      const response = await api.get(urlStr, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download report.');
    }
  };

  if (view === 'PROJECTS') {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 w-14 h-14 rounded-2xl mb-2">
             <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Project Reports
          </h2>
          <p className="text-slate-500 text-base">Select a project below to view and export its detailed bug reports.</p>
        </div>
        
        {projectList.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-md border border-dashed border-slate-300 rounded-3xl p-12 text-center">
            <FolderKanban className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700">No Projects Found</h3>
            <p className="text-slate-500 mt-1">No bugs have been reported for any of your projects yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projectList.map(project => (
              <div 
                key={project.id} 
                onClick={() => {
                  setSelectedProject(project);
                  setView('REPORTS');
                }}
                className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-indigo-300/60 transition-all cursor-pointer group flex flex-col justify-between min-h-[200px] relative overflow-hidden"
              >
                {/* Glow bar at top */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 transition-all duration-300">
                    <FolderKanban className="text-indigo-600 group-hover:text-white transition-colors" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{project.name}</h3>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Reports</p>
                    <p className="text-2xl font-black text-indigo-600">{project.bugCount}</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // View: REPORTS
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setView('PROJECTS')}
            className="rounded-full h-10 w-10 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              {selectedProject?.name}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Showing all bug reports for this project</p>
          </div>
        </div>
        <Button onClick={handleDownload} className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all rounded-full px-6 h-10 border-0">
          <Download className="mr-2 h-4 w-4" /> Export to Excel
        </Button>
      </div>

      <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-[1.5rem] p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full md:w-[40%]">
            <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by module or description..." 
              className="pl-11 h-12 rounded-xl border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-[30%] relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select 
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none appearance-none"
              value={severityFilter} 
              onChange={e => setSeverityFilter(e.target.value)}
            >
              <option value="All">All Severities</option>
              <option value="High">High Severity</option>
              <option value="Medium">Medium Severity</option>
              <option value="Low">Low Severity</option>
            </select>
          </div>

          <div className="w-full md:w-[30%] relative">
             <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select 
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none appearance-none"
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
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="py-4 font-semibold text-slate-600 pl-6">Bug ID</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600">Module Name</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600">Severity</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600">Status</TableHead>
                <TableHead className="py-4 font-semibold text-slate-600 pr-6 text-right">Report Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBugs.map(bug => (
                <TableRow key={bug.id} className="hover:bg-indigo-50/40 transition-colors">
                  <TableCell className="font-medium text-slate-700 pl-6">#{bug.id}</TableCell>
                  <TableCell className="text-slate-600">{bug.moduleName}</TableCell>
                  <TableCell>
                    <Badge variant={bug.severity === 'High' ? 'destructive' : 'secondary'} className={bug.severity === 'High' ? 'shadow-sm' : 'bg-slate-100 text-slate-600'}>
                      {bug.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`bg-white ${bug.status === 'Fixed' ? 'border-green-200 text-green-700' : ''}`}>
                      {bug.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500 pr-6 text-right">{new Date(bug.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {filteredBugs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Search className="h-8 w-8 text-slate-300 mb-3" />
                      <p>No bugs match your current filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;