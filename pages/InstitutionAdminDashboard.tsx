import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { callBackend } from '../services/api';
import { AnalyticsData, Student, Teacher } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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
       pin: pin // Passed for session verification context in GAS
    });
    if (res.success && res.data) {
      setAnalytics(res.data);
    }
  };

  if (!isAdminUnlocked) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Admin Access</h2>
            <p className="text-gray-500">Enter your 6-digit Security PIN</p>
          </div>
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••"
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Button type="submit" className="w-full" isLoading={loading}>
              Unlock Dashboard
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Principal Dashboard</h1>
      
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-sm">Total Students</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalStudents}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-sm">Active Classes</p>
              <p className="text-3xl font-bold text-gray-900">{analytics.totalClasses}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 text-sm">Avg. Attendance (Today)</p>
              <p className="text-3xl font-bold text-green-600">{analytics.averageAttendance}%</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
             <CardHeader title="Attendance Trends (Last 7 Days)" />
             <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.dates.map((date, i) => ({ date, rate: analytics.attendanceRates[i] }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-20">Loading dashboard data...</div>
      )}

      {/* Admin Actions Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader title="Quick Actions" />
            <CardContent className="space-y-3">
                <Button variant="secondary" className="w-full justify-start">Add New Student</Button>
                <Button variant="secondary" className="w-full justify-start">Assign Teacher to Class</Button>
                <Button variant="secondary" className="w-full justify-start">Export Monthly Report (PDF)</Button>
            </CardContent>
        </Card>
        <Card>
            <CardHeader title="System Status" />
            <CardContent>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Database Connection: Active</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span>Sync Status: Up to date</span>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstitutionAdminDashboard;