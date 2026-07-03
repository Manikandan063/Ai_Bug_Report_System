import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarLayout } from '../../components/layout/SidebarLayout';
import { LayoutDashboard, Bug, FileSpreadsheet } from 'lucide-react';
import TesterDashboard from './TesterDashboard';
import AiBugReport from './AiBugReport';
import ReportsPage from '../report/ReportsPage';

const TesterLayout = () => {
  const links = [
    { to: '/tester', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/tester/ai-bug-report', label: 'AI Bug Reporter', icon: Bug },
    { to: '/tester/reports', label: 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <SidebarLayout links={links}>
      <Routes>
        <Route path="/" element={<TesterDashboard />} />
        <Route path="/ai-bug-report" element={<AiBugReport />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Routes>
    </SidebarLayout>
  );
};

export default TesterLayout;