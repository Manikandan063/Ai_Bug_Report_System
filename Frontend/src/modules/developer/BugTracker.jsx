import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Bug, PenTool, CheckCircle, Search, Save, AlertCircle } from 'lucide-react';

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
    // scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedBug) return;
    
    setIsUpdating(true);
    try {
      await api.put(`/bug-reports/${selectedBug.id}`, { status, remarks });
      alert('Bug status updated successfully!');
      fetchBugs();
      setSelectedBug(null);
    } catch (err) {
      alert('Failed to update: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadgeColor = (s) => {
    switch (s) {
      case 'Open': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'In Progress': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Fixed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Closed': return 'bg-slate-200 text-slate-700 border-slate-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center justify-center p-3 bg-rose-50 w-14 h-14 rounded-2xl mb-2">
           <Bug className="h-6 w-6 text-rose-600" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
          Bug Tracker
        </h2>
        <p className="text-slate-500 text-base">Select a bug from the queue to view details and push status updates.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Table Area */}
        <div className="xl:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="text-lg font-bold text-slate-800">Pending Issues</h3>
              <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 rounded-full px-3 py-1">
                {bugs.length} Issues Found
              </Badge>
            </div>

            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="py-4 font-semibold text-slate-600 pl-6">ID</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600">Module</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600">Severity</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600 text-right pr-6">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bugs.map(bug => (
                    <TableRow key={bug.id} className="hover:bg-rose-50/40 transition-colors border-slate-100 cursor-pointer" onClick={() => handleSelectBug(bug)}>
                      <TableCell className="font-bold text-slate-700 pl-6 py-4">#{bug.id}</TableCell>
                      <TableCell className="max-w-[150px] truncate py-4 font-medium text-slate-800">{bug.moduleName}</TableCell>
                      <TableCell className="py-4">
                        <Badge variant={bug.severity === 'High' ? 'destructive' : 'secondary'} className={bug.severity === 'High' ? 'shadow-sm' : 'bg-slate-100 text-slate-600'}>
                          {bug.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className={`px-3 py-1 rounded-full border ${getStatusBadgeColor(bug.status)}`}>
                          {bug.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`rounded-full px-4 font-semibold transition-all ${selectedBug?.id === bug.id ? 'bg-indigo-100 text-indigo-700' : 'text-indigo-600 hover:bg-indigo-50'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectBug(bug);
                          }}
                        >
                          {selectedBug?.id === bug.id ? 'Editing' : 'Resolve'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {bugs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16 text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <CheckCircle className="h-10 w-10 text-emerald-400 mb-3" />
                          <p className="text-lg font-medium text-slate-700">All caught up!</p>
                          <p>No bugs found for your assigned projects.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="xl:col-span-1">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] p-6 relative overflow-hidden transition-all duration-300 xl:sticky xl:top-28">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-rose-500 to-orange-500"></div>
            
            <div className="mb-6 mt-2 flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-xl">
                <PenTool className="h-5 w-5 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {selectedBug ? `Update Ticket #${selectedBug.id}` : 'Resolution Desk'}
              </h3>
            </div>

            {selectedBug ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                
                {/* Details Block */}
                <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl shadow-inner border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                     <AlertCircle className="h-16 w-16 text-rose-500" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Issue Description</p>
                    <p className="text-sm text-slate-100 font-medium mb-4 leading-relaxed">{selectedBug.bugDescription}</p>
                    
                    <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-3">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expected</p>
                        <p className="text-xs text-emerald-400">{selectedBug.expectedResult}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Actual</p>
                        <p className="text-xs text-rose-400">{selectedBug.actualResult}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-slate-700 ml-1">Status Transition</Label>
                  <select 
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
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
                  <Label className="text-sm font-semibold text-slate-700 ml-1">Developer Remarks</Label>
                  <textarea 
                    className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-all outline-none placeholder:text-slate-400"
                    placeholder="Document your fix, pull request links, or testing instructions..." 
                    value={remarks} 
                    onChange={e => setRemarks(e.target.value)} 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl mt-2 bg-gradient-to-r from-rose-600 to-orange-500 hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all border-0 font-semibold" 
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : (
                    <span className="flex items-center justify-center">
                      <Save className="mr-2 h-4 w-4" /> Push Updates
                    </span>
                  )}
                </Button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center h-[400px] border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Search className="h-10 w-10 text-slate-300 mb-4" />
                <p className="text-slate-600 font-medium">No Ticket Selected</p>
                <p className="text-sm text-slate-400 max-w-[200px] mt-2">Click "Resolve" on any bug in the queue to load details here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugTracker;