import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">SmartAttend</span>
        </div>
        <Link to="/login" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Login
        </Link>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight sm:text-6xl mb-6">
            Attendance Management <br/>
            <span className="text-indigo-600">Reimagined for Education</span>
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            A powerful, multi-tenant solution for Universities, Madaris, and Academies. 
            Track attendance, generate reports, and manage your institution with Google's reliability.
        </p>
        <div className="flex justify-center gap-4">
            <Link to="/login" className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition">
                Get Started
            </Link>
            <button className="px-8 py-3 bg-white text-gray-700 border border-gray-300 rounded-xl text-lg font-semibold hover:bg-gray-50 transition">
                View Demo
            </button>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                        <CheckCircle />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Google Integration</h3>
                    <p className="text-gray-500">
                        Seamlessly integrated with Google Sheets and Drive. All your data belongs to you, secure and accessible.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                        <CheckCircle />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Real-time Insights</h3>
                    <p className="text-gray-500">
                        Principals get real-time dashboards. Know exactly who is present, absent, or late instantly.
                    </p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-sm">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-6">
                        <CheckCircle />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Secure & Scalable</h3>
                    <p className="text-gray-500">
                        PIN-protected admin panels and role-based access control ensure your data remains secure.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-12 text-center text-gray-400">
          <p>&copy; 2024 Smart Attendance Manager. Built with React & Google Apps Script.</p>
      </footer>
    </div>
  );
};

export default Landing;