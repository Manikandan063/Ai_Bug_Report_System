import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../modules/auth/Login';
import SuperAdminLayout from '../modules/superAdmin/SuperAdminLayout';
import TesterLayout from '../modules/tester/TesterLayout';
import DeveloperLayout from '../modules/developer/DeveloperLayout';

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
          <TesterLayout />
        </ProtectedRoute>
      } />
      
      <Route path="/developer/*" element={
        <ProtectedRoute allowedRoles={['DEVELOPER']}>
          <DeveloperLayout />
        </ProtectedRoute>
      } />
    </Routes>
  );
};

export default AppRouter;