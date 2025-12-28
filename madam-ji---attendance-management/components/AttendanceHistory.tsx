
import React, { useState, useMemo } from 'react';
import { AppState, User, Role } from '../types';
import { Icons } from './Icons';
import { CLASSES } from '../constants';

interface AttendanceHistoryProps {
  store: AppState;
  currentUser: User;
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ store, currentUser }) => {
  const [filterClass, setFilterClass] = useState(CLASSES[0]);
  const [filterDate, setFilterDate] = useState('');

  const records = useMemo(() => {
    let base = store.attendance;
    
    // Students only see their own history
    if (currentUser.role === Role.STUDENT) {
      base = base.filter(a => a.studentId === currentUser.id);
    } else {
      if (filterClass) base = base.filter(a => a.className === filterClass);
      if (filterDate) base = base.filter(a => a.date === filterDate);
    }
    
    return base.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [store.attendance, filterClass, filterDate, currentUser]);

  const exportToCSV = () => {
    const headers = ['Date', 'Student Name', 'Roll No', 'Class', 'Status'];
    const rows = records.map(r => {
      const student = store.students.find(s => s.id === r.studentId);
      return [
        r.date,
        student?.name || 'Unknown',
        student?.rollNo || '-',
        r.className,
        r.status
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">Attendance Records</h2>
        {(currentUser.role === Role.ADMIN || currentUser.role === Role.TEACHER) && (
          <button 
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold text-sm"
          >
            <Icons.Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {currentUser.role !== Role.STUDENT && (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4">
           <div className="flex-1">
             <label className="text-[10px] font-black text-gray-400 uppercase">Class Filter</label>
             <select 
               value={filterClass} 
               onChange={e => setFilterClass(e.target.value)}
               className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg outline-none font-bold text-sm"
             >
               <option value="">All Classes</option>
               {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
           </div>
           <div className="flex-1">
             <label className="text-[10px] font-black text-gray-400 uppercase">Date Filter</label>
             <input 
               type="date" 
               value={filterDate} 
               onChange={e => setFilterDate(e.target.value)}
               className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg outline-none font-bold text-sm"
             />
           </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-[10px] font-black uppercase tracking-widest border-b dark:border-gray-700">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {records.map(r => {
                const student = store.students.find(s => s.id === r.studentId);
                return (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{r.date}</td>
                    <td className="px-6 py-4">
                       <div className="text-sm font-bold">{student?.name || 'Deleted Student'}</div>
                       <div className="text-[10px] text-gray-400">Roll No: {student?.rollNo || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{r.className}</td>
                    <td className="px-6 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                         r.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                         r.status === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                         'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                       }`}>
                         {r.status}
                       </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {records.length === 0 && (
             <div className="p-20 text-center text-gray-400">
                <Icons.History className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p>No records found for the selected filters.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistory;
