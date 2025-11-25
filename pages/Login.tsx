import React, { useEffect } from 'react';
import { GOOGLE_CLIENT_ID } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

const Login = () => {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === UserRole.SUPER_ADMIN) navigate('/super-admin');
      else if (user.role === UserRole.INSTITUTION_ADMIN) navigate('/admin');
      else if (user.role === UserRole.TEACHER) navigate('/dashboard');
      else navigate('/dashboard'); // Fallback/Guest
    }
  }, [user, navigate]);

  useEffect(() => {
    /* Initialize Google Sign-In */
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: login,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInDiv'),
        { theme: 'outline', size: 'large', width: 280 }
      );
    }
  }, [login]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
             <span className="text-white text-3xl font-bold">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="mt-2 text-gray-600">Smart Attendance Manager</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div id="googleSignInDiv"></div>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-sm">
        <p>© 2024 Smart Attendance Manager. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Login;