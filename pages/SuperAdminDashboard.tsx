import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { callBackend } from '../services/api';
import { Tenant } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const SuperAdminDashboard = () => {
  const { token } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadTenants = async () => {
    setLoading(true);
    const res = await callBackend<Tenant[]>({
      action: 'getAllTenants',
      token: token || ''
    });
    if (res.success && res.data) {
      setTenants(res.data);
    }
    setLoading(false);
  };

  const handleCreateTenant = async () => {
    const name = prompt("Enter Institution Name:");
    const email = prompt("Enter Admin Email:");
    if (!name || !email) return;

    setLoading(true);
    const res = await callBackend({
        action: 'createTenant',
        token: token || '',
        payload: { name, email, plan: 'PRO' }
    });

    if (res.success) {
        alert("Institution created! Initial Setup Email sent.");
        loadTenants();
    } else {
        alert("Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">SaaS Overview</h1>
        <Button onClick={handleCreateTenant}>+ Onboard New Institution</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardContent className="pt-6">
                <p className="text-gray-500 text-sm">Total Institutions</p>
                <p className="text-3xl font-bold text-gray-900">{tenants.length}</p>
            </CardContent>
        </Card>
        <Card>
            <CardContent className="pt-6">
                <p className="text-gray-500 text-sm">Active Subscriptions</p>
                <p className="text-3xl font-bold text-green-600">{tenants.filter(t => t.plan !== 'FREE').length}</p>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Institution Management" />
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                    <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
                ) : tenants.map((tenant) => (
                  <tr key={tenant.tenantId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tenant.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tenant.adminEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">{tenant.plan}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.isActive ? 'Active' : 'Suspended'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;