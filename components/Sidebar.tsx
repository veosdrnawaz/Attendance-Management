import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { LayoutDashboard, Users, BookOpen, Settings, LogOut, PieChart, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
    <Link to={to}>
      <motion.div
        whileHover={{ x: 5 }}
        className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all mb-2 ${
          isActive(to) 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
            : 'text-gray-600 hover:bg-gray-100/80 hover:text-indigo-600'
        }`}
      >
        <Icon className={`w-5 h-5 mr-3 ${isActive(to) ? 'text-white' : 'text-gray-400'}`} />
        {label}
        {isActive(to) && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
      </motion.div>
    </Link>
  );

  return (
    <aside className="w-64 glass bg-white/80 border-r border-gray-200/50 h-screen flex flex-col fixed left-0 top-0 hidden md:flex z-30 backdrop-blur-xl">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <span className="text-lg font-bold text-gray-900 tracking-tight">SmartAttend</span>
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto space-y-6">
        {user.role === UserRole.SUPER_ADMIN && (
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">Super Admin</div>
            <NavItem to="/super-admin" icon={LayoutDashboard} label="Overview" />
            <NavItem to="/super-admin/tenants" icon={Users} label="Institutions" />
            <NavItem to="/super-admin/analytics" icon={PieChart} label="Global Analytics" />
          </div>
        )}

        {user.role === UserRole.INSTITUTION_ADMIN && (
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">Administration</div>
            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/admin/teachers" icon={Users} label="Teachers" />
            <NavItem to="/admin/students" icon={Users} label="Students" />
            <NavItem to="/admin/reports" icon={PieChart} label="Reports" />
          </div>
        )}

        {(user.role === UserRole.TEACHER || user.role === UserRole.INSTITUTION_ADMIN) && (
          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-4">Academic</div>
            <NavItem to="/dashboard" icon={BookOpen} label="My Classes" />
          </div>
        )}
      </nav>

      <div className="p-4 m-4 rounded-2xl bg-gray-50 border border-gray-100">
        <div className="flex items-center mb-4">
          <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full mr-3 border-2 border-white shadow-sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;