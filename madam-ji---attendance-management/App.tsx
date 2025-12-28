
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Role, User, AppState, Student } from './types';
import { getStore, saveStore, logActivity } from './services/storage';
import { Icons } from './components/Icons';

// Components
import Splash from './components/Splash';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Management from './components/Management';
import AttendanceTracker from './components/AttendanceTracker';
import AttendanceHistory from './components/AttendanceHistory';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [store, setStore] = useState<AppState>(getStore());
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    logActivity(user.id, `Logged In`);
  };

  const handleLogout = () => {
    if (currentUser) {
      logActivity(currentUser.id, `Logged Out`);
      setCurrentUser(null);
    }
  };

  const updateStore = (updater: (prev: AppState) => AppState) => {
    const newState = updater(store);
    setStore(newState);
    saveStore(newState);
  };

  if (showSplash) {
    return <Splash />;
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
        {/* Sidebar */}
        <Sidebar 
          role={currentUser.role} 
          onLogout={handleLogout} 
          userName={currentUser.name} 
          darkMode={darkMode} 
          onToggleDarkMode={() => setDarkMode(!darkMode)} 
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Madam Ji</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, {currentUser.name} ({currentUser.role})</p>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="relative group">
                 <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative">
                    <Icons.Bell className="w-6 h-6" />
                    {store.notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                    )}
                 </button>
                 <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto p-3">
                   <h3 className="font-semibold mb-2 border-b dark:border-gray-700 pb-1">Notifications</h3>
                   <div className="max-h-48 overflow-y-auto space-y-2">
                     {store.notifications.map((n, i) => (
                       <p key={i} className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 p-2 rounded">{n}</p>
                     ))}
                   </div>
                 </div>
               </div>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard store={store} currentUser={currentUser} />} />
            
            {/* Admin & Teacher can access management (Teachers only for students) */}
            {(currentUser.role === Role.ADMIN || currentUser.role === Role.TEACHER) && (
              <Route path="/management" element={<Management store={store} updateStore={updateStore} currentUser={currentUser} />} />
            )}

            {/* Admin & Teacher */}
            {(currentUser.role === Role.ADMIN || currentUser.role === Role.TEACHER) && (
              <>
                <Route path="/attendance" element={<AttendanceTracker store={store} updateStore={updateStore} currentUser={currentUser} />} />
                <Route path="/history" element={<AttendanceHistory store={store} currentUser={currentUser} />} />
              </>
            )}

            {/* Student access to history */}
            {currentUser.role === Role.STUDENT && (
               <Route path="/history" element={<AttendanceHistory store={store} currentUser={currentUser} />} />
            )}

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
