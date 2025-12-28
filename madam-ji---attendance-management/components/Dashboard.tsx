
import React, { useState, useEffect } from 'react';
import { AppState, User, Role } from '../types';
import { Icons } from './Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { getAttendanceInsights } from '../services/gemini';

interface DashboardProps {
  store: AppState;
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ store, currentUser }) => {
  const [insights, setInsights] = useState<string>("Analyzing current data...");
  const [loadingInsights, setLoadingInsights] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoadingInsights(true);
      const text = await getAttendanceInsights(store);
      setInsights(text);
      setLoadingInsights(false);
    };
    fetchInsights();
  }, [store]);

  // Aggregate data for charts
  const classAttendanceData = React.useMemo(() => {
    const classes = Array.from(new Set(store.students.map(s => s.className)));
    return classes.map(cls => {
      const classAttendance = store.attendance.filter(a => a.className === cls);
      const present = classAttendance.filter(a => a.status === 'PRESENT').length;
      const total = classAttendance.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return { name: cls, percentage };
    });
  }, [store]);

  const overallStats = [
    { label: 'Total Students', value: store.students.length, icon: Icons.Users, color: 'bg-blue-500' },
    { label: 'Classes Tracked', value: classAttendanceData.length, icon: Icons.Calendar, color: 'bg-emerald-500' },
    { label: 'Total Records', value: store.attendance.length, icon: Icons.History, color: 'bg-purple-500' },
    { label: 'System Health', value: 'Excellent', icon: Icons.Zap, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overallStats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-lg">Class-wise Attendance %</h3>
             <Icons.Calendar className="text-gray-400 w-5 h-5" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="percentage" radius={[4, 4, 0, 0]} barSize={40}>
                  {classAttendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percentage > 75 ? '#10b981' : entry.percentage > 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights Card */}
        <div className="bg-emerald-600 p-6 rounded-2xl shadow-xl text-white flex flex-col relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20">
             <Icons.Insights className="w-32 h-32 rotate-12" />
           </div>
           <div className="relative z-10 flex flex-col h-full">
             <div className="flex items-center gap-2 mb-4">
                <Icons.Insights className="w-5 h-5" />
                <h3 className="font-bold">Madam Ji AI Insights</h3>
             </div>
             <div className="flex-1 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                {loadingInsights ? (
                  <div className="space-y-3">
                    <div className="h-2 bg-white/20 rounded animate-pulse"></div>
                    <div className="h-2 bg-white/20 rounded animate-pulse w-3/4"></div>
                    <div className="h-2 bg-white/20 rounded animate-pulse w-1/2"></div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed text-emerald-50 italic">
                    "{insights}"
                  </p>
                )}
             </div>
             <button className="mt-4 text-xs font-bold uppercase tracking-widest hover:underline text-white flex items-center gap-1">
               Refine Analysis <Icons.ChevronRight className="w-3 h-3" />
             </button>
           </div>
        </div>
      </div>

      {/* Recent Logs (Admin only) */}
      {currentUser.role === Role.ADMIN && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
           <h3 className="font-bold text-lg mb-4">Activity Logs</h3>
           <div className="space-y-4">
             {store.logs.slice(0, 5).map(log => (
               <div key={log.id} className="flex items-center justify-between text-sm py-2 border-b dark:border-gray-700 last:border-0">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="font-medium text-gray-700 dark:text-gray-200">{log.action}</span>
                 </div>
                 <span className="text-gray-400 text-xs">{new Date(log.timestamp).toLocaleTimeString()}</span>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
