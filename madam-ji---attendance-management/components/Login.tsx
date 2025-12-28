
import React, { useState } from 'react';
import { Role, User } from '../types';
import { getStore } from '../services/storage';
import { Icons } from './Icons';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState<Role>(Role.TEACHER);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const store = getStore();
    
    // Students login via rollNo as username for simplicity in this demo
    if (role === Role.STUDENT) {
      const student = store.students.find(s => s.rollNo === username);
      if (student) {
        onLogin({
          id: student.id,
          username: student.rollNo,
          name: student.name,
          role: Role.STUDENT
        });
        return;
      }
      setError('Student roll number not found');
      return;
    }

    const user = store.users.find(u => u.username === username && u.password === password && u.role === role);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 dark:bg-gray-950 p-6">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 dark:border-emerald-900">
        <div className="bg-emerald-600 p-8 text-center text-white">
          <h2 className="text-3xl font-bold">Madam Ji</h2>
          <p className="mt-2 text-emerald-100">Sign in to manage your attendance</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-800 text-center">
              {error}
            </div>
          )}

          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
             {[Role.ADMIN, Role.TEACHER, Role.STUDENT].map((r) => (
               <button
                 key={r}
                 type="button"
                 onClick={() => setRole(r)}
                 className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                   role === r 
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                 }`}
               >
                 {r}
               </button>
             ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {role === Role.STUDENT ? 'Roll Number' : 'Username'}
              </label>
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder={role === Role.STUDENT ? "Enter Roll No" : "Enter Username"}
                />
              </div>
            </div>

            {role !== Role.STUDENT && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Enter Password"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
          >
            <span>Login</span>
            <Icons.ChevronRight className="w-5 h-5" />
          </button>

          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Demo Admin: admin / admin123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
