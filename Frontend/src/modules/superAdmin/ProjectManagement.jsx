import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { X, FolderKanban, ExternalLink, Edit2, Trash2, ShieldAlert, Plus, Users } from 'lucide-react';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    deploymentUrl: '',
    status: 'ACTIVE',
    testingTeamMembers: [],
    developerTeamMembers: []
  });
  
  const [editingProjectId, setEditingProjectId] = useState(null);

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  const ensureAbsoluteUrl = (url) => {
    if (!url) return '#';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  };

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

  const handleSelectUser = (type, userId) => {
    if (!userId) return;
    const id = Number(userId);
    if (!formData[type].includes(id)) {
      setFormData(prev => ({ ...prev, [type]: [...prev[type], id] }));
    }
  };

  const handleRemoveUser = (type, userId) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(id => id !== userId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProjectId) {
        await api.put(`/projects/${editingProjectId}`, formData);
        alert('Project updated successfully');
      } else {
        await api.post('/projects', formData);
        alert('Project created successfully');
      }
      setFormData({
        projectName: '',
        description: '',
        deploymentUrl: '',
        status: 'ACTIVE',
        testingTeamMembers: [],
        developerTeamMembers: []
      });
      setEditingProjectId(null);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleEdit = (project) => {
    setEditingProjectId(project.id);
    
    const testers = project.assignments?.filter(a => a.roleInProject === 'TESTER').map(a => a.userId) || [];
    const devs = project.assignments?.filter(a => a.roleInProject === 'DEVELOPER').map(a => a.userId) || [];

    setFormData({
      projectName: project.projectName,
      description: project.description || '',
      deploymentUrl: project.deploymentUrl || '',
      status: project.status || 'ACTIVE',
      testingTeamMembers: testers,
      developerTeamMembers: devs
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProjectId(null);
    setFormData({
      projectName: '',
      description: '',
      deploymentUrl: '',
      status: 'ACTIVE',
      testingTeamMembers: [],
      developerTeamMembers: []
    });
  };

  const testersAvailable = users.filter(u => u.role === 'TESTER');
  const developersAvailable = users.filter(u => u.role === 'DEVELOPER');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center justify-center p-3 bg-purple-50 w-14 h-14 rounded-2xl mb-2">
           <FolderKanban className="h-6 w-6 text-purple-600" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Project Management
        </h2>
        <p className="text-slate-500 text-base">Create and manage projects, deployments, and assign cross-functional teams.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Form Column */}
        <div className="xl:col-span-1 space-y-6">
          <div className={`bg-white/80 backdrop-blur-xl border ${editingProjectId ? 'border-amber-300 shadow-amber-500/10' : 'border-slate-200'} shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-6 md:p-8 relative overflow-hidden transition-all duration-300`}>
            
            <div className={`absolute top-0 left-0 w-full h-1.5 ${editingProjectId ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}></div>
            
            <div className="mb-6 mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${editingProjectId ? 'bg-amber-50 text-amber-600' : 'bg-purple-50 text-purple-600'}`}>
                  {editingProjectId ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingProjectId ? 'Edit Project' : 'Create Project'}
                </h3>
              </div>
              {editingProjectId && (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">Editing Mode</Badge>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 ml-1">Project Name <span className="text-red-500">*</span></Label>
                <Input 
                  required 
                  placeholder="e.g. NextGen CRM"
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.projectName} 
                  onChange={e => setFormData({...formData, projectName: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 ml-1">Deployment URL <span className="text-red-500">*</span></Label>
                <Input 
                  type="url" 
                  required 
                  placeholder="https://..." 
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.deploymentUrl} 
                  onChange={e => setFormData({...formData, deploymentUrl: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 ml-1">Description</Label>
                <Input 
                  placeholder="Optional brief overview..."
                  className="h-12 rounded-xl border-slate-200 bg-slate-50 px-4 focus:border-indigo-500 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700 ml-1">Project Status</Label>
                <select 
                  className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="ACTIVE">Active Deployment</option>
                  <option value="INACTIVE">Inactive / Paused</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>

              {/* Team Assignments */}
              <div className="pt-6 border-t border-slate-100 space-y-6">
                
                {/* Testers */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between items-center">
                    <span>Testing Team <span className="text-red-500">*</span></span>
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-0">{formData.testingTeamMembers.length} Assigned</Badge>
                  </Label>
                  <select 
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    onChange={e => handleSelectUser('testingTeamMembers', e.target.value)}
                    value=""
                  >
                    <option value="">-- Add Tester --</option>
                    {testersAvailable.map(u => (
                      <option key={u.id} value={u.id} disabled={formData.testingTeamMembers.includes(u.id)}>
                        {u.name} {formData.testingTeamMembers.includes(u.id) ? '(Added)' : ''}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.testingTeamMembers.map(id => {
                      const user = users.find(u => u.id === id);
                      return user ? (
                        <Badge key={id} variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0 flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg">
                          {user.name}
                          <div onClick={() => handleRemoveUser('testingTeamMembers', id)} className="bg-emerald-200/50 hover:bg-emerald-300 rounded-md p-0.5 cursor-pointer transition-colors">
                            <X className="h-3 w-3" />
                          </div>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>

                {/* Developers */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 ml-1 flex justify-between items-center">
                    <span>Developer Team <span className="text-red-500">*</span></span>
                    <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-0">{formData.developerTeamMembers.length} Assigned</Badge>
                  </Label>
                  <select 
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                    onChange={e => handleSelectUser('developerTeamMembers', e.target.value)}
                    value=""
                  >
                    <option value="">-- Add Developer --</option>
                    {developersAvailable.map(u => (
                      <option key={u.id} value={u.id} disabled={formData.developerTeamMembers.includes(u.id)}>
                        {u.name} {formData.developerTeamMembers.includes(u.id) ? '(Added)' : ''}
                      </option>
                    ))}
                  </select>
                  
                  <div className="flex flex-wrap gap-2">
                    {formData.developerTeamMembers.map(id => {
                      const user = users.find(u => u.id === id);
                      return user ? (
                        <Badge key={id} variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0 flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg">
                          {user.name}
                          <div onClick={() => handleRemoveUser('developerTeamMembers', id)} className="bg-blue-200/50 hover:bg-blue-300 rounded-md p-0.5 cursor-pointer transition-colors">
                            <X className="h-3 w-3" />
                          </div>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-4">
                <Button 
                  type="submit" 
                  className={`flex-1 h-12 rounded-xl shadow-md hover:shadow-lg transition-all border-0 text-white font-semibold ${
                    editingProjectId 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90' 
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90'
                  }`}
                >
                  {editingProjectId ? 'Save Changes' : 'Create Project'}
                </Button>
                {editingProjectId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    className="h-12 rounded-xl border-slate-200 hover:bg-slate-100 text-slate-600 px-6 font-semibold"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Table Column */}
        <div className="xl:col-span-2">
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] h-full overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/50">
              <h3 className="text-lg font-bold text-slate-800">Deployed Projects Portfolio</h3>
              <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-200 rounded-full px-3 py-1">
                {projects.length} Active
              </Badge>
            </div>

            <div className="overflow-x-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                    <TableHead className="py-4 font-semibold text-slate-600 pl-6">Project Title</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600">Access Link</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600 text-center">Team Size</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600">Status</TableHead>
                    <TableHead className="py-4 font-semibold text-slate-600 text-right pr-6">Manage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map(project => {
                    const testersCount = project.assignments?.filter(a => a.roleInProject === 'TESTER').length || 0;
                    const devsCount = project.assignments?.filter(a => a.roleInProject === 'DEVELOPER').length || 0;
                    
                    return (
                      <TableRow key={project.id} className="hover:bg-slate-50/80 transition-colors border-slate-100">
                        <TableCell className="font-bold text-slate-800 pl-6 py-4">{project.projectName}</TableCell>
                        <TableCell className="py-4">
                          {project.deploymentUrl ? (
                            <a 
                              href={ensureAbsoluteUrl(project.deploymentUrl)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> Launch
                            </a>
                          ) : (
                            <span className="text-slate-400 italic text-sm">No URL</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 text-center">
                          <div className="flex justify-center gap-1.5">
                            <Badge variant="outline" title={`${testersCount} Testers`} className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold px-2">
                              T: {testersCount}
                            </Badge>
                            <Badge variant="outline" title={`${devsCount} Developers`} className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-2">
                              D: {devsCount}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge 
                            variant="outline" 
                            className={`px-2.5 py-0.5 rounded-full border-0 font-bold tracking-wide text-[10px] ${
                              project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                              project.status === 'INACTIVE' ? 'bg-slate-100 text-slate-600' : 
                              'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors"
                              onClick={() => handleEdit(project)}
                              title="Edit Project"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" 
                              onClick={() => handleDelete(project.id)}
                              title="Delete Project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {projects.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-slate-500 py-16">
                        <div className="flex flex-col items-center justify-center">
                          <ShieldAlert className="h-8 w-8 text-slate-300 mb-3" />
                          <p>No projects created yet. Use the form to start.</p>
                        </div>
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

export default ProjectManagement;