
import React, { useState, useRef } from 'react';
import { AppState, Role, User, Student } from '../types';
import { Icons } from './Icons';
import { CLASSES } from '../constants';

interface ManagementProps {
  store: AppState;
  updateStore: (updater: (prev: AppState) => AppState) => void;
  currentUser: User;
}

const Management: React.FC<ManagementProps> = ({ store, updateStore, currentUser }) => {
  const [tab, setTab] = useState<'TEACHERS' | 'STUDENTS'>(currentUser.role === Role.ADMIN ? 'TEACHERS' : 'STUDENTS');
  const [isAdding, setIsAdding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'TEACHERS') {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        username,
        password,
        role: Role.TEACHER,
        assignedClasses: [selectedClass]
      };
      updateStore(prev => ({
        ...prev,
        users: [...prev.users, newUser],
        logs: [{ id: Date.now().toString(), userId: currentUser.id, action: `Added Teacher: ${name}`, timestamp: new Date().toISOString() }, ...prev.logs],
        notifications: [`New Teacher ${name} added!`, ...prev.notifications]
      }));
    } else {
      const newStudent: Student = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        rollNo,
        className: selectedClass
      };
      updateStore(prev => ({
        ...prev,
        students: [...prev.students, newStudent],
        logs: [{ id: Date.now().toString(), userId: currentUser.id, action: `Added Student: ${name}`, timestamp: new Date().toISOString() }, ...prev.logs]
      }));
    }
    resetForm();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newStudents: Student[] = [];
      
      // Assume CSV format: Name, RollNo, Class
      // Skip header if it exists
      const startIdx = lines[0].toLowerCase().includes('name') ? 1 : 0;

      for (let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [importName, importRoll, importClass] = line.split(',').map(s => s.trim());
        if (importName && importRoll && importClass) {
          newStudents.push({
            id: Math.random().toString(36).substr(2, 9),
            name: importName,
            rollNo: importRoll,
            className: importClass
          });
        }
      }

      if (newStudents.length > 0) {
        updateStore(prev => ({
          ...prev,
          students: [...prev.students, ...newStudents],
          logs: [{ id: Date.now().toString(), userId: currentUser.id, action: `Imported ${newStudents.length} Students via CSV`, timestamp: new Date().toISOString() }, ...prev.logs],
          notifications: [`${newStudents.length} students imported successfully!`, ...prev.notifications]
        }));
        alert(`${newStudents.length} students imported successfully!`);
      } else {
        alert("No valid student records found in CSV. Format: Name, Roll Number, Class");
      }
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  const handleDelete = (id: string, type: 'TEACHER' | 'STUDENT') => {
    if (confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
      updateStore(prev => ({
        ...prev,
        users: type === 'TEACHER' ? prev.users.filter(u => u.id !== id) : prev.users,
        students: type === 'STUDENT' ? prev.students.filter(s => s.id !== id) : prev.students,
      }));
    }
  };

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRollNo('');
    setIsAdding(false);
    setIsImporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
          {currentUser.role === Role.ADMIN && (
            <button 
              onClick={() => { setTab('TEACHERS'); resetForm(); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'TEACHERS' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500'}`}
            >
              Teachers
            </button>
          )}
          <button 
            onClick={() => { setTab('STUDENTS'); resetForm(); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === 'STUDENTS' ? 'bg-white dark:bg-gray-700 text-emerald-600 shadow-sm' : 'text-gray-500'}`}
          >
            Students
          </button>
        </div>
        
        <div className="flex gap-2">
          {tab === 'STUDENTS' && (
            <button 
              onClick={() => { setIsImporting(!isImporting); setIsAdding(false); }}
              className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl transition-all font-bold border-2 ${isImporting ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-500'}`}
            >
              <Icons.Download className="w-4 h-4" />
              Import CSV
            </button>
          )}
          <button 
            onClick={() => { setIsAdding(!isAdding); setIsImporting(false); }}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl transition-all font-bold text-white ${isAdding ? 'bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            <Icons.Plus className="w-5 h-5" />
            Add {tab === 'TEACHERS' ? 'Teacher' : 'Student'}
          </button>
        </div>
      </div>

      {isImporting && tab === 'STUDENTS' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border-2 border-dashed border-blue-500 animate-in fade-in zoom-in duration-300 text-center">
          <Icons.Download className="w-12 h-12 mx-auto mb-4 text-blue-500 opacity-50" />
          <h3 className="font-bold text-lg mb-2">Import Students via CSV</h3>
          <p className="text-sm text-gray-500 mb-6">File format should be: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">Name, Roll Number, Class</code></p>
          
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef}
            onChange={handleImportCSV}
            className="hidden" 
          />
          
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
            >
              Select CSV File
            </button>
            <button 
              onClick={() => setIsImporting(false)}
              className="px-8 py-3 text-gray-500 font-bold hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border-2 border-emerald-500 animate-in slide-in-from-top-4 duration-300">
          <h3 className="font-bold text-lg mb-6">Create New {tab === 'TEACHERS' ? 'Teacher' : 'Student'}</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="John Doe" />
            </div>
            
            {tab === 'TEACHERS' ? (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Username</label>
                  <input value={username} onChange={e => setUsername(e.target.value)} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="jdoe_teach" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Roll Number</label>
                <input value={rollNo} onChange={e => setRollNo(e.target.value)} required className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="101" />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Class</label>
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500">
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={resetForm} className="px-6 py-2 text-gray-500 font-bold hover:text-gray-700">Cancel</button>
              <button type="submit" className="px-8 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Create</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 text-xs font-black uppercase tracking-widest border-b dark:border-gray-700">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">{tab === 'TEACHERS' ? 'Username' : 'Roll No'}</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {tab === 'TEACHERS' ? (
                store.users.filter(u => u.role === Role.TEACHER).map(teacher => (
                  <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{teacher.name}</td>
                    <td className="px-6 py-4 text-gray-500">{teacher.username}</td>
                    <td className="px-6 py-4">
                       <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded text-xs font-bold">
                         {teacher.assignedClasses?.[0] || 'Unassigned'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button className="p-2 text-gray-400 hover:text-emerald-500"><Icons.Edit className="w-4 h-4" /></button>
                         <button onClick={() => handleDelete(teacher.id, 'TEACHER')} className="p-2 text-gray-400 hover:text-red-500"><Icons.Trash className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                store.students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/20 transition-colors">
                    <td className="px-6 py-4 font-medium">{student.name}</td>
                    <td className="px-6 py-4 text-gray-500">{student.rollNo}</td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">{student.className}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                         <button className="p-2 text-gray-400 hover:text-emerald-500"><Icons.Edit className="w-4 h-4" /></button>
                         <button onClick={() => handleDelete(student.id, 'STUDENT')} className="p-2 text-gray-400 hover:text-red-500"><Icons.Trash className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {(tab === 'TEACHERS' ? store.users.filter(u => u.role === Role.TEACHER) : store.students).length === 0 && (
             <div className="p-20 text-center text-gray-400">
                <Icons.Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No records found. Add some to get started.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Management;
