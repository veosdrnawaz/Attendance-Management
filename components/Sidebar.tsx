import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, PieChart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors mb-1 ${
        isActive(to) 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      {label}
    </Link>
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 hidden md:flex z-10">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900">SmartAttend</span>
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto">
        {user.role === UserRole.SUPER_ADMIN && (
          <>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Super Admin</div>
            <NavItem to="/super-admin" icon={LayoutDashboard} label="Overview" />
            <NavItem to="/super-admin/tenants" icon={Users} label="Institutions" />
            <NavItem to="/super-admin/analytics" icon={PieChart} label="Global Analytics" />
          </>
        )}

        {user.role === UserRole.INSTITUTION_ADMIN && (
          <>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Administration</div>
            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/admin/teachers" icon={Users} label="Teachers" />
            <NavItem to="/admin/students" icon={Users} label="Students" />
            <NavItem to="/admin/reports" icon={PieChart} label="Reports" />
          </>
        )}

        {(user.role === UserRole.TEACHER || user.role === UserRole.INSTITUTION_ADMIN) && (
          <>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-4">Academic</div>
            <NavItem to="/dashboard" icon={BookOpen} label="My Classes" />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4 px-2">
          <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;