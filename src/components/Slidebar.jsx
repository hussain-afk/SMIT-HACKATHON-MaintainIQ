import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import {
  LayoutDashboard,
  Package,
  AlertTriangle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from 'lucide-react';

const slidebarLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/assets', icon: Package, label: 'Assets' },
  { to: '/issues', icon: AlertTriangle, label: 'Issues' },
];

export default function Slidebar() {
  const [slidebarCollapsed, setSlidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <aside
      className={`relative flex flex-col h-screen bg-[#1C2541]/60 backdrop-blur-md border-r border-[#3A506B]/40 transition-all duration-300 ease-in-out ${
        slidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Slidebar header */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-[#3A506B]/30">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-[#4CC9F0] to-[#4361EE] flex items-center justify-center shadow-lg shadow-[#4CC9F0]/20">
          <Wrench size={18} className="text-white" />
        </div>
        {!slidebarCollapsed && (
          <span className="text-lg font-bold text-white tracking-wide whitespace-nowrap">
            Maintain<span className="text-[#4CC9F0]">IQ</span>
          </span>
        )}
      </div>

      {/* Slidebar navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {slidebarLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-[#4CC9F0]/20 to-[#4361EE]/10 text-[#4CC9F0] border border-[#4CC9F0]/20 shadow-lg shadow-[#4CC9F0]/5'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {!slidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Slidebar footer - logout */}
      <div className="px-3 py-4 border-t border-[#3A506B]/30">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!slidebarCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Slidebar toggle button */}
      <button
        onClick={() => setSlidebarCollapsed(!slidebarCollapsed)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#1C2541] border border-[#3A506B]/60 flex items-center justify-center text-gray-400 hover:text-[#4CC9F0] hover:border-[#4CC9F0]/40 transition-all duration-200 shadow-md"
      >
        {slidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
}
