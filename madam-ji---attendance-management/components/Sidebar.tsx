
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Role } from '../types';
import { Icons } from './Icons';

interface SidebarProps {
  role: Role;
  onLogout: () => void;
  userName: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, onLogout, userName, darkMode, onToggleDarkMode }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: Icons.Dashboard },
    ...(role === Role.ADMIN || role === Role.TEACHER ? [{ to: '/management', label: 'Management', icon: Icons.Users }] : []),
    ...(role !== Role.STUDENT ? [{ to: '/attendance', label: 'Mark Attendance', icon: Icons.Calendar }] : []),
    { to: '/history', label: role === Role.STUDENT ? 'My History' : 'Records', icon: Icons.History },
  ];

  return (
    <aside className="w-20 md:w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 hidden md:block">
        <div className="flex items-center gap-2 mb-8">
           <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-emerald-200 dark:shadow-none">MJ</div>
           <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">Madam Ji</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4 md:py-0">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5 shrink-0" />
            <span className="hidden md:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t dark:border-gray-800 space-y-2">
        <button
          onClick={onToggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {darkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
          <span className="hidden md:block">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Icons.LogOut className="w-5 h-5" />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
