import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { LayoutDashboard, Bug, FileSpreadsheet } from 'lucide-react';
import DeveloperDashboard from './DeveloperDashboard';
import BugTracker from './BugTracker';
import ReportsPage from '../report/ReportsPage';

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
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </SidebarLayout>
  );
};

export default DeveloperLayout;