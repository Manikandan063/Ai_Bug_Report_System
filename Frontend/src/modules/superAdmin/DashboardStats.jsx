import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Users, FolderKanban, Bug, ShieldAlert, Activity } from 'lucide-react';

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in pb-12">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
          <div className="w-14 h-14 rounded-2xl bg-slate-200 animate-pulse mb-2"></div>
          <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-md"></div>
          <div className="h-4 w-96 bg-slate-100 animate-pulse rounded-md mt-1"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-50 w-14 h-14 rounded-2xl mb-2">
           <Activity className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Super Admin Control Center
        </h2>
        <p className="text-slate-500 text-base">Overview of the entire platform's activity, users, and projects.</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Users */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-blue-400 to-cyan-500 border-0 shadow-lg group hover:shadow-xl transition-all h-40">
          <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500">
            <Users className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-50 tracking-wider uppercase">Total Users</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <div className="text-5xl font-black text-white">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-blue-100 mt-2 font-medium">Registered platform users</p>
          </CardContent>
        </Card>

        {/* Total Projects */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 border-0 shadow-lg group hover:shadow-xl transition-all h-40">
          <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
            <FolderKanban className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-indigo-100 tracking-wider uppercase">Total Projects</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <div className="text-5xl font-black text-white">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-indigo-100 mt-2 font-medium">Active managed projects</p>
          </CardContent>
        </Card>

        {/* Total Bugs */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-orange-400 to-rose-500 border-0 shadow-lg group hover:shadow-xl transition-all h-40">
          <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
            <Bug className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-orange-50 tracking-wider uppercase">Total Bugs</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <div className="text-5xl font-black text-white">{stats?.totalBugs || 0}</div>
            <p className="text-xs text-orange-100 mt-2 font-medium">System-wide reports</p>
          </CardContent>
        </Card>

        {/* Open Bugs (Critical) */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-rose-500 to-red-600 border-0 shadow-lg group hover:shadow-xl transition-all h-40">
          <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
            <ShieldAlert className="w-32 h-32 text-white" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-rose-100 tracking-wider uppercase">Open Bugs</CardTitle>
            {(stats?.openBugs || 0) > 0 && (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            )}
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <div className="text-5xl font-black text-white">{stats?.openBugs || 0}</div>
            <p className="text-xs text-rose-100 mt-2 font-medium">Awaiting developer action</p>
          </CardContent>
        </Card>

      </div>
      
      {/* Quick Actions or Info (Placeholder for Future scalability) */}
      <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-3xl p-8 text-center mt-8 shadow-sm">
        <FolderKanban className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-700">Platform Operating Smoothly</h3>
        <p className="text-slate-500 mt-1 max-w-lg mx-auto">Use the sidebar navigation to manage users, assign projects, or export comprehensive AI-driven bug reports.</p>
      </div>

    </div>
  );
};

export default DashboardStats;