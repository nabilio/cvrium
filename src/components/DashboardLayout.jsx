import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, LayoutDashboard, FileText, Users, Brain, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardLayout = ({ children, user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FileText className="w-5 h-5" />, label: 'Mes CV', path: '/dashboard' },
    { icon: <Users className="w-5 h-5" />, label: 'Recommandations', path: '/recommendations' },
  ];

  return (
    <div className="min-h-screen flex">
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-64 glass-effect border-r border-white/10 p-6 flex flex-col"
      >
        <div className="flex items-center gap-2 mb-8">
          <Sparkles className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-bold gradient-text">CV Generator</span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                location.pathname === item.path
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-white/5 text-gray-300'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4 mt-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <span className="text-sm font-bold">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full border-white/20 hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" /> Déconnexion
          </Button>
        </div>
      </motion.aside>

      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;