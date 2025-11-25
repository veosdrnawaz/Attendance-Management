import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Landing from './pages/Landing';
import TeacherDashboard from './pages/TeacherDashboard';
import InstitutionAdminDashboard from './pages/InstitutionAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TeacherManagement from './pages/admin/TeacherManagement';
import StudentManagement from './pages/admin/StudentManagement';
import { UserRole } from './types';

// Layout wrapper for authenticated pages
const DashboardLayout = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-4 md:p-0">
        <Outlet />
      </main>
    </div>
  );
};

const PrivateRoute = ({ allowedRoles }: { allowedRoles: UserRole[] }) => {
  const { user } = useAuth();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<DashboardLayout />}>
            {/* Teacher Routes */}
            <Route element={<PrivateRoute allowedRoles={[UserRole.TEACHER, UserRole.INSTITUTION_ADMIN]} />}>
              <Route path="/dashboard" element={<TeacherDashboard />} />
            </Route>

            {/* Institution Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={[UserRole.INSTITUTION_ADMIN]} />}>
              <Route path="/admin" element={<InstitutionAdminDashboard />} />
              <Route path="/admin/reports" element={<div>Reports Placeholder</div>} />
              <Route path="/admin/teachers" element={<TeacherManagement />} />
              <Route path="/admin/students" element={<StudentManagement />} />
            </Route>

            {/* Super Admin Routes */}
            <Route element={<PrivateRoute allowedRoles={[UserRole.SUPER_ADMIN]} />}>
              <Route path="/super-admin" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/tenants" element={<SuperAdminDashboard />} />
              <Route path="/super-admin/analytics" element={<div>Global Analytics Placeholder</div>} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
