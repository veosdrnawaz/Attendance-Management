import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Shield, Zap, BarChart, Users, ChevronRight, Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '../components/ui/Button';

const Landing = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  
  const [textIndex, setTextIndex] = useState(0);
  const words = ["Education", "Universities", "Madaris", "Academies"];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 transition-all duration-300 glass bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              SmartAttend
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:flex">Log In</Button>
            </Link>
            <Link to="/login">
              <Button variant="gradient">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold mb-6 shadow-sm">
              ✨ The Future of Academic Management
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Attendance Management <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Reimagined for
              </span>{" "}
              <motion.span 
                key={textIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="inline-block text-indigo-600 underline decoration-indigo-300 decoration-4 underline-offset-8"
              >
                {words[textIndex]}
              </motion.span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
              A powerful, multi-tenant solution allowing you to track attendance, generate insightful reports, and manage your institution with the reliability of Google Cloud.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/login">
                <Button variant="gradient" className="px-8 py-4 text-lg h-14 w-full sm:w-auto">
                  Start Free Trial <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="secondary" className="px-8 py-4 text-lg h-14 w-full sm:w-auto">
                <Play className="mr-2 w-5 h-5 fill-current" /> Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Floating UI Elements Mockup */}
          <div className="mt-20 relative">
             <motion.div style={{ y: y1 }} className="absolute -left-10 md:left-20 top-10 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-20 hidden md:block">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                     <CheckCircle size={20} />
                   </div>
                   <div>
                     <p className="font-bold text-gray-900">Marked Present</p>
                     <p className="text-xs text-gray-500">Just now</p>
                   </div>
                </div>
             </motion.div>
             
             <motion.div style={{ y: y2 }} className="absolute -right-10 md:right-20 bottom-20 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 z-20 hidden md:block">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                     <BarChart size={20} />
                   </div>
                   <div>
                     <p className="font-bold text-gray-900">Attendance: 98%</p>
                     <p className="text-xs text-gray-500">Weekly Report</p>
                   </div>
                </div>
             </motion.div>

             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="relative mx-auto max-w-5xl rounded-2xl glass p-2 shadow-2xl bg-white/50 ring-1 ring-gray-900/10"
             >
                <div className="rounded-xl overflow-hidden bg-white aspect-[16/9] flex items-center justify-center border border-gray-200">
                   <div className="text-center">
                     <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-indigo-600 w-10 h-10" />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-300">Dashboard Preview</h3>
                   </div>
                </div>
             </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
             {[
               { label: "Active Institutions", value: "500+" },
               { label: "Students Tracked", value: "50k+" },
               { label: "Attendance Records", value: "1M+" },
               { label: "Uptime", value: "99.9%" }
             ].map((stat, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="p-4"
               >
                 <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">{stat.value}</div>
                 <div className="text-gray-500 font-medium">{stat.label}</div>
               </motion.div>
             ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-600 font-semibold tracking-wide uppercase text-sm mb-2">Features</h2>
            <h3 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need to manage your institution
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: Shield, 
                title: "Google Integration", 
                desc: "Seamlessly integrated with Google Sheets and Drive. Your data belongs to you, always secure.",
                color: "bg-blue-100 text-blue-600"
              },
              { 
                icon: Zap, 
                title: "Real-time Insights", 
                desc: "Principals get live dashboards. Know exactly who is present, absent, or late instantly.",
                color: "bg-yellow-100 text-yellow-600"
              },
              { 
                icon: Users, 
                title: "Multi-Tenant Support", 
                desc: "Manage multiple branches or institutions from a single super-admin panel with ease.",
                color: "bg-purple-100 text-purple-600"
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 hover:border-indigo-100 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon size={28} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-500 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to digitize your campus?</h2>
              <p className="text-indigo-100 text-xl mb-10 max-w-2xl mx-auto">
                Join hundreds of forward-thinking institutions using SmartAttend to save time and improve accountability.
              </p>
              <Link to="/login">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-indigo-600 px-10 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Get Started for Free
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex justify-center items-center gap-2 mb-8">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">SmartAttend</span>
            </div>
            <p className="text-gray-400 mb-8">&copy; 2024 Smart Attendance Manager. Built with React & Google Apps Script.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;