import fs from 'fs';
import path from 'path';

const files = {
  'src/components/layout/SidebarLayout.jsx': `import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, Users, FolderKanban, Bug, FileSpreadsheet } from 'lucide-react';
import { Button } from '../ui/Button';

export const SidebarLayout = ({ children, links }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 bg-white/80 backdrop-blur-md border-r shadow-sm flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/20">
          <Bug className="h-6 w-6 text-primary mr-2" />
          <span className="font-bold text-lg text-slate-800 tracking-tight">AI BugTracker</span>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => 
                \`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors \${isActive ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}\`
              }
            >
              <link.icon className="h-4 w-4 mr-3" />
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t bg-slate-50/50">
          <div className="flex items-center mb-4 px-2">
            <div className="bg-primary text-white h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.role}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white/60 backdrop-blur-sm border-b flex items-center px-8 sticky top-0 z-10">
          <h1 className="text-xl font-semibold text-slate-800 capitalize">
            {user?.role.replace('_', ' ').toLowerCase()} Portal
          </h1>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};`,

  'src/modules/superAdmin/SuperAdminLayout.jsx': `import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { LayoutDashboard, Users, FolderKanban, FileSpreadsheet } from 'lucide-react';
import DashboardStats from './DashboardStats';
import UserManagement from './UserManagement';
import ProjectManagement from './ProjectManagement';

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
        <Route path="/reports" element={<div className="p-4 bg-white rounded-xl shadow-sm border">Reports functionality coming soon. Check API endpoint for direct download.</div>} />
      </Routes>
    </SidebarLayout>
  );
};

export default SuperAdminLayout;`,

  'src/modules/superAdmin/DashboardStats.jsx': `import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { LayoutDashboard, Users, FolderKanban, Bug } from 'lucide-react';

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

  if (loading) return <div className="animate-pulse">Loading stats...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Overview</h2>
        <p className="text-muted-foreground">Welcome to the super admin dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProjects || 0}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bugs</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBugs || 0}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Bugs</CardTitle>
            <Bug className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats?.openBugs || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;`,

  'src/modules/superAdmin/UserManagement.jsx': `import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

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
        await api.delete(\`/users/\${id}\`);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">User Management</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                {error && <div className="text-sm text-destructive">{error}</div>}
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formData.role} 
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="TESTER">Tester</option>
                    <option value="DEVELOPER">Developer</option>
                  </select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="glass-card h-full">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'SUPER_ADMIN' ? 'default' : user.role === 'DEVELOPER' ? 'secondary' : 'outline'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {user.role !== 'SUPER_ADMIN' && (
                          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(user.id)}>Delete</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No users found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;`,

  'src/modules/superAdmin/ProjectManagement.jsx': `import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ projectName: '', description: '', deploymentUrl: '' });
  
  // Assignment state
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignRole, setAssignRole] = useState('TESTER');

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data.filter(u => u.role !== 'SUPER_ADMIN'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', formData);
      setFormData({ projectName: '', description: '', deploymentUrl: '' });
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  const handleAssignUser = async (e) => {
    e.preventDefault();
    if(!selectedProjectId || !assignUserId) return alert("Select project and user");
    try {
      await api.post(\`/projects/\${selectedProjectId}/assign\`, {
        userId: Number(assignUserId),
        roleInProject: assignRole
      });
      alert('User assigned successfully');
      setSelectedProjectId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign user');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight text-slate-800">Project Management</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Create New Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label>Project Name</Label>
                <Input required value={formData.projectName} onChange={e => setFormData({...formData, projectName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Deployment URL</Label>
                <Input type="url" placeholder="https://..." value={formData.deploymentUrl} onChange={e => setFormData({...formData, deploymentUrl: e.target.value})} />
              </div>
              <Button type="submit" className="w-full">Create Project</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Assign User to Project</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAssignUser} className="space-y-4">
              <div className="space-y-2">
                <Label>Select Project</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedProjectId || ''} 
                  onChange={e => setSelectedProjectId(e.target.value)}
                  required
                >
                  <option value="">-- Select Project --</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label>Select User</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={assignUserId} 
                  onChange={e => setAssignUserId(e.target.value)}
                  required
                >
                  <option value="">-- Select User --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Role in Project</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={assignRole} 
                  onChange={e => setAssignRole(e.target.value)}
                >
                  <option value="TESTER">Tester</option>
                  <option value="DEVELOPER">Developer</option>
                </select>
              </div>

              <Button type="submit" className="w-full" variant="secondary">Assign User</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Deployment URL</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map(project => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.projectName}</TableCell>
                  <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                  <TableCell>
                    {project.deploymentUrl ? (
                      <a href={project.deploymentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">Link</a>
                    ) : '-'}
                  </TableCell>
                  <TableCell><Badge variant="outline">{project.status}</Badge></TableCell>
                </TableRow>
              ))}
              {projects.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground h-24">No projects found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectManagement;`,

  'src/routes/AppRouter.jsx': `import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../modules/auth/Login';
import SuperAdminLayout from '../modules/superAdmin/SuperAdminLayout';

const TesterDashboard = () => <div className="p-8 text-xl font-semibold">Tester Dashboard</div>;
const DeveloperDashboard = () => <div className="p-8 text-xl font-semibold">Developer Dashboard</div>;

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
          <TesterDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/developer/*" element={
        <ProtectedRoute allowedRoles={['DEVELOPER']}>
          <DeveloperDashboard />
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
