
import { AppState, User, Student, AttendanceRecord, ActivityLog } from '../types';
import { INITIAL_USERS, INITIAL_STUDENTS } from '../constants';

const STORAGE_KEY = 'madam_ji_data';

export const getStore = (): AppState => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const initialState: AppState = {
      users: INITIAL_USERS,
      students: INITIAL_STUDENTS,
      attendance: [],
      logs: [{ id: '1', userId: 'admin-1', action: 'System Initialized', timestamp: new Date().toISOString() }],
      notifications: ['Welcome to Madam Ji Attendance App!']
    };
    saveStore(initialState);
    return initialState;
  }
  return JSON.parse(data);
};

export const saveStore = (state: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const logActivity = (userId: string, action: string) => {
  const store = getStore();
  const newLog: ActivityLog = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    action,
    timestamp: new Date().toISOString()
  };
  store.logs.unshift(newLog);
  saveStore(store);
};
