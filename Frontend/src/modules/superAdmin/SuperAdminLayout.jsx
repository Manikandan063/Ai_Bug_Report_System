import React from 'react';
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

export default SuperAdminLayout;