import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { callBackend } from '../services/api';
import { AnalyticsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const InstitutionAdminDashboard = () => {
  const { isAdminUnlocked, unlockAdmin, token } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    if (isAdminUnlocked) {
      loadDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminUnlocked]);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const success = await unlockAdmin(pin);
    if (!success) {
      setError('Invalid PIN');
    }
    setLoading(false);
  };

  const loadDashboardData = async () => {
    const res = await callBackend<AnalyticsData>({
       action: 'getInstitutionAnalytics',
       token: token || '',
       pin: pin
    });
    if (res.success && res.data) {
      setAnalytics(res.data);
    }
  };

  if (!isAdminUnlocked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100 via-gray-50 to-white">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
        >
            <Card className="p-8 shadow-2xl">
            <div className="text-center mb-8">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
                <p className="text-gray-500 mt-2">Enter your 6-digit Security PIN to proceed</p>
            </div>
            <form onSubmit={handlePinSubmit} className="space-y-6">
                <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full px-4 py-4 text-center text-3xl tracking-[0.5em] border border-gray-200 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
                placeholder="••••••"
                />
                {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}
                <Button type="submit" variant="gradient" className="w-full h-12 text-lg" isLoading={loading}>
                  Unlock Dashboard
                </Button>
            </form>
            </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Principal Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your institution's performance</p>
      </motion.div>
      
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
              { label: "Total Students", value: analytics.totalStudents, color: "text-indigo-600", bg: "bg-indigo-50" },
              { label: "Active Classes", value: analytics.totalClasses, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Avg. Attendance", value: `${analytics.averageAttendance}%`, color: "text-green-600", bg: "bg-green-50" }
          ].map((item, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
            >
                <Card>
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium uppercase tracking-wider">{item.label}</p>
                            <p className="text-4xl font-extrabold text-gray-900 mt-2">{item.value}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.bg}`}>
                            <div className={`w-3 h-3 rounded-full ${item.color.replace('text', 'bg')}`}></div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
          ))}

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-3"
          >
              <Card>
                <CardHeader title="Attendance Trends (Last 7 Days)" />
                <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dates.map((date, i) => ({ date, rate: analytics.attendanceRates[i] }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                            cursor={{fill: '#f9fafb'}}
                        />
                        <Bar 
                            dataKey="rate" 
                            fill="url(#colorGradient)" 
                            radius={[6, 6, 0, 0]} 
                            barSize={50}
                        />
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>
                    </BarChart>
                    </ResponsiveContainer>
                </CardContent>
              </Card>
          </motion.div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Admin Actions Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card>
                <CardHeader title="Quick Actions" />
                <CardContent className="space-y-4">
                    <Button variant="secondary" className="w-full justify-between group">
                        Add New Student <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Button>
                    <Button variant="secondary" className="w-full justify-between group">
                        Assign Teacher to Class <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Button>
                    <Button variant="secondary" className="w-full justify-between group">
                        Export Monthly Report (PDF) <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <Card>
                <CardHeader title="System Status" />
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center space-x-3">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            <span className="text-sm font-medium text-green-900">Database Connection</span>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-1 rounded">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-center space-x-3">
                            <span className="relative flex h-3 w-3">
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                            </span>
                            <span className="text-sm font-medium text-blue-900">Last Sync</span>
                        </div>
                        <span className="text-xs text-blue-700">Just now</span>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default InstitutionAdminDashboard;