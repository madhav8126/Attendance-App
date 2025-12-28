
import React, { useState, useMemo } from 'react';
import { AppState, User, Role, Student, AttendanceRecord } from '../types';
import { Icons } from './Icons';
import { CLASSES } from '../constants';

interface AttendanceTrackerProps {
  store: AppState;
  updateStore: (updater: (prev: AppState) => AppState) => void;
  currentUser: User;
}

const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({ store, updateStore, currentUser }) => {
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMarks, setCurrentMarks] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE'>>({});

  const filteredStudents = useMemo(() => {
    return store.students.filter(s => s.className === selectedClass);
  }, [store.students, selectedClass]);

  const handleMark = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    setCurrentMarks(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSave = () => {
    const newRecords: AttendanceRecord[] = filteredStudents.map(student => ({
      id: Math.random().toString(36).substr(2, 9),
      studentId: student.id,
      className: selectedClass,
      date,
      status: currentMarks[student.id] || 'ABSENT',
      markedBy: currentUser.id
    }));

    updateStore(prev => {
      // Filter out existing records for same class/date to avoid duplicates
      const others = prev.attendance.filter(a => !(a.className === selectedClass && a.date === date));
      return {
        ...prev,
        attendance: [...others, ...newRecords],
        logs: [{ id: Date.now().toString(), userId: currentUser.id, action: `Marked Attendance for ${selectedClass} on ${date}`, timestamp: new Date().toISOString() }, ...prev.logs],
        notifications: [`Attendance for ${selectedClass} submitted!`, ...prev.notifications]
      };
    });
    alert('Attendance saved successfully!');
  };

  const markAll = (status: 'PRESENT' | 'ABSENT' | 'LATE') => {
    const bulk: Record<string, 'PRESENT' | 'ABSENT' | 'LATE'> = {};
    filteredStudents.forEach(s => bulk[s.id] = status);
    setCurrentMarks(bulk);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-end gap-4">
        <div className="space-y-1 flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase">Select Class</label>
          <select 
            value={selectedClass} 
            onChange={e => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1 w-full md:w-48">
          <label className="text-xs font-bold text-gray-500 uppercase">Date</label>
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold" 
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => markAll('PRESENT')} className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase hover:bg-emerald-100">All Present</button>
          <button onClick={() => markAll('ABSENT')} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase hover:bg-red-100">All Absent</button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
           <h3 className="font-bold">Student List ({filteredStudents.length})</h3>
           <span className="text-xs text-gray-400 italic">Marking for {new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {filteredStudents.map(student => (
            <div key={student.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/10">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500">{student.rollNo}</div>
                  <div>
                    <h4 className="font-bold">{student.name}</h4>
                    <p className="text-xs text-gray-400">Roll No: {student.rollNo}</p>
                  </div>
               </div>
               
               <div className="flex gap-2">
                 <button 
                   onClick={() => handleMark(student.id, 'PRESENT')}
                   className={`flex-1 sm:w-24 py-2 px-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                     currentMarks[student.id] === 'PRESENT' 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none' 
                      : 'border-gray-100 dark:border-gray-700 text-gray-400'
                   }`}
                 >
                   <Icons.Present className="w-4 h-4" />
                   <span className="text-[10px] font-black">PRESENT</span>
                 </button>
                 <button 
                   onClick={() => handleMark(student.id, 'ABSENT')}
                   className={`flex-1 sm:w-24 py-2 px-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                     currentMarks[student.id] === 'ABSENT' 
                      ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200 dark:shadow-none' 
                      : 'border-gray-100 dark:border-gray-700 text-gray-400'
                   }`}
                 >
                   <Icons.Absent className="w-4 h-4" />
                   <span className="text-[10px] font-black">ABSENT</span>
                 </button>
                 <button 
                   onClick={() => handleMark(student.id, 'LATE')}
                   className={`flex-1 sm:w-24 py-2 px-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                     currentMarks[student.id] === 'LATE' 
                      ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-200 dark:shadow-none' 
                      : 'border-gray-100 dark:border-gray-700 text-gray-400'
                   }`}
                 >
                   <Icons.Late className="w-4 h-4" />
                   <span className="text-[10px] font-black">LATE</span>
                 </button>
               </div>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <div className="p-20 text-center text-gray-400">
               <Icons.Calendar className="w-12 h-12 mx-auto mb-4 opacity-10" />
               <p>No students found in this class.</p>
            </div>
          )}
        </div>
        
        {filteredStudents.length > 0 && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
            <button 
              onClick={handleSave}
              className="px-12 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 transform active:scale-95 transition-all flex items-center gap-3"
            >
              <Icons.History className="w-5 h-5" />
              SUBMIT ATTENDANCE
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTracker;
