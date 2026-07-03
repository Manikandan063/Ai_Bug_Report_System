import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Bug, FolderKanban, CheckCircle, Code, Target } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

const DeveloperDashboard = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center justify-center p-3 bg-emerald-50 w-14 h-14 rounded-2xl mb-2">
           <Code className="h-6 w-6 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Developer Workspace
        </h2>
        <p className="text-slate-500 text-base">Monitor your active assignments and track your bug resolution progress.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Assigned Projects */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 border-0 shadow-lg group hover:shadow-xl transition-all h-40">
          <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <FolderKanban className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-100 uppercase tracking-wider">Assigned Projects</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <div className="text-5xl font-black text-white">{stats?.assignedProjects || 0}</div>
          </CardContent>
        </Card>

        {/* Bugs to Fix */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 border-0 shadow-lg group hover:shadow-xl transition-all h-40">
          <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
            <Bug className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-rose-100 uppercase tracking-wider">Bugs to Fix (Open)</CardTitle>
            {(stats?.totalBugsToFix || 0) > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            )}
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <div className="text-5xl font-black text-white">{stats?.totalBugsToFix || 0}</div>
          </CardContent>
        </Card>

        {/* Fixed Bugs */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-400 to-teal-500 border-0 shadow-lg group hover:shadow-xl transition-all h-40">
          <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <CheckCircle className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-emerald-50 uppercase tracking-wider">Fixed Bugs</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <div className="text-5xl font-black text-white">{stats?.fixedBugs || 0}</div>
          </CardContent>
        </Card>

      </div>
      
      {/* Navigation CTA */}
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] p-10 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all flex flex-col items-center justify-center mt-8 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500"></div>
        
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-50 transition-all duration-300">
          <Target className="h-10 w-10 text-slate-300 group-hover:text-teal-500 transition-colors" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Ready to squash some bugs?</h3>
        <p className="text-slate-500 max-w-lg mt-3 text-lg leading-relaxed">
          Navigate to the Bug Tracker to view detailed bug reports, update statuses, and push fixes for your assigned projects.
        </p>
        
        <Button 
          onClick={() => navigate('/developer/bugs')}
          className="mt-8 h-12 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          Go to Bug Tracker
        </Button>
      </div>
      
    </div>
  );
};

export default DeveloperDashboard;