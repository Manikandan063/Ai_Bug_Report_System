import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { UserPlus, Users, Trash2, Shield, Code, TestTube } from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'TESTER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/users', formData);
      setFormData({ name: '', email: '', password: '', role: 'TESTER' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 flex gap-1 items-center px-2.5 py-0.5"><Shield className="h-3 w-3"/> Admin</Badge>;
      case 'DEVELOPER':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 flex gap-1 items-center px-2.5 py-0.5"><Code className="h-3 w-3"/> Developer</Badge>;
      case 'TESTER':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 flex gap-1 items-center px-2.5 py-0.5"><TestTube className="h-3 w-3"/> Tester</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 w-14 h-14 rounded-2xl mb-2">
           <Users className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          User Management
        </h2>
        <p className="text-slate-500 text-base">Provision new accounts and manage access across the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Create User Form */}
        <div className="lg:col-span-1">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-6 relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
            
            <div className="mb-6 mt-2 flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <UserPlus className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Add New User</h3>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2 shrink-0"></div>
                  {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 ml-1">Full Name</Label>
                <Input 
                  required 
                  placeholder="e.g. John Doe"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 ml-1">Email Address</Label>
                <Input 
                  type="email" 
                  required 
                  placeholder="john@example.com"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 ml-1">Temporary Password</Label>
                <Input 
                  type="password" 
                  required 
                  placeholder="••••••••"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                />
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 ml-1">Role Assignment</Label>
                <select 
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                >
                  <option value="TESTER">Tester</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl mt-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-white shadow-md hover:shadow-lg transition-all border-0" 
                disabled={loading}
              >
                {loading ? 'Provisioning Account...' : 'Create Account'}
              </Button>
            </form>
          </div>
        </div>

        {/* Users Table */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="text-lg font-bold text-slate-800">Active Directory</h3>
              <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 rounded-full px-3 py-1">
                {users.length} Users Total
              </Badge>
            </div>
            
            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="py-4 font-semibold text-slate-600 pl-6">Name</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600">Email</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600">Role</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600 text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                      <TableCell className="font-medium text-slate-800 pl-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-xs">
                             {user.name.charAt(0).toUpperCase()}
                           </div>
                           {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 py-4">{user.email}</TableCell>
                      <TableCell className="py-4">
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell className="text-right pr-6 py-4">
                        {user.role !== 'SUPER_ADMIN' ? (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:bg-red-50 hover:text-red-700 rounded-full h-8 px-3 transition-colors" 
                            onClick={() => handleDelete(user.id)}
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                          </Button>
                        ) : (
                          <span className="text-xs text-slate-400 italic px-3">Protected</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 h-32">
                        No active users found in the system.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;