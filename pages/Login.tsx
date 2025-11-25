import React, { useEffect } from 'react';
import { GOOGLE_CLIENT_ID } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { motion } from 'framer-motion';

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
      else navigate('/dashboard'); // Fallback
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
        { theme: 'outline', size: 'large', width: '320', shape: 'pill' }
      );
    }
  }, [login]);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900 justify-center items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 opacity-90 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center"></div>
        
        {/* Animated Shapes */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob z-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000 z-20"></div>

        <div className="relative z-30 p-12 text-white max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 bg-white/10 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <span className="text-3xl font-bold">S</span>
            </div>
            <h1 className="text-5xl font-bold mb-6">Attendance made simple.</h1>
            <p className="text-indigo-200 text-xl leading-relaxed">
              Empower your institution with real-time tracking, insights, and seamless Google integration.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full glass bg-white/80 p-10 rounded-3xl shadow-xl border border-white/50"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Sign in to your dashboard</p>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                 <p className="text-indigo-600 font-medium animate-pulse">Verifying credentials...</p>
              </div>
            ) : (
              <div className="flex justify-center transform transition-transform hover:scale-105 duration-200">
                <div id="googleSignInDiv"></div>
              </div>
            )}
            
            <div className="relative flex py-5 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-widest">Secured by Google</span>
                <div className="flex-grow border-t border-gray-200"></div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>By signing in, you agree to our <a href="#" className="underline hover:text-indigo-600">Terms</a> and <a href="#" className="underline hover:text-indigo-600">Privacy Policy</a>.</p>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>© 2024 Smart Attendance Manager.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;